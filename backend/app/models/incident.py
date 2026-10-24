from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    service_name = Column(String, index=True, nullable=False)
    severity = Column(String, nullable=False) # P1-Critical, P2-High, P3-Medium, P4-Low
    status = Column(String, default="DETECTED", index=True) # DETECTED, INVESTIGATING, MITIGATING, RESOLVED
    
    # Telemetry snapshot when detected
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    latency_p99 = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    
    description = Column(Text, default="")
    root_cause_candidate = Column(Text, default="")
    
    # JSON structured payloads
    evidence_data = Column(JSON, default=list) # List of facts, metrics, log snippets
    timeline_events = Column(JSON, default=list) # Chronological events
    recommended_remediation = Column(JSON, default=dict) # Proposed steps & safety analysis
    
    # Human-in-the-loop Governance
    approval_status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, EXECUTED
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String, nullable=True)
    execution_result = Column(JSON, nullable=True)
    
    detected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)
