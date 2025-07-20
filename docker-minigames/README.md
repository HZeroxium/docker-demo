# Docker Quiz Game

A containerized quiz game application with React frontend, FastAPI backend, and MongoDB database.

## Quick Start

### Local Development with MongoDB Container

```bash
# Use local MongoDB container
docker-compose --profile local-dev up --build

# Or for production-like local setup
docker-compose --profile local up --build
```

### Cloud MongoDB (Atlas/External)

```bash
# Update .env.cloud with your MongoDB connection string
docker-compose --profile cloud up --build
```

## Configuration Profiles

### 1. Local Development (`local-dev`)

- Uses containerized MongoDB
- Development environment with hot reload
- Relaxed timeout settings

```bash
# Copy and edit environment file
cp .env.dev .env
docker-compose --profile local-dev up --build
```

### 2. Local Production (`local`)

- Uses containerized MongoDB
- Production-like settings
- No hot reload

```bash
# Copy and edit environment file
cp .env.local .env
docker-compose --profile local up --build
```

### 3. Cloud MongoDB (`cloud`)

- Uses external MongoDB (Atlas, etc.)
- No local MongoDB container
- Production settings

```bash
# Copy and edit environment file
cp .env.cloud .env
# Update MONGODB_URL with your connection string
docker-compose --profile cloud up --build
```

## Environment Files

- `.env` - Default configuration (currently set to local-dev)
- `.env.local` - Local MongoDB with production settings
- `.env.dev` - Local MongoDB with development settings
- `.env.cloud` - External MongoDB configuration

## Troubleshooting

### Frontend "host not found in upstream" Error

**Symptoms**:

```bash
nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:1
```

**Root Cause**: Service name resolution issues between frontend and backend containers.

**Solutions**:

1. **Ensure consistent service naming**: Backend service is now unified across all profiles
2. **Check network connectivity**: All services use the same Docker network
3. **Verify service health**: Backend must be healthy before frontend starts
4. **DNS resolution**: Docker's internal DNS resolves service names to container IPs

### Connection Refused Error

If you see `Connection refused` errors:

1. **Check Profile**: Ensure you're using the correct profile
2. **MongoDB URL**: For local profiles, use `mongodb://admin:password@mongodb:27017/dbname`
3. **Service Dependencies**: Make sure MongoDB container is healthy before backend starts
4. **Health Checks**: Wait for services to pass health checks before making requests

### MongoDB Atlas Connection

For MongoDB Atlas:

```bash
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Common Issues**:

- Whitelist your IP address in MongoDB Atlas
- Ensure connection string includes authentication credentials
- Check network access settings in Atlas dashboard

## Services

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:8000>
- **MongoDB**: <http://localhost:27017> (local profiles only)

## Architecture Benefits

1. **Unified Service Names**: Single backend service across all profiles eliminates confusion
2. **Conditional Dependencies**: MongoDB dependency only applies when container is available
3. **Robust Nginx Configuration**: Upstream blocks with proper error handling and timeouts
4. **Health Check Integration**: Services start only when dependencies are healthy
5. **Network Isolation**: All services communicate through dedicated Docker network

## Commands

```bash
# Start with specific profile
docker-compose --profile <profile-name> up --build

# View logs
docker-compose logs -f <service-name>

# Stop services
docker-compose down

# Remove all data
docker-compose down -v
```

## 🚀 Quick Start

### Option 1: Using Make Commands (Recommended)

```bash
# Start with local MongoDB container
make local

# Start with cloud MongoDB
make cloud

# Start development environment
make dev

# Stop all services
make stop

# Clean up everything
make clean
```

### Option 2: Using Scripts

```bash
# Local MongoDB
./scripts/start-local.sh

# Cloud MongoDB
./scripts/start-cloud.sh

# Development
./scripts/start-dev.sh
```

### Option 3: Direct Docker Compose

```bash
# Local MongoDB
cp .env.local .env && docker-compose --profile local up

# Cloud MongoDB
cp .env.cloud .env && docker-compose --profile cloud up

# Development
cp .env.dev .env && docker-compose --profile local-dev up
```

## 🗄️ Database Configuration

### Local MongoDB

- **Profile**: `local` or `local-dev`
- **Container**: Automatically started
- **Connection**: `mongodb://admin:password123@mongodb:27017/docker_quiz_game`
- **Management**: Direct container access

### Cloud MongoDB

- **Profile**: `cloud`
- **Container**: None (external database)
- **Connection**: Configure in `.env.cloud`
- **Examples**: MongoDB Atlas, AWS DocumentDB, etc.

## 🔧 Environment Files

- `.env.local` - Local MongoDB container setup
- `.env.cloud` - Cloud MongoDB configuration
- `.env.dev` - Development environment
- `.env` - Active configuration (auto-generated)

## 📊 Service Access

- **Frontend**: <http://localhost:3000>
- **Backend**: <http://localhost:8000>
- **MongoDB** (local only): <http://localhost:27017>

## 🏗️ Architecture Benefits

1. **Flexible Deployment**: Easy switching between local/cloud databases
2. **Environment Isolation**: Separate configurations for different environments
3. **Resource Optimization**: Optional MongoDB container reduces resource usage
4. **Development Friendly**: Hot reload and development-specific settings
5. **Production Ready**: Cloud-optimized configurations
6. **Service Discovery**: Robust DNS resolution and upstream configuration
7. **Health Check Integration**: Cascading health checks ensure proper startup order
