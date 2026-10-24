import os
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.schemas.prediction import TelemetryInputFeatures, RiskPredictionOut, ModelEvaluationSummary
from app.ml.inference import predict_incident_risk
from app.models.prediction import RiskPrediction
from app.services.telemetry_simulator import SERVICES

router = APIRouter()

@router.post("/predict", response_model=RiskPredictionOut)
def predict_risk(features: TelemetryInputFeatures, db: Session = Depends(get_db)):
    """
    Evaluates incident probability and anomaly score for given telemetry input.
    """
    res = predict_incident_risk(features.model_dump())
    
    # Persist prediction
    record = RiskPrediction(
        service_name=res["service_name"],
        risk_score=res["risk_score"],
        severity=res["severity"],
        horizon_minutes=res["horizon_minutes"],
        confidence=res["confidence"],
        feature_importances=res["feature_importances"],
        telemetry_input=res["telemetry_input"],
        anomaly_detected=res["anomaly_detected"],
        anomaly_score=res["anomaly_score"],
        model_version=res["model_version"],
        timestamp=datetime.now(timezone.utc)
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    res["id"] = record.id
    return res

@router.get("/latest", response_model=List[RiskPredictionOut])
def get_latest_predictions():
    """
    Returns latest risk predictions across all 8 microservices.
    """
    predictions = []
    from app.services.telemetry_simulator import generate_current_telemetry_snapshot
    now = datetime.now(timezone.utc)
    
    for srv in SERVICES:
        snap = generate_current_telemetry_snapshot(srv, now)
        pred = predict_incident_risk(snap)
        predictions.append(pred)
        
    return predictions

@router.get("/model-evaluation", response_model=Dict[str, Any])
def get_model_evaluation_metrics():
    """
    Returns verified benchmark metrics calculated on held-out test split.
    """
    if not os.path.exists(settings.METRICS_FILE):
        from app.ml.train import train_and_evaluate_models
        train_and_evaluate_models()
        
    with open(settings.METRICS_FILE, "r") as f:
        metrics = json.load(f)
        
    return metrics
