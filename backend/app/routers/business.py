from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..core.dependencies import get_current_business

router = APIRouter(prefix="/business", tags=["business"])

@router.get("/profile", response_model=schemas.BusinessResponse)
def get_business_profile(current_business: models.Business = Depends(get_current_business)):
    return current_business

@router.put("/profile", response_model=schemas.BusinessResponse)
def update_business_profile(
    data: schemas.BusinessUpdate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    if data.name is not None:
        current_business.name = data.name
    if data.address is not None:
        current_business.address = data.address
    if data.phone is not None:
        current_business.phone = data.phone
    if data.email is not None:
        current_business.email = data.email
    if data.gst_number is not None:
        current_business.gst_number = data.gst_number
    if data.logo_url is not None:
        current_business.logo_url = data.logo_url
        
    db.commit()
    db.refresh(current_business)
    return current_business
