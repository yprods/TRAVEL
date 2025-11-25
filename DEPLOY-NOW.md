# 🚀 Deploy Now - Step by Step

## You're seeing this because you tried to run as root

### ✅ Solution: Run the Auto-Deploy Script

**Copy and paste these commands exactly:**

```bash
# 1. Make sure you're in the project directory
pwd
# Should show: /root/travel-app or similar

# 2. Make the auto-deploy script executable
chmod +x deploy-vps-auto.sh

# 3. Run it with your domain (replace with your actual domain)
./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com

# OR if you don't have a domain yet:
./deploy-vps-auto.sh travelapp
```

## 📝 What to Replace

- `travelapp` - Username to create (you can change this)
- `yourdomain.com` - Your actual domain name (or leave empty for HTTP only)
- `admin@yourdomain.com` - Your email for SSL certificate

## 🔍 Check if Script Exists

```bash
ls -la deploy-vps-auto.sh
```

If you see the file, continue. If not, you need to upload it first.

## 📤 If Script Doesn't Exist - Upload It

**From your local Windows machine:**

```powershell
# Upload all files including the new script
scp -r . root@your-vps-ip:/root/travel-app
```

Then SSH back and run:
```bash
cd /root/travel-app
chmod +x deploy-vps-auto.sh
./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com
```

## ⚡ Quick Copy-Paste (No Domain)

```bash
chmod +x deploy-vps-auto.sh && ./deploy-vps-auto.sh travelapp
```

## ⚡ Quick Copy-Paste (With Domain)

```bash
chmod +x deploy-vps-auto.sh && ./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com
```

## ❓ Still Having Issues?

1. **Check if file exists:**
   ```bash
   ls -la | grep deploy
   ```

2. **Check current directory:**
   ```bash
   pwd
   ls -la
   ```

3. **If files are missing, upload again:**
   ```bash
   # From your local machine
   scp -r . root@your-vps-ip:/root/travel-app
   ```

4. **Then run:**
   ```bash
   cd /root/travel-app
   chmod +x deploy-vps-auto.sh
   ./deploy-vps-auto.sh travelapp
   ```

