# Deployment Guide - Choose Your Method

## 🚀 Quick Start

You have **3 deployment options**. Choose based on your situation:

---

## Option 1: Auto-Deploy (Easiest - For Root Users) ⭐

**Use this if:** You're connected as `root` to your VPS

```bash
# 1. Upload files to VPS
scp -r . root@your-vps-ip:/root/travel-app

# 2. SSH as root
ssh root@your-vps-ip
cd /root/travel-app

# 3. Run auto-deploy
chmod +x deploy-vps-auto.sh
./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com
```

**What it does:**
- ✅ Creates user automatically
- ✅ Adds sudo privileges
- ✅ Switches to new user
- ✅ Runs full deployment
- ✅ Sets up HTTPS (if domain provided)

**Time:** ~5 minutes

---

## Option 2: Manual User Creation (More Control)

**Use this if:** You want to choose username/password manually

```bash
# 1. As root, create user
adduser travelapp
# Enter password when prompted

# 2. Add sudo privileges
usermod -aG sudo travelapp

# 3. Exit root session
exit

# 4. Connect as new user
ssh travelapp@your-vps-ip

# 5. Upload files (from your local machine)
scp -r . travelapp@your-vps-ip:/tmp/travel-app

# 6. Deploy
ssh travelapp@your-vps-ip
cd /tmp/travel-app
chmod +x deploy-vps.sh
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

**Time:** ~10 minutes

---

## Option 3: Helper Script (Interactive)

**Use this if:** You want interactive user creation

```bash
# 1. As root on VPS
bash create-vps-user.sh
# Follow the prompts

# 2. Exit and reconnect
exit
ssh newusername@your-vps-ip

# 3. Upload and deploy
scp -r . newusername@your-vps-ip:/tmp/travel-app
ssh newusername@your-vps-ip
cd /tmp/travel-app
chmod +x deploy-vps.sh
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

**Time:** ~8 minutes

---

## 📋 Comparison Table

| Method | Best For | Speed | Control | Difficulty |
|--------|----------|-------|---------|------------|
| **Auto-Deploy** | Root users, quick setup | ⚡ Fast | ⭐⭐ Medium | 🟢 Easy |
| **Manual** | Custom setup, security | 🐢 Slower | ⭐⭐⭐ Full | 🟡 Medium |
| **Helper Script** | Interactive setup | 🐢 Slower | ⭐⭐⭐ Full | 🟡 Medium |

---

## 🔧 Script Parameters

### deploy-vps-auto.sh
```bash
./deploy-vps-auto.sh [username] [domain] [email]
```

**Examples:**
```bash
# Full setup with HTTPS
./deploy-vps-auto.sh travelapp mydomain.com admin@mydomain.com

# With domain only
./deploy-vps-auto.sh travelapp mydomain.com

# HTTP only (no SSL)
./deploy-vps-auto.sh travelapp
```

### deploy-vps.sh
```bash
./deploy-vps.sh [domain] [email]
```

**Examples:**
```bash
# Full setup with HTTPS
./deploy-vps.sh mydomain.com admin@mydomain.com

# HTTP only
./deploy-vps.sh
```

---

## ⚠️ Common Issues

### "Please do not run as root"
**Solution:** Use `deploy-vps-auto.sh` instead of `deploy-vps.sh`

### "User already exists"
**Solution:** The script will use existing user. Or delete: `userdel -r username`

### "Permission denied"
**Solution:** Make sure script is executable: `chmod +x deploy-vps.sh`

### "Port already in use"
**Solution:** Stop existing services: `pm2 stop all` or `sudo systemctl stop nginx`

---

## 📁 Files Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `deploy-vps-auto.sh` | Auto-deploy with user creation | Running as root |
| `deploy-vps.sh` | Standard deployment | Already have user |
| `create-vps-user.sh` | Create user only | Want to create user separately |
| `QUICK-DEPLOY.md` | Quick reference | Need quick help |
| `VPS-SETUP-GUIDE.md` | Detailed guide | Need detailed instructions |

---

## ✅ After Deployment

1. **Change default password:**
   ```bash
   passwd travelapp
   ```

2. **Setup SSH keys** (more secure):
   ```bash
   # On local machine
   ssh-copy-id travelapp@your-vps-ip
   ```

3. **Disable root login** (recommended):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change: PermitRootLogin no
   sudo systemctl restart sshd
   ```

4. **Verify deployment:**
   ```bash
   # Check PM2
   pm2 status
   
   # Check Nginx
   sudo systemctl status nginx
   
   # Check app
   curl http://localhost:5000/api/health
   ```

---

## 🆘 Need Help?

1. Check logs: `pm2 logs travel-app`
2. Check Nginx: `sudo nginx -t`
3. See detailed guide: `VPS-SETUP-GUIDE.md`
4. See quick guide: `QUICK-DEPLOY.md`

