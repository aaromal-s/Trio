"""
TRIO Authentication & User Profile Management API (v2)
- User ID login (not email)
- Argon2id password hashing
- Database-backed persistence (SQLite/PostgreSQL)
- Email-based password recovery (Resend/SendGrid/local-dev)
- Rate limiting on login and password reset
- Secure reset tokens (hashed, single-use, expiring)
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import time
import uuid
import hashlib
import secrets
import logging
import os

from argon2 import PasswordHasher, Type
from argon2.exceptions import VerifyMismatchError, VerificationError

from app.core.database import execute_query, execute_write, seed_default_users
from app.core.email_service import send_password_reset_email
from app.core.rate_limiter import check_rate_limit

logger = logging.getLogger("trio.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------------------------------------------------------------------
# Password hashing (Argon2id)
# ---------------------------------------------------------------------------

_ph = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=1,
    hash_len=32,
    type=Type.ID,  # argon2id
)


def hash_password(password: str) -> str:
    """Hash a password with Argon2id."""
    return _ph.hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against an Argon2id hash."""
    try:
        return _ph.verify(stored_hash, password)
    except (VerifyMismatchError, VerificationError):
        return False


def _hash_token(token: str) -> str:
    """SHA-256 hash of a reset token for storage (never store raw tokens)."""
    return hashlib.sha256(token.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    user_id: str
    password: str

class RegisterRequest(BaseModel):
    user_id: str
    name: str
    email: str
    password: str
    role: Optional[str] = "User"
    affiliation: Optional[str] = ""

class ProfileUpdateRequest(BaseModel):
    name: str
    affiliation: str
    role: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

class AvatarUpdateRequest(BaseModel):
    avatar_url: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@router.post("/login")
def login(req: LoginRequest, request: Request):
    """Authenticate with User ID and password."""
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"login:{client_ip}"
    allowed, remaining, reset_after = check_rate_limit(rate_key, max_requests=10, window_seconds=60)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Too many login attempts. Try again in {reset_after} seconds.",
            headers={"Retry-After": str(reset_after)},
        )

    uid = req.user_id.strip().lower()

    # Production Demo Account Protection
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    allow_demo = os.environ.get("ALLOW_DEMO_ACCOUNTS", "false").lower() == "true"

    if is_production and not allow_demo:
        if uid in ("evaluator", "guest"):
            raise HTTPException(
                status_code=403,
                detail="Demo accounts are disabled in production environment. Please sign in with your registered account."
            )
        # Block known public demo passwords categorically in production
        if req.password in ("trio2026demo", "guest123"):
            raise HTTPException(
                status_code=403,
                detail="Public default demo credentials cannot be used in production."
            )

    user = execute_query(
        "SELECT * FROM users WHERE LOWER(user_id) = ?",
        (uid,),
        fetch="one"
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid User ID or password.")

    if is_production and not allow_demo and user.get("account_status") == "Disabled":
        raise HTTPException(
            status_code=403,
            detail="This demo account has been deactivated in production."
        )

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid User ID or password.")

    # Create session
    token = f"trio_sess_{uuid.uuid4()}"
    expiry = time.time() + 86400  # 24 hours
    now = time.strftime("%Y-%m-%dT%H:%M:%S")

    execute_write(
        "INSERT INTO sessions (token, user_internal_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, user["id"], now, expiry)
    )

    force_change = bool(user.get("force_password_change", 0) == 1)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 86400,
        "force_password_change": force_change,
        "user": {
            "id": user["id"],
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "affiliation": user["affiliation"],
            "avatar_url": user.get("avatar_url", ""),
            "account_type": user.get("account_type", "Standard"),
            "account_status": user.get("account_status", "Active"),
            "force_password_change": force_change,
            "created_at": user["created_at"],
        }
    }


