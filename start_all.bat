@echo off
echo ========================================================
echo  Starting TRIO AI Discovery Platform (Backend + Frontend)
echo ========================================================
set BACKEND_PORT=8000
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo [INFO] Port 8000 is occupied by another service.
    echo [INFO] Setting TRIO Backend port to 8001.
    set BACKEND_PORT=8001
)
start "TRIO FastAPI Backend" cmd /k "cd /d \"%~dp0backend\" && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"
timeout /t 2 /nobreak >nul
start "TRIO React Frontend" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"
echo Both servers initiated!
echo Backend:  http://127.0.0.1:%BACKEND_PORT% (Swagger: http://127.0.0.1:%BACKEND_PORT%/docs)
echo Frontend: http://localhost:5173
