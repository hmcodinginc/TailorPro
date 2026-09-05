import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import models
from app.database import Base
from app.core.entitlements import (
    get_business_entitlement_status,
    is_account_allowed,
    check_client_limit,
    get_trial_warning
)

TEST_DB = "sqlite:///./test_sub.db"
engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        now = datetime.utcnow()
        # 1. Create Business in TRIAL (starts now, ends in 7 days)
        biz = models.Business(
            name="Test Tailor Studio",
            subscription_status=models.SubscriptionStatus.TRIAL,
            trial_started_at=now,
            trial_ends_at=now + timedelta(days=7)
        )
        db.add(biz)
        db.commit()
        db.refresh(biz)
        
        # Test entitlement
        status = get_business_entitlement_status(biz)
        assert status == models.SubscriptionStatus.TRIAL, f"Expected TRIAL, got {status}"
        
        allowed, msg, _ = is_account_allowed(biz)
        assert allowed is True, f"Expected allowed=True, got {allowed}"
        
        # Test client limit on TRIAL (0/10)
        client_allowed, count, max_lim = check_client_limit(biz, db)
        assert client_allowed is True and max_lim == 10, f"Expected limit=10, got {max_lim}"
        
        # Add 10 customers
        for i in range(10):
            c = models.Customer(name=f"Customer {i}", phone="1234567890", business_id=biz.id)
            db.add(c)
        db.commit()
        
        # Check 11th customer limit
        client_allowed, count, max_lim = check_client_limit(biz, db)
        assert client_allowed is False and count == 10, f"Expected 11th customer disallowed, got allowed={client_allowed}, count={count}"
        print("[PASSED] 10-client trial limit enforcement test")
        
        # 2. Test Expired Trial
        biz.trial_ends_at = now - timedelta(days=1)
        db.commit()
        
        status = get_business_entitlement_status(biz)
        assert status == models.SubscriptionStatus.TRIAL_EXPIRED, f"Expected TRIAL_EXPIRED, got {status}"
        
        allowed, msg, _ = is_account_allowed(biz)
        assert allowed is False, f"Expected allowed=False on expired trial, got {allowed}"
        print("[PASSED] Trial expiration calculation test")
        
        # 3. Test Trial Warning Banners
        biz.subscription_status = models.SubscriptionStatus.TRIAL
        biz.trial_ends_at = now + timedelta(days=7)
        warn, days = get_trial_warning(biz)
        assert "7 days" in warn, f"Expected 7 days warning, got {warn}"
        
        biz.trial_ends_at = now + timedelta(days=3)
        warn, days = get_trial_warning(biz)
        assert "3 days" in warn, f"Expected 3 days warning, got {warn}"
        
        biz.trial_ends_at = now + timedelta(days=1)
        warn, days = get_trial_warning(biz)
        assert "tomorrow" in warn, f"Expected tomorrow warning, got {warn}"
        print("[PASSED] Trial warning notification calculation test")
        
        # 4. Test Paid Upgrade (Monthly & Yearly -> Unlimited Clients)
        biz.subscription_status = models.SubscriptionStatus.ACTIVE_MONTHLY
        biz.subscription_ends_at = now + timedelta(days=30)
        db.commit()
        
        client_allowed, count, max_lim = check_client_limit(biz, db)
        assert client_allowed is True and max_lim == -1, f"Expected unlimited clients on paid plan, got max_lim={max_lim}"
        print("[PASSED] Paid plan upgrade test")
        
    finally:
        db.close()
        engine.dispose()
        if os.path.exists("./test_sub.db"):
            os.remove("./test_sub.db")

if __name__ == "__main__":
    run_tests()
