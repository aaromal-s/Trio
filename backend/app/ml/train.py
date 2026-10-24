import os
import json
import joblib
import numpy as np
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix, classification_report
)

from app.ml.dataset import generate_telemetry_dataset
from app.core.config import settings

def train_and_evaluate_models():
    print("=== Phase 8: AegisOps ML Training & Verification Pipeline ===")
    
    # 1. Dataset Generation & Quality Validation
    X, y, feature_names, meta = generate_telemetry_dataset(
        n_samples=6000, 
        incident_ratio=0.165, 
        random_seed=42
    )
    
    # Check for NaNs or Infs
    assert not np.isnan(X).any(), "Data Quality Error: Detected NaNs in feature matrix"
    assert not np.isinf(X).any(), "Data Quality Error: Detected Infs in feature matrix"
    assert len(X) == len(y), "Data Quality Error: X and y length mismatch"
    
    # 2. Stratified Splits (70% Train, 15% Validation, 15% Held-out Test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    
    # 3. Preprocessing (Fitted ONLY on training data to prevent data leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Baseline Evaluation (Stratified Dummy & Heuristic)
    dummy = DummyClassifier(strategy="stratified", random_state=42)
    dummy.fit(X_train_scaled, y_train)
    dummy_preds = dummy.predict(X_test_scaled)
    dummy_acc = accuracy_score(y_test, dummy_preds)
    dummy_f1 = f1_score(y_test, dummy_preds, zero_division=0)
    
    print(f"[*] Baseline Dummy Accuracy: {dummy_acc:.4f}, F1: {dummy_f1:.4f}")
    
    # Simple Heuristic Baseline: (CPU > 85% or Latency > 600ms or Error > 5%)
    # Features: 0=CPU, 2=Latency, 4=Error
    heuristic_preds = (
        (X_test[:, 0] > 85.0) | (X_test[:, 2] > 600.0) | (X_test[:, 4] > 5.0)
    ).astype(int)
    heuristic_acc = accuracy_score(y_test, heuristic_preds)
    heuristic_f1 = f1_score(y_test, heuristic_preds, zero_division=0)
    print(f"[*] Heuristic Rule Baseline Accuracy: {heuristic_acc:.4f}, F1: {heuristic_f1:.4f}")
    
    # 5. Random Forest Model
    rf = RandomForestClassifier(
        n_estimators=180,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)
    
    # 6. Evaluation on Held-out Test Set
    test_preds = rf.predict(X_test_scaled)
    test_probs = rf.predict_proba(X_test_scaled)[:, 1]
    
    acc = float(accuracy_score(y_test, test_preds))
    prec = float(precision_score(y_test, test_preds, zero_division=0))
    rec = float(recall_score(y_test, test_preds, zero_division=0))
    f1 = float(f1_score(y_test, test_preds, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, test_probs))
    pr_auc = float(average_precision_score(y_test, test_probs))
    
    # Confusion Matrix: [[TN, FP], [FN, TP]]
    cm = confusion_matrix(y_test, test_preds)
    tn, fp, fn, tp = cm.ravel()
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
    
    print(f"[+] Random Forest Test Results:")
    print(f"    Accuracy:  {acc * 100:.2f}%")
    print(f"    Precision: {prec * 100:.2f}%")
    print(f"    Recall:    {rec * 100:.2f}%")
    print(f"    F1 Score:  {f1:.4f}")
    print(f"    ROC-AUC:   {roc_auc:.4f}")
    print(f"    PR-AUC:    {pr_auc:.4f}")
    print(f"    FPR:       {fpr * 100:.2f}% | FNR: {fnr * 100:.2f}%")
    print(f"    Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    
    # 7. Unsupervised Isolation Forest for Anomaly Detection (Trained on nominal data)
    X_train_nominal = X_train_scaled[y_train == 0]
    iso = IsolationForest(
        n_estimators=120,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X_train_nominal)
    
    # 8. Feature Importance Mapping
    raw_importances = rf.feature_importances_
    feature_importances_dict = {
        name: float(round(imp, 4)) for name, imp in zip(feature_names, raw_importances)
    }
    
    # 9. Persist Model Artifacts
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    
    model_bundle = {
        "model": rf,
        "scaler": scaler,
        "feature_names": feature_names,
        "feature_importances": feature_importances_dict,
        "version": "rf-v1.4.2",
        "trained_at": datetime.now(timezone.utc).isoformat()
    }
    joblib.dump(model_bundle, settings.MODEL_FILE)
    
    iso_bundle = {
        "model": iso,
        "scaler": scaler,
        "version": "iso-v1.2.0"
    }
    iso_file = os.path.join(settings.MODEL_DIR, "isolation_forest.joblib")
    joblib.dump(iso_bundle, iso_file)
    
    # Metrics JSON
    metrics_payload = {
        "model_name": "AegisOps Incident Risk Predictor",
        "model_version": "rf-v1.4.2",
        "algorithm": "RandomForestClassifier(n_estimators=180, class_weight='balanced_subsample')",
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "false_positive_rate": fpr,
        "false_negative_rate": fnr,
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        },
        "baselines": {
            "dummy_stratified": {"accuracy": float(dummy_acc), "f1_score": float(dummy_f1)},
            "heuristic_rule": {"accuracy": float(heuristic_acc), "f1_score": float(heuristic_f1)}
        },
        "evaluation_counts": {
            "train_samples": int(len(X_train)),
            "val_samples": int(len(X_val)),
            "test_samples": int(len(X_test)),
            "total_samples": int(len(X))
        },
        "feature_importances": feature_importances_dict,
        "dataset_metadata": meta,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "verified_truth": True
    }
    
    with open(settings.METRICS_FILE, "w") as f:
        json.dump(metrics_payload, f, indent=2)
        
    print(f"[OK] Successfully serialized artifacts to {settings.MODEL_DIR}")
    return metrics_payload

if __name__ == "__main__":
    train_and_evaluate_models()
