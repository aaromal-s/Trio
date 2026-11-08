"""
Datasets API Endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import io

from app.services.state_service import state_service
from app.ml.synthetic_generator import generate_synthetic_industrial_data

router = APIRouter(prefix="/datasets", tags=["Datasets"])

class GenerateDatasetRequest(BaseModel):
    n_samples: int = 1500
    seed: int = 42

@router.get("/current")
def get_current_dataset_info():
    if state_service.active_dataset is None:
        return {"status": "none", "message": "No dataset currently loaded"}
    
    validation = state_service.preprocessor.validate_dataset(state_service.active_dataset)
    return {
        "dataset_name": state_service.dataset_name,
        "is_simulated": state_service.is_simulated,
        "disclaimer": "SIMULATED DEMO DATA — NOT REAL FACTORY DATA" if state_service.is_simulated else "USER UPLOADED DATASET",
        "validation": validation,
        "selected_features": state_service.feature_cols,
        "actuator_features": state_service.actuator_cols,
        "last_updated": state_service.last_updated
    }

@router.get("/preview")
def get_dataset_preview(limit: int = 25):
    if state_service.active_dataset is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
        
    df = state_service.active_dataset
    head_df = df.head(limit)
    
    # Format NaN to None for JSON serialization
    records = head_df.where(pd.notnull(head_df), None).to_dict(orient="records")
    return {
        "total_rows": len(df),
        "columns": list(df.columns),
        "preview_rows": records
    }

@router.post("/generate-synthetic")
def generate_synthetic(req: GenerateDatasetRequest):
    df = generate_synthetic_industrial_data(n_samples=req.n_samples, seed=req.seed)
    state_service.set_dataset(df, "Synthetic Industrial Water Treatment (SWaT-Sim)", is_simulated=True)
    # Re-train with fresh dataset
    train_res = state_service.train_all()
    
    return {
        "message": "Synthetic industrial dataset generated successfully.",
        "row_count": len(df),
        "is_simulated": True,
        "train_results": train_res
    }

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        validation = state_service.preprocessor.validate_dataset(df)
        if not validation["is_valid"]:
            raise HTTPException(
                status_code=400, 
                detail="Dataset must contain at least 50 rows and 2 numeric sensor columns."
            )
            
        state_service.set_dataset(df, file.filename, is_simulated=False)
        # Select available numeric columns as default features
        available_numeric = validation["numeric_columns"][:8]
        state_service.feature_cols = available_numeric
        state_service.train_all(feature_cols=available_numeric)
        
        return {
            "message": f"Dataset '{file.filename}' successfully uploaded and preprocessed.",
            "row_count": len(df),
            "columns": list(df.columns),
            "selected_features": available_numeric,
            "validation": validation
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")

@router.get("/swat-info")
def get_swat_info():
    return {
        "name": "Secure Water Treatment (SWaT) Testbed",
        "institution": "iTrust, Singapore University of Technology and Design (SUTD)",
        "description": "SWaT is a fully operational six-stage physical water treatment plant testbed used worldwide in industrial control systems and cyber-physical systems security research. Stages include raw water intake, chemical dosing, ultrafiltration, dechlorination, reverse osmosis, and clean water distribution.",
        "official_url": "https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/#swat",
        "citation": "Goh, J., Adepu, S., Junejo, K. N., & Mathur, A. (2016). A dataset to support research in the design of secure water treatment systems. In Critical Information Infrastructures Security (CRITIS).",
        "redistribution_policy": "Official SWaT dataset requires direct institutional access request from iTrust SUTD. TRIO includes a high-fidelity synthetic generator mimicking SWaT multi-stage behavior for immediate experimentation without violating licensing."
    }

