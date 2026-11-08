"""
Evaluation and Benchmarking API Endpoints
"""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
import io
import pandas as pd

from app.services.state_service import state_service

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

@router.get("/benchmark")
def get_benchmark_results():
    return {
        "dataset_name": state_service.dataset_name,
        "is_simulated": state_service.is_simulated,
        "metrics": state_service.evaluation_results,
        "explanation": {
            "ari": "Adjusted Rand Index: measures cluster agreement against ground-truth (-1 to +1, higher is better).",
            "nmi": "Normalized Mutual Information: information-theoretic cluster alignment score (0 to 1).",
            "precision": "Proportion of predicted unknown observations that are genuinely novel.",
            "recall": "Proportion of all true unknown state observations detected.",
            "f1_score": "Harmonic mean of precision and recall.",
            "false_discovery_rate": "Proportion of novel discoveries that are false positives.",
            "detection_delay_timesteps": "Observation lag from onset of novel regime to first trigger."
        }
    }

@router.get("/export-csv")
def export_evaluation_csv():
    if not state_service.evaluation_results:
        return PlainTextResponse("No evaluation results available.", status_code=400)
        
    df = pd.DataFrame(state_service.evaluation_results)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    return PlainTextResponse(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=trio_benchmark_evaluation.csv"}
    )

