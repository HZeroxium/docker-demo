# Microservices Demo with Docker

This project demonstrates a comprehensive microservices architecture using modern technologies and best practices for observability, monitoring, and distributed systems.

## 🏗️ Architecture Overview

### Core Services

- **User Service**: NestJS (TypeScript) with GraphQL, gRPC, and REST APIs
- **Todo Service**: FastAPI (Python) with GraphQL and REST APIs
- **Frontend**: Next.js with Material-UI for modern web interface
- **API Gateway**: Kong for unified API management and routing

### Infrastructure Components

- **Message Broker**: RabbitMQ for asynchronous communication
- **Databases**: MongoDB (separate instances for each service)
- **Observability Stack**:
  - Prometheus (metrics collection)
  - Grafana (visualization and dashboards)
  - ELK Stack (Elasticsearch, Logstash, Kibana for logging)
  - Zipkin (distributed tracing)

## 🚀 Quick Start

### Prerequisites

- Docker Desktop with 8GB+ RAM allocated
- Docker Compose v3.8+
- Available ports: 3000, 3001, 5601, 8000, 8001, 8002, 9090, 9200, 9411

### System Requirements

For optimal performance, ensure your system has:

- **Memory**: Minimum 8GB RAM, 12GB+ recommended
- **Storage**: At least 10GB free space
- **CPU**: 4+ cores recommended

### Initial Setup

1. **Clone and navigate to the project**:

   ```bash
   git clone <repository-url>
   cd microservices-demo
   ```

2. **Configure system settings (Linux/WSL)**:

   ```bash
   # Increase virtual memory map count for Elasticsearch
   sudo sysctl -w vm.max_map_count=262144
   echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
   ```

3. **Start all services**:

   ```bash
   docker-compose up -d
   ```

4. **Monitor startup progress**:

   ```bash
   # Check service status
   docker-compose ps

   # Follow logs for troubleshooting
   docker-compose logs -f elasticsearch
   docker-compose logs -f logstash
   ```

5. **Verify services are healthy**:

   ```bash
   # Wait 2-3 minutes for Elasticsearch to initialize
   curl <http://localhost:9200/_cluster/health>

   # Check Logstash pipeline
   curl <http://localhost:9600/_node/stats>
   ```

## 🌐 Service URLs

### Core Application

- **Frontend Dashboard**: <http://localhost:3000>
- **API Gateway (Kong)**: <http://localhost:8000>
- **User Service Direct**: <http://localhost:3001>
- **Todo Service Direct**: <http://localhost:8002>

### API Endpoints

- **User GraphQL Playground**: <http://localhost:3001/graphql>
- **Todo GraphQL Playground**: <http://localhost:8002/graphql>
- **User REST API**: <http://localhost:8000/users>
- **Todo REST API**: <http://localhost:8000/todos>

### Management Interfaces

- **Kong Admin API**: <http://localhost:8001>
- **RabbitMQ Management**: <http://localhost:15672> (guest/guest)
- **Prometheus Metrics**: <http://localhost:9090>
- **Grafana Dashboards**: <http://localhost:3002> (admin/admin123)
- **Kibana Logs**: <http://localhost:5601>
- **Elasticsearch API**: <http://localhost:9200>
- **Logstash API**: <http://localhost:9600>
- **Zipkin Tracing**: <http://localhost:9411>

## 📊 Observability Setup

### ELK Stack Configuration

The logging pipeline follows this flow:
**Docker Containers** → **Filebeat** → **Logstash** → **Elasticsearch** → **Kibana**

#### Initial Configuration Steps

1. **Wait for Elasticsearch to be healthy** (2-3 minutes on first start):

   ```bash
   # Monitor Elasticsearch startup
   docker-compose logs -f elasticsearch

   # Check cluster health
   curl <http://localhost:9200/_cluster/health?pretty>
   ```

2. **Verify Logstash pipeline**:

   ```bash
   # Check pipeline statistics
   curl <http://localhost:9600/_node/stats/pipeline?pretty>

   # Monitor processing
   docker-compose logs -f logstash
   ```

