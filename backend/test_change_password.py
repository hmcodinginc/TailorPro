import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("Testing Password Change Flow on Postgres...")
    client = TestClient(app)

    # 1. Setup a fresh test user
    import time
    test_email = f"passwordtest_{int(time.time())}@test.com"
    initial_password = "initial_password_123"
    new_password = "new_secure_password_456"

    user_data = {
        "name": "Password Test User",
        "business_name": "Password Test Business",
        "email": test_email,
        "password": initial_password,
        "phone": "0000000000"
    }

    # Signup
    r = client.post("/api/auth/signup", json=user_data)
    assert r.status_code == 201, f"Signup failed: {r.text}"
    print("[OK] Test user registered.")

    # 2. Login with original password
    r = client.post("/api/auth/login", json={"email": test_email, "password": initial_password})
    assert r.status_code == 200, f"Login failed: {r.text}"
    access_token = r.json()["access_token"]
    refresh_token = r.json()["refresh_token"]
    print("[OK] Login successful with old password.")

    # 3. Security Tests
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 3a. Missing JWT
    r = client.post("/api/auth/change-password", json={"current_password": initial_password, "new_password": new_password})
    assert r.status_code == 401, "Should reject missing JWT"
    
    # 3b. Empty current password
    r = client.post("/api/auth/change-password", json={"current_password": "", "new_password": new_password}, headers=headers)
    assert r.status_code == 400, "Should reject empty current password"

    # 3c. Empty new password (actually handled by length check < 6)
    r = client.post("/api/auth/change-password", json={"current_password": initial_password, "new_password": ""}, headers=headers)
    assert r.status_code == 400, "Should reject empty new password"

    # 3d. Incorrect current password
    r = client.post("/api/auth/change-password", json={"current_password": "wrong_password", "new_password": new_password}, headers=headers)
    assert r.status_code == 400, "Should reject incorrect current password"
    assert "incorrect" in r.text.lower()
    print("[OK] Security validations passed.")

    # 4. Change password successfully
    r = client.post("/api/auth/change-password", json={"current_password": initial_password, "new_password": new_password}, headers=headers)
    assert r.status_code == 200, f"Password change failed: {r.text}"
    print("[OK] Password successfully changed.")

    # 5. Check if refresh token was revoked
    r = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert r.status_code == 401, "Refresh token should have been revoked after password change!"
    print("[OK] Old refresh token correctly revoked.")

    # 6. Try logging in with the OLD password
    r = client.post("/api/auth/login", json={"email": test_email, "password": initial_password})
    assert r.status_code == 401, "Old password was accepted!"
    print("[OK] Old password properly rejected.")

    # 7. Try logging in with the NEW password
    r = client.post("/api/auth/login", json={"email": test_email, "password": new_password})
    assert r.status_code == 200, f"New password login failed: {r.text}"
    print("[OK] New password login successful.")

    print("ALL TESTS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    run_tests()
