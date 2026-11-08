@echo off
echo ========================================================
echo  Starting TRIO AI Discovery Platform (Backend + Frontend)
echo ========================================================
start "TRIO FastAPI Backend" cmd /k "cd /d \"%~dp0backend\" && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 /nobreak >nul
start "TRIO React Frontend" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"
echo Both servers initiated!
echo Backend:  http://127.0.0.1:8000 (Swagger: http://127.0.0.1:8000/docs)
echo Frontend: http://localhost:5173
