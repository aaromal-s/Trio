"""
TRIO: Contradiction-Guided Tri-Memory Unsupervised Learning Algorithm
Implements Short-Term Memory (STM), Long-Term Memory (LTM), Contradiction Memory (CM),
transparent Contradiction Scoring (C = alpha*D + beta*T + gamma*A),
and Density-Based Unknown Operational-State Discovery.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.ensemble import IsolationForest
from collections import deque
import uuid
from datetime import datetime

class ShortTermMemory:
    """
    STM: Sliding observation window maintaining real-time operational context,
    moving averages, and temporal momentum.
    """
    def __init__(self, capacity: int = 30):
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)
        self.timestamps = deque(maxlen=capacity)
        
    def push(self, observation: np.ndarray, timestamp: str):
        self.buffer.append(observation)
        self.timestamps.append(timestamp)
        
    def is_ready(self) -> bool:
        return len(self.buffer) >= 3
        
    def get_recent_window(self) -> np.ndarray:
        if not self.buffer:
            return np.empty((0, 0))
        return np.array(self.buffer)
        
    def get_moving_average(self) -> np.ndarray:
        if not self.buffer:
            return np.array([])
        return np.mean(self.buffer, axis=0)
        
    def get_variance(self) -> np.ndarray:
        if len(self.buffer) < 2:
            return np.zeros(self.buffer[0].shape if self.buffer else (0,))
        return np.var(self.buffer, axis=0)
        
    def get_velocity(self) -> np.ndarray:
        """Temporal rate of change across the window."""
        if len(self.buffer) < 2:
            return np.zeros(self.buffer[0].shape if self.buffer else (0,))
        diffs = np.diff(np.array(self.buffer), axis=0)
        return np.mean(diffs, axis=0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "capacity": self.capacity,
            "current_size": len(self.buffer),
            "latest_timestamp": self.timestamps[-1] if self.timestamps else None,
            "is_full": len(self.buffer) >= self.capacity
        }


class LongTermMemory:
    """
    LTM: Stores verified known operational-state prototypes, cluster centroids,
    dispersion metrics, and frequency statistics learned unsupervised.
    """
    def __init__(self):
        self.prototypes: List[np.ndarray] = []
        self.state_labels: List[str] = []
        self.state_frequencies: List[int] = []
        self.state_radii: List[float] = [] # 95th percentile distance to centroid
        self.fitted: bool = False
        
    def fit_known_states(self, X_train: np.ndarray, n_clusters: int = 3):
        """
        Learns known normal operating regimes from baseline training data.
        """
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_train)
        
        self.prototypes = [kmeans.cluster_centers_[k] for k in range(n_clusters)]
        self.state_labels = [f"KNOWN_STATE_{chr(65+k)}" for k in range(n_clusters)]
        self.state_frequencies = [int(np.sum(labels == k)) for k in range(n_clusters)]
        
        # Calculate cluster radius (dispersion)
        self.state_radii = []
        for k in range(n_clusters):
            cluster_points = X_train[labels == k]
            if len(cluster_points) > 0:
                dists = np.linalg.norm(cluster_points - self.prototypes[k], axis=1)
                radius = float(np.percentile(dists, 95))
            else:
                radius = 1.0
            self.state_radii.append(max(radius, 0.1))
            
        self.fitted = True

    def min_distance(self, observation: np.ndarray) -> Tuple[float, int]:
        """Returns the minimum Euclidean distance to any known prototype and its index."""
        if not self.fitted:
            return 0.0, -1
        distances = [np.linalg.norm(observation - proto) for proto in self.prototypes]
        min_idx = int(np.argmin(distances))
        return float(distances[min_idx]), min_idx

    def to_dict(self, feature_names: List[str]) -> List[Dict[str, Any]]:
        result = []
        for k in range(len(self.prototypes)):
            result.append({
                "id": k,
                "label": self.state_labels[k],
                "frequency": self.state_frequencies[k],
                "radius": round(self.state_radii[k], 4),
                "centroid": {feature_names[i]: round(float(self.prototypes[k][i]), 4) 
                             for i in range(len(feature_names))}
            })
        return result


class ContradictionMemory:
    """
    CM: Stores contradictory observations that violate learned known-state prototypes
    or temporal continuity, grouping evidence to discover persistent unknown states.
    """
    def __init__(self, max_records: int = 5000):
        self.max_records = max_records
        self.records: List[Dict[str, Any]] = []
        
    def add(
        self, 
        observation: np.ndarray, 
        timestamp: str, 
        contradiction_score: float, 
        score_breakdown: Dict[str, float],
        index: int
    ):
        record = {
            "index": index,
            "timestamp": timestamp,
            "observation": observation.copy(),
            "contradiction_score": round(contradiction_score, 4),
            "distance_score": round(score_breakdown["D"], 4),
            "temporal_score": round(score_breakdown["T"], 4),
            "anomaly_score": round(score_breakdown["A"], 4),
        }
        self.records.append(record)
        if len(self.records) > self.max_records:
            self.records.pop(0)

    def get_points(self) -> np.ndarray:
        if not self.records:
            return np.empty((0, 0))
        return np.array([r["observation"] for r in self.records])

    def to_summary(self) -> Dict[str, Any]:
        count = len(self.records)
        avg_score = float(np.mean([r["contradiction_score"] for r in self.records])) if count > 0 else 0.0
        
        # Clean recent records for fast and safe JSON serialization
        recent = []
        for r in self.records[-10:]:
            cleaned_r = {
                "index": r["index"],
                "timestamp": r["timestamp"],
                "contradiction_score": r["contradiction_score"],
                "distance_score": r["distance_score"],
                "temporal_score": r["temporal_score"],
                "anomaly_score": r["anomaly_score"],
                "observation": [round(float(x), 4) for x in r["observation"]]
            }
            recent.append(cleaned_r)
            
        return {
            "total_contradictions": count,
            "average_contradiction_score": round(avg_score, 4),
            "recent_records": recent
        }


class DiscoveryCandidate:
    """Represents an emerging or confirmed unknown operational state."""
    def __init__(
        self,
        candidate_id: str,
        first_detected: str,
        last_detected: str,
        observation_indices: List[int],
        centroid: np.ndarray,
        mean_score: float,
        cluster_density: float,
        evidence_count: int,
        status: str = "Pending"
    ):
        self.candidate_id = candidate_id
        self.first_detected = first_detected
        self.last_detected = last_detected
        self.observation_indices = observation_indices
        self.centroid = centroid
        self.mean_score = mean_score
        self.cluster_density = cluster_density
        self.evidence_count = evidence_count
        self.status = status  # Pending, Under Validation, Confirmed, Rejected
        self.explanation: str = ""
        self.feature_deltas: Dict[str, float] = {}

    def to_dict(self, feature_names: List[str]) -> Dict[str, Any]:
        return {
            "candidate_id": self.candidate_id,
            "first_detected": self.first_detected,
            "last_detected": self.last_detected,
            "observation_count": self.evidence_count,
            "mean_contradiction_score": round(float(self.mean_score), 4),
            "cluster_density": round(float(self.cluster_density), 4),
            "status": self.status,
            "explanation": self.explanation,
            "feature_deltas": {k: round(v, 4) for k, v in self.feature_deltas.items()},
            "prototype_vector": {feature_names[i]: round(float(self.centroid[i]), 4) 
                                 for i in range(len(feature_names))} if len(self.centroid) == len(feature_names) else {}
        }


class TRIOModel:
    """
    Main Contradiction-Guided Tri-Memory Unsupervised Learning System.
    """
    def __init__(
        self,
        alpha: float = 0.45,
        beta: float = 0.30,
        gamma: float = 0.25,
        stm_capacity: int = 30,
        contradiction_threshold: float = 0.48,
        min_evidence_discovery: int = 15,
        dbscan_eps: float = 0.65,
        dbscan_min_samples: int = 8
    ):
        # Configurable weights: C = alpha*D + beta*T + gamma*A
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.contradiction_threshold = contradiction_threshold
        self.min_evidence_discovery = min_evidence_discovery
        self.dbscan_eps = dbscan_eps
        self.dbscan_min_samples = dbscan_min_samples
        
        # Tri-Memory components
        self.stm = ShortTermMemory(capacity=stm_capacity)
        self.ltm = LongTermMemory()
        self.cm = ContradictionMemory()
        
        # Anomaly scoring baseline
        self.iso_forest = IsolationForest(contamination=0.04, random_state=42)
        
        # State & Candidates
        self.feature_names: List[str] = []
        self.candidates: List[DiscoveryCandidate] = []
        self.evaluation_results: Dict[str, Any] = {}
        self.is_trained: bool = False
        self.model_version: str = "v1.0.0"

    def update_weights(self, alpha: float, beta: float, gamma: float):
        """Update scoring weights with normalization."""
        total = alpha + beta + gamma
        if total <= 0:
            raise ValueError("Weights sum must be greater than zero.")
        self.alpha = alpha / total
        self.beta = beta / total
        self.gamma = gamma / total

    def train(self, X_train: np.ndarray, feature_names: List[str], n_known_clusters: int = 3):
        """
        Trains LTM on normal baseline operational data.
        """
        self.feature_names = feature_names
        
        # 1. Fit LTM known prototypes
        self.ltm.fit_known_states(X_train, n_clusters=n_known_clusters)
        
        # 2. Fit unsupervised density/anomaly baseline
        self.iso_forest.fit(X_train)
        
        self.is_trained = True
        self.model_version = f"v{datetime.now().strftime('%Y%m%d.%H%M')}"
        return self

    def compute_contradiction_score(
        self, 
        observation: np.ndarray,
        stm_window: np.ndarray,
        precomputed_a: Optional[float] = None
    ) -> Tuple[float, Dict[str, float]]:
        """
        Computes transparent contradiction score:
        C = alpha * D + beta * T + gamma * A
        """
        # Component 1: Distance from known LTM prototypes (D)
        min_dist, _ = self.ltm.min_distance(observation)
        # Normalized via sigmoid-like transformation
        D = 1.0 - np.exp(-0.8 * min_dist)
        D = float(np.clip(D, 0.0, 1.0))
        
        # Component 2: Temporal Inconsistency vs STM moving average (T)
        if len(stm_window) >= 2:
            stm_mean = np.mean(stm_window, axis=0)
            stm_diff = float(np.linalg.norm(observation - stm_mean))
            T = 1.0 - np.exp(-1.0 * stm_diff)
            T = float(np.clip(T, 0.0, 1.0))
        else:
            T = 0.0
            
        # Component 3: Anomaly score from baseline distribution (A)
        if precomputed_a is not None:
            A = precomputed_a
        else:
            raw_score = float(self.iso_forest.score_samples([observation])[0])
            A = 1.0 / (1.0 + np.exp(6.0 * (raw_score + 0.4)))
            A = float(np.clip(A, 0.0, 1.0))
        
        # Final combined Contradiction Score
        C = float(self.alpha * D + self.beta * T + self.gamma * A)
        C = float(np.clip(C, 0.0, 1.0))
        
        breakdown = {"D": D, "T": T, "A": A}
        return C, breakdown

    def process_stream(
        self, 
        X_test: np.ndarray, 
        timestamps: List[str]
    ) -> Dict[str, Any]:
        """
        Simulates online processing of test observations through STM, LTM, and CM.
        """
        if not self.is_trained:
            raise ValueError("Model is not trained. Train the model before processing stream.")
            
        n_obs = len(X_test)
        contradiction_scores = np.zeros(n_obs)
        assigned_states = []
        is_novel_flags = np.zeros(n_obs, dtype=int)
        
        detailed_observations = []
        
        # Batch precompute anomaly scores for fast vectorization
        raw_iso_scores = self.iso_forest.score_samples(X_test)
        batch_A = 1.0 / (1.0 + np.exp(6.0 * (raw_iso_scores + 0.4)))
        batch_A = np.clip(batch_A, 0.0, 1.0)
        
        for idx in range(n_obs):
            obs = X_test[idx]
            ts = timestamps[idx]
            
            # 1. Update STM
            stm_window = self.stm.get_recent_window()
            self.stm.push(obs, ts)
            
            # 2. Compute Contradiction Score
            score, breakdown = self.compute_contradiction_score(obs, stm_window, precomputed_a=float(batch_A[idx]))
            contradiction_scores[idx] = score
            
            # 3. Check if observation exceeds contradiction threshold
            if score >= self.contradiction_threshold:
                # Add to Contradiction Memory (CM)
                self.cm.add(obs, ts, score, breakdown, idx)
                state_assigned = "CONTRADICTION_FLAGGED"
                is_novel_flags[idx] = 1
            else:
                # Close match with known LTM prototype
                _, closest_proto_idx = self.ltm.min_distance(obs)
                state_assigned = self.ltm.state_labels[closest_proto_idx]
                
            assigned_states.append(state_assigned)
            
            # Keep sample of detailed observations for visualization
            if idx % max(1, n_obs // 80) == 0:
                detailed_observations.append({
                    "index": idx,
                    "timestamp": ts,
                    "contradiction_score": round(score, 4),
                    "assigned_state": state_assigned,
                    "distance_score": round(breakdown["D"], 4),
                    "temporal_score": round(breakdown["T"], 4),
                    "anomaly_score": round(breakdown["A"], 4),
                })
                
        # 4. Run Unknown Operational-State Discovery on Contradiction Memory
        self.discover_unknown_states(timestamps)
        
        # Binary prediction of confirmed unknown operational state:
        # Strictly points that formed cohesive discovery clusters in CM (filtering transient spikes)
        discovered_indices = set()
        for cand in self.candidates:
            if cand.status in ["Confirmed", "Under Validation"]:
                discovered_indices.update(cand.observation_indices)
                
        is_novel_flags = np.zeros(n_obs, dtype=int)
        for idx in discovered_indices:
            if idx < n_obs:
                is_novel_flags[idx] = 1
        
        return {
            "processed_count": n_obs,
            "contradiction_scores": contradiction_scores.tolist(),
            "assigned_states": assigned_states,
            "is_novel_flags": is_novel_flags.tolist(),
            "raw_contradiction_flags": (contradiction_scores >= self.contradiction_threshold).astype(int).tolist(),
            "samples": detailed_observations,
            "cm_records_count": len(self.cm.records),
            "candidates_found": len(self.candidates)
        }

    def discover_unknown_states(self, timestamps: List[str]):
        """
        Executes candidate discovery procedure:
        Groups CM records via DBSCAN in feature space, filters transient noise,
        checks cluster persistence and distance from known prototypes,
        and generates explainable discovery candidates.
        """
        self.candidates = []
        cm_records = self.cm.records
        if len(cm_records) < self.min_evidence_discovery:
            return
            
        cm_points = np.array([r["observation"] for r in cm_records])
        
        # Density-based clustering to find coherent unknown regimes
        clusterer = DBSCAN(eps=self.dbscan_eps, min_samples=self.dbscan_min_samples)
        cluster_labels = clusterer.fit_predict(cm_points)
        
        unique_labels = [l for l in np.unique(cluster_labels) if l != -1]
        
        for cluster_id in unique_labels:
            mask = cluster_labels == cluster_id
            cluster_size = int(np.sum(mask))
            
            # Enforce evidence persistence constraint
            if cluster_size < self.min_evidence_discovery:
                continue
                
            matched_records = [cm_records[i] for i in range(len(cm_records)) if mask[i]]
            matched_indices = [r["index"] for r in matched_records]
            matched_scores = [r["contradiction_score"] for r in matched_records]
            
            centroid = np.mean(cm_points[mask], axis=0)
            mean_score = float(np.mean(matched_scores))
            
            # Calculate cluster density (inverse of average intra-cluster pairwise distance)
            dists = np.linalg.norm(cm_points[mask] - centroid, axis=1)
            cluster_density = float(1.0 / (np.mean(dists) + 0.05))
            
            # Check separation from known LTM prototypes
            min_dist_to_ltm, _ = self.ltm.min_distance(centroid)
            
            # Status progression based on evidence & density
            if cluster_size >= 40 and cluster_density > 1.2 and min_dist_to_ltm > 1.0:
                status = "Confirmed"
            elif cluster_size >= self.min_evidence_discovery and min_dist_to_ltm > 0.8:
                status = "Under Validation"
            else:
                status = "Pending"
                
            cand_id = f"CAND-2026-{len(self.candidates)+1:03d}"
            first_ts = matched_records[0]["timestamp"]
            last_ts = matched_records[-1]["timestamp"]
            
            candidate = DiscoveryCandidate(
                candidate_id=cand_id,
                first_detected=first_ts,
                last_detected=last_ts,
                observation_indices=matched_indices,
                centroid=centroid,
                mean_score=mean_score,
                cluster_density=cluster_density,
                evidence_count=cluster_size,
                status=status
            )
            
            # Calculate feature deltas vs closest known prototype
            _, closest_idx = self.ltm.min_distance(centroid)
            closest_proto = self.ltm.prototypes[closest_idx]
            
            deltas = {}
            for f_idx, f_name in enumerate(self.feature_names):
                diff = float(centroid[f_idx] - closest_proto[f_idx])
                deltas[f_name] = diff
                
            candidate.feature_deltas = deltas
            
            # Generate human-readable explanation
            top_positive = sorted(deltas.items(), key=lambda x: x[1], reverse=True)[:2]
            top_negative = sorted(deltas.items(), key=lambda x: x[1])[:2]
            
            pos_desc = ", ".join([f"{k} (+{v:.2f} std)" for k, v in top_positive if v > 0.4])
            neg_desc = ", ".join([f"{k} ({v:.2f} std)" for k, v in top_negative if v < -0.4])
            
            explanation = (
                f"TRIO detected {cluster_size} sustained observations between {first_ts[-8:]} and {last_ts[-8:]} "
                f"forming a tight, non-transient cluster (density: {cluster_density:.2f}). "
                f"Unlike transient anomalies, this pattern persisted across {len(matched_indices)} timesteps. "
            )
            if pos_desc or neg_desc:
                explanation += f"Key sensor shifts from known baseline: {pos_desc or ''} {neg_desc or ''}."
            else:
                explanation += "Sensors exhibited a coherent joint correlation distinct from normal operation."
                
            candidate.explanation = explanation
            self.candidates.append(candidate)
            
    def update_candidate_status(self, candidate_id: str, new_status: str) -> bool:
        """Allow user to manually validate, confirm, or reject a candidate."""
        for c in self.candidates:
            if c.candidate_id == candidate_id:
                c.status = new_status
                return True
        return False
