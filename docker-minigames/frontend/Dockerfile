# Multi-stage build for React + Vite application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies needed for build)
# Remove --only=production flag to install optional dependencies like @rollup/rollup-linux-x64-musl
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration with improved backend resolution
RUN echo 'upstream backend_upstream { \
  server backend:8000 max_fails=3 fail_timeout=30s; \
  } \
  server { \
  listen 80; \
  server_name localhost; \
  \
  # Enable gzip compression \
  gzip on; \
  gzip_vary on; \
  gzip_min_length 1024; \
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
  \
  # Security headers \
  add_header X-Frame-Options "SAMEORIGIN" always; \
  add_header X-Content-Type-Options "nosniff" always; \
  add_header X-XSS-Protection "1; mode=block" always; \
  \
  location / { \
  root /usr/share/nginx/html; \
  index index.html index.htm; \
  try_files $uri $uri/ /index.html; \
  \
  # Cache static assets \
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
  expires 1y; \
  add_header Cache-Control "public, immutable"; \
  } \
  } \
  \
  location /api { \
  proxy_pass http://backend_upstream; \
  proxy_set_header Host $host; \
  proxy_set_header X-Real-IP $remote_addr; \
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
  proxy_set_header X-Forwarded-Proto $scheme; \
  \
  # Timeouts \
  proxy_connect_timeout 60s; \
  proxy_send_timeout 60s; \
  proxy_read_timeout 60s; \
  \
  # Buffer settings \
  proxy_buffering on; \
  proxy_buffer_size 4k; \
  proxy_buffers 8 4k; \
  } \
  \
  location /socket.io { \
  proxy_pass http://backend_upstream; \
  proxy_http_version 1.1; \
  proxy_set_header Upgrade $http_upgrade; \
  proxy_set_header Connection "upgrade"; \
  proxy_set_header Host $host; \
  proxy_set_header X-Real-IP $remote_addr; \
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
  proxy_set_header X-Forwarded-Proto $scheme; \
  \
  # WebSocket specific timeouts \
  proxy_connect_timeout 60s; \
  proxy_send_timeout 60s; \
  proxy_read_timeout 3600s; \
  } \
  \
  # Health check endpoint \
  location /health { \
  access_log off; \
  return 200 "healthy\n"; \
  add_header Content-Type text/plain; \
  } \
  }' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
