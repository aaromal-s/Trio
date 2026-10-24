from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.incident import Incident
from app.models.audit import AuditLog
from app.schemas.incident import IncidentApprovalRequest

def seed_default_incidents(db: Session):
    count = db.query(Incident).count()
    if count > 0:
        return
        
    now = datetime.now(timezone.utc)
    
    incidents_seed = [
        {
            "title": "Severe Memory Thrashing & Connection Starvation",
            "service_name": "payment-processor",
            "severity": "P1-Critical",
            "status": "INVESTIGATING",
            "cpu_usage": 88.4,
            "memory_usage": 94.2,
            "latency_p99": 740.0,
            "error_rate": 5.2,
            "description": "Payment authorization timeouts exceeding SLA threshold (>500ms). Memory monotonically climbed from 60% to 94% following release v2.14.8.",
            "root_cause_candidate": "Connection pool leak in JDBC transaction interceptor causing off-heap memory exhaustion and stop-the-world GC pauses.",
            "evidence_data": [
                {"category": "FACT", "statement": "P99 latency surged from 45ms to 740ms at 14:12 UTC.", "confidence": 1.0, "data_source": "Prometheus node_exporter"},
                {"category": "FACT", "statement": "HTTP 504 Gateway Timeout rate reached 5.2% on /v1/checkout.", "confidence": 1.0, "data_source": "Envoy Access Logs"},
                {"category": "INFERENCE", "statement": "Garbage collector active time exceeds 42% of CPU cycles.", "confidence": 0.94, "data_source": "Random Forest Telemetry Classifier"},
                {"category": "HYPOTHESIS", "statement": "New transaction retry policy lacks exponential backoff with jitter.", "confidence": 0.72, "data_source": "GitHub Release Commit Analysis"}
            ],
            "timeline_events": [
                {"timestamp": (now - timedelta(minutes=45)).isoformat(), "phase": "ANOMALY_TRIGGERED", "message": "Risk score crossed 0.85 threshold on payment-processor", "author": "AegisOps ML Engine"},
                {"timestamp": (now - timedelta(minutes=38)).isoformat(), "phase": "INCIDENT_CREATED", "message": "Auto-escalated to P1-Critical due to customer checkout disruption", "author": "Incident Orchestrator"},
                {"timestamp": (now - timedelta(minutes=25)).isoformat(), "phase": "COPILOT_TRIAGE", "message": "Copilot synthesized memory thrashing evidence & proposed rolling restart", "author": "AegisOps Copilot"},
                {"timestamp": (now - timedelta(minutes=10)).isoformat(), "phase": "PENDING_APPROVAL", "message": "Remediation plan awaiting SRE Lead authorization", "author": "Governance Gate"}
            ],
            "recommended_remediation": {
                "summary": "Graceful rolling restart and pool scale-up",
                "risk_level": "LOW",
                "actions": [
                    {"step": 1, "action": "Scale replica count from 4 to 8 pods", "command": "kubectl scale deployment/payment-processor --replicas=8", "requires_approval": True},
                    {"step": 2, "action": "Rolling restart with maxUnavailable=25%", "command": "kubectl rollout restart deployment/payment-processor", "requires_approval": True}
                ],
                "rollback_procedure": "kubectl rollout undo deployment/payment-processor"
            },
            "approval_status": "PENDING",
            "detected_at": now - timedelta(minutes=45)
        },
        {
            "title": "Cascading Downstream Latency Degradation",
            "service_name": "order-service",
            "severity": "P2-High",
            "status": "DETECTED",
            "cpu_usage": 72.1,
            "memory_usage": 68.5,
            "latency_p99": 380.0,
            "error_rate": 2.1,
            "description": "Order placement queue depth accumulating due to lock contention on inventory reservation.",
            "root_cause_candidate": "Row-level lock contention on PostgreSQL inventory table during high-concurrency flash sale.",
            "evidence_data": [
                {"category": "FACT", "statement": "Active database transactions waiting on lock acquisition exceeded 85 threads.", "confidence": 1.0, "data_source": "pg_stat_activity"},
                {"category": "INFERENCE", "statement": "Queue depth is increasing exponentially at 14 orders/sec.", "confidence": 0.91, "data_source": "AegisOps Predictive Engine"}
            ],
            "timeline_events": [
                {"timestamp": (now - timedelta(minutes=18)).isoformat(), "phase": "ANOMALY_TRIGGERED", "message": "Order queue threshold warning tripped", "author": "Telemetry Monitor"},
                {"timestamp": (now - timedelta(minutes=12)).isoformat(), "phase": "INCIDENT_CREATED", "message": "P2-High incident opened", "author": "Incident Orchestrator"}
            ],
            "recommended_remediation": {
                "summary": "Activate optimistic concurrency fallback and cache inventory counts",
                "risk_level": "MEDIUM",
                "actions": [
                    {"step": 1, "action": "Switch order lock mode to READ_COMMITTED with 2s timeout", "requires_approval": True}
                ],
                "rollback_procedure": "Revert feature flag order_strict_lock to true"
            },
            "approval_status": "PENDING",
            "detected_at": now - timedelta(minutes=18)
        },
        {
            "title": "Search Index Re-ingestion Latency Spike",
            "service_name": "search-indexer",
            "severity": "P3-Medium",
            "status": "RESOLVED",
            "cpu_usage": 52.0,
            "memory_usage": 58.0,
            "latency_p99": 95.0,
            "error_rate": 0.05,
            "description": "Bulk catalog re-indexing caused temporary search latency spike from 40ms to 95ms.",
            "root_cause_candidate": "Unthrottled bulk re-index job competing with user query thread pool.",
            "evidence_data": [
                {"category": "FACT", "statement": "Batch indexing job #4928 finished successfully.", "confidence": 1.0, "data_source": "Elasticsearch logs"}
            ],
            "timeline_events": [
                {"timestamp": (now - timedelta(hours=3)).isoformat(), "phase": "DETECTED", "message": "Latency elevated", "author": "AegisOps Monitor"},
                {"timestamp": (now - timedelta(hours=2, minutes=15)).isoformat(), "phase": "RESOLVED", "message": "Batch indexing throttled; latency normalized to 35ms", "author": "SRE On-Call"}
            ],
            "recommended_remediation": {
                "summary": "Batch index throttling applied",
                "actions": [],
                "risk_level": "LOW"
            },
            "approval_status": "APPROVED",
            "approved_by": "sre-lead@aegisops.internal",
            "approved_at": now - timedelta(hours=2, minutes=20),
            "detected_at": now - timedelta(hours=3),
            "resolved_at": now - timedelta(hours=2, minutes=15)
        }
    ]
    
    for inc in incidents_seed:
        db_inc = Incident(**inc)
        db.add(db_inc)
        
    db.commit()

