#!/bin/bash
# Start Development Environment

echo "🔧 Starting Docker Quiz Game - Development Mode..."
echo "📍 Environment: Development with Local MongoDB"

# Copy development environment file
cp .env.dev .env

# Start services with development profile
docker-compose --profile local-dev up --build

echo "✅ Development environment started"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "🗄️ MongoDB: localhost:27017 (dev database)"
