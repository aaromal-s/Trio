import os
import json
import joblib
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from app.core.config import settings

_predictor_bundle = None
_iso_bundle = None

def get_predictor_bundle():
    global _predictor_bundle
    if _predictor_bundle is None:
        if not os.path.exists(settings.MODEL_FILE):
            from app.ml.train import train_and_evaluate_models
            train_and_evaluate_models()
        _predictor_bundle = joblib.load(settings.MODEL_FILE)
    return _predictor_bundle

def get_iso_bundle():
    global _iso_bundle
    if _iso_bundle is None:
        iso_file = os.path.join(settings.MODEL_DIR, "isolation_forest.joblib")
        if not os.path.exists(iso_file):
            from app.ml.train import train_and_evaluate_models
            train_and_evaluate_models()
        _iso_bundle = joblib.load(iso_file)
    return _iso_bundle

def extract_features(input_data: Dict[str, float]) -> np.ndarray:
    """
    Extracts raw 7 features and derives 3 engineered features.
    """
    cpu = float(input_data.get("cpu_utilization", 25.0))
    mem = float(input_data.get("memory_utilization", 45.0))
    lat = float(input_data.get("latency_ms", 40.0))
    rps = float(input_data.get("request_throughput", 500.0))
    err = float(input_data.get("error_rate", 0.1))
    dio = float(input_data.get("disk_io_percent", 20.0))
    net = float(input_data.get("network_mbps", 150.0))
    
    # Interaction terms
    cpu_lat = float(np.clip(cpu * (lat / 100.0), 0.0, 5000.0))
    err_rps = float(np.clip((err / 100.0) * rps, 0.0, 2000.0))
    strain = float(np.clip((cpu * 0.4) + (mem * 0.4) + (dio * 0.2), 0.0, 100.0))
    
    return np.array([[cpu, mem, lat, rps, err, dio, net, cpu_lat, err_rps, strain]])

def predict_incident_risk(input_data: Dict[str, Any]) -> Dict[str, Any]:
    bundle = get_predictor_bundle()
    iso = get_iso_bundle()
    
    model = bundle["model"]
    scaler = bundle["scaler"]
    feature_names = bundle["feature_names"]
    global_importances = bundle.get("feature_importances", {})
    
    # 1. Feature processing
    X_raw = extract_features(input_data)
    X_scaled = scaler.transform(X_raw)
    
    # 2. Risk Prediction (Calibrated Probability)
    probs = model.predict_proba(X_scaled)[0]
    risk_score = float(probs[1]) # probability of incident class
    
    # Severity categorization
    if risk_score >= 0.80:
        severity = "CRITICAL"
    elif risk_score >= 0.55:
        severity = "HIGH"
    elif risk_score >= 0.30:
        severity = "ELEVATED"
    else:
        severity = "NOMINAL"
        
    # 3. Unsupervised Anomaly Detection via Isolation Forest
    iso_model = iso["model"]
    iso_score_raw = iso_model.decision_function(X_scaled)[0]
    # In sklearn Isolation Forest, negative score indicates outlier/anomaly
    is_anomaly = bool(iso_score_raw < 0)
    # Normalize score between 0.0 and 1.0 for UI clarity (higher = more anomalous)
    normalized_anomaly_score = float(np.clip(0.5 - (iso_score_raw * 2.0), 0.0, 1.0))
    
    # 4. Feature Attribution: combine global feature importance with local strain weights
    feature_attribution = {}
    for i, name in enumerate(feature_names):
        weight = global_importances.get(name, 0.1)
        z_score = float(abs(X_scaled[0][i]))
        impact = round(weight * (1.0 + z_score * 0.5), 3)
        feature_attribution[name] = impact
        
    # Normalize attributions to sum to 100%
    tot = sum(feature_attribution.values()) or 1.0
    normalized_attribution = {k: round((v / tot) * 100.0, 1) for k, v in feature_attribution.items()}
    
    return {
        "service_name": input_data.get("service_name", "api-gateway"),
        "risk_score": round(risk_score, 4),
        "severity": severity,
        "horizon_minutes": 30,
        "confidence": round(float(np.max(probs)), 3),
        "anomaly_detected": is_anomaly,
        "anomaly_score": round(normalized_anomaly_score, 3),
        "feature_importances": normalized_attribution,
        "telemetry_input": {
            "cpu_utilization": float(X_raw[0][0]),
            "memory_utilization": float(X_raw[0][1]),
            "latency_ms": float(X_raw[0][2]),
            "request_throughput": float(X_raw[0][3]),
            "error_rate": float(X_raw[0][4]),
            "disk_io_percent": float(X_raw[0][5]),
            "network_mbps": float(X_raw[0][6]),
        },
        "model_version": bundle.get("version", "rf-v1.4.2"),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
