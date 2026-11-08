"""
Model Lab API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.services.state_service import state_service

router = APIRouter(prefix="/models", tags=["Model Lab"])

class TrainRequest(BaseModel):
    algorithm: str = "TRIO" # TRIO, K-Means, DBSCAN, Isolation Forest, or ALL
    feature_cols: Optional[List[str]] = None
    train_ratio: float = 0.7
    alpha: float = 0.45
    beta: float = 0.30
    gamma: float = 0.25
    contradiction_threshold: float = 0.48

@router.get("/status")
def get_model_status():
    model = state_service.trio_model
    return {
        "is_trained": model.is_trained,
        "model_version": model.model_version,
        "weights": {
            "alpha": round(model.alpha, 4),
            "beta": round(model.beta, 4),
            "gamma": round(model.gamma, 4)
        },
        "contradiction_threshold": model.contradiction_threshold,
        "selected_features": state_service.feature_cols,
        "ltm_prototypes_count": len(model.ltm.prototypes),
        "candidates_count": len(model.candidates),
        "dataset_name": state_service.dataset_name
    }

@router.post("/train")
def train_model(req: TrainRequest):
    if state_service.active_dataset is None:
        raise HTTPException(status_code=400, detail="No dataset loaded. Upload or generate a dataset first.")
        
    try:
        state_service.trio_model.contradiction_threshold = req.contradiction_threshold
        result = state_service.train_all(
            feature_cols=req.feature_cols,
            train_ratio=req.train_ratio,
            alpha=req.alpha,
            beta=req.beta,
            gamma=req.gamma
        )
        return {
            "status": "success",
            "message": f"Model successfully retrained on {len(state_service.train_df)} training samples.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/history")
def get_training_history():
    return {
        "history": state_service.training_history
    }

