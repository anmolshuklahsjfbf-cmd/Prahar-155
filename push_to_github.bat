@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo  Pushing Precision Guidance Platform to GitHub:
echo  Repository: https://github.com/devanshsingh6871-ops/Prahar-155
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Ensure remote is correct
echo [1/3] Setting remote origin...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/devanshsingh6871-ops/Prahar-155.git
git branch -M main

:: 2. Stage and commit any latest changes
echo [2/3] Checking committed files...
git add .
git commit -m "feat: Precision Guidance & Smart Fuze Simulation Platform for SIH" >nul 2>nul

:: 3. Push to GitHub
echo [3/3] Uploading to GitHub...
echo (If a browser popup opens, click "Sign in with your browser" to authorize devanshsingh6871-ops)
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =====================================================================
    echo  SUCCESSFULLY PUSHED TO GITHUB!
    echo  View your repository at:
    echo  https://github.com/devanshsingh6871-ops/Prahar-155
    echo =====================================================================
) else (
    echo.
    echo [NOTICE] If you need to force-overwrite an empty initial README on GitHub, run:
    echo git push -u origin main --force
)

echo.
pause
