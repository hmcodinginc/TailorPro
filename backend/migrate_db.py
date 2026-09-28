import os
from sqlalchemy import text, inspect
from app.database import engine, Base
from app import models

def migrate():
    try:
        # 1. Automatically create missing tables
        Base.metadata.create_all(bind=engine)
        print("Base.metadata.create_all completed.")
        
        # 2. Inspect existing schema and apply additive column migrations
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        with engine.connect() as conn:
            # Create default legacy business if not present
            if "businesses" in existing_tables:
                try:
                    res = conn.execute(text("SELECT id FROM businesses WHERE id = 1")).fetchone()
                    if not res:
                        conn.execute(text("INSERT INTO businesses (name) VALUES ('Legacy Business')"))
                        conn.commit()
                except Exception as e:
                    print(f"Legacy business init notice: {e}")

            def add_column_if_missing(table_name: str, column_name: str, column_def: str):
                if table_name not in existing_tables:
                    return
                try:
                    existing_cols = [c["name"] for c in inspector.get_columns(table_name)]
                    if column_name not in existing_cols:
                        print(f"Adding missing column {column_name} to {table_name}...")
                        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_def}"))
                        conn.commit()
                        print(f"Successfully added column {column_name} to {table_name}.")
                    else:
                        print(f"Column {column_name} already exists in {table_name}. Skipped.")
                except Exception as ex:
                    print(f"Column migration notice for {table_name}.{column_name}: {ex}")

            # Users table columns
            add_column_if_missing("users", "name", "name VARCHAR")
            add_column_if_missing("users", "phone", "phone VARCHAR")
            add_column_if_missing("users", "business_id", "business_id INTEGER REFERENCES businesses(id)")
            add_column_if_missing("users", "is_superadmin", "is_superadmin BOOLEAN DEFAULT FALSE")
            
            try:
                if "users" in existing_tables:
                    conn.execute(text("UPDATE users SET business_id = 1 WHERE business_id IS NULL"))
                    conn.commit()
            except Exception as e:
                print(f"Users business_id default notice: {e}")

            # Multi-tenant business_id scoping for core tables
            for table in ["customers", "measurements", "orders", "invoices"]:
                add_column_if_missing(table, "business_id", "business_id INTEGER REFERENCES businesses(id)")
                try:
                    if table in existing_tables:
                        conn.execute(text(f"UPDATE {table} SET business_id = 1 WHERE business_id IS NULL"))
                        conn.commit()
                except Exception as e:
                    print(f"Scoping update notice for {table}: {e}")

            # Measurements additive columns
            add_column_if_missing("measurements", "bicep", "bicep FLOAT")
            add_column_if_missing("measurements", "wrist", "wrist FLOAT")
            add_column_if_missing("measurements", "height", "height FLOAT")
            add_column_if_missing("measurements", "color", "color VARCHAR")

            # Invoices sequential number column
            add_column_if_missing("invoices", "invoice_number", "invoice_number VARCHAR")

        print("Migration completed successfully.")
    except Exception as e:
        print(f"[WARNING] Migration skipped or encountered non-fatal error: {e}")



if __name__ == "__main__":
    migrate()
