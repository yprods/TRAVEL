@echo off
REM Upload Travel App to VPS
REM This script uploads all files to your VPS

echo ========================================
echo   Upload Travel App to VPS
echo ========================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [INFO] Current directory: %CD%
echo.

REM Get VPS IP
set /p VPS_IP="Enter your VPS IP address: "
if "%VPS_IP%"=="" (
    echo [ERROR] VPS IP is required!
    pause
    exit /b 1
)

echo.
echo [INFO] Uploading files to root@%VPS_IP%:/root/travel-app
echo [INFO] This may take a few minutes...
echo.

REM Check if scp is available
where scp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SCP is not available!
    echo.
    echo Please use one of these alternatives:
    echo   1. Install OpenSSH for Windows
    echo   2. Use WinSCP (https://winscp.net/)
    echo   3. Use FileZilla
    echo   4. Use Git to clone on VPS
    echo.
    pause
    exit /b 1
)

REM Upload files
scp -r . root@%VPS_IP%:/root/travel-app

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Files uploaded successfully!
    echo.
    echo [INFO] Next steps:
    echo   1. SSH to your VPS: ssh root@%VPS_IP%
    echo   2. Navigate: cd /root/travel-app
    echo   3. Run: chmod +x deploy-vps-auto.sh
    echo   4. Run: ./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com
    echo.
) else (
    echo.
    echo [ERROR] Upload failed!
    echo.
    echo Possible reasons:
    echo   - Wrong IP address
    echo   - SSH connection failed
    echo   - Permission denied
    echo.
    echo Try:
    echo   1. Check your VPS IP address
    echo   2. Make sure SSH is enabled on VPS
    echo   3. Try connecting manually: ssh root@%VPS_IP%
    echo.
)

pause

