#!/bin/bash

echo "🚀 Building production Docker image..."

# Build production image
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "✅ Production environment is ready!"
echo "🌐 Application: http://localhost:3000"
echo "🗄️  pgAdmin: http://localhost:5050"
