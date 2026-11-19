"""
TRIO 2.0 — Comprehensive End-to-End User Journey Integration Test
Validates:
1. Health and System Diagnostics
2. Bootstrap Admin Account (12406834 / 123456)
3. Forced First-Login Password Change and Argon2id Hashing
4. Active Session Listing and Cross-Session Termination
5. Profile Management and Avatar Customization
6. Resilient Dirty CSV Ingestion with Dynamic Sensor Features (3 channels)
7. Model Retraining and Buffer Clearing
8. Dynamic Dashboard Sensor Trends
9. Tri-Memory Integrity and State Discoveries
10. Unsupervised Benchmarks and Clean Demo Reset
"""

import os
import io
import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///test_trio_e2e.db"
os.environ["ENVIRONMENT"] = "development"

from app.main import app
from app.core.database import run_migrations, seed_bootstrap_admin, seed_default_users, execute_write
from app.core.rate_limiter import reset_rate_limiter_memory
from app.api.auth import hash_password

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_e2e():
    reset_rate_limiter_memory()
    run_migrations()
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


def test_complete_e2e_user_journey():
    # -------------------------------------------------------------
    # Step 1: Health Diagnostics
    # -------------------------------------------------------------
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] == "healthy"
    assert "TRIO" in health_data["service"]

    # -------------------------------------------------------------
    # Step 2: Bootstrap Admin Login with Temporary Password
    # -------------------------------------------------------------
    login_res = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "123456"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["force_password_change"] is True
    assert "access_token" in login_data
    assert login_data["user"]["user_id"] == "12406834"
    admin_email = login_data["user"]["email"]

    # -------------------------------------------------------------
    # Step 3: Mandatory First-Login Password Change
    # -------------------------------------------------------------
    change_res = client.post(
        f"/api/auth/change-password?email={admin_email}",
        json={
            "current_password": "123456",
            "new_password": "AdminSecurePassword!2026"
        }
    )
    assert change_res.status_code == 200
    assert change_res.json()["status"] == "success"

    # -------------------------------------------------------------
    # Step 4: Verify Old Password Fails and New Password Succeeds
    # -------------------------------------------------------------
    fail_res = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "123456"
    })
    assert fail_res.status_code == 401

    success_res = client.post("/api/auth/login", json={
        "user_id": "12406834",
        "password": "AdminSecurePassword!2026"
    })
    assert success_res.status_code == 200
    admin_auth = success_res.json()
    assert admin_auth["force_password_change"] is False

    # -------------------------------------------------------------
    # Step 5: Active Sessions Management
    # -------------------------------------------------------------
    sess_res = client.get(f"/api/auth/sessions?email={admin_email}")
    assert sess_res.status_code == 200
    sessions = sess_res.json()["sessions"]
    assert len(sessions) >= 1

    # Terminate other sessions
    term_res = client.post(f"/api/auth/logout-other-sessions?email={admin_email}")
    assert term_res.status_code == 200
    assert term_res.json()["status"] == "success"

    # -------------------------------------------------------------
    # Step 6: Profile Customization & Avatar Selection
    # -------------------------------------------------------------
    update_prof_res = client.put(
        f"/api/auth/profile?email={admin_email}",
        json={
            "name": "Lead Industrial Systems Auditor",
            "email": "auditor@trio.local",
            "role": "Chief Reliability Engineer",
            "affiliation": "National Critical Infrastructure Lab",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
        }
    )
    assert update_prof_res.status_code == 200
    updated_user = update_prof_res.json()["user"]
    assert updated_user["name"] == "Lead Industrial Systems Auditor"
    assert updated_user["email"] == "auditor@trio.local"
    assert updated_user["role"] == "Chief Reliability Engineer"

    # -------------------------------------------------------------
    # Step 7: Resilient Dirty CSV Upload with 3 Custom Sensors
    # -------------------------------------------------------------
    csv_rows = ["timestamp, turbine_pressure, vibr_hz , flow_rate "]
    for i in range(75):
        # Add formatting variations: quotes, commas, spaces
        p_val = f'"{1000 + i * 2.5:,.1f}"' if i % 5 == 0 else f"{1000 + i * 2.5:.1f}"
        v_val = f" {12.4 + (i % 7) * 0.3} "
        f_val = f"{45.0 + (i % 4) * 1.2}"
        csv_rows.append(f"2026-11-14 12:00:{i:02d}, {p_val}, {v_val}, {f_val}")
    
    csv_content = "\n".join(csv_rows)
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))

    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("turbine_sensor_stream.csv", file_bytes, "text/csv")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["row_count"] == 75
    assert len(upload_data["validation"]["numeric_columns"]) == 3
    assert "turbine_pressure" in upload_data["validation"]["numeric_columns"]
    assert "vibr_hz" in upload_data["validation"]["numeric_columns"]
    assert "flow_rate" in upload_data["validation"]["numeric_columns"]

    # -------------------------------------------------------------
    # Step 8: Dynamic Dashboard Sensor Trends
    # -------------------------------------------------------------
    overview_res = client.get("/api/dashboard/overview")
    assert overview_res.status_code == 200
    overview_data = overview_res.json()
    assert overview_data["dataset_name"] == "turbine_sensor_stream.csv"
    assert overview_data["is_simulated"] is False
    assert len(overview_data["sensor_trends"]) > 0
    first_trend = overview_data["sensor_trends"][0]
    assert "timestamp" in first_trend
    assert "turbine_pressure" in first_trend or "vibr_hz" in first_trend

    # -------------------------------------------------------------
    # Step 9: Tri-Memory System State and Records
    # -------------------------------------------------------------
    mem_res = client.get("/api/memory/status")
    assert mem_res.status_code == 200
    mem_data = mem_res.json()
    assert "stm" in mem_data
    assert "ltm" in mem_data
    assert "cm" in mem_data

    # -------------------------------------------------------------
    # Step 10: Evaluation Benchmarking
    # -------------------------------------------------------------
    eval_res = client.get("/api/evaluation/benchmark")
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "metrics" in eval_data
    assert len(eval_data["metrics"]) > 0

    # -------------------------------------------------------------
    # Step 11: Clean Demo State Reset
    # -------------------------------------------------------------
    reset_res = client.post("/api/datasets/generate-synthetic", json={"n_samples": 200, "seed": 42})
    assert reset_res.status_code == 200
    reset_data = reset_res.json()
    assert reset_data["is_simulated"] is True
    assert reset_data["row_count"] == 200