def list_incidents(
    db: Session,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> List[Incident]:
    query = db.query(Incident)
    
    if status and status != "ALL":
        query = query.filter(Incident.status == status)
    if severity and severity != "ALL":
        query = query.filter(Incident.severity == severity)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Incident.title.ilike(search_pattern)) | 
            (Incident.service_name.ilike(search_pattern)) |
            (Incident.description.ilike(search_pattern))
        )
        
    return query.order_by(desc(Incident.detected_at)).offset(skip).limit(limit).all()

def get_incident_by_id(db: Session, incident_id: int) -> Optional[Incident]:
    return db.query(Incident).filter(Incident.id == incident_id).first()

def handle_incident_approval(
    db: Session,
    incident_id: int,
    req: IncidentApprovalRequest,
    user_email: str
) -> Optional[Incident]:
    inc = get_incident_by_id(db, incident_id)
    if not inc:
        return None
        
    now = datetime.now(timezone.utc)
    
    if req.action == "APPROVE":
        inc.approval_status = "APPROVED"
        inc.approved_by = user_email
        inc.approved_at = now
        inc.status = "MITIGATING"
        
        # Add to timeline
        timeline = list(inc.timeline_events or [])
        timeline.append({
            "timestamp": now.isoformat(),
            "phase": "REMEDIATION_APPROVED",
            "message": f"Remediation plan approved by {user_email}. Auto-dispatching safe rollout.",
            "author": user_email
        })
        inc.timeline_events = timeline
        
        # Simulated execution result
        inc.execution_result = {
            "status": "SUCCESS",
            "dispatched_at": now.isoformat(),
            "execution_id": f"EXEC-{inc.id}-{int(now.timestamp())}",
            "logs": [
                f"Connecting to cluster namespace for {inc.service_name}...",
                "Applying patch: rolling update maxSurge=1, maxUnavailable=0",
                "Pod health checks passed: 8/8 containers READY",
                "Circuit breaker normalized: traffic return confirmed"
            ]
        }
        
        # Audit log
        audit = AuditLog(
            action="REMEDIATION_APPROVED",
            target_type="INCIDENT",
            target_id=str(inc.id),
            user_email=user_email,
            details={"service_name": inc.service_name, "actions": inc.recommended_remediation}
        )
        db.add(audit)
        
    elif req.action == "REJECT":
        inc.approval_status = "REJECTED"
        inc.rejection_reason = req.rejection_reason or "Manual rejection by operator"
        
        timeline = list(inc.timeline_events or [])
        timeline.append({
            "timestamp": now.isoformat(),
            "phase": "REMEDIATION_REJECTED",
            "message": f"Remediation rejected by {user_email}: {inc.rejection_reason}",
            "author": user_email
        })
        inc.timeline_events = timeline
        
        audit = AuditLog(
            action="REMEDIATION_REJECTED",
            target_type="INCIDENT",
            target_id=str(inc.id),
            user_email=user_email,
            details={"reason": inc.rejection_reason}
        )
        db.add(audit)
        
    elif req.action == "RESOLVE":
        inc.status = "RESOLVED"
        inc.resolved_at = now
        timeline = list(inc.timeline_events or [])
        timeline.append({
            "timestamp": now.isoformat(),
            "phase": "INCIDENT_RESOLVED",
            "message": f"Incident marked resolved by {user_email}. Metrics returned to nominal envelope.",
            "author": user_email
        })
        inc.timeline_events = timeline
        
        audit = AuditLog(
            action="INCIDENT_RESOLVED",
            target_type="INCIDENT",
            target_id=str(inc.id),
            user_email=user_email,
            details={"resolved_at": now.isoformat()}
        )
        db.add(audit)
        
    db.commit()
    db.refresh(inc)
    return inc
