#!/bin/bash

# Auto VPS Deployment Script with User Creation
# This script can run as root and will create a user automatically
# Usage: ./deploy-vps-auto.sh [username] [domain-name] [email-for-ssl]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NEW_USER="${1:-travelapp}"
DOMAIN="${2:-}"
SSL_EMAIL="${3:-}"
APP_DIR="/opt/travel-app"
APP_NAME="travel-app"

echo -e "${BLUE}🚀 Auto VPS Deployment Script${NC}"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}⚠️  Running as root. Will create user '$NEW_USER' and switch to it.${NC}"
   echo ""
   
   # Check if user already exists
   if id "$NEW_USER" &>/dev/null; then
       echo -e "${GREEN}✅ User $NEW_USER already exists${NC}"
       # Make sure user has sudo
       usermod -aG sudo $NEW_USER 2>/dev/null || true
   else
       echo -e "${BLUE}👤 Creating user: $NEW_USER${NC}"
       
       # Create user with home directory
       useradd -m -s /bin/bash $NEW_USER
       
       # Add to sudo group
       usermod -aG sudo $NEW_USER
       
       # Set password (optional - user can change it later)
       echo "$NEW_USER:$NEW_USER" | chpasswd 2>/dev/null || true
       
       # Create .ssh directory
       mkdir -p /home/$NEW_USER/.ssh
       chmod 700 /home/$NEW_USER/.ssh
       chown -R $NEW_USER:$NEW_USER /home/$NEW_USER/.ssh
       
       echo -e "${GREEN}✅ User $NEW_USER created with sudo privileges${NC}"
       echo -e "${YELLOW}💡 Default password is same as username. Change it with: passwd $NEW_USER${NC}"
   fi
   
   # Get current directory
   CURRENT_DIR=$(pwd)
   
   # Copy files to user's home or /tmp
   DEPLOY_DIR="/tmp/travel-app-deploy"
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
   # Use -i to allow interactive if needed, but pass domain to avoid prompts
   sudo -u $NEW_USER bash -c "cd $DEPLOY_DIR && chmod +x deploy-vps.sh && ./deploy-vps.sh \"$DOMAIN\" \"$SSL_EMAIL\""
   
   exit $?
fi

# If not root, run normal deployment
echo -e "${BLUE}Running as regular user: $(whoami)${NC}"
echo ""

# Check if deploy-vps.sh exists
if [ ! -f "deploy-vps.sh" ]; then
    echo -e "${RED}❌ deploy-vps.sh not found in current directory${NC}"
    exit 1
fi

# Run the main deployment script
chmod +x deploy-vps.sh
./deploy-vps.sh "$DOMAIN" "$SSL_EMAIL"

