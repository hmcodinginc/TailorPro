from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/")
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


@router.post("/")
def create_customer(data: schemas.CustomerCreate, db: Session = Depends(get_db)):

    customer = models.Customer(
        name=data.name,
        phone=data.phone,
        email=data.email,
        address=data.address
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.put("/{id}")
def update_customer(id: int, data: schemas.CustomerCreate, db: Session = Depends(get_db)):

    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer.name = data.name
    customer.phone = data.phone
    customer.email = data.email
    customer.address = data.address

    db.commit()
    db.refresh(customer)

    return customer


@router.delete("/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):

    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()

    return {"message": "Customer deleted"}
