import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine
from . import models

from .routers import customers, orders, measurements, dashboard
from .routers import auth
from .routers import invoices

load_dotenv()

# ✅ STEP 1: Create app FIRST
app = FastAPI()

# ✅ STEP 2: Mount uploads folder
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ STEP 3: Create DB tables & auto-migrate missing columns
models.Base.metadata.create_all(bind=engine)

def auto_migrate_db():
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        with engine.begin() as conn:
            if "users" in tables:
                user_cols = [c["name"] for c in inspector.get_columns("users")]
                for col, col_type in [
                    ("name", "VARCHAR"),
                    ("phone", "VARCHAR"),
                    ("business_id", "INTEGER"),
                    ("email_verified", "BOOLEAN DEFAULT 0")
                ]:
                    if col not in user_cols:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))

            if "measurements" in tables:
                m_cols = [c["name"] for c in inspector.get_columns("measurements")]
                for col, col_type in [
                    ("gender", "VARCHAR"),
                    ("upper_chest", "FLOAT"),
                    ("under_bust", "FLOAT"),
                    ("calf", "FLOAT")
                ]:
                    if col not in m_cols:
                        conn.execute(text(f"ALTER TABLE measurements ADD COLUMN {col} {col_type}"))
    except Exception as e:
        print(f"Auto-migration check notice: {e}")

auto_migrate_db()

# ✅ STEP 4: CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:8080,http://127.0.0.1:8080,"
            "http://localhost:8081,http://127.0.0.1:8081,"
            "http://localhost:5173,http://127.0.0.1:5173," \
            "https://tms-frontend-x0we.onrender.com"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ STEP 5: Routers
app.include_router(customers, prefix="/api")
app.include_router(orders, prefix="/api")
app.include_router(measurements, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# ✅ Home route
@app.get("/")
def home():
    return {"message": "Tailor Management API Running"}
