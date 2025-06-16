#!/bin/bash
# Start with Cloud MongoDB (No local container)

echo "☁️ Starting Docker Quiz Game with Cloud MongoDB..."
echo "📍 Environment: Cloud Production"

# Copy cloud environment file
cp .env.cloud .env

# Start services without MongoDB container
docker-compose --profile cloud up --build

echo "✅ Application started with cloud MongoDB"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "☁️ MongoDB: Cloud hosted"
