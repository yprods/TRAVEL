@echo off
REM Complete Deployment Script for Windows
REM This script uploads files and deploys to VPS
REM Usage: deploy-all.bat [vps-ip] [domain] [email]

echo ========================================
echo   Complete Deployment Script
echo   Does Everything Automatically
echo ========================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Get VPS IP
set /p VPS_IP="Enter your VPS IP address: "
if "%VPS_IP%"=="" (
    echo [ERROR] VPS IP is required!
    pause
    exit /b 1
)

REM Get domain (optional)
set /p DOMAIN="Enter your domain (or press Enter to skip SSL): "

REM Get email if domain provided
set SSL_EMAIL=
if not "%DOMAIN%"=="" (
    set /p SSL_EMAIL="Enter email for SSL certificate: "
)

echo.
echo [INFO] Configuration:
echo   VPS IP: %VPS_IP%
echo   Domain: %DOMAIN%
if not "%SSL_EMAIL%"=="" (
    echo   Email: %SSL_EMAIL%
)
echo.

REM Check if scp is available
where scp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SCP is not available!
    echo.
    echo Please install OpenSSH:
    echo   1. Open Windows Settings
    echo   2. Go to Apps ^> Optional Features
    echo   3. Add OpenSSH Client
    echo.
    echo Or use WinSCP to upload files manually.
    pause
    exit /b 1
)

echo [INFO] Step 1: Uploading files to VPS...
echo This may take a few minutes...
echo.

REM Upload files
scp -r . root@%VPS_IP%:/tmp/travel-app

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Upload failed!
    echo.
    echo Possible reasons:
    echo   - Wrong IP address
    echo   - SSH connection failed
    echo   - Permission denied
    echo.
    echo Try connecting manually: ssh root@%VPS_IP%
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Files uploaded!
echo.
echo [INFO] Step 2: Deploying on VPS...
echo.

REM Run deployment on VPS
if "%DOMAIN%"=="" (
    ssh root@%VPS_IP% "cd /tmp/travel-app && chmod +x deploy-yprods.sh && ./deploy-yprods.sh"
) else (
    if "%SSL_EMAIL%"=="" (
        ssh root@%VPS_IP% "cd /tmp/travel-app && chmod +x deploy-yprods.sh && ./deploy-yprods.sh %DOMAIN%"
    ) else (
        ssh root@%VPS_IP% "cd /tmp/travel-app && chmod +x deploy-yprods.sh && ./deploy-yprods.sh %DOMAIN% %SSL_EMAIL%"
    )
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Deployment Completed Successfully!
    echo ========================================
    echo.
    echo [INFO] Next steps:
    echo   1. Connect: ssh yprods@%VPS_IP%
    echo   2. Change password: passwd
    echo   3. Check status: pm2 status
    echo.
) else (
    echo.
    echo [ERROR] Deployment had errors!
    echo.
    echo To troubleshoot:
    echo   ssh yprods@%VPS_IP%
    echo   cd /opt/travel-app
    echo   pm2 logs travel-app
    echo.
)

pause

