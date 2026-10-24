from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False, default="")
    role = Column(String, default="engineer") # admin, sre_lead, engineer, viewer
    department = Column(String, default="Site Reliability Engineering")
    is_active = Column(Boolean, default=True)
    
    # Notification & preferences
    notification_email = Column(Boolean, default=True)
    notification_slack = Column(Boolean, default=True)
    notification_sms = Column(Boolean, default=False)
    sound_alerts = Column(Boolean, default=True)
    auto_refresh_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
