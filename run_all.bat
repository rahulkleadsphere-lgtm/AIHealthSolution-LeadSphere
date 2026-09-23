@echo off
title SevaSetu AI Platform - Full Stack Launcher
echo =====================================================================
echo          Launching SevaSetu AI Platform (Backend + Frontend)
echo =====================================================================

echo [1/2] Starting Backend Server (FastAPI with venv)...
start "SevaSetu AI - Backend API" cmd /k "cd /d %~dp0backend && set PYTHONIOENCODING=utf-8 && call .\venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting Frontend App (React/Vite)...
start "SevaSetu AI - Frontend UI" cmd /k "cd /d %~dp0AI-Health-Chatbot-n8n-main && call npm.cmd run dev"

echo.
echo =====================================================================
echo  SevaSetu AI is starting up!
echo   - Backend API:  http://localhost:8000  (Docs: http://localhost:8000/docs)
echo   - Frontend UI:  http://localhost:5173
echo =====================================================================
echo You can keep this window or close it; the two service windows will remain running.
pause
