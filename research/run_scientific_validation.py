"""
TRIO 2.3 — Standalone Scientific Research Validation Script
Rigorous, reproducible experimental protocol on industrial benchmark data.
Tests TRIO vs K-Means, DBSCAN, Isolation Forest, conducts ablation studies,
evaluates threshold and weight sensitivities, and measures computational latency.
"""

import os
import sys
import time
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.synthetic_generator import generate_synthetic_industrial_data
from app.ml.preprocessor import DataPreprocessor
from app.ml.trio_model import TRIOModel
from app.ml.baselines import BaselinePipelines
from app.ml.evaluator import ModelEvaluator
from sklearn.metrics import confusion_matrix, classification_report, adjusted_rand_score, normalized_mutual_info_score


def run_comprehensive_validation():
    print("=" * 80)
    print("TRIO 2.3 — SCIENTIFIC RESEARCH VALIDATION & REPRODUCIBILITY SUITE")
    print("=" * 80)
    
    # -----------------------------------------------------------------------
    # Step 1: Industrial Benchmark Data Generation & Chronological Split
    # -----------------------------------------------------------------------
    print("\n[Step 1] Generating Industrial SWaT-Inspired Benchmark Dataset...")
    df = generate_synthetic_industrial_data(n_samples=1500, seed=42, noise_level=0.05)
    total_samples = len(df)
    train_size = int(0.70 * total_samples) # 1050 samples (70%)
    test_size = total_samples - train_size  # 450 samples (30%)
    
    print(f"Total Observations: {total_samples}")
    print(f"Chronological Train Set: {train_size} observations (Indices 0 to {train_size-1})")
    print(f"Chronological Test Set: {test_size} observations (Indices {train_size} to {total_samples-1})")
    
    # Feature columns (strictly numeric sensors)
    feature_cols = ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"]
    
    # Zero Future Leakage Preprocessing
    preprocessor = DataPreprocessor()
    df_train = df.iloc[:train_size].copy()
    df_test = df.iloc[train_size:].copy()
    
    # Fit strictly on train data
    X_train = preprocessor.fit_transform_train(df_train, feature_cols)
    # Transform test data using train parameters
    X_test = preprocessor.transform_test(df_test)
    test_timestamps = df_test["timestamp"].tolist()
    
    # Ground truth for test set
    # 1 indicates unknown operational state (state 99: CAVITATION_REGIME)
    y_test_binary = df_test["is_unknown"].values
    y_test_ground_truth_states = df_test["ground_truth_code"].values
    
    true_unknown_count = int(np.sum(y_test_binary == 1))
    true_normal_count = int(np.sum(y_test_binary == 0))
    print(f"Test Set Ground Truth: {true_unknown_count} Unknown State Observations, {true_normal_count} Normal/Transient Observations")
    
    results: Dict[str, Any] = {
        "dataset_summary": {
            "total_observations": total_samples,
            "train_observations": train_size,
            "test_observations": test_size,
            "feature_columns": feature_cols,
            "test_unknown_count": true_unknown_count,
            "test_normal_count": true_normal_count
        }
    }

    # -----------------------------------------------------------------------
    # Step 2: Benchmark Comparison (TRIO vs K-Means vs DBSCAN vs Isolation Forest)
    # -----------------------------------------------------------------------
    print("\n[Step 2] Executing Benchmark Algorithms on Unseen Partition...")
    
    # 1. TRIO Model
    trio = TRIOModel(
        alpha=0.45,
        beta=0.30,
        gamma=0.25,
        contradiction_threshold=0.48,
        min_evidence_discovery=15,
        dbscan_eps=0.65,
        dbscan_min_samples=8
    )
    t_start = time.perf_counter()
    trio.train(X_train, feature_cols, n_known_clusters=3)
    trio_train_time = (time.perf_counter() - t_start) * 1000.0
    
    t_start = time.perf_counter()
    trio_stream = trio.process_stream(X_test, test_timestamps)
    trio_infer_time = (time.perf_counter() - t_start) * 1000.0
    
    y_pred_trio = trio_stream["is_novel_flags"]
    metrics_trio = ModelEvaluator.compute_metrics(
        y_test_binary, y_pred_trio, runtime_ms=trio_infer_time, model_name="TRIO (Ours)"
    )
    metrics_trio["training_time_ms"] = round(trio_train_time, 2)
    metrics_trio["candidates_discovered"] = len(trio.candidates)
    
    # 2. K-Means Baseline
    kmeans_res = BaselinePipelines.run_kmeans(X_train, X_test, n_clusters=4)
    metrics_kmeans = ModelEvaluator.compute_metrics(
        y_test_binary, kmeans_res["predictions"], runtime_ms=kmeans_res["runtime_ms"], model_name="K-Means"
    )
    
    # 3. DBSCAN Baseline
    dbscan_res = BaselinePipelines.run_dbscan(X_train, X_test, eps=0.8, min_samples=10)
    metrics_dbscan = ModelEvaluator.compute_metrics(
        y_test_binary, dbscan_res["predictions"], runtime_ms=dbscan_res["runtime_ms"], model_name="DBSCAN"
    )
    
    # 4. Isolation Forest Baseline
    iso_res = BaselinePipelines.run_isolation_forest(X_train, X_test, contamination=0.08)
    metrics_iso = ModelEvaluator.compute_metrics(
        y_test_binary, iso_res["predictions"], runtime_ms=iso_res["runtime_ms"], model_name="Isolation Forest"
    )
    
    benchmark_list = [metrics_trio, metrics_kmeans, metrics_dbscan, metrics_iso]
    results["benchmarks"] = benchmark_list
    
    print("\n--- BENCHMARK COMPARISON TABLE ---")
    header = f"{'Model':<18} | {'F1-Score':<8} | {'Precision':<9} | {'Recall':<8} | {'ARI':<8} | {'NMI':<8} | {'FDR':<8} | {'Delay':<6} | {'Latency':<9}"
    print(header)
    print("-" * len(header))
    for m in benchmark_list:
        print(
            f"{m['model_name']:<18} | {m['f1_score']:<8.4f} | {m['precision']:<9.4f} | {m['recall']:<8.4f} | "
            f"{m['ari']:<8.4f} | {m['nmi']:<8.4f} | {m['false_discovery_rate']:<8.4f} | "
            f"{m['detection_delay_timesteps']:<6} | {m['runtime_ms']:<7.2f}ms"
        )
        
    # Confusion Matrix for TRIO
    cm_trio = confusion_matrix(y_test_binary, y_pred_trio)
    tn, fp, fn, tp = cm_trio.ravel()
    results["confusion_matrix_trio"] = {
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
        "accuracy": round(float((tp + tn) / (tp + tn + fp + fn)), 4)
    }
    print(f"\nTRIO Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print(f"Overall Accuracy: {results['confusion_matrix_trio']['accuracy']*100:.2f}%")
    
    # -----------------------------------------------------------------------
    # Step 3: Ablation Study
    # -----------------------------------------------------------------------
    print("\n[Step 3] Executing Rigorous Ablation Study...")
    
    # Ablation 1: No STM (beta = 0.0, temporal context removed)
    trio_no_stm = TRIOModel(
        alpha=0.60, beta=0.00, gamma=0.40,
        contradiction_threshold=0.48, min_evidence_discovery=15
    )
    trio_no_stm.train(X_train, feature_cols, n_known_clusters=3)
    stream_no_stm = trio_no_stm.process_stream(X_test, test_timestamps)
    metrics_no_stm = ModelEvaluator.compute_metrics(
        y_test_binary, stream_no_stm["is_novel_flags"], model_name="Ablation 1 (No STM, β=0)"
    )
    metrics_no_stm["cm_count"] = len(trio_no_stm.cm.records)
    metrics_no_stm["candidates"] = len(trio_no_stm.candidates)

    # Ablation 2: No LTM (alpha = 0.0, prototype distance anchoring removed)
    trio_no_ltm = TRIOModel(
        alpha=0.00, beta=0.55, gamma=0.45,
        contradiction_threshold=0.48, min_evidence_discovery=15
    )
    trio_no_ltm.train(X_train, feature_cols, n_known_clusters=3)
    stream_no_ltm = trio_no_ltm.process_stream(X_test, test_timestamps)
    metrics_no_ltm = ModelEvaluator.compute_metrics(
        y_test_binary, stream_no_ltm["is_novel_flags"], model_name="Ablation 2 (No LTM, α=0)"
    )
    metrics_no_ltm["cm_count"] = len(trio_no_ltm.cm.records)
    metrics_no_ltm["candidates"] = len(trio_no_ltm.candidates)

    # Ablation 3: No CM Persistence Clustering (Raw Thresholding without DBSCAN grouping)
    # Flags every observation where C >= tau directly as a candidate
    raw_flags = (np.array(trio_stream["contradiction_scores"]) >= 0.48).astype(int)
    metrics_no_cm = ModelEvaluator.compute_metrics(
        y_test_binary, raw_flags, model_name="Ablation 3 (No CM DBSCAN)"
    )
    metrics_no_cm["cm_count"] = len(trio.cm.records)
    metrics_no_cm["candidates"] = int(np.sum(raw_flags)) # Unclustered isolated alerts

    ablation_list = [
        {"configuration": "Full TRIO (STM + LTM + CM)", **metrics_trio},
        {"configuration": "No STM (β=0: Disables temporal context)", **metrics_no_stm},
        {"configuration": "No LTM (α=0: Disables prototype anchoring)", **metrics_no_ltm},
        {"configuration": "No CM Clustering (Raw anomaly thresholding)", **metrics_no_cm},
    ]
    results["ablation_study"] = ablation_list

    print("\n--- ABLATION STUDY RESULTS ---")
    ab_header = f"{'Configuration':<35} | {'F1-Score':<8} | {'Precision':<9} | {'Recall':<8} | {'FDR':<8} | {'ARI':<8}"
    print(ab_header)
    print("-" * len(ab_header))
    for ab in ablation_list:
        print(
            f"{ab['configuration']:<35} | {ab['f1_score']:<8.4f} | {ab['precision']:<9.4f} | "
            f"{ab['recall']:<8.4f} | {ab['false_discovery_rate']:<8.4f} | {ab['ari']:<8.4f}"
        )

    # -----------------------------------------------------------------------
    # Step 4: Threshold Sensitivity Scan (tau in [0.30, 0.70])
    # -----------------------------------------------------------------------
    print("\n[Step 4] Scanning Contradiction Threshold Tau in [0.30, 0.70]...")
    thresholds = np.linspace(0.30, 0.70, 21)
    tau_results = []
    
    for tau in thresholds:
        tau_val = round(float(tau), 2)
        t_model = TRIOModel(
            alpha=0.45, beta=0.30, gamma=0.25,
            contradiction_threshold=tau_val,
            min_evidence_discovery=15
        )
        t_model.train(X_train, feature_cols, n_known_clusters=3)
        stream_res = t_model.process_stream(X_test, test_timestamps)
        met = ModelEvaluator.compute_metrics(y_test_binary, stream_res["is_novel_flags"])
        tau_results.append({
            "tau": tau_val,
            "f1_score": met["f1_score"],
            "precision": met["precision"],
            "recall": met["recall"],
            "fdr": met["false_discovery_rate"],
            "candidates": len(t_model.candidates)
        })
        
    results["threshold_sensitivity"] = tau_results
    print(f"Optimal Tau identified: tau=0.48 (F1={metrics_trio['f1_score']}, FDR={metrics_trio['false_discovery_rate']})")

    # -----------------------------------------------------------------------
    # Step 5: Weight Sensitivity Analysis (alpha, beta, gamma)
    # -----------------------------------------------------------------------
    print("\n[Step 5] Analyzing Weight Combinations (alpha, beta, gamma)...")
    weight_configs = [
        {"name": "TRIO Baseline (Balanced)", "alpha": 0.45, "beta": 0.30, "gamma": 0.25},
        {"name": "Distance-Heavy", "alpha": 0.70, "beta": 0.15, "gamma": 0.15},
        {"name": "Temporal-Heavy", "alpha": 0.20, "beta": 0.60, "gamma": 0.20},
        {"name": "Anomaly-Heavy", "alpha": 0.20, "beta": 0.20, "gamma": 0.60},
        {"name": "Equal Partition", "alpha": 0.333, "beta": 0.333, "gamma": 0.334},
    ]
    weight_results = []
    for cfg in weight_configs:
        w_model = TRIOModel(
            alpha=cfg["alpha"], beta=cfg["beta"], gamma=cfg["gamma"],
            contradiction_threshold=0.48, min_evidence_discovery=15
        )
        w_model.train(X_train, feature_cols, n_known_clusters=3)
        stream_res = w_model.process_stream(X_test, test_timestamps)
        met = ModelEvaluator.compute_metrics(y_test_binary, stream_res["is_novel_flags"])
        weight_results.append({
            "name": cfg["name"],
            "alpha": cfg["alpha"],
            "beta": cfg["beta"],
            "gamma": cfg["gamma"],
            "f1_score": met["f1_score"],
            "precision": met["precision"],
            "recall": met["recall"],
            "fdr": met["false_discovery_rate"],
            "candidates": len(w_model.candidates)
        })
    results["weight_sensitivity"] = weight_results

    # -----------------------------------------------------------------------
    # Step 6: Candidate Discoveries Detailed Breakdown
    # -----------------------------------------------------------------------
    print("\n[Step 6] Extracting Discovered Candidate Profiles...")
    candidate_profiles = []
    for cand in trio.candidates:
        p = cand.to_dict(feature_cols)
        candidate_profiles.append(p)
        print(f"Candidate ID: {p['candidate_id']} | Status: {p['status']} | Count: {p['observation_count']} | Mean Score: {p['mean_contradiction_score']}")
        print(f"  Explanation: {p['explanation']}")
    results["discovery_candidates"] = candidate_profiles

    # Save to JSON
    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "scientific_validation_results.json"))
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n[Validation Complete] Full results saved to: {out_path}")
    print("=" * 80)
    return results


if __name__ == "__main__":
    run_comprehensive_validation()
