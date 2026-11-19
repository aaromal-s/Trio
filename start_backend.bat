@echo off
title TRIO FastAPI Backend
cd /d "%~dp0backend"
echo ========================================================
echo  Starting TRIO FastAPI AI Backend
echo ========================================================
set PORT=8000
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo [INFO] Port 8000 is in use by another process.
    echo [INFO] Automatically binding TRIO Backend to port 8001.
    set PORT=8001
)
echo Backend running on http://127.0.0.1:%PORT% (Docs: http://127.0.0.1:%PORT%/docs)
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port %PORT% --reload
