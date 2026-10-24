import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/v1/system/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ["HEALTHY", "DEGRADED"]
    assert data["database_connected"] is True
    assert data["ml_model_ready"] is True

def test_live_telemetry():
    resp = client.get("/api/v1/telemetry/live")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 8
    # verify microservice keys
    svc = data[0]
    assert "service_name" in svc
    assert "cpu_utilization" in svc
    assert "memory_utilization" in svc
    assert "latency_ms" in svc
    assert "request_throughput" in svc
    assert "error_rate" in svc
    assert "is_anomaly" in svc

def test_system_overview():
    resp = client.get("/api/v1/telemetry/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "overall_health" in data
    assert "overall_health_score" in data
    assert "total_services_monitored" in data

def test_service_topology():
    resp = client.get("/api/v1/infrastructure/topology")
    assert resp.status_code == 200
    data = resp.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 8
