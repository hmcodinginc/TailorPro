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
from .routers import business
from .routers import subscriptions

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path, override=True)

# STEP 1: Create app FIRST
app = FastAPI()

# STEP 2: Mount uploads folder
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# STEP 3: Create DB tables
models.Base.metadata.create_all(bind=engine)

# STEP 4: CORS
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
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# STEP 5: Routers
app.include_router(customers, prefix="/api")
app.include_router(orders, prefix="/api")
app.include_router(measurements, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(business.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")

# Home route
@app.get("/")
def home():
    return {"message": "Tailor Management API Running"}
