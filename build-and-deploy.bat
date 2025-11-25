@echo off
REM Build and Prepare for Deployment
REM This script builds the application for production deployment

echo ========================================
echo   Travel App - Build for Production
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

echo [INFO] Building frontend for production...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build completed!
echo [INFO] Production files are in the 'dist' directory
echo.
echo [INFO] To deploy to VPS:
echo   1. Upload all files to your VPS
echo   2. SSH into your VPS
echo   3. Run: chmod +x deploy-vps.sh
echo   4. Run: ./deploy-vps.sh yourdomain.com email@domain.com
echo.

pause

