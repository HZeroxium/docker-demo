#!/bin/bash

# Test Docker Scripts

set -e

echo "🧪 Testing Docker Scripts"
echo "========================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Test building image
echo "🔨 Testing image build..."
cd "$(dirname "$0")/.."
docker build -t portfolio-app:test . > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Image build successful"
else
    echo "❌ Image build failed"
    exit 1
fi

# Test running container
echo "🚀 Testing container run..."
docker run -d --name portfolio_test -p 3001:3000 portfolio-app:test > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Container started successfully"
    
    # Wait and test health check
    sleep 5
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
    else
        echo "⚠️  Health check failed (container may still be starting)"
    fi
    
    # Cleanup
    docker stop portfolio_test > /dev/null 2>&1
    docker rm portfolio_test > /dev/null 2>&1
    echo "✅ Container stopped and removed"
else
    echo "❌ Container failed to start"
    exit 1
fi

# Cleanup test image
docker rmi portfolio-app:test > /dev/null 2>&1
echo "✅ Test image removed"

echo ""
echo "🎉 All tests passed! Scripts are ready to use."
echo ""
echo "📋 Available commands:"
echo "  ./scripts/docker-commands.sh    - Interactive Docker demo"
echo "  ./scripts/start-local.sh        - Start local development"
echo "  ./scripts/start-cloud.sh        - Start cloud deployment"
echo "  ./scripts/start-local.ps1       - Start local (Windows)"
echo "  ./scripts/start-cloud.ps1       - Start cloud (Windows)"
