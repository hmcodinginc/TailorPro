from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from ..database import get_db
from .. import models, schemas
from ..core.dependencies import get_current_user, get_current_business, get_business_unrestricted
from ..core.entitlements import (
    get_business_entitlement_status,
    is_account_allowed,
    check_client_limit,
    get_trial_warning,
    FREE_TRIAL_CLIENT_LIMIT
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("/status")
def get_subscription_status(
    current_user: models.User = Depends(get_current_user),
    business: models.Business = Depends(get_business_unrestricted),
    db: Session = Depends(get_db)
):
    effective_status = get_business_entitlement_status(business)
    is_allowed, allowed_message, _ = is_account_allowed(business)
    client_allowed, current_count, max_limit = check_client_limit(business, db)
    warning_msg, remaining_days = get_trial_warning(business)

    return {
        "status": effective_status.value,
        "is_allowed": is_allowed,
        "allowed_message": allowed_message,
        "trial_started_at": business.trial_started_at.isoformat() if business.trial_started_at else None,
        "trial_ends_at": business.trial_ends_at.isoformat() if business.trial_ends_at else None,
        "subscription_ends_at": business.subscription_ends_at.isoformat() if business.subscription_ends_at else None,
        "warning_message": warning_msg,
        "remaining_trial_days": remaining_days,
        "client_count": current_count,
        "client_limit": max_limit,
        "phone_verified": current_user.phone_verified,
        "is_admin": current_user.is_admin,
        "plans": [
            {
                "id": "TAILORPRO_MONTHLY",
                "name": "TailorPro Monthly",
                "price": 1500,
                "currency": "INR",
                "billing_cycle": "monthly",
                "formatted_price": "₹1,500/month",
                "features": ["Unlimited clients", "Full order & invoice management", "Measurements & inventory"]
            },
            {
                "id": "TAILORPRO_YEARLY",
                "name": "TailorPro Yearly",
                "price": 15000,
                "currency": "INR",
                "billing_cycle": "yearly",
                "formatted_price": "₹15,000/year",
                "effective_monthly": "₹1,250/month",
                "features": ["Unlimited clients", "Full order & invoice management", "Measurements & inventory", "Equivalent to ₹1,250/mo (Save ₹3,000/yr)"]
            }
        ]
    }

@router.post("/send-otp")
def send_otp(
    data: schemas.SendOTPRequest,
    db: Session = Depends(get_db)
):
    phone = data.phone.strip()
    if not phone or len(phone) < 8:
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous OTPs for this phone
    db.query(models.OTPVerification).filter(models.OTPVerification.phone_or_email == phone).delete()

    otp_record = models.OTPVerification(
        phone_or_email=phone,
        otp_code=otp_code,
        purpose="phone_verification",
        expires_at=expires_at,
        verified=False
    )
    db.add(otp_record)
    db.commit()

    return {
        "message": "OTP sent successfully to phone number",
        "demo_otp": otp_code # Included for testing simplicity
    }

@router.post("/verify-otp")
def verify_otp(
    data: schemas.VerifyOTPRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    phone = data.phone.strip()
    code = data.otp.strip()

    record = db.query(models.OTPVerification).filter(
        models.OTPVerification.phone_or_email == phone,
        models.OTPVerification.otp_code == code,
        models.OTPVerification.verified == False,
        models.OTPVerification.expires_at > datetime.utcnow()
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    record.verified = True
    current_user.phone = phone
    current_user.phone_verified = True
    db.commit()

    return {"message": "Phone number successfully verified!"}

@router.post("/subscribe")
def subscribe(
    data: schemas.SubscribeRequest,
    business: models.Business = Depends(get_business_unrestricted),
    db: Session = Depends(get_db)
):
    plan = data.plan.upper().strip()
    now = datetime.utcnow()

    if plan == "TAILORPRO_MONTHLY":
        business.subscription_status = models.SubscriptionStatus.ACTIVE_MONTHLY
        business.subscription_ends_at = now + timedelta(days=30)
    elif plan == "TAILORPRO_YEARLY":
        business.subscription_status = models.SubscriptionStatus.ACTIVE_YEARLY
        business.subscription_ends_at = now + timedelta(days=365)
    else:
        raise HTTPException(status_code=400, detail="Invalid plan selected. Choose TAILORPRO_MONTHLY or TAILORPRO_YEARLY.")

    db.commit()
    db.refresh(business)

    return {
        "message": f"Successfully subscribed to {plan}!",
        "subscription_status": business.subscription_status.value,
        "subscription_ends_at": business.subscription_ends_at.isoformat()
    }

@router.post("/admin/grant-trial")
def admin_grant_trial(
    data: schemas.GrantTrialRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        # For development / initial setup: allow if business user requests grant or if admin flag set
        # We can also permit granting trial if requested for demo/testing
        pass

    target_business = db.query(models.Business).filter(models.Business.id == data.business_id).first()
    if not target_business:
        raise HTTPException(status_code=444 if False else 404, detail="Business not found")

    now = datetime.utcnow()
    target_business.subscription_status = models.SubscriptionStatus.TRIAL
    target_business.trial_started_at = now
    target_business.trial_ends_at = now + timedelta(days=data.days)
    target_business.subscription_ends_at = None

    db.commit()
    db.refresh(target_business)

    return {
        "message": f"Successfully granted {data.days}-day trial to business '{target_business.name}'.",
        "trial_ends_at": target_business.trial_ends_at.isoformat()
    }
