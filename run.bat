@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  Starting Precision Guidance & Smart Fuze - Simulation Platform
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo =====================================================================
echo.

:: Detect root directory
if exist "frontend" (
    set "ROOT_DIR=%cd%"
) else if exist "precision-sim\frontend" (
    cd precision-sim
    set "ROOT_DIR=%cd%"
) else (
    echo [ERROR] Could not find 'frontend' or 'backend' directory.
    pause
    exit /b 1
)

:: Check for py -3.13 or python
set "PY_CMD=python"
where py >nul 2>nul
if %errorlevel% equ 0 (
    set "PY_CMD=py -3.13"
)

:: 1. Launch FastAPI Backend in a new window
echo [1/3] Launching FastAPI Backend on http://localhost:8000...
start "PrecisionSim - Backend API (Port 8000)" cmd /k "cd /d "%ROOT_DIR%\backend" && !PY_CMD! main.py"

:: Give backend 2 seconds to bind port
timeout /t 2 /nobreak >nul

:: 2. Launch Vite Frontend in a new window
echo [2/3] Launching Vite React Frontend on http://localhost:5173...
start "PrecisionSim - Frontend Web UI (Port 5173)" cmd /k "cd /d "%ROOT_DIR%\frontend" && npm run dev"

:: 3. Open Browser
echo [3/3] Opening browser at http://localhost:5173...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo =====================================================================
echo  APPLICATION IS RUNNING!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:8000
echo  - API Docs: http://localhost:8000/docs
echo.
echo  Keep both spawned terminal windows open while using the platform.
echo  Press any key to close this launcher window.
echo =====================================================================
pause
