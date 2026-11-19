# TRIO 2.2 — Production Cloud Deployment & System Architecture Guide

**Project:** TRIO — Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery  
**Tagline:** Learn. Remember. Discover.  
**Release Target:** TRIO 2.2 Enterprise AI Platform  
**Author:** Principal DevOps & Infrastructure Engineering Team  
**Date:** November 2026  

---

## 1. Cloud Architecture Overview

The TRIO 2.2 platform is designed as an enterprise-grade, cloud-native system separating high-performance client rendering from asynchronous machine-learning inference and persistent ACID storage:

```text
                                 ┌─────────────────────────┐
                                 │   Industrial Operator   │
                                 │   or Research Evaluator │
                                 └────────────┬────────────┘
                                              │ HTTPS
                                              ▼
                             ┌─────────────────────────────────┐
                             │       Vercel Global Edge        │
                             │  (React 19 + Three.js 3D Twin)  │
                             └────────────────┬────────────────┘
                                              │ API Requests
                                              │ (VITE_API_BASE_URL)
                                              ▼
                             ┌─────────────────────────────────┐
                             │       Render Web Service        │
                             │   (FastAPI + Python 3.13 ML)    │
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
| Variable | Required | Description | Example / Recommended Value |
|:---|:---:|:---|:---|
| `VITE_API_BASE_URL` | **Yes** | Public HTTPS URL of the backend API service | `https://trio-backend.onrender.com/api` |
| `VITE_APP_NAME` | No | Platform branding title across headers | `TRIO AI Platform` |
| `VITE_ENV` | No | Runtime environment (`production` / `development`) | `production` |

> [!NOTE]
> `frontend/src/services/api.ts` checks both `VITE_API_BASE_URL` and `VITE_API_URL` to guarantee seamless compatibility with existing Vercel deployment variables.

### 2.2 Backend Environment (`backend/.env` / Cloud Secrets)
| Variable | Required | Description | Example / Recommended Value |
|:---|:---:|:---|:---|
| `IS_PRODUCTION` | Recommended | Activates strict CORS, disables demo account reset | `true` |
| `DATABASE_URL` | Recommended | Connection string for PostgreSQL database | `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `REDIS_URL` | Optional | Connection string for Redis instance (rate limiting) | `rediss://default:token@host:6379` |
| `JWT_SECRET_KEY` | **Required** | High-entropy 256-bit secret for signing JWT tokens | `generate-using-openssl-rand-hex-32` |
| `CORS_ORIGINS` | **Required** | Comma-delimited list of allowed frontend origins | `https://trio-ai.vercel.app` |
| `FRONTEND_BASE_URL` | Optional | Used in password recovery email links | `https://trio-ai.vercel.app` |
| `RESEND_API_KEY` | Optional | API key for Resend transactional email delivery | `re_abc123...` |
| `EMAIL_FROM` | Optional | Outgoing sender identity for password reset | `TRIO Security <security@trio-ai.com>` |

---

## 3. Local Development Quickstart

### Prerequisites
- Python 3.10+ (Recommended: Python 3.11, 3.12, or 3.13)
- Node.js 18+ and npm 9+

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

# 5. Launch FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs available at `http://127.0.0.1:8000/docs`.

### 3.2 Frontend Setup
```bash
# 1. Navigate to frontend directory in another terminal
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite dev server
npm run dev
```
Client dashboard available at `http://localhost:5173`.

---

## 4. Cloud Deployment (Step-by-Step)

### 4.1 Step 1: Deploy Backend on Render

1. Log in to [Render.com](https://render.com) and click **New + &rarr; Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Attach **Render PostgreSQL**:
   - Click **New + &rarr; PostgreSQL**.
   - Copy the **Internal Database URL** and add it as `DATABASE_URL` in your Web Service environment variables.
5. Attach **Redis (Optional)**:
   - Use an [Upstash](https://upstash.com) serverless Redis database or Render Redis. Add URI as `REDIS_URL`.
6. Add Secrets:
   ```text
   IS_PRODUCTION=true
   JWT_SECRET_KEY=your_generated_256_bit_secret
   CORS_ORIGINS=https://your-frontend-domain.vercel.app
   ```
7. Click **Create Web Service**. Verify health via `https://your-backend.onrender.com/health`.

### 4.2 Step 2: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com) and import the repository.
2. Configure project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `VITE_APP_NAME` = `TRIO AI Platform`
   - `VITE_ENV` = `production`
4. Click **Deploy**. Vercel will build and distribute the app across its global CDN.

---

## 5. Database Schema & Migration

TRIO 2.2 manages seven structured tables:
1. `users`: Identity, Argon2id hashed passwords, affiliation, forced password change flag.
2. `sessions`: Active login tokens, expiration dates, IP addresses.
3. `password_resets`: SHA-256 hashed ephemeral password reset tokens.
4. `datasets`: Metadata for uploaded CSV datasets, row counts, detected columns.
5. `models`: Trained unsupervised models, prototype centroid vectors, hyperparameters.
6. `discovery_candidates`: Unknown state candidates clustered via DBSCAN, lifecycle status (`Pending`, `Under Validation`, `Confirmed`, `Rejected`).
7. `system_logs`: Audit log for administrative and security actions.

### SQLite to PostgreSQL Migration
To migrate historical data from local `trio.db` to production PostgreSQL:
```bash
python backend/app/db/migrate_sqlite_to_pg.py --sqlite trio.db --pg "$DATABASE_URL"
```

---

## 6. Pre-Flight Production Verification Checklist

- [x] **Backend Health:** `GET /health` returns `200 OK` with service name.
- [x] **PostgreSQL Tables:** All 7 tables initialized with primary and foreign keys.
- [x] **Argon2id Hashing:** Verified; zero plaintext passwords in database or logs.
- [x] **Rate Limiting:** Atomic Redis Lua sliding-window rate limiter active with in-memory fallback.
- [x] **Bootstrap Admin Flow:** `12406834` / `123456` login prompts immediate forced password change.
- [x] **CSV Upload & Transposition:** 6-row files display user-friendly diagnostics; sensor-oriented matrices are inverted automatically.
- [x] **3D Digital Twin:** 60 FPS WebGL rendering with complete context disposal on unmount.
- [x] **Telemetry Polling:** Polling intervals (2s, 5s, 10s, 30s, Pause) reschedule immediately without overlapping requests.
- [x] **CORS Lockdown:** Unauthorized origins rejected in production mode.
- [x] **Benchmark Export:** Direct RFC-4180 CSV export downloadable from Evaluation page.

