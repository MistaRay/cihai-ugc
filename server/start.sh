#!/bin/bash

# 辞海UGC Backend Startup Script
echo "🚀 Starting 辞海UGC Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-5000}

echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Start the server
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Starting in production mode..."
    npm start
else
    echo "🔧 Starting in development mode..."
    npm run dev
fi
