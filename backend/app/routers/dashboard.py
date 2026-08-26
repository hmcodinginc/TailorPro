from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Customer, Order, Measurement, Business
from ..core.dependencies import get_current_business

router = APIRouter(prefix="/dashboard")

@router.get("/stats")
def stats(db: Session = Depends(get_db), current_business: Business = Depends(get_current_business)):
    customers = db.query(Customer).filter(Customer.business_id == current_business.id).count()
    orders = db.query(Order).filter(Order.business_id == current_business.id).count()
    measurements = db.query(Measurement).filter(Measurement.business_id == current_business.id).count()

    return {
        "total_customers": customers,
        "total_orders": orders,
        "total_measurements": measurements
    }
