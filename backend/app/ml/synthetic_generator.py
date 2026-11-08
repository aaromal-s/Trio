"""
TRIO Synthetic Industrial Sensor Dataset Generator
Simulates a multi-stage industrial water treatment process (inspired by SWaT: Secure Water Treatment testbed).
Generates realistic normal cyclical patterns, gradual fouling drift, transient anomalies, and persistent novel unknown operating regimes.
"""

from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_industrial_data(
    n_samples: int = 1500,
    seed: int = 42,
    noise_level: float = 0.05
) -> pd.DataFrame:
    """
    Generates a realistic multi-sensor time series dataset.
    
    States:
      - 0: Normal Inflow & Filtration (Normal Cycle A)
      - 1: High-Rate Dosing & Discharge (Normal Cycle B)
      - 2: Gradual Membrane Fouling (Drift)
      - -1: Transient Sensor Glitch / Valve Flutter (Temporary Anomaly)
      - 99: Novel Unknown Operational State (e.g. Pump Cavitation & Partial Blockage Regime)
    """
    np.random.seed(seed)
    
    start_time = datetime(2026, 11, 8, 8, 0, 0)
    timestamps = [start_time + timedelta(seconds=5 * i) for i in range(n_samples)]
    
    # Base cyclical pattern across time (tank filling and emptying cycles)
    t = np.linspace(0, 12 * np.pi, n_samples)
    
    # Base Sensor Readings
    # FIT101: Inflow Flow Meter (Normal ~ 2.4 - 2.8 m3/h)
    fit101 = 2.5 + 0.3 * np.sin(t) + np.random.normal(0, noise_level * 0.5, n_samples)
    
    # LIT101: Water Tank Level (Normal ~ 700 - 900 mm)
    lit101 = 800.0 + 120.0 * np.cos(t * 0.8) + np.random.normal(0, noise_level * 15.0, n_samples)
    
    # MV101: Motorized Valve 101 (Open 1 when level low, 0 when high)
    mv101 = np.where(lit101 < 820.0, 1.0, 0.0)
    
    # P101: Raw Water Pump (Status: 1.0 = Pump A Active, 2.0 = Pump B Active)
    p101 = np.where(fit101 > 2.5, 1.0, 2.0)
    
    # DPIT301: Differential Pressure Transmitter across filter (Normal ~ 0.22 - 0.28 bar)
    dpit301 = 0.25 + 0.02 * np.sin(t * 1.5) + np.random.normal(0, noise_level * 0.04, n_samples)
    
    # FIT201: Chemical Dosing Flow (Normal ~ 0.8 - 1.2 L/min)
    fit201 = 1.0 + 0.15 * np.cos(t * 0.5) + np.random.normal(0, noise_level * 0.08, n_samples)
    
    # AIT202: Water pH Analyzer (Normal ~ 7.1 - 7.5)
    ait202 = 7.3 + 0.12 * np.sin(t * 0.4) + np.random.normal(0, noise_level * 0.05, n_samples)
    
    # AIT402: Dissolved Solids / Conductivity (Normal ~ 250 - 280 uS/cm)
    ait402 = 265.0 + 12.0 * np.sin(t * 0.7) + np.random.normal(0, noise_level * 4.0, n_samples)

    # State tracking arrays
    state_labels = np.zeros(n_samples, dtype=int)
    state_names = ["NORMAL_CYCLE_A"] * n_samples
    is_unknown = np.zeros(n_samples, dtype=int)
    anomaly_flag = np.zeros(n_samples, dtype=int)
    
    # 1. Normal Cycle B when MV101 is closed and level is high
    for i in range(n_samples):
        if mv101[i] == 0.0:
            state_labels[i] = 1
            state_names[i] = "NORMAL_CYCLE_B"
            
    # 2. Gradual Drift (Membrane Biofouling): ~33% to ~50% of timeline
    drift_start = int(0.33 * n_samples)
    drift_end = int(0.50 * n_samples)
    drift_len = drift_end - drift_start
    if drift_len > 0:
        drift_factor = np.linspace(0, 0.12, drift_len)
        dpit301[drift_start:drift_end] += drift_factor
        fit101[drift_start:drift_end] -= (drift_factor * 1.2)
        for i in range(drift_start, drift_end):
            state_labels[i] = 2
            state_names[i] = "DRIFT_BIOFOULING"
        
    # 3. Temporary Anomalies (Transient spikes / sensor chatter)
    # Event 1: Sensor glitch (~15% of timeline)
    e1_start = min(n_samples - 6, max(0, int(0.15 * n_samples)))
    e1_end = min(n_samples, e1_start + 6)
    if e1_end > e1_start:
        fit101[e1_start:e1_end] += 2.2
        ait202[e1_start:e1_end] -= 1.8
        for i in range(e1_start, e1_end):
            state_labels[i] = -1
            state_names[i] = "TRANSIENT_SPIKE"
            anomaly_flag[i] = 1
        
    # Event 2: Pressure surge (~58% of timeline)
    e2_start = min(n_samples - 8, max(0, int(0.58 * n_samples)))
    e2_end = min(n_samples, e2_start + 8)
    if e2_end > e2_start:
        dpit301[e2_start:e2_end] += 0.35
        for i in range(e2_start, e2_end):
            state_labels[i] = -1
            state_names[i] = "TRANSIENT_SPIKE"
            anomaly_flag[i] = 1

    # 4. PERSISTENT UNKNOWN OPERATIONAL STATE (Novel Regime: Stage 2 Cavitation & Partial Recirculation)
    # Occurs from ~70% to ~85% of timeline
    # Forms a distinct, coherent cluster in multi-sensor space:
    unk_start = int(0.70 * n_samples)
    unk_end = int(0.85 * n_samples)
    unk_len = unk_end - unk_start
    if unk_len > 0:
        dpit301[unk_start:unk_end] = 0.48 + np.random.normal(0, 0.015, unk_len)
        fit101[unk_start:unk_end] = 1.35 + np.random.normal(0, 0.04, unk_len)
        fit201[unk_start:unk_end] = 2.05 + np.random.normal(0, 0.06, unk_len)
        ait402[unk_start:unk_end] = 338.0 + np.random.normal(0, 5.0, unk_len)
        ait202[unk_start:unk_end] = 6.85 + np.random.normal(0, 0.04, unk_len)
        
        for i in range(unk_start, unk_end):
            state_labels[i] = 99
            state_names[i] = "UNKNOWN_CAVITATION_REGIME"
            is_unknown[i] = 1

    df = pd.DataFrame({
        "timestamp": [ts.isoformat() for ts in timestamps],
        "FIT101": np.round(fit101, 4),
        "LIT101": np.round(lit101, 2),
        "MV101": mv101.astype(int),
        "P101": p101.astype(int),
        "DPIT301": np.round(dpit301, 4),
        "FIT201": np.round(fit201, 4),
        "AIT202": np.round(ait202, 3),
        "AIT402": np.round(ait402, 2),
        "ground_truth_state": state_names,
        "ground_truth_code": state_labels,
        "is_unknown": is_unknown,
        "is_anomaly": anomaly_flag
    })
    
    return df
