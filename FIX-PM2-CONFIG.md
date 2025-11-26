# Fix PM2 Config Error

## Problem
PM2 was failing with:
```
[PM2][ERROR] File ecosystem.config.js malformated
ReferenceError: module is not defined in ES module scope
```

## Solution
Changed `ecosystem.config.js` to `ecosystem.config.cjs` to work with ES modules.

## What Changed

1. ✅ Created `ecosystem.config.cjs` with CommonJS syntax
2. ✅ Updated all deployment scripts to use `.cjs` extension
3. ✅ Removed old `ecosystem.config.js` file

## Files Updated

- `deploy-vps.sh` - Now creates `ecosystem.config.cjs`
- `deploy.sh` - Now uses `ecosystem.config.cjs`
- `install.sh` - Now creates `ecosystem.config.cjs`
- `ecosystem.config.cjs` - New file with correct syntax

## If You Already Deployed

If you already ran deployment and got the error, fix it on the VPS:

```bash
# Connect to VPS
ssh yprods@your-vps-ip

# Go to app directory
cd /opt/travel-app

# Create the correct config file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'travel-app',
    script: 'server/index.js',
    cwd: '/opt/travel-app',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'dist', 'uploads']
  }]
}
EOF

# Remove old file
rm -f ecosystem.config.js

# Restart PM2
pm2 delete travel-app
pm2 start ecosystem.config.cjs
pm2 save
```

## Verify

```bash
pm2 status
pm2 logs travel-app
```

