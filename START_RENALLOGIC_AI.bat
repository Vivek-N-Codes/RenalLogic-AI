@echo off
setlocal enabledelayedexpansion
title RenalLogic AI - System Launcher
color 0b

echo ===============================================================================
echo                RENALLOGIC AI: EXPLAINABLE EXPERT SYSTEM
echo         Chronic Kidney Disease Risk Assessment (KDIGO 2024 Guidelines)
echo ===============================================================================
echo.

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "VENV_PYTHON=%BACKEND_DIR%\.venv\Scripts\python.exe"
set "NODE_MODULES=%FRONTEND_DIR%\node_modules"

:: 1. PREREQUISITE CHECKS
echo [1/4] Checking system prerequisites...

if not exist "%VENV_PYTHON%" (
    color 0c
    echo [ERROR] Backend virtual environment not found at:
    echo         %VENV_PYTHON%
    echo.
    echo Please initialize the backend virtual environment:
    echo   cd /d "%BACKEND_DIR%"
    echo   python -m venv .venv
    echo   .\.venv\Scripts\pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

if not exist "%NODE_MODULES%" (
    color 0c
    echo [ERROR] Frontend dependencies not found at:
    echo         %NODE_MODULES%
    echo.
    echo Please install the frontend dependencies:
    echo   cd /d "%FRONTEND_DIR%"
    echo   npm install
    echo.
    pause
    exit /b 1
)

echo        Prerequisites verified successfully.
echo.

:: 2. BACKEND LAUNCH / DETECTION
echo [2/4] Initializing FastAPI Backend (Port 8000)...
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo        [INFO] Backend is already running on port 8000. Reusing active instance.
) else (
    echo        Starting FastAPI server in a new window...
    start "RenalLogic AI - Backend (Port 8000)" cmd /k "cd /d "%BACKEND_DIR%" && title RenalLogic AI - Backend && color 0a && echo Starting Uvicorn backend on http://127.0.0.1:8000... && "%VENV_PYTHON%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
)
echo.

:: 3. FRONTEND LAUNCH / DETECTION
echo [3/4] Initializing Vite + React Frontend (Port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo        [INFO] Frontend is already running on port 5173. Reusing active instance.
) else (
    echo        Starting Vite development server in a new window...
    start "RenalLogic AI - Frontend (Port 5173)" cmd /k "cd /d "%FRONTEND_DIR%" && title RenalLogic AI - Frontend && color 09 && echo Starting Vite frontend on http://127.0.0.1:5173... && npm run dev -- --host 127.0.0.1 --port 5173"
)
echo.

:: 4. WAIT AND LAUNCH BROWSER
echo [4/4] Verifying services and opening browser...
ping 127.0.0.1 -n 4 >nul

echo        Launching browser at http://127.0.0.1:5173/ ...
start "" "http://127.0.0.1:5173/"

echo.
echo ===============================================================================
echo   APPLICATION IS READY!
echo ===============================================================================
echo   Frontend Dashboard:  http://127.0.0.1:5173/
echo   Backend API Service: http://127.0.0.1:8000/
echo   Interactive Swagger: http://127.0.0.1:8000/docs
echo.
echo   Keep the server windows open while using the application.
echo   To stop all services, run: STOP_RENALLOGIC_AI.bat
echo ===============================================================================
echo.
pause
