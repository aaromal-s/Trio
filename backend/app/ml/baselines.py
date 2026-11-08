"""
Baseline Unsupervised Machine Learning Algorithms for Benchmarking:
1. K-Means Clustering
2. DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
3. Isolation Forest
"""

import time
from typing import Dict, Any, Tuple
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import IsolationForest

class BaselinePipelines:
    @staticmethod
    def run_kmeans(X_train: np.ndarray, X_test: np.ndarray, n_clusters: int = 4) -> Dict[str, Any]:
        """
        K-Means: Clusters training data, assigns test points to nearest centroid.
        Identifies outliers based on distance exceeding 95th percentile threshold.
        """
        start = time.perf_counter()
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(X_train)
        
        # Test predictions
        dists = np.min(kmeans.transform(X_test), axis=1)
        # Empirical distance threshold on training data
        train_dists = np.min(kmeans.transform(X_train), axis=1)
        thresh = np.percentile(train_dists, 97.5)
        
        # Binary prediction: 1 if outlier / potential unknown, 0 if normal
        is_novel = (dists > thresh).astype(int)
        cluster_assignments = kmeans.predict(X_test)
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        
        return {
            "name": "K-Means",
            "runtime_ms": round(elapsed_ms, 2),
            "predictions": is_novel.tolist(),
            "cluster_labels": cluster_assignments.tolist(),
            "raw_scores": dists.tolist()
        }

    @staticmethod
    def run_dbscan(X_train: np.ndarray, X_test: np.ndarray, eps: float = 0.8, min_samples: int = 10) -> Dict[str, Any]:
        """
        DBSCAN: Treats points labeled as noise (-1) as candidate novel/anomalous observations.
        """
        start = time.perf_counter()
        combined = np.vstack([X_train, X_test])
        db = DBSCAN(eps=eps, min_samples=min_samples)
        all_labels = db.fit_predict(combined)
        
        test_labels = all_labels[len(X_train):]
        # Points classified as noise (-1) are considered novel/anomalous
        is_novel = (test_labels == -1).astype(int)
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        
        return {
            "name": "DBSCAN",
            "runtime_ms": round(elapsed_ms, 2),
            "predictions": is_novel.tolist(),
            "cluster_labels": test_labels.tolist(),
            "raw_scores": is_novel.tolist()
        }

    @staticmethod
    def run_isolation_forest(X_train: np.ndarray, X_test: np.ndarray, contamination: float = 0.08) -> Dict[str, Any]:
        """
        Isolation Forest: Popular unsupervised anomaly detector.
        """
        start = time.perf_counter()
        iso = IsolationForest(contamination=contamination, random_state=42)
        iso.fit(X_train)
        
        raw_preds = iso.predict(X_test)
        # -1 is anomaly, 1 is normal
        is_novel = (raw_preds == -1).astype(int)
        scores = -iso.score_samples(X_test)
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        
        return {
            "name": "Isolation Forest",
            "runtime_ms": round(elapsed_ms, 2),
            "predictions": is_novel.tolist(),
            "cluster_labels": raw_preds.tolist(),
            "raw_scores": scores.tolist()
        }

