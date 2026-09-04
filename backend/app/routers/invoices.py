from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..core.dependencies import get_current_business

router = APIRouter(prefix="/invoices", tags=["invoices"])

def serialize_invoice(invoice: models.Invoice) -> dict:
    payments_list = []
    total_paid = 0.0
    for p in sorted(invoice.payments, key=lambda x: x.payment_date or x.created_at):
        total_paid += p.amount
        payments_list.append({
            "id": p.id,
            "invoice_id": p.invoice_id,
            "customer_id": p.customer_id,
            "order_id": p.order_id,
            "amount": p.amount,
            "payment_type": p.payment_type,
            "reference": p.reference,
            "notes": p.notes,
            "payment_date": p.payment_date,
            "created_at": p.created_at,
        })
    
    remaining = max(0.0, invoice.amount - total_paid)
    inv_number = invoice.invoice_number or f"INV-{invoice.id:04d}"
    
    return {
        "id": invoice.id,
        "invoice_number": inv_number,
        "customer_id": invoice.customer_id,
        "order_id": invoice.order_id,
        "amount": invoice.amount,
        "status": invoice.status,
        "payment_type": invoice.payment_type,
        "notes": invoice.notes,
        "business_id": invoice.business_id,
        "created_at": invoice.created_at,
        "paid_amount": round(total_paid, 2),
        "remaining_amount": round(remaining, 2),
        "payments": payments_list,
    }


@router.get("/", response_model=List[schemas.InvoiceResponse])
def get_invoices(
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    invoices = db.query(models.Invoice).filter(
        models.Invoice.business_id == current_business.id
    ).order_by(models.Invoice.id.desc()).all()
    return [serialize_invoice(inv) for inv in invoices]


@router.get("/{id}", response_model=schemas.InvoiceResponse)
def get_invoice(
    id: int,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == id,
        models.Invoice.business_id == current_business.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return serialize_invoice(invoice)


@router.post("/", response_model=schemas.InvoiceResponse)
def create_invoice(
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    # Enforce customer and order ownership
    customer = db.query(models.Customer).filter(
        models.Customer.id == invoice.customer_id,
        models.Customer.business_id == current_business.id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found for this business")

    order = db.query(models.Order).filter(
        models.Order.id == invoice.order_id,
        models.Order.business_id == current_business.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found for this business")

    # Generate next business-scoped invoice sequence number: INV-0001, INV-0002, etc.
    existing_invoices = db.query(models.Invoice).filter(
        models.Invoice.business_id == current_business.id
    ).all()
    
    max_seq = 0
    for inv in existing_invoices:
        if inv.invoice_number and inv.invoice_number.startswith("INV-"):
            try:
                num_part = int(inv.invoice_number.split("-")[-1])
                if num_part > max_seq:
                    max_seq = num_part
            except (ValueError, IndexError):
                pass
    
    seq_candidate = max(max_seq + 1, len(existing_invoices) + 1)
    assigned_number = f"INV-{seq_candidate:04d}"
    
    # Ensure no collision in this business
    while db.query(models.Invoice).filter(
        models.Invoice.business_id == current_business.id,
        models.Invoice.invoice_number == assigned_number
    ).first():
        seq_candidate += 1
        assigned_number = f"INV-{seq_candidate:04d}"

    now = datetime.utcnow()
    new_invoice = models.Invoice(
        business_id=current_business.id,
        invoice_number=assigned_number,
        customer_id=invoice.customer_id,
        order_id=invoice.order_id,
        amount=invoice.amount,
        status=invoice.status or models.InvoiceStatus.pending,
        payment_type=invoice.payment_type or models.PaymentType.cash,
        notes=invoice.notes,
        created_at=now,
        updated_at=now,
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return serialize_invoice(new_invoice)



@router.put("/{id}", response_model=schemas.InvoiceResponse)
def update_invoice(
    id: int,
    data: schemas.InvoiceUpdate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == id,
        models.Invoice.business_id == current_business.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if data.amount is not None:
        invoice.amount = data.amount
    if data.status is not None:
        invoice.status = data.status
    if data.payment_type is not None:
        invoice.payment_type = data.payment_type
    if data.notes is not None:
        invoice.notes = data.notes
    invoice.updated_at = datetime.utcnow()

    # Recalculate status based on payments if amount changed
    total_paid = sum(p.amount for p in invoice.payments)
    if total_paid >= invoice.amount and invoice.amount > 0:
        invoice.status = models.InvoiceStatus.paid
    elif total_paid > 0:
        invoice.status = models.InvoiceStatus.pending

    db.commit()
    db.refresh(invoice)
    return serialize_invoice(invoice)


@router.delete("/{id}")
def delete_invoice(
    id: int,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == id,
        models.Invoice.business_id == current_business.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}


# ── PAYMENT RECORDS ENDPOINTS ──────────────────────────────────────────────────

@router.post("/{invoice_id}/payments", response_model=schemas.InvoiceResponse)
def record_payment(
    invoice_id: int,
    data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.business_id == current_business.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0")

    payment_record = models.Payment(
        business_id=current_business.id,
        invoice_id=invoice.id,
        customer_id=invoice.customer_id,
        order_id=invoice.order_id,
        amount=round(data.amount, 2),
        payment_type=data.payment_type or "cash",
        reference=data.reference,
        notes=data.notes,
        payment_date=data.payment_date or datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(payment_record)
    db.flush()

    # Automatically update invoice status if fully paid
    total_paid = sum(p.amount for p in invoice.payments)
    if total_paid >= invoice.amount:
        invoice.status = models.InvoiceStatus.paid
    else:
        invoice.status = models.InvoiceStatus.pending
    invoice.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(invoice)
    return serialize_invoice(invoice)


@router.delete("/{invoice_id}/payments/{payment_id}", response_model=schemas.InvoiceResponse)
def delete_payment(
    invoice_id: int,
    payment_id: int,
    db: Session = Depends(get_db),
    current_business: models.Business = Depends(get_current_business)
):
    invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.business_id == current_business.id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = db.query(models.Payment).filter(
        models.Payment.id == payment_id,
        models.Payment.invoice_id == invoice.id,
        models.Payment.business_id == current_business.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    db.delete(payment)
    db.flush()

    total_paid = sum(p.amount for p in invoice.payments)
    if total_paid >= invoice.amount and invoice.amount > 0:
        invoice.status = models.InvoiceStatus.paid
    elif total_paid > 0:
        invoice.status = models.InvoiceStatus.pending
    else:
        invoice.status = models.InvoiceStatus.unpaid
    invoice.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(invoice)
    return serialize_invoice(invoice)