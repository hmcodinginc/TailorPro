import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import models, schemas
from app.database import Base, engine, SessionLocal
from app.core.entitlements import (
    get_business_entitlement_status,
    is_account_allowed,
    check_client_limit,
    get_trial_warning
)
from app.routers import auth, customers, subscriptions

def run_integration_tests():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Signup user 1 -> grants 30 day free trial
        signup_payload_1 = schemas.UserCreate(
            name="First Studio Owner",
            business_name="Studio One",
            email="owner1@example.com",
            phone="+919876543210",
            password="password123"
        )
        res1 = auth.signup(signup_payload_1, db=db)
        assert "7-day free trial" in res1["message"]
        print("[PASSED] Initial signup with 7-day trial created successfully")
        
        biz = db.query(models.Business).filter(models.Business.name == "Studio One").first()
        user = db.query(models.User).filter(models.User.email == "owner1@example.com").first()
        
        # 2. Test Subscription Status endpoint logic
        sub_status = subscriptions.get_subscription_status(current_user=user, business=biz, db=db)
        assert sub_status["status"] == "TRIAL"
        assert sub_status["client_limit"] == 10
        assert sub_status["remaining_trial_days"] == 7
        print("[PASSED] Subscription status & dynamic 7-day trial calculation test")


        # 3. Anti-Abuse Test: Try signing up with same phone number
        signup_payload_abuse = schemas.UserCreate(
            name="Fake Account",
            business_name="Studio Fake",
            email="fakeowner@example.com",
            phone="+919876543210",
            password="password123"
        )
        try:
            auth.signup(signup_payload_abuse, db=db)
            assert False, "Expected 400 rejection on duplicate phone"
        except Exception as e:
            assert "This email/phone has already used a TailorPro trial." in str(e)
            print("[PASSED] Trial abuse protection test (duplicate phone rejected)")
        
        # 4. Add 10 clients (allowed) and 11th client (rejected with 10-client limit notice)
        for i in range(10):
            c_data = models.Customer(name=f"Customer {i+1}", phone=f"900000000{i}", email=f"c{i}@test.com", business_id=biz.id)
            db.add(c_data)
        db.commit()

        # 11th customer creation check
        allowed, count, max_lim = check_client_limit(biz, db)
        assert allowed is False and count == 10
        print("[PASSED] 10-client limit API enforcement test")
        
        # 5. Paid Upgrade test to TAILORPRO_YEARLY (₹50,000)
        sub_payload = schemas.SubscribeRequest(plan="TAILORPRO_YEARLY")

        res_sub = subscriptions.subscribe(sub_payload, business=biz, db=db)
        assert res_sub["subscription_status"] == "ACTIVE_YEARLY"
        
        # 6. Verify 11th customer can now be added on paid plan!
        allowed, count, max_lim = check_client_limit(biz, db)
        assert allowed is True and max_lim == -1
        print("[PASSED] Paid plan upgrade & unlimited client access test")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_integration_tests()
