"""
Datasets API Endpoints
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import io
import csv
import logging
import uuid
import json
import time

from app.services.state_service import state_service
from app.ml.synthetic_generator import generate_synthetic_industrial_data
from app.core.database import execute_query, execute_write

logger = logging.getLogger("trio.datasets")

router = APIRouter(prefix="/datasets", tags=["Datasets"])

class GenerateDatasetRequest(BaseModel):
    n_samples: int = 1500
    seed: int = 42

@router.get("/current")
def get_current_dataset_info():
    if state_service.active_dataset is None:
        return {"status": "none", "message": "No dataset currently loaded"}
    
    validation = state_service.preprocessor.validate_dataset(state_service.active_dataset)
    return {
        "dataset_name": state_service.dataset_name,
        "is_simulated": state_service.is_simulated,
        "disclaimer": "SIMULATED DEMO DATA — NOT REAL FACTORY DATA" if state_service.is_simulated else "USER UPLOADED DATASET",
        "validation": validation,
        "selected_features": state_service.feature_cols,
        "actuator_features": state_service.actuator_cols,
        "last_updated": state_service.last_updated
    }

@router.get("/preview")
def get_dataset_preview(limit: int = 25):
    if state_service.active_dataset is None:
        raise HTTPException(status_code=404, detail="No dataset loaded")
        
    df = state_service.active_dataset
    head_df = df.head(limit)
    
    # Format NaN to None for JSON serialization
    records = head_df.where(pd.notnull(head_df), None).to_dict(orient="records")
    return {
        "total_rows": len(df),
        "columns": list(df.columns),
        "preview_rows": records
    }

@router.post("/generate-synthetic")
def generate_synthetic(req: GenerateDatasetRequest = GenerateDatasetRequest()):
    df = generate_synthetic_industrial_data(n_samples=req.n_samples, seed=req.seed)
    from app.services.state_service import DEFAULT_FEATURES
    features = [c for c in DEFAULT_FEATURES if c in df.columns]
    name = "Synthetic Industrial Water Treatment (SWaT-Sim)"
    state_service.set_dataset(df, name, is_simulated=True)
    state_service.feature_cols = features
    # Re-train with fresh dataset
    train_res = state_service.train_all(feature_cols=features)
    
    # Persist synthetic dataset to database
    dataset_id = f"ds_{uuid.uuid4().hex[:12]}"
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        execute_write(
            """INSERT INTO datasets (id, name, uploaded_by, row_count, column_count, is_simulated, features_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (dataset_id, name, None, len(df), len(df.columns), 1, json.dumps(features), now_iso)
        )
        run_id = f"run_{uuid.uuid4().hex[:12]}"
        execute_write(
            """INSERT INTO training_runs (id, dataset_id, model_version, algorithm, weights_json, metrics_json, train_samples, test_samples, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (run_id, dataset_id, train_res.get("version", "3.0.0"), "TRIO",
             json.dumps({"alpha": state_service.trio_model.alpha, "beta": state_service.trio_model.beta, "gamma": state_service.trio_model.gamma}),
             json.dumps(train_res.get("evaluation", [])),
             len(state_service.train_df) if state_service.train_df is not None else 0,
             len(state_service.test_df) if state_service.test_df is not None else 0,
             now_iso)
        )
    except Exception as e:
        logger.warning("Could not persist synthetic dataset to database: %s", e)

    return {
        "message": "Synthetic industrial dataset generated successfully.",
        "dataset_name": name,
        "dataset_id": dataset_id,
        "row_count": len(df),
        "is_simulated": True,
        "train_results": train_res
    }

@router.post("/upload-csv")
@router.post("/upload")
async def upload_csv(
    request: Request,
    file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV (.csv) files are supported.")
        
    try:
        content = await file.read()
        if not content or len(content.strip()) == 0:
            raise HTTPException(status_code=400, detail="The uploaded CSV file is empty (0 bytes).")
        max_bytes = 25 * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"CSV file is {(len(content) / (1024 * 1024)):.1f} MB, which exceeds the 25 MB cloud ingestion limit. Please downsample or use the preprocessed MetroPT-3 dataset."
            )
            
        # 1. Decode text content supporting UTF-8 BOM, UTF-8, Latin-1, CP1252
        decoded_text: Optional[str] = None
        detected_encoding = "utf-8"
        for enc in ["utf-8-sig", "utf-8", "latin1", "cp1252"]:
            try:
                decoded_text = content.decode(enc)
                detected_encoding = enc
                break
            except UnicodeDecodeError:
                continue

        if decoded_text is None:
            decoded_text = content.decode("utf-8", errors="replace")
            detected_encoding = "utf-8 (lossy)"

        # 2. Delimiter detection: try csv.Sniffer followed by candidate ranking
        detected_delimiter = ","
        sniffer_delimiter = None
        try:
            sample_lines = "\n".join([line for line in decoded_text.splitlines()[:20] if line.strip()])
            if sample_lines:
                dialect = csv.Sniffer().sniff(sample_lines, delimiters=[",", ";", "\t", "|"])
                sniffer_delimiter = dialect.delimiter
        except Exception:
            sniffer_delimiter = None

        candidate_delimiters = [sniffer_delimiter] if sniffer_delimiter else []
        for d in [",", ";", "\t", "|"]:
            if d not in candidate_delimiters:
                candidate_delimiters.append(d)

        df: Optional[pd.DataFrame] = None
        best_col_count = 0

        for sep in candidate_delimiters:
            try:
                candidate_df = pd.read_csv(io.StringIO(decoded_text), sep=sep)
                if len(candidate_df) > 0 and len(candidate_df.columns) > best_col_count:
                    df = candidate_df
                    best_col_count = len(candidate_df.columns)
                    detected_delimiter = sep
                    if best_col_count > 1:
                        break
            except Exception:
                continue

        if df is None:
            # Fallback to python engine auto-sniffing
            try:
                df = pd.read_csv(io.StringIO(decoded_text), sep=None, engine="python")
                detected_delimiter = "auto"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse CSV file structure: {str(e)}")

        # Strip whitespace from column headers
        df.columns = [str(c).strip() for c in df.columns]

        # Chronological downsampling safeguard for large CSVs (>10,000 rows) to prevent OOM/timeouts
        if len(df) > 10000:
            step = max(1, len(df) // 5000)
            df = df.iloc[::step].reset_index(drop=True)
            logger.info("Downsampled large uploaded CSV '%s' to %d chronological rows (step=%d)", file.filename, len(df), step)

        # 3. Transposed / Sensor-oriented detection and unambiguous auto-inversion
        transposed_applied = False
        if len(df) < 50 and len(df.columns) >= 50:
            first_col = df.columns[0]
            try:
                inverted_df = df.set_index(first_col).T.reset_index()
                inverted_df.columns = [str(c).strip() for c in inverted_df.columns]
                if inverted_df.columns[0] in ("index", str(first_col)):
                    inverted_df = inverted_df.rename(columns={inverted_df.columns[0]: "timestamp"})
                val_inverted = state_service.preprocessor.validate_dataset(inverted_df)
                if val_inverted["is_valid"]:
                    df = inverted_df
                    transposed_applied = True
                    logger.info(
                        "Automatically transposed sensor-oriented CSV '%s' from (%d, %d) to (%d, %d)",
                        file.filename, len(df.columns), len(df), len(df), len(df.columns)
                    )
            except Exception as e:
                logger.debug("Transposition attempt skipped: %s", e)

        # 4. Validate dataset structure
        validation = state_service.preprocessor.validate_dataset(df)

        logger.info(
            "CSV Upload Diagnostics: filename=%s, size_bytes=%d, encoding=%s, delimiter=%s, "
            "parsed_rows=%d, parsed_cols=%d, timestamp_col=%s, numeric_sensors=%d, is_valid=%s, transposed=%s",
            file.filename,
            len(content),
            detected_encoding,
            detected_delimiter,
            validation["row_count"],
            validation["column_count"],
            validation["timestamp_column"],
            len(validation["numeric_columns"]),
            validation["is_valid"],
            transposed_applied
        )

        if not validation["is_valid"]:
            error_reasons = " ".join(validation.get("errors", ["Dataset must contain at least 50 observations and 2 numeric sensor columns."]))
            
            sample_records = df.head(3).where(pd.notnull(df), None).to_dict(orient="records")
            diagnostics = {
                "filename": file.filename,
                "file_size_bytes": len(content),
                "encoding": detected_encoding,
                "delimiter": detected_delimiter,
                "parsed_rows": int(validation["row_count"]),
                "parsed_columns": int(validation["column_count"]),
                "numeric_feature_count": len(validation["numeric_columns"]),
                "numeric_columns": validation["numeric_columns"],
                "timestamp_detected": validation["timestamp_column"] is not None,
                "timestamp_column": validation["timestamp_column"],
                "is_transposed_candidate": validation.get("is_transposed_candidate", False),
                "sample_structure": sample_records,
                "suggested_action": (
                    "Your uploaded CSV contains fewer than the required 50 chronological observations. "
                    "Please upload a time-series CSV where each row corresponds to an observation timestep and each column corresponds to an industrial sensor."
                    if not validation.get("is_transposed_candidate") else
                    "The uploaded file appears to be sensor-oriented (sensors as rows instead of columns). TRIO expects observation-oriented datasets with time steps as rows."
                )
            }
            
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Dataset validation failed: {error_reasons}",
                    "diagnostics": diagnostics
                }
            )

        # 5. Clean and prepare dataset (chronological sorting, deduplication, missing-value imputation)
        df_cleaned = state_service.preprocessor.clean_and_prepare(df, validation["numeric_columns"])

        # Select numeric columns as active features (up to 12 features dynamically)
        available_numeric = validation["numeric_columns"][:12]

        # 6. Snapshot current state for transactional rollback
        old_state = {
            "active_dataset": state_service.active_dataset,
            "dataset_name": state_service.dataset_name,
            "is_simulated": state_service.is_simulated,
            "feature_cols": list(state_service.feature_cols),
            "train_df": state_service.train_df,
            "test_df": state_service.test_df,
            "stream_results": state_service.stream_results,
            "evaluation_results": list(state_service.evaluation_results),
            "training_history": list(state_service.training_history),
            "last_updated": state_service.last_updated
        }

        # Apply new dataset to state
        state_service.set_dataset(df_cleaned, file.filename, is_simulated=False)
        state_service.feature_cols = available_numeric

        try:
            train_res = state_service.train_all(feature_cols=available_numeric)
        except Exception as train_err:
            # Rollback state_service on training failure: previous dataset remains completely intact!
            state_service.active_dataset = old_state["active_dataset"]
            state_service.dataset_name = old_state["dataset_name"]
            state_service.is_simulated = old_state["is_simulated"]
            state_service.feature_cols = old_state["feature_cols"]
            state_service.train_df = old_state["train_df"]
            state_service.test_df = old_state["test_df"]
            state_service.stream_results = old_state["stream_results"]
            state_service.evaluation_results = old_state["evaluation_results"]
            state_service.training_history = old_state["training_history"]
            state_service.last_updated = old_state["last_updated"]
            logger.error("Training failed on uploaded dataset '%s', state rolled back: %s", file.filename, train_err)
            raise HTTPException(
                status_code=400,
                detail=f"Uploaded dataset '{file.filename}' passed structural validation but failed model training: {str(train_err)}. Previous dataset has been preserved."
            )

        # 7. Persist to Database (SQLite / PostgreSQL)
        dataset_id = f"ds_{uuid.uuid4().hex[:12]}"
        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        uploaded_by = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
            sess = execute_query(
                "SELECT user_internal_id FROM sessions WHERE token = ? AND expires_at > ?",
                (token, time.time()), fetch="one"
            )
            if sess:
                uploaded_by = sess["user_internal_id"]

        try:
            execute_write(
                """INSERT INTO datasets (id, name, uploaded_by, row_count, column_count, is_simulated, features_json, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (dataset_id, file.filename, uploaded_by, len(df_cleaned), len(df_cleaned.columns), 0, json.dumps(available_numeric), now_iso)
            )
            run_id = f"run_{uuid.uuid4().hex[:12]}"
            execute_write(
                """INSERT INTO training_runs (id, dataset_id, model_version, algorithm, weights_json, metrics_json, train_samples, test_samples, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (run_id, dataset_id, train_res.get("version", "3.0.0"), "TRIO",
                 json.dumps({"alpha": state_service.trio_model.alpha, "beta": state_service.trio_model.beta, "gamma": state_service.trio_model.gamma}),
                 json.dumps(train_res.get("evaluation", [])),
                 len(state_service.train_df) if state_service.train_df is not None else 0,
                 len(state_service.test_df) if state_service.test_df is not None else 0,
                 now_iso)
            )
            logger.info("Dataset and training run persisted to database: dataset_id=%s, run_id=%s", dataset_id, run_id)
        except Exception as db_err:
            logger.warning("Database persistence notice (in-memory state active): %s", db_err)

        return {
            "message": (
                f"Dataset '{file.filename}' successfully uploaded and preprocessed."
                if not transposed_applied else
                f"Dataset '{file.filename}' successfully detected as sensor-oriented, transposed to {len(df_cleaned)} observations, and trained."
            ),
            "dataset_id": dataset_id,
            "row_count": len(df_cleaned),
            "columns": list(df_cleaned.columns),
            "selected_features": available_numeric,
            "transposed": transposed_applied,
            "validation": validation,
            "train_results": train_res
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")

@router.get("/swat-info")
def get_swat_info():
    return {
        "name": "Secure Water Treatment (SWaT) Testbed",
        "institution": "iTrust, Singapore University of Technology and Design (SUTD)",
        "description": "SWaT is a fully operational six-stage physical water treatment plant testbed used worldwide in industrial control systems and cyber-physical systems security research. Stages include raw water intake, chemical dosing, ultrafiltration, dechlorination, reverse osmosis, and clean water distribution.",
        "official_url": "https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/#swat",
        "citation": "Goh, J., Adepu, S., Junejo, K. N., & Mathur, A. (2016). A dataset to support research in the design of secure water treatment systems. In Critical Information Infrastructures Security (CRITIS).",
        "redistribution_policy": "Official SWaT dataset requires direct institutional access request from iTrust SUTD. TRIO includes a high-fidelity synthetic generator mimicking SWaT multi-stage behavior for immediate experimentation without violating licensing."
    }

@router.get("/metro-info")
def get_metro_info():
    return {
        "name": "MetroPT-3 Railway Air Production Unit (APU) SCADA Testbed",
        "institution": "Metro do Porto & IEEE DSAA 2021",
        "description": "Real-world SCADA telemetry collected from an operational urban railway train compressor unit (APU) in Porto, Portugal. Captures multi-sensor time-series including output pressure (TP2), pneumatic panel pressure (TP3), high-pressure tank (H1), dryer differential pressure (DV_pressure), reservoir pressure, oil temperature, motor current, and valve commands.",
        "citation": "Veloso, B. et al. (2021). Predictive maintenance based on anomaly detection using deep learning for air production unit in the railway industry. IEEE DSAA.",
        "failure_modes": [
            "Pneumatic Air Leakage (Reservoirs pressure collapse)",
            "Compressor Oil Thermal Overheating (Oil_temperature > 82°C - 89°C)",
            "Desiccant Dryer Cyclic Valve Flutter"
        ],
        "is_active": not state_service.is_simulated and "MetroPT" in state_service.dataset_name
    }

@router.post("/load-metro")
def load_metro_dataset():
    state_service.load_initial_dataset()
    return {
        "message": "MetroPT-3 industrial dataset successfully loaded and active.",
        "dataset_name": state_service.dataset_name,
        "is_simulated": state_service.is_simulated,
        "features": state_service.feature_cols,
        "row_count": len(state_service.active_dataset) if state_service.active_dataset is not None else 0
    }

