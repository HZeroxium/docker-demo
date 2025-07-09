#!/bin/sh

# Docker Quiz Game Frontend - Runtime Configuration Script
# This script injects environment variables into the built application at runtime

set -e

echo "🔧 Configuring frontend for runtime environment..."

# Default values
VITE_BACKEND_URL=${VITE_BACKEND_URL:-"http://localhost:8000"}
VITE_ENVIRONMENT=${VITE_ENVIRONMENT:-"production"}

echo "📝 Frontend Configuration:"
echo "  - Backend URL: $VITE_BACKEND_URL"
echo "  - Environment: $VITE_ENVIRONMENT"

# Create a runtime configuration file
cat >/usr/share/nginx/html/runtime-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL}",
  VITE_ENVIRONMENT: "${VITE_ENVIRONMENT}"
};
console.log("🔧 Runtime configuration loaded:", window.__RUNTIME_CONFIG__);
EOF

# Inject the runtime configuration script into index.html
if [ -f "/usr/share/nginx/html/index.html" ]; then
  # Add the runtime config script before the closing head tag
  sed -i 's|</head>|  <script src="/runtime-config.js"></script>\n  </head>|' /usr/share/nginx/html/index.html
  echo "✅ Runtime configuration script injected into index.html"
else
  echo "⚠️ Warning: index.html not found"
fi

echo "✅ Runtime configuration created"

# Note: This script will be run by nginx's docker-entrypoint.sh automatically
# We don't need to start nginx here as it will be started by the main entrypoint
