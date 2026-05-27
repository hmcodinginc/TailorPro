from pydantic import BaseModel
from typing import Optional
from datetime import date
from .models import InvoiceStatus, PaymentType



# CUSTOMER SCHEMA


class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None


class Customer(CustomerCreate):
    id: int

    class Config:
        from_attributes = True


# MEASUREMENTS SCHEMA
class MeasurementCreate(BaseModel):

    customer_id:int
    garment_type:str

    chest:float
    waist:float
    hips:float
    shoulder:float
    sleeve:float
    inseam:float
    neck:float

    notes:str|None=None


class Measurement(MeasurementCreate):
    id: int

    class Config:
        from_attributes = True


# ORDERS SCHEMA

class OrderCreate(BaseModel):

    customer_id:int
    description:str
    amount:float
    status:str = "Pending"
    order_date: date
    due_date: date

class Order(OrderCreate):
    id: int

    class Config:
        from_attributes = True


class UserCreate(BaseModel):

    email:str
    password:str


class UserLogin(BaseModel):

    email:str
    password:str

class InvoiceCreate(BaseModel):
    customer_id:  int
    order_id:     int
    amount:       float
    status:       Optional[InvoiceStatus] = InvoiceStatus.pending
    payment_type: Optional[PaymentType]   = PaymentType.cash
    notes:        Optional[str]           = None


class InvoiceUpdate(BaseModel):
    amount:       Optional[float]         = None
    status:       Optional[InvoiceStatus] = None
    payment_type: Optional[PaymentType]   = None
    notes:        Optional[str]           = None


class InvoiceResponse(BaseModel):
    id:           int
    customer_id:  int
    order_id:     int
    amount:       float
    status:       InvoiceStatus
    payment_type: PaymentType
    notes:        Optional[str]
    # created_at:   datetime

    class Config:
        from_attributes = True
