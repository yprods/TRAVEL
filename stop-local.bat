@echo off
REM Stop Local Development Environment

echo 🛑 Stopping 3D Globe Travel App...

REM Stop Docker containers
echo 🐳 Stopping Docker containers...
docker-compose down
if %ERRORLEVEL% NEQ 0 (
    docker compose down
)

echo ✅ All services stopped

