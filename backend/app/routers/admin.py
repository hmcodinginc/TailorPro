from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from .. import models
from ..models import User, Business, Inquiry, InquiryStatus, SubscriptionStatus
from ..schemas import AdminBusinessResponse, TrialExtendRequest, InquiryCreate, InquiryUpdate, InquiryResponse
from ..core.dependencies import require_super_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(require_super_admin)):
    users = db.query(models.User).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "phone": u.phone,
            "is_superadmin": u.is_superadmin,
            "business_id": u.business_id,
        })
    return result

@router.get("/businesses", response_model=List[AdminBusinessResponse])
def get_all_businesses(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    businesses = db.query(Business).all()
    return businesses

@router.get("/businesses/{business_id}", response_model=AdminBusinessResponse)
def get_business(business_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@router.post("/businesses/{business_id}/extend-trial")
def extend_trial(business_id: int, req: TrialExtendRequest, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    now = datetime.utcnow()
    # If trial_ends_at exists and is in the future, extend from it. Otherwise, extend from now.
    if business.trial_ends_at and business.trial_ends_at > now:
        base_date = business.trial_ends_at
    else:
        base_date = now
        
    business.trial_ends_at = base_date + timedelta(days=req.days)
    if business.subscription_status in [SubscriptionStatus.TRIAL_EXPIRED, SubscriptionStatus.SUSPENDED]:
        business.subscription_status = SubscriptionStatus.TRIAL

    db.commit()
    db.refresh(business)
    return {"message": f"Trial extended by {req.days} days", "new_expiry": business.trial_ends_at}

@router.post("/businesses/{business_id}/suspend")
def suspend_business(business_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business.subscription_status = SubscriptionStatus.SUSPENDED
    db.commit()
    return {"message": "Business suspended successfully"}

@router.post("/businesses/{business_id}/reactivate")
def reactivate_business(business_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # We must determine what it should be reactivated to
    now = datetime.utcnow()
    if business.subscription_ends_at and business.subscription_ends_at > now:
        business.subscription_status = SubscriptionStatus.ACTIVE_MONTHLY # Assuming monthly, but could be yearly
    elif business.trial_ends_at and business.trial_ends_at > now:
        business.subscription_status = SubscriptionStatus.TRIAL
    else:
        business.subscription_status = SubscriptionStatus.TRIAL_EXPIRED
        
    db.commit()
    db.refresh(business)
    return {"message": "Business reactivated", "status": business.subscription_status}

# Inquiry system
@router.post("/inquiries/public", response_model=InquiryResponse)
def submit_inquiry(req: InquiryCreate, db: Session = Depends(get_db)):
    inquiry = Inquiry(
        name=req.name,
        email=req.email,
        phone=req.phone,
        business_name=req.business_name,
        subject=req.subject,
        message=req.message,
        status=InquiryStatus.NEW
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry

@router.get("/inquiries", response_model=List[InquiryResponse])
def get_inquiries(db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    return db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()

@router.patch("/inquiries/{inquiry_id}", response_model=InquiryResponse)
def update_inquiry(inquiry_id: int, req: InquiryUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_super_admin)):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    try:
        new_status = InquiryStatus(req.status)
        inquiry.status = new_status
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    db.commit()
    db.refresh(inquiry)
    return inquiry
