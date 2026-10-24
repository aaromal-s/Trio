import os
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check(response: Response, db: Session = Depends(get_db)):
    db_healthy = True
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_healthy = False
        
    model_loaded = os.path.exists(settings.MODEL_FILE)
    
    overall_status = "HEALTHY" if (db_healthy and model_loaded) else "DEGRADED"
    if not db_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        
    return {
        "status": overall_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_healthy,
        "ml_model_ready": model_loaded
    }

@router.get("/readiness")
def readiness_probe(response: Response, db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"ready": True}
    except Exception:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"ready": False, "error": "Database unavailable"}
