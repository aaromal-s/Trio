"""
Test and optimize TRIO on MetroPT3
"""
import sys, os
sys.path.insert(0, os.path.abspath("backend"))
import pandas as pd
import numpy as np
from app.services.state_service import state_service

csv_path = "backend/data/MetroPT3_AirCompressor_Operational.csv"
df = pd.read_csv(csv_path)

selected_features = ["TP2", "TP3", "H1", "DV_pressure", "Reservoirs", "Oil_temperature", "Motor_current"]
state_service.set_dataset(df, "MetroPT-3 Railway Air Production Unit (APU) SCADA Telemetry", is_simulated=False)
state_service.feature_cols = selected_features
state_service.actuator_cols = ["COMP", "DV_eletric", "Towers"]

# Calibrate contradiction threshold
print("Testing with different thresholds...")
for thresh in [0.48, 0.40, 0.35, 0.30]:
    state_service.trio_model.contradiction_threshold = thresh
    train_res = state_service.train_all(feature_cols=selected_features)
    trio_eval = train_res["evaluation"][0]
    print(f"Threshold {thresh:.2f}: F1={trio_eval['f1_score']:.4f}, Prec={trio_eval['precision']:.4f}, Rec={trio_eval['recall']:.4f}, Candidates={train_res['candidates_count']}")
