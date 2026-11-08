"""
Tri-Memory Inspection API Endpoints
"""

from fastapi import APIRouter
from typing import Dict, Any

from app.services.state_service import state_service

router = APIRouter(prefix="/memory", tags=["Tri-Memory"])

@router.get("/status")
def get_memory_overview():
    model = state_service.trio_model
    return {
        "stm": {
            "capacity": model.stm.capacity,
            "current_size": len(model.stm.buffer),
            "is_full": len(model.stm.buffer) >= model.stm.capacity,
            "latest_timestamp": model.stm.timestamps[-1] if model.stm.timestamps else None
        },
        "ltm": {
            "prototypes_count": len(model.ltm.prototypes),
            "known_states": model.ltm.state_labels,
            "total_learned_frequency": sum(model.ltm.state_frequencies) if model.ltm.state_frequencies else 0
        },
        "cm": {
            "total_records": len(model.cm.records),
            "summary": model.cm.to_summary()
        }
    }

@router.get("/stm")
def get_stm_details():
    model = state_service.trio_model
    window = model.stm.get_recent_window()
    features = state_service.feature_cols
    
    recent_readings = []
    if len(window) > 0:
        for idx in range(min(15, len(window))):
            rev_idx = -(idx + 1)
            ts = model.stm.timestamps[rev_idx] if rev_idx < len(model.stm.timestamps) else "N/A"
            reading_dict = {"timestamp": ts}
            for f_idx, f_name in enumerate(features):
                if f_idx < window.shape[1]:
                    reading_dict[f_name] = round(float(window[rev_idx, f_idx]), 4)
            recent_readings.append(reading_dict)
            
    moving_avg = {}
    velocity = {}
    if len(window) > 0:
        avg_arr = model.stm.get_moving_average()
        vel_arr = model.stm.get_velocity()
        for f_idx, f_name in enumerate(features):
            if f_idx < len(avg_arr):
                moving_avg[f_name] = round(float(avg_arr[f_idx]), 4)
            if f_idx < len(vel_arr):
                velocity[f_name] = round(float(vel_arr[f_idx]), 4)
                
    return {
        "capacity": model.stm.capacity,
        "current_size": len(window),
        "recent_readings": recent_readings,
        "moving_average": moving_avg,
        "velocity": velocity,
        "explanation": "Short-Term Memory maintains a temporal sliding observation window to track local momentum, calculate temporal inconsistency (T), and smooth transient sensor jitter."
    }

@router.get("/ltm")
def get_ltm_details():
    model = state_service.trio_model
    features = state_service.feature_cols
    prototypes_info = model.ltm.to_dict(features)
    
    return {
        "known_prototypes": prototypes_info,
        "count": len(prototypes_info),
        "explanation": "Long-Term Memory contains learned centroids and dispersion radii of verified normal operational regimes. Incoming observations are compared against these prototypes to calculate Prototype Distance (D)."
    }

@router.get("/cm")
def get_cm_details(limit: int = 25):
    model = state_service.trio_model
    features = state_service.feature_cols
    records = model.cm.records
    
    recent_records = []
    for r in records[-limit:]:
        item = {
            "index": r["index"],
            "timestamp": r["timestamp"],
            "contradiction_score": r["contradiction_score"],
            "distance_score": r["distance_score"],
            "temporal_score": r["temporal_score"],
            "anomaly_score": r["anomaly_score"],
        }
        obs = r["observation"]
        for f_idx, f_name in enumerate(features):
            if f_idx < len(obs):
                item[f_name] = round(float(obs[f_idx]), 4)
        recent_records.append(item)
        
    return {
        "total_contradiction_records": len(records),
        "recent_records": recent_records,
        "explanation": "Contradiction Memory stores observations whose combined score C = alpha*D + beta*T + gamma*A violates normal operation. Repeated coherent records are clustered to uncover novel unknown operational states."
    }

