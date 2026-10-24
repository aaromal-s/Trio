from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CopilotInvestigationRequest(BaseModel):
    incident_id: Optional[int] = None
    service_name: str
    metrics_snapshot: Optional[Dict[str, float]] = None
    recent_logs: Optional[List[str]] = None
    query: Optional[str] = None

class EvidenceItem(BaseModel):
    category: str # "FACT", "INFERENCE", "HYPOTHESIS"
    statement: str
    confidence: float
    data_source: str

class DiagnosticCheck(BaseModel):
    name: str
    description: str
    target: str
    command_snippet: str
    estimated_duration_sec: int

class RemediationPlan(BaseModel):
    summary: str
    actions: List[Dict[str, Any]]
    risk_level: str # LOW, MEDIUM, HIGH
    requires_human_approval: bool = True
    rollback_procedure: str

class CopilotInvestigationResponse(BaseModel):
    incident_id: Optional[int] = None
    service_name: str
    investigation_summary: str
    evidence_breakdown: List[EvidenceItem]
    candidate_root_causes: List[Dict[str, Any]]
    recommended_diagnostics: List[DiagnosticCheck]
    proposed_remediation: RemediationPlan
    confidence_limitations: str
    timestamp: str
