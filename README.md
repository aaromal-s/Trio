# TRIO — Contradiction-Guided Tri-Memory AI Discovery Platform

> **Tagline:** Learn. Remember. Discover.  
> **Headline:** *"Discover What Your Data Has Never Seen Before."*  
> **Research Title:** *Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery.*

---

## 1. Project Overview & Research Problem

In critical cyber-physical systems (such as municipal water treatment plants, power grids, chemical refineries, and smart robotics), processes evolve over time into operational regimes that **have never been observed in historical training data**.

### The Core Problem
Conventional anomaly detection algorithms (such as standard distance thresholds, Isolation Forests, or static K-Means) treat **any** unfamiliar sensor reading as a momentary fault or alarm. This leads to two critical failures:
1. **Severe Alarm Fatigue:** Operators are bombarded by alarms for recurring, persistent operational transitions.
2. **Inability to Characterize Unknown States:** Traditional systems cannot distinguish between an isolated transient sensor spike and a **cohesive, sustainable unknown operational condition** (e.g., secondary pump cavitation, filter fouling, or novel load cycles).

### The TRIO Solution
TRIO is an intelligent industrial sensor analytics platform built upon a **Contradiction-Guided Tri-Memory Architecture**. It learns verified normal operating prototypes unsupervised, tracks immediate temporal momentum, isolates multi-sensor contradictions, and uses density-based clustering (DBSCAN) to discover and characterize unknown operational states.

---

## 2. Architecture & The Three Memory Systems

```
                              [ Raw Sensor Stream: FIT101, DPIT301, LIT101... ]
                                                      │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │  Short-Term Memory (STM)    │
                                       │  - Sliding Observation Win  │
                                       │  - Temporal Velocity (Δv)   │
                                       │  - Moving Average (μ)       │
                                       └──────────────┬──────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │    Contradiction Scorer     │
                                       │   C = α·D + β·T + γ·A       │
                                       └───────┬─────────────┬───────┘
                     If C < τ (Familiar)       │             │ If C ≥ τ (Contradictory)
                                ┌──────────────┘             └──────────────┐
                                ▼                                           ▼
                 ┌─────────────────────────────┐             ┌─────────────────────────────┐
                 │    Long-Term Memory (LTM)   │             │ Contradiction Memory (CM)   │
                 │    - Learned Prototypes     │             │ - Ingests Divergent Points  │
                 │    - Centroid Vectors       │             │ - Evidence Accumulation     │
                 │    - Covariance Radii       │             │ - DBSCAN Density Clustering │
                 └─────────────────────────────┘             └──────────────┬──────────────┘
                                                                            │
                                                                            ▼
                                                             ┌─────────────────────────────┐
                                                             │ Unknown Operational State   │
                                                             │ Discovery Candidates:       │
                                                             │ - Status: Pending/Confirmed │
                                                             │ - Multivariate Δ Delts      │
                                                             │ - Explainable Diagnosis     │
                                                             └─────────────────────────────┘
```

### A. Short-Term Memory (STM)
* **Purpose:** Stores the most recent observation sliding window ($N = 30$).
* **Mechanism:** Computes running moving averages, velocity vectors ($\Delta v$), and local temporal variance.
* **Role:** Calculates the **Temporal Inconsistency ($T$)** factor and filters high-frequency single-step noise.

### B. Long-Term Memory (LTM)
* **Purpose:** Stores verified known operating-state prototypes learned unsupervised from baseline historical data.
* **Mechanism:** Maintains cluster centroid coordinates ($\mu_k$), activation frequencies, and 95th-percentile dispersion radii.
* **Role:** Calculates the **Prototype Distance ($D$)** factor for any incoming observation.

### C. Contradiction Memory (CM)
* **Purpose:** The core discovery engine. Ingests and stores multi-sensor observations that conflict with known LTM prototypes ($C \ge \tau$).
* **Mechanism:** Runs DBSCAN density clustering on contradictory points across time windows to detect persistent, dense clusters.
* **Role:** Transitions candidates through: `Pending` $\rightarrow$ `Under Validation` $\rightarrow$ `Confirmed` (or `Rejected` if transient).

---

## 3. Mathematical Formulation: Contradiction Scoring

TRIO evaluates each observation using a transparent, normalized contradiction score:

$$C = \alpha \cdot D + \beta \cdot T + \gamma \cdot A$$

Where:
* **$D \in [0, 1]$ (Prototype Distance):**  
  Normalized Euclidean distance from the nearest known LTM prototype centroid:
  $$D = 1 - \exp(-\lambda \cdot \min_{k} \|x - \mu_k\|)$$
* **$T \in [0, 1]$ (Temporal Inconsistency):**  
  Deviation from the STM sliding window moving average $\bar{x}_{\text{STM}}$:
  $$T = 1 - \exp(-\eta \cdot \|x - \bar{x}_{\text{STM}}\|)$$
* **$A \in [0, 1]$ (Anomaly Score):**  
  Normalized outlier density score from an unsupervised baseline estimator:
  $$A = \frac{1}{1 + \exp(\kappa \cdot (s_{\text{raw}} + 0.4))}$$
* **Default Starting Weights:**  
  $$\alpha = 0.45, \quad \beta = 0.30, \quad \gamma = 0.25 \quad (\alpha + \beta + \gamma = 1.0)$$
* **Ingestion Threshold:**  
  $\tau = 0.48$. Observations with $C \ge \tau$ enter Contradiction Memory for candidate clustering.

