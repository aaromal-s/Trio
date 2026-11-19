# TRIO 3.0 — DATASET UPLOAD PERMANENT FIX REPORT

**Project:** TRIO — Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery  
**Release:** TRIO 3.0.0 Production  
**Scope:** Frontend API Client, Vite Dev Server, FastAPI Backend, Time-Series Preprocessing, Database Persistence  
**Date:** November 2026  

---

## 1. Overview of Fixes Implemented

To eliminate the `"Failed to fetch"` error and provide industrial-grade reliability for CSV ingestion, fixes were designed and applied across both frontend and backend architectures:

| Subsystem | File Modified | Purpose of Fix |
| :--- | :--- | :--- |
| **Frontend Proxy** | `frontend/vite.config.ts` | Added `/api` dev-server reverse proxy targeting `http://127.0.0.1:8000` |
| **Frontend API Client** | `frontend/src/services/api.ts` | Error transformation for `TypeError: Failed to fetch`; attached auth Bearer token; preserved automatic boundary generation |
| **Frontend Ingestion UI** | `frontend/src/components/pages/DatasetsPage.tsx` | Reset `e.target.value = ''` in `finally` block; case-insensitive `.csv` detection; cleaned unused imports |
| **CORS Middleware** | `backend/app/main.py` | Added `allow_origin_regex` for all local ports (`localhost`/`127.0.0.1`) in dev mode |
| **CORS Config** | `backend/app/core/config.py` | Expanded `DEV_CORS_ORIGINS` to include ports 5174, 4173, 8080 |
| **Backend Ingestion API** | `backend/app/api/datasets.py` | Added rollback safety; persisted datasets and training runs to database; extracted user token |
| **Data Preprocessor** | `backend/app/ml/preprocessor.py` | Used `_try_clean_numeric_series` in `clean_and_prepare` for quoted/comma/whitespace numbers |
| **Verification Suite** | `backend/tests/test_csv_ingestion.py` | Added test cases 24–30 covering all 12 scenarios, DB persistence, and rollback |

---

## 2. Detailed Technical Fixes

### 2.1 Frontend Development Reverse Proxy (`frontend/vite.config.ts`)
Configured Vite's internal proxy so that client-side requests to `/api` are seamlessly forwarded to the FastAPI backend without triggering cross-origin preflight issues or hostname mismatches:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### 2.2 Graceful Network Error Handling & Auth Attachment (`frontend/src/services/api.ts`)
Updated `uploadCSV` to catch native `TypeError: Failed to fetch` and return an actionable error message directing the user to verify the backend server status, while also appending the user's Bearer token if logged in:

```typescript
  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('trio_token') || localStorage.getItem('token'))
      : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/datasets/upload-csv`, {
        method: 'POST',
        headers,
        body: formData
      });
    } catch (netErr: any) {
      const isFetchErr = netErr?.name === 'TypeError' || String(netErr?.message || '').toLowerCase().includes('fetch');
      if (isFetchErr) {
        throw new Error(`Unable to connect to TRIO backend at ${API_BASE_URL}. Ensure the backend server is running and accessible.`);
      }
      throw netErr;
    }
    ...
```

### 2.3 Input Re-Upload Reset (`frontend/src/components/pages/DatasetsPage.tsx`)
Ensured `<input type="file">` value is reset upon upload completion, allowing the same file to be selected and uploaded consecutively:

```typescript
    } catch (err: any) {
      setUploadError(err.message || 'CSV upload failed');
      setUploadDiagnostics(err.diagnostics || null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
```

### 2.4 Transactional State Snapshot & Rollback (`backend/app/api/datasets.py`)
Implemented pre-upload snapshotting. If model training encounters any mathematical or numerical error, all components of `state_service` are immediately restored to their pre-upload state:

```python
# Snapshot current state for transactional rollback
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

state_service.set_dataset(df_cleaned, file.filename, is_simulated=False)
state_service.feature_cols = available_numeric

try:
    train_res = state_service.train_all(feature_cols=available_numeric)
except Exception as train_err:
    # State rollback: previous working dataset preserved intact
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
    raise HTTPException(status_code=400, detail=f"...")
```

### 2.5 Database Persistence (`backend/app/api/datasets.py`)
Persisted all successfully uploaded datasets to SQLite and PostgreSQL `datasets` and `training_runs` tables, recording `id`, `name`, `uploaded_by`, `row_count`, `column_count`, `features_json`, and timestamps.

### 2.6 Dirty Numeric Series Cleaning (`backend/app/ml/preprocessor.py`)
Updated `clean_and_prepare` to invoke `self._try_clean_numeric_series` so that quoted numbers with thousands separators (`"1,200.5"`, `" -45.2 "`, etc.) are parsed cleanly into floats rather than coerced into `NaN`.

