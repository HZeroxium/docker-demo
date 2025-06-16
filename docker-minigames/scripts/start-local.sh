#!/bin/bash
# Start with Local MongoDB Container

echo "🚀 Starting Docker Quiz Game with Local MongoDB..."
echo "📍 Environment: Local Development"

# Copy local environment file
cp .env.local .env

# Start services with local profile
docker-compose --profile local up --build

echo "✅ Application started with local MongoDB container"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "🗄️ MongoDB: localhost:27017"