---

## 4. Leakage-Free Machine Learning Pipeline

1. **Chronological Splitting:** Enforces strict temporal ordering ($70\%$ Train, $30\%$ Test). Shuffling is prohibited.
2. **Zero Information Leakage:** Feature scalers (`StandardScaler`) and LTM cluster centroids are fitted strictly on baseline training partitions.
3. **No Ground Truth in Training:** Unsupervised models never receive evaluation labels during training. Ground-truth labels are reserved exclusively for benchmark verification.

---

## 5. Industrial Dataset Information

### Primary Research Testbed: SWaT (Secure Water Treatment)
* **Origin:** iTrust, Singapore University of Technology and Design (SUTD).
* **Scope:** 6-stage operational water treatment facility (P1: Raw Inflow, P2: Chemical Dosing, P3: Ultrafiltration, P4: Dechlorination, P5: Reverse Osmosis, P6: Distribution).
* **Official Access:** [iTrust SUTD Dataset Info](https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/#swat).
* *Note: Official SWaT files require institutional authorization. Do not redistribute restricted files.*

### Synthetic High-Fidelity Testbed (Included)
* TRIO includes a built-in multi-variable synthetic generator simulating SWaT dynamics (`FIT101`, `LIT101`, `MV101`, `P101`, `DPIT301`, `FIT201`, `AIT202`, `AIT402`).
* Features realistic cyclical patterns, membrane fouling drift, transient anomalies, and a persistent unknown pump cavitation operational state.
* Clearly labeled: `"SIMULATED DEMO DATA — NOT REAL FACTORY DATA"`.

---

## 6. Algorithmic Benchmarks & Comparative Metrics

TRIO is continuously benchmarked against three baseline unsupervised methods:
1. **K-Means Clustering:** Assigns test observations by centroid distance.
2. **DBSCAN Density Clustering:** Classifies low-density points as noise ($-1$).
3. **Isolation Forest:** Tree-based anomaly detection via random partitioning depth.
4. **TRIO (Proposed):** Contradiction-guided tri-memory with density candidate clustering.

### Evaluated Metrics
* **Adjusted Rand Index (ARI):** Cluster agreement against ground-truth ($-1$ to $+1$).
* **Normalized Mutual Information (NMI):** Information-theoretic cluster alignment ($0$ to $1$).
* **Precision & Recall:** Exact detection of true novel operational states.
* **F1-Score:** Harmonic mean of precision and recall.
* **False Discovery Rate (FDR):** $\text{FDR} = \frac{\text{FP}}{\text{FP} + \text{TP}}$. Measures resistance to alarm fatigue.
* **Detection Delay:** Timesteps elapsed from true novel state onset to discovery.
* **Runtime:** Execution latency in milliseconds.

---

## 7. Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts.
* **Backend:** Python 3.13, FastAPI, Pydantic, Scikit-learn, NumPy, Pandas, Uvicorn.
* **Testing:** Pytest, HTTPX, TypeScript Compiler (`tsc -b`), Vite Production Bundler.

---

## 8. Installation & Quick Start

### Prerequisites
* Python 3.11+
* Node.js v18+ (tested on Node v24)
* npm

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend Health Check: `http://127.0.0.1:8000/api/health`
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Open Browser: `http://localhost:5173`

### 1-Click Launch (Windows)
Run `start_all.bat` from the root directory to initiate both servers concurrently.

---

## 9. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/dashboard/overview` | Aggregated KPIs, sensor trends, state distribution |
| `GET` | `/api/datasets/current` | Active dataset metadata and validation |
| `GET` | `/api/datasets/preview` | Preview observation rows |
| `POST` | `/api/datasets/generate-synthetic` | Generate new synthetic industrial dataset |
| `POST` | `/api/datasets/upload-csv` | Upload custom testbed CSV dataset |
| `GET` | `/api/models/status` | Active model version and weights |
| `POST` | `/api/models/train` | Train TRIO or baseline models with custom weights |
| `GET` | `/api/models/history` | Historical training run logs |
| `GET` | `/api/memory/status` | Real-time status of STM, LTM, and CM |
| `GET` | `/api/memory/stm` | STM sliding window buffer and velocity |
| `GET` | `/api/memory/ltm` | LTM known prototype centroid vectors |
| `GET` | `/api/memory/cm` | Contradiction Memory records and scores |
| `GET` | `/api/discoveries` | List discovered unknown operational states |
| `POST` | `/api/discoveries/{id}/status` | Update candidate status (Confirmed/Rejected/Validation) |
| `GET` | `/api/evaluation/benchmark` | Comparative benchmark metrics table |
| `GET` | `/api/evaluation/export-csv` | Download evaluation benchmark CSV |

---

## 10. Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. In Vercel, set root directory to `frontend`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Configure environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`.
5. Deploy. The included `frontend/vercel.json` ensures SPA client-side routing.

### Backend (Render / Railway / Fly.io / Docker)
* Use the included `backend/Dockerfile` or `backend/Procfile`.
* Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

## 11. Limitations & Future Roadmap

* **Observation Lag:** Candidate confirmation requires a minimum threshold of evidence ($N \ge 15$). Ultra-rapid catastrophic breakdowns under 3 timesteps require physical electrical trip relays.
* **Online LTM Assimilation:** Future versions will support automated promotion of `Confirmed` candidates into LTM prototypes during continuous operation.
* **Edge Deployment:** Optimization for deployment onto ARM-based industrial gateways and PLC microcontrollers.