3. **Configure Kibana Index Patterns**:
   - Navigate to <http://localhost:5601>
   - Go to **Stack Management** → **Index Patterns**
   - Create pattern: `microservices-logs-*`
   - Set time field: `@timestamp`
   - Click **Create index pattern**

#### Viewing Logs in Kibana

1. **Access Discover tab** in Kibana
2. **Use these sample queries**:

   ```text
   # View all error logs
   log_level:ERROR

   # Service-specific logs
   service_name:"user-service"

   # HTTP request logs with slow responses
   response_time:>1000 AND http_method:*

   # Failed HTTP requests
   http_status:>=400

   # Recent database operations
   log_message:"database" AND @timestamp:>now-1h
   ```

3. **Create visualizations**:
   - Go to **Visualize Library** → **Create visualization**
   - Choose chart type (Line, Bar, Pie, etc.)
   - Configure aggregations and filters

### Prometheus & Grafana Setup

#### Accessing Grafana

1. **Open Grafana**: <http://localhost:3002>
2. **Login**: admin / admin123
3. **Pre-configured dashboards**:
   - Microservices Overview
   - User Service Dashboard
   - Todo Service Dashboard

#### Key Metrics to Monitor

**User Service Metrics**:

```text
# Request rate
rate(http_requests_total{job="user-service"}[5m])

# Response time percentiles
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="user-service"}[5m]))

# Error rate
rate(http_requests_total{job="user-service",status=~"5.."}[5m]) / rate(http_requests_total{job="user-service"}[5m])

# Memory usage
process_resident_memory_bytes{job="user-service"}
```

**Todo Service Metrics**:

```text
# API endpoint performance
rate(http_requests_total{job="todo-service"}[5m])

# Database operations
rate(mongodb_op_counters_total{instance="todo-mongo:27017"}[5m])

# Python process metrics
rate(process_cpu_seconds_total{job="todo-service"}[5m])
```

#### Creating Custom Dashboards

1. **Navigate to Dashboards** → **New Dashboard**
2. **Add Panel** with these configurations:
   - **Data Source**: Prometheus
   - **Query**: Use PromQL expressions above
   - **Visualization**: Time series, Stat, Gauge, etc.
3. **Configure alerts** for critical metrics

### Distributed Tracing with Zipkin

1. **Access Zipkin UI**: <http://localhost:9411>
2. **View traces** for request flows across services
3. **Analyze performance** bottlenecks and dependencies

## 🛠️ Development Workflow

### Local Development with Hot Reload

```bash
# Start only infrastructure services
docker-compose up -d user-mongo todo-mongo rabbitmq elasticsearch

# Run services locally for development
cd services/user-service && npm run start:dev
cd services/todo-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000
cd services/frontend && npm run dev
```

### Service Testing

```bash
# Test REST APIs
curl -X GET <http://localhost:3001/users>
curl -X GET <http://localhost:8002/todos>

# Test through API Gateway
curl -X GET <http://localhost:8000/users>
curl -X GET <http://localhost:8000/todos>

# Test health endpoints
curl <http://localhost:3001/health>
curl <http://localhost:8002/health>
```

### Database Management

```bash
# Connect to User Service database
docker exec -it user-mongo mongosh user_db

# Connect to Todo Service database
docker exec -it todo-mongo mongosh todos

# Basic database operations
show collections
db.users.find().limit(5)
db.todos.find().limit(5)
```

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### 1. Elasticsearch Won't Start

**Problem**: Elasticsearch container exits with memory errors

**Solution**:

```bash
# Check Docker memory allocation (should be 8GB+)
docker system info | grep "Total Memory"

# Increase vm.max_map_count
sudo sysctl -w vm.max_map_count=262144

# For Windows/WSL
wsl -d docker-desktop sysctl -w vm.max_map_count=262144
```

#### 2. Logstash Pipeline Issues

**Problem**: Logs not appearing in Kibana

**Solutions**:

