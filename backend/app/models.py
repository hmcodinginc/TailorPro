import enum
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

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
    
    business = relationship("Business", back_populates="users")

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
    garment_type  = Column(String)
    chest         = Column(Float)
    waist         = Column(Float)
    hips          = Column(Float)
    shoulder      = Column(Float)
    sleeve        = Column(Float)
    inseam        = Column(Float)
    neck          = Column(Float)
    bust          = Column(Float)
    hip           = Column(Float)
    armhole       = Column(Float)
    sleeve_length = Column(Float)
    sleeve_round  = Column(Float)
    length        = Column(Float)
    neck_depth    = Column(Float)
    neck_width    = Column(Float)
    collar        = Column(Float)
    thigh         = Column(Float)
    knee          = Column(Float)
    ankle         = Column(Float)
    bottom_width  = Column(Float)
    rise          = Column(Float)
    flare         = Column(Float)
    image         = Column(String)
    notes         = Column(String)
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