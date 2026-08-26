from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..core.dependencies import get_current_business

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.get("/")
def get_invoices(db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    return db.query(models.Invoice).filter(models.Invoice.business_id == current_business.id).all()

@router.post("/")
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    new_invoice = models.Invoice(**invoice.dict())
    new_invoice.business_id = current_business.id
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice

@router.put("/{id}")
def update_invoice(id: int, data: schemas.InvoiceCreate, db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == id, models.Invoice.business_id == current_business.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.customer_id = data.customer_id
    invoice.order_id = data.order_id
    invoice.amount = data.amount
    invoice.status = data.status

    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{id}")
def delete_invoice(id: int, db: Session = Depends(get_db), current_business: models.Business = Depends(get_current_business)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == id, models.Invoice.business_id == current_business.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}