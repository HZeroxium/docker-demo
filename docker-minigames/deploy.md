# Production Deployment Guide

## Table of Contents

1. [Cloud VM Setup](#cloud-vm-setup)
2. [Docker Installation](#docker-installation)
3. [Application Deployment](#application-deployment)
4. [Management Scripts](#management-scripts)
5. [Monitoring & Logs](#monitoring--logs)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

## Cloud VM Setup

### Minimum System Requirements

- **OS**: Ubuntu 22.04 LTS or CentOS 8+
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: Public IP with ports 80, 443, 22 open

### Initial VM Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip vim htop

# Create application user
sudo useradd -m -s /bin/bash quizapp
sudo usermod -aG sudo quizapp

# Set up SSH key-based authentication (recommended)
sudo mkdir -p /home/quizapp/.ssh
sudo chmod 700 /home/quizapp/.ssh
# Copy your public key to /home/quizapp/.ssh/authorized_keys
sudo chown -R quizapp:quizapp /home/quizapp/.ssh

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8000/tcp  # Backend
```

## Docker Installation

### Install Docker Engine

```bash
# Switch to application user
sudo su - quizapp

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker quizapp

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
sudo su - quizapp
```

## Application Deployment

### 1. Clone Repository

```bash
# Clone your repository
git clone <your-repository-url> docker-quiz-game
cd docker-quiz-game

# Or upload files manually
mkdir -p docker-quiz-game
cd docker-quiz-game
# Upload your project files here
```

### 2. Configure Environment

```bash
# Copy production environment
cp .env.cloud .env

# Edit environment variables for production
nano .env
```

**Important Environment Variables to Update:**

```bash
# MongoDB Atlas Connection
MONGODB_URL=<your-mongodb-connection-string>

# Redis Cloud Connection
REDIS_HOST=<your-redis-host>
REDIS_PORT=<your-redis-port>
REDIS_PASSWORD=<your-redis-password>

# Production ports
FRONTEND_PORT=3000
BACKEND_PORT=8000

# Secure admin key
ADMIN_API_KEY=your-super-secure-production-key-here
```

### 3. Deploy Application

```bash
# Make deployment scripts executable
chmod +x scripts/*.sh

# Deploy with cloud profile
./scripts/deploy-production.sh

# Or manually
docker-compose --profile cloud up -d --build
```

## Management Scripts

The following scripts are available for easy management:

```bash
# Start application
./scripts/start-production.sh

# Stop application
./scripts/stop-production.sh

# Restart application
./scripts/restart-production.sh

# View logs
./scripts/logs.sh

# Update application
./scripts/update-production.sh

# Backup data (if needed)
./scripts/backup.sh
```

## Monitoring & Logs

### Real-time Monitoring

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Monitor system resources
htop

# Monitor Docker stats
docker stats
```

### Health Checks

```bash
# Check service status
docker-compose ps

# Test application endpoints
curl -f http://localhost:3000/health
curl -f http://localhost:8000/health

# Check service connectivity
docker-compose exec backend curl -f http://localhost:8000/health
```

### Log Management

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/docker-quiz

# Add this configuration:
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

# Configure Docker daemon logging
sudo nano /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

sudo systemctl restart docker
```

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check container logs
docker-compose logs <service-name>

# Restart Docker daemon
sudo systemctl restart docker
```

#### 2. Database Connection Issues

```bash
# Test MongoDB connection
mongo "mongodb+srv://your-connection-string"

# Test Redis connection
redis-cli -h your-redis-host -p your-port -a your-password ping
```

#### 3. Network Issues

```bash
# Check firewall
sudo ufw status

# Check Docker networks
docker network ls
docker network inspect docker-quiz-network
```

#### 4. Resource Issues

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Clean Docker resources
docker system prune -f
docker volume prune -f
```

### Emergency Recovery

```bash
# Complete application restart
./scripts/emergency-restart.sh

# Or manually
docker-compose down
docker system prune -f
docker-compose --profile cloud up -d --build
```

## Maintenance

### Regular Maintenance Tasks

#### Daily

```bash
# Check service health
./scripts/health-check.sh

# Monitor logs for errors
docker-compose logs --tail=100
```

#### Weekly

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean Docker resources
docker system prune -f

# Restart services (if needed)
./scripts/restart-production.sh
```

#### Monthly

```bash
# Update Docker and Docker Compose
sudo apt update docker-ce docker-ce-cli containerd.io
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Review and rotate logs
sudo logrotate -f /etc/logrotate.d/docker-quiz
```

### Scaling Considerations

For production scaling, consider:

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple Instances**: Deploy on multiple VMs
3. **Container Orchestration**: Consider Kubernetes for larger deployments
4. **Monitoring**: Implement Prometheus + Grafana
5. **CI/CD**: Set up automated deployments

### Security Best Practices

```bash
# Regular security updates
sudo apt update && sudo apt upgrade -y

# Monitor failed login attempts
sudo journalctl -u ssh -f

# Use fail2ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Regular backup of configurations
./scripts/backup-configs.sh
```

### Performance Optimization

```bash
# Monitor application performance
docker stats

# Optimize Docker images
docker image prune -f

# Monitor database performance
# Check MongoDB Atlas metrics
# Check Redis Cloud metrics

# Tune container resources if needed
# Edit docker-compose.yml to add resource limits
```

## Quick Reference Commands

```bash
# Application Management
./scripts/start-production.sh     # Start application
./scripts/stop-production.sh      # Stop application
./scripts/restart-production.sh   # Restart application
./scripts/status.sh              # Check status

# Monitoring
./scripts/logs.sh                # View logs
./scripts/health-check.sh        # Health check
docker stats                     # Resource usage

# Maintenance
./scripts/update-production.sh   # Update application
docker system prune -f          # Clean resources
sudo systemctl restart docker   # Restart Docker
```

## Support & Contacts

- **Application Logs**: `/var/log/docker-quiz/`
- **Docker Logs**: `docker-compose logs`
- **System Logs**: `journalctl -u docker`
- **Health Endpoints**:
  - Frontend: `http://your-vm-ip:3000/health`
  - Backend: `http://your-vm-ip:8000/health`
