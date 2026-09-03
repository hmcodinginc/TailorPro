from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
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
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

class SubscribeRequest(BaseModel):
    plan: str

class CreateSubscriptionRequest(BaseModel):
    plan: str

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str
    plan: str

class GrantTrialRequest(BaseModel):
    business_id: int
    days: int

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
    email: str
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
    name: Optional[str] = None
    phone: Optional[str] = None
    business_id: Optional[int] = None
    is_superadmin: bool = False

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


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

class PaymentCreate(BaseModel):
    amount:       float
    payment_type: Optional[str] = "cash"
    reference:    Optional[str] = None
    notes:        Optional[str] = None
    payment_date: Optional[datetime] = None

class PaymentResponse(BaseModel):
    id:           int
    invoice_id:   int
    customer_id:  int
    order_id:     Optional[int] = None
    amount:       float
    payment_type: str
    reference:    Optional[str] = None
    notes:        Optional[str] = None
    payment_date: datetime
    created_at:   datetime

    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    id:               int
    invoice_number:   Optional[str] = None
    customer_id:      int
    order_id:         int
    amount:           float
    status:           InvoiceStatus
    payment_type:     PaymentType
    notes:            Optional[str]
    business_id:      Optional[int] = None
    created_at:       Optional[datetime] = None
    paid_amount:      float = 0.0
    remaining_amount: float = 0.0
    payments:         List[PaymentResponse] = []


    class Config:
        from_attributes = True


# BUSINESS SCHEMA
class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_number: Optional[str] = None
    logo_url: Optional[str] = None

class BusinessResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_number: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True

# ADMIN & INQUIRY SCHEMAS
from datetime import datetime

class AdminBusinessResponse(BaseModel):
    id: int
    name: str
    subscription_status: str
    trial_started_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class TrialExtendRequest(BaseModel):
    days: int

from pydantic import Field

class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150, pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    phone: Optional[str] = Field(None, max_length=20)
    business_name: Optional[str] = Field(None, max_length=150)
    subject: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=2, max_length=2000)

class InquiryUpdate(BaseModel):
    status: str

class InquiryResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    business_name: Optional[str] = None
    subject: str
    message: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# INVENTORY SCHEMAS
class InventoryItemCreate(BaseModel):
    name: str
    category: str = "Fabric"
    quantity: float
    unit: str = "meters"
    min_stock: float = 0.0
    price: float = 0.0
    supplier: Optional[str] = None

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    min_stock: Optional[float] = None
    price: Optional[float] = None
    supplier: Optional[str] = None

class InventoryItemResponse(BaseModel):
    id: int
    business_id: int
    name: str
    category: str
    quantity: float
    unit: str
    min_stock: float
    price: float
    supplier: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

