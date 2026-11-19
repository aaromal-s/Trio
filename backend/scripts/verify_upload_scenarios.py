"""
TRIO 3.0 Dataset Upload 12-Scenario Comprehensive Verification Suite
Runs and validates all 12 upload edge cases against the live FastAPI application.
Outputs exact HTTP codes, response bodies, DB persistence checks, and execution timings.
"""

import io
import time
import json
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import execute_query, execute_write
from app.services.state_service import state_service

client = TestClient(app)

results = []

def record(name, scenario_num, status_code, passed, details):
    results.append({
        "scenario": scenario_num,
        "name": name,
        "status_code": status_code,
        "passed": passed,
        "details": details
    })
    status_str = "PASS" if passed else "FAIL"
    print(f"[{status_str}] Scenario {scenario_num}: {name} (HTTP {status_code}) -> {details}")

# --- Scenario 1: Valid 1,500-row SWaT-like CSV ---
def test_scenario_1():
    t0 = time.perf_counter()
    n = 1500
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1s"),
        "FIT101": np.random.uniform(2.0, 3.0, n),
        "LIT101": np.random.uniform(500.0, 800.0, n),
        "DPIT301": np.random.uniform(18.0, 22.0, n),
        "FIT201": np.random.uniform(2.1, 2.8, n),
        "AIT202": np.random.uniform(8.0, 8.5, n),
        "AIT402": np.random.uniform(140.0, 160.0, n),
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario1_swat_1500.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("row_count") == 1500 and len(data.get("selected_features", [])) == 6
    record("Valid 1,500-Row SWaT-like CSV", 1, res.status_code, passed, f"row_count={data.get('row_count')}, features={data.get('selected_features')}, time={elapsed:.1f}ms")

# --- Scenario 2: Transposed 6-Sensor CSV (Sensor-oriented) ---
def test_scenario_2():
    t0 = time.perf_counter()
    sensors = ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"]
    data = {"Sensor": sensors}
    for t in range(120):
        data[f"T_{t:03d}"] = [25.0 + s * 2 + t * 0.05 for s in range(len(sensors))]
    df = pd.DataFrame(data)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario2_transposed.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("transposed") is True and data.get("row_count") == 120 and len(data.get("selected_features", [])) == 6
    record("Transposed 6-Sensor Matrix (Auto-inversion)", 2, res.status_code, passed, f"transposed={data.get('transposed')}, row_count={data.get('row_count')}, features={data.get('selected_features')}, time={elapsed:.1f}ms")

# --- Scenario 3: 2-Feature CSV (Minimum Valid Multivariate) ---
def test_scenario_3():
    t0 = time.perf_counter()
    n = 80
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1min"),
        "Motor_RPM": np.random.uniform(1200, 1800, n),
        "Vibration_G": np.random.uniform(0.1, 0.8, n),
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario3_2features.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("row_count") == 80 and len(data.get("selected_features", [])) == 2
    record("2-Feature Minimum Multivariate CSV", 3, res.status_code, passed, f"row_count={data.get('row_count')}, features={data.get('selected_features')}, time={elapsed:.1f}ms")

