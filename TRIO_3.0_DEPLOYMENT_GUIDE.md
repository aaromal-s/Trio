# TRIO 3.0 — COMPREHENSIVE PRODUCTION DEPLOYMENT GUIDE
**Contradiction-Guided Tri-Memory Unsupervised Learning for Unknown Operational-State Discovery**
*Deployment Guide Version:* 3.0.0  
*Target Platforms:* Render (FastAPI + PostgreSQL + Redis) & Vercel (React 19 + Three.js)

---

## 1. Overview & Prerequisites

This guide provides end-to-end instructions for deploying the complete TRIO 3.0 platform in local development and production cloud environments.

### Required Software & Accounts
- **Backend:** Python 3.11+ or 3.13
- **Frontend:** Node.js 20+ and npm 10+
- **Database (Production):** PostgreSQL 15+ (Provided via Render)
- **Cache (Production):** Redis 7+ (Provided via Render)
- **Cloud Accounts:** Render (https://render.com) and Vercel (https://vercel.com)

---

## 2. Local Multi-Process Startup

### 2.1 Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install pinned dependencies
pip install -r requirements.txt

# Launch FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is accessible at `http://127.0.0.1:8000/docs` (Swagger UI) and `http://127.0.0.1:8000/api/health`.

### 2.2 Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server
npm run dev
```
The frontend application is accessible at `http://localhost:5173`.

### 2.3 One-Click Multi-Process Launchers (Windows)
- Run `.\start_backend.bat` to launch the API server.
- Run `.\start_frontend.bat` to launch the Vite dev server.
- Run `.\start_all.bat` to launch both concurrently.

---

## 3. Production Cloud Deployment (Render + Vercel)

### 3.1 Deploying Backend Infrastructure via Render Blueprints
The repository includes a production-ready `render.yaml` blueprint defining all required services:
1. Log in to your **Render Dashboard** (https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository containing the TRIO codebase.
4. Render will parse `render.yaml` and provision:
   - **`trio-backend`:** FastAPI Web Service (Python runtime, rootDir: `backend`)
   - **`trio-db`:** Managed PostgreSQL Database (`trio_db`)
   - **`trio-redis`:** Managed Redis Instance (LRU eviction policy)
5. Set the required secret environment variable in the dashboard:
   - `RESEND_API_KEY`: Your Resend API token (for transactional password reset emails).
6. Click **Apply**. Render will automatically provision the database, seed default schemas on startup, and attach Redis.

### 3.2 Deploying Frontend Edge Application via Vercel
1. Log in to your **Vercel Dashboard** (https://vercel.com).
2. Click **Add New...** $\to$ **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (`tsc -b && vite build`)
   - **Output Directory:** `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: `https://trio-backend.onrender.com/api` (Replace with your actual Render backend URL)
6. Click **Deploy**. Vercel will build the SPA, apply security headers and rewrites from `vercel.json`, and assign a global CDN domain (e.g. `https://trio-ai.vercel.app`).

---

## 4. SQLite to PostgreSQL Data Migration Utility

If you have existing datasets and accounts in a local SQLite file (`trio.db`) that you wish to transfer to your production PostgreSQL database:
```bash
# Run migration script
python -c "
from app.core.database import migrate_sqlite_to_postgres
report = migrate_sqlite_to_postgres('trio.db', 'postgres://trio_user:password@host/trio_db')
print('Migration Report:', report)
"
```
The migration utility automatically:
- Checks all 7 relational tables.
- Preserves primary keys and foreign key relationships.
- Detects and reports conflicting user IDs and emails.
- Verifies row counts before and after migration.

---

## 5. Post-Deployment Verification Checklist

1. **Verify Health Probes:**
   - Probe `https://<your-render-url>/api/health` and verify `"status": "healthy"`, `"database": "PostgreSQL"`, and `"rate_limiter": "Redis"`.
2. **Verify Frontend Loading:**
   - Navigate to `https://<your-vercel-domain>/` and confirm the 3D digital twin renders smoothly at 60 FPS.
3. **Verify Bootstrap Authentication:**
   - Sign in with User ID `12406834` and verify that the platform forces a secure password rotation on initial login.
4. **Verify Telemetry Stream:**
   - Confirm that the Overview dashboard updates live telemetry and the auto-refresh cadence responds to 2s, 5s, 10s, 30s, and Pause.

