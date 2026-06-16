from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, stored_password: str) -> bool:
    try:
        return pwd_context.verify(password, stored_password)
    except (UnknownHashError, ValueError):
        # Backward compatibility for users created before password hashing.
        return stored_password == password


# SIGNUP
@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing = db.query(models.User).filter(models.User.email == user.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = models.User(
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account created successfully"
    }


# LOGIN
@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    password_valid = verify_password(user.password, db_user.password)

    if not password_valid:
        raise HTTPException(status_code=401, detail="Wrong password")

    if db_user.password == user.password:
        db_user.password = hash_password(user.password)
        db.commit()

    return {
        "access_token": "demo-token",
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email
        }
    }
