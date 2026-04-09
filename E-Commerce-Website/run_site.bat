@echo off
setlocal enabledelayedexpansion
title ShopSphere Manager

echo ==========================================
echo    ShopSphere - Secure Launch System (v2)
echo ==========================================

:: 1. Cleanup Existing Processes
echo [*] Step 1: Cleaning up ports 8000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a /t >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a /t >nul 2>&1
echo [OK] Ports cleared.

:: 2. Robust Node.js Detection
echo [*] Step 2: Locating Node.js...
set "NODE_PATH="
where node >nul 2>&1
if !errorlevel! equ 0 (
    set "NODE_PATH=node"
    echo [OK] Node.js found in system PATH.
) else (
    set "PATHS_TO_CHECK="C:\Program Files\nodejs\node.exe" "C:\Program Files (x86)\nodejs\node.exe" "%AppData%\npm\node.exe""
    for %%P in (!PATHS_TO_CHECK!) do (
        if exist %%P (
            set "NODE_PATH=%%P"
            for %%D in (%%~dpP.) do set "PATH=%%~fD;!PATH!"
        )
    )
)

if "!NODE_PATH!"=="" (
    echo [ERROR] Node.js not found! Please install it from https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Start Backend
echo [*] Step 3: Launching Backend (FastAPI)...
if not exist "backend\venv" (
    echo [ERROR] Backend virtual environment (venv) not found!
    pause
) else (
    :: Use 127.0.0.1 to be explicit and avoid IPv6/IPv4 resolution issues
    start "ShopSphere Backend" cmd /k "echo Starting Backend... && cd backend && call venv\Scripts\activate && python -m uvicorn main:app --host 127.0.0.1 --port 8000 || pause"
)

:: 4. Start Frontend
echo [*] Step 4: Launching Frontend (Vite)...
if not exist "frontend\node_modules" (
    echo [*] node_modules not found. Attempting to install...
    cd frontend && npm install && cd ..
)
:: Use 127.0.0.1 and ensure we are in the right directory
start "ShopSphere Frontend" cmd /k "echo Starting Frontend... && cd frontend && npm run dev || pause"

:: 5. Intelligent Wait for Services
echo [*] Step 5: Waiting for services to be ready...
echo [!] This may take up to 30 seconds on the first run.

:WAIT_BACKEND
netstat -ano | findstr :8000 | findstr LISTENING >nul
if !errorlevel! neq 0 (
    echo [.] Waiting for Backend (127.0.0.1:8000)...
    timeout /t 2 /nobreak >nul
    goto WAIT_BACKEND
)
echo [OK] Backend is UP.

:WAIT_FRONTEND
netstat -ano | findstr :3000 | findstr LISTENING >nul
if !errorlevel! neq 0 (
    echo [.] Waiting for Frontend (3000)...
    timeout /t 2 /nobreak >nul
    goto WAIT_FRONTEND
)
echo [OK] Frontend is UP.

echo ==========================================
echo    ALL SERVICES READY! 
echo    Opening ShopSphere Website...
echo ==========================================
timeout /t 2 /nobreak >nul
start http://localhost:3000

pause