```bash
# Check Logstash pipeline status
curl <http://localhost:9600/_node/stats/pipeline?pretty>

# Verify Filebeat connection
docker-compose logs filebeat

# Check Elasticsearch indices
curl <http://localhost:9200/_cat/indices?v>

# Restart the observability stack
docker-compose restart elasticsearch logstash kibana filebeat
```

#### 3. Service Connection Issues

**Problem**: Services can't connect to databases or message broker

**Solutions**:

```bash
# Check service dependencies
docker-compose ps

# Verify network connectivity
docker-compose exec user-service ping user-mongo
docker-compose exec todo-service ping todo-mongo

# Check service logs
docker-compose logs user-service
docker-compose logs todo-service
```

#### 4. Port Conflicts

**Problem**: Ports already in use

**Solutions**:

```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :9200

# Kill processes using required ports
sudo lsof -t -i:3000 | xargs kill -9

# Or modify docker-compose.yml to use different ports
```

### Health Check Commands

```bash
# Check all service health
curl <http://localhost:3001/health>  # User service
curl <http://localhost:8002/health>  # Todo service
curl <http://localhost:8000/>        # Kong gateway
curl <http://localhost:9200/_health> # Elasticsearch
curl <http://localhost:9600/_node/stats> # Logstash

# Check service discovery
docker-compose exec kong kong health
docker-compose exec rabbitmq rabbitmqctl status
```

### Complete Reset

If you encounter persistent issues:

```bash
# Stop all services and remove volumes
docker-compose down -v

# Clean up Docker system
docker system prune -a --volumes

# Remove all project-related containers and images
docker-compose down --rmi all --volumes --remove-orphans

# Restart fresh
docker-compose up --build -d
```

## 📈 Performance Optimization

### Resource Allocation

**Recommended Docker Desktop Settings**:

- **Memory**: 12GB
- **Swap**: 2GB
- **Disk**: 100GB

**Service-specific Tuning**:

```yaml
# Elasticsearch (in docker-compose.yml)
environment:
  - "ES_JAVA_OPTS=-Xms2g -Xmx2g"  # Increase for production

# Logstash
environment:
  - "LS_JAVA_OPTS=-Xmx1g -Xms1g"

# Application services
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

### Monitoring Performance

```bash
# Monitor container resource usage
docker stats

# Check disk usage
docker system df

# Monitor log sizes
du -sh /var/lib/docker/containers/*/*-json.log
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Change default passwords (Grafana, RabbitMQ)
- [ ] Enable authentication for Elasticsearch/Kibana
- [ ] Configure Kong rate limiting and authentication
- [ ] Use secrets management for sensitive data
- [ ] Enable TLS/SSL for all communications
- [ ] Implement proper network segmentation
- [ ] Configure log retention policies
- [ ] Set up backup strategies for databases

### Basic Security Setup

```bash
# Generate strong passwords
openssl rand -base64 32

# Configure environment variables
cp .env.example .env
# Edit .env with your secure values
```

## 📚 Additional Resources

### Architecture Diagrams

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │────│ Kong Gateway│────│  Services   │
│  (Next.js)  │    │ (API Gateway)│    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                   ┌─────────────┐    ┌─────────────┐
                   │  RabbitMQ   │────│  MongoDB    │
                   │ (Messages)  │    │ (Databases) │
                   └─────────────┘    └─────────────┘
                                              │
                   ┌─────────────────────────────────┐
                   │      Observability Stack        │
                   │ Prometheus │ Grafana │ ELK │ Zipkin │
                   └─────────────────────────────────┘
```

### Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Migration Guide](https://kubernetes.io/docs/concepts/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [Observability Best Practices](https://opentelemetry.io/)

### Support and Contribution

For issues, feature requests, or contributions:

1. Check existing issues in the repository
2. Create detailed bug reports with logs
3. Follow the contribution guidelines
4. Submit pull requests for improvements

---

**Note**: This is a demonstration project. For production deployment, implement proper security measures, monitoring, and infrastructure as code practices.
