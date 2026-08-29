from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Business
from ..schemas import TokenData
from .security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_business_unrestricted(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.business_id:
        raise HTTPException(status_code=403, detail="User does not belong to a business")
    business = db.query(Business).filter(Business.id == current_user.business_id).first()
    if not business:
        raise HTTPException(status_code=403, detail="Business not found")
    return business

def get_current_business(business: Business = Depends(get_business_unrestricted)):
    from .entitlements import is_account_allowed
    allowed, reason, effective_status = is_account_allowed(business)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": reason,
                "code": "ENTITLEMENT_RESTRICTED",
                "status": effective_status.value
            }
        )
    return business

def require_active_entitlement(business: Business = Depends(get_current_business)):
    from .entitlements import is_account_allowed
    allowed, reason, effective_status = is_account_allowed(business)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": reason,
                "code": "ENTITLEMENT_RESTRICTED",
                "status": effective_status.value
            }
        )
    return business

def require_customer_quota(business: Business = Depends(require_active_entitlement), db: Session = Depends(get_db)):
    from .entitlements import check_client_limit
    allowed, current_count, max_limit = check_client_limit(business, db)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You've reached the 10-client limit for your free trial. Subscribe to continue adding clients."
        )
    return business

def require_super_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super Admin access required")
    return current_user
