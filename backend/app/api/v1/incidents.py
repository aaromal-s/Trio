from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incident import Incident
from app.schemas.incident import (
    IncidentOut, IncidentCreate, IncidentApprovalRequest
)
from app.services.incident_service import (
    list_incidents, get_incident_by_id, handle_incident_approval, seed_default_incidents
)
from app.api.deps import get_optional_user

router = APIRouter()

@router.get("/", response_model=List[IncidentOut])
def get_incidents(
    status: Optional[str] = Query(None, description="Filter by status (DETECTED, INVESTIGATING, MITIGATING, RESOLVED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (P1-Critical, P2-High, P3-Medium, P4-Low)"),
    search: Optional[str] = Query(None, description="Search by title or service"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    seed_default_incidents(db)
    return list_incidents(db, status=status, severity=severity, search=search, skip=skip, limit=limit)

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    seed_default_incidents(db)
    inc = get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return inc

@router.post("/{incident_id}/approve", response_model=IncidentOut)
def approve_or_reject_remediation(
    incident_id: int,
    req: IncidentApprovalRequest,
    db: Session = Depends(get_db),
    user = Depends(get_optional_user)
):
    seed_default_incidents(db)
    user_email = user.email if user else "sre-oncall@aegisops.internal"
    updated = handle_incident_approval(db, incident_id, req, user_email)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return updated

@router.post("/", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(inc_in: IncidentCreate, db: Session = Depends(get_db)):
    db_inc = Incident(**inc_in.model_dump())
    db.add(db_inc)
    db.commit()
    db.refresh(db_inc)
    return db_inc
