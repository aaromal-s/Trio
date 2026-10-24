from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict

class TelemetryInputFeatures(BaseModel):
    service_name: str
    cpu_utilization: float = Field(..., ge=0.0, le=100.0)
    memory_utilization: float = Field(..., ge=0.0, le=100.0)
    latency_ms: float = Field(..., ge=0.0)
    request_throughput: float = Field(..., ge=0.0)
    error_rate: float = Field(..., ge=0.0, le=100.0)
    disk_io_percent: Optional[float] = 25.0
    network_mbps: Optional[float] = 120.0

class RiskPredictionOut(BaseModel):
    id: Optional[int] = None
    service_name: str
    risk_score: float # 0.0 to 1.0 calibrated probability
    severity: str # CRITICAL, HIGH, ELEVATED, NOMINAL
    horizon_minutes: int
    confidence: float
    feature_importances: Dict[str, float]
    telemetry_input: Dict[str, Any]
    anomaly_detected: bool
    anomaly_score: float
    model_version: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class ModelEvaluationSummary(BaseModel):
    model_name: str
    model_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None
    false_positive_rate: float
    false_negative_rate: float
    confusion_matrix: Dict[str, Any]
    train_samples: int
    test_samples: int
    evaluated_at: datetime
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
