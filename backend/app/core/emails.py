import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Ensure environment variables are loaded before accessing them
load_dotenv()

SMTP_USER = os.getenv("SMTP_USER", "tailorpro01@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080").rstrip("/")

def send_email(to_email: str, subject: str, html_content: str):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = f"TailorPro <{SMTP_USER}>"
    msg['To'] = to_email
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')
    
    try:
        # Connect to Gmail SMTP server
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
            smtp.send_message(msg)
        print(f"Email sent successfully to {to_email} via Gmail SMTP.")
    except Exception as e:
        print(f"=====================================")
        print(f"EMAIL FAILED TO SEND TO: {to_email}")
        print(f"SMTP ERROR: {e}")
        print(f"=====================================")

def send_verification_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/auth?token={token}&action=verify"
    html_content = f"""
    <h2>Welcome to TailorPro!</h2>
    <p>Please verify your email address by clicking the button below:</p>
    <br>
    <a href="{link}" style="display:inline-block;padding:10px 20px;color:white;background-color:#0ea5e9;text-decoration:none;border-radius:5px;font-weight:bold;">Verify Email</a>
    <br><br>
    <p>If you did not sign up, you can safely ignore this email.</p>
    """
    send_email(to_email, "Verify your TailorPro account", html_content)

def send_password_reset_email(to_email: str, token: str):
    link = f"{FRONTEND_URL}/auth?token={token}&action=reset"
    html_content = f"""
    <h2>Reset Your Password</h2>
    <p>You requested a password reset. Click the button below to set a new password:</p>
    <br>
    <a href="{link}" style="display:inline-block;padding:10px 20px;color:white;background-color:#0ea5e9;text-decoration:none;border-radius:5px;font-weight:bold;">Reset Password</a>
    <br><br>
    <p>If you did not request this, you can safely ignore this email.</p>
    """
    send_email(to_email, "Reset your TailorPro password", html_content)
