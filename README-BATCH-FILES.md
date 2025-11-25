# Windows Batch Files Guide

This guide explains the Windows batch files (.bat) for running the Travel App on Windows.

## Quick Start

### First Time Setup

1. **Run setup script:**
   ```cmd
   setup-dev.bat
   ```
   This will:
   - Check Node.js installation
   - Install all dependencies
   - Create necessary directories
   - Create .env file
   - Generate placeholder icons

### Running the Application

#### Option 1: Run Everything (Recommended)
```cmd
run-all.bat
```
Starts both backend server (port 5000) and frontend client (port 3000) together.

#### Option 2: Run Separately
```cmd
start-server.bat    # Backend only (port 5000)
start-client.bat    # Frontend only (port 3000)
```

### Stopping Servers

```cmd
stop-all.bat
```
Stops all running Node.js processes on ports 3000 and 5000.

### Building for Production

```cmd
build-and-deploy.bat
```
Builds the frontend for production deployment.

## Batch Files Overview

| File | Description |
|------|-------------|
| `setup-dev.bat` | Initial setup - installs dependencies and creates config files |
| `run-all.bat` | Starts both server and client together |
| `start-server.bat` | Starts only the backend server |
| `start-client.bat` | Starts only the frontend development server |
| `stop-all.bat` | Stops all running servers |
| `build-and-deploy.bat` | Builds the app for production |

## Troubleshooting

### "Node.js is not installed"
- Download and install Node.js from https://nodejs.org/
- Recommended: Node.js 20.x LTS
- Make sure to check "Add to PATH" during installation

### "Port already in use"
- Run `stop-all.bat` to kill existing processes
- Or manually kill processes using Task Manager

### "npm install failed"
- Check your internet connection
- Try running as Administrator
- Clear npm cache: `npm cache clean --force`

### "Cannot find module"
- Run `setup-dev.bat` again
- Or manually: `npm install`

## Development Workflow

1. **First time:**
   ```
   setup-dev.bat
   ```

2. **Daily development:**
   ```
   run-all.bat
   ```

3. **When done:**
   ```
   stop-all.bat
   ```

## Ports Used

- **Port 3000**: Frontend development server (Vite)
- **Port 5000**: Backend API server (Express)

Make sure these ports are not used by other applications.

## Environment Variables

The `.env` file is automatically created with:
```
NODE_ENV=development
PORT=5000
HOST=localhost
DB_PATH=./server/database.sqlite
UPLOADS_DIR=./server/uploads
```

You can edit this file to change configuration.

## Notes

- All batch files include error checking
- They will pause on errors so you can read the message
- Press any key to continue after completion
- Use Ctrl+C to stop running servers

