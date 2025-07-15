#!/bin/bash

# Check for tag input
if [ -z "$1" ]; then
  echo "❌ Error: No tag provided."
  echo "✅ Usage: $0 <tag>"
  echo "Example: $0 v3"
  exit 1
fi

TAG="$1"
IMAGE_NAME="myapp"

cd "$(dirname "$0")"

echo "🔨 Building Docker image $IMAGE_NAME:$TAG ..."
docker build -t "$IMAGE_NAME:$TAG" .

if [ $? -eq 0 ]; then
  echo "✅ Build succeeded."
else
  echo "❌ Build failed."
  exit 1
fi
