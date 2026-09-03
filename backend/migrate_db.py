import os
from sqlalchemy import text, inspect
from app.database import engine, Base
from app import models

def migrate():
    # 1. Automatically create missing tables (e.g. payments, inventory_items, inquiries)
    Base.metadata.create_all(bind=engine)
    print("Base.metadata.create_all completed.")
    
    # 2. Inspect existing schema and apply additive column migrations
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        # Create default legacy business if not present
        res = conn.execute(text("SELECT id FROM businesses WHERE id = 1")).fetchone()
        if not res:
            conn.execute(text("INSERT INTO businesses (name) VALUES ('Legacy Business')"))
            conn.commit()

        def add_column_if_missing(table_name: str, column_name: str, column_def: str):
            existing_cols = [c["name"] for c in inspector.get_columns(table_name)]
            if column_name not in existing_cols:
                print(f"Adding missing column {column_name} to {table_name}...")
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_def}"))
                conn.commit()
                print(f"Successfully added column {column_name} to {table_name}.")
            else:
                print(f"Column {column_name} already exists in {table_name}. Skipped.")

        # Users table columns
        add_column_if_missing("users", "name", "name VARCHAR")
        add_column_if_missing("users", "phone", "phone VARCHAR")
        add_column_if_missing("users", "business_id", "business_id INTEGER REFERENCES businesses(id)")
        add_column_if_missing("users", "is_superadmin", "is_superadmin BOOLEAN DEFAULT FALSE")
        
        conn.execute(text("UPDATE users SET business_id = 1 WHERE business_id IS NULL"))
        conn.commit()

        # Multi-tenant business_id scoping for core tables
        for table in ["customers", "measurements", "orders", "invoices"]:
            add_column_if_missing(table, "business_id", "business_id INTEGER REFERENCES businesses(id)")
            conn.execute(text(f"UPDATE {table} SET business_id = 1 WHERE business_id IS NULL"))
            conn.commit()

        # Invoices sequential number column
        add_column_if_missing("invoices", "invoice_number", "invoice_number VARCHAR")

    print("Migration successful.")



if __name__ == "__main__":
    migrate()
