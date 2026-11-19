"""
Comprehensive CSV Ingestion, Validation, and Feature Dimension Tests
Covers all 12 edge cases requested in TRIO 2.0:
1. Valid datasets (multi-sensor, chronological)
2. Fewer than 50 rows (< 50)
3. Only 1 numeric sensor column
4. Missing timestamps (auto-synthesis)
5. Duplicate timestamps (safe de-duplication)
6. Unsorted timestamps (chronological re-ordering)
7. Empty CSV files (0 rows / 0 bytes)
8. Invalid / corrupted CSV files
9. Missing values (ffill -> bfill -> median imputation)
10. Non-numeric columns & dirty formatted strings (commas, quotes, spaces)
11. Different sensor counts (N = 2, 5, 10, 20 features)
12. Large datasets (> 2000 rows)
13. Reproduction of reported error: verify underlying cause is resolved
"""

import io
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.ml.preprocessor import DataPreprocessor

client = TestClient(app)


def test_1_valid_dataset():
    """Valid CSV with 100 rows, 4 numeric sensor columns, and ISO timestamp."""
    prep = DataPreprocessor()
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=100, freq="1min"),
        "sensor_temp": np.random.uniform(20.0, 35.0, 100),
        "sensor_pressure": np.random.uniform(1.0, 5.0, 100),
        "sensor_flow": np.random.uniform(10.0, 50.0, 100),
        "sensor_vibration": np.random.uniform(0.1, 1.2, 100),
    })
    val = prep.validate_dataset(df)
    assert val["is_valid"] is True
    assert val["row_count"] == 100
    assert len(val["numeric_columns"]) == 4
    assert "timestamp" not in val["numeric_columns"]
    assert val["timestamp_column"] == "timestamp"


def test_2_fewer_than_50_rows():
    """CSV with only 30 rows: must be safely rejected with informative diagnostic."""
    prep = DataPreprocessor()
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=30, freq="1min"),
        "sensor_a": np.random.uniform(1.0, 10.0, 30),
        "sensor_b": np.random.uniform(5.0, 15.0, 30),
    })
    val = prep.validate_dataset(df)
    assert val["is_valid"] is False
    assert any("30 rows" in err or "at least 50" in err for err in val["errors"])


def test_3_only_one_numeric_sensor_column():
    """CSV with 80 rows but only 1 numeric sensor: rejected with exact column diagnostic."""
    prep = DataPreprocessor()
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=80, freq="1min"),
        "sensor_single": np.random.uniform(1.0, 10.0, 80),
        "location": ["Sector_A"] * 80,  # String non-sensor
    })
    val = prep.validate_dataset(df)
    assert val["is_valid"] is False
    assert len(val["numeric_columns"]) == 1
    assert any("minimum required is 2" in err for err in val["errors"])


def test_4_missing_timestamps_auto_synthesized():
    """CSV without timestamp column: timestamps must be automatically synthesized."""
    prep = DataPreprocessor()
    df = pd.DataFrame({
        "temperature": np.random.uniform(20.0, 30.0, 75),
        "pressure": np.random.uniform(1.0, 4.0, 75),
        "rpm": np.random.uniform(1000, 3000, 75),
    })
    val = prep.validate_dataset(df)
    assert val["is_valid"] is True
    assert val["timestamp_column"] is None

    cleaned = prep.clean_and_prepare(df, val["numeric_columns"])
    assert "timestamp" in cleaned.columns
    assert len(cleaned["timestamp"]) == 75
    assert cleaned["timestamp"].iloc[0] == "T00001"


def test_5_duplicate_timestamps_safely_handled():
    """CSV with duplicate timestamps: must be deduplicated without crashing."""
    prep = DataPreprocessor()
    ts_list = ["2026-01-01 10:00:00"] * 10 + [f"2026-01-01 10:{i:02d}:00" for i in range(1, 65)]
    df = pd.DataFrame({
        "datetime": ts_list,
        "s1": np.random.uniform(10.0, 20.0, len(ts_list)),
        "s2": np.random.uniform(5.0, 15.0, len(ts_list)),
    })
    cleaned = prep.clean_and_prepare(df, ["s1", "s2"])
    assert not cleaned["datetime"].duplicated().any()


