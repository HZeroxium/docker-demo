# Microservices Demo with Docker

This project demonstrates a comprehensive microservices architecture using:

- **User Service**: NestJS (TypeScript) with GraphQL, gRPC, and REST
- **Todo Service**: FastAPI (Python) with GraphQL and REST
- **Frontend**: Next.js with Material-UI
- **API Gateway**: Kong
- **Message Broker**: RabbitMQ
- **Databases**: MongoDB (separate instances)
- **Observability**: Prometheus, Grafana, Kibana, Zipkin

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
- **Todo Service Direct**: http://localhost:8001

### APIs and GraphQL

- **User GraphQL Playground**: http://localhost:3001/graphql
- **Todo GraphQL Playground**: http://localhost:8001/graphql
- **User REST API**: http://localhost:8000/users
- **Todo REST API**: http://localhost:8000/todos

### Management UIs

- **Kong Admin**: http://localhost:8001
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Kibana**: http://localhost:5601
- **Zipkin**: http://localhost:9411

## API Examples

### REST API Examples

#### Users

```bash
# Create user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"user"}'

# Get users
curl http://localhost:8000/users?page=1&limit=10

# Get user by ID
curl http://localhost:8000/users/{user_id}

# Update user
curl -X PUT http://localhost:8000/users/{user_id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","isActive":true}'

# Delete user
curl -X DELETE http://localhost:8000/users/{user_id}
```

#### Todos

```bash
# Create todo
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Docker","description":"Complete microservices demo","priority":"high","user_id":"user_id_here"}'

# Get todos
curl http://localhost:8000/todos?page=1&limit=10

# Toggle todo completion
curl -X PATCH http://localhost:8000/todos/{todo_id}/toggle

# Update todo
curl -X PUT http://localhost:8000/todos/{todo_id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","completed":true}'
```

### GraphQL Examples

#### User Service GraphQL

```graphql
# Create User
mutation CreateUser {
  createUser(
    createUserInput: {
      email: "graphql@example.com"
      password: "password123"
      name: "GraphQL User"
      role: user
    }
  ) {
    id
    email
    name
    role
    createdAt
  }
}

# Get Users
query GetUsers {
  users(getUsersInput: { page: 1, limit: 5 }) {
    users {
      id
      email
      name
      role
      isActive
    }
    total
    page
    limit
  }
}

# Get User Stats
query GetUserStats {
  userStats {
    total
    active
    inactive
    byRole
  }
}
```

#### Todo Service GraphQL

```graphql
# Create Todo
mutation CreateTodo {
  createTodo(
    todo: {
      title: "GraphQL Todo"
      description: "Created via GraphQL"
      priority: "medium"
      userId: "user_id_here"
    }
  ) {
    id
    title
    completed
    priority
    createdAt
  }
}

# Get Todos
query GetTodos {
  todos(page: 1, limit: 10) {
    id
    title
    description
    completed
    priority
    dueDate
    createdAt
  }
}
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
├── Kibana (logs)
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
