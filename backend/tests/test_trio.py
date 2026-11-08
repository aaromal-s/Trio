"""
TRIO AI Discovery Platform - Comprehensive Test Suite
Tests ML algorithms, Tri-Memory transitions, Contradiction Scoring, Candidate Discovery, and API Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
import numpy as np
import pandas as pd

from app.main import app
from app.ml.synthetic_generator import generate_synthetic_industrial_data
from app.ml.preprocessor import DataPreprocessor
from app.ml.trio_model import TRIOModel
from app.ml.evaluator import ModelEvaluator
from app.ml.baselines import BaselinePipelines
from app.services.state_service import state_service

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "TRIO" in data["service"]

def test_synthetic_data_generation():
    df = generate_synthetic_industrial_data(n_samples=500, seed=42)
    assert len(df) == 500
    assert "FIT101" in df.columns
    assert "DPIT301" in df.columns
    assert "is_unknown" in df.columns
    assert df["is_unknown"].sum() > 0 # Contains unknown state observations

def test_preprocessor_chronological_split():
    df = generate_synthetic_industrial_data(n_samples=200, seed=42)
    prep = DataPreprocessor(train_ratio=0.7)
    train_df, test_df = prep.chronological_split(df)
    assert len(train_df) == 140
    assert len(test_df) == 60
    # Strict chronological order check
    assert train_df.iloc[-1]["timestamp"] < test_df.iloc[0]["timestamp"]

def test_trio_model_tri_memory():
    df = generate_synthetic_industrial_data(n_samples=400, seed=42)
    prep = DataPreprocessor()
    features = ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"]
    train_df, test_df = prep.chronological_split(df, 0.7)
    
    X_train_scaled = prep.fit_transform_train(train_df, features)
    X_test_scaled = prep.transform_test(test_df)
    
    model = TRIOModel(alpha=0.45, beta=0.30, gamma=0.25)
    model.train(X_train_scaled, features, n_known_clusters=3)
    
    assert model.is_trained
    assert len(model.ltm.prototypes) == 3
    
    timestamps = test_df["timestamp"].tolist()
    res = model.process_stream(X_test_scaled, timestamps)
    
    assert res["processed_count"] == len(test_df)
    assert len(model.stm.buffer) > 0
    assert len(res["contradiction_scores"]) == len(test_df)

def test_contradiction_scoring_formula():
    model = TRIOModel(alpha=0.5, beta=0.3, gamma=0.2)
    X_fake = np.zeros((50, 4))
    model.train(X_fake, ["F1", "F2", "F3", "F4"], n_known_clusters=2)
    
    obs = np.array([5.0, 5.0, 5.0, 5.0])
    stm_win = np.zeros((5, 4))
    score, breakdown = model.compute_contradiction_score(obs, stm_win)
    
    assert 0.0 <= score <= 1.0
    assert 0.0 <= breakdown["D"] <= 1.0
    assert 0.0 <= breakdown["T"] <= 1.0
    assert 0.0 <= breakdown["A"] <= 1.0

def test_evaluator_metrics():
    y_true = [0, 0, 0, 1, 1, 1, 0, 0]
    y_pred = [0, 0, 0, 1, 1, 0, 0, 1]
    metrics = ModelEvaluator.compute_metrics(y_true, y_pred, runtime_ms=15.2, model_name="TestModel")
    
    assert metrics["precision"] > 0.0
    assert metrics["recall"] > 0.0
    assert metrics["f1_score"] > 0.0
    assert metrics["runtime_ms"] == 15.2
    assert "ari" in metrics
    assert "nmi" in metrics

def test_api_dashboard_overview():
    res = client.get("/api/dashboard/overview")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert data["kpis"]["observations_processed"] > 0
    assert "state_distribution" in data
    assert "contradiction_trend" in data
    assert "sensor_trends" in data

def test_api_memory_inspection():
    res = client.get("/api/memory/status")
    assert res.status_code == 200
    data = res.json()
    assert "stm" in data
    assert "ltm" in data
    assert "cm" in data

def test_api_discoveries_and_status_update():
    res = client.get("/api/discoveries")
    assert res.status_code == 200
    data = res.json()
    assert "candidates" in data
    if len(data["candidates"]) > 0:
        cand_id = data["candidates"][0]["candidate_id"]
        # Test status update
        up_res = client.post(f"/api/discoveries/{cand_id}/status", json={"status": "Confirmed"})
        assert up_res.status_code == 200
        assert up_res.json()["updated_status"] == "Confirmed"

def test_api_evaluation_benchmark_and_csv():
    res = client.get("/api/evaluation/benchmark")
    assert res.status_code == 200
    data = res.json()
    assert len(data["metrics"]) >= 4 # TRIO, K-Means, DBSCAN, Isolation Forest
    
    csv_res = client.get("/api/evaluation/export-csv")
    assert csv_res.status_code == 200
    assert "TRIO" in csv_res.text

