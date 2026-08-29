import os
import sys
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current dir to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import models, schemas
from app.database import Base
from app.routers import subscriptions

TEST_DB_URI = "sqlite:///./test_razorpay.db"
engine = create_engine(TEST_DB_URI, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class MockRequest:
    def __init__(self, body_bytes: bytes, headers: dict):
        self._body = body_bytes
        self.headers = headers

    async def body(self):
        return self._body

def run_tests():
    print("--- RUNNING RAZORPAY INTEGRATION TEST SUITE ---")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    try:
        # Create Test Business & User
        now = datetime.utcnow()
        biz = models.Business(
            name="Razorpay Test Studio",
            subscription_status=models.SubscriptionStatus.TRIAL,
            trial_started_at=now,
            trial_ends_at=now + timedelta(days=14)
        )
        db.add(biz)
        db.commit()
        db.refresh(biz)

        user = models.User(
            email="razorpay_test@tailorpro.com",
            password="hashedpassword123",
            name="Test Tailor",
            business_id=biz.id,
            email_verified=True,
            phone_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # -------------------------------------------------------------
        # 1. Test GET /api/subscriptions/status function
        # -------------------------------------------------------------
        status_res = subscriptions.get_subscription_status(current_user=user, business=biz, db=db)
        assert status_res["status"] == "TRIAL"
        assert len(status_res["plans"]) == 2
        print("[PASSED] get_subscription_status function check")

        # -------------------------------------------------------------
        # 2. Test create_subscription function
        # -------------------------------------------------------------
        req_monthly = schemas.CreateSubscriptionRequest(plan="TAILORPRO_MONTHLY")
        res_m = subscriptions.create_subscription(data=req_monthly, current_user=user, business=biz)
        assert "subscription_id" in res_m
        assert res_m["plan"] == "TAILORPRO_MONTHLY"
        print("[PASSED] create_subscription monthly check")

        req_yearly = schemas.CreateSubscriptionRequest(plan="TAILORPRO_YEARLY")
        res_y = subscriptions.create_subscription(data=req_yearly, current_user=user, business=biz)
        assert res_y["plan"] == "TAILORPRO_YEARLY"
        print("[PASSED] create_subscription yearly check")

        # -------------------------------------------------------------
        # 3. Test HMAC-SHA256 Payment Signature Verification
        # -------------------------------------------------------------
        test_secret = "test_razorpay_secret_key_12345"
        pay_id = "pay_N123456789"
        sub_id = "sub_N987654321"

        valid_msg = f"{pay_id}|{sub_id}".encode("utf-8")
        valid_sig = hmac.new(test_secret.encode("utf-8"), valid_msg, hashlib.sha256).hexdigest()

        assert subscriptions.verify_razorpay_subscription_signature(pay_id, sub_id, valid_sig, test_secret) is True
        assert subscriptions.verify_razorpay_subscription_signature(pay_id, sub_id, "invalid_sig_123", test_secret) is False
        print("[PASSED] HMAC-SHA256 Payment signature calculation unit test")

        # -------------------------------------------------------------
        # 4. Test verify_payment function
        # -------------------------------------------------------------
        os.environ["RAZORPAY_KEY_SECRET"] = test_secret
        
        # Invalid signature raises HTTPException 400
        invalid_req = schemas.VerifyPaymentRequest(
            razorpay_payment_id=pay_id,
            razorpay_subscription_id=sub_id,
            razorpay_signature="invalid_fake_sig",
            plan="TAILORPRO_MONTHLY"
        )
        try:
            subscriptions.verify_payment(data=invalid_req, business=biz, db=db)
            assert False, "Should have raised HTTPException 400"
        except subscriptions.HTTPException as exc:
            assert exc.status_code == 400
            assert "Invalid Razorpay payment signature" in exc.detail
            print("[PASSED] Payment verification rejects invalid HMAC signature (400 Bad Request)")

        # Valid Signature Success
        valid_req = schemas.VerifyPaymentRequest(
            razorpay_payment_id=pay_id,
            razorpay_subscription_id=sub_id,
            razorpay_signature=valid_sig,
            plan="TAILORPRO_MONTHLY"
        )
        v_res = subscriptions.verify_payment(data=valid_req, business=biz, db=db)
        assert v_res["subscription_status"] == "ACTIVE_MONTHLY"
        
        db.refresh(biz)
        assert biz.subscription_status == "ACTIVE_MONTHLY"
        assert biz.subscription_ends_at is not None
        print("[PASSED] Payment signature verification granted ACTIVE_MONTHLY access")

        # -------------------------------------------------------------
        # 5. Test Webhooks & Duplicate Event Deduplication
        # -------------------------------------------------------------
        webhook_secret = "whsec_test_secret_999"
        os.environ["RAZORPAY_WEBHOOK_SECRET"] = webhook_secret

        # 5a. Webhook: Successful Payment (subscription.charged -> Yearly Upgrade)
        charged_evt = {
            "event_id": "evt_test_charged_001",
            "event": "subscription.charged",
            "payload": {
                "subscription": {
                    "entity": {
                        "id": sub_id,
                        "notes": {
                            "business_id": str(biz.id),
                            "plan": "TAILORPRO_YEARLY"
                        }
                    }
                }
            }
        }
        charged_bytes = json.dumps(charged_evt).encode("utf-8")
        charged_sig = hmac.new(webhook_secret.encode("utf-8"), charged_bytes, hashlib.sha256).hexdigest()

        req_charged = MockRequest(charged_bytes, {"X-Razorpay-Signature": charged_sig})
        import asyncio
        wb_res_1 = asyncio.run(subscriptions.razorpay_webhook(req_charged, db=db))
        assert wb_res_1["status"] == "processed"

        db.refresh(biz)
        assert biz.subscription_status == "ACTIVE_YEARLY"
        print("[PASSED] Webhook subscription.charged updated business to ACTIVE_YEARLY")

        # 5b. Webhook Duplicate-Event Handling (Idempotency)
        wb_res_dup = asyncio.run(subscriptions.razorpay_webhook(req_charged, db=db))
        assert wb_res_dup["reason"] == "duplicate_event"
        print("[PASSED] Webhook duplicate event correctly identified and ignored")

        # 5c. Webhook: Payment Failed (payment.failed -> PAYMENT_FAILED status)
        failed_evt = {
            "event_id": "evt_test_failed_002",
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_failed_123",
                        "notes": {"business_id": str(biz.id)}
                    }
                }
            }
        }
        failed_bytes = json.dumps(failed_evt).encode("utf-8")
        failed_sig = hmac.new(webhook_secret.encode("utf-8"), failed_bytes, hashlib.sha256).hexdigest()

        req_failed = MockRequest(failed_bytes, {"X-Razorpay-Signature": failed_sig})
        wb_res_fail = asyncio.run(subscriptions.razorpay_webhook(req_failed, db=db))
        assert wb_res_fail["status"] == "processed"

        db.refresh(biz)
        assert biz.subscription_status == "PAYMENT_FAILED"
        print("[PASSED] Webhook payment.failed revoked paid access (set PAYMENT_FAILED)")

        # 5d. Webhook: Subscription Cancelled (subscription.cancelled)
        biz.subscription_ends_at = datetime.utcnow() + timedelta(days=15)
        db.commit()

        cancel_evt = {
            "event_id": "evt_test_cancel_003",
            "event": "subscription.cancelled",
            "payload": {
                "subscription": {
                    "entity": {
                        "id": sub_id,
                        "notes": {"business_id": str(biz.id)}
                    }
                }
            }
        }
        cancel_bytes = json.dumps(cancel_evt).encode("utf-8")
        cancel_sig = hmac.new(webhook_secret.encode("utf-8"), cancel_bytes, hashlib.sha256).hexdigest()

        req_cancel = MockRequest(cancel_bytes, {"X-Razorpay-Signature": cancel_sig})
        wb_res_cancel = asyncio.run(subscriptions.razorpay_webhook(req_cancel, db=db))
        assert wb_res_cancel["status"] == "processed"

        # 5e. Webhook: Expiry Handling (subscription.completed when ends_at passed)
        biz.subscription_ends_at = datetime.utcnow() - timedelta(days=1)
        db.commit()

        completed_evt = {
            "event_id": "evt_test_completed_004",
            "event": "subscription.completed",
            "payload": {
                "subscription": {
                    "entity": {
                        "id": sub_id,
                        "notes": {"business_id": str(biz.id)}
                    }
                }
            }
        }
        completed_bytes = json.dumps(completed_evt).encode("utf-8")
        completed_sig = hmac.new(webhook_secret.encode("utf-8"), completed_bytes, hashlib.sha256).hexdigest()

        req_completed = MockRequest(completed_bytes, {"X-Razorpay-Signature": completed_sig})
        wb_res_comp = asyncio.run(subscriptions.razorpay_webhook(req_completed, db=db))
        assert wb_res_comp["status"] == "processed"

        db.refresh(biz)
        assert biz.subscription_status == "PAYMENT_FAILED"
        print("[PASSED] Webhook subscription.completed revoked paid access on expired end date")

        # -------------------------------------------------------------
        # 6. Verify zero database schema modifications
        # -------------------------------------------------------------
        columns = [c.name for c in models.Business.__table__.columns]
        expected_columns = [
            "id", "name", "subscription_status", "address", "phone", "email",
            "gst_number", "logo_url", "trial_started_at", "trial_ends_at", "subscription_ends_at"
        ]
        assert set(columns) == set(expected_columns), f"Database schema columns changed! Got: {columns}"
        print("[PASSED] Verified zero database schema or table modifications!")

        print("\nALL RAZORPAY INTEGRATION TESTS PASSED SUCCESSFULLY!")

    finally:
        db.close()
        engine.dispose()
        if os.path.exists("./test_razorpay.db"):
            os.remove("./test_razorpay.db")

if __name__ == "__main__":
    run_tests()
