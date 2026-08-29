import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class SubscriptionStatus(str, enum.Enum):
    TRIAL = "TRIAL"
    ACTIVE_MONTHLY = "ACTIVE_MONTHLY"
    ACTIVE_YEARLY = "ACTIVE_YEARLY"
    TRIAL_EXPIRED = "TRIAL_EXPIRED"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    SUSPENDED = "SUSPENDED"
    CUSTOM = "CUSTOM"

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime)
    
class Business(Base):
    __tablename__ = "businesses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    subscription_status = Column(String, default="TRIAL", server_default="TRIAL", nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    trial_started_at = Column(DateTime, nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)
    subscription_ends_at = Column(DateTime, nullable=True)
    
    users = relationship("User", back_populates="business")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_superadmin = Column(Boolean, default=False)
    
    business = relationship("Business", back_populates="users")

class TrialClaim(Base):
    __tablename__ = "trial_claims"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    phone = Column(String, index=True)
    trial_started_at = Column(DateTime, default=datetime.utcnow)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)

class OTPVerification(Base):
    __tablename__ = "otp_verifications"
    id = Column(Integer, primary_key=True, index=True)
    phone_or_email = Column(String, index=True)
    otp_code = Column(String)
    purpose = Column(String, default="phone_verification")
    expires_at = Column(DateTime)
    verified = Column(Boolean, default=False)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    name = Column(String)
    phone = Column(String)
    address = Column(String)
    email = Column(String)

class Measurement(Base):
    __tablename__ = "measurements"
    id            = Column(Integer, primary_key=True)
    business_id   = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    customer_id   = Column(Integer, ForeignKey("customers.id"))
    gender        = Column(String, nullable=True)
    garment_type  = Column(String)
    chest         = Column(Float, nullable=True)
    waist         = Column(Float, nullable=True)
    hips          = Column(Float, nullable=True)
    shoulder      = Column(Float, nullable=True)
    sleeve        = Column(Float, nullable=True)
    inseam        = Column(Float, nullable=True)
    neck          = Column(Float, nullable=True)
    bust          = Column(Float, nullable=True)
    hip           = Column(Float, nullable=True)
    armhole       = Column(Float, nullable=True)
    sleeve_length = Column(Float, nullable=True)
    sleeve_round  = Column(Float, nullable=True)
    length        = Column(Float, nullable=True)
    neck_depth    = Column(Float, nullable=True)
    neck_width    = Column(Float, nullable=True)
    collar        = Column(Float, nullable=True)
    thigh         = Column(Float, nullable=True)
    knee          = Column(Float, nullable=True)
    ankle         = Column(Float, nullable=True)
    bottom_width  = Column(Float, nullable=True)
    rise          = Column(Float, nullable=True)
    flare         = Column(Float, nullable=True)
    upper_chest   = Column(Float, nullable=True)
    under_bust    = Column(Float, nullable=True)
    calf          = Column(Float, nullable=True)
    image         = Column(String, nullable=True)
    notes         = Column(String, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    order_code = Column(String, unique=True)
    description = Column(String)
    amount = Column(Float)
    status = Column(String, default="Pending")
    order_date = Column(Date)
    due_date = Column(Date)

class InvoiceStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    unpaid = "unpaid"

class PaymentType(str, enum.Enum):
    cash = "cash"
    online = "online"

class Invoice(Base):
    __tablename__ = "invoices"
    id           = Column(Integer, primary_key=True, index=True)
    business_id  = Column(Integer, ForeignKey("businesses.id"), nullable=True)
    customer_id  = Column(Integer, ForeignKey("customers.id"), nullable=False)
    order_id     = Column(Integer, ForeignKey("orders.id"),    nullable=False)
    amount       = Column(Float,   nullable=False)
    status       = Column(SAEnum(InvoiceStatus), default=InvoiceStatus.pending, nullable=False)
    payment_type = Column(SAEnum(PaymentType),   default=PaymentType.cash,      nullable=False)
    notes        = Column(String(500), nullable=True)
    created_at   = Column(DateTime(timezone=True))
    updated_at   = Column(DateTime(timezone=True))

    customer = relationship("Customer")
    order    = relationship("Order")

class InquiryStatus(str, enum.Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    business_name = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(SAEnum(InquiryStatus), default=InquiryStatus.NEW, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)