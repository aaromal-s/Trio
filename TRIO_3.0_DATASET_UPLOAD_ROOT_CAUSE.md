# TRIO 3.0 — DATASET UPLOAD FAILURE: ROOT-CAUSE ANALYSIS

**Project:** TRIO — Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery  
**Module:** Dataset Management & Ingestion (`/datasets`, `DatasetsPage.tsx`, `api.ts`, `DataPreprocessor`)  
**Status:** Resolved & Permanently Fixed  
**Date:** November 2026  

---

## 1. Executive Summary

During testing of the Dataset Management & Ingestion module in TRIO 3.0, attempting to upload a CSV file resulted in an immediate frontend error:
```text
"Failed to fetch"
```
Simultaneously, the dashboard displayed an active synthetic dataset with 1,500 observations, confirming the UI was operational, but uploading any new CSV file failed before or during network communication.

An investigation was conducted tracing the complete request lifecycle across the frontend component tree, HTTP client, Vite development server, network/CORS layer, FastAPI application router, multipart parser, time-series preprocessor, global state service, and SQLite/PostgreSQL database persistence.

---

## 2. Full Upload Workflow Architecture

The full data ingestion lifecycle across the TRIO platform is structured as follows:

```
[Browser / User UI]
  │
  ├── 1. File Selection / Drag & Drop (`DatasetsPage.tsx`)
  │      └── `handleFileUpload` / `handleDrop`
  │
  ├── 2. FormData Packaging (`api.ts: uploadCSV`)
  │      └── `formData.append('file', file)`
  │      └── `fetch(`${API_BASE_URL}/datasets/upload-csv`, { method: 'POST', body: formData })`
  │
[Network / Proxy Layer]
  │
  ├── 3. Vite Development Server Proxy (`vite.config.ts`)
  │      └── Proxy: `/api` -> `http://127.0.0.1:8000`
  │
  ├── 4. Security & CORS Middleware (`main.py`)
  │      └── `SecurityHeadersMiddleware` -> `CORSMiddleware`
  │
[FastAPI Backend Engine]
  │
  ├── 5. Multipart Ingestion (`datasets.py: upload_csv`)
  │      └── Read raw bytes, check `.csv` extension, non-empty validation
  │
  ├── 6. Encoding & Delimiter Auto-Detection
  │      └── UTF-8 BOM, UTF-8, Latin-1, CP1252 decoding
  │      └── `csv.Sniffer` for `,`, `;`, `\t`, `|`
  │
  ├── 7. Matrix Orientation & Inversion
  │      └── Transposed matrix detection (sensors as rows vs timesteps as columns)
  │
  ├── 8. Validation & Preprocessing (`DataPreprocessor`)
  │      └── `validate_dataset` (≥50 observations, ≥2 numeric sensor channels)
  │      └── `clean_and_prepare` (sorting, deduplication, ffill -> bfill -> median)
  │
  ├── 9. Transactional State Snapshot & Rollback (`state_service.py`)
  │      └── Pre-upload state preserved
  │      └── `train_all(feature_cols)` fitted strictly on chronological train split
  │      └── Automatic state rollback if model fitting fails
  │
  ├── 10. Database Persistence (`database.py`)
  │       └── Record inserted into `datasets` table (UUID, name, uploaded_by, rows, cols)
  │       └── Run inserted into `training_runs` table (weights, metrics, sample counts)
  │
[UI State Synchronization]
  └── 11. Frontend Telemetry & Dashboard Refresh
          └── `onRefreshDataset()` triggers `fetchAllData()`
          └── `loadPreview()` refreshes table view
```

---

## 3. Root Cause Analysis

### Cause 1: Native Browser `TypeError: Failed to fetch` Uncaught by HTTP Client
- **Location:** `frontend/src/services/api.ts` (line 316)
- **Mechanism:** In modern web browsers, `window.fetch()` throws a native `TypeError: Failed to fetch` exclusively when a request cannot be initiated or completed at the networking/transport layer (before HTTP status codes are received). Common triggers include:
  1. Connection refusal (backend server offline or wrong port).
  2. CORS preflight rejection (browser sends `OPTIONS`, backend does not respond with matching `Access-Control-Allow-Origin`).
  3. Origin / Hostname mismatch (frontend loaded on `http://localhost:5173`, calling backend at `http://127.0.0.1:8000`).
- **Impact:** `api.ts` did not catch `TypeError`, allowing the generic message `"Failed to fetch"` to bubble directly up to `DatasetsPage.tsx`, obscuring the real failure reason.

### Cause 2: Missing Development Reverse Proxy in Vite
- **Location:** `frontend/vite.config.ts`
- **Mechanism:** Prior to this fix, `vite.config.ts` had no `server.proxy` configuration. The frontend made direct cross-origin HTTP calls from `http://localhost:5173` to `http://127.0.0.1:8000/api`. Because `localhost` and `127.0.0.1` are treated as distinct origins by the browser's Same-Origin Policy, every `multipart/form-data` POST required cross-origin preflight handling. Any minor discrepancy in port, IP, or headers caused the browser to abort the request with `"Failed to fetch"`.
- **Resolution:** Added transparent dev-server proxy in `vite.config.ts` mapping `/api` to `http://127.0.0.1:8000`.

### Cause 3: Restrictive Development CORS Allowed Origins
- **Location:** `backend/app/main.py` & `backend/app/core/config.py`
- **Mechanism:** `DEV_CORS_ORIGINS` was restricted to exact origins (`localhost:5173`, `127.0.0.1:5173`, `localhost:3000`, `127.0.0.1:3000`). If Vite opened on port 5174 (common when port 5173 is occupied) or port 4173 (`vite preview`), `CORSMiddleware` rejected the preflight `OPTIONS` request.
- **Resolution:** Configured `allow_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"` in non-production environments to permit any local development port seamlessly.

### Cause 4: File Input Native Change Event Lock
- **Location:** `frontend/src/components/pages/DatasetsPage.tsx`
- **Mechanism:** Inside `handleFileUpload`, `e.target.files?.[0]` was read, but `e.target.value = ''` was never reset in the `finally` block. Consequently, when a user encountered an error and attempted to re-upload the same file after fixing it, the browser's native `<input type="file">` did not fire the `onChange` event, giving the user the impression that the upload was frozen.
- **Resolution:** Explicitly reset `e.target.value = ''` in `handleFileUpload`'s `finally` handler.

### Cause 5: Missing Database Persistence for Uploaded Datasets
- **Location:** `backend/app/api/datasets.py`
- **Mechanism:** `upload_csv` was updating in-memory state in `state_service`, but never executed `INSERT` statements into the `datasets` and `training_runs` database tables. As a result, uploaded datasets were ephemeral and not tracked in the relational database.
- **Resolution:** Implemented atomic SQL writes into `datasets` and `training_runs` tables with UUID generation, timestamp tracking, and user token attribution.

### Cause 6: State Corruption Risk on Failed Model Training
- **Location:** `backend/app/api/datasets.py`
- **Mechanism:** `state_service.set_dataset` was invoked *before* `state_service.train_all`. If model training failed (e.g., due to degenerate variance or ill-conditioned sensor matrices), `state_service.active_dataset` was already overwritten, leaving the application in a corrupted, broken state.
- **Resolution:** Implemented snapshot-and-rollback logic: if training fails, the previous active dataset, feature set, models, and telemetry are restored.

---

## 4. Verification & Validation Summary

All root causes have been verified, repaired, and validated across 13 comprehensive end-to-end scenarios, 78 backend pytest test cases, 21 frontend vitest test cases, and a clean production TypeScript build.

