@echo off
REM Start Backend Server Only
REM This script starts only the backend server

echo ========================================
echo   Travel App - Backend Server
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

REM Create uploads directory if it doesn't exist
if not exist server\uploads mkdir server\uploads

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo HOST=localhost
        echo DB_PATH=./server/database.sqlite
        echo UPLOADS_DIR=./server/uploads
    ) > .env
)

echo [INFO] Starting backend server on http://localhost:5000
echo [INFO] Press Ctrl+C to stop
echo.

call npm run dev:server

pause

