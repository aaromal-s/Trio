from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class IncidentTimelineEvent(BaseModel):
    timestamp: str
    phase: str
    message: str
    author: Optional[str] = "AegisOps Detector"

class RemediationStep(BaseModel):
    step_number: int
    title: str
    command_or_action: str
    impact_level: str # LOW, MEDIUM, HIGH
    requires_approval: bool = True
    status: str = "PENDING" # PENDING, IN_PROGRESS, COMPLETED, SKIPPED

class IncidentBase(BaseModel):
    title: str
    service_name: str
    severity: str # P1-Critical, P2-High, P3-Medium, P4-Low
    status: Optional[str] = "DETECTED"
    cpu_usage: Optional[float] = 0.0
    memory_usage: Optional[float] = 0.0
    latency_p99: Optional[float] = 0.0
    error_rate: Optional[float] = 0.0
    description: Optional[str] = ""
    root_cause_candidate: Optional[str] = ""

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    root_cause_candidate: Optional[str] = None
    description: Optional[str] = None

class IncidentApprovalRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None

class IncidentOut(IncidentBase):
    id: int
    approval_status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    evidence_data: Optional[List[Any]] = []
    timeline_events: Optional[List[Any]] = []
    recommended_remediation: Optional[Dict[str, Any]] = {}
    execution_result: Optional[Dict[str, Any]] = None
    detected_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
