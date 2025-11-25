# Quick Start Guide for VPS Deployment

## Step 1: Upload Files to VPS

From your local Windows machine, upload the project to your VPS:

```powershell
# Using SCP (if you have it installed)
scp -r . user@your-vps-ip:/tmp/travel-app

# Or use WinSCP, FileZilla, or any SFTP client
```

## Step 2: SSH into Your VPS

```bash
ssh user@your-vps-ip
```

## Step 3: Run Installation Script

```bash
cd /tmp/travel-app
chmod +x install.sh deploy.sh backup.sh
./install.sh
```

The script will:
- ✅ Install all dependencies (Node.js, PM2, Nginx, etc.)
- ✅ Set up the application
- ✅ Configure PM2 for process management
- ✅ Configure Nginx as reverse proxy
- ✅ Set up SSL (if domain provided)
- ✅ Configure firewall

## Step 4: Access Your App

- **Local**: http://your-vps-ip
- **With Domain**: http://your-domain.com (after DNS setup)

## Updating the App

After making changes, run:
```bash
cd /opt/travel-app
./deploy.sh
```

## Important Files Created

- **Application**: `/opt/travel-app`
- **PM2 Config**: `ecosystem.config.js`
- **Nginx Config**: `/etc/nginx/sites-available/travel-app`
- **Backups**: `/opt/backups/travel-app`

## Useful Commands

```bash
# View app logs
pm2 logs travel-app

# Restart app
pm2 restart travel-app

# Check status
pm2 status

# Nginx reload
sudo systemctl reload nginx

# Backup manually
/opt/travel-app/backup.sh
```

## Troubleshooting

### Port 5000 Already in Use
```bash
# Find and kill process
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Check if App is Running
```bash
pm2 status
pm2 logs travel-app
```

### Check Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

For detailed information, see `README-DEPLOY.md`

