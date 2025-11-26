#!/bin/bash

# Deploy for yprods user
# This script creates user 'yprods' and deploys the application
# Usage: ./deploy-yprods.sh [domain] [email]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NEW_USER="yprods"
DOMAIN="${1:-}"
SSL_EMAIL="${2:-}"
APP_DIR="/opt/travel-app"
DEPLOY_DIR="/tmp/travel-app-deploy"

echo -e "${BLUE}🚀 Deploying for user: $NEW_USER${NC}"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ This script must be run as root to create user${NC}"
   echo -e "${YELLOW}   Run: sudo bash deploy-yprods.sh${NC}"
   exit 1
fi

# Check if user already exists
if id "$NEW_USER" &>/dev/null; then
    echo -e "${GREEN}✅ User $NEW_USER already exists${NC}"
    # Make sure user has sudo
    usermod -aG sudo $NEW_USER 2>/dev/null || true
    echo -e "${GREEN}✅ User $NEW_USER has sudo privileges${NC}"
else
    echo -e "${BLUE}👤 Creating user: $NEW_USER${NC}"
    
    # Create user with home directory
    useradd -m -s /bin/bash $NEW_USER
    
    # Add to sudo group
    usermod -aG sudo $NEW_USER
    
    # Set a secure password (user can change it later)
    # Generate random password
    RANDOM_PASS=$(openssl rand -base64 12 2>/dev/null || date +%s | sha256sum | base64 | head -c 12)
    echo "$NEW_USER:$RANDOM_PASS" | chpasswd 2>/dev/null || {
        # Fallback: set password same as username
        echo "$NEW_USER:$NEW_USER" | chpasswd 2>/dev/null || true
        RANDOM_PASS="$NEW_USER"
    }
    
    # Create .ssh directory
    mkdir -p /home/$NEW_USER/.ssh
    chmod 700 /home/$NEW_USER/.ssh
    chown -R $NEW_USER:$NEW_USER /home/$NEW_USER/.ssh
    
    echo -e "${GREEN}✅ User $NEW_USER created with sudo privileges${NC}"
    echo -e "${YELLOW}💡 Default password: $RANDOM_PASS${NC}"
    echo -e "${YELLOW}   Change it with: passwd $NEW_USER${NC}"
fi

# Get current directory
CURRENT_DIR=$(pwd)

# Copy files to deployment directory
echo -e "${BLUE}📁 Copying files to $DEPLOY_DIR...${NC}"
mkdir -p $DEPLOY_DIR
cp -r $CURRENT_DIR/* $DEPLOY_DIR/ 2>/dev/null || {
    echo -e "${RED}❌ Error copying files${NC}"
    exit 1
}
chown -R $NEW_USER:$NEW_USER $DEPLOY_DIR

echo -e "${GREEN}✅ Files copied${NC}"
echo ""
echo -e "${BLUE}🔄 Switching to user $NEW_USER and continuing deployment...${NC}"
echo ""

# Switch to new user and run deployment
sudo -u $NEW_USER bash -c "
cd $DEPLOY_DIR
chmod +x deploy-vps.sh
./deploy-vps.sh \"$DOMAIN\" \"$SSL_EMAIL\"
"

DEPLOY_EXIT=$?

echo ""
if [ $DEPLOY_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "  - User: $NEW_USER"
    echo -e "  - Application: $APP_DIR"
    if [ -n "$DOMAIN" ]; then
        echo -e "  - URL: https://$DOMAIN"
    else
        VPS_IP=$(hostname -I | awk '{print $1}')
        echo -e "  - URL: http://$VPS_IP"
    fi
    echo ""
    echo -e "${BLUE}🔧 Next steps:${NC}"
    echo -e "  1. Connect as user: ${GREEN}ssh $NEW_USER@your-vps-ip${NC}"
    echo -e "  2. Change password: ${GREEN}passwd${NC}"
    echo -e "  3. Check status: ${GREEN}pm2 status${NC}"
    echo ""
else
    echo -e "${RED}❌ Deployment had errors. Check logs above.${NC}"
    echo ""
    echo -e "${YELLOW}To troubleshoot:${NC}"
    echo -e "  ssh $NEW_USER@your-vps-ip"
    echo -e "  cd $APP_DIR"
    echo -e "  pm2 logs travel-app"
    exit $DEPLOY_EXIT
fi

