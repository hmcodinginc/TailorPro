import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base
import traceback

def run_tests():
    print("Testing Postgres Connection and Auth Flow...")
    try:
        # Create schema in Postgres
        Base.metadata.create_all(bind=engine)
        print("Schema Verified / Created.")
    except Exception as e:
        print(f"Error connecting to Postgres/Creating Schema: {e}")
        return

    client = TestClient(app)

    # 1. Signup Business A
    user_a = {
        "name": "User A",
        "business_name": "Business A",
        "email": "user_a@test.com",
        "password": "strongpasswordA",
        "phone": "1234567890"
    }
    r = client.post("/api/auth/signup", json=user_a)
    if r.status_code == 400 and "Email already registered" in r.text:
        print("User A already exists, proceeding...")
    else:
        assert r.status_code == 201, f"Signup A failed: {r.text}"

    # 2. Signup Business B
    user_b = {
        "name": "User B",
        "business_name": "Business B",
        "email": "user_b@test.com",
        "password": "strongpasswordB",
        "phone": "0987654321"
    }
    r = client.post("/api/auth/signup", json=user_b)
    if r.status_code == 400 and "Email already registered" in r.text:
        print("User B already exists, proceeding...")
    else:
        assert r.status_code == 201, f"Signup B failed: {r.text}"

    # 3. Login User A
    r = client.post("/api/auth/login", json={"email": user_a["email"], "password": user_a["password"]})
    assert r.status_code == 200, f"Login A failed: {r.text}"
    token_a = r.json()["access_token"]
    refresh_token_a = r.json()["refresh_token"]

    # 4. Login User B
    r = client.post("/api/auth/login", json={"email": user_b["email"], "password": user_b["password"]})
    assert r.status_code == 200, f"Login B failed: {r.text}"
    token_b = r.json()["access_token"]
    
    # 5. Verify /me
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_a}"})
    assert r.status_code == 200, "/me failed"
    me_data = r.json()
    assert me_data["email"] == user_a["email"]
    assert "password" not in me_data
    
    # 6. Tenant Isolation Check
    # Create customer for Business A
    cust_data = {"name": "Cust A", "phone": "111", "email": "a@a.com", "address": "123"}
    r = client.post("/api/customers/", json=cust_data, headers={"Authorization": f"Bearer {token_a}"})
    assert r.status_code == 200, f"Create customer failed: {r.text}"
    cust_id = r.json()["id"]

    # Fetch customer with token A
    r = client.get("/api/customers/", headers={"Authorization": f"Bearer {token_a}"})
    assert any(c["id"] == cust_id for c in r.json()), "Customer A not found for User A"
    
    # Fetch customer with token B
    r = client.get("/api/customers/", headers={"Authorization": f"Bearer {token_b}"})
    assert not any(c["id"] == cust_id for c in r.json()), "Tenant isolation failed! User B saw Customer A"

    # IDOR Test
    r = client.put(f"/api/customers/{cust_id}", json=cust_data, headers={"Authorization": f"Bearer {token_b}"})
    assert r.status_code == 404, "IDOR Failed! User B updated Customer A"

    # 7. Test Refresh Token
    r = client.post("/api/auth/refresh", json={"refresh_token": refresh_token_a})
    assert r.status_code == 200, f"Refresh failed: {r.text}"
    new_access_token = r.json()["access_token"]
    
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {new_access_token}"})
    assert r.status_code == 200, "New access token failed"
    
    # 8. Test Logout
    r = client.post("/api/auth/logout", json={"refresh_token": refresh_token_a})
    assert r.status_code == 200, "Logout failed"
    
    # Try refreshing again with revoked token
    r = client.post("/api/auth/refresh", json={"refresh_token": refresh_token_a})
    assert r.status_code == 401, "Revoked token should be rejected"

    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
