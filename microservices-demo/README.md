# Microservices Demo with Docker

This project demonstrates a comprehensive microservices architecture using:

- **User Service**: NestJS (TypeScript) with GraphQL, gRPC, and REST
- **Todo Service**: FastAPI (Python) with GraphQL and REST
- **Frontend**: Next.js with Material-UI
- **API Gateway**: Kong
- **Message Broker**: RabbitMQ
- **Databases**: MongoDB (separate instances)
- **Observability**: Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana), Zipkin

## Quick Start

1. **Start all services**:

```bash
docker-compose up -d
```

2. **Check service status**:

```bash
docker-compose ps
```

3. **View logs**:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f todo-service
docker-compose logs -f logstash
```

4. **Stop all services**:

```bash
docker-compose down
```

5. **Rebuild and restart**:

```bash
docker-compose down
docker-compose up --build -d
```

## Service URLs

### Core Services

- **Frontend Dashboard**: http://localhost:3000
- **API Gateway (Kong)**: http://localhost:8000
- **User Service Direct**: http://localhost:3001
- **Todo Service Direct**: http://localhost:8002

### APIs and GraphQL

- **User GraphQL Playground**: http://localhost:3001/graphql
- **Todo GraphQL Playground**: http://localhost:8002/graphql
- **User REST API**: http://localhost:8000/users
- **Todo REST API**: http://localhost:8000/todos

### Management UIs

- **Kong Admin**: http://localhost:8001
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin)
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200
- **Logstash API**: http://localhost:9600
- **Zipkin**: http://localhost:9411

## ELK Stack & Observability Setup

### Initial Setup Commands

```bash
# Clean up any orphaned containers first
docker-compose down --remove-orphans

# Start with increased memory allocation (recommended: 8GB+ for Docker)
docker-compose up -d

# Wait for Elasticsearch to be healthy (can take 2-3 minutes)
docker-compose logs -f elasticsearch

# Check all services status
docker-compose ps
```

### Elasticsearch Configuration

The Elasticsearch service requires:

- **Memory**: At least 1GB heap size (configured)
- **Virtual Memory**: vm.max_map_count ≥ 262144

**For Windows/Mac Docker Desktop:**

```bash
# Check current setting
docker run --rm -it alpine sysctl vm.max_map_count

# If less than 262144, increase it:
# Windows: Set in Docker Desktop settings or use WSL2
wsl -d docker-desktop sysctl -w vm.max_map_count=262144
```

**For Linux:**

```bash
sudo sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
```

### Service Integration Requirements

#### For User Service (NestJS)

Add to your NestJS service:

1. **Install required packages:**

```bash
npm install @nestjs/prometheus prom-client winston winston-elasticsearch
```

2. **Add structured logging configuration**
3. **Add Prometheus metrics endpoint**
4. **Add health check endpoint**

#### For Todo Service (FastAPI)

Add to your FastAPI service:

1. **Install required packages:**

```bash
pip install prometheus-client python-json-logger elasticsearch
```

2. **Add structured logging configuration**
3. **Add Prometheus metrics endpoint**
4. **Add health check endpoint**

### Kibana Dashboard Setup

1. Navigate to http://localhost:5601
2. Go to **Stack Management > Index Patterns**
3. Create index pattern: `microservices-logs-*`
4. Set time field: `@timestamp`
5. Go to **Discover** to view logs

### Common Log Queries in Kibana

```
# Error logs
level:ERROR

# Service-specific logs
service_name:user-service

# HTTP requests with slow response
response_time:>1000

# Failed HTTP requests
response_status:>=400
```

### Grafana Dashboard Setup

1. Navigate to http://localhost:3002 (admin/admin)
2. Datasources are pre-configured
3. Import dashboards for microservices monitoring
4. Create alerts for service health

### Troubleshooting ELK Stack

```bash
# Check Elasticsearch health
curl http://localhost:9200/_cluster/health?pretty

# Check if indices are created
curl http://localhost:9200/_cat/indices?v

# Check Logstash pipeline status
curl http://localhost:9600/_node/stats/pipeline?pretty

# View Filebeat logs
docker-compose logs filebeat

# Restart observability stack only
docker-compose restart elasticsearch logstash kibana filebeat
```

## Logging and Monitoring

### ELK Stack Setup

The observability stack includes:

1. **Elasticsearch**: Stores and indexes logs
2. **Logstash**: Processes and transforms logs from services
3. **Kibana**: Visualizes logs and creates dashboards
4. **Filebeat**: Collects Docker container logs

### Log Formats

Services use structured logging:

```bash
# View live logs from all services
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service
docker-compose logs -f todo-service
docker-compose logs -f kong-gateway
docker-compose logs -f logstash