@router.post("/register")
def register(req: RegisterRequest):
    """Register a new user account."""
    uid = req.user_id.strip().lower()

    if len(uid) < 3:
        raise HTTPException(status_code=400, detail="User ID must be at least 3 characters.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = execute_query(
        "SELECT id FROM users WHERE LOWER(user_id) = ?",
        (uid,), fetch="one"
    )
    if existing:
        raise HTTPException(status_code=409, detail="User ID already taken.")

    email_clean = req.email.strip().lower()

    # Production Demo Account Protection
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    allow_demo = os.environ.get("ALLOW_DEMO_ACCOUNTS", "false").lower() == "true"

    if is_production and not allow_demo:
        if any(demo in email_clean for demo in ("evaluator", "guest")):
            raise HTTPException(
                status_code=403,
                detail="Demo accounts are disabled in production environment."
            )
    existing_email = execute_query(
        "SELECT id FROM users WHERE LOWER(email) = ?",
        (email_clean,), fetch="one"
    )
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered.")

    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    internal_id = f"USR-{uuid.uuid4().hex[:8].upper()}"

    execute_write(
        """INSERT INTO users (id, user_id, name, email, role, affiliation,
                              password_hash, account_type, account_status,
                              created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (internal_id, uid, req.name.strip(), email_clean,
         (req.role or "User").strip(), (req.affiliation or "").strip(),
         hash_password(req.password), "Standard", "Active", now, now)
    )

    return {
        "status": "success",
        "message": "Account created successfully.",
        "user": {
            "id": internal_id,
            "user_id": uid,
            "name": req.name.strip(),
            "email": email_clean,
        }
    }


@router.get("/profile")
def get_profile(user_id: Optional[str] = None, email: Optional[str] = None):
    """Get user profile by user_id or email (backward-compatible)."""
    if user_id:
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(user_id) = ?",
            (user_id.strip().lower(),), fetch="one"
        )
    elif email:
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(email) = ?",
            (email.strip().lower(),), fetch="one"
        )
        if not user:
            user = execute_query(
                "SELECT * FROM users WHERE LOWER(user_id) = ?",
                (email.strip().lower(),), fetch="one"
            )
    else:
        # Default demo user
        user = execute_query(
            "SELECT * FROM users WHERE user_id = ?",
            ("evaluator",), fetch="one"
        )

    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    return {
        "id": user["id"],
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "affiliation": user["affiliation"],
        "avatar_url": user.get("avatar_url", ""),
        "account_type": user.get("account_type", "Standard"),
        "account_status": user.get("account_status", "Active"),
        "force_password_change": bool(user.get("force_password_change", 0) == 1),
        "created_at": user["created_at"],
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    user_id: Optional[str] = None,
    email: Optional[str] = None
):
    """Update editable profile fields (name, affiliation, role, email, avatar)."""
    if user_id:
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(user_id) = ?",
            (user_id.strip().lower(),), fetch="one"
        )
    elif email:
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(email) = ?",
            (email.strip().lower(),), fetch="one"
        )
        if not user:
            user = execute_query(
                "SELECT * FROM users WHERE LOWER(user_id) = ?",
                (email.strip().lower(),), fetch="one"
            )
    else:
        user = execute_query(
            "SELECT * FROM users WHERE user_id = ?",
            ("evaluator",), fetch="one"
        )

    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")

    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    name = req.name.strip()
    affiliation = req.affiliation.strip()
    role = req.role.strip() if req.role else user["role"]
    new_email = req.email.strip().lower() if req.email else user["email"]
    avatar = req.avatar_url if req.avatar_url is not None else user.get("avatar_url", "")

    # Validate email uniqueness if changing email
    if new_email != user["email"].lower():
        existing_email = execute_query(
            "SELECT id FROM users WHERE LOWER(email) = ? AND id != ?",
            (new_email, user["id"]), fetch="one"
        )
        if existing_email:
            raise HTTPException(status_code=409, detail="Email is already in use by another account.")

    execute_write(
        """UPDATE users 
           SET name = ?, affiliation = ?, role = ?, email = ?, avatar_url = ?, updated_at = ? 
           WHERE id = ?""",
        (name, affiliation, role, new_email, avatar, now, user["id"])
    )

    updated_user = execute_query(
        "SELECT * FROM users WHERE id = ?", (user["id"],), fetch="one"
    )

    return {
        "status": "success",
        "message": "User profile successfully updated.",
        "user": {
            "id": updated_user["id"],
            "user_id": updated_user["user_id"],
            "name": updated_user["name"],
            "email": updated_user["email"],
            "role": updated_user["role"],
            "affiliation": updated_user["affiliation"],
            "avatar_url": updated_user.get("avatar_url", ""),
            "account_type": updated_user.get("account_type", "Standard"),
            "account_status": updated_user.get("account_status", "Active"),
            "force_password_change": bool(updated_user.get("force_password_change", 0) == 1),
            "created_at": updated_user["created_at"],
        }
    }


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    user_id: Optional[str] = None,
    email: Optional[str] = None
):
    """Change password with current password verification."""
    if user_id:
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(user_id) = ?",
            (user_id.strip().lower(),), fetch="one"
        )
    elif email:
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(email) = ?",
            (email.strip().lower(),), fetch="one"
        )
        if not user:
            user = execute_query(
                "SELECT * FROM users WHERE LOWER(user_id) = ?",
                (email.strip().lower(),), fetch="one"
            )
    else:
        user = execute_query(
            "SELECT * FROM users WHERE user_id = ?",
            ("evaluator",), fetch="one"
        )

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not verify_password(req.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password does not match.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    new_hash = hash_password(req.new_password)
    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    execute_write(
        "UPDATE users SET password_hash = ?, force_password_change = 0, updated_at = ? WHERE id = ?",
        (new_hash, now, user["id"])
    )

    return {"status": "success", "message": "Password changed successfully."}


@router.get("/sessions")
def get_active_sessions(request: Request, user_id: Optional[str] = None, email: Optional[str] = None):
    """List active sessions for the current user."""
    auth_header = request.headers.get("Authorization", "")
    current_token = auth_header.replace("Bearer ", "").strip() if "Bearer " in auth_header else ""

    user = None
    if user_id:
        user = execute_query("SELECT id FROM users WHERE LOWER(user_id) = ?", (user_id.strip().lower(),), fetch="one")
    elif email:
        user = execute_query("SELECT id FROM users WHERE LOWER(email) = ?", (email.strip().lower(),), fetch="one")
    else:
        user = execute_query("SELECT id FROM users WHERE LOWER(user_id) = ?", ("evaluator",), fetch="one")
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    now = time.time()
    sessions = execute_query(
        "SELECT token, created_at, expires_at FROM sessions WHERE user_internal_id = ? AND expires_at > ? ORDER BY expires_at DESC",
        (user["id"], now),
        fetch="all"
    )
    result = []
    for s in sessions:
        tok = s["token"]
        result.append({
            "session_id": f"{tok[:12]}...{tok[-4:]}",
            "created_at": s["created_at"],
            "expires_in_hours": round((s["expires_at"] - now) / 3600, 1),
            "is_current": bool(tok == current_token)
        })
    return {"sessions": result, "total_active": len(result)}


@router.post("/logout-other-sessions")
@router.post("/sessions/logout-others")
def logout_other_sessions(request: Request, user_id: Optional[str] = None, email: Optional[str] = None):
    """Revoke all active sessions for this user except the current session."""
    auth_header = request.headers.get("Authorization", "")
    current_token = auth_header.replace("Bearer ", "").strip() if "Bearer " in auth_header else ""

    user = None
    if user_id:
        user = execute_query("SELECT id FROM users WHERE LOWER(user_id) = ?", (user_id.strip().lower(),), fetch="one")
    elif email:
        user = execute_query("SELECT id FROM users WHERE LOWER(email) = ?", (email.strip().lower(),), fetch="one")
    else:
        user = execute_query("SELECT id FROM users WHERE LOWER(user_id) = ?", ("evaluator",), fetch="one")
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if current_token:
        execute_write(
            "DELETE FROM sessions WHERE user_internal_id = ? AND token != ?",
            (user["id"], current_token)
        )
    else:
        execute_write(
            "DELETE FROM sessions WHERE user_internal_id = ?",
            (user["id"],)
        )
    return {"status": "success", "message": "All other active sessions have been terminated."}


@router.post("/avatar")
@router.put("/avatar")
def update_avatar(req: AvatarUpdateRequest, user_id: Optional[str] = None, email: Optional[str] = None):
    """Update avatar image URL or preset avatar."""
    user = None
    if user_id:
        user = execute_query("SELECT id FROM users WHERE LOWER(user_id) = ?", (user_id.strip().lower(),), fetch="one")
    elif email:
        user = execute_query("SELECT id FROM users WHERE LOWER(email) = ?", (email.strip().lower(),), fetch="one")
    else:
        user = execute_query("SELECT id FROM users WHERE LOWER(user_id) = ?", ("evaluator",), fetch="one")
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    execute_write(
        "UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?",
        (req.avatar_url, now, user["id"])
    )
    return {"status": "success", "avatar_url": req.avatar_url}


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, request: Request):
    """Request a password reset. Sends email or returns token in dev mode."""
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"reset:{client_ip}"
    allowed, remaining, reset_after = check_rate_limit(rate_key, max_requests=3, window_seconds=300)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Too many password reset requests. Try again in {reset_after} seconds.",
            headers={"Retry-After": str(reset_after)},
        )

    email_clean = req.email.strip().lower()

    # Production Demo Account Protection
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    allow_demo = os.environ.get("ALLOW_DEMO_ACCOUNTS", "false").lower() == "true"

    if is_production and not allow_demo:
        if any(demo in email_clean for demo in ("evaluator", "guest")):
            raise HTTPException(
                status_code=403,
                detail="Demo accounts are disabled in production environment."
            )
    user = execute_query(
        "SELECT * FROM users WHERE LOWER(email) = ?",
        (email_clean,), fetch="one"
    )

    # Generic success response to prevent user enumeration
    generic_response = {
        "status": "success",
        "message": "If this email is registered, a password recovery link has been sent.",
    }

    if not user:
        return generic_response

    # Generate cryptographically secure token
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    expiry = time.time() + 900  # 15 minutes

    execute_write(
        "INSERT INTO reset_tokens (token_hash, user_internal_id, created_at, expires_at, used) VALUES (?, ?, ?, ?, ?)",
        (token_hash, user["id"], time.time(), expiry, 0)
    )

    # Send email (or local dev fallback)
    email_result = send_password_reset_email(
        to_email=email_clean,
        reset_token=raw_token,
        expires_minutes=15,
    )

    # In production, never return the token in the API response
    if email_result["provider"] == "local_dev":
        return {
            "status": "success",
            "message": email_result["message"],
            "reset_token": email_result["reset_token"],
            "reset_link": email_result.get("reset_link", ""),
            "expires_in_minutes": 15,
            "_dev_mode": True,
        }
    else:
        return generic_response


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    """Reset password using a valid, unused, non-expired token."""
    raw_token = req.reset_token.strip()
    token_hash = _hash_token(raw_token)

    token_data = execute_query(
        "SELECT * FROM reset_tokens WHERE token_hash = ?",
        (token_hash,), fetch="one"
    )

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or non-existent password reset token.")

    if token_data["used"] == 1:
        raise HTTPException(status_code=400, detail="This reset token has already been used. Please request a new one.")

    if time.time() > token_data["expires_at"]:
        raise HTTPException(status_code=400, detail="This reset token has expired. Reset tokens are valid for 15 minutes.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = execute_query(
        "SELECT * FROM users WHERE id = ?",
        (token_data["user_internal_id"],), fetch="one"
    )
    if not user:
        raise HTTPException(status_code=404, detail="User associated with token not found.")

    # Update password and mark token as used
    new_hash = hash_password(req.new_password)
    now = time.strftime("%Y-%m-%dT%H:%M:%S")
    execute_write(
        "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
        (new_hash, now, user["id"])
    )
    execute_write(
        "UPDATE reset_tokens SET used = 1 WHERE token_hash = ?",
        (token_hash,)
    )

    return {
        "status": "success",
        "message": "Password has been successfully reset. You may now sign in with your new password."
    }


@router.post("/logout")
def logout(token: Optional[str] = None):
    """Invalidate a session token."""
    if token:
        execute_write("DELETE FROM sessions WHERE token = ?", (token,))
    return {"status": "success", "message": "Logged out successfully."}


# ---------------------------------------------------------------------------
# Backward-compatible legacy login (email-based, for existing tests)
# Will attempt user_id match, then email match
# ---------------------------------------------------------------------------

class LegacyLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login-legacy")
def login_legacy(req: LegacyLoginRequest, request: Request):
    """Legacy email-based login for backward compatibility."""
    email_clean = req.email.strip().lower()

    # Production Demo Account Protection
    is_production = os.environ.get("ENVIRONMENT", "development").lower() == "production"
    allow_demo = os.environ.get("ALLOW_DEMO_ACCOUNTS", "false").lower() == "true"

    if is_production and not allow_demo:
        if any(demo in email_clean for demo in ("evaluator", "guest")):
            raise HTTPException(
                status_code=403,
                detail="Demo accounts are disabled in production environment."
            )

    # Try by email first
    user = execute_query(
        "SELECT * FROM users WHERE LOWER(email) = ?",
        (email_clean,), fetch="one"
    )

    # Fallback: try the email prefix as user_id
    if not user:
        uid = email_clean.split("@")[0]
        user = execute_query(
            "SELECT * FROM users WHERE LOWER(user_id) = ?",
            (uid,), fetch="one"
        )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = f"trio_sess_{uuid.uuid4()}"
    expiry = time.time() + 86400
    now = time.strftime("%Y-%m-%dT%H:%M:%S")

    execute_write(
        "INSERT INTO sessions (token, user_internal_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, user["id"], now, expiry)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": user["id"],
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "affiliation": user["affiliation"],
        }
    }
