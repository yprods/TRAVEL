# Deploy All - One Script Does Everything

## 🚀 Quick Start

This single script does **everything** for you:
1. ✅ Uploads files to VPS
2. ✅ Creates user `yprods`
3. ✅ Installs all dependencies
4. ✅ Deploys the application
5. ✅ Sets up HTTPS (if domain provided)

## 📋 Usage

### On Windows

```cmd
deploy-all.bat
```

The script will ask you for:
- VPS IP address
- Domain (optional)
- Email for SSL (if domain provided)

### On Linux/Mac

```bash
chmod +x deploy-all.sh
./deploy-all.sh VPS-IP [domain] [email]
```

**Examples:**

```bash
# HTTP only (no SSL)
./deploy-all.sh 192.168.1.100

# With domain and HTTPS
./deploy-all.sh 192.168.1.100 mydomain.com admin@mydomain.com
```

## 🔧 What It Does

### Step 1: Upload Files
- Uploads all project files to VPS
- Uses SCP (Secure Copy Protocol)
- Places files in `/tmp/travel-app`

### Step 2: Create User
- Creates user `yprods` (if doesn't exist)
- Adds sudo privileges
- Sets up SSH directory

### Step 3: Deploy Application
- Installs Node.js, PM2, Nginx
- Installs npm dependencies
- Builds frontend
- Configures Nginx
- Sets up SSL (if domain provided)
- Starts application with PM2

## 📝 Prerequisites

### On Your Local Machine

1. **OpenSSH Client** (for SCP)
   - Windows: Settings > Apps > Optional Features > Add OpenSSH Client
   - Linux/Mac: Usually pre-installed

2. **SSH Access** to VPS
   - Test: `ssh root@your-vps-ip`
   - Should connect without errors

### On VPS

- Ubuntu 20.04+ (or similar Linux)
- Root access
- Internet connection

## ⚡ Quick Examples

### Example 1: HTTP Only

```bash
./deploy-all.sh 192.168.1.100
```

Result: App available at `http://192.168.1.100`

### Example 2: With HTTPS

```bash
./deploy-all.sh 192.168.1.100 mydomain.com admin@mydomain.com
```

Result: App available at `https://mydomain.com`

## 🔍 After Deployment

### Connect to VPS

```bash
ssh yprods@your-vps-ip
```

### Change Password

```bash
passwd
```

### Check Application Status

```bash
pm2 status
pm2 logs travel-app
```

### Access Application

- **With domain**: `https://yourdomain.com`
- **Without domain**: `http://your-vps-ip`

## 🆘 Troubleshooting

### "SCP not found"

**Windows:**
1. Open Settings
2. Apps > Optional Features
3. Add feature > OpenSSH Client

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install openssh-client

# Mac
# Usually pre-installed
```

### "Permission denied"

Make sure you can SSH to VPS:
```bash
ssh root@your-vps-ip
```

### "Upload failed"

1. Check VPS IP is correct
2. Verify SSH is enabled on VPS
3. Test connection: `ping your-vps-ip`

### "Deployment errors"

Connect and check logs:
```bash
ssh yprods@your-vps-ip
cd /opt/travel-app
pm2 logs travel-app
```

## 📁 Files Created

- `deploy-all.sh` - Linux/Mac script
- `deploy-all.bat` - Windows script
- `deploy-yprods.sh` - User creation and deployment
- `deploy-vps.sh` - Main deployment script

## 🎯 Summary

**One command does everything:**

```bash
./deploy-all.sh YOUR-VPS-IP yourdomain.com admin@yourdomain.com
```

That's it! The script handles everything automatically.

