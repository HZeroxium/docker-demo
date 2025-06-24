#!/bin/bash

echo "🐳 Setting up Docker environment for Portfolio..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your values."
fi

# Build and start development environment
echo "🚀 Starting development environment..."
docker-compose up --build -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "📊 Database should be ready!"
echo "🌐 Application: http://localhost:3000"
echo "🗄️  pgAdmin: http://localhost:5050 (admin@portfolio.com / admin123)"
echo "📝 Database: localhost:5432"

echo "✅ Setup complete!"
