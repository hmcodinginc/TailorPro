import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path, override=True)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    if ENVIRONMENT == "production":
        raise RuntimeError("DATABASE_URL is required in production environment.")
    else:
        DATABASE_URL = "sqlite:///./tms.db"

# Fix old/incorrect PostgreSQL prefixes
if DATABASE_URL.startswith("ppostgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "ppostgresql://",
        "postgresql://",
        1
    )

elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

from sqlalchemy import event, text
import logging

logger = logging.getLogger(__name__)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False
        }
    )
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()
else:
    connect_args = {}
    if "postgresql" in DATABASE_URL:
        connect_args = {
            "connect_timeout": 5,
            "sslmode": "require",
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    
    # In development, check if remote DB is reachable; fallback gracefully to SQLite if unreachable
    if ENVIRONMENT != "production":
        try:
            temp_engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args=connect_args
            )
            with temp_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            engine = temp_engine
            print("[INFO] Connected successfully to remote PostgreSQL database.")
        except Exception as e:
            print(f"[WARNING] Remote PostgreSQL connection failed ({e}). Falling back to local SQLite './tms.db' for development.")
            DATABASE_URL = "sqlite:///./tms.db"
            engine = create_engine(
                DATABASE_URL,
                connect_args={"check_same_thread": False}
            )
            @event.listens_for(engine, "connect")
            def set_sqlite_pragma(dbapi_connection, connection_record):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.close()
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args=connect_args
        )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()