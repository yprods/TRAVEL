#!/bin/bash

# Backup script for 3D Globe Travel App
# Run this manually or set up as a cron job

set -e

APP_DIR="/opt/travel-app"
BACKUP_DIR="/opt/backups/travel-app"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Starting backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
if [ -f "$APP_DIR/server/database.sqlite" ]; then
    echo "💾 Backing up database..."
    cp "$APP_DIR/server/database.sqlite" "$BACKUP_DIR/db_$DATE.sqlite"
    echo "✅ Database backed up to: $BACKUP_DIR/db_$DATE.sqlite"
fi

# Backup uploads
if [ -d "$APP_DIR/server/uploads" ]; then
    echo "📁 Backing up uploads..."
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$APP_DIR/server" uploads/
    echo "✅ Uploads backed up to: $BACKUP_DIR/uploads_$DATE.tar.gz"
fi

# Backup .env file
if [ -f "$APP_DIR/.env" ]; then
    echo "🔐 Backing up .env..."
    cp "$APP_DIR/.env" "$BACKUP_DIR/env_$DATE"
    echo "✅ .env backed up to: $BACKUP_DIR/env_$DATE"
fi

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups (keeping last 7 days)..."
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup completed!"
echo "📂 Backup location: $BACKUP_DIR"

