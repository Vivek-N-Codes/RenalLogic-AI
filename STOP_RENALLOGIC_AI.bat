@echo off
setlocal enabledelayedexpansion
title RenalLogic AI - Service Terminator
color 0e

echo ===============================================================================
echo                RENALLOGIC AI: STOPPING ACTIVE SERVICES
echo ===============================================================================
echo.

set "FOUND=0"

:: 1. Terminate process on Port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    if not "!PID!"=="0" (
        echo [INFO] Stopping Backend service (PID: !PID! on port 8000)...
        taskkill /F /PID !PID! >nul 2>&1
        set "FOUND=1"
    )
)

:: 2. Terminate process on Port 5173 (Frontend)
for /f "tokens=5" %%b in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    set "PID=%%b"
    if not "!PID!"=="0" (
        echo [INFO] Stopping Frontend service (PID: !PID! on port 5173)...
        taskkill /F /PID !PID! >nul 2>&1
        set "FOUND=1"
    )
)

:: 3. Close launcher command windows if still open
taskkill /F /FI "WINDOWTITLE eq RenalLogic AI - Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq RenalLogic AI - Frontend*" >nul 2>&1

echo.
if "!FOUND!"=="1" (
    echo [SUCCESS] RenalLogic AI backend and frontend services have been stopped.
) else (
    echo [INFO] No active RenalLogic AI services were found listening on ports 8000 or 5173.
)

echo.
pause
