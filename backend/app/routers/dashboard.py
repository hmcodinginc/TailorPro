from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import database, models
from ..core.dependencies import require_active_entitlement

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def stats(db: Session = Depends(database.get_db), current_business: models.Business = Depends(require_active_entitlement)):
    customers = db.query(models.Customer).filter(models.Customer.business_id == current_business.id).count()
    orders = db.query(models.Order).filter(models.Order.business_id == current_business.id).count()
    measurements = db.query(models.Measurement).filter(models.Measurement.business_id == current_business.id).count()

    return {
        "total_customers": customers,
        "total_orders": orders,
        "total_measurements": measurements
    }
