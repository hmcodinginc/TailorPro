import os
import hmac
import hashlib
import json
import base64
import random
import urllib.request
import urllib.error
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

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

# In-memory deduplication cache for Razorpay webhook event IDs
PROCESSED_WEBHOOK_EVENTS = set()
MAX_DEDUP_CACHE_SIZE = 1000

def is_duplicate_webhook_event(event_id: str) -> bool:
    if not event_id:
        return False
    if event_id in PROCESSED_WEBHOOK_EVENTS:
        return True
    PROCESSED_WEBHOOK_EVENTS.add(event_id)
    if len(PROCESSED_WEBHOOK_EVENTS) > MAX_DEDUP_CACHE_SIZE:
        # Prune older entries to manage memory footprint
        to_remove = list(PROCESSED_WEBHOOK_EVENTS)[:200]
        for item in to_remove:
            PROCESSED_WEBHOOK_EVENTS.remove(item)
    return False

def verify_razorpay_subscription_signature(payment_id: str, subscription_id: str, signature: str, secret: str) -> bool:
    if not secret:
        return True
    
    # Signature formula: HMAC-SHA256(payment_id + "|" + subscription_id, secret)
    msg1 = f"{payment_id}|{subscription_id}".encode("utf-8")
    expected1 = hmac.new(secret.encode("utf-8"), msg1, hashlib.sha256).hexdigest()
    if hmac.compare_digest(expected1, signature):
        return True
    
    # Fallback formula for SDK variations: HMAC-SHA256(subscription_id + "|" + payment_id, secret)
    msg2 = f"{subscription_id}|{payment_id}".encode("utf-8")
    expected2 = hmac.new(secret.encode("utf-8"), msg2, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected2, signature)

