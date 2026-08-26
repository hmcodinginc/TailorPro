import os
import resend
from dotenv import load_dotenv

# Ensure environment variables are loaded before accessing them
load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080").rstrip("/")
FROM_EMAIL = os.getenv("MAIL_FROM_ADDRESS", "TailorPro <onboarding@resend.dev>")

def send_verification_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/auth?token={token}&action=verify"
    html_content = f"""
    <h2>Welcome to TailorPro!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="{link}" style="display:inline-block;padding:10px 20px;color:white;background-color:#0ea5e9;text-decoration:none;border-radius:5px;">Verify Email</a>
    <p>Or copy and paste this URL into your browser:</p>
    <p>{link}</p>
    """
    
    try:
        r = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": "Verify your TailorPro account",
            "html": html_content
        })
        print(f"Verification email sent to {to_email}. ID: {r.get('id')}")
    except Exception as e:
        print(f"=====================================")
        print(f"EMAIL FAILED TO SEND TO: {to_email}")
        print(f"RESEND API ERROR: {e}")
        print(f"=====================================")

def send_password_reset_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/auth?token={token}&action=reset"
    html_content = f"""
    <h2>Reset Your Password</h2>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="{link}" style="display:inline-block;padding:10px 20px;color:white;background-color:#0ea5e9;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>Or copy and paste this URL into your browser:</p>
    <p>{link}</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    """

    
    try:
        r = resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": "Reset your TailorPro password",
            "html": html_content
        })
        print(f"Password reset email sent to {to_email}. ID: {r.get('id')}")
    except Exception as e:
        print(f"=====================================")
        print(f"EMAIL FAILED TO SEND TO: {to_email}")
        print(f"RESEND API ERROR: {e}")
        print(f"=====================================")
