#!/bin/bash

# Full VPS Deployment Script with HTTPS
# This script deploys the application to a VPS with SSL/HTTPS support
# Usage: ./deploy-vps.sh [domain-name] [email-for-ssl]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/travel-app"
APP_NAME="travel-app"
NGINX_SITE="travel-app"
DOMAIN="${1:-}"
SSL_EMAIL="${2:-}"

echo -e "${BLUE}🚀 Starting Full VPS Deployment with HTTPS${NC}"
echo "=============================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ This script cannot run as root.${NC}"
   echo ""
   echo -e "${YELLOW}🔧 Quick Solution - Use Auto-Deploy Script:${NC}"
   echo ""
   echo -e "${GREEN}Option 1: Auto-Deploy (Recommended)${NC}"
   echo -e "  Run this instead: ${BLUE}./deploy-vps-auto.sh${NC}"
   echo -e "  This will create a user automatically and continue deployment"
   echo ""
   echo -e "  ${BLUE}Usage:${NC}"
   echo -e "    ${GREEN}./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com${NC}"
   echo ""
   echo -e "${GREEN}Option 2: Create User Manually${NC}"
   echo -e "  1. Run: ${BLUE}bash create-vps-user.sh${NC}"
   echo -e "  2. Or: ${BLUE}adduser yourusername && usermod -aG sudo yourusername${NC}"
   echo -e "  3. Exit and reconnect: ${BLUE}exit${NC} then ${BLUE}ssh yourusername@your-vps-ip${NC}"
   echo ""
   echo -e "${YELLOW}📖 See QUICK-DEPLOY.md for detailed instructions${NC}"
   echo ""
   
   # Check if auto-deploy script exists
   if [ -f "deploy-vps-auto.sh" ]; then
       echo ""
       echo -e "${GREEN}✅ Auto-deploy script found!${NC}"
       echo ""
       echo -e "${BLUE}💡 Would you like to run it automatically now? (y/n)${NC}"
       echo -e "${YELLOW}   (This will create a user and deploy the app)${NC}"
       read -p "> " -n 1 -r
       echo ""
       if [[ $REPLY =~ ^[Yy]$ ]]; then
           echo ""
           echo -e "${BLUE}🚀 Running auto-deploy script...${NC}"
           echo ""
           chmod +x deploy-vps-auto.sh
           ./deploy-vps-auto.sh "${1:-travelapp}" "${2:-}" "${3:-}"
           exit $?
       else
           echo ""
           echo -e "${YELLOW}To run manually, use:${NC}"
           echo -e "${GREEN}  chmod +x deploy-vps-auto.sh${NC}"
           echo -e "${GREEN}  ./deploy-vps-auto.sh travelapp yourdomain.com admin@yourdomain.com${NC}"
           echo ""
       fi
   else
       echo ""
       echo -e "${RED}❌ deploy-vps-auto.sh not found in current directory${NC}"
       echo -e "${YELLOW}   Make sure you uploaded all files to the VPS${NC}"
       echo ""
       echo -e "${BLUE}Current directory: $(pwd)${NC}"
       echo -e "${BLUE}Files in directory:${NC}"
       ls -la | head -10
       echo ""
   fi
   
   exit 1
fi

# Check if domain is provided
if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  No domain provided. SSL will be skipped.${NC}"
    echo -e "${YELLOW}   Usage: ./deploy-vps.sh example.com admin@example.com${NC}"
    echo -e "${BLUE}   Continuing with HTTP only (no SSL)...${NC}"
    echo ""
    # Auto-continue if running non-interactively (e.g., from deploy-vps-auto.sh)
    if [ -t 0 ]; then
        read -p "Continue without SSL? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Step 1: Update system
echo -e "${BLUE}📦 Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Step 2: Install Node.js
echo -e "${BLUE}📦 Step 2: Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
fi

# Step 3: Install PM2
echo -e "${BLUE}📦 Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi

