import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Ensure environment variables are loaded before accessing them
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path=env_path, override=True)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "TailorPro <onboarding@resend.dev>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tailorpro.hmcoding.com").rstrip("/")

def send_email(to_email: str, subject: str, html_content: str):
    if not RESEND_API_KEY:
        print(f"RESEND_API_KEY is not configured. Skipped sending email to {to_email}.")
        return

    payload = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }
    
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "TailorPro/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode("utf-8")
            print(f"Email sent successfully to {to_email} via Resend: {res_body}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"=====================================")
        print(f"RESEND HTTP ERROR ({e.code}) TO {to_email}: {err_msg}")
        print(f"=====================================")
    except Exception as e:
        print(f"=====================================")
        print(f"RESEND GENERAL ERROR TO {to_email}: {e}")
        print(f"=====================================")

def send_verification_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/auth?token={token}&action=verify"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Welcome to TailorPro!</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thank you for creating your account. Please click the button below to verify your email address and activate your 7-day free trial:
        </p>
        <div style="margin: 28px 0;">
            <a href="{link}" style="display:inline-block;padding:12px 24px;color:#ffffff;background-color:#0ea5e9;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
                Verify Email Address
            </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">
            Or copy and paste this link in your browser: <br>
            <a href="{link}" style="color: #0ea5e9; word-break: break-all;">{link}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
            If you did not sign up for TailorPro, you can safely ignore this email.
        </p>
    </div>
    """
    send_email(to_email, "Verify your TailorPro account", html_content)

def send_password_reset_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/auth?token={token}&action=reset"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            We received a request to reset the password for your TailorPro account. Click the button below to set a new password:
        </p>
        <div style="margin: 28px 0;">
            <a href="{link}" style="display:inline-block;padding:12px 24px;color:#ffffff;background-color:#0ea5e9;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
                Reset Password
            </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">
            Or copy and paste this link in your browser: <br>
            <a href="{link}" style="color: #0ea5e9; word-break: break-all;">{link}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
            If you did not request a password reset, you can safely ignore this email.
        </p>
    </div>
    """
    send_email(to_email, "Reset your TailorPro password", html_content)
