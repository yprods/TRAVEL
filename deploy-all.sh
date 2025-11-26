#!/bin/bash

# Complete Deployment Script - Does Everything
# This script uploads files, creates user, and deploys the application
# Usage: ./deploy-all.sh [vps-ip] [domain] [email]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_IP="${1:-}"
DOMAIN="${2:-}"
SSL_EMAIL="${3:-}"
NEW_USER="yprods"
APP_DIR="/opt/travel-app"
DEPLOY_DIR="/tmp/travel-app-deploy"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Complete Deployment Script          ║${NC}"
echo -e "${BLUE}║   Does Everything Automatically       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if VPS IP is provided
if [ -z "$VPS_IP" ]; then
    echo -e "${RED}❌ VPS IP address is required!${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}./deploy-all.sh VPS-IP [domain] [email]${NC}"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}./deploy-all.sh 192.168.1.100${NC}"
    echo -e "  ${GREEN}./deploy-all.sh 192.168.1.100 mydomain.com admin@mydomain.com${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  VPS IP: ${GREEN}$VPS_IP${NC}"
echo -e "  User: ${GREEN}$NEW_USER${NC}"
if [ -n "$DOMAIN" ]; then
    echo -e "  Domain: ${GREEN}$DOMAIN${NC}"
    echo -e "  SSL Email: ${GREEN}$SSL_EMAIL${NC}"
else
    echo -e "  Domain: ${YELLOW}None (HTTP only)${NC}"
fi
echo ""

# Step 1: Check if we're on local machine or VPS
if [ -f "package.json" ] && [ -f "deploy-vps.sh" ]; then
    # We're on local machine - need to upload
    echo -e "${BLUE}📤 Step 1: Uploading files to VPS...${NC}"
    
    # Check if scp is available
    if ! command -v scp &> /dev/null; then
        echo -e "${RED}❌ SCP not found. Please install OpenSSH or use WinSCP${NC}"
        echo -e "${YELLOW}   Windows: Install OpenSSH from Settings > Apps > Optional Features${NC}"
        exit 1
    fi
    
    # Upload files
    echo -e "${BLUE}   Uploading to root@$VPS_IP:/tmp/travel-app...${NC}"
    scp -r . root@$VPS_IP:/tmp/travel-app 2>&1 | while read line; do
        echo -e "${BLUE}   $line${NC}"
    done
    
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        echo -e "${RED}❌ Upload failed!${NC}"
        echo -e "${YELLOW}   Check:${NC}"
        echo -e "     - VPS IP is correct"
        echo -e "     - SSH is enabled on VPS"
        echo -e "     - You can connect: ssh root@$VPS_IP"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Files uploaded${NC}"
    echo ""
    
    # Step 2: Connect and run deployment
    echo -e "${BLUE}🚀 Step 2: Connecting to VPS and deploying...${NC}"
    echo ""
    
    # Run deployment script on VPS
    ssh root@$VPS_IP bash << DEPLOY_SCRIPT
set -e
cd /tmp/travel-app
chmod +x deploy-yprods.sh
./deploy-yprods.sh "$DOMAIN" "$SSL_EMAIL"
DEPLOY_SCRIPT
    
    DEPLOY_EXIT=$?
    
    if [ $DEPLOY_EXIT -eq 0 ]; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║   ✅ Deployment Completed Successfully! ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}📋 Summary:${NC}"
        echo -e "  User: ${GREEN}$NEW_USER${NC}"
        echo -e "  Application: ${GREEN}$APP_DIR${NC}"
        if [ -n "$DOMAIN" ]; then
            echo -e "  URL: ${GREEN}https://$DOMAIN${NC}"
        else
            echo -e "  URL: ${GREEN}http://$VPS_IP${NC}"
        fi
        echo ""
        echo -e "${BLUE}🔧 Next Steps:${NC}"
        echo -e "  1. Connect: ${GREEN}ssh $NEW_USER@$VPS_IP${NC}"
        echo -e "  2. Change password: ${GREEN}passwd${NC}"
        echo -e "  3. Check status: ${GREEN}pm2 status${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Deployment had errors${NC}"
        echo -e "${YELLOW}   Connect to VPS and check logs:${NC}"
        echo -e "     ssh $NEW_USER@$VPS_IP"
        echo -e "     cd $APP_DIR"
        echo -e "     pm2 logs travel-app"
        exit $DEPLOY_EXIT
    fi
    
else
    # We're already on VPS - just run deployment
    echo -e "${BLUE}🚀 Running deployment on VPS...${NC}"
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Must run as root on VPS${NC}"
        echo -e "${YELLOW}   Run: sudo bash deploy-all.sh${NC}"
        exit 1
    fi
    
    # Check if deploy-yprods.sh exists
    if [ ! -f "deploy-yprods.sh" ]; then
        echo -e "${RED}❌ deploy-yprods.sh not found${NC}"
        echo -e "${YELLOW}   Make sure you're in the project directory${NC}"
        exit 1
    fi
    
    chmod +x deploy-yprods.sh
    ./deploy-yprods.sh "$DOMAIN" "$SSL_EMAIL"
fi

