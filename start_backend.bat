@echo off
title TRIO FastAPI Backend
cd /d "%~dp0backend"
echo ========================================================
echo  Starting TRIO FastAPI AI Backend on http://127.0.0.1:8000
echo ========================================================
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