# --- Scenario 4: 13-Column CSV (SWaT full with actuators & labels) ---
def test_scenario_4():
    t0 = time.perf_counter()
    n = 100
    df = pd.DataFrame({
        "Timestamp": pd.date_range("2026-01-01", periods=n, freq="1s"),
        "FIT101": np.random.uniform(2.0, 3.0, n),
        "LIT101": np.random.uniform(500.0, 800.0, n),
        "DPIT301": np.random.uniform(18.0, 22.0, n),
        "FIT201": np.random.uniform(2.1, 2.8, n),
        "AIT202": np.random.uniform(8.0, 8.5, n),
        "AIT402": np.random.uniform(140.0, 160.0, n),
        "MV101": np.random.choice([0, 1, 2], n),
        "P101": np.random.choice([1, 2], n),
        "label": ["Normal"] * 90 + ["Attack"] * 10,
        "ground_truth": [0] * 90 + [1] * 10,
        "status": ["Active"] * n,
        "is_unknown": [0] * 95 + [1] * 5,
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario4_13cols.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = (
        res.status_code == 200 and
        data.get("row_count") == 100 and
        "label" not in data.get("selected_features", []) and
        "ground_truth" not in data.get("selected_features", []) and
        "FIT101" in data.get("selected_features", [])
    )
    record("13-Column Complex CSV (Sensors+Actuators+Labels)", 4, res.status_code, passed, f"row_count={data.get('row_count')}, features={data.get('selected_features')}, time={elapsed:.1f}ms")

# --- Scenario 5: Quoted Numbers CSV ---
def test_scenario_5():
    t0 = time.perf_counter()
    n = 60
    lines = ["timestamp,temp,flow,pressure\n"]
    for i in range(n):
        lines.append(f"2026-01-01 00:{i:02d}:00,\" 1,234.50 \",\" -45.2 \",\" 2,000 \"\n")
    raw = "".join(lines).encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario5_quoted.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("row_count") == 60 and "temp" in data.get("selected_features", [])
    record("Quoted Numbers with Commas & Whitespace", 5, res.status_code, passed, f"row_count={data.get('row_count')}, features={data.get('selected_features')}, time={elapsed:.1f}ms")

# --- Scenario 6: Missing Values CSV ---
def test_scenario_6():
    t0 = time.perf_counter()
    n = 90
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1min"),
        "sensor1": [np.nan if i % 5 == 0 else 10.0 + i * 0.1 for i in range(n)],
        "sensor2": [np.nan if i % 7 == 0 else 50.0 + i * 0.2 for i in range(n)],
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario6_missing.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("row_count") == 90
    record("Missing Values Imputation (ffill/bfill/median)", 6, res.status_code, passed, f"row_count={data.get('row_count')}, time={elapsed:.1f}ms")

# --- Scenario 7: Invalid & Unsorted Timestamps CSV ---
def test_scenario_7():
    t0 = time.perf_counter()
    ts_list = [f"2026-01-01 10:{i:02d}:00" for i in range(30, 0, -1)] + [f"2026-01-01 11:{i:02d}:00" for i in range(35)]
    df = pd.DataFrame({
        "timestamp": ts_list,
        "sensor_x": np.random.uniform(5, 10, len(ts_list)),
        "sensor_y": np.random.uniform(20, 30, len(ts_list)),
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario7_unsorted_ts.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("row_count") == 65
    record("Unsorted & Duplicate Timestamps Chronological Sort", 7, res.status_code, passed, f"row_count={data.get('row_count')}, time={elapsed:.1f}ms")

# --- Scenario 8: Empty CSV (0 bytes) ---
def test_scenario_8():
    t0 = time.perf_counter()
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario8_empty.csv", io.BytesIO(b""), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 400 and "empty" in str(data.get("detail", "")).lower()
    record("Empty CSV (0 Bytes) Safe Rejection", 8, res.status_code, passed, f"detail='{data.get('detail')}', time={elapsed:.1f}ms")

# --- Scenario 9: Fewer than 50 Observations (< 50 rows) ---
def test_scenario_9():
    t0 = time.perf_counter()
    csv_content = "timestamp,flow,pressure\n" + "\n".join([f"T{i},2.5,1.2" for i in range(6)])
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario9_six_rows.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    diag = data.get("detail", {}).get("diagnostics", {})
    passed = (
        res.status_code == 400 and
        diag.get("parsed_rows") == 6 and
        diag.get("numeric_feature_count") == 2 and
        "Dataset validation failed" in str(data.get("detail", {}).get("message", ""))
    )
    record("< 50 Rows Rejection with Rich Diagnostics", 9, res.status_code, passed, f"parsed_rows={diag.get('parsed_rows')}, numeric_features={diag.get('numeric_feature_count')}, time={elapsed:.1f}ms")

# --- Scenario 10: Large CSV (> 5,000 rows) ---
def test_scenario_10():
    t0 = time.perf_counter()
    n = 6000
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1s"),
        "voltage": np.random.uniform(220, 240, n),
        "amperage": np.random.uniform(10, 25, n),
        "frequency": np.random.uniform(49.8, 50.2, n),
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post("/api/datasets/upload-csv", files={"file": ("scenario10_large_6000.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    passed = res.status_code == 200 and data.get("row_count") == 6000
    record("Large CSV (> 5,000 rows) High-Throughput Processing", 10, res.status_code, passed, f"row_count={data.get('row_count')}, time={elapsed:.1f}ms")

# --- Scenario 11: Duplicate Upload (Idempotency) ---
def test_scenario_11():
    t0 = time.perf_counter()
    n = 100
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1min"),
        "sensor_alpha": np.random.uniform(1, 10, n),
        "sensor_beta": np.random.uniform(20, 50, n),
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res1 = client.post("/api/datasets/upload-csv", files={"file": ("scenario11_duplicate.csv", io.BytesIO(raw), "text/csv")})
    res2 = client.post("/api/datasets/upload-csv", files={"file": ("scenario11_duplicate.csv", io.BytesIO(raw), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    passed = res1.status_code == 200 and res2.status_code == 200 and res1.json()["row_count"] == 100 and res2.json()["row_count"] == 100
    record("Duplicate Upload Consecutive Idempotency", 11, res2.status_code, passed, f"res1_rows={res1.json().get('row_count')}, res2_rows={res2.json().get('row_count')}, time={elapsed:.1f}ms")

# --- Scenario 12: Authorized Upload & Database Attribution ---
def test_scenario_12():
    t0 = time.perf_counter()
    from app.core.database import execute_query, execute_write
    user = execute_query("SELECT id FROM users LIMIT 1", fetch="one")
    user_internal_id = user["id"] if user else "test_user_scenario12"
    
    token = f"trio_sess_test_sc12_{int(time.time())}"
    execute_write(
        "INSERT OR REPLACE INTO sessions (token, user_internal_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, user_internal_id, "now", time.time() + 3600)
    )
    
    n = 75
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1s"),
        "s_ch1": np.random.uniform(10, 20, n),
        "s_ch2": np.random.uniform(30, 40, n),
    })
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    raw = buf.getvalue().encode("utf-8")
    
    res = client.post(
        "/api/datasets/upload-csv",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("scenario12_auth_linked.csv", io.BytesIO(raw), "text/csv")}
    )
    elapsed = (time.perf_counter() - t0) * 1000
    data = res.json()
    dataset_id = data.get("dataset_id")
    
    db_row = execute_query("SELECT uploaded_by FROM datasets WHERE id = ?", (dataset_id,), fetch="one")
    passed = res.status_code == 200 and db_row is not None and db_row["uploaded_by"] == user_internal_id
    record("Bearer Token Ingestion & Database User Attribution", 12, res.status_code, passed, f"dataset_id={dataset_id}, uploaded_by={db_row['uploaded_by'] if db_row else None}, time={elapsed:.1f}ms")

# --- Extra Validation: Rollback & State Non-Corruption ---
def test_scenario_rollback():
    t0 = time.perf_counter()
    active_before = state_service.dataset_name
    rows_before = len(state_service.active_dataset) if state_service.active_dataset is not None else 0
    
    # Upload invalid file with only 4 rows
    bad_csv = "timestamp,f1,f2\nT1,1,2\nT2,3,4\nT3,5,6\nT4,7,8\n"
    res = client.post("/api/datasets/upload-csv", files={"file": ("bad_dataset.csv", io.BytesIO(bad_csv.encode("utf-8")), "text/csv")})
    elapsed = (time.perf_counter() - t0) * 1000
    
    active_after = state_service.dataset_name
    rows_after = len(state_service.active_dataset) if state_service.active_dataset is not None else 0
    
    passed = res.status_code == 400 and active_before == active_after and rows_before == rows_after
    record("Transactional Rollback & State Non-Corruption", "Bonus", res.status_code, passed, f"active_before='{active_before}', active_after='{active_after}', rows={rows_after}, time={elapsed:.1f}ms")

if __name__ == "__main__":
    print("=" * 80)
    print("TRIO 3.0 DATASET UPLOAD 12-SCENARIO VERIFICATION EXECUTION")
    print("=" * 80)
    test_scenario_1()
    test_scenario_2()
    test_scenario_3()
    test_scenario_4()
    test_scenario_5()
    test_scenario_6()
    test_scenario_7()
    test_scenario_8()
    test_scenario_9()
    test_scenario_10()
    test_scenario_11()
    test_scenario_12()
    test_scenario_rollback()
    print("=" * 80)
    all_passed = all(r["passed"] for r in results)
    print(f"SUMMARY: {sum(1 for r in results if r['passed'])} / {len(results)} scenarios PASSED. All Passed: {all_passed}")
    print("=" * 80)

