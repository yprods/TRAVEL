#!/bin/bash

# Local Development Script - Run everything together
# This script starts Docker containers and the application

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting 3D Globe Travel App - Local Development${NC}"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
NODE_ENV=development
PORT=5000
HOST=localhost
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=travel_user
DB_PASSWORD=travel_password
DB_NAME=travel_app
UPLOADS_DIR=./server/uploads
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
fi

# Create uploads directory
mkdir -p server/uploads

# Start Docker containers
echo -e "${YELLOW}🐳 Starting Docker containers (MySQL + phpMyAdmin)...${NC}"
docker-compose up -d || docker compose up -d

# Wait for MySQL to be ready
echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
timeout=60
counter=0
while ! docker exec travel-app-mysql mysqladmin ping -h localhost -u root -prootpassword --silent 2>/dev/null; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo -e "${RED}❌ MySQL failed to start within $timeout seconds${NC}"
        exit 1
    fi
    echo -n "."
done
echo ""
echo -e "${GREEN}✅ MySQL is ready!${NC}"

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
    npm install
fi

# Start the application
echo -e "${YELLOW}🚀 Starting application...${NC}"
echo ""
echo -e "${GREEN}✅ Everything is running!${NC}"
echo ""
echo "📋 Services:"
echo "  - Backend API: http://localhost:5000"
echo "  - Frontend: http://localhost:5173 (Vite dev server)"
echo "  - phpMyAdmin: http://localhost:8080"
echo "  - MySQL: localhost:3306"
echo ""
echo "🔑 MySQL Credentials:"
echo "  - User: travel_user"
echo "  - Password: travel_password"
echo "  - Database: travel_app"
echo "  - Root Password: rootpassword"
echo ""
echo "🛑 To stop everything, press Ctrl+C or run: ./stop-local.sh"
echo ""

# Start both server and client in development mode
npm run dev

