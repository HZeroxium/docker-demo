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
PORT=3000

cd "$(dirname "$0")"

echo "🚀 Running Docker container $IMAGE_NAME:$TAG on port $PORT ..."
docker run -p $PORT:$PORT "$IMAGE_NAME:$TAG"
