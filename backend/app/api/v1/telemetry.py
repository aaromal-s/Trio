from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.telemetry_simulator import get_all_services_telemetry, get_telemetry_history
from app.models.incident import Incident
from app.schemas.telemetry import OverviewSummary

router = APIRouter()

@router.get("/live", response_model=List[Dict[str, Any]])
def get_live_telemetry(db: Session = Depends(get_db)):
    """
    Returns current telemetry snapshot for all monitored microservices.
    Designed for 5-second polling intervals with sub-millisecond response times.
    """
    return get_all_services_telemetry(db)

@router.get("/history/{service_name}")
def get_service_telemetry_history(service_name: str, points: int = Query(24, ge=5, le=100)):
    """
    Returns historical telemetry data points for charting.
    """
    return get_telemetry_history(service_name, points)

@router.get("/overview", response_model=OverviewSummary)
def get_system_overview(db: Session = Depends(get_db)):
    """
    Aggregate health summary, active incident counts, and MTTR for dashboard header.
    """
    active_p1 = db.query(Incident).filter(
        Incident.severity == "P1-Critical",
        Incident.status.in_(["DETECTED", "INVESTIGATING", "MITIGATING"])
    ).count()
    
    active_total = db.query(Incident).filter(
        Incident.status.in_(["DETECTED", "INVESTIGATING", "MITIGATING"])
    ).count()
    
    # Calculate health score based on active incidents
    if active_p1 > 0:
        health_score = 84.5
        overall_health = "DEGRADED"
    elif active_total > 0:
        health_score = 92.0
        overall_health = "OPERATIONAL"
    else:
        health_score = 99.8
        overall_health = "OPTIMAL"
        
    return OverviewSummary(
        overall_health=overall_health,
        overall_health_score=health_score,
        active_incidents_p1=active_p1,
        active_incidents_total=active_total,
        high_risk_services_count=2, # payment-processor, order-service
        total_services_monitored=8,
        anomaly_detection_rate=99.32,
        mttr_minutes=14.2,
        last_updated=datetime.now(timezone.utc)
    )
