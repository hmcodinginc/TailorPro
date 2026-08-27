import math
from datetime import datetime
from sqlalchemy.orm import Session
from ..models import Business, SubscriptionStatus, Customer

FREE_TRIAL_CLIENT_LIMIT = 10

def get_business_entitlement_status(business: Business) -> SubscriptionStatus:
    if not business:
        return SubscriptionStatus.TRIAL_EXPIRED
    
    current_status = business.subscription_status
    now = datetime.utcnow()

    # Dynamic trial expiration check from timestamps
    if current_status == SubscriptionStatus.TRIAL:
        if business.trial_ends_at and now > business.trial_ends_at:
            return SubscriptionStatus.TRIAL_EXPIRED
        return SubscriptionStatus.TRIAL
    
    # Active subscription check
    if current_status in [SubscriptionStatus.ACTIVE_MONTHLY, SubscriptionStatus.ACTIVE_YEARLY]:
        if business.subscription_ends_at and now > business.subscription_ends_at:
            return SubscriptionStatus.PAYMENT_FAILED
        return current_status

    return current_status

def is_account_allowed(business: Business) -> tuple[bool, str, SubscriptionStatus]:
    """
    Central entitlement check: "Is this account currently allowed to use TailorPro?"
    """
    if not business:
        return False, "No business associated with user.", SubscriptionStatus.TRIAL_EXPIRED

    effective_status = get_business_entitlement_status(business)

    if effective_status in [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE_MONTHLY, SubscriptionStatus.ACTIVE_YEARLY, SubscriptionStatus.CUSTOM]:
        return True, "Access granted.", effective_status
    elif effective_status == SubscriptionStatus.TRIAL_EXPIRED:
        return False, "Your TailorPro free trial has ended. Your data is safe. Choose a plan to continue.", effective_status
    elif effective_status == SubscriptionStatus.PAYMENT_FAILED:
        return False, "Subscription payment is required to continue accessing TailorPro.", effective_status
    elif effective_status == SubscriptionStatus.SUSPENDED:
        return False, "Account suspended. Please contact support.", effective_status
    else:
        return False, "Account access restricted.", effective_status

def check_client_limit(business: Business, db: Session) -> tuple[bool, int, int]:
    """
    Checks if business is within allowed client record limit.
    Returns (is_allowed, current_count, max_limit)
    """
    effective_status = get_business_entitlement_status(business)
    current_count = db.query(Customer).filter(Customer.business_id == business.id).count()

    if effective_status == SubscriptionStatus.TRIAL:
        max_limit = FREE_TRIAL_CLIENT_LIMIT
        allowed = current_count < max_limit
        return allowed, current_count, max_limit
    elif effective_status == SubscriptionStatus.CUSTOM:
        max_limit = business.custom_client_limit if business.custom_client_limit is not None else 999999
        allowed = current_count < max_limit
        return allowed, current_count, max_limit
    else:
        # PAID plans (ACTIVE_MONTHLY, ACTIVE_YEARLY) have unlimited clients (-1)
        return True, current_count, -1

def get_trial_warning(business: Business) -> tuple[str | None, int]:
    """
    Returns warning message and remaining days for trial warning notifications.
    """
    if not business:
        return None, 0

    effective_status = get_business_entitlement_status(business)
    if effective_status == SubscriptionStatus.TRIAL_EXPIRED:
        return "Your TailorPro free trial has ended. Your data is safe. Choose a plan to continue.", 0
        
    if effective_status != SubscriptionStatus.TRIAL or not business.trial_ends_at:
        return None, 0
        
    now = datetime.utcnow()
    remaining_seconds = (business.trial_ends_at - now).total_seconds()
    if remaining_seconds <= 0:
        return "Your TailorPro free trial has ended. Your data is safe. Choose a plan to continue.", 0
    
    remaining_days = math.ceil(remaining_seconds / 86400.0)
    
    if remaining_days <= 1:
        return "Your free trial ends tomorrow.", remaining_days
    elif remaining_days <= 3:
        return "Your free trial ends in 3 days.", remaining_days
    elif remaining_days <= 7:
        return f"Your free trial ends in {remaining_days} days.", remaining_days
    else:
        return f"Free trial active: {remaining_days} days remaining.", remaining_days
