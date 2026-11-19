"""
TRIO Global In-Memory State Service
Maintains active dataset, preprocessor, trained models, Tri-Memory states, and discoveries.
"""

import os
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
import time

from app.ml.synthetic_generator import generate_synthetic_industrial_data
from app.ml.preprocessor import DataPreprocessor
from app.ml.trio_model import TRIOModel
from app.ml.baselines import BaselinePipelines
from app.ml.evaluator import ModelEvaluator
from app.core.config import settings

# Default features aligned with MetroPT3 Railway Air Compressor SCADA
DEFAULT_FEATURES = ["TP2", "TP3", "H1", "DV_pressure", "Reservoirs", "Oil_temperature", "Motor_current"]
DEFAULT_ACTUATORS = ["COMP", "DV_eletric", "Towers"]

class StateService:
    def __init__(self):
        self.active_dataset: Optional[pd.DataFrame] = None
        self.dataset_name: str = "MetroPT-3 Railway Air Production Unit (APU) SCADA Telemetry"
        self.is_simulated: bool = False
        self.feature_cols: List[str] = list(DEFAULT_FEATURES)
        self.actuator_cols: List[str] = list(DEFAULT_ACTUATORS)
        self.train_df: Optional[pd.DataFrame] = None
        self.test_df: Optional[pd.DataFrame] = None
        
        self.preprocessor = DataPreprocessor()
        self.trio_model = TRIOModel(
            alpha=settings.DEFAULT_ALPHA,
            beta=settings.DEFAULT_BETA,
            gamma=settings.DEFAULT_GAMMA,
            contradiction_threshold=0.32,
            min_evidence_discovery=settings.MIN_EVIDENCE_DISCOVERY
        )
        
        self.training_history: List[Dict[str, Any]] = []
        self.evaluation_results: List[Dict[str, Any]] = []
        self.stream_results: Optional[Dict[str, Any]] = None
        self.last_updated: float = time.time()
        
        # Initialize with real preprocessed industrial dataset
        self.load_initial_dataset()

    def load_initial_dataset(self):
        """Loads preprocessed MetroPT3 dataset if available, otherwise falls back to synthetic."""
        candidate_paths = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "MetroPT3_AirCompressor_Operational.csv")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Dataset", "MetroPT3_AirCompressor_Preprocessed.csv")),
            os.path.abspath("backend/data/MetroPT3_AirCompressor_Operational.csv"),
            os.path.abspath("Dataset/MetroPT3_AirCompressor_Preprocessed.csv"),
        ]
        
        target_path = None
        for p in candidate_paths:
            if os.path.exists(p):
                target_path = p
                break
        
        if target_path:
            df = pd.read_csv(target_path)
            features = [c for c in DEFAULT_FEATURES if c in df.columns]
            self.set_dataset(df, "MetroPT-3 Railway Air Production Unit (APU) SCADA Telemetry", is_simulated=False)
            self.feature_cols = features if len(features) >= 2 else list(DEFAULT_FEATURES)
            self.actuator_cols = [c for c in DEFAULT_ACTUATORS if c in df.columns]
            self.train_all(self.feature_cols, train_ratio=0.7)
        else:
            self.load_default_synthetic()

    def load_default_synthetic(self, n_samples: int = 1500):
        df = generate_synthetic_industrial_data(n_samples=n_samples, seed=42)
        features = ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"]
        self.feature_cols = features
        self.actuator_cols = ["MV101", "P101"]
        self.set_dataset(df, "Synthetic Industrial Water Treatment Dataset (SWaT-Sim)", is_simulated=True)
        # Pre-train the default model so dashboard works out-of-the-box
        self.train_all(self.feature_cols, train_ratio=0.7)

    def set_dataset(self, df: pd.DataFrame, name: str, is_simulated: bool = False):
        self.active_dataset = df
        self.dataset_name = name
        self.is_simulated = is_simulated
        self.last_updated = time.time()

    def train_all(
        self, 
        feature_cols: Optional[List[str]] = None, 
        train_ratio: float = 0.7,
        alpha: Optional[float] = None,
        beta: Optional[float] = None,
        gamma: Optional[float] = None
    ) -> Dict[str, Any]:
        if self.active_dataset is None:
            raise ValueError("No active dataset loaded.")
            
        if feature_cols:
            features = feature_cols
        else:
            valid_existing = [c for c in self.feature_cols if c in self.active_dataset.columns]
            if len(valid_existing) >= 2:
                features = valid_existing
            else:
                val = self.preprocessor.validate_dataset(self.active_dataset)
                features = val["numeric_columns"][:6] if len(val["numeric_columns"]) >= 2 else DEFAULT_FEATURES
        self.feature_cols = features
        
        if alpha is not None and beta is not None and gamma is not None:
            self.trio_model.update_weights(alpha, beta, gamma)
            
        cleaned_df = self.preprocessor.clean_and_prepare(self.active_dataset, features)
        train_df, test_df = self.preprocessor.chronological_split(cleaned_df, train_ratio=train_ratio)
        self.train_df = train_df
        self.test_df = test_df
        
        # Scale features
        X_train_scaled = self.preprocessor.fit_transform_train(train_df, features)
        X_test_scaled = self.preprocessor.transform_test(test_df)
        
        # 1. Train TRIO Model
        start_trio = time.perf_counter()
        n_known = min(3, max(2, len(X_train_scaled) // 10))
        self.trio_model.train(X_train_scaled, features, n_known_clusters=n_known)
        timestamps = test_df["timestamp"].tolist() if "timestamp" in test_df.columns else [f"T{i}" for i in range(len(test_df))]
        stream_res = self.trio_model.process_stream(X_test_scaled, timestamps)
        trio_runtime_ms = (time.perf_counter() - start_trio) * 1000.0
        self.stream_results = stream_res
        
        # Ground truth evaluation if available
        y_true_binary = test_df["is_unknown"].tolist() if "is_unknown" in test_df.columns else [0] * len(test_df)
        y_true_multi = test_df["ground_truth_code"].tolist() if "ground_truth_code" in test_df.columns else None
        
        # Numeric cluster mapping for ARI/NMI
        state_code_map = {}
        for s in stream_res["assigned_states"]:
            if s not in state_code_map:
                state_code_map[s] = len(state_code_map)
        y_pred_clusters = [state_code_map[s] for s in stream_res["assigned_states"]]
        
        trio_eval = ModelEvaluator.compute_metrics(
            y_true_binary=y_true_binary,
            y_pred_binary=stream_res["is_novel_flags"],
            y_true_multiclass=y_true_multi,
            y_pred_clusters=y_pred_clusters,
            runtime_ms=trio_runtime_ms,
            model_name="TRIO (Proposed)"
        )
        
        # 2. Run Baselines
        n_kmeans = min(4, max(2, len(X_train_scaled) // 10))
        kmeans_res = BaselinePipelines.run_kmeans(X_train_scaled, X_test_scaled, n_clusters=n_kmeans)
        kmeans_eval = ModelEvaluator.compute_metrics(
            y_true_binary=y_true_binary,
            y_pred_binary=kmeans_res["predictions"],
            runtime_ms=kmeans_res["runtime_ms"],
            model_name="K-Means"
        )
        
        dbscan_res = BaselinePipelines.run_dbscan(X_train_scaled, X_test_scaled)
        dbscan_eval = ModelEvaluator.compute_metrics(
            y_true_binary=y_true_binary,
            y_pred_binary=dbscan_res["predictions"],
            runtime_ms=dbscan_res["runtime_ms"],
            model_name="DBSCAN"
        )
        
        iso_res = BaselinePipelines.run_isolation_forest(X_train_scaled, X_test_scaled)
        iso_eval = ModelEvaluator.compute_metrics(
            y_true_binary=y_true_binary,
            y_pred_binary=iso_res["predictions"],
            runtime_ms=iso_res["runtime_ms"],
            model_name="Isolation Forest"
        )
        
        self.evaluation_results = [trio_eval, kmeans_eval, dbscan_eval, iso_eval]
        
        history_entry = {
            "model_version": self.trio_model.model_version,
            "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "features_used": features,
            "train_samples": len(train_df),
            "test_samples": len(test_df),
            "weights": {
                "alpha": round(self.trio_model.alpha, 4),
                "beta": round(self.trio_model.beta, 4),
                "gamma": round(self.trio_model.gamma, 4)
            },
            "candidates_discovered": len(self.trio_model.candidates),
            "trio_f1": trio_eval["f1_score"],
            "trio_precision": trio_eval["precision"],
            "trio_recall": trio_eval["recall"]
        }
        self.training_history.insert(0, history_entry)
        self.last_updated = time.time()
        
        return {
            "version": self.trio_model.model_version,
            "evaluation": self.evaluation_results,
            "candidates_count": len(self.trio_model.candidates),
            "history_entry": history_entry
        }

state_service = StateService()
