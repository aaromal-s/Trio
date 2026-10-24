from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, index=True, nullable=False) # e.g. REMEDIATION_APPROVED, INCIDENT_RESOLVED, LOGIN_SUCCESS
    target_type = Column(String, nullable=False) # INCIDENT, MODEL, CONFIG, USER
    target_id = Column(String, nullable=False)
    user_email = Column(String, index=True, nullable=False)
    ip_address = Column(String, default="127.0.0.1")
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
