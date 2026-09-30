@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  Precision Guidance & Smart Fuze - Simulation Platform Setup
echo  Academic / SIH Engineering Competition Platform
echo =====================================================================
echo.

:: Check current directory for frontend/backend or precision-sim
if exist "frontend" (
    set "ROOT_DIR=%cd%"
) else if exist "precision-sim\frontend" (
    cd precision-sim
    set "ROOT_DIR=%cd%"
) else (
    echo [ERROR] Neither 'frontend' nor 'precision-sim\frontend' was found!
    pause
    exit /b 1
)

echo [1/2] Setting up Python Backend Dependencies...
where py >nul 2>nul
if %errorlevel% equ 0 (
    echo Using Python Launcher (py -3.13)...
    py -3.13 -m pip install -r "%ROOT_DIR%\backend\requirements.txt"
) else (
    echo Using system python...
    python -m pip install -r "%ROOT_DIR%\backend\requirements.txt"
)

if %errorlevel% neq 0 (
    echo [WARNING] Pip install had issues. Attempting direct fallback install...
    python -m pip install fastapi uvicorn numpy scipy pydantic
)

echo.
echo [2/2] Setting up Node.js Frontend Dependencies...
cd "%ROOT_DIR%\frontend"
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] npm install encountered an issue!
    pause
    exit /b 1
)

cd "%ROOT_DIR%"
echo.
echo =====================================================================
echo  SETUP COMPLETED SUCCESSFULLY!
echo  To start the application, run: run.bat
echo =====================================================================
echo.
pause
