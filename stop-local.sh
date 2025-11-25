#!/bin/bash

# Stop Local Development Environment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping 3D Globe Travel App...${NC}"

# Stop Docker containers
echo -e "${YELLOW}🐳 Stopping Docker containers...${NC}"
docker-compose down || docker compose down

echo -e "${GREEN}✅ All services stopped${NC}"

