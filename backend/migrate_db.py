import sqlite3

def migrate():
    conn = sqlite3.connect('tms.db')
    cursor = conn.cursor()

    # Create businesses table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR
    )
    ''')

    # Insert a default legacy business if not exists
    cursor.execute('SELECT id FROM businesses WHERE id = 1')
    if not cursor.fetchone():
        cursor.execute("INSERT INTO businesses (name) VALUES ('Legacy Business')")
    
    # Add columns to users
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN business_id INTEGER REFERENCES businesses(id)")
    except sqlite3.OperationalError:
        pass
        
    cursor.execute("UPDATE users SET business_id = 1 WHERE business_id IS NULL")

    # Add business_id to other tables
    tables = ["customers", "measurements", "orders", "invoices"]
    for table in tables:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN business_id INTEGER REFERENCES businesses(id)")
        except sqlite3.OperationalError:
            pass
        cursor.execute(f"UPDATE {table} SET business_id = 1 WHERE business_id IS NULL")

    conn.commit()
    conn.close()
    print("Migration successful.")

if __name__ == "__main__":
    migrate()
