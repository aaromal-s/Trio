from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class AuditLogOut(BaseModel):
    id: int
    action: str
    target_type: str
    target_id: str
    user_email: str
    ip_address: str
    details: Dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
