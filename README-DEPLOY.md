# VPS Deployment Guide

This guide will help you deploy the 3D Globe Travel App on a Linux VPS.

## Prerequisites

- A Linux VPS (Ubuntu 20.04+ or Debian 11+ recommended)
- SSH access to your VPS
- A domain name (optional, but recommended for SSL)

## Quick Installation

1. **Upload files to your VPS:**
   ```bash
   # On your local machine
   scp -r . user@your-vps-ip:/tmp/travel-app
   ```

2. **SSH into your VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

3. **Make scripts executable and run installation:**
   ```bash
   cd /tmp/travel-app
   chmod +x install.sh
   ./install.sh
   ```

The installation script will:
- Install Node.js, PM2, Nginx, and other dependencies
- Set up the application in `/opt/travel-app`
- Configure PM2 for process management
- Configure Nginx as a reverse proxy
- Set up SSL with Let's Encrypt (if domain provided)
- Configure firewall rules

## Manual Installation Steps

If you prefer to install manually:

### 1. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PM2
```bash
sudo npm install -g pm2
```

### 3. Install Nginx
```bash
sudo apt-get install -y nginx
```

### 4. Install Application
```bash
# Create app directory
sudo mkdir -p /opt/travel-app
sudo chown -R $USER:$USER /opt/travel-app

# Copy files
cp -r . /opt/travel-app/
cd /opt/travel-app

# Install dependencies
npm install

# Build frontend
npm run build
```

### 5. Configure Environment
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_PATH=./server/database.sqlite
UPLOADS_DIR=./server/uploads
EOF
```

### 6. Start with PM2
```bash
pm2 start server/index.js --name travel-app
pm2 save
pm2 startup
```

### 7. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/travel-app
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /opt/travel-app/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/travel-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Setup SSL (Optional)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Updating the Application

Use the deployment script:
```bash
cd /opt/travel-app
./deploy.sh
```

Or manually:
```bash
cd /opt/travel-app
git pull  # if using git
npm install
npm run build
pm2 restart travel-app
```

## Useful Commands

### PM2 Commands
```bash
pm2 logs travel-app          # View logs
pm2 restart travel-app       # Restart app
pm2 stop travel-app          # Stop app
pm2 status                   # Check status
pm2 monit                    # Monitor resources
```

### Nginx Commands
```bash
sudo systemctl status nginx  # Check status
sudo systemctl reload nginx  # Reload config
sudo nginx -t                # Test configuration
```

### Database Backup
```bash
# Backup database
cp /opt/travel-app/server/database.sqlite /opt/travel-app/server/database.sqlite.backup

# Restore database
cp /opt/travel-app/server/database.sqlite.backup /opt/travel-app/server/database.sqlite
```

### File Uploads Backup
```bash
# Backup uploads
tar -czf uploads-backup.tar.gz /opt/travel-app/server/uploads/
```

## Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` error:
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or use a different port in .env
```

### PM2 Not Starting
```bash
# Check PM2 logs
pm2 logs travel-app --err

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check app logs
pm2 logs travel-app

# Restart app
pm2 restart travel-app
```

### Permission Issues
```bash
# Fix uploads directory permissions
sudo chown -R $USER:$USER /opt/travel-app/server/uploads
chmod -R 755 /opt/travel-app/server/uploads
```

## Security Considerations

1. **Firewall**: Ensure only necessary ports are open
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **SSL**: Always use HTTPS in production
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Environment Variables**: Keep sensitive data in `.env` file
   - Never commit `.env` to version control
   - Use strong passwords for database

4. **Regular Updates**: Keep system and dependencies updated
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   npm audit fix
   ```

## Monitoring

### Setup Monitoring with PM2 Plus (Optional)
```bash
pm2 link <secret_key> <public_key>
```

### Log Rotation
PM2 handles log rotation automatically, but you can configure it:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Strategy

Create a cron job for automated backups:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/travel-app/backup.sh
```

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/travel-app"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /opt/travel-app/server/database.sqlite $BACKUP_DIR/db_$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/travel-app/server/uploads/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

## Support

For issues or questions:
1. Check application logs: `pm2 logs travel-app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -u travel-app -f`

