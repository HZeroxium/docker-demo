# Docker Quiz Game - Complete Deployment Guide

## Overview

This guide provides a complete solution for deploying the Docker Quiz Game to the cloud. The deployment is designed to be extremely simple on the cloud side.

## Root Cause Analysis of Previous Issues

The errors you experienced were caused by:

1. **Environment Variable Mismatch**: Frontend was trying to connect to `localhost:8000` instead of your cloud server IP
2. **Build-time vs Runtime Configuration**: Vite environment variables are embedded at build time, but cloud deployment needs runtime configuration
3. **Socket.io Connection Issues**: WebSocket connections were pointing to localhost instead of the cloud server

## Solution Implementation

### 1. Runtime Configuration Support

- Added support for runtime environment variable injection in frontend
- Dual configuration: Frontend now supports both build-time and runtime configuration
- Automatic fallback: Runtime → Build-time → Default configuration

### 2. Updated Build Process

- Always passes the backend URL as a build argument
- Ensures consistent environment variable propagation
- Builds platform-specific images for cloud deployment

### 3. Simple Cloud Deployment Scripts

- `deploy-cloud.ps1` / `deploy-cloud.sh`: Deploy with comprehensive health checks
- `stop-cloud.ps1` / `stop-cloud.sh`: Stop deployment cleanly

## Step-by-Step Instructions

### Phase 1: Local Build and Push (On Your Development Machine)

1. **Update your configuration**:

   ```powershell
   # Edit .env file to ensure correct cloud server IP
   VITE_BACKEND_URL=http://68.183.185.16:8000
   ```

2. **Build and push images with the correct backend URL**:

   ```powershell
   .\scripts\build_push.ps1 -BackendUrl "http://68.183.185.16:8000"
   ```

   This will:

   - Build backend image with cloud database connections
   - Build frontend image with correct backend URL baked in
   - Push both images to Docker Hub

### Phase 2: Cloud Deployment (On Your Cloud Server)

1. **Copy required files to your cloud server**:

   - `docker-compose.deploy.yml`
   - `.env` (with your cloud configuration)
   - `scripts/deploy-cloud.sh` or `scripts/deploy-cloud.ps1`
   - `scripts/stop-cloud.sh` or `scripts/stop-cloud.ps1`

2. **On your cloud server, run the deployment script**:

   **Linux/Unix**:

   ```bash
   chmod +x scripts/deploy-cloud.sh scripts/stop-cloud.sh
   ./scripts/deploy-cloud.sh
   ```

   **Windows**:

   ```powershell
   .\scripts\deploy-cloud.ps1
   ```

3. **Verify deployment**:
   The script will automatically check service health and display URLs:
   ``` 
   ✅ Backend service is healthy
   ✅ Frontend service is healthy
   🎮 You can now access the quiz game at: http://68.183.185.16:3000
   ```

## Fixed Configuration Files

### Updated `.env` (Cloud Configuration)

```bash
# Cloud MongoDB Configuration
COMPOSE_PROFILES=cloud
ENVIRONMENT=production

# MongoDB Cloud Connection
MONGODB_URL=mongodb+srv://huyzerox:8jkiqfw8JHeBS8IO@cluster0.zqcsln0.mongodb.net/docker_quiz_game
DB_NAME=docker_quiz_game

# Redis Configuration (Cloud)
REDIS_HOST=redis-12199.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=12199
REDIS_PASSWORD=FvDtCHgoF1PRN48Lah1gcXe1nwRVTe6M
REDIS_DB=0

# Cache Configuration
CACHE_TTL=3600
QUESTIONS_CACHE_TTL=7200

# Admin Configuration
ADMIN_API_KEY=admin123

# Service Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000

# MongoDB Performance Settings
MONGODB_TIMEOUT=15000
MONGODB_POOL_SIZE=20

# Frontend Configuration (CRITICAL: Must match your cloud server IP)
VITE_BACKEND_URL=http://68.183.185.16:8000
```

### Key Fixes Applied

1. **Frontend API Configuration**: Updated to support runtime configuration injection
2. **Socket.io Configuration**: Now uses the correct backend URL from environment
3. **Build Process**: Always passes backend URL as build argument
4. **Docker Compose**: Properly configured for cloud deployment with pre-built images

## Troubleshooting

### 1. Frontend Shows "Network Error" or "ERR_CONNECTION_REFUSED"

**Cause**: Frontend is trying to connect to wrong backend URL

**Solution**:

1. Verify `VITE_BACKEND_URL` in `.env` matches your cloud server IP
2. Rebuild and push images with correct backend URL:
   ```powershell
   .\scripts\build_push.ps1 -BackendUrl "http://68.183.185.16:8000"
   ```
3. Redeploy on cloud server

### 2. WebSocket Connection Failed

**Cause**: Socket.io trying to connect to localhost instead of cloud server

**Solution**: Same as above - ensure backend URL is correct in build process

### 3. Backend Health Check Fails

**Cause**: Database connection issues

**Solution**:

1. Verify MongoDB and Redis credentials in `.env`
2. Check logs: `docker-compose -f docker-compose.deploy.yml --profile cloud logs backend`

## File Structure

```
docker-minigames/
├── docker-compose.yml              # Local development
├── docker-compose.deploy.yml       # Cloud production
├── .env                            # Cloud configuration
├── .env.local                      # Local configuration
├── DEPLOY_GUIDE.md                 # This guide
├── scripts/
│   ├── build_push.ps1             # Build and push (local)
│   ├── deploy-cloud.ps1           # Deploy (cloud Windows)
│   ├── deploy-cloud.sh            # Deploy (cloud Linux)
│   ├── stop-cloud.ps1             # Stop (cloud Windows)
│   └── stop-cloud.sh              # Stop (cloud Linux)
├── frontend/
│   ├── Dockerfile
│   ├── entrypoint-runtime.sh      # Runtime config injection
│   └── src/
│       ├── services/api.ts        # Fixed API configuration
│       └── contexts/SocketContext.tsx # Fixed Socket configuration
└── backend/
    └── Dockerfile
```

## What's Different Now

### Before (Broken):

- Frontend hardcoded to localhost:8000
- No runtime configuration support
- Build process didn't pass backend URL consistently
- Socket.io connections failed in cloud

### After (Fixed):

- Frontend supports runtime configuration injection
- Build process always passes correct backend URL
- Socket.io uses configurable backend URL
- Simple one-command cloud deployment
- Comprehensive health checks and error reporting

## Success Criteria

After following this guide, you should have:

1. ✅ Frontend loads without errors at `http://68.183.185.16:3000`
2. ✅ Backend API accessible at `http://68.183.185.16:8000`
3. ✅ WebSocket connections working (real-time features)
4. ✅ Leaderboard accessible without network errors
5. ✅ All health endpoints returning 200 OK

## Quick Commands Reference

**Local (Development Machine)**:

```powershell
# Build and push images
.\scripts\build_push.ps1 -BackendUrl "http://68.183.185.16:8000"
```

**Cloud (Production Server)**:

```bash
# Deploy
./scripts/deploy-cloud.sh

# Stop
./scripts/stop-cloud.sh

# View logs
docker-compose -f docker-compose.deploy.yml --profile cloud logs -f

# Check status
docker-compose -f docker-compose.deploy.yml --profile cloud ps
```

The cloud deployment process is now extremely simple - just run one script and everything is handled automatically!
