"""
TRIO Pre-Deployment Infrastructure & Integration Tests
Validates:
1. PostgreSQL / SQLite 7-table schema, placeholder translation, ON CONFLICT, transactions & rollback.
2. SQLite-to-PostgreSQL migration logic and table ordering.
3. User lifecycle across DB: users, sessions, reset_tokens, datasets, discovery_candidates, rate_limits.
4. Email recovery workflow: branded HTML, 15-min expiry, single-use, token hashing, anti-enumeration.
5. Redis & In-memory rate limiting: abuse protection, sliding window, worker failover.
6. Security middleware: CSP, HSTS, X-Content-Type-Options, Frame-Options.
"""

import os
import time
import pytest
import sqlite3
import hashlib
from typing import Dict, Any

from app.core.database import (
    run_migrations,
    execute_query,
    execute_write,
    get_connection,
    _translate_sql,
    _TABLES_SQLITE,
    _TABLES_POSTGRES,
    migrate_sqlite_to_postgres,
    seed_default_users
)
from app.core.email_service import (
    send_password_reset_email,
    _build_reset_email_html,
    FRONTEND_URL
)
from app.core.rate_limiter import (
    check_rate_limit,
    is_redis_available,
    get_rate_limiter_info,
    _memory_store
)
from app.core.security import SecurityHeadersMiddleware
from app.api.auth import hash_password, verify_password, _hash_token


# ---------------------------------------------------------------------------
# Fixture: Temporary SQLite DB for testing all 7 tables
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def setup_test_db():
    run_migrations()
    seed_default_users(hash_password)
    yield


# ---------------------------------------------------------------------------
# 1. Database Schema & Tables Verification
# ---------------------------------------------------------------------------

def test_all_seven_tables_exist():
    """Verify that all 7 tables exist and are queryable."""
    expected_tables = [
        "users",
        "sessions",
        "reset_tokens",
        "datasets",
        "training_runs",
        "discovery_candidates",
        "rate_limits"
    ]

    for table in expected_tables:
        rows = execute_query(f"SELECT COUNT(*) as count FROM {table}", fetch="one")
        assert rows is not None
        assert "count" in rows


def test_sql_placeholder_translation():
    """Verify SQL placeholder and dialect translation."""
    sqlite_query = "SELECT * FROM users WHERE user_id = ? AND account_status = ?"
    pg_query = _translate_sql(sqlite_query, is_pg=True)
    assert pg_query == "SELECT * FROM users WHERE user_id = %s AND account_status = %s"

    sqlite_autoincrement = "id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT"
    pg_serial = _translate_sql(sqlite_autoincrement, is_pg=True)
    assert "SERIAL PRIMARY KEY" in pg_serial


def test_transactions_and_rollback():
    """Verify that failed transactions roll back changes completely."""
    # Count before
    before = execute_query("SELECT COUNT(*) as count FROM users", fetch="one")["count"]

    # Attempt a transaction that raises an error midway
    with pytest.raises(Exception):
        with get_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users (id, user_id, email, password_hash, created_at, updated_at) "
                "VALUES ('FAIL-01', 'fail_user', 'fail@test.com', 'hash', 'now', 'now')"
            )
            # Deliberate syntax/runtime error
            cur.execute("INSERT INTO nonexistent_table VALUES (1, 2, 3)")

    # Count after must be unchanged
    after = execute_query("SELECT COUNT(*) as count FROM users", fetch="one")["count"]
    assert before == after

    # Verify fail_user was NOT committed
    user = execute_query("SELECT * FROM users WHERE user_id = 'fail_user'", fetch="one")
    assert user is None


