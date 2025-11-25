#!/bin/bash

# 3D Globe Travel App - VPS Installation Script
# This script installs and configures the application on a Linux VPS

set -e  # Exit on error

echo "🌍 Starting 3D Globe Travel App Installation..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Use a regular user with sudo privileges.${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install PM2 for process management
echo -e "${YELLOW}📦 Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "PM2 already installed"
fi

# Install nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
else
    echo "Nginx already installed"
fi

# Install SQLite3 (if not already installed)
echo -e "${YELLOW}📦 Installing SQLite3...${NC}"
sudo apt-get install -y sqlite3

# Install build essentials (needed for native modules)
echo -e "${YELLOW}📦 Installing build essentials...${NC}"
sudo apt-get install -y build-essential python3

# Install Certbot for SSL
echo -e "${YELLOW}📦 Installing Certbot...${NC}"
sudo apt-get install -y certbot python3-certbot-nginx

# Create application directory
APP_DIR="/opt/travel-app"
echo -e "${YELLOW}📁 Creating application directory at $APP_DIR...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files (assuming we're running from project root)
echo -e "${YELLOW}📁 Copying application files...${NC}"
cp -r . $APP_DIR/ 2>/dev/null || {
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
}

cd $APP_DIR

# Install dependencies
echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
npm install

# Create uploads directory
echo -e "${YELLOW}📁 Creating uploads directory...${NC}"
mkdir -p server/uploads
chmod 755 server/uploads

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_PATH=./server/database.sqlite
UPLOADS_DIR=./server/uploads
EOF
fi

# Initialize database
echo -e "${YELLOW}💾 Initializing database...${NC}"
node -e "
import('./server/database.js').then(({ initDatabase }) => {
    initDatabase();
    console.log('Database initialized');
    process.exit(0);
}).catch(err => {
    console.error('Database init error:', err);
    process.exit(1);
});
" || echo "Database will be initialized on first run"

# Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Create PM2 ecosystem file
echo -e "${YELLOW}📝 Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'travel-app',
    script: 'server/index.js',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
EOF

mkdir -p logs

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 delete travel-app 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup script
echo -e "${YELLOW}⚙️  Setting up PM2 startup script...${NC}"
pm2 startup systemd -u $USER --hp /home/$USER | grep -v "PM2" | sudo bash || true

# Create Nginx configuration
echo -e "${YELLOW}📝 Creating Nginx configuration...${NC}"
read -p "Enter your domain name (or press Enter to skip): " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
fi

sudo tee /etc/nginx/sites-available/travel-app > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/travel-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo -e "${YELLOW}🔍 Testing Nginx configuration...${NC}"
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL if domain is provided
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
    read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " SETUP_SSL
    if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
            echo -e "${YELLOW}SSL setup skipped. You can run 'sudo certbot --nginx' later.${NC}"
        }
    fi
fi

# Setup firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable || true
fi

# Create systemd service for backup (alternative to PM2)
echo -e "${YELLOW}📝 Creating systemd service (backup)...${NC}"
sudo tee /etc/systemd/system/travel-app.service > /dev/null << EOF
[Unit]
Description=3D Globe Travel App
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
# Don't enable by default since we're using PM2
# sudo systemctl enable travel-app

echo ""
echo -e "${GREEN}✅ Installation completed successfully!${NC}"
echo ""
echo "📋 Summary:"
echo "  - Application directory: $APP_DIR"
echo "  - Application running on: http://localhost:5000"
echo "  - Nginx configured for: http://$DOMAIN"
echo "  - PM2 process: travel-app"
echo "  -                        "
echo "🔧 Useful commands:"
echo "  - View logs: pm2 logs travel-app"
echo "  - Restart app: pm2 restart travel-app"
echo "  - Stop app: pm2 stop travel-app"
echo "  - Nginx status: sudo systemctl status nginx"
echo "  - Nginx reload: sudo systemctl reload nginx"
echo ""
if [ "$DOMAIN" != "localhost" ]; then
    echo "🌐 Your app should be accessible at: http://$DOMAIN"
    echo "🔒 To set up SSL later, run: sudo certbot --nginx -d $DOMAIN"
fi
echo ""

