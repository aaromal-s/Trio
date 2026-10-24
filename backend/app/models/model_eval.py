from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from app.core.database import Base

class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True, nullable=False)
    model_version = Column(String, nullable=False)
    
    # Rigorous ML Metrics
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    roc_auc = Column(Float, nullable=True)
    pr_auc = Column(Float, nullable=True)
    false_positive_rate = Column(Float, nullable=False)
    false_negative_rate = Column(Float, nullable=False)
    
    # Detailed verification data
    confusion_matrix = Column(JSON, default=dict)
    classification_report = Column(JSON, default=dict)
    dataset_provenance = Column(Text, default="")
    train_samples = Column(Integer, default=0)
    test_samples = Column(Integer, default=0)
    
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
