#!/bin/bash

# Quick VPS User Creation Script
# Run this as root to create a new user with sudo privileges

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ This script must be run as root${NC}"
   echo -e "${YELLOW}   Run: sudo bash create-vps-user.sh${NC}"
   exit 1
fi

echo -e "${BLUE}👤 VPS User Creation Script${NC}"
echo "=============================="
echo ""

# Get username
read -p "Enter username for new user: " username

if [ -z "$username" ]; then
    echo -e "${RED}❌ Username cannot be empty${NC}"
    exit 1
fi

# Check if user already exists
if id "$username" &>/dev/null; then
    echo -e "${YELLOW}⚠️  User $username already exists${NC}"
    read -p "Add to sudo group anyway? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        usermod -aG sudo $username
        echo -e "${GREEN}✅ User $username added to sudo group${NC}"
    fi
    exit 0
fi

# Create user
echo -e "${BLUE}Creating user: $username${NC}"
adduser $username

# Add to sudo group
echo -e "${BLUE}Adding $username to sudo group...${NC}"
usermod -aG sudo $username

# Create .ssh directory
echo -e "${BLUE}Setting up SSH directory...${NC}"
mkdir -p /home/$username/.ssh
chmod 700 /home/$username/.ssh
chown -R $username:$username /home/$username/.ssh

# Get VPS IP
VPS_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}✅ User $username created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "  1. Disconnect from root session"
echo -e "  2. Connect as new user: ${GREEN}ssh $username@$VPS_IP${NC}"
echo -e "  3. Test sudo: ${GREEN}sudo whoami${NC}"
echo ""
echo -e "${YELLOW}💡 Optional: Setup SSH key${NC}"
echo -e "  On your local machine, run:"
echo -e "  ${GREEN}ssh-copy-id $username@$VPS_IP${NC}"
echo -e "  Or manually copy ~/.ssh/id_rsa.pub to:"
echo -e "  ${GREEN}/home/$username/.ssh/authorized_keys${NC}"
echo ""

