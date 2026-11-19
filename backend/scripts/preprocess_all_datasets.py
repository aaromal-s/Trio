"""
Comprehensive Dataset Preprocessor for TRIO
Processes both MetroPT3 (Air Compressor) and UCI Hydraulic Systems into production-ready formats.
"""
import os
import sys
import pandas as pd
import numpy as np

DATASET_DIR = "Dataset"
OUTPUT_DIR = "backend/data"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def preprocess_metro_pt3():
    print("=" * 60)
    print("1. PREPROCESSING MetroPT3 (Railway Air Compressor SCADA)")
    print("=" * 60)
    
    metro_file = os.path.join(DATASET_DIR, "MetroPT3(AirCompressor).csv")
    if not os.path.exists(metro_file):
        print(f"Error: {metro_file} not found!")
        return None
        
    # Read baseline healthy period (February 2020)
    print("Extracting Baseline Healthy Operations (Feb 2020)...")
    baseline_chunks = []
    # Read 1,200 rows of healthy cycling (step = 2 for smooth temporal continuity)
    chunk = pd.read_csv(metro_file, skiprows=1000, nrows=2400)
    chunk.columns = ['Unnamed: 0', 'timestamp', 'TP2', 'TP3', 'H1', 'DV_pressure', 'Reservoirs', 'Oil_temperature', 'Motor_current', 'COMP', 'DV_eletric', 'Towers', 'MPG', 'LPS', 'Pressure_switch', 'Oil_level', 'Caudal_impulses']
    baseline_df = chunk.iloc[::2].copy().reset_index(drop=True)
    baseline_df['ground_truth_state'] = np.where(baseline_df['Motor_current'] > 2.0, "NORMAL_COMPRESSION", "NORMAL_STANDBY")
    baseline_df['ground_truth_code'] = np.where(baseline_df['Motor_current'] > 2.0, 0, 1)
    baseline_df['is_unknown'] = 0
    baseline_df['is_anomaly'] = 0
    print(f"  Extracted {len(baseline_df)} baseline observations.")

    # Read Drift / High Load period (June 2020)
    print("Extracting Operational Drift / Thermal Buildup (June 2020)...")
    # Around row 900,000 (June 2020)
    drift_chunk = pd.read_csv(metro_file, skiprows=900000, nrows=1000)
    drift_chunk.columns = baseline_df.columns[:17]
    drift_df = drift_chunk.iloc[::2].copy().reset_index(drop=True)
    drift_df['ground_truth_state'] = "THERMAL_DRIFT_ELEVATED"
    drift_df['ground_truth_code'] = 2
    drift_df['is_unknown'] = 0
    drift_df['is_anomaly'] = 0
    print(f"  Extracted {len(drift_df)} thermal drift observations.")

    # Read Severe Failure / Overheating Anomaly (July 15, 2020)
    print("Extracting Severe Overheat Anomaly / Emergent Regime (July 15, 2020)...")
    # Around row 1,180,000 (July 15, 2020) where temp hits ~85-89 C
    # Let's locate the exact offset
    anomaly_chunk = None
    for offset in range(1150000, 1250000, 10000):
        c = pd.read_csv(metro_file, skiprows=offset, nrows=1000)
        c.columns = baseline_df.columns[:17]
        if c['Oil_temperature'].max() > 80.0:
            anomaly_chunk = c[c['Oil_temperature'] > 75.0].copy()
            break
            
    if anomaly_chunk is not None and len(anomaly_chunk) > 100:
        anom_df = anomaly_chunk.head(600).copy().reset_index(drop=True)
    else:
        # Fallback to high temp search
        c = pd.read_csv(metro_file, skiprows=1170000, nrows=1200)
        c.columns = baseline_df.columns[:17]
        anom_df = c.iloc[::2].copy().reset_index(drop=True)

    anom_df['ground_truth_state'] = "NOVEL_OVERHEAT_REGIME"
    anom_df['ground_truth_code'] = 99
    anom_df['is_unknown'] = 1
    anom_df['is_anomaly'] = 1
    print(f"  Extracted {len(anom_df)} severe overheat anomaly observations (Max temp: {anom_df['Oil_temperature'].max():.1f}°C).")

    # Combine into chronological operational dataset
    operational_df = pd.concat([baseline_df, drift_df, anom_df], ignore_index=True)
    
    # Drop raw Unnamed: 0 and unused constant actuators
    operational_df = operational_df.drop(columns=['Unnamed: 0'], errors='ignore')
    
    # Ensure timestamps are uniform and clean
    out_csv = os.path.join(OUTPUT_DIR, "MetroPT3_AirCompressor_Operational.csv")
    operational_df.to_csv(out_csv, index=False)
    print(f"Saved Operational Dataset to {out_csv} ({len(operational_df)} rows, {len(operational_df.columns)} columns)")
    
    # Also save a copy inside Dataset folder
    ds_copy = os.path.join(DATASET_DIR, "MetroPT3_AirCompressor_Preprocessed.csv")
    operational_df.to_csv(ds_copy, index=False)
    print(f"Saved copy to {ds_copy}")
    
    return operational_df