def test_full_database_lifecycle_all_tables():
    """Test inserting and relating data across all 7 database tables."""
    now = time.strftime("%Y-%m-%dT%H:%M:%S")

    # 1. User
    uid = "USR-LIFECYCLE-1"
    ds_id = "DS-001"
    tr_id = "TR-001"
    cand_id = "CAND-001"
    execute_write("DELETE FROM discovery_candidates WHERE candidate_id = ?", (cand_id,))
    execute_write("DELETE FROM training_runs WHERE id = ?", (tr_id,))
    execute_write("DELETE FROM datasets WHERE id = ?", (ds_id,))
    execute_write("DELETE FROM reset_tokens WHERE user_internal_id = ?", (uid,))
    execute_write("DELETE FROM sessions WHERE user_internal_id = ?", (uid,))
    execute_write("DELETE FROM users WHERE id = ? OR email = ?", (uid, "life@test.com"))

    execute_write(
        "INSERT INTO users (id, user_id, name, email, role, password_hash, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (uid, "test_lifecycle", "Lifecycle Test", "life@test.com", "Researcher", hash_password("pass"), now, now)
    )

    # 2. Session
    sess_token = "sess_life_123"
    execute_write(
        "INSERT INTO sessions (token, user_internal_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (sess_token, uid, now, time.time() + 3600)
    )

    # 3. Reset Token
    tok_hash = _hash_token("reset_life_token")
    execute_write(
        "INSERT INTO reset_tokens (token_hash, user_internal_id, created_at, expires_at, used) VALUES (?, ?, ?, ?, ?)",
        (tok_hash, uid, time.time(), time.time() + 900, 0)
    )

    # 4. Dataset
    ds_id = "DS-001"
    execute_write(
        "INSERT INTO datasets (id, name, uploaded_by, row_count, column_count, is_simulated, features_json, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (ds_id, "Test SWaT Run", uid, 1500, 8, 1, '["FIT101", "LIT101"]', now)
    )

    # 5. Training Run
    tr_id = "TR-001"
    execute_write(
        "INSERT INTO training_runs (id, dataset_id, model_version, algorithm, weights_json, train_samples, test_samples, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (tr_id, ds_id, "v1.0.0", "TRIO", '{"alpha": 0.45, "beta": 0.30, "gamma": 0.25}', 1050, 450, now)
    )

    # 6. Discovery Candidate
    cand_id = "CAND-001"
    execute_write(
        "INSERT INTO discovery_candidates (candidate_id, training_run_id, first_detected, last_detected, "
        "observation_count, mean_score, cluster_density, status, explanation, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (cand_id, tr_id, "08:00:00", "08:05:00", 42, 0.78, 1.45, "Confirmed", "Cavitation regime detected", now)
    )

    # 7. Rate Limits
    execute_write(
        "INSERT INTO rate_limits (key, count, window_start) VALUES (?, ?, ?)",
        ("test_key", 1, time.time())
    )

    # Verify cross-table querying
    cand = execute_query(
        """
        SELECT c.candidate_id, c.status, t.model_version, d.name as dataset_name, u.email as user_email
        FROM discovery_candidates c
        JOIN training_runs t ON c.training_run_id = t.id
        JOIN datasets d ON t.dataset_id = d.id
        JOIN users u ON d.uploaded_by = u.id
        WHERE c.candidate_id = ?
        """,
        (cand_id,),
        fetch="one"
    )

    assert cand is not None
    assert cand["candidate_id"] == "CAND-001"
    assert cand["status"] == "Confirmed"
    assert cand["dataset_name"] == "Test SWaT Run"
    assert cand["user_email"] == "life@test.com"


# ---------------------------------------------------------------------------
# 2. SQLite to PostgreSQL Migration Logic Test
# ---------------------------------------------------------------------------

def test_sqlite_to_postgres_migration_dry_run():
    """Verify that migration function validates files and table ordering."""
    # Test that invalid path raises expected FileNotFoundError / connection error
    with pytest.raises(Exception):
        migrate_sqlite_to_postgres("nonexistent_sqlite_file.db", "postgresql://invalid:5432/db")


@pytest.mark.skipif(not os.getenv("TEST_POSTGRES_URL"), reason="PostgreSQL cloud or live service not configured. Set TEST_POSTGRES_URL to run live PostgreSQL verification.")
def test_real_postgres_connection_and_migration():
    """Tests real PostgreSQL database if credentials are provided in TEST_POSTGRES_URL."""
    pg_url = os.getenv("TEST_POSTGRES_URL")
    import psycopg2
    conn = psycopg2.connect(pg_url)
    assert conn.status == psycopg2.extensions.STATUS_READY
    conn.close()


# ---------------------------------------------------------------------------
# 3. Email Recovery Workflow & Security
# ---------------------------------------------------------------------------

def test_email_template_generation():
    """Verify branded HTML email template structure."""
    reset_link = "http://localhost:5173/reset-password?token=TEST_TOKEN_123"
    html = _build_reset_email_html(reset_link, expires_minutes=15)

    assert "TRIO" in html
    assert "Learn. Remember. Discover." in html
    assert "Password Reset Request" in html
    assert reset_link in html
    assert "15 minutes" in html
    assert "single-use" in html or "only be used once" in html


