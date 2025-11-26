# Deploy for yprods User

## Quick Deploy

This script creates user `yprods` and deploys the application automatically.

### Usage

```bash
# As root on VPS
chmod +x deploy-yprods.sh

# With domain (HTTPS)
./deploy-yprods.sh yourdomain.com admin@yourdomain.com

# Without domain (HTTP only)
./deploy-yprods.sh
```

## What It Does

1. ✅ Creates user `yprods` (if doesn't exist)
2. ✅ Adds sudo privileges
3. ✅ Copies application files
4. ✅ Switches to user `yprods`
5. ✅ Runs full deployment
6. ✅ Sets up HTTPS (if domain provided)

## After Deployment

### Connect as yprods user

```bash
ssh yprods@your-vps-ip
```

### Change password

```bash
passwd
```

### Check application status

```bash
pm2 status
pm2 logs travel-app
```

### Access application

- **With domain**: `https://yourdomain.com`
- **Without domain**: `http://your-vps-ip`

## Files Location

- Application: `/opt/travel-app`
- User home: `/home/yprods`
- Logs: `/opt/travel-app/logs`

## Troubleshooting

### Check if user exists

```bash
id yprods
```

### Check sudo access

```bash
sudo whoami
# Should output: root
```

### View deployment logs

```bash
cd /opt/travel-app
pm2 logs travel-app --lines 100
```

