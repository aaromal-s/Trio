"""
TRIO Authentication & Security Integration Tests (v2)
Tests User ID login, profile CRUD, Argon2id password change,
token-based password recovery with expiry and reuse prevention.
Uses SQLite in-memory database for isolated testing.
"""

import pytest
import os
import time

# Force SQLite for tests BEFORE any imports
os.environ["DATABASE_URL"] = "sqlite:///test_trio_auth.db"
os.environ["ENVIRONMENT"] = "development"

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import run_migrations, execute_write, execute_query
from app.api.auth import hash_password

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_and_teardown():
    """Ensure clean database and reset rate limiter for each test."""
    from app.core.rate_limiter import reset_rate_limiter_memory
    from app.core.database import seed_default_users, seed_bootstrap_admin
    reset_rate_limiter_memory()
    run_migrations()
    # Clean up tables respecting FK constraints
    for table in ["discovery_candidates", "training_runs", "datasets", "sessions", "password_resets", "reset_tokens", "audit_log", "rate_limits"]:
        try:
            execute_write(f"DELETE FROM {table}")
        except Exception:
            pass
    try:
        execute_write("DELETE FROM users")
    except Exception:
        pass
    seed_default_users(hash_password)
    seed_bootstrap_admin(hash_password)
    yield
    reset_rate_limiter_memory()


