#!/bin/bash

# Script to fix port conflict issues

PORT=5000

echo "🔍 Checking for processes using port $PORT..."

# Find process using the port
PID=$(sudo lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT is free"
    exit 0
fi

echo "⚠️  Port $PORT is in use by process: $PID"
echo "Process details:"
ps -p $PID -o pid,cmd

read -p "Do you want to kill this process? (y/n): " KILL_PROCESS

if [ "$KILL_PROCESS" = "y" ] || [ "$KILL_PROCESS" = "Y" ]; then
    echo "🛑 Killing process $PID..."
    sudo kill -9 $PID
    echo "✅ Process killed. Port $PORT is now free."
else
    echo "ℹ️  Process not killed. You may want to:"
    echo "   1. Stop the process manually"
    echo "   2. Change the port in .env file"
    echo "   3. Use a different port"
fi

