from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("/")
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()


@router.post("/")
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):

    new_invoice = models.Invoice(**invoice.dict())

    db.add(new_invoice)

    db.commit()

    db.refresh(new_invoice)

    return new_invoice

@router.put("/{id}")
def update_invoice(id: int, data: schemas.InvoiceCreate, db: Session = Depends(get_db)):

    invoice = db.query(models.Invoice).filter(models.Invoice.id == id).first()

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
def delete_invoice(id: int, db: Session = Depends(get_db)):

    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    db.delete(invoice)
    db.commit()

    return {"message": "Invoice deleted successfully"}