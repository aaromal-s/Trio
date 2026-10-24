import pytest
import numpy as np
from app.ml.dataset import generate_telemetry_dataset
from app.ml.inference import predict_incident_risk, extract_features
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dataset_generation_quality():
    X, y, feature_names, meta = generate_telemetry_dataset(n_samples=500, incident_ratio=0.15, random_seed=99)
    assert X.shape[0] == 500
    assert X.shape[1] == 10
    assert len(y) == 500
    assert not np.isnan(X).any()
    assert not np.isinf(X).any()
    assert meta["n_samples"] == 500

def test_predict_incident_risk_nominal():
    nominal_input = {
        "service_name": "inventory-service",
        "cpu_utilization": 22.0,
        "memory_utilization": 40.0,
        "latency_ms": 18.0,
        "request_throughput": 400.0,
        "error_rate": 0.01,
        "disk_io_percent": 15.0,
        "network_mbps": 120.0
    }
    pred = predict_incident_risk(nominal_input)
    assert 0.0 <= pred["risk_score"] <= 1.0
    assert pred["severity"] in ["NOMINAL", "ELEVATED", "HIGH", "CRITICAL"]
    assert "anomaly_detected" in pred
    assert "feature_importances" in pred
    assert pred["service_name"] == "inventory-service"

def test_predict_incident_risk_critical():
    critical_input = {
        "service_name": "payment-processor",
        "cpu_utilization": 96.0,
        "memory_utilization": 98.0,
        "latency_ms": 1400.0,
        "request_throughput": 2200.0,
        "error_rate": 18.5,
        "disk_io_percent": 95.0,
        "network_mbps": 650.0
    }
    pred = predict_incident_risk(critical_input)
    assert pred["risk_score"] > 0.70
    assert pred["severity"] in ["HIGH", "CRITICAL"]

def test_model_evaluation_metrics_endpoint():
    resp = client.get("/api/v1/predictions/model-evaluation")
    assert resp.status_code == 200
    data = resp.json()
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "confusion_matrix" in data
    # Verified target accuracy >= 95%
    assert data["accuracy"] >= 0.95
    assert data["verified_truth"] is True