def test_6_unsorted_timestamps_chronologically_sorted():
    """CSV with out-of-order timestamps: must be chronologically re-ordered."""
    prep = DataPreprocessor()
    ts_forward = pd.date_range("2026-01-01 00:00:00", periods=70, freq="1min").astype(str).tolist()
    ts_shuffled = ts_forward.copy()
    ts_shuffled.reverse()  # Reverse order

    df = pd.DataFrame({
        "timestamp": ts_shuffled,
        "flow": list(range(70)),
        "pressure": list(range(70)),
    })
    cleaned = prep.clean_and_prepare(df, ["flow", "pressure"])
    dt_series = pd.to_datetime(cleaned["timestamp"])
    assert dt_series.is_monotonic_increasing


def test_7_empty_csv_file():
    """Empty CSV content must return HTTP 400 with clear message."""
    empty_csv = io.BytesIO(b"")
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("empty.csv", empty_csv, "text/csv")}
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


def test_8_invalid_corrupted_csv():
    """Corrupted non-CSV file must return HTTP 400."""
    corrupt_bytes = io.BytesIO(b"\x00\x01\x02\x03\xff\xfeBINARY_CORRUPTED_STREAM")
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("corrupt.csv", corrupt_bytes, "text/csv")}
    )
    assert res.status_code == 400
    detail = res.json()["detail"]
    msg = detail["message"] if isinstance(detail, dict) else detail
    assert "failed" in msg.lower() or "validation" in msg.lower()


def test_9_missing_value_imputation():
    """CSV with missing values (NaN, empty strings) must be properly imputed."""
    prep = DataPreprocessor()
    s1 = [10.0] * 30 + [np.nan] * 10 + [20.0] * 30
    s2 = [np.nan] * 5 + [5.0] * 65  # Leading NaNs
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=70, freq="1min"),
        "s1": s1,
        "s2": s2,
    })
    cleaned = prep.clean_and_prepare(df, ["s1", "s2"])
    assert not cleaned["s1"].isnull().any()
    assert not cleaned["s2"].isnull().any()
    # Check that leading NaNs in s2 were backward-filled with 5.0
    assert cleaned["s2"].iloc[0] == 5.0


def test_10_dirty_string_numbers_parsed_correctly():
    """
    CRITICAL ROOT CAUSE REPRODUCTION:
    CSVs where numeric sensors are stored with whitespace, commas ('1,200.5'),
    or quotes (' "42.1" ') must be recognized as valid numbers, NOT dropped.
    """
    prep = DataPreprocessor()
    dirty_s1 = [f" {10.5 + i} " for i in range(60)]
    dirty_s2 = [f"\"{1000 + i * 2.5}\"" for i in range(60)]
    dirty_s3 = [f"{1000 + i:,}" if i % 2 == 0 else f"{1000 + i}" for i in range(60)]

    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=60, freq="1min"),
        "s1": dirty_s1,
        "s2": dirty_s2,
        "s3": dirty_s3,
    })
    val = prep.validate_dataset(df)
    assert val["is_valid"] is True
    assert "s1" in val["numeric_columns"]
    assert "s2" in val["numeric_columns"]
    assert "s3" in val["numeric_columns"]


def test_11_different_sensor_counts_dynamic():
    """Verify system handles arbitrary sensor counts (e.g. 2, 7, 15 sensors)."""
    prep = DataPreprocessor()
    for n_sensors in [2, 7, 15]:
        data = {"timestamp": pd.date_range("2026-01-01", periods=60, freq="1min")}
        for s in range(n_sensors):
            data[f"sensor_{s}"] = np.random.uniform(0.0, 100.0, 60)
        df = pd.DataFrame(data)
        val = prep.validate_dataset(df)
        assert val["is_valid"] is True
        assert len(val["numeric_columns"]) == n_sensors

        # Test chronological split & scaling with dynamic N
        train_df, test_df = prep.chronological_split(df)
        X_train = prep.fit_transform_train(train_df, val["numeric_columns"])
        X_test = prep.transform_test(test_df)
        assert X_train.shape[1] == n_sensors
        assert X_test.shape[1] == n_sensors


