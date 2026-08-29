from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from datetime import date
from ..core.dependencies import get_current_business

router = APIRouter(prefix="/orders", tags=["Orders"])

def resequence_orders(db: Session, business_id: int):
    customers = db.query(models.Customer).filter(models.Customer.business_id == business_id).all()
    needs_commit = False
    for cust in customers:
        prefix = (cust.name or "CUSTOMER").strip().upper().replace(" ", "")
        cust_orders = db.query(models.Order).filter(
            models.Order.customer_id == cust.id,
            models.Order.business_id == business_id
        ).order_by(models.Order.id.asc()).all()
        
        for idx, order in enumerate(cust_orders, start=1):
            expected_code = f"{prefix}-{idx:03d}"
            if order.order_code != expected_code:
                order.order_code = expected_code
                needs_commit = True

    if needs_commit:
        db.commit()

    return db.query(models.Order).filter(models.Order.business_id == business_id).order_by(models.Order.id.asc()).all()

@router.get("/")
def get_orders(db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    return resequence_orders(db, current_business.id)

@router.post("/")
def create_order(
    data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    customer = db.query(models.Customer).filter(
        models.Customer.id == data.customer_id,
        models.Customer.business_id == current_business.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    prefix = (customer.name or "CUSTOMER").strip().upper().replace(" ", "")
    cust_orders_count = db.query(models.Order).filter(
        models.Order.customer_id == data.customer_id,
        models.Order.business_id == current_business.id
    ).count() + 1

    order_code = f"{prefix}-{cust_orders_count:03d}"
    while db.query(models.Order).filter(
        models.Order.business_id == current_business.id,
        models.Order.order_code == order_code
    ).first():
        cust_orders_count += 1
        order_code = f"{prefix}-{cust_orders_count:03d}"

    order = models.Order(
        business_id = current_business.id,
        customer_id = data.customer_id,
        order_code = order_code,
        description = data.description,
        amount = data.amount,
        status = data.status,
        order_date = data.order_date,
        due_date = data.due_date
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order

@router.put("/{id}")
def update_order(id: int, data: schemas.OrderCreate, db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    order = db.query(models.Order).filter(models.Order.id == id, models.Order.business_id == current_business.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.customer_id = data.customer_id
    order.description = data.description
    order.due_date = data.due_date
    order.amount = data.amount
    order.status = data.status

    db.commit()
    db.refresh(order)

    return order

@router.delete("/{id}")
def delete_order(id: int, db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    order = db.query(models.Order).filter(models.Order.id == id, models.Order.business_id == current_business.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()

    resequence_orders(db, current_business.id)

    return {"message": "Order deleted"}

@router.get("/reminders")
def get_reminders(db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    today = date.today()
    orders = db.query(models.Order).filter(
        models.Order.due_date == today,
        models.Order.business_id == current_business.id
    ).all()
    return orders