# Check Logstash processing
curl http://localhost:9600/_node/stats
```

### Kibana Dashboards

1. **Access Kibana**: http://localhost:5601
2. **Create Index Pattern**: `microservices-logs-*`
3. **Sample Queries**:
   - All errors: `level:ERROR`
   - User service logs: `service_name:user-service`
   - HTTP requests: `http_method:*`
   - Slow responses: `response_time:>1000`

### Log Analysis Examples

```bash
# Search logs in Elasticsearch directly
curl -X GET "localhost:9200/microservices-logs-*/_search?q=level:ERROR&pretty"

# Get log statistics
curl -X GET "localhost:9200/microservices-logs-*/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{"aggs": {"services": {"terms": {"field": "service_name"}}}}'

# Monitor Logstash pipeline
curl -X GET "localhost:9600/_node/stats/pipeline?pretty"
```

## Architecture Overview

```
Frontend (Next.js) → Kong API Gateway → Microservices
                                      ├── User Service (NestJS/TypeScript)
                                      └── Todo Service (FastAPI/Python)

Message Broker (RabbitMQ) ← → Services communicate via events

Databases:
├── User MongoDB (user_db)
└── Todo MongoDB (todos)

Observability:
├── Prometheus (metrics)
├── Grafana (dashboards)
├── ELK Stack (logs)
└── Zipkin (tracing)
```

## Development Tips

### Hot Reload Development

```bash
# Start only databases and message broker
docker-compose up -d user-mongo todo-mongo rabbitmq

# Run services locally with hot reload
cd services/user-service && npm run start:dev
cd services/todo-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000
cd services/frontend && npm run dev
```

### Database Management

```bash
# Connect to user database
docker exec -it user-mongo mongosh user_db

# Connect to todo database
docker exec -it todo-mongo mongosh todos

# View database contents
show collections
db.users.find()
db.items.find()
```

### Service Communication Testing

```bash
# Test gRPC services (requires grpcurl)
grpcurl -plaintext localhost:50051 users.UserService/GetUsers
grpcurl -plaintext localhost:50052 todos.TodoService/GetTodos

# Test RabbitMQ messages
docker exec -it rabbitmq rabbitmqctl list_queues
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, 8000, 8001, 5601, 9200 are available
2. **MongoDB connection**: Wait for health checks to pass before services start
3. **Memory issues**: Ensure Docker has enough allocated memory (6GB+ recommended for ELK)
4. **Elasticsearch startup**: May take 60-90 seconds on first run
5. **Logstash processing**: Check pipeline stats if logs aren't appearing

### Health Checks

```bash
# Check all service health
curl http://localhost:3001/health  # User service
curl http://localhost:8002/health  # Todo service
curl http://localhost:8000/        # Kong gateway
curl http://localhost:9200/_health # Elasticsearch
curl http://localhost:9600/_node/stats # Logstash
```

### ELK Stack Troubleshooting

```bash
# Check Elasticsearch cluster health
curl http://localhost:9200/_cluster/health?pretty

# Check available indices
curl http://localhost:9200/_cat/indices?v

# Check Logstash pipeline status
curl http://localhost:9600/_node/stats/pipeline?pretty

# View Filebeat status
docker-compose exec filebeat filebeat test output
```

### Reset Everything

```bash
docker-compose down -v  # Remove volumes too
docker system prune -a  # Clean up Docker
docker-compose up --build -d
```

## Performance Considerations

- **Elasticsearch**: Allocate at least 2GB RAM
- **Logstash**: Configured with 256MB heap size
- **Log Retention**: Logs rotate daily, configure retention policy as needed
- **Index Management**: Consider implementing ILM (Index Lifecycle Management) for production

```bash
# Connect to user database
docker exec -it user-mongo mongosh user_db

# Connect to todo database
docker exec -it todo-mongo mongosh todos

# View database contents
show collections
db.users.find()
db.items.find()
```

### Service Communication Testing

```bash
# Test gRPC services (requires grpcurl)
grpcurl -plaintext localhost:50051 users.UserService/GetUsers
grpcurl -plaintext localhost:50052 todos.TodoService/GetTodos

# Test RabbitMQ messages
docker exec -it rabbitmq rabbitmqctl list_queues
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, 8000, 8001 are available
2. **MongoDB connection**: Wait for health checks to pass before services start
3. **Memory issues**: Ensure Docker has enough allocated memory (4GB+ recommended)

### Health Checks

```bash
# Check all service health
curl http://localhost:3001/health  # User service
curl http://localhost:8001/health  # Todo service
curl http://localhost:8000/        # Kong gateway
```

### Reset Everything

```bash
docker-compose down -v  # Remove volumes too
docker system prune -a  # Clean up Docker
docker-compose up --build -d
```
