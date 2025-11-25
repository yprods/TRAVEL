# VPS Deployment Guide with HTTPS

This guide explains how to deploy the Travel App to a VPS with full HTTPS support.

## Prerequisites

1. **VPS Server** (Ubuntu 20.04+ recommended)
   - Minimum: 1GB RAM, 1 CPU core
   - Recommended: 2GB+ RAM, 2+ CPU cores
   
2. **Domain Name** (for HTTPS)
   - DNS A record pointing to your VPS IP
   - DNS A record for www subdomain (optional)

3. **SSH Access** to your VPS
   - User with sudo privileges

## Quick Deployment

### Option 1: With Domain and HTTPS

```bash
# Upload files to VPS
scp -r . user@your-vps-ip:/tmp/travel-app

# SSH into VPS
ssh user@your-vps-ip

# Navigate to project
cd /tmp/travel-app

# Make script executable
chmod +x deploy-vps.sh

# Run deployment (with domain and email)
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

### Option 2: Without Domain (HTTP only)

```bash
./deploy-vps.sh
# Answer 'y' when prompted to continue without SSL
```

## What the Script Does

The deployment script automatically:

1. ✅ Updates system packages
2. ✅ Installs Node.js 20.x
3. ✅ Installs PM2 (process manager)
4. ✅ Installs Nginx (web server)
5. ✅ Installs Certbot (SSL certificates)
6. ✅ Creates application directory (`/opt/travel-app`)
7. ✅ Copies application files
8. ✅ Installs npm dependencies
9. ✅ Builds frontend
10. ✅ Initializes database
11. ✅ Configures PM2
12. ✅ Configures Nginx as reverse proxy
13. ✅ Sets up SSL with Let's Encrypt (if domain provided)
14. ✅ Configures firewall (UFW)
15. ✅ Sets up automatic backups
16. ✅ Configures auto-renewal for SSL

## Manual Steps (if needed)

### 1. DNS Configuration

Before running with SSL, ensure your domain DNS is configured:

```
Type    Name    Value           TTL
A       @       your-vps-ip     3600
A       www     your-vps-ip     3600
```

Wait for DNS propagation (can take up to 48 hours, usually much faster).

### 2. Firewall Configuration

If UFW is not available, manually configure firewall:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 3. Verify Deployment

After deployment, check:

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check application logs
pm2 logs travel-app

# Test SSL (if configured)
curl -I https://yourdomain.com
```

## Post-Deployment

### Update Application

To update the application after making changes:

```bash
cd /opt/travel-app

# Pull latest changes (if using git)
git pull

# Or copy new files
# scp -r . user@vps:/opt/travel-app

# Install new dependencies
npm install

# Rebuild frontend
npm run build

# Restart application
pm2 restart travel-app
```

### Manual SSL Renewal

SSL certificates auto-renew, but you can manually renew:

```bash
sudo certbot renew --nginx
```

### Backup and Restore

**Manual Backup:**
```bash
/opt/travel-app/backup.sh
```

**Automatic Backups:**
- Runs daily at 2 AM
- Stored in `/opt/backups/travel-app`
- Keeps last 30 days

**Restore from Backup:**
```bash
# Restore database
cp /opt/backups/travel-app/db_YYYYMMDD_HHMMSS.sqlite /opt/travel-app/server/database.sqlite

# Restore uploads
tar -xzf /opt/backups/travel-app/uploads_YYYYMMDD_HHMMSS.tar.gz -C /opt/travel-app/server/

# Restart app
pm2 restart travel-app
```

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs travel-app

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart PM2
pm2 restart travel-app
```

### Nginx Errors

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --nginx

# Check if ports 80/443 are open
sudo ufw status
```

### Database Issues

```bash
# Check database file
ls -lh /opt/travel-app/server/database.sqlite

# Reinitialize database
cd /opt/travel-app
node -e "import('./server/database-adapter.js').then(m => m.initDatabase())"
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /opt/travel-app

# Fix uploads directory
chmod 755 /opt/travel-app/server/uploads
```

## Security Recommendations

1. **Keep system updated:**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. **Use strong passwords** for database (if using MySQL)

3. **Regular backups** (already configured)

4. **Monitor logs:**
   ```bash
   pm2 logs travel-app --lines 100
   ```

5. **Set up fail2ban** (optional):
   ```bash
   sudo apt-get install fail2ban
   ```

## File Structure

```
/opt/travel-app/
├── server/              # Backend code
│   ├── index.js        # Main server file
│   ├── routes/         # API routes
│   ├── uploads/        # User uploads
│   └── database.sqlite # SQLite database
├── dist/               # Built frontend
├── logs/               # Application logs
├── ecosystem.config.js # PM2 configuration
├── .env                # Environment variables
└── backup.sh           # Backup script
```

## Support

For issues or questions:
1. Check application logs: `pm2 logs travel-app`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services are running: `pm2 status && sudo systemctl status nginx`

