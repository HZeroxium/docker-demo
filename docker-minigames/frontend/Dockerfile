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

# Copy nginx configuration
RUN echo 'server { \
  listen 80; \
  server_name localhost; \
  location / { \
  root /usr/share/nginx/html; \
  index index.html index.htm; \
  try_files $uri $uri/ /index.html; \
  } \
  location /api { \
  proxy_pass http://backend:8000; \
  proxy_set_header Host $host; \
  proxy_set_header X-Real-IP $remote_addr; \
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
  proxy_set_header X-Forwarded-Proto $scheme; \
  } \
  location /socket.io { \
  proxy_pass http://backend:8000; \
  proxy_http_version 1.1; \
  proxy_set_header Upgrade $http_upgrade; \
  proxy_set_header Connection "upgrade"; \
  proxy_set_header Host $host; \
  proxy_set_header X-Real-IP $remote_addr; \
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
  proxy_set_header X-Forwarded-Proto $scheme; \
  } \
  }' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
