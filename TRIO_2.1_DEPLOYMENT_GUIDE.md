# TRIO 2.1 — Production Deployment & Cloud Architecture Guide

**Project:** TRIO — Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery  
**Tagline:** Learn. Remember. Discover.  
**Release Target:** TRIO 2.1 Enterprise AI Platform  
**Author:** TRIO DevOps & Principal Engineering Team  
**Date:** November 2026  

---

## 1. Cloud Architecture Overview

The TRIO 2.1 platform is engineered as a decoupled, cloud-native microservices architecture designed for enterprise scalability, sub-millisecond rate limiting, and zero-downtime deployments:

```text
                                 ┌─────────────────────────┐
                                 │   Industrial Operator   │
                                 │   or Research Evaluator │
                                 └────────────┬────────────┘
                                              │ HTTPS
                                              ▼
                             ┌─────────────────────────────────┐
                             │    Vercel Edge Global CDN       │
                             │    (React 19 + Three.js 3D)     │
                             └────────────────┬────────────────┘
                                              │ API Requests
                                              │ (VITE_API_BASE_URL)
                                              ▼
                             ┌─────────────────────────────────┐
                             │       Render Web Service        │
                             │  (FastAPI + Python ML Service)  │
                             └───────┬─────────────────┬───────┘
                                     │                 │
                Sliding-Window Lua   │                 │ Connection Pool
                Rate Limiter         ▼                 ▼ (psycopg2 / asyncpg)
                       ┌───────────────────┐     ┌───────────────────┐
                       │   Upstash Redis   │     │ Render PostgreSQL │
                       │ (Distributed Lock)│     │  (7 ACID Tables)  │
                       └───────────────────┘     └───────────────────┘
```

---

## 2. Environment Variables Specification

### 2.1 Frontend Environment (`frontend/.env.production`)
| Variable | Description | Example / Production Value |
|:---|:---|:---|
| `VITE_API_BASE_URL` | Public HTTPS URL of the backend API service | `https://trio-backend.onrender.com/api` |
| `VITE_APP_NAME` | Branding title shown across headers | `TRIO AI Platform` |
| `VITE_ENV` | Environment identifier (`development` / `production`) | `production` |

> [!TIP]
> `frontend/src/services/api.ts` supports both `VITE_API_BASE_URL` and `VITE_API_URL` for full backward compatibility with existing Vercel project configurations.

### 2.2 Backend Environment (`backend/.env` / Cloud Secrets)
| Variable | Required | Description | Example / Recommended Value |
|:---|:---:|:---|:---|
| `IS_PRODUCTION` | Optional | Enforces strict CORS, blocks demo resets | `true` |
| `DATABASE_URL` | Recommended | Connection string for PostgreSQL database | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `REDIS_URL` | Optional | Connection string for Redis instance (rate limiting) | `rediss://default:token@host:6379` |
| `JWT_SECRET_KEY` | **Required** | High-entropy 256-bit secret for signing JWT tokens | `generate-using-openssl-rand-hex-32` |
| `CORS_ORIGINS` | **Required** | Comma-delimited list of allowed frontend origins | `https://trio-ai.vercel.app` |
| `FRONTEND_BASE_URL` | Optional | Used in password-recovery email links | `https://trio-ai.vercel.app` |
| `RESEND_API_KEY` | Optional | API Key for Resend transactional email delivery | `re_abc123...` |
| `EMAIL_FROM` | Optional | Outgoing sender identity for password reset | `TRIO Security <security@trio-ai.com>` |

---

## 3. Local Development Setup (Quickstart)

### Prerequisites
- Python 3.10+ (Recommended: Python 3.11, 3.12, or 3.13)
- Node.js 18+ and npm 9+
- Git

### 3.1 Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run development server (FastAPI with hot reload)
python -m uvicorn app.main:app --host 12406834.0.0.1 --port 8000 --reload
```
The backend API is now live at `http://12406834.0.0.1:8000` with Swagger docs at `http://12406834.0.0.1:8000/docs`.

### 3.2 Frontend Setup
```bash
# 1. Navigate to frontend directory in a new terminal
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```
The frontend is now accessible at `http://localhost:5173`.

---

## 4. Cloud Deployment (Step-by-Step)

### 4.1 Step 1: Deploy Backend to Render

