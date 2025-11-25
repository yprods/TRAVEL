#!/bin/bash

# Quick deployment script for updates
# Run this after making changes to the code

set -e

APP_DIR="${APP_DIR:-/opt/travel-app}"

echo "🚀 Deploying updates..."

# Navigate to app directory
cd $APP_DIR || {
    echo "Error: Application directory not found. Run install.sh first."
    exit 1
}

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull || echo "⚠️  Git pull failed or not a git repository, continuing..."
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Ensure logs directory exists
mkdir -p logs

# Restart application
echo "🔄 Restarting application..."
if pm2 list | grep -q "travel-app"; then
    pm2 restart travel-app
else
    echo "⚠️  App not running, starting it..."
    pm2 start ecosystem.config.js || pm2 start server/index.js --name travel-app
    pm2 save
fi

# Wait a moment for the app to start
sleep 2

# Check if app is running
if pm2 list | grep -q "travel-app.*online"; then
    echo "✅ Deployment completed successfully!"
    echo "📊 App status:"
    pm2 status travel-app
else
    echo "❌ Deployment completed but app may not be running correctly"
    echo "📋 Check logs with: pm2 logs travel-app"
    exit 1
fi