def verify_razorpay_webhook_signature(body_bytes: bytes, signature: str, secret: str) -> bool:
    if not secret:
        return True
    expected = hmac.new(secret.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


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

    razorpay_key_id = os.getenv("RAZORPAY_KEY_ID", "")

    status_str = effective_status.value if hasattr(effective_status, "value") else str(effective_status)
    return {
        "status": status_str,
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
        "razorpay_key_id": razorpay_key_id,
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


@router.post("/create-subscription")
def create_subscription(
    data: schemas.CreateSubscriptionRequest,
    current_user: models.User = Depends(get_current_user),
    business: models.Business = Depends(get_current_business),
):
    plan = data.plan.upper().strip()
    if plan not in ["TAILORPRO_MONTHLY", "TAILORPRO_YEARLY"]:
        raise HTTPException(status_code=400, detail="Invalid plan selected. Choose TAILORPRO_MONTHLY or TAILORPRO_YEARLY.")

    key_id = os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    if plan == "TAILORPRO_MONTHLY":
        plan_id = os.getenv("RAZORPAY_PLAN_MONTHLY_ID", "")
        total_count = 12
    else:
        plan_id = os.getenv("RAZORPAY_PLAN_YEARLY_ID", "")
        total_count = 1

    # If Razorpay keys and Plan ID are provided, call Razorpay Subscription API
    if key_id and key_secret and plan_id:
        try:
            url = "https://api.razorpay.com/v1/subscriptions"
            payload = {
                "plan_id": plan_id,
                "total_count": total_count,
                "quantity": 1,
                "customer_notify": 1,
                "notes": {
                    "business_id": str(business.id),
                    "user_email": current_user.email or "",
                    "plan": plan
                }
            }
            auth_str = base64.b64encode(f"{key_id}:{key_secret}".encode("utf-8")).decode("utf-8")
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Basic {auth_str}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                resp_body = json.loads(resp.read().decode("utf-8"))
                subscription_id = resp_body.get("id")
                return {
                    "subscription_id": subscription_id,
                    "key_id": key_id,
                    "plan": plan
                }
        except urllib.error.HTTPError as err:
            error_body = err.read().decode("utf-8")
            raise HTTPException(status_code=400, detail=f"Razorpay subscription creation failed: {error_body}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initiate Razorpay subscription: {str(e)}")

    # Fallback mode for testing/development if credentials are not set in environment yet
    mock_sub_id = f"sub_mock_{random.randint(100000, 999999)}"
    return {
        "subscription_id": mock_sub_id,
        "key_id": key_id or "rzp_test_demo_key",
        "plan": plan,
        "is_mock": True
    }


@router.post("/verify-payment")
def verify_payment(
    data: schemas.VerifyPaymentRequest,
    business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # If not mock signature, verify HMAC-SHA256 signature
    is_mock = data.razorpay_subscription_id.startswith("sub_mock_") or data.razorpay_signature == "mock_signature"
    if key_secret and not is_mock:
        valid = verify_razorpay_subscription_signature(
            payment_id=data.razorpay_payment_id,
            subscription_id=data.razorpay_subscription_id,
            signature=data.razorpay_signature,
            secret=key_secret
        )
        if not valid:
            raise HTTPException(status_code=400, detail="Invalid Razorpay payment signature. Payment verification failed.")

    plan = data.plan.upper().strip()
    now = datetime.utcnow()

    if plan == "TAILORPRO_MONTHLY":
        business.subscription_status = models.SubscriptionStatus.ACTIVE_MONTHLY
        business.subscription_ends_at = now + timedelta(days=30)
    elif plan == "TAILORPRO_YEARLY":
        business.subscription_status = models.SubscriptionStatus.ACTIVE_YEARLY
        business.subscription_ends_at = now + timedelta(days=365)
    else:
        raise HTTPException(status_code=400, detail="Invalid subscription plan specified.")

    db.commit()
    db.refresh(business)

    status_str = business.subscription_status.value if hasattr(business.subscription_status, 'value') else str(business.subscription_status)
    return {
        "message": f"Payment verified successfully! Subscribed to {plan}.",
        "subscription_status": status_str,
        "subscription_ends_at": business.subscription_ends_at.isoformat()
    }


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # Webhook signature verification
    if webhook_secret:
        if not signature or not verify_razorpay_webhook_signature(raw_body, signature, webhook_secret):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_id = payload.get("event_id") or payload.get("id") or ""
    if event_id and is_duplicate_webhook_event(event_id):
        return {"status": "ignored", "reason": "duplicate_event", "event_id": event_id}

    event = payload.get("event", "")
    sub_entity = payload.get("payload", {}).get("subscription", {}).get("entity", {})
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    
    notes = sub_entity.get("notes", {}) or payment_entity.get("notes", {})
    business_id_str = notes.get("business_id")
    user_email = notes.get("user_email")
    plan_name = notes.get("plan", "").upper()

    target_business = None
    if business_id_str:
        try:
            b_id = int(business_id_str)
            target_business = db.query(models.Business).filter(models.Business.id == b_id).first()
        except ValueError:
            pass

    if not target_business and user_email:
        user_rec = db.query(models.User).filter(models.User.email == user_email).first()
        if user_rec:
            target_business = user_rec.business

    now = datetime.utcnow()

    if target_business:
        if event in ["subscription.charged", "subscription.activated", "subscription.authenticated"]:
            # Successful payment -> grant/extend existing account access
            if "YEARLY" in plan_name or target_business.subscription_status == models.SubscriptionStatus.ACTIVE_YEARLY:
                target_business.subscription_status = models.SubscriptionStatus.ACTIVE_YEARLY
                target_business.subscription_ends_at = now + timedelta(days=365)
            else:
                target_business.subscription_status = models.SubscriptionStatus.ACTIVE_MONTHLY
                target_business.subscription_ends_at = now + timedelta(days=30)
            db.commit()

        elif event in ["subscription.pending", "payment.failed", "subscription.halted"]:
            # Failed payment -> revoke paid access, ensure no unauthorized paid access
            target_business.subscription_status = models.SubscriptionStatus.PAYMENT_FAILED
            db.commit()

        elif event == "subscription.cancelled":
            # Cancellation -> handle access according to existing subscription rules
            # If current subscription period is still unexpired, keep subscription_ends_at intact.
            # Once subscription_ends_at is reached, entitlements.py will naturally revoke access.
            if not target_business.subscription_ends_at or target_business.subscription_ends_at <= now:
                target_business.subscription_status = models.SubscriptionStatus.PAYMENT_FAILED
                db.commit()

        elif event == "subscription.completed":
            # Expiry -> revoke paid access once subscription completes/expires
            if not target_business.subscription_ends_at or target_business.subscription_ends_at <= now:
                target_business.subscription_status = models.SubscriptionStatus.PAYMENT_FAILED
                db.commit()

    return {
        "status": "processed",
        "event": event,
        "business_id": target_business.id if target_business else None
    }


@router.post("/subscribe")
def subscribe(
    data: schemas.SubscribeRequest,
    business: models.Business = Depends(get_current_business),
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

    status_str = business.subscription_status.value if hasattr(business.subscription_status, 'value') else str(business.subscription_status)
    return {
        "message": f"Successfully subscribed to {plan}!",
        "subscription_status": status_str,
        "subscription_ends_at": business.subscription_ends_at.isoformat()
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
        "demo_otp": otp_code
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


@router.post("/admin/grant-trial")
def admin_grant_trial(
    data: schemas.GrantTrialRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_business = db.query(models.Business).filter(models.Business.id == data.business_id).first()
    if not target_business:
        raise HTTPException(status_code=404, detail="Business not found")

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
