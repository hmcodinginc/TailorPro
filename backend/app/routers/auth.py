from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, create_reset_token, SECRET_KEY, ALGORITHM
from ..core.dependencies import get_current_user
from ..core.emails import send_verification_email, send_password_reset_email
from jose import jwt, JWTError
from datetime import datetime, timedelta
import logging
import time

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# Basic memory rate limiter for login
LOGIN_ATTEMPTS = {}

def check_rate_limit(ip: str):
    now = time.time()
    # Clean up old entries
    LOGIN_ATTEMPTS[ip] = [t for t in LOGIN_ATTEMPTS.get(ip, []) if now - t < 60]
    if len(LOGIN_ATTEMPTS[ip]) >= 5: # Max 5 attempts per minute
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")
    LOGIN_ATTEMPTS[ip].append(now)

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        if len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
            
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_business = models.Business(name=user.business_name)
        db.add(new_business)
        db.commit()
        db.refresh(new_business)
        
        new_user = models.User(
            email=user.email,
            password=get_password_hash(user.password),
            name=user.name,
            phone=user.phone,
            business_id=new_business.id,
            email_verified=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Send verification email
        try:
            verify_token = create_reset_token(new_user.email)
            send_verification_email(new_user.email, verify_token)
        except Exception as e:
            logger.warning(f"Verification email notice: {e}")
        
        return {"message": "Account created successfully."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error during registration")

@router.post("/login", response_model=schemas.Token)
def login(request: Request, user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(client_ip)
    
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.email_verified:
        # Auto-verify in development / local mode so user can sign in immediately
        user.email_verified = True
        db.commit()
        
    if user.password == user_credentials.password:
        user.password = get_password_hash(user_credentials.password)
        db.commit()

    access_token = create_access_token(data={"sub": user.email, "business_id": user.business_id})
    refresh_token = create_refresh_token(data={"sub": user.email, "business_id": user.business_id})
    
    db_refresh_token = models.RefreshToken(
        token=refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_refresh_token)
    db.commit()
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(request_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    try:
        payload = jwt.decode(request_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise credentials_exception
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Verify token exists and not revoked
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == request_data.refresh_token,
        models.RefreshToken.revoked == False,
        models.RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise credentials_exception

    # Issue new tokens (Rotation)
    db_token.revoked = True
    db.commit()

    new_access_token = create_access_token(data={"sub": user.email, "business_id": user.business_id})
    new_refresh_token = create_refresh_token(data={"sub": user.email, "business_id": user.business_id})

    new_db_token = models.RefreshToken(
        token=new_refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(new_db_token)
    db.commit()

    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.post("/logout")
def logout(request_data: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == request_data.refresh_token).first()
    if db_token:
        db_token.revoked = True
        db.commit()
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    request: schemas.ChangePasswordRequest, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(request.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )
        
    if request.current_password == request.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the current password."
        )

    # Update password hash
    current_user.password = get_password_hash(request.new_password)
    
    # Revoke all existing refresh tokens for security
    db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == current_user.id
    ).update({"revoked": True})
    
    db.commit()
    return {"message": "Password updated successfully."}

# FORGOT AND RESET PASSWORD
@router.post("/forgot-password")
def forgot_password(request: schemas.EmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user:
        reset_token = create_reset_token(user.email)
        send_password_reset_email(user.email, reset_token)
    
    # Always return a generic success message to prevent email enumeration
    return {"message": "If the email is registered, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type.")
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token payload.")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User no longer exists.")

    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    # Update password
    user.password = get_password_hash(request.new_password)
    
    # Revoke all existing refresh tokens for security
    db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user.id
    ).update({"revoked": True})
    
    db.commit()
    return {"message": "Password has been successfully reset."}

@router.post("/verify-email")
def verify_email(request: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset": # We reused reset token logic
            raise HTTPException(status_code=400, detail="Invalid token type.")
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token payload.")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User no longer exists.")

    user.email_verified = True
    db.commit()
    return {"message": "Email successfully verified!"}

@router.post("/send-otp")
def send_otp(request: schemas.EmailRequest): # Note: Reused schema for brevity, expecting phone usually
    raise HTTPException(status_code=501, detail="SMS provider not configured")

@router.post("/verify-otp")
def verify_otp(request: schemas.OTPRequest):
    raise HTTPException(status_code=501, detail="SMS provider not configured")
