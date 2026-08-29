import os
from sqlalchemy import text
from app.database import engine, Base
from app import models

def migrate():
    # Automatically create missing tables (e.g. inquiries)
    Base.metadata.create_all(bind=engine)
    print("Base.metadata.create_all completed.")
    
    with engine.connect() as conn:
        # Create default legacy business
        res = conn.execute(text("SELECT id FROM businesses WHERE id = 1")).fetchone()
        if not res:
            conn.execute(text("INSERT INTO businesses (name) VALUES ('Legacy Business')"))
            conn.commit()
            
        # Helper to safely add column
        def add_column_safe(table, column_def):
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column_def}"))
                conn.commit()
                print(f"Added column {column_def} to {table}")
            except Exception as e:
                # Column likely already exists
                conn.rollback()
                pass

        # PostgreSQL uses BOOLEAN, SQLite supports it via integer mapping
        add_column_safe("users", "name VARCHAR")
        add_column_safe("users", "phone VARCHAR")
        add_column_safe("users", "business_id INTEGER REFERENCES businesses(id)")
        add_column_safe("users", "is_superadmin BOOLEAN DEFAULT FALSE")
        
        conn.execute(text("UPDATE users SET business_id = 1 WHERE business_id IS NULL"))
        conn.commit()

        tables = ["customers", "measurements", "orders", "invoices"]
        for table in tables:
            add_column_safe(table, "business_id INTEGER REFERENCES businesses(id)")
            conn.execute(text(f"UPDATE {table} SET business_id = 1 WHERE business_id IS NULL"))
            conn.commit()
            
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
