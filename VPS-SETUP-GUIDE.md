# VPS Setup Guide - Create User with Sudo

## Problem
The deployment script requires a regular user with sudo privileges, not root.

## Solution: Create a New User

### Step 1: Connect to Your VPS as Root

```bash
ssh root@your-vps-ip
```

### Step 2: Create a New User

```bash
# Create user (replace 'yourusername' with your preferred username)
adduser yourusername

# You'll be prompted to:
# - Enter a password (choose a strong password)
# - Enter full name (optional, press Enter to skip)
# - Enter other information (optional, press Enter to skip)
# - Confirm (Y)
```

### Step 3: Add User to Sudo Group

```bash
# Add user to sudo group
usermod -aG sudo yourusername

# Verify sudo access
su - yourusername
sudo whoami
# Should output: root
```

### Step 4: Setup SSH Keys (Optional but Recommended)

```bash
# Still as root, create .ssh directory
mkdir -p /home/yourusername/.ssh
chmod 700 /home/yourusername/.ssh

# Copy your public key (from your local machine)
# On your local Windows machine, run:
# type %USERPROFILE%\.ssh\id_rsa.pub
# Copy the output

# On VPS (as root), paste the key:
nano /home/yourusername/.ssh/authorized_keys
# Paste your public key, save and exit (Ctrl+X, Y, Enter)

# Set correct permissions
chown -R yourusername:yourusername /home/yourusername/.ssh
chmod 600 /home/yourusername/.ssh/authorized_keys
```

### Step 5: Disconnect and Reconnect as New User

```bash
# Exit root session
exit

# From your local machine, connect as new user
ssh yourusername@your-vps-ip
```

### Step 6: Upload and Run Deployment Script

```bash
# On your local Windows machine, upload files
scp -r . yourusername@your-vps-ip:/tmp/travel-app

# SSH into VPS as new user
ssh yourusername@your-vps-ip

# Navigate to project
cd /tmp/travel-app

# Make script executable
chmod +x deploy-vps.sh

# Run deployment
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

## Alternative: Quick User Creation Script

If you want to automate user creation, create this script on your VPS:

```bash
#!/bin/bash
# Run as root

read -p "Enter username: " username
adduser $username
usermod -aG sudo $username

echo "User $username created with sudo privileges"
echo "Now disconnect and reconnect as: ssh $username@your-vps-ip"
```

## Security Best Practices

1. **Disable root SSH login** (after creating user):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Find: PermitRootLogin yes
   # Change to: PermitRootLogin no
   # Save and restart: sudo systemctl restart sshd
   ```

2. **Use SSH keys instead of passwords**:
   - More secure
   - No password needed when connecting

3. **Keep system updated**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

## Troubleshooting

### "User is not in the sudoers file"
```bash
# As root, add user to sudoers
usermod -aG sudo yourusername
```

### "Permission denied" when running script
```bash
# Make sure script is executable
chmod +x deploy-vps.sh

# Check file ownership
ls -la deploy-vps.sh
```

### "Command not found" for sudo
```bash
# Install sudo if not available
apt-get update
apt-get install sudo
```

## Quick Reference

```bash
# Create user
adduser username

# Add to sudo group
usermod -aG sudo username

# Switch to user
su - username

# Test sudo
sudo whoami

# Disconnect and reconnect
exit
ssh username@vps-ip
```

