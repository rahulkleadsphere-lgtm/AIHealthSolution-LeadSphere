@echo off
title SevaSetu AI Backend Server
cd /d "%~dp0"
echo ===================================================
echo   Starting SevaSetu AI Health Platform Backend
echo ===================================================
set PYTHONIOENCODING=utf-8
call .\venv\Scripts\activate.bat
echo [OK] Virtual environment activated.
echo [OK] Launching FastAPI on http://localhost:8000 ...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
