from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from .models import InvoiceStatus, PaymentType

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    business_id: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class EmailRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class OTPRequest(BaseModel):
    phone: str
    otp: str

# CUSTOMER SCHEMA
class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class Customer(CustomerCreate):
    id: int
    business_id: Optional[int] = None

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
    business_id: Optional[int] = None

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
    business_id: Optional[int] = None

    class Config:
        from_attributes = True

# USER & AUTH SCHEMA
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    business_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    business_id: Optional[int]

    class Config:
        from_attributes = True

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
    business_id:  Optional[int] = None

    class Config:
        from_attributes = True