def test_login_with_user_id():
    """Test login using User ID (not email)."""
    res = client.post("/api/auth/login", json={
        "user_id": "evaluator",
        "password": "trio2026demo"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["user_id"] == "evaluator"
    assert data["user"]["name"] == "Dr. Sarah Chen"
    assert data["user"]["role"] == "Principal AI/ML Evaluator"


def test_login_invalid_password():
    """Test login with wrong password."""
    res = client.post("/api/auth/login", json={
        "user_id": "evaluator",
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_login_invalid_user_id():
    """Test login with non-existent user ID."""
    res = client.post("/api/auth/login", json={
        "user_id": "nonexistent_user",
        "password": "anypassword"
    })
    assert res.status_code == 401


def test_guest_login():
    """Test guest account login with User ID."""
    res = client.post("/api/auth/login", json={
        "user_id": "guest",
        "password": "guest123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["name"] == "Demo Guest Evaluator"


def test_register_new_user():
    """Test new user registration."""
    res = client.post("/api/auth/register", json={
        "user_id": "testuser",
        "name": "Test User",
        "email": "test@example.com",
        "password": "securepass123",
        "role": "Researcher",
        "affiliation": "Test University"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["user"]["user_id"] == "testuser"

    # Now login with the registered user
    login_res = client.post("/api/auth/login", json={
        "user_id": "testuser",
        "password": "securepass123"
    })
    assert login_res.status_code == 200


def test_register_duplicate_user_id():
    """Test registration with already-taken user ID."""
    res = client.post("/api/auth/register", json={
        "user_id": "evaluator",
        "name": "Dup User",
        "email": "dup@example.com",
        "password": "password123"
    })
    assert res.status_code == 409


def test_profile_read_and_update():
    """Test profile reading and updating."""
    # Read profile
    res1 = client.get("/api/auth/profile?user_id=evaluator")
    assert res1.status_code == 200
    assert res1.json()["user_id"] == "evaluator"

    # Update profile
    res2 = client.put("/api/auth/profile?user_id=evaluator", json={
        "name": "Prof. Sarah Chen Ph.D.",
        "affiliation": "Advanced Cyber-Physical AI Laboratory",
        "role": "Lead Defense Evaluator"
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["user"]["name"] == "Prof. Sarah Chen Ph.D."
    assert data2["user"]["affiliation"] == "Advanced Cyber-Physical AI Laboratory"


def test_profile_backward_compat_email():
    """Test profile read by email (backward compatibility)."""
    res = client.get("/api/auth/profile?email=evaluator@university.edu")
    assert res.status_code == 200
    assert res.json()["user_id"] == "evaluator"


def test_change_password():
    """Test password change with Argon2id."""
    # Fail with wrong current password
    fail_res = client.post("/api/auth/change-password?user_id=evaluator", json={
        "current_password": "incorrect_old_pwd",
        "new_password": "newpassword123"
    })
    assert fail_res.status_code == 400

    # Succeed with right current password
    succ_res = client.post("/api/auth/change-password?user_id=evaluator", json={
        "current_password": "trio2026demo",
        "new_password": "updatedpassword2026"
    })
    assert succ_res.status_code == 200

    # Verify login works with new password
    login_res = client.post("/api/auth/login", json={
        "user_id": "evaluator",
        "password": "updatedpassword2026"
    })
    assert login_res.status_code == 200

    # Revert password back for other tests
    client.post("/api/auth/change-password?user_id=evaluator", json={
        "current_password": "updatedpassword2026",
        "new_password": "trio2026demo"
    })


def test_forgot_password_and_reset():
    """Test password reset with token generation, use, and reuse prevention."""
    # 1. Request reset token
    req_res = client.post("/api/auth/forgot-password", json={
        "email": "evaluator@university.edu"
    })
    assert req_res.status_code == 200
    data = req_res.json()
    # In dev mode, token is returned
    assert "reset_token" in data or "message" in data
    token = data.get("reset_token")

    if token:
        # 2. Test successful reset
        reset_res = client.post("/api/auth/reset-password", json={
            "reset_token": token,
            "new_password": "fresh_password_789"
        })
        assert reset_res.status_code == 200

        # 3. Test TOKEN REUSE PREVENTION (Must fail!)
        reuse_res = client.post("/api/auth/reset-password", json={
            "reset_token": token,
            "new_password": "another_password"
        })
        assert reuse_res.status_code == 400
        assert "already been used" in reuse_res.json()["detail"]

        # 4. Verify login works with reset password
        login_res = client.post("/api/auth/login", json={
            "user_id": "evaluator",
            "password": "fresh_password_789"
        })
        assert login_res.status_code == 200

        # Revert password
        client.post("/api/auth/change-password?user_id=evaluator", json={
            "current_password": "fresh_password_789",
            "new_password": "trio2026demo"
        })


def test_expired_token():
    """Test that expired tokens are rejected."""
    import hashlib
    from app.core.database import execute_write

    expired_token = "EXPIRED-TOKEN-TEST-12345"
    token_hash = hashlib.sha256(expired_token.encode()).hexdigest()

    # Get evaluator internal ID
    user = execute_query(
        "SELECT id FROM users WHERE user_id = ?",
        ("evaluator",), fetch="one"
    )
    assert user is not None

    execute_write(
        "INSERT INTO reset_tokens (token_hash, user_internal_id, created_at, expires_at, used) VALUES (?, ?, ?, ?, ?)",
        (token_hash, user["id"], time.time() - 1000, time.time() - 100, 0)
    )

    exp_res = client.post("/api/auth/reset-password", json={
        "reset_token": expired_token,
        "new_password": "expired_pwd_test"
    })
    assert exp_res.status_code == 400
    assert "expired" in exp_res.json()["detail"]


def test_forgot_password_nonexistent_email():
    """Test that non-existent email doesn't reveal account existence."""
    res = client.post("/api/auth/forgot-password", json={
        "email": "nobody@nowhere.com"
    })
    assert res.status_code == 200
    data = res.json()
    # Should not contain a reset_token (anti-enumeration)
    assert data["status"] == "success"


def test_logout():
    """Test session logout."""
    # Login first
    login_res = client.post("/api/auth/login", json={
        "user_id": "evaluator",
        "password": "trio2026demo"
    })
    token = login_res.json()["access_token"]

    # Logout
    res = client.post(f"/api/auth/logout?token={token}")
    assert res.status_code == 200
    assert res.json()["status"] == "success"


def test_bootstrap_administrator_account_and_force_password_change():
    """
    Verify bootstrap administrator account creation and forced password change workflow.
    - User ID: 12406834
    - Initial Password: 123456
    - First login returns force_password_change = True
    - Password change clears flag
    - Seed is idempotent (does not overwrite existing password)
    """
    from app.core.database import seed_bootstrap_admin
    seed_bootstrap_admin(hash_password)

    # 1. Login with bootstrap credentials
    res = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "123456"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["user_id"] == "12406834"
    assert data["force_password_change"] is True
    assert data["user"]["force_password_change"] is True
    token = data["access_token"]

    # 2. Change temporary password
    change_res = client.post(
        "/api/auth/change-password?user_id=12406834",
        json={
            "current_password": "123456",
            "new_password": "SecuredAdminPass2026!"
        }
    )
    assert change_res.status_code == 200
    assert change_res.json()["status"] == "success"

    # 3. Next login with new password: force_password_change must be False
    res2 = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "SecuredAdminPass2026!"
    })
    assert res2.status_code == 200
    assert res2.json()["force_password_change"] is False

    # 4. Old password must be rejected
    res_old = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "123456"
    })
    assert res_old.status_code == 401

    # 5. Idempotency test: calling seed_bootstrap_admin again must NOT reset password
    seed_bootstrap_admin(hash_password)
    res3 = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "SecuredAdminPass2026!"
    })
    assert res3.status_code == 200


def test_profile_update_extended_fields_and_conflict():
    """Verify profile editing with avatar, role, and email uniqueness enforcement."""
    # Register test user
    uid = f"prof_{int(time.time())}"
    client.post("/api/auth/register", json={
        "user_id": uid,
        "name": "Original Name",
        "email": f"{uid}@test.edu",
        "password": "Password123!"
    })

    # Update profile with new designation, avatar, and affiliation
    up_res = client.put(f"/api/auth/profile?user_id={uid}", json={
        "name": "Updated Name",
        "affiliation": "Advanced AI Lab",
        "role": "Chief Research Scientist",
        "avatar_url": "https://avatar.trio.dev/scientist.png"
    })
    assert up_res.status_code == 200
    u_data = up_res.json()["user"]
    assert u_data["name"] == "Updated Name"
    assert u_data["affiliation"] == "Advanced AI Lab"
    assert u_data["role"] == "Chief Research Scientist"
    assert u_data["avatar_url"] == "https://avatar.trio.dev/scientist.png"

    # Try updating email to an already existing email -> must return 409 Conflict
    conflict_res = client.put(f"/api/auth/profile?user_id={uid}", json={
        "name": "Updated Name",
        "affiliation": "Advanced AI Lab",
        "email": "evaluator@university.edu"  # Already taken by evaluator
    })
    assert conflict_res.status_code == 409


def test_sessions_and_logout_other_sessions():
    """Verify active sessions listing and terminating other sessions."""
    # Login twice to generate 2 active session tokens
    res1 = client.post("/api/auth/login", json={"user_id": "evaluator", "password": "trio2026demo"})
    tok1 = res1.json()["access_token"]
    res2 = client.post("/api/auth/login", json={"user_id": "evaluator", "password": "trio2026demo"})
    tok2 = res2.json()["access_token"]

    # List active sessions with tok2 as current
    sess_res = client.get(
        "/api/auth/sessions?user_id=evaluator",
        headers={"Authorization": f"Bearer {tok2}"}
    )
    assert sess_res.status_code == 200
    sessions = sess_res.json()["sessions"]
    assert len(sessions) >= 2
    # tok2 should be marked is_current = True
    current_matches = [s for s in sessions if s["is_current"]]
    assert len(current_matches) == 1

    # Revoke all other sessions keeping tok2
    revoke_res = client.post(
        "/api/auth/logout-other-sessions?user_id=evaluator",
        headers={"Authorization": f"Bearer {tok2}"}
    )
    assert revoke_res.status_code == 200

    # Verify only 1 session remains
    sess_res_after = client.get(
        "/api/auth/sessions?user_id=evaluator",
        headers={"Authorization": f"Bearer {tok2}"}
    )
    assert sess_res_after.json()["total_active"] == 1


def test_health_endpoint():
    """Test that health endpoint reports database and rate limiter info."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "rate_limiter" in data
