# Upload Files to VPS - Step by Step

## Problem
The deployment scripts are not on your VPS. You need to upload them first.

## Solution: Upload All Files

### Step 1: From Your Windows Machine

Open **PowerShell** or **Command Prompt** and navigate to your project:

```powershell
# Navigate to your project directory
cd C:\Users\yprod\TRAVEL

# Upload ALL files to VPS
scp -r . root@your-vps-ip:/root/travel-app
```

**Replace `your-vps-ip` with your actual VPS IP address.**

### Step 2: If SCP is Not Available

If you get "scp is not recognized", use one of these:

#### Option A: Use WinSCP (GUI Tool)
1. Download WinSCP: https://winscp.net/
2. Connect to your VPS
3. Drag and drop all files to `/root/travel-app`

#### Option B: Use Git (if you have a repo)
```bash
# On VPS
cd /root
git clone your-repo-url travel-app
cd travel-app
```

#### Option C: Use SFTP Client
- FileZilla
- Cyberduck
- Any SFTP client

### Step 3: Verify Files Are Uploaded

After uploading, SSH to your VPS and check:

```bash
ssh root@your-vps-ip
cd /root/travel-app
ls -la
```

You should see:
- `deploy-vps-auto.sh`
- `deploy-vps.sh`
- `package.json`
- All other project files

### Step 4: Run Deployment

```bash
cd /root/travel-app
chmod +x deploy-vps-auto.sh
./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com
```

## Quick Upload Command (Copy-Paste)

**From Windows PowerShell in your project directory:**

```powershell
scp -r * root@YOUR-VPS-IP:/root/travel-app
```

**Replace `YOUR-VPS-IP` with your actual IP!**

## Alternative: Create Directory First

If the directory doesn't exist on VPS:

```bash
# On VPS (as root)
mkdir -p /root/travel-app
```

Then upload from Windows:
```powershell
scp -r * root@your-vps-ip:/root/travel-app
```

## Verify Upload

After uploading, check on VPS:

```bash
cd /root/travel-app
ls -la deploy-vps-auto.sh
# Should show the file

chmod +x deploy-vps-auto.sh
./deploy-vps-auto.sh travelapp
```

