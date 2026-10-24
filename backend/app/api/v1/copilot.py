from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.copilot import (
    CopilotInvestigationRequest, CopilotInvestigationResponse
)
from app.services.copilot_engine import run_copilot_investigation
from app.models.incident import Incident
from app.services.telemetry_simulator import SERVICES, generate_current_telemetry_snapshot
from datetime import datetime, timezone

router = APIRouter()

@router.post("/investigate", response_model=CopilotInvestigationResponse)
def investigate_service(req: CopilotInvestigationRequest, db: Session = Depends(get_db)):
    metrics = req.metrics_snapshot
    logs = req.recent_logs
    
    # If incident_id provided, enrich from incident record
    if req.incident_id:
        inc = db.query(Incident).filter(Incident.id == req.incident_id).first()
        if inc:
            req.service_name = inc.service_name
            if not metrics:
                metrics = {
                    "cpu_utilization": inc.cpu_usage,
                    "memory_utilization": inc.memory_usage,
                    "latency_ms": inc.latency_p99,
                    "error_rate": inc.error_rate,
                    "disk_io_percent": 82.0 if inc.severity == "P1-Critical" else 30.0,
                    "request_throughput": 480.0
                }
                
    if not metrics:
        srv = next((s for s in SERVICES if s["name"] == req.service_name), SERVICES[0])
        metrics = generate_current_telemetry_snapshot(srv, datetime.now(timezone.utc))
        
    return run_copilot_investigation(
        incident_id=req.incident_id,
        service_name=req.service_name,
        metrics=metrics,
        logs=logs,
        query=req.query
    )