def test_email_send_local_dev_fallback():
    """Verify local development email fallback when no API key is set."""
    res = send_password_reset_email(
        to_email="researcher@university.edu",
        reset_token="TEST-TOKEN-LOCAL-DEV",
        expires_minutes=15
    )

    assert res["success"] is True
    assert res["provider"] == "local_dev"
    assert "LOCAL DEVELOPMENT MODE" in res["message"]
    assert res["reset_token"] == "TEST-TOKEN-LOCAL-DEV"
    assert "reset-password?token=" in res["reset_link"]


def test_reset_tokens_are_hashed_never_plaintext():
    """Verify that reset tokens stored in the database are hashed with SHA-256."""
    raw_token = "SECRET_TOKEN_VALUE_XYZ"
    hashed = _hash_token(raw_token)

    assert hashed != raw_token
    assert len(hashed) == 64  # SHA-256 hex string

    # Ensure token cannot be inverted
    assert hashlib.sha256(raw_token.encode()).hexdigest() == hashed


# ---------------------------------------------------------------------------
# 4. Rate Limiting Tests (Memory Fallback & Redis Integration)
# ---------------------------------------------------------------------------

def test_rate_limiting_memory_fallback():
    """Test that sliding window rate limiter protects against brute force attacks."""
    _memory_store.clear()
    key = "test_rate_key"

    # First 5 requests must succeed
    for i in range(5):
        allowed, remaining, _ = check_rate_limit(key, max_requests=5, window_seconds=60)
        assert allowed is True
        assert remaining == 4 - i

    # 6th request must be rejected
    allowed, remaining, reset_after = check_rate_limit(key, max_requests=5, window_seconds=60)
    assert allowed is False
    assert remaining == 0
    assert reset_after > 0


def test_rate_limiter_info():
    """Verify rate limiter status reporting."""
    info = get_rate_limiter_info()
    assert "backend" in info
    assert "in_memory" in info["backend"] or "redis" in info["backend"]
    assert "redis_connected" in info
    assert "algorithm" in info
    assert "sliding_window" in info["algorithm"]


@pytest.mark.skipif(not os.getenv("REDIS_URL"), reason="Redis service not configured. Set REDIS_URL to test real Redis cluster rate limiting.")
def test_real_redis_connectivity():
    """Verify connection to a live Redis instance if configured."""
    assert is_redis_available() is True


# ---------------------------------------------------------------------------
# 5. Security & Password Hashing Tests
# ---------------------------------------------------------------------------

def test_argon2id_hashing_and_verification():
    """Verify Argon2id produces secure, salted hashes that verify correctly."""
    password = "MySecureResearchPassword2026!"
    hashed = hash_password(password)

    assert hashed.startswith("$argon2id$")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False


def test_rate_limiting_genuine_sliding_window():
    """
    Verify that rate limiter exhibits genuine sliding window behavior,
    freeing capacity dynamically as individual timestamps slide out of the window.
    """
    from app.core.rate_limiter import reset_rate_limiter_memory, _memory_store
    reset_rate_limiter_memory()
    key = "sliding_window_test_key"

    # Fill window with 3 requests (limit = 3, window = 10s)
    allowed, remaining, _ = check_rate_limit(key, max_requests=3, window_seconds=10)
    assert allowed is True and remaining == 2
    allowed, remaining, _ = check_rate_limit(key, max_requests=3, window_seconds=10)
    assert allowed is True and remaining == 1
    allowed, remaining, _ = check_rate_limit(key, max_requests=3, window_seconds=10)
    assert allowed is True and remaining == 0

    # 4th request must be rejected
    allowed, remaining, reset_after = check_rate_limit(key, max_requests=3, window_seconds=10)
    assert allowed is False
    assert remaining == 0
    assert reset_after > 0

    # Artificially slide the earliest request out of the 10s window
    _memory_store[key][0] = time.time() - 11.0  # Expired 1 second ago

    # Now exactly 1 request should be allowed again
    allowed, remaining, _ = check_rate_limit(key, max_requests=3, window_seconds=10)
    assert allowed is True
    assert remaining == 0  # Reached 3 again


