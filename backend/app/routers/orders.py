from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from datetime import date

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/")
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()


@router.post("/")
def create_order(
    data: schemas.OrderCreate,
    db: Session = Depends(get_db)
):

    customer = db.query(models.Customer).filter(
        models.Customer.id == data.customer_id
    ).first()

    customer_name = customer.name.upper().replace(" ", "")

    order_count = db.query(models.Order).filter(
        models.Order.customer_id == data.customer_id
    ).count() + 1

    order_code = f"{customer_name}-{order_count:03}"

    order = models.Order(

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
def update_order(id: int, data: schemas.OrderCreate, db: Session = Depends(get_db)):

    order = db.query(models.Order).filter(models.Order.id == id).first()

    order.customer_id = data.customer_id
    order.description = data.description
    order.due_date = data.due_date
    order.amount = data.amount
    order.status= data.status

    db.commit()
    db.refresh(order)

    return order


@router.delete("/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):

    order = db.query(models.Order).filter(models.Order.id == id).first()

    db.delete(order)
    db.commit()

    return {"message": "Order deleted"}


from datetime import date

@router.get("/reminders")
def get_reminders(db: Session = Depends(get_db)):

    today = date.today()

    orders = db.query(models.Order).filter(
        models.Order.due_date == today
    ).all()

    return orders