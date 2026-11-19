"""
Test TRIO validation and training on preprocessed MetroPT3 dataset
"""
import sys, os
sys.path.insert(0, os.path.abspath("backend"))
import pandas as pd
from app.services.state_service import state_service

csv_path = "backend/data/MetroPT3_AirCompressor_Operational.csv"
print(f"Loading {csv_path}...")
df = pd.read_csv(csv_path)
print(f"Shape: {df.shape}")
print("Columns:", df.columns.tolist())

# Validate using TRIO Preprocessor
val = state_service.preprocessor.validate_dataset(df)
print("\nValidation Results:")
print("  is_valid:", val["is_valid"])
print("  row_count:", val["row_count"])
print("  column_count:", val["column_count"])
print("  timestamp_column:", val["timestamp_column"])
print("  numeric_columns:", val["numeric_columns"])

# Select continuous industrial sensors
selected_features = ["TP2", "TP3", "H1", "DV_pressure", "Reservoirs", "Oil_temperature", "Motor_current"]
print("\nSetting active dataset...")
state_service.set_dataset(df, "MetroPT-3 Railway Air Production Unit (APU) SCADA Telemetry", is_simulated=False)
state_service.feature_cols = selected_features
state_service.actuator_cols = ["COMP", "DV_eletric", "Towers"]

print("Training TRIO on MetroPT3 telemetry...")
train_res = state_service.train_all(feature_cols=selected_features)
print("\nTraining Success!")
print("  Model Version:", train_res["version"])
print("  Candidates Discovered:", train_res["candidates_count"])
print("  Evaluation Results:")
for ev in train_res["evaluation"]:
    print(f"    - {ev['model_name']}: F1={ev.get('f1_score', 0):.4f}, Precision={ev.get('precision', 0):.4f}, Recall={ev.get('recall', 0):.4f}, Runtime={ev.get('runtime_ms', 0):.1f}ms")
