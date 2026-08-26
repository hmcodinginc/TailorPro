import os
import sys
import re

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("Testing Forgot and Reset Password Flow on Postgres...")
    client = TestClient(app)

    import time
    test_email = f"forgot_{int(time.time())}@test.com"
    initial_password = "initial_password_123"
    new_password = "new_secure_password_456"

    user_data = {
        "name": "Forgot Test User",
        "business_name": "Forgot Test Business",
        "email": test_email,
        "password": initial_password,
        "phone": "0000000000"
    }

    # 1. Signup
    r = client.post("/api/auth/signup", json=user_data)
    assert r.status_code == 201, f"Signup failed: {r.text}"
    print("[OK] Test user registered.")

    # 2. Login to get refresh token
    r = client.post("/api/auth/login", json={"email": test_email, "password": initial_password})
    assert r.status_code == 200, f"Login failed: {r.text}"
    refresh_token = r.json()["refresh_token"]

    # 3. Request Forgot Password
    import io
    from contextlib import redirect_stdout
    
    f = io.StringIO()
    with redirect_stdout(f):
        r = client.post("/api/auth/forgot-password", json={"email": test_email})
    assert r.status_code == 200, f"Forgot password failed: {r.text}"
    print("[OK] Forgot password email requested.")
    
    # Extract the token from stdout
    output = f.getvalue()
    match = re.search(r"token=([A-Za-z0-9_.-]+)", output)
    if not match:
        print("COULD NOT FIND TOKEN IN CONSOLE OUTPUT!")
        print("OUTPUT WAS:", output)
        sys.exit(1)
        
    reset_token = match.group(1)
    print(f"[OK] Extracted reset token from console output.")

    # 4. Try Reset Password with invalid token
    r = client.post("/api/auth/reset-password", json={"token": "invalid_token", "new_password": new_password})
    assert r.status_code == 400, "Should reject invalid token"
    print("[OK] Invalid token correctly rejected.")

    # 5. Reset Password with valid token
    r = client.post("/api/auth/reset-password", json={"token": reset_token, "new_password": new_password})
    assert r.status_code == 200, f"Reset password failed: {r.text}"
    print("[OK] Password successfully reset.")

    # 6. Verify Old Refresh Token is Revoked
    r = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert r.status_code == 401, "Refresh token should have been revoked!"
    print("[OK] Old refresh token correctly revoked.")

    # 7. Login with old password
    r = client.post("/api/auth/login", json={"email": test_email, "password": initial_password})
    assert r.status_code == 401, "Old password was accepted!"
    print("[OK] Old password properly rejected.")

    # 8. Login with new password
    r = client.post("/api/auth/login", json={"email": test_email, "password": new_password})
    assert r.status_code == 200, f"New password login failed: {r.text}"
    print("[OK] New password login successful.")

    print("ALL TESTS PASSED SUCCESSFULLY.")

if __name__ == "__main__":
    run_tests()
