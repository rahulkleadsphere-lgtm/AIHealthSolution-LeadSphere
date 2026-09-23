@echo off
title SevaSetu AI Frontend Dev Server
cd /d "%~dp0"
echo ===================================================
echo   Starting SevaSetu AI Frontend on http://localhost:5173
echo ===================================================
call npm.cmd run dev
if %ERRORLEVEL% NEQ 0 (
    node "%ProgramFiles%\nodejs\node_modules\npm\bin\npm-cli.js" run dev
)
pause
