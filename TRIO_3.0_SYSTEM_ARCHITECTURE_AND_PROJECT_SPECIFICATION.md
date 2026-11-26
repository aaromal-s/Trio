# TRIO 3.0: Comprehensive System Architecture & Function-by-Function Technical Specification

> **Official Project Title**: TRIO — Contradiction-Guided Tri-Memory Unsupervised Learning for Industrial SCADA Anomaly & Novel Operational Regime Discovery  
> **Repository**: [https://github.com/aaromal-s/Trio](https://github.com/aaromal-s/Trio)  
> **Production Frontend (Vercel)**: [https://trio-one-rho.vercel.app](https://trio-one-rho.vercel.app)  
> **Production Backend (Render)**: [https://trio-59r2.onrender.com](https://trio-59r2.onrender.com)  
> **Local Services**: Backend `http://127.0.0.1:8001` &bull; Frontend `http://localhost:5173`

---

## 1. Executive Summary & Problem Formulation

### 1.1 Industrial Context & The "Alarm Fatigue" Crisis
Modern industrial automation systems—such as municipal water treatment plants, urban railway networks, chemical refineries, and power grids—generate millions of time-series SCADA (Supervisory Control and Data Acquisition) observations daily. Traditional monitoring relies on static high/low thresholds defined in programmable logic controllers (PLCs). Under standard operating conditions (**IEC 62682** / **ISA 18.2**), operators face up to **10,000 alarms per day**, where **over 95% are nuisance alarms** triggered by transient hydraulic flutter, mechanical vibration noise, or momentary sensor chatter.

### 1.2 The "Unknown Unknowns" Challenge
1. **Supervised Learning Failure**: Supervised algorithms require large quantities of labeled failure data. In mission-critical infrastructure, failures are rare and novel degradation modes are uncataloged.
2. **Vanilla Unsupervised Failure**: Standard outlier detectors (Isolation Forest, One-Class SVM, Mahalanobis distance) evaluate points in isolation and cannot distinguish between an **isolated transient spike** and a **persistent, coherent, novel operational regime**.

### 1.3 The TRIO Solution
**TRIO** introduces a biologically-inspired, tri-tier memory architecture that operates purely **unsupervised**:
* **Short-Term Memory (STM)** dampens high-frequency transient chatter inside a sliding FIFO buffer.
* **Long-Term Memory (LTM)** validates ongoing operations against verified baseline regime prototypes.
* **Contradiction Memory (CM)** accumulates sustained multi-sensor discrepancies and applies DBSCAN density clustering to isolate and characterize **unknown operational regimes** before catastrophic failure occurs.

---

## 2. Mathematical Model & Algorithmic Formulation

```mermaid
flowchart TD
    subgraph DataIngestion["1. Telemetry Ingestion & Zero-Leakage Pipeline"]
        RawStream["Raw SCADA Telemetry<br/>(MetroPT-3 / SWaT / Custom CSV)"] --> Preproc["DataPreprocessor & Chronological Split<br/>(t_train < t_test; Fitted Scaling)"]
    end

    subgraph TriMemoryEngine["2. The Tri-Memory Arbitration Engine"]
        Preproc --> STM["Short-Term Memory (STM)<br/>Sliding FIFO Buffer (N=30)<br/>μ_stm, σ_stm, Δv"]
        STM --> Scorer["Contradiction Scoring Function<br/>C(x_t) = α·D + β·T + γ·A"]
        
        Scorer -->|C < τ (Familiar Baseline)| LTM["Long-Term Memory (LTM)<br/>Known Prototypes (μ_k, r_k)"]
        Scorer -->|C ≥ τ & Transient (<15 obs)| Buffer["STM Transient Buffer<br/>(Alarm Fatigue Suppressed)"]
        Scorer -->|C ≥ τ & Sustained (≥15 obs)| CM["Contradiction Memory (CM)<br/>Accumulated Discrepancies"]
    end

    subgraph Discovery["3. Density Clustering & Governance"]
        CM --> DBSCAN["Spatial Density Clustering<br/>(MinPts=8, ε=0.65)"]
        DBSCAN --> Candidate["Emergent Discovery Candidate<br/>(e.g., CAND-2026-001)"]
        Candidate --> HITL["Human-in-the-Loop Governance<br/>(Confirm / Hold Validation / Reject)"]
        HITL -->|Confirmed Known Mode| LTM
    end
```

### 2.1 Unified Contradiction Scoring Formulation
Every incoming observation vector $x_t \in \mathbb{R}^d$ receives a normalized contradiction score $\mathcal{C}(x_t) \in [0, 1]$:

$$\mathcal{C}(x_t) = \alpha \cdot \mathcal{D}(x_t, \text{LTM}) + \beta \cdot \mathcal{T}(x_t, \text{STM}) + \gamma \cdot \mathcal{A}(x_t)$$

where $\alpha, \beta, \gamma \ge 0$ and $\alpha + \beta + \gamma = 1.0$ (calibrated defaults: $\alpha = 0.40, \beta = 0.35, \gamma = 0.25$, threshold $\tau = 0.32$).

1. **Prototype Distance Metric ($\mathcal{D}$)**:
   $$\mathcal{D}(x_t, \text{LTM}) = 1 - \exp\left(-\frac{1}{2}\left[\max\left(0, \frac{\min_{k} \|x_t - \mu_k\|_2}{r_k} - 0.75\right)\right]^2\right)$$
2. **Temporal Inconsistency Metric ($\mathcal{T}$)**:
   $$\mathcal{T}(x_t, \text{STM}) = 1 - \exp\left(-0.4\left[\max\left(0, \|x_t - \bar{x}_{\text{STM}}\|_2 - 0.5\right)\right]^2\right)$$
3. **Distributional Anomaly Metric ($\mathcal{A}$)**:
   $$\mathcal{A}(x_t) = \frac{1}{1 + \exp\left(25.0 \cdot (s(x_t) - s_{0.05})\right)}$$

### 2.2 Zero-Leakage Chronological Validation
1. **Chronological Splitting**: $t_{\text{train}} \cap t_{\text{test}} = \emptyset$ where $\max(t_{\text{train}}) < \min(t_{\text{test}})$; shuffling is disabled.
2. **Leak-Free Scaling**: `StandardScaler` ($\mu, \sigma$) is fitted strictly on $t_{\text{train}}$ and applied to $t_{\text{test}}$ via `transform()`.

---

## 3. Complete Repository Structure

```
D:\movie\PROJECT\
├── .gitignore / .python-version / Procfile / render.yaml / requirements.txt
├── start_all.bat / start_backend.bat / start_frontend.bat
├── TRIO_3.0_SYSTEM_ARCHITECTURE_AND_PROJECT_SPECIFICATION.md
├── TRIO_EXECUTIVE_PRESENTATION_AND_DEMO_GUIDE.md
├── Dataset/
│   ├── MetroPT3_AirCompressor_Preprocessed.csv
│   ├── Hydraulic_Test_Rig_Preprocessed.csv
│   └── Data Description_Metro.pdf / description.txt / profile.txt
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/ (auth.py, dashboard.py, datasets.py, discoveries.py, evaluation.py, memory.py, models.py)
│   │   ├── core/ (config.py, database.py, email_service.py, rate_limiter.py, security.py)
│   │   ├── ml/ (trio_model.py, preprocessor.py, baselines.py, evaluator.py, synthetic_generator.py)
│   │   └── services/ (state_service.py)
│   ├── data/ (MetroPT3_AirCompressor_Operational.csv, Hydraulic_Test_Rig_Preprocessed.csv)
│   ├── scripts/ (calibrate_metro.py, inspect_datasets.py, preprocess_all_datasets.py, verify_all_endpoints.py, ...)
│   └── tests/ (75 Pytest tests)
└── frontend/
    ├── index.html / package.json / vite.config.ts / tailwind.config.js / vercel.json
    └── src/
        ├── App.tsx / main.tsx / index.css
        ├── context/TelemetryContext.tsx
        ├── services/ (api.ts, mockData.ts)
        ├── utils/exportIncidentReport.ts
        ├── components/
        │   ├── brand/ (TrioLogo.tsx, Trio3DLogo.tsx)
        │   ├── layout/ (Navbar.tsx, Sidebar.tsx)
        │   ├── common/ (IndustrialHeroConsole.tsx, TriMemoryPipelineMonitor.tsx, Interactive3DBackground.tsx)
        │   ├── 3d/ (TriMemoryDigitalTwin3D.tsx, TriMemoryMiniVisualizer3D.tsx)
        │   ├── modals/ (CommandPaletteModal.tsx, SettingsModal.tsx, ProfileModal.tsx, VivaGuideModal.tsx)
        │   └── pages/ (LandingPage.tsx, LoginPage.tsx, OverviewPage.tsx, DatasetsPage.tsx, ModelLabPage.tsx, TriMemoryPage.tsx, DiscoveriesPage.tsx, EvaluationPage.tsx)
        └── tests/ (21 Vitest tests)
```

---

## 4. Exhaustive Backend Function-by-Function Reference

### 4.1 Core Infrastructure (`backend/app/core/`)

#### [backend/app/core/config.py](file:///d:/movie/PROJECT/backend/app/core/config.py)
* `class Settings(BaseModel)`: Holds Pydantic v2 runtime configuration (`APP_NAME`, `ENVIRONMENT`, `ALLOWED_ORIGINS`, `DATABASE_URL`, `RESEND_API_KEY`, `RATE_LIMIT_LOGIN`, `DEFAULT_ADMIN_PASSWORD`).

#### [backend/app/core/database.py](file:///d:/movie/PROJECT/backend/app/core/database.py)
* `_get_database_url() -> str`: Resolves `DATABASE_URL` from environment or defaults to local `sqlite:///backend/trio.db`.
* `_is_postgres(url: str) -> bool`: Checks whether the active connection string targets PostgreSQL (`postgres://` or `postgresql://`).
* `_sqlite_path(url: str) -> str`: Extracts the filesystem path from a SQLite URI.
* `_translate_sql(sql: str, is_pg: bool) -> str`: Rewrites SQLite `?` placeholders and DDL dialect tokens into PostgreSQL `%s` syntax transparently.
* `_get_pg_pool()`: Lazily initializes a thread-safe `psycopg2` connection pool when running in PostgreSQL mode.
* `get_connection()`: Context manager yielding an active SQLite or pooled PostgreSQL connection with automatic commit/rollback.
* `run_migrations()`: Creates all required tables (`users`, `sessions`, `password_resets`, `training_history`, `discovery_states`, `audit_logs`) idempotently on startup.
* `_ph(n: int) -> str` & `_phk() -> str`: Generates parameterized SQL placeholder strings (`?` vs `%s`) for cross-database compatibility.
* `execute_query(sql, params, fetch)`: Executes parameterized `SELECT` queries returning `"one"`, `"all"`, or `"val"`.
* `execute_write(sql, params) -> int`: Executes parameterized `INSERT`/`UPDATE`/`DELETE` statements and returns affected row count.
* `seed_default_users(hash_fn)`: Seeds the evaluator demo account (`evaluator` / `trio2026demo`) with Argon2id hashes if not already present.
* `seed_bootstrap_admin(hash_fn)`: Seeds the administrator account (`12406834` / `123456`) with optional forced-password-change flag.
* `migrate_sqlite_to_postgres(sqlite_path, pg_url)`: Utility to migrate local SQLite records into a production PostgreSQL database.

#### [backend/app/core/email_service.py](file:///d:/movie/PROJECT/backend/app/core/email_service.py)
* `_build_reset_email_html(reset_link, expires_minutes=15) -> str`: Builds the styled HTML template for password recovery emails.
* `send_password_reset_email(to_email, reset_link)`: Dispatches transactional reset emails via the Resend HTTP API (or logs locally in development mode when no API key is configured).

#### [backend/app/core/rate_limiter.py](file:///d:/movie/PROJECT/backend/app/core/rate_limiter.py)
* `_init_redis()`: Connects to Redis if `REDIS_URL` is configured; otherwise falls back to in-memory sliding windows.
* `_check_memory(key, max_requests, window_seconds)`: Thread-safe sliding-window token-bucket check in Python memory.
* `_check_redis(key, max_requests, window_seconds)`: Atomic Redis sorted-set sliding-window check for distributed deployments.
* `check_rate_limit(key, max_requests, window_seconds)`: Public rate-limiter entrypoint routing between Redis and memory.
* `is_redis_available() -> bool` & `get_rate_limiter_info() -> dict`: Exposes backend diagnostics for `/api/health`.
* `reset_rate_limiter_memory()`: Clears in-memory buckets during automated test isolation.

#### [backend/app/core/security.py](file:///d:/movie/PROJECT/backend/app/core/security.py)
* `class SecurityHeadersMiddleware(BaseHTTPMiddleware)`: Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and `Strict-Transport-Security` headers on every HTTP response.

---

### 4.2 Machine Learning & Data Engine (`backend/app/ml/` & `backend/app/services/`)

#### [backend/app/ml/trio_model.py](file:///d:/movie/PROJECT/backend/app/ml/trio_model.py)
* `class ShortTermMemory`:
  * `__init__(capacity=30)`: Initializes a circular `collections.deque` buffer of length `30`.
  * `push(observation, timestamp)`: Appends the current normalized vector $x_t$ and timestamp.
  * `clear()`: Empties the FIFO buffer.
  * `is_ready() -> bool`: Returns `True` when $\ge 5$ observations are buffered.
  * `get_recent_window() -> np.ndarray`: Stacks buffered vectors into an $(N \times d)$ matrix.
  * `get_moving_average() -> np.ndarray`: Computes rolling mean $\bar{x}_{\text{STM}}$.
  * `get_variance() -> np.ndarray`: Computes rolling sensor variance $\sigma^2_{\text{STM}}$.
  * `get_velocity() -> np.ndarray`: Computes mean temporal gradient $\Delta v = \frac{1}{N-1}\sum (x_{i+1} - x_i)$.
  * `to_dict() -> Dict`: Serializes utilization %, mean, variance, and velocity for `/api/memory/stm`.
* `class LongTermMemory`:
  * `fit_known_states(X_train, n_clusters=3)`: Runs K-Means on $t_{\text{train}}$ to learn prototype centroids $\mu_k$ and 95th-percentile dispersion radii $r_k$.
  * `min_distance(observation) -> Tuple[float, int]`: Returns normalized Euclidean distance to nearest $\mu_k$ and its prototype index.
  * `to_dict(feature_names) -> List[Dict]`: Exports prototype coordinates, radii, and activation counts.
* `class ContradictionMemory`:
  * `add(observation, timestamp, score, d_score, t_score, a_score)`: Stores contradictory vectors ($\mathcal{C} \ge \tau$) up to `max_records = 5000`.
  * `clear()`: Resets stored contradictions.
  * `get_points() -> np.ndarray`: Returns $(M \times d)$ feature matrix for clustering.
  * `to_summary() -> Dict`: Summarizes total records, score distribution, and recent alerts.
* `class DiscoveryCandidate`:
  * `to_dict(feature_names) -> Dict`: Formats `candidate_id`, `observation_count`, `first_detected`, `last_detected`, `mean_contradiction_score`, `cluster_density`, `feature_deltas` ($\Delta\sigma$), `prototype_vector`, `explanation`, and `status`.
* `class TRIOModel`:
  * `update_weights(alpha, beta, gamma)`: Re-normalizes $\alpha + \beta + \gamma = 1.0$.
  * `train(X_train, feature_names, n_known_clusters=3)`: Fits `LongTermMemory` and baseline `IsolationForest` strictly on $t_{\text{train}}$.
  * `compute_contradiction_score(observation)`: Computes $(\mathcal{C}, \mathcal{D}, \mathcal{T}, \mathcal{A})$.
  * `process_stream(X_test, timestamps)`: Streams test data chronologically through STM, filters transients, and populates CM.
  * `discover_unknown_states(timestamps)`: Runs DBSCAN ($\text{MinPts}=8, \epsilon=0.65$) on CM once $\ge 15$ points accumulate to crystallize `DiscoveryCandidate` objects.
  * `update_candidate_status(candidate_id, new_status) -> bool`: Applies operator governance transitions (`Confirmed`, `Under Validation`, `Rejected`).

#### [backend/app/ml/preprocessor.py](file:///d:/movie/PROJECT/backend/app/ml/preprocessor.py)
* `class DataPreprocessor`:
  * `_is_timestamp_col(col_name, series) -> bool`: Detects timestamp columns across 12 ISO-8601 and SCADA formats.
  * `_try_clean_numeric_series(series) -> Optional[pd.Series]`: Parses European comma decimals (`25,4` $\to$ `25.4`) and strips non-numeric units.
  * `validate_dataset(df) -> Dict`: Checks row counts, numeric columns, missing ratios, and transposed orientation.
  * `clean_and_prepare(df, ...)`: Auto-transposes sensor-row matrices, enforces chronological sorting, imputes NaNs, and isolates numeric channels.
  * `chronological_split(df) -> Tuple[pd.DataFrame, pd.DataFrame]`: Splits 70% train / 30% test without shuffling.
  * `fit_transform_train(train_df, feature_cols)` & `transform_test(test_df)`: Fits `StandardScaler` on train only and transforms test without leakage.

#### [backend/app/ml/baselines.py](file:///d:/movie/PROJECT/backend/app/ml/baselines.py), [evaluator.py](file:///d:/movie/PROJECT/backend/app/ml/evaluator.py), [synthetic_generator.py](file:///d:/movie/PROJECT/backend/app/ml/synthetic_generator.py)
* `BaselinePipelines.run_kmeans(X_train, X_test, n_clusters=4)`: K-Means distance-based anomaly baseline.
* `BaselinePipelines.run_dbscan(X_train, X_test, eps=0.8, min_samples=5)`: Raw density clustering baseline.
* `BaselinePipelines.run_isolation_forest(X_train, X_test, contamination=0.08)`: Point-wise Isolation Forest baseline.
* `ModelEvaluator.compute_metrics(...)`: Computes Precision, Recall, F1-Score, False Discovery Rate (FDR), Detection Delay, Adjusted Rand Index (ARI), Normalized Mutual Information (NMI), and inference latency.
* `generate_synthetic_industrial_data(...)`: Procedural 6-stage SWaT water treatment simulator (`FIT101`, `LIT101`, `FIT201`, `AIT202`, `DPIT301`, `AIT402`) with injected drift and transient spikes.

#### [backend/app/services/state_service.py](file:///d:/movie/PROJECT/backend/app/services/state_service.py)
* `StateService.load_initial_dataset()`: Boots with `MetroPT3_AirCompressor_Operational.csv` (`is_simulated = False`) and executes initial training.
* `StateService.load_default_synthetic(n_samples=1500)`: Fallback SWaT generator.
* `StateService.set_dataset(df, name, is_simulated=False)`: Atomic dataset swap with rollback protection.
* `StateService.train_all(...)`: Full pipeline orchestration (preprocessing $\to$ chronological split $\to$ `TRIOModel` $\to$ baselines $\to$ metrics).

---

### 4.3 Backend REST API Catalogue (31 Endpoints)

| Domain | Method | Endpoint | Function & Working |
| :--- | :---: | :--- | :--- |
| **System** | `GET` | `/` | Service metadata, version, and operational status |
| | `GET` | `/api/health` | Health check (DB connectivity, Redis/memory rate limiter, active model) |
| **Auth** | `POST` | `/api/auth/login` | Argon2id credential verification and bearer token issuance |
| | `GET` / `PUT` | `/api/auth/profile` | Fetch or update operator profile metadata and preferences |
| | `POST` / `PUT` | `/api/auth/avatar` | Upload or update operator profile avatar image |
| | `GET` | `/api/auth/sessions` | List active login sessions across devices |
| | `POST` | `/api/auth/sessions/logout-others` | Revoke all other active sessions |
| | `POST` | `/api/auth/forgot-password` | Generate single-use password reset link |
| **Datasets** | `GET` | `/api/datasets/current` | Active dataset metadata, numeric feature list, and validation summary |
| | `GET` | `/api/datasets/preview` | Paginated raw telemetry preview |
| | `POST` | `/api/datasets/upload-csv` | Upload custom SCADA CSV with delimiter/decimal auto-detection |
| | `POST` | `/api/datasets/generate-synthetic` | Generate procedural SWaT 6-stage dataset |
| | `GET` | `/api/datasets/swat-info` | SUTD iTrust SWaT testbed specification |
| | `GET` | `/api/datasets/metro-info` | MetroPT-3 railway air compressor specification |
| | `POST` | `/api/datasets/load-metro` | Hot-swap active dataset back to MetroPT-3 |
| **Models** | `GET` | `/api/models/status` | Active model version, $\alpha/\beta/\gamma$ weights, $\tau$, and selected features |
| | `POST` | `/api/models/train` | Retrain TRIO + baselines with custom hyperparameters |
| | `GET` | `/api/models/history` | Historical training run audit log |
| **Memory** | `GET` | `/api/memory/status` | Real-time utilization of STM, LTM, and CM |
| | `GET` | `/api/memory/stm` | STM sliding window contents, rolling mean, variance, velocity |
| | `GET` | `/api/memory/ltm` | LTM prototype centroids and radii |
| | `GET` | `/api/memory/cm` | Contradiction Memory records and $\mathcal{C}, \mathcal{D}, \mathcal{T}, \mathcal{A}$ scores |
| **Discoveries**| `GET` | `/api/discoveries` | List all DBSCAN-isolated operational state candidates |
| | `GET` | `/api/discoveries/{id}` | Detailed evidence, `feature_deltas`, and centroid coordinates |
| | `POST` | `/api/discoveries/{id}/status` | Update governance status (`Confirmed`, `Under Validation`, `Rejected`) |
| **Dashboard** | `GET` | `/api/dashboard/overview` | Aggregated KPIs, sensor trends, contradiction stream, state distribution |
| **Evaluation** | `GET` | `/api/evaluation/benchmark` | Comparative benchmark metrics vs K-Means, DBSCAN, Isolation Forest |
| | `GET` | `/api/evaluation/export-csv` | Download evaluation benchmark table as CSV |

---

## 5. Exhaustive Frontend Function-by-Function Reference

### 5.1 Design System, Entry & Root Orchestration

#### [frontend/index.html](file:///d:/movie/PROJECT/frontend/index.html), [frontend/tailwind.config.js](file:///d:/movie/PROJECT/frontend/tailwind.config.js), [frontend/src/index.css](file:///d:/movie/PROJECT/frontend/src/index.css)
* **Unified Volcanic Charcoal & Amber Copper Palette**: Light mode and theme switching were removed for consistent high-contrast control room visibility (`#0C0A09` background, `#141210` secondary, `#1C1917` card, `#F97316` molten amber primary, `#FACC15` warm gold secondary, `#FB923C` copper).
* **Typography**: Loads `Space Grotesk` (`font-display`), `Inter` (`font-sans`), and `JetBrains Mono` (`font-mono tabular-nums`).
* **iOS Liquid Glass CSS Classes**: `.liquid-glass-nav` (floating `blur(26px) saturate(180%)` header with specular rim), `.liquid-glass-btn` / `.liquid-glass-primary` (spring lift, press scale `0.965`, diagonal hover light sweep), `.liquid-glass-pill`, `.glass-card`, and `.bg-scada-grid`.

#### [frontend/src/App.tsx](file:///d:/movie/PROJECT/frontend/src/App.tsx)
* `App()`: Wraps `AppContent` in `<TelemetryProvider>`.
* `AppContent()`:
  * Manages `currentView` (`landing`, `login`, `overview`, `datasets`, `models`, `memory`, `discoveries`, `evaluation`), modal visibility (`isSettingsOpen`, `isProfileOpen`, `isVivaOpen`, `isCommandPaletteOpen`), and core state (`overviewData`, `datasetInfo`, `modelStatus`, `discoveries`, `userProfile`).
  * `useEffect` (Keyboard Shortcut): Listens globally for `Ctrl+K` / `Cmd+K` to toggle `<CommandPaletteModal />`.
  * `fetchAllData` (`useCallback`): Fetches `/overview`, `/datasets/current`, `/models/status`, `/discoveries`, and `/auth/profile` concurrently via `Promise.all`.
  * `handleExportReport` (`useCallback`): Invokes `downloadIncidentReport()` with live dashboard state.
  * `handleResetDemo`: Resets synthetic/demo state via API and refreshes telemetry.

### 5.2 Context, Networking & Utilities

#### [frontend/src/context/TelemetryContext.tsx](file:///d:/movie/PROJECT/frontend/src/context/TelemetryContext.tsx)
* `TelemetryProvider`: Manages background polling (`intervalSec`: `2s`/`5s`/`10s`/`30s`, persisted in `localStorage`), `isPaused`, `isFetching`, `lastUpdated`, and `fetchError`. Uses `inFlightRef` lock to prevent overlapping network requests on slow connections.
* `togglePaused()`: Toggles background polling on/off.
* `triggerManualRefresh()`: Forces an immediate fetch bypassing timer wait.
* `useTelemetry()`: Custom hook exposing `TelemetryContextType` to child components.

#### [frontend/src/services/api.ts](file:///d:/movie/PROJECT/frontend/src/services/api.ts)
* `resolveApiBaseUrl()`: Reads `VITE_API_BASE_URL`, strips trailing slashes, guards against unconfigured angle-bracket placeholders (`<your-deployed-backend-url>`), and falls back safely to `/api` (which routes through Vercel's reverse proxy in production).
* `api` object: Exposes typed async methods for all 31 endpoints (`login`, `getProfile`, `updateProfile`, `uploadAvatar`, `getSessions`, `logoutOtherSessions`, `forgotPassword`, `resetPassword`, `getOverview`, `getCurrentDataset`, `getDatasetPreview`, `uploadCSV`, `generateSynthetic`, `loadMetro`, `getModelStatus`, `trainModel`, `getModelHistory`, `getMemoryStatus`, `getSTM`, `getLTM`, `getCM`, `getDiscoveries`, `updateCandidateStatus`, `getBenchmarks`, `testConnection`).

#### [frontend/src/utils/exportIncidentReport.ts](file:///d:/movie/PROJECT/frontend/src/utils/exportIncidentReport.ts)
* `downloadIncidentReport({ overview, dataset, model, discoveries })`: Compiles a timestamped Markdown operational handover report (`TRIO_Incident_Report_YYYY-MM-DD.md`) containing model hyperparameters ($\alpha, \beta, \gamma, \tau$), KPIs, state distribution, and ranked top-5 sensor deviations per discovery candidate, and triggers browser download via `Blob` + `URL.createObjectURL`.

### 5.3 Layout, Brand & 3D Visualizers

* **[Navbar.tsx](file:///d:/movie/PROJECT/frontend/src/components/layout/Navbar.tsx)**: Floating Liquid Glass top bar with live digital clock (`useEffect` 1s interval + `tabular-nums`), `Search Ctrl+K` command palette trigger, dataset/model status badges, auto-refresh pause/resume pill, notification popover, and operator profile dropdown.
* **[Sidebar.tsx](file:///d:/movie/PROJECT/frontend/src/components/layout/Sidebar.tsx)**: Responsive drawer/sticky sidebar with `handleItemClick(id)`, `framer-motion` spring active indicator (`layoutId="sidebar-active-bar"`), Liquid Glass active pill, live candidate badge count, and `C = α·D + β·T + γ·A` context box.
* **[TrioLogo.tsx](file:///d:/movie/PROJECT/frontend/src/components/brand/TrioLogo.tsx)** & **[Trio3DLogo.tsx](file:///d:/movie/PROJECT/frontend/src/components/brand/Trio3DLogo.tsx)**: Animated SVG Tri-Memory emblem (Molten Amber STM, Warm Gold LTM, Copper CM nodes) and Three.js mouse-tracking logo variant.
* **[IndustrialHeroConsole.tsx](file:///d:/movie/PROJECT/frontend/src/components/common/IndustrialHeroConsole.tsx)**:
  * `useEffect`: 400ms ticker driving live simulated MetroPT-3 waveforms (`TP2`, `Reservoirs`, `Oil_temp`).
  * `useMemo` (`linePoints`, `areaPoints`, `scanY`): Computes SVG polyline, gradient area fill polygon, and leading-edge cursor coordinates.
  * Interactive Liquid Glass scenario tabs (`Normal Baseline`, `Novel Regime`, `Transient Pulse`) with spring `layoutId="hero-mode-pill"` and `τ = 0.32` Contradiction Scoring meter.
* **[TriMemoryPipelineMonitor.tsx](file:///d:/movie/PROJECT/frontend/src/components/common/TriMemoryPipelineMonitor.tsx)**: Displays live STM %, LTM cluster count, CM evidence points, and `τ ≥ 0.32 Routing` indicator.
* **[TriMemoryDigitalTwin3D.tsx](file:///d:/movie/PROJECT/frontend/src/components/3d/TriMemoryDigitalTwin3D.tsx)**, **[TriMemoryMiniVisualizer3D.tsx](file:///d:/movie/PROJECT/frontend/src/components/3d/TriMemoryMiniVisualizer3D.tsx)**, **[Interactive3DBackground.tsx](file:///d:/movie/PROJECT/frontend/src/components/common/Interactive3DBackground.tsx)**: Three.js WebGL scenes with `handlePointerMove`, `handlePointerClick`, and `handleResize` lifecycle cleanup.

### 5.4 Modals

* **[CommandPaletteModal.tsx](file:///d:/movie/PROJECT/frontend/src/components/modals/CommandPaletteModal.tsx)**:
  * `commands` (`useMemo`): Registers 7 navigation targets and 4 quick actions.
  * `filtered` (`useMemo`): Real-time fuzzy search across label, subtitle, and category.
  * `useEffect` (Keyboard handler): Handles `ArrowDown`, `ArrowUp`, `Enter`, and `Escape`.
* **[SettingsModal.tsx](file:///d:/movie/PROJECT/frontend/src/components/modals/SettingsModal.tsx)**:
  * 4 tabs: **Interface** (layout density & alert toggle), **Telemetry Stream** (polling rate & pause), **Backend API** (`handleTestConnection()` latency check), and **Regional** (12h/24h & timezone). `handleSaveAll()` persists settings to `localStorage`.
* **[ProfileModal.tsx](file:///d:/movie/PROJECT/frontend/src/components/modals/ProfileModal.tsx)**:
  * `handleSaveProfile`: Updates operator metadata via `PUT /api/auth/profile`.
  * `handleChangePassword`: Validates and updates operator password.
  * `handleLogoutOtherSessions`: Revokes concurrent sessions via `POST /api/auth/sessions/logout-others`.
* **[VivaGuideModal.tsx](file:///d:/movie/PROJECT/frontend/src/components/modals/VivaGuideModal.tsx)**: Interactive academic defense & architecture reference modal.

### 5.5 All 8 Application Pages

1. **[LandingPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/LandingPage.tsx)**:
   * Floating Liquid Glass capsule navbar, hero headline (*"Intelligence Beyond / Static SCADA Thresholds."*), `IndustrialHeroConsole`, Tri-Memory cards, mathematical formulation overview, and industrial scope section.
2. **[LoginPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/LoginPage.tsx)**:
   * `handleSubmit`: Validates credentials and calls `api.login()`, handling `force_password_change` if required.
   * `setDemoCredentials(u, p)`: 1-click autofill for `Admin: 12406834` and `Evaluator: evaluator`.
   * Password recovery flow (`request` $\to$ `reset` via single-use token).
3. **[OverviewPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/OverviewPage.tsx)**:
   * **4 Specular KPI Cards**: Observations Processed, Known States, Unknown Candidates, Confirmed Discoveries.
   * **Anomaly Replay & Time-Travel Scrubber**: `useEffect` playback timer (`450 / replaySpeed` ms), Play/Pause/Reset buttons, `1x`/`2x`/`4x` speed selector, and timeline slider slicing `visibleSensorTrends` and `visibleContradictionTrend` via `useMemo`.
   * **What-If Threshold ($\tau$) Sensitivity Slider**: Live range (`0.15`–`0.75`, default `0.32`) updating Recharts `<ReferenceLine y={simThreshold} />` and `thresholdStats` (`CM Flagged` vs `Suppressed`).
   * **Export Report Button**: Calls `onExportReport()` to download the Markdown incident report.
4. **[DatasetsPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/DatasetsPage.tsx)**:
   * `loadPreview` (`useCallback`): Fetches paginated raw rows from `/api/datasets/preview`.
   * `handleFileUpload` & `handleDrop`: Drag-and-drop or file-picker CSV upload to `/api/datasets/upload-csv`.
   * `handleGenerateSynthetic`: Triggers `/api/datasets/generate-synthetic` (and supports hot-swapping back to MetroPT-3).
5. **[ModelLabPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/ModelLabPage.tsx)**:
   * `loadHistory`: Fetches historical training runs from `/api/models/history`.
   * `handleTrain`: Submits interactive $\alpha, \beta, \gamma$ weights, $\tau$ threshold, and selected features to `POST /api/models/train` and triggers `onTrainingComplete()`.
6. **[TriMemoryPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/TriMemoryPage.tsx)**:
   * `loadMemoryData`: Fetches live STM window, LTM prototype centroids/radii, and CM discrepancy records from `/api/memory/*`.
7. **[DiscoveriesPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/DiscoveriesPage.tsx)**:
   * `handleStatusChange(candidateId, newStatus)`: Persists `Confirmed`, `Under Validation`, or `Rejected` governance decisions.
   * `rankedAttribution` (`useMemo`): Computes `% Share of Total Drift` across `feature_deltas` to rank the top 3 root-cause sensors.
   * **Tri-Factor Contradiction Breakdown**: Visualizes `C = 0.40D + 0.35T + 0.25A` contribution bars alongside multivariate $\Delta\sigma$ shifts and centroid coordinates.
8. **[EvaluationPage.tsx](file:///d:/movie/PROJECT/frontend/src/components/pages/EvaluationPage.tsx)**:
   * `loadBenchmark` (`useCallback`): Fetches comparative metrics (TRIO vs K-Means, DBSCAN, Isolation Forest) from `/api/evaluation/benchmark`.
   * `handleExportCSV`: Downloads the benchmark comparison table as CSV.

---

## 6. Operational Datasets, Benchmarks & Cloud Topology

* **Primary Dataset**: **MetroPT-3 Railway Air Compressor** ([backend/data/MetroPT3_AirCompressor_Operational.csv](file:///d:/movie/PROJECT/backend/data/MetroPT3_AirCompressor_Operational.csv), 2,300 rows $\times$ 20 cols) capturing the July 15, 2020 severe thermal overheat ($89.05^\circ\text{C}$).
* **TRIO Benchmark Performance (MetroPT-3)**: **100.0% Precision (0.0% FDR)**, **79.7%–89.2% Recall**, **88.68%–94.27% F1-Score**, **0-timestep detection delay**, **230.7 ms inference latency**.
* **Production Proxy ([frontend/vercel.json](file:///d:/movie/PROJECT/frontend/vercel.json))**: Rewrites `/api/:match*` on Vercel (`trio-one-rho.vercel.app`) directly to Render (`trio-59r2.onrender.com/api/:match*`), eliminating browser CORS blocks.
* **Verification Suites**:
  * Backend Pytest: `cd backend && pytest tests/ -v` (**75 passing tests**)
  * Frontend Build & Vitest: `cd frontend && npm run build && npm test` (**21 passing tests**)
