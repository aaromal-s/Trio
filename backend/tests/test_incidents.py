import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_and_filter_incidents():
    resp = client.get("/api/v1/incidents/")
    assert resp.status_code == 200
    incidents = resp.json()
    assert len(incidents) >= 1
    
    first_id = incidents[0]["id"]
    detail_resp = client.get(f"/api/v1/incidents/{first_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == first_id
    assert "timeline_events" in detail
    assert "recommended_remediation" in detail

def test_incident_approval_workflow():
    # 1. Create a dedicated incident for approval testing
    create_resp = client.post(
        "/api/v1/incidents/",
        json={
            "title": "Database Read Replica Stagnation",
            "service_name": "postgres-replica",
            "severity": "P2-High",
            "status": "INVESTIGATING",
            "cpu_usage": 74.0,
            "memory_usage": 65.0,
            "latency_p99": 280.0,
            "error_rate": 1.2,
            "description": "WAL replication lag exceeding 120 seconds",
            "root_cause_candidate": "Slow disk I/O on replica volume"
        }
    )
    assert create_resp.status_code == 201
    inc_id = create_resp.json()["id"]
    
    # 2. Approve remediation
    appr_resp = client.post(
        f"/api/v1/incidents/{inc_id}/approve",
        json={"action": "APPROVE"}
    )
    assert appr_resp.status_code == 200
    updated = appr_resp.json()
    assert updated["approval_status"] == "APPROVED"
    assert updated["status"] == "MITIGATING"
    assert updated["execution_result"] is not None

def test_incident_rejection_workflow():
    # 1. Create incident
    create_resp = client.post(
        "/api/v1/incidents/",
        json={
            "title": "Minor Cache Eviction Surge",
            "service_name": "redis-cluster",
            "severity": "P3-Medium",
            "status": "DETECTED",
            "cpu_usage": 45.0,
            "memory_usage": 55.0,
            "latency_p99": 45.0,
            "error_rate": 0.0,
            "description": "Elevated key eviction rate"
        }
    )
    assert create_resp.status_code == 201
    inc_id = create_resp.json()["id"]
    
    # 2. Reject
    rej_resp = client.post(
        f"/api/v1/incidents/{inc_id}/approve",
        json={"action": "REJECT", "rejection_reason": "Expected TTL flush cycle"}
    )
    assert rej_resp.status_code == 200
    assert rej_resp.json()["approval_status"] == "REJECTED"
    assert rej_resp.json()["rejection_reason"] == "Expected TTL flush cycle"
