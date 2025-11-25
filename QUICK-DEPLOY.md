# Quick Deploy Guide - For Root Users

## Problem
You're connected as root, but the deployment script needs a regular user.

## Solution: Use Auto-Deploy Script

### Option 1: Auto-Deploy (Recommended)

The `deploy-vps-auto.sh` script will:
1. ✅ Create a user automatically if running as root
2. ✅ Switch to that user
3. ✅ Run the deployment

**Usage:**
```bash
# Upload files to VPS
scp -r . root@your-vps-ip:/root/travel-app

# SSH as root
ssh root@your-vps-ip

# Navigate to project
cd /root/travel-app

# Make executable and run
chmod +x deploy-vps-auto.sh
./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com
```

**Parameters:**
- `travelapp` - Username to create (default: travelapp)
- `yourdomain.com` - Your domain name (optional)
- `admin@yourdomain.com` - Email for SSL (optional)

### Option 2: Manual User Creation (5 minutes)

```bash
# 1. Create user
adduser travelapp
# Enter password when prompted

# 2. Add to sudo group
usermod -aG sudo travelapp

# 3. Exit root session
exit

# 4. Connect as new user
ssh travelapp@your-vps-ip

# 5. Upload files (from your local machine)
scp -r . travelapp@your-vps-ip:/tmp/travel-app

# 6. SSH and deploy
ssh travelapp@your-vps-ip
cd /tmp/travel-app
chmod +x deploy-vps.sh
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

### Option 3: Use Helper Script

```bash
# As root on VPS
bash create-vps-user.sh
# Follow prompts

# Then disconnect and reconnect as new user
exit
ssh newusername@your-vps-ip

# Upload and deploy
scp -r . newusername@your-vps-ip:/tmp/travel-app
ssh newusername@your-vps-ip
cd /tmp/travel-app
chmod +x deploy-vps.sh
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

## Which Method to Use?

| Method | When to Use | Time |
|--------|-------------|------|
| **Auto-Deploy** | Quick deployment, don't mind auto-created user | 1 min |
| **Manual** | Want to choose username/password | 5 min |
| **Helper Script** | Want interactive user creation | 3 min |

## After Deployment

Once deployment completes, you can:

1. **Change user password:**
   ```bash
   passwd travelapp
   ```

2. **Setup SSH keys** (more secure):
   ```bash
   # On your local machine
   ssh-copy-id travelapp@your-vps-ip
   ```

3. **Disable root login** (recommended):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change: PermitRootLogin no
   sudo systemctl restart sshd
   ```

## Troubleshooting

### "Permission denied" when switching user
```bash
# Make sure sudo is installed
apt-get update && apt-get install sudo -y
```

### "User already exists"
```bash
# The script will use existing user and add to sudo
# Or delete and recreate:
userdel -r travelapp
# Then run script again
```

### "Cannot copy files"
```bash
# Make sure you're in the project directory
pwd
# Should show path with project files
ls -la
# Should show deploy-vps.sh
```

