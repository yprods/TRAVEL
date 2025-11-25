@echo off
REM Local Development Script for Windows
REM This script starts Docker containers and the application

echo 🚀 Starting 3D Globe Travel App - Local Development
echo ==============================================

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo HOST=localhost
        echo DB_TYPE=mysql
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=travel_user
        echo DB_PASSWORD=travel_password
        echo DB_NAME=travel_app
        echo UPLOADS_DIR=./server/uploads
    ) > .env
    echo ✅ .env file created
)

REM Create uploads directory
if not exist server\uploads mkdir server\uploads

REM Start Docker containers
echo 🐳 Starting Docker containers (MySQL + phpMyAdmin)...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    docker compose up -d
)

REM Wait for MySQL to be ready
echo ⏳ Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

REM Install npm dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing npm dependencies...
    call npm install
)

REM Start the application
echo 🚀 Starting application...
echo.
echo ✅ Everything is running!
echo.
echo 📋 Services:
echo   - Backend API: http://localhost:5000
echo   - Frontend: http://localhost:5173 (Vite dev server)
echo   - phpMyAdmin: http://localhost:8080
echo   - MySQL: localhost:3306
echo.
echo 🔑 MySQL Credentials:
echo   - User: travel_user
echo   - Password: travel_password
echo   - Database: travel_app
echo   - Root Password: rootpassword
echo.
echo 🛑 To stop everything, press Ctrl+C or run: stop-local.bat
echo.

REM Start both server and client in development mode
call npm run dev

