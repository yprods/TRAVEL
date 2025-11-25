@echo off
REM Run All - Starts both server and client for development
REM This script starts the backend server and frontend client together

echo ========================================
echo   Travel App - Development Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] npm version:
npm --version
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
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
    echo [INFO] .env file created
    echo.
)

echo ========================================
echo   Starting Development Servers
echo ========================================
echo.
echo [INFO] Backend will run on: http://localhost:5000
echo [INFO] Frontend will run on: http://localhost:3000
echo.
echo [INFO] Press Ctrl+C to stop all servers
echo.

REM Start both server and client using npm run dev
call npm run dev

pause

