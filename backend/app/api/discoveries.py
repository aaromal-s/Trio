"""
Unknown Operational-State Discoveries API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.state_service import state_service

router = APIRouter(prefix="/discoveries", tags=["Discoveries"])

class UpdateStatusRequest(BaseModel):
    status: str # "Pending", "Under Validation", "Confirmed", "Rejected"

@router.get("")
def list_discoveries():
    model = state_service.trio_model
    features = state_service.feature_cols
    candidates_list = [c.to_dict(features) for c in model.candidates]
    
    # Counts by status
    counts = {
        "total": len(candidates_list),
        "pending": sum(1 for c in candidates_list if c["status"] == "Pending"),
        "under_validation": sum(1 for c in candidates_list if c["status"] == "Under Validation"),
        "confirmed": sum(1 for c in candidates_list if c["status"] == "Confirmed"),
        "rejected": sum(1 for c in candidates_list if c["status"] == "Rejected")
    }
    
    return {
        "counts": counts,
        "candidates": candidates_list,
        "explanation": "Unknown operational states are discovered when repeated contradictory observations form dense, non-transient clusters distinct from known LTM prototypes."
    }

@router.get("/{candidate_id}")
def get_candidate_detail(candidate_id: str):
    model = state_service.trio_model
    features = state_service.feature_cols
    
    target = None
    for c in model.candidates:
        if c.candidate_id == candidate_id:
            target = c
            break
            
    if not target:
        raise HTTPException(status_code=404, detail="Discovery candidate not found")
        
    return {
        "candidate": target.to_dict(features),
        "observation_indices_sample": target.observation_indices[:30],
        "feature_deltas": target.feature_deltas,
        "why_identified": target.explanation
    }

@router.post("/{candidate_id}/status")
def update_status(candidate_id: str, req: UpdateStatusRequest):
    allowed_statuses = ["Pending", "Under Validation", "Confirmed", "Rejected"]
    if req.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed_statuses}")
        
    success = state_service.trio_model.update_candidate_status(candidate_id, req.status)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    return {
        "candidate_id": candidate_id,
        "updated_status": req.status,
        "message": f"Candidate status successfully updated to '{req.status}'."
    }

