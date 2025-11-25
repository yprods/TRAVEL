@echo off
REM Start Frontend Client Only
REM This script starts only the frontend development server

echo ========================================
echo   Travel App - Frontend Client
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [INFO] Starting frontend on http://localhost:3000
echo [INFO] Press Ctrl+C to stop
echo.

call npm run dev:client

pause