# Step 4: Install Nginx
echo -e "${BLUE}📦 Step 4: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
fi

# Step 5: Install Certbot for SSL
if [ -n "$DOMAIN" ]; then
    echo -e "${BLUE}📦 Step 5: Installing Certbot for SSL...${NC}"
    if ! command -v certbot &> /dev/null; then
        sudo apt-get install -y certbot python3-certbot-nginx
        echo -e "${GREEN}✅ Certbot installed${NC}"
    else
        echo -e "${GREEN}✅ Certbot already installed${NC}"
    fi
fi

# Step 6: Install build essentials
echo -e "${BLUE}📦 Step 6: Installing build essentials...${NC}"
sudo apt-get install -y build-essential python3 sqlite3

# Step 7: Create application directory
echo -e "${BLUE}📁 Step 7: Creating application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Step 8: Copy application files
echo -e "${BLUE}📁 Step 8: Copying application files...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull
    echo -e "${GREEN}✅ Updated from git${NC}"
else
    # Copy current directory to app directory
    cp -r . $APP_DIR/ 2>/dev/null || {
        echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Files copied${NC}"
fi

cd $APP_DIR

# Step 9: Install dependencies
echo -e "${BLUE}📦 Step 9: Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 10: Create uploads directory
echo -e "${BLUE}📁 Step 10: Creating uploads directory...${NC}"
mkdir -p server/uploads
chmod 755 server/uploads
echo -e "${GREEN}✅ Uploads directory created${NC}"

# Step 11: Create .env file
echo -e "${BLUE}📝 Step 11: Creating .env file...${NC}"
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_PATH=./server/database.sqlite
UPLOADS_DIR=./server/uploads
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi

# Step 12: Initialize database
echo -e "${BLUE}💾 Step 12: Initializing database...${NC}"
node -e "
import('./server/database-adapter.js').then(async ({ initDatabase }) => {
    try {
        await initDatabase();
        console.log('✅ Database initialized');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database init error:', err);
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Import error:', err);
    process.exit(1);
});
" || echo -e "${YELLOW}⚠️  Database will be initialized on first run${NC}"

# Step 13: Build frontend
echo -e "${BLUE}🔨 Step 13: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

# Step 14: Create PM2 ecosystem file
echo -e "${BLUE}📝 Step 14: Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server/index.js',
    cwd: '$APP_DIR',
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

mkdir -p logs
echo -e "${GREEN}✅ PM2 configuration created${NC}"

# Step 15: Start/restart application with PM2
echo -e "${BLUE}🚀 Step 15: Starting application with PM2...${NC}"
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✅ Application started with PM2${NC}"

# Step 16: Setup PM2 startup script
echo -e "${BLUE}⚙️  Step 16: Setting up PM2 startup script...${NC}"
pm2 startup systemd -u $USER --hp /home/$USER | grep -v "PM2" | sudo bash || true
echo -e "${GREEN}✅ PM2 startup configured${NC}"

# Step 17: Create Nginx configuration
echo -e "${BLUE}📝 Step 17: Creating Nginx configuration...${NC}"

if [ -z "$DOMAIN" ]; then
    # HTTP only configuration
    sudo tee /etc/nginx/sites-available/$NGINX_SITE > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF
else
    # HTTP configuration (will be upgraded to HTTPS)
    sudo tee /etc/nginx/sites-available/$NGINX_SITE > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL certificates (will be set by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    gzip_comp_level 6;
}
EOF
fi

# Enable site
sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${BLUE}🔍 Testing Nginx configuration...${NC}"
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Reload Nginx
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx configured${NC}"

# Step 18: Setup SSL with Let's Encrypt
if [ -n "$DOMAIN" ]; then
    echo -e "${BLUE}🔒 Step 18: Setting up SSL certificate...${NC}"
    
    if [ -z "$SSL_EMAIL" ]; then
        SSL_EMAIL="admin@$DOMAIN"
    fi
    
    # Check if certificate already exists
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        echo -e "${YELLOW}⚠️  SSL certificate already exists, renewing...${NC}"
        sudo certbot renew --nginx --non-interactive --quiet
    else
        echo -e "${BLUE}   Obtaining SSL certificate for $DOMAIN...${NC}"
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN \
            --non-interactive \
            --agree-tos \
            --email $SSL_EMAIL \
            --redirect || {
            echo -e "${RED}❌ SSL certificate setup failed${NC}"
            echo -e "${YELLOW}⚠️  Make sure:${NC}"
            echo -e "${YELLOW}   1. Domain DNS points to this server${NC}"
            echo -e "${YELLOW}   2. Port 80 and 443 are open in firewall${NC}"
            echo -e "${YELLOW}   3. Domain is accessible from internet${NC}"
        }
    fi
    
    # Setup auto-renewal
    echo -e "${BLUE}   Setting up SSL auto-renewal...${NC}"
    (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet --nginx") | crontab -
    echo -e "${GREEN}✅ SSL configured${NC}"
fi

# Step 19: Setup firewall
echo -e "${BLUE}🔥 Step 19: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    sudo ufw --force enable || true
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not installed, skipping firewall setup${NC}"
fi

# Step 20: Create backup script
echo -e "${BLUE}📦 Step 20: Creating backup script...${NC}"
cat > backup.sh << 'BACKUP_SCRIPT'
#!/bin/bash
# Backup script for travel app
set -e

APP_DIR="/opt/travel-app"
BACKUP_DIR="/opt/backups/travel-app"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Starting backup..."

mkdir -p $BACKUP_DIR

# Backup database
if [ -f "$APP_DIR/server/database.sqlite" ]; then
    echo "💾 Backing up database..."
    cp "$APP_DIR/server/database.sqlite" "$BACKUP_DIR/db_$DATE.sqlite"
fi

# Backup uploads
if [ -d "$APP_DIR/server/uploads" ]; then
    echo "📁 Backing up uploads..."
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$APP_DIR/server" uploads/
fi

# Backup .env
if [ -f "$APP_DIR/.env" ]; then
    echo "🔐 Backing up .env..."
    cp "$APP_DIR/.env" "$BACKUP_DIR/env_$DATE"
fi

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete

echo "✅ Backup completed: $BACKUP_DIR"
BACKUP_SCRIPT

chmod +x backup.sh
echo -e "${GREEN}✅ Backup script created${NC}"

# Step 21: Setup automatic backups
echo -e "${BLUE}📅 Step 21: Setting up automatic backups...${NC}"
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 2 * * * $APP_DIR/backup.sh >> $APP_DIR/logs/backup.log 2>&1") | crontab -
echo -e "${GREEN}✅ Automatic backups configured (daily at 2 AM)${NC}"

# Final summary
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  - Application directory: $APP_DIR"
echo -e "  - Application running on: http://localhost:5000"
if [ -n "$DOMAIN" ]; then
    echo -e "  - Public URL: https://$DOMAIN"
    echo -e "  - SSL: ✅ Enabled (Let's Encrypt)"
else
    echo -e "  - Public URL: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
    echo -e "  - SSL: ❌ Not configured"
fi
echo -e "  - PM2 process: $APP_NAME"
echo -e "  - Nginx: ✅ Configured"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo -e "  - View logs: pm2 logs $APP_NAME"
echo -e "  - Restart app: pm2 restart $APP_NAME"
echo -e "  - Stop app: pm2 stop $APP_NAME"
echo -e "  - Nginx status: sudo systemctl status nginx"
echo -e "  - Nginx reload: sudo systemctl reload nginx"
if [ -n "$DOMAIN" ]; then
    echo -e "  - Renew SSL: sudo certbot renew"
fi
echo -e "  - Manual backup: $APP_DIR/backup.sh"
echo ""
echo -e "${GREEN}🎉 Your application is now live!${NC}"