1. **Connect Repository:** Log in to [Render.com](https://render.com) and create a new **Web Service** pointing to your Git repository.
2. **Apply Blueprint or Manual Settings:**
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Attach PostgreSQL Database:**
   - In Render, click **New + &rarr; PostgreSQL**.
   - Copy the **Internal Database URL** and add it as an Environment Variable named `DATABASE_URL` in your Web Service settings.
4. **Attach Redis (Optional for Distributed Rate Limiting):**
   - Click **New + &rarr; Redis** or use an [Upstash](https://upstash.com) serverless Redis instance.
   - Add the connection URI as `REDIS_URL`.
5. **Set Production Environment Variables:**
   ```text
   IS_PRODUCTION=true
   JWT_SECRET_KEY=94b8e21a4f89d34e62a110e82c5f11a8b92d6e4b9c8d1a3f5e7c0b2d4e6f8a1c
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```
6. **Deploy:** Render will automatically install packages, initialize all 7 tables in PostgreSQL, and start uvicorn. Verify via `https://your-backend.onrender.com/health`.

### 4.2 Step 2: Deploy Frontend to Vercel

1. **Connect Repository:** Log in to [Vercel](https://vercel.com) and import the repository.
2. **Configure Project Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (or `tsc -b && vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Configure Environment Variables in Vercel:**
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `VITE_APP_NAME` = `TRIO AI Platform`
   - `VITE_ENV` = `production`
4. **Deploy:** Vercel will build the React application and deploy it across its global edge network.

---

## 5. Database Schema & Migration Guide

TRIO 2.1 operates seamlessly on either SQLite (for local development) or PostgreSQL (for cloud production).

### The Seven Managed Tables:
1. `users`: Stores user ID, email, hashed password (Argon2id), full name, role, affiliation, account status, avatar, and password change flag.
2. `sessions`: Active login sessions, session tokens, IP addresses, user agents, and expiration timestamps.
3. `password_resets`: SHA-256 hashed password reset tokens, expiration timestamps, and single-use status.
4. `datasets`: Metadata for uploaded CSV files, row counts, detected column headers, and active state flags.
5. `models`: Unsupervised learning models, trained prototype centroids, hyperparameter weights ($\alpha, \beta, \gamma$), and training timestamps.
6. `discovery_candidates`: Unknown operational-state candidates clustered via DBSCAN, status lifecycle (`Pending`, `Under Validation`, `Confirmed`, `Rejected`), and feature deltas.
7. `system_logs`: Audit logs for model runs, security events, and administrative actions.

### Automated SQLite to PostgreSQL Migration:
If you have existing historical data in `trio.db` and wish to transfer it to a production PostgreSQL database:
```bash
# Run the built-in migration script
python backend/app/db/migrate_sqlite_to_pg.py --sqlite trio.db --pg "$DATABASE_URL"
```
The migration script automatically performs dry-run validation, detects schema differences, checks foreign key consistency, and reports record counts before and after insertion.

---

## 6. Pre-Flight Production Verification Checklist

Before opening the platform to end users or evaluators, verify the following:

- [x] **Backend Health Check:** `GET /health` returns `{"status": "healthy", "service": "TRIO AI Platform"}`.
- [x] **Database Tables Provisioned:** All 7 tables exist and have appropriate primary keys and foreign keys.
- [x] **Argon2id Password Hashing:** User passwords are encrypted with Argon2id; zero plaintext credentials in DB or logs.
- [x] **Rate Limiter Operable:** Distributed sliding-window rate limiter active with Redis Lua script or in-memory fallback.
- [x] **Bootstrap Admin Functional:** Log in with `12406834` / `123456`; verify forced password change dialog triggers immediately.
- [x] **Auto-Refresh Configurable:** In Settings, toggle between 2s, 5s, 10s, 30s, and Pause; verify Navbar badge and network cadence match.
- [x] **3D Digital Twin Renders:** Three.js canvas loads on Landing Page and Overview Dashboard with 60 FPS and no WebGL errors.
- [x] **Benchmark Export Works:** Navigate to Evaluation page and click "Export Benchmark CSV"; verify download of `trio_benchmark_evaluation.csv`.
- [x] **CORS Locked Down:** Requests from unauthorized origins receive `403 Forbidden` in production mode.
- [x] **Zero Temporal Leakage:** Dataset preprocessor enforces chronological splitting; training never observes test records.

