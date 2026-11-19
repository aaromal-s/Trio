"""
TRIO Email Service — Resend (production) / Local Dev Fallback
Sends branded password-reset emails with secure token links.
"""

import os
import logging
import hashlib
from typing import Optional

logger = logging.getLogger("trio.email")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "TRIO <noreply@trio-ai.dev>")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


def _build_reset_email_html(reset_link: str, expires_minutes: int = 15) -> str:
    """Generate a branded TRIO password-reset HTML email."""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#FFFFFF;border-radius:12px;border:1px solid #E8EAF2;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">TRIO</h1>
    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;">Learn. Remember. Discover.</p>
  </div>
  <div style="padding:32px 24px;">
    <h2 style="margin:0 0 12px;color:#172033;font-size:20px;">Password Reset Request</h2>
    <p style="color:#64748B;font-size:14px;line-height:1.6;">
      You requested a password reset for your TRIO account. Click the button below to set a new password.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{reset_link}"
         style="display:inline-block;padding:12px 32px;background:#4F46E5;color:#fff;text-decoration:none;
                border-radius:8px;font-weight:600;font-size:14px;">
        Reset Password
      </a>
    </div>
    <p style="color:#94A3B8;font-size:12px;line-height:1.5;">
      This link expires in <strong>{expires_minutes} minutes</strong> and can only be used once.<br>
      If you did not request this reset, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #E8EAF2;margin:24px 0;">
    <p style="color:#94A3B8;font-size:11px;">
      Link not working? Copy and paste this URL into your browser:<br>
      <span style="color:#4F46E5;word-break:break-all;">{reset_link}</span>
    </p>
  </div>
  <div style="background:#F7F8FC;padding:16px 24px;text-align:center;">
    <p style="color:#94A3B8;font-size:11px;margin:0;">
      &copy; 2026 TRIO AI Discovery Platform — University Research Project
    </p>
  </div>
</div>
</body>
</html>"""


def send_password_reset_email(
    to_email: str,
    reset_token: str,
    expires_minutes: int = 15,
) -> dict:
    """
    Send a password-reset email via Resend, SendGrid, or local-dev fallback.

    Returns a dict with:
      - provider: 'resend' | 'sendgrid' | 'local_dev'
      - success: bool
      - message: str
      - reset_token (ONLY in local_dev mode, NEVER in production)
    """
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    # --- Resend ---
    if RESEND_API_KEY:
        try:
            import resend
            resend.api_key = RESEND_API_KEY
            html = _build_reset_email_html(reset_link, expires_minutes)
            params = {
                "from": EMAIL_FROM,
                "to": [to_email],
                "subject": "TRIO — Password Reset",
                "html": html,
            }
            response = resend.Emails.send(params)
            logger.info("Resend email sent to %s (id=%s)", to_email, response.get("id", "?"))
            return {
                "provider": "resend",
                "success": True,
                "message": "Password reset email sent. Check your inbox.",
            }
        except Exception as e:
            logger.error("Resend failed: %s", e)
            # Fall through to local dev

    # --- SendGrid ---
    if SENDGRID_API_KEY:
        try:
            import requests as req
            html = _build_reset_email_html(reset_link, expires_minutes)
            resp = req.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": EMAIL_FROM.split("<")[-1].rstrip(">").strip() if "<" in EMAIL_FROM else EMAIL_FROM},
                    "subject": "TRIO — Password Reset",
                    "content": [{"type": "text/html", "value": html}],
                },
            )
            if resp.status_code in (200, 201, 202):
                logger.info("SendGrid email sent to %s", to_email)
                return {
                    "provider": "sendgrid",
                    "success": True,
                    "message": "Password reset email sent. Check your inbox.",
                }
            else:
                logger.error("SendGrid HTTP %s: %s", resp.status_code, resp.text)
        except Exception as e:
            logger.error("SendGrid failed: %s", e)

    # --- Local Development Fallback ---
    logger.warning(
        "LOCAL DEV MODE — No email provider configured. "
        "Reset token for %s: %s (link: %s)",
        to_email, reset_token, reset_link,
    )
    return {
        "provider": "local_dev",
        "success": True,
        "message": (
            "⚠️ LOCAL DEVELOPMENT MODE — No email provider configured. "
            "The reset token is shown below for testing only. "
            "In production, this token would be sent via email and never exposed in API responses."
        ),
        "reset_token": reset_token,
        "reset_link": reset_link,
    }

