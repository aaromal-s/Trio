import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_registration_and_login():
    unique_email = f"test_sre_{id(object())}@aegisops.ai"
    # 1. Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": "StrongPassword123!",
            "full_name": "Test SRE Officer",
            "role": "engineer",
            "department": "Platform Reliability"
        }
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    token = data["access_token"]
    
    # 2. Login
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "email": unique_email,
            "password": "StrongPassword123!"
        }
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()
    
    # 3. Read Profile (/me)
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == unique_email
    
    # 4. Update Profile
    update_resp = client.put(
        "/api/v1/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "Senior SRE Lead",
            "notification_slack": False
        }
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["full_name"] == "Senior SRE Lead"
    assert update_resp.json()["notification_slack"] is False

def test_invalid_login():
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@aegisops.ai", "password": "wrongpassword"}
    )
    assert resp.status_code == 401
    assert "Incorrect email or password" in resp.json()["detail"]