def test_12_large_dataset_upload_via_api():
    """Verify live API handles a realistic large industrial dataset (> 2500 rows)."""
    n_rows = 2500
    data = {
        "Timestamp": pd.date_range("2026-01-01", periods=n_rows, freq="1s").astype(str),
        "Inflow_Rate": np.random.uniform(10.0, 50.0, n_rows),
        "Tank_Pressure": np.random.uniform(1.5, 4.2, n_rows),
        "Discharge_Temp": np.random.uniform(22.0, 38.0, n_rows),
        "Pump_Current": np.random.uniform(3.0, 12.0, n_rows),
    }
    df = pd.DataFrame(data)
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("large_industrial_telemetry.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["row_count"] == n_rows
    assert len(data["selected_features"]) == 4
    assert "Inflow_Rate" in data["selected_features"]


def test_13_reproduce_exact_screenshot_error_and_verify_fix():
    """
    Directly test the scenario from the user's screenshot where a CSV with whitespace-formatted
    or comma-formatted columns was rejected as:
    'Failed to process CSV file: 400: Dataset must contain at least 50 rows and 2 numeric sensor columns.'
    Verify that it now passes and trains successfully!
    """
    csv_content = "Timestamp, Tank_Level , Flow_Rate \n"
    for i in range(80):
        csv_content += f"2026-03-01 10:{i//60:02d}:{i%60:02d}, \" {25.4 + (i%5)} \" , \" {12.8 - (i%3)} \" \n"

    csv_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("scada_exported_dirty.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["row_count"] == 80
    assert "Tank_Level" in res_data["selected_features"]
    assert "Flow_Rate" in res_data["selected_features"]
    assert "train_results" in res_data


def test_14_six_row_csv_exact_user_message_and_diagnostics():
    """
    EXACT SCREENSHOT REPRODUCTION:
    A genuinely 6-row CSV file must return HTTP 400 with the exact required phrasing:
    'Your uploaded CSV contains 6 observations. TRIO requires at least 50 observations...'
    along with a rich diagnostics payload detailing parsed rows, columns, and sample structure.
    """
    csv_content = "Timestamp,FIT101,LIT101,DPIT301,FIT201,AIT202,AIT402\n"
    for i in range(6):
        csv_content += f"2026-03-01 10:0{i}:00,{25.4 + i},{12.8 - i},{0.5},{1.1},{8.4},{15.2}\n"

    csv_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("six_row_test.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 400
    err_body = res.json()["detail"]
    assert "Your uploaded CSV contains 6 observations." in err_body["message"]
    assert "TRIO requires at least 50 observations" in err_body["message"]
    assert "diagnostics" in err_body
    diag = err_body["diagnostics"]
    assert diag["parsed_rows"] == 6
    assert diag["parsed_columns"] == 7
    assert diag["numeric_feature_count"] == 6
    assert diag["timestamp_detected"] is True
    assert len(diag["sample_structure"]) <= 3


def test_15_forty_nine_row_csv_boundary_rejected():
    """Boundary test: 49 observations (1 below threshold 50) must be rejected."""
    csv_content = "Timestamp,Sensor_A,Sensor_B\n"
    for i in range(49):
        csv_content += f"2026-03-01 10:{i:02d}:00,{10 + i},{20 + i}\n"

    csv_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("forty_nine_rows.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 400
    assert "contains 49 observations" in res.json()["detail"]["message"]


def test_16_fifty_row_csv_boundary_accepted():
    """Boundary test: exactly 50 observations must be accepted and train cleanly."""
    csv_content = "Timestamp,Sensor_A,Sensor_B\n"
    for i in range(50):
        csv_content += f"2026-03-01 10:{i:02d}:00,{10 + i * 0.1},{20 - i * 0.1}\n"

    csv_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("fifty_rows.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    assert res.json()["row_count"] == 50


def test_17_fifteen_hundred_row_csv_accepted():
    """Standard production benchmark: 1,500 observations."""
    n_rows = 1500
    data = {
        "Timestamp": pd.date_range("2026-01-01", periods=n_rows, freq="10s").astype(str),
        "FIT101": np.random.uniform(2.0, 5.0, n_rows),
        "LIT101": np.random.uniform(10.0, 20.0, n_rows),
        "DPIT301": np.random.uniform(0.1, 0.8, n_rows),
        "FIT201": np.random.uniform(1.0, 3.0, n_rows),
        "AIT202": np.random.uniform(7.0, 9.0, n_rows),
        "AIT402": np.random.uniform(14.0, 16.0, n_rows),
    }
    df = pd.DataFrame(data)
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("swat_1500_sample.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    assert res.json()["row_count"] == 1500
    assert len(res.json()["selected_features"]) == 6


def test_18_six_and_twelve_features_dynamic():
    """Verify dynamic support for 6-feature and 12-feature datasets."""
    for n_features in [6, 12]:
        data = {"Timestamp": pd.date_range("2026-01-01", periods=60, freq="1min").astype(str)}
        for f in range(n_features):
            data[f"Channel_{f+1}"] = np.random.uniform(10.0, 100.0, 60)
        df = pd.DataFrame(data)
        csv_buf = io.StringIO()
        df.to_csv(csv_buf, index=False)
        csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

        res = client.post(
            "/api/datasets/upload-csv",
            files={"file": (f"{n_features}_features.csv", csv_bytes, "text/csv")}
        )
        assert res.status_code == 200
        assert len(res.json()["selected_features"]) == n_features


def test_19_multiple_delimiters_semicolon_tab_pipe():
    """Verify robust parsing across semicolon, tab, and pipe delimiters."""
    for delim, name in [(";", "semicolon.csv"), ("\t", "tab.csv"), ("|", "pipe.csv")]:
        csv_content = f"Timestamp{delim}Sensor_1{delim}Sensor_2\n"
        for i in range(55):
            csv_content += f"2026-01-01 00:{i:02d}:00{delim}{15.5 + i}{delim}{30.2 - i}\n"

        csv_bytes = io.BytesIO(csv_content.encode("utf-8"))
        res = client.post(
            "/api/datasets/upload-csv",
            files={"file": (name, csv_bytes, "text/csv")}
        )
        assert res.status_code == 200, f"Failed for delimiter: {delim}"
        assert res.json()["row_count"] == 55


def test_20_utf8_bom_encoding():
    """Verify UTF-8 with BOM (Byte Order Mark, common from Excel) is handled cleanly."""
    csv_content = "Timestamp,Pressure,Flow\n"
    for i in range(60):
        csv_content += f"2026-01-01 00:{i:02d}:00,{2.5 + i * 0.1},{12.1 + i * 0.2}\n"

    # Prepend UTF-8 BOM
    bom_bytes = b"\xef\xbb\xbf" + csv_content.encode("utf-8")
    csv_bytes = io.BytesIO(bom_bytes)

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("excel_with_bom.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    assert "Pressure" in res.json()["selected_features"]
    assert "Flow" in res.json()["selected_features"]


def test_21_european_number_formats():
    """Verify European decimal commas ('25,4') and thousand separators ('1.200,50')."""
    csv_content = "Timestamp;Temperature;Pressure\n"
    for i in range(60):
        csv_content += f"2026-01-01 00:{i:02d}:00;\"25,{4 + (i%5)}\";\"1.200,{50 + i}\"\n"

    csv_bytes = io.BytesIO(csv_content.encode("utf-8"))
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("european_scada.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    assert res.json()["row_count"] == 60


def test_22_transposed_csv_sensor_oriented_detection_and_inversion():
    """
    CRITICAL TRANSPOSITION TEST:
    A sensor-oriented CSV with 6 sensor rows and 100 observation columns
    must be detected as transposed and automatically inverted into a 100-row x 6-sensor dataset.
    """
    sensors = ["FIT101", "LIT101", "DPIT301", "FIT201", "AIT202", "AIT402"]
    data = {"Sensor": sensors}
    for t in range(100):
        data[f"T_{t:03d}"] = [25.0 + s * 2 + t * 0.05 for s in range(len(sensors))]

    df = pd.DataFrame(data)
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("transposed_sensors.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["row_count"] == 100
    assert data["transposed"] is True
    assert len(data["selected_features"]) == 6


def test_23_invalid_file_extension_rejected():
    """Verify non-CSV files (.xlsx, .json) are rejected immediately."""
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("data.xlsx", io.BytesIO(b"fake excel content"), "application/vnd.ms-excel")}
    )
    assert res.status_code == 400
    assert "Only CSV" in res.json()["detail"]


def test_24_full_1500_row_swat_upload_and_persistence():
    """Verify full 1,500-row SWaT-like dataset upload, model training, and DB persistence."""
    from app.core.database import execute_query
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
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("swat_1500_test.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["row_count"] == 1500
    assert len(body["selected_features"]) == 6
    dataset_id = body.get("dataset_id")
    assert dataset_id is not None

    # Verify database persistence
    db_row = execute_query("SELECT * FROM datasets WHERE id = ?", (dataset_id,), fetch="one")
    assert db_row is not None
    assert db_row["row_count"] == 1500
    assert db_row["name"] == "swat_1500_test.csv"

    run_row = execute_query("SELECT * FROM training_runs WHERE dataset_id = ?", (dataset_id,), fetch="one")
    assert run_row is not None
    assert run_row["train_samples"] > 0


def test_25_13_column_csv_with_actuators_and_labels():
    """Verify 13-column dataset with sensors, actuators, and label columns."""
    n = 100
    df = pd.DataFrame({
        "Timestamp": pd.date_range("2026-01-01", periods=n, freq="1min"),
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
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("industrial_13_columns.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["row_count"] == 100
    # Labels must be excluded from selected sensor features
    assert "label" not in body["selected_features"]
    assert "ground_truth" not in body["selected_features"]
    assert "is_unknown" not in body["selected_features"]
    assert "status" not in body["selected_features"]
    assert "FIT101" in body["selected_features"]


def test_26_quoted_numbers_with_commas_and_whitespace():
    """Verify quoted strings with thousands separators and whitespace."""
    n = 60
    lines = ["timestamp,temp,flow,pressure\n"]
    for i in range(n):
        lines.append(f"2026-01-01 00:{i:02d}:00,\" 1,234.50 \",\" -45.2 \",\" 2,000 \"\n")
    csv_bytes = io.BytesIO("".join(lines).encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("quoted_numbers.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["row_count"] == 60
    assert "temp" in body["selected_features"]
    assert "flow" in body["selected_features"]


def test_27_large_csv_over_5000_rows():
    """Verify large CSV (> 5,000 rows) is ingested efficiently without memory issues."""
    n = 5200
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1s"),
        "sensor_a": np.random.uniform(10.0, 50.0, n),
        "sensor_b": np.random.uniform(100.0, 200.0, n),
        "sensor_c": np.random.uniform(0.5, 2.5, n),
    })
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("large_telemetry.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    assert res.json()["row_count"] == 5200


def test_28_duplicate_upload_idempotency():
    """Verify uploading the exact same CSV twice succeeds idempotently."""
    n = 80
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1min"),
        "speed": np.random.uniform(500, 1500, n),
        "torque": np.random.uniform(20, 80, n),
    })
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    raw = csv_buf.getvalue().encode("utf-8")

    res1 = client.post("/api/datasets/upload-csv", files={"file": ("reupload.csv", io.BytesIO(raw), "text/csv")})
    res2 = client.post("/api/datasets/upload-csv", files={"file": ("reupload.csv", io.BytesIO(raw), "text/csv")})

    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()["row_count"] == 80
    assert res2.json()["row_count"] == 80


def test_29_auth_header_and_database_persistence():
    """Verify authorization token links uploaded_by in datasets table."""
    import time
    from app.core.database import execute_query, execute_write

    # Ensure a test user exists
    user = execute_query("SELECT id FROM users LIMIT 1", fetch="one")
    if not user:
        from app.api.auth import hash_password
        user_id = "test_uploader"
        execute_write(
            "INSERT INTO users (id, user_id, name, email, role, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            ("usr_upload_test", user_id, "Uploader", "uploader@trio.internal", "User", hash_password("pass123"), "now", "now")
        )
        internal_id = "usr_upload_test"
    else:
        internal_id = user["id"]

    token = "trio_sess_test_token_upload_123"
    execute_write(
        "INSERT OR REPLACE INTO sessions (token, user_internal_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, internal_id, "now", time.time() + 3600)
    )

    n = 70
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="1min"),
        "current": np.random.uniform(5.0, 15.0, n),
        "voltage": np.random.uniform(210.0, 240.0, n),
    })
    csv_buf = io.StringIO()
    df.to_csv(csv_buf, index=False)
    csv_bytes = io.BytesIO(csv_buf.getvalue().encode("utf-8"))

    res = client.post(
        "/api/datasets/upload-csv",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("auth_upload.csv", csv_bytes, "text/csv")}
    )
    assert res.status_code == 200
    body = res.json()
    dataset_id = body["dataset_id"]

    db_row = execute_query("SELECT uploaded_by FROM datasets WHERE id = ?", (dataset_id,), fetch="one")
    assert db_row is not None
    assert db_row["uploaded_by"] == internal_id


def test_30_transactional_rollback_preserves_previous_dataset_on_failure():
    """Verify that a rejected or invalid upload leaves the previous active dataset completely intact."""
    from app.services.state_service import state_service

    # First load a known good dataset
    initial_dataset_name = state_service.dataset_name
    initial_rows = len(state_service.active_dataset) if state_service.active_dataset is not None else 0

    # Attempt to upload an invalid 6-row dataset
    csv_content = "timestamp,flow,pressure\n" + "\n".join([f"T{i},2.5,1.2" for i in range(6)])
    res = client.post(
        "/api/datasets/upload-csv",
        files={"file": ("invalid_6_rows.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    )
    assert res.status_code == 400
    assert "Dataset validation failed" in res.json()["detail"]["message"]

    # Active dataset state must be strictly preserved!
    assert state_service.dataset_name == initial_dataset_name
    assert len(state_service.active_dataset) == initial_rows

