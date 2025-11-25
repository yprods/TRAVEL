@echo off
REM Setup Development Environment
REM This script sets up the development environment from scratch

echo ========================================
echo   Travel App - Development Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 20.x or higher
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [INFO] npm version:
npm --version
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
echo This may take a few minutes...
echo.
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [INFO] Dependencies installed successfully!
echo.

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist server\uploads mkdir server\uploads
if not exist logs mkdir logs
echo [INFO] Directories created
echo.

REM Create .env file
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
) else (
    echo [INFO] .env file already exists
    echo.
)

REM Create icons if they don't exist
if not exist public\icon-192.png (
    echo [INFO] Creating placeholder icons...
    call node create-icons-simple.js
    echo [INFO] Icons created
    echo.
)

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo [INFO] You can now:
echo   1. Run 'run-all.bat' to start both server and client
echo   2. Run 'start-server.bat' to start only the backend
echo   3. Run 'start-client.bat' to start only the frontend
echo.
echo [INFO] Backend will be at: http://localhost:5000
echo [INFO] Frontend will be at: http://localhost:3000
echo.

pause

