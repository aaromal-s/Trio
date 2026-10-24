import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_copilot_investigation_with_evidence_breakdown():
    resp = client.post(
        "/api/v1/copilot/investigate",
        json={
            "service_name": "payment-processor",
            "metrics_snapshot": {
                "cpu_utilization": 88.0,
                "memory_utilization": 94.0,
                "latency_ms": 680.0,
                "error_rate": 4.5,
                "disk_io_percent": 80.0,
                "request_throughput": 500.0
            }
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["service_name"] == "payment-processor"
    assert "investigation_summary" in data
    assert "evidence_breakdown" in data
    assert "candidate_root_causes" in data
    assert "recommended_diagnostics" in data
    assert "proposed_remediation" in data
    
    # Verify strict category presence (FACT, INFERENCE, HYPOTHESIS)
    categories = {item["category"] for item in data["evidence_breakdown"]}
    assert "FACT" in categories
    assert "INFERENCE" in categories
    assert "HYPOTHESIS" in categories