def preprocess_hydraulic():
    print("\n" + "=" * 60)
    print("2. PREPROCESSING UCI Hydraulic Test Rig Dataset")
    print("=" * 60)
    
    prof_file = os.path.join(DATASET_DIR, "profile.txt")
    if not os.path.exists(prof_file):
        print(f"Error: {prof_file} not found!")
        return None
        
    print("Loading cycle targets from profile.txt...")
    targets = pd.read_csv(prof_file, sep='\t', header=None)
    targets.columns = ['cooler_condition', 'valve_condition', 'pump_leakage', 'accumulator_pressure', 'stable_flag']
    
    data_dict = {
        'cycle_id': list(range(1, len(targets) + 1)),
        'cooler_condition': targets['cooler_condition'],
        'valve_condition': targets['valve_condition'],
        'pump_leakage': targets['pump_leakage'],
        'accumulator_pressure': targets['accumulator_pressure'],
        'stable_flag': targets['stable_flag']
    }
    
    # Load each sensor file and extract cycle mean & std
    sensors = [
        ('PS1.txt', 'PS1_pressure_bar'),
        ('PS2.txt', 'PS2_pressure_bar'),
        ('EPS1.txt', 'EPS1_motor_power_w'),
        ('FS1.txt', 'FS1_flow_lmin'),
        ('TS1.txt', 'TS1_temp_c'),
        ('TS2.txt', 'TS2_temp_c'),
        ('VS1.txt', 'VS1_vibration_mms'),
        ('CE.txt', 'CE_cooling_eff_pct'),
        ('CP.txt', 'CP_cooling_power_kw')
    ]
    
    for filename, col_name in sensors:
        filepath = os.path.join(DATASET_DIR, filename)
        if os.path.exists(filepath):
            print(f"  Processing {filename}...")
            # Each row is a cycle
            sensor_mat = pd.read_csv(filepath, sep='\t', header=None)
            data_dict[f"{col_name}_mean"] = sensor_mat.mean(axis=1).round(3)
            data_dict[f"{col_name}_std"] = sensor_mat.std(axis=1).round(3)
            data_dict[f"{col_name}_max"] = sensor_mat.max(axis=1).round(3)
            data_dict[f"{col_name}_min"] = sensor_mat.min(axis=1).round(3)
            
    hydraulic_df = pd.DataFrame(data_dict)
    
    # Define ground truth anomaly flag (fault in cooler <= 20% or pump leakage > 0 or accumulator <= 100 bar)
    is_anomaly = (
        (hydraulic_df['cooler_condition'] <= 20) | 
        (hydraulic_df['valve_condition'] <= 80) | 
        (hydraulic_df['pump_leakage'] >= 1) | 
        (hydraulic_df['accumulator_pressure'] <= 100)
    ).astype(int)
    
    hydraulic_df['is_anomaly'] = is_anomaly
    hydraulic_df['is_unknown'] = np.where(hydraulic_df['pump_leakage'] == 2, 1, 0)
    hydraulic_df['ground_truth_state'] = np.where(
        is_anomaly == 0, "NORMAL_HYDRAULIC_OPERATION",
        np.where(hydraulic_df['pump_leakage'] == 2, "SEVERE_PUMP_LEAKAGE", "COMPONENT_DEGRADATION")
    )
    
    out_csv = os.path.join(OUTPUT_DIR, "Hydraulic_Test_Rig_Preprocessed.csv")
    hydraulic_df.to_csv(out_csv, index=False)
    print(f"Saved Hydraulic Dataset to {out_csv} ({len(hydraulic_df)} cycles, {len(hydraulic_df.columns)} features)")
    
    ds_copy = os.path.join(DATASET_DIR, "Hydraulic_Test_Rig_Preprocessed.csv")
    hydraulic_df.to_csv(ds_copy, index=False)
    print(f"Saved copy to {ds_copy}")
    
    return hydraulic_df

if __name__ == "__main__":
    preprocess_metro_pt3()
    preprocess_hydraulic()
