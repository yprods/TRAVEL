@echo off
REM Stop All Running Servers
REM This script stops all Node.js processes related to the app

echo ========================================
echo   Travel App - Stop All Servers
echo ========================================
echo.

REM Stop PM2 processes if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Stopping PM2 processes...
    call pm2 stop all 2>nul
    call pm2 delete all 2>nul
    echo [INFO] PM2 processes stopped
    echo.
)

REM Kill Node.js processes on ports 3000 and 5000
echo [INFO] Stopping Node.js processes on ports 3000 and 5000...

REM Find and kill processes on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [INFO] Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Find and kill processes on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo [INFO] Killing process on port 5000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [SUCCESS] All servers stopped!
echo.

pause

