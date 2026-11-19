"""
Script to analyze MetroPT3 and Hydraulic datasets in Dataset/
"""
import os
import sys
import pandas as pd
import numpy as np

METRO_PATH = "Dataset/MetroPT3(AirCompressor).csv"
HYDRAULIC_DIR = "Dataset"

def analyze_metro():
    print("=" * 60)
    print("1. ANALYZING MetroPT3(AirCompressor).csv")
    print("=" * 60)
    
    file_size_mb = os.path.getsize(METRO_PATH) / (1024 * 1024)
    print(f"File size: {file_size_mb:.2f} MB")
    
    # Read sample
    sample_df = pd.read_csv(METRO_PATH, nrows=5000)
    print(f"Sample columns ({len(sample_df.columns)}):", sample_df.columns.tolist())
    
    # Count rows and check timestamps in chunks
    total_rows = 0
    start_ts = None
    end_ts = None
    min_press = 999
    max_temp = -999
    
    chunk_count = 0
    anomaly_periods = []
    
    for chunk in pd.read_csv(METRO_PATH, chunksize=100000):
        total_rows += len(chunk)
        if start_ts is None:
            start_ts = chunk['timestamp'].iloc[0]
        end_ts = chunk['timestamp'].iloc[-1]
        
        # Check temperature > 75 C
        overheat = chunk[chunk['Oil_temperature'] > 75]
        if len(overheat) > 0:
            anomaly_periods.append({
                'type': 'HIGH_OIL_TEMP',
                'count': len(overheat),
                'first_ts': overheat['timestamp'].iloc[0],
                'last_ts': overheat['timestamp'].iloc[-1],
                'max_temp': float(overheat['Oil_temperature'].max())
            })
            
        # Check low reservoir pressure while compressor is supposedly on
        low_res = chunk[(chunk['Reservoirs'] < 6.0) & (chunk['COMP'] == 1.0)]
        if len(low_res) > 0:
            anomaly_periods.append({
                'type': 'LOW_RESERVOIR_PRESSURE_ANOMALY',
                'count': len(low_res),
                'first_ts': low_res['timestamp'].iloc[0],
                'last_ts': low_res['timestamp'].iloc[-1],
                'min_res': float(low_res['Reservoirs'].min())
            })
            
        chunk_count += 1
        
    print(f"Total Rows: {total_rows:,}")
    print(f"Timestamp range: {start_ts} to {end_ts}")
    print(f"Detected {len(anomaly_periods)} anomalous chunk episodes:")
    for a in anomaly_periods[:10]:
        print("  -", a)
        
    return total_rows, sample_df

def analyze_hydraulic():
    print("\n" + "=" * 60)
    print("2. ANALYZING Hydraulic System Dataset (UCI)")
    print("=" * 60)
    files = [f for f in os.listdir(HYDRAULIC_DIR) if f.endswith('.txt')]
    print("Text files found:", files)
    
    if os.path.exists(os.path.join(HYDRAULIC_DIR, "profile.txt")):
        prof = pd.read_csv(os.path.join(HYDRAULIC_DIR, "profile.txt"), sep='\t', header=None)
        print("profile.txt shape:", prof.shape)
        print("Profile target distributions:")
        print("  Cooler condition (Col 0):", prof[0].value_counts().to_dict())
        print("  Valve condition (Col 1):", prof[1].value_counts().to_dict())
        print("  Pump leakage (Col 2):", prof[2].value_counts().to_dict())
        print("  Hydraulic accumulator (Col 3):", prof[3].value_counts().to_dict())
        print("  Stable flag (Col 4):", prof[4].value_counts().to_dict())

if __name__ == "__main__":
    analyze_metro()
    analyze_hydraulic()
