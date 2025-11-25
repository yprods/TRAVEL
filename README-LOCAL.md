# Local Development Setup with Docker & MySQL

This guide will help you set up the 3D Globe Travel App locally with Docker and MySQL.

## Prerequisites

- **Docker Desktop** (for Windows/Mac) or **Docker** + **Docker Compose** (for Linux)
- **Node.js** 18+ installed
- **npm** or **yarn**

## Quick Start

### Windows

1. **Double-click** `start-local.bat` or run in PowerShell:
   ```powershell
   .\start-local.bat
   ```

2. **To stop**, run:
   ```powershell
   .\stop-local.bat
   ```

### Linux/Mac

1. **Make scripts executable**:
   ```bash
   chmod +x start-local.sh stop-local.sh
   ```

2. **Start everything**:
   ```bash
   ./start-local.sh
   ```

3. **To stop**, run:
   ```bash
   ./stop-local.sh
   ```

## What Gets Started

The script automatically:

1. ✅ **Starts MySQL** in Docker container
2. ✅ **Starts phpMyAdmin** for database management
3. ✅ **Creates .env file** with MySQL configuration
4. ✅ **Installs npm dependencies** (if needed)
5. ✅ **Starts backend server** on port 5000
6. ✅ **Starts frontend dev server** on port 5173

## Services URLs

After starting, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **phpMyAdmin**: http://localhost:8080
- **MySQL**: localhost:3306

## Database Credentials

- **User**: `travel_user`
- **Password**: `travel_password`
- **Database**: `travel_app`
- **Root Password**: `rootpassword`

## phpMyAdmin Access

1. Open http://localhost:8080
2. Login with:
   - **Server**: `mysql`
   - **Username**: `root` or `travel_user`
   - **Password**: `rootpassword` or `travel_password`

## Manual Setup

If you prefer to set up manually:

### 1. Start Docker Containers

```bash
docker-compose up -d
```

### 2. Wait for MySQL

```bash
# Check if MySQL is ready
docker exec travel-app-mysql mysqladmin ping -h localhost -u root -prootpassword
```

### 3. Create .env File

```bash
cat > .env << EOF
NODE_ENV=development
PORT=5000
HOST=localhost
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=travel_user
DB_PASSWORD=travel_password
DB_NAME=travel_app
UPLOADS_DIR=./server/uploads
EOF
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Servers

```bash
npm run dev
```

## Database Configuration

The app automatically detects which database to use:

- **MySQL**: If `DB_TYPE=mysql` or `DB_HOST` is set in `.env`
- **SQLite**: Falls back to SQLite if MySQL is not available

### Switching Between Databases

**Use MySQL:**
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=travel_user
DB_PASSWORD=travel_password
DB_NAME=travel_app
```

**Use SQLite:**
```env
# Remove or comment out MySQL settings
# DB_TYPE=mysql
DB_PATH=./server/database.sqlite
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3306 is already in use:

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process
sudo lsof -ti:5000 | xargs kill -9
```

### Docker Containers Not Starting

```bash
# Check Docker status
docker ps -a

# View logs
docker-compose logs

# Restart containers
docker-compose restart
```

### MySQL Connection Failed

1. **Check if MySQL container is running**:
   ```bash
   docker ps | grep mysql
   ```

2. **Check MySQL logs**:
   ```bash
   docker logs travel-app-mysql
   ```

3. **Restart MySQL container**:
   ```bash
   docker-compose restart mysql
   ```

### Database Not Initialized

The database schema is automatically created when MySQL starts for the first time. If tables are missing:

1. **Check init script**:
   ```bash
   docker exec travel-app-mysql mysql -u root -prootpassword travel_app -e "SHOW TABLES;"
   ```

2. **Manually run init script**:
   ```bash
   docker exec -i travel-app-mysql mysql -u root -prootpassword travel_app < docker/mysql/init.sql
   ```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

1. **Start services**: `./start-local.sh` (or `.bat` on Windows)
2. **Make code changes** - Hot reload is enabled
3. **View logs**: Check terminal output or `pm2 logs` if using PM2
4. **Stop services**: `./stop-local.sh` (or `.bat` on Windows)

## Database Management

### View Data in phpMyAdmin

1. Open http://localhost:8080
2. Select `travel_app` database
3. Browse tables and data

### Backup Database

```bash
# Backup MySQL database
docker exec travel-app-mysql mysqldump -u root -prootpassword travel_app > backup.sql

# Restore from backup
docker exec -i travel-app-mysql mysql -u root -prootpassword travel_app < backup.sql
```

### Reset Database

```bash
# Drop and recreate database
docker exec travel-app-mysql mysql -u root -prootpassword -e "DROP DATABASE IF EXISTS travel_app; CREATE DATABASE travel_app;"

# Restart container to run init script
docker-compose restart mysql
```

## Environment Variables

Key environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `5000` |
| `DB_TYPE` | Database type (`mysql` or `sqlite`) | `mysql` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `travel_user` |
| `DB_PASSWORD` | MySQL password | `travel_password` |
| `DB_NAME` | MySQL database name | `travel_app` |

## Next Steps

- Read the main [README.md](README.md) for application features
- Check [README-DEPLOY.md](README-DEPLOY.md) for production deployment
- Review [QUICK-START.md](QUICK-START.md) for VPS deployment

## Support

If you encounter issues:

1. Check Docker containers: `docker ps`
2. Check application logs in terminal
3. Check MySQL logs: `docker logs travel-app-mysql`
4. Verify `.env` file configuration

