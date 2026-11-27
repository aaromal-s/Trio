"""
TRIO Model Evaluator
Computes rigorous, honest comparative metrics across algorithms using ground truth labels
(ARI, NMI, Precision, Recall, F1, False Discovery Rate, Detection Delay, Runtime).
"""

from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.metrics import (
    adjusted_rand_score,
    normalized_mutual_info_score,
    precision_recall_fscore_support,
    silhouette_score,
)

class ModelEvaluator:
    @staticmethod
    def compute_metrics(
        y_true_binary: List[int],
        y_pred_binary: List[int],
        y_true_multiclass: Optional[List[int]] = None,
        y_pred_clusters: Optional[List[int]] = None,
        X_eval: Optional[np.ndarray] = None,
        runtime_ms: float = 0.0,
        model_name: str = "TRIO"
    ) -> Dict[str, Any]:
        """
        Calculates all evaluation metrics.
        y_true_binary: 1 for novel/unknown operational states, 0 for normal
        y_pred_binary: 1 for detected novel/unknown, 0 for normal
        """
        y_true = np.array(y_true_binary, dtype=int)
        y_pred = np.array(y_pred_binary, dtype=int)
        
        # Binary classification metrics
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_true, y_pred, average="binary", zero_division=0.0
        )
        
        # False Discovery Rate (FDR = FP / (FP + TP))
        fp = int(np.sum((y_pred == 1) & (y_true == 0)))
        tp = int(np.sum((y_pred == 1) & (y_true == 1)))
        fdr = float(fp / (fp + tp)) if (fp + tp) > 0 else 0.0
        
        # Adjusted Rand Index (ARI) & Normalized Mutual Information (NMI)
        if y_true_multiclass is not None and y_pred_clusters is not None:
            ari = float(adjusted_rand_score(y_true_multiclass, y_pred_clusters))
            nmi = float(normalized_mutual_info_score(y_true_multiclass, y_pred_clusters))
        else:
            ari = float(adjusted_rand_score(y_true, y_pred))
            nmi = float(normalized_mutual_info_score(y_true, y_pred))
            
        # Detection Delay: Steps from first occurrence of true unknown (y_true == 1) to first detection
        unknown_indices = np.where(y_true == 1)[0]
        if len(unknown_indices) > 0:
            first_true_idx = unknown_indices[0]
            # Look for detections at or after first_true_idx
            detections_after = np.where(y_pred[first_true_idx:] == 1)[0]
            if len(detections_after) > 0:
                detection_delay = int(detections_after[0])
            else:
                detection_delay = len(y_true) # Never detected
        else:
            detection_delay = 0

        # Silhouette Score (unsupervised cluster cohesion & separation, range [-1, 1])
        sil_score: Optional[float] = None
        if X_eval is not None and len(X_eval) == len(y_pred):
            labels_for_sil = np.array(y_pred_clusters) if y_pred_clusters is not None else y_pred
            unique_labels = np.unique(labels_for_sil)
            if 2 <= len(unique_labels) < len(X_eval):
                try:
                    sil_score = round(float(silhouette_score(X_eval, labels_for_sil)), 4)
                except Exception:
                    sil_score = None

        return {
            "model_name": model_name,
            "ari": round(float(ari), 4),
            "nmi": round(float(nmi), 4),
            "silhouette_score": sil_score,
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "false_discovery_rate": round(float(fdr), 4),
            "detection_delay_timesteps": detection_delay,
            "runtime_ms": round(float(runtime_ms), 2),
            "true_positives": tp,
            "false_positives": fp
        }