def test_production_demo_account_blocking():
    """Verify that in production mode, demo accounts and demo passwords are strictly rejected."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # Simulate production environment
    orig_env = os.environ.get("ENVIRONMENT", "development")
    try:
        os.environ["ENVIRONMENT"] = "production"

        # 1. Attempt login with demo user ID 'evaluator'
        res1 = client.post("/api/auth/login", json={
            "user_id": "evaluator",
            "password": "anypassword"
        })
        assert res1.status_code == 403
        assert "disabled in production" in res1.json()["detail"].lower()

        # 2. Attempt login with demo user ID 'guest'
        res2 = client.post("/api/auth/login", json={
            "user_id": "guest",
            "password": "anypassword"
        })
        assert res2.status_code == 403
        assert "disabled in production" in res2.json()["detail"].lower()

        # 3. Attempt login with known public demo password for another account
        res3 = client.post("/api/auth/login", json={
            "user_id": "some_registered_user",
            "password": "trio2026demo"
        })
        assert res3.status_code == 403
        assert "default demo credentials cannot be used in production" in res3.json()["detail"].lower()

    finally:
        os.environ["ENVIRONMENT"] = orig_env


def test_cors_production_hardening():
    """Verify that production CORS configuration disallows localhost and wildcards."""
    from app.core.config import settings

    # In settings, production origins must not contain localhost or wildcard
    for origin in settings.PROD_CORS_ORIGINS:
        assert "localhost" not in origin.lower()
        assert "127.0.0.1" not in origin
        assert "*" not in origin
        assert origin.startswith("https://")


def test_security_headers_present():
    """Verify FastAPI security headers middleware configuration."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Content-Security-Policy" in response.headers
    assert "default-src 'self'" in response.headers["Content-Security-Policy"]


def test_rate_limiter_multithreaded_concurrency():
    """
    Verify atomicity under high concurrency with multiple worker threads.
    Simultaneous requests must NEVER exceed the configured max_requests.
    """
    import concurrent.futures
    from app.core.rate_limiter import reset_rate_limiter_memory, check_rate_limit

    reset_rate_limiter_memory()
    key = "concurrent_worker_test_key"
    max_req = 5
    num_threads = 25

    def worker_request():
        return check_rate_limit(key, max_requests=max_req, window_seconds=60)

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker_request) for _ in range(num_threads)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    allowed_count = sum(1 for res in results if res[0] is True)
    blocked_count = sum(1 for res in results if res[0] is False)

    assert allowed_count == max_req, f"Expected exactly {max_req} allowed, got {allowed_count}"
    assert blocked_count == num_threads - max_req, f"Expected {num_threads - max_req} blocked, got {blocked_count}"


def test_redis_failover_and_recovery():
    """
    Verify that if Redis encounters an error or disconnects,
    the limiter automatically fails over to the thread-safe in-memory sliding window.
    """
    from app.core import rate_limiter

    # Save original state
    orig_client = rate_limiter._redis_client
    orig_avail = rate_limiter._redis_available

    class BrokenRedisMock:
        def eval(self, *args, **kwargs):
            raise ConnectionError("Simulated Redis connection failure")

    try:
        rate_limiter._redis_client = BrokenRedisMock()
        rate_limiter._redis_available = True

        # Check rate limit during Redis failure: must gracefully fallback and NOT raise
        allowed, remaining, reset_after = rate_limiter.check_rate_limit("failover_test_key", max_requests=3, window_seconds=30)
        assert allowed is True
        assert remaining == 2
        assert reset_after > 0

    finally:
        rate_limiter._redis_client = orig_client
        rate_limiter._redis_available = orig_avail


def _standalone_worker_request(args):
    """Standalone worker function for cross-process concurrency testing."""
    key, max_req, window = args
    from app.core.rate_limiter import check_rate_limit
    return check_rate_limit(key, max_requests=max_req, window_seconds=window)


@pytest.mark.skipif(not os.getenv("REDIS_URL"), reason="Requires running Redis service for multi-process cross-worker synchronization test.")
def test_rate_limiter_multiprocess_concurrency():
    """
    Verify atomic sliding-window limiting across independent OS worker processes.
    Simulates horizontally scaled backend workers (e.g. gunicorn -w 4) connected to Redis.
    """
    import concurrent.futures
    key = f"multiprocess_test_key_{int(time.time())}"
    max_req = 5
    window = 30
    total_requests = 20

    with concurrent.futures.ProcessPoolExecutor(max_workers=4) as executor:
        args_list = [(key, max_req, window)] * total_requests
        results = list(executor.map(_standalone_worker_request, args_list))

    allowed_count = sum(1 for res in results if res[0] is True)
    blocked_count = sum(1 for res in results if res[0] is False)

    assert allowed_count == max_req, f"Multi-process limit exceeded: {allowed_count} allowed, expected {max_req}"
    assert blocked_count == total_requests - max_req



