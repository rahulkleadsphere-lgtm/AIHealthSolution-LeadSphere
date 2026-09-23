# SevaSetu AI Backend Launcher
Set-Location $PSScriptRoot
$env:PYTHONIOENCODING = "utf-8"
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting SevaSetu AI Health Platform Backend" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Connected to Supabase PostgreSQL & Qdrant Cloud Cluster" -ForegroundColor Yellow
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
