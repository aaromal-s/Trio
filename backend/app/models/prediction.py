from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from app.core.database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, index=True, nullable=False)
    risk_score = Column(Float, nullable=False) # 0.0 to 1.0 calibrated risk
    severity = Column(String, nullable=False) # CRITICAL, HIGH, ELEVATED, NOMINAL
    horizon_minutes = Column(Integer, default=30) # +30m prediction horizon
    confidence = Column(Float, default=0.95) # Calibrated model confidence
    
    # Feature inputs & attribution
    feature_importances = Column(JSON, default=dict)
    telemetry_input = Column(JSON, default=dict)
    
    # Anomaly detection distinction
    anomaly_detected = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0) # Isolation forest / score
    
    model_version = Column(String, default="rf-v1.4.2")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
