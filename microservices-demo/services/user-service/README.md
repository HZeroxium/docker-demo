<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# User Service

A comprehensive NestJS microservice implementing user management with multiple communication protocols: GraphQL, gRPC, and REST API, along with RabbitMQ messaging integration.

## Features

- **Multiple Communication Protocols**:

  - REST API endpoints
  - GraphQL API with playground
  - gRPC service
  - RabbitMQ messaging

- **User Management**:

  - Create, read, update, delete users
  - User authentication and validation
  - Role-based access (admin, user, moderator)
  - User statistics and analytics

- **Database**:

  - MongoDB with Mongoose ODM
  - Indexed fields for performance
  - Data validation and sanitization

- **Security**:
  - Password hashing with bcrypt
  - Input validation with class-validator
  - CORS enabled

## API Endpoints

### REST API (Port 3001)

- `GET /` - Service health check
- `GET /health` - Detailed health status
- `GET /metrics` - Prometheus metrics endpoint
- `POST /users` - Create user
- `GET /users` - Get users with pagination and filtering
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/validate` - Validate user credentials
- `GET /users/stats/overview` - Get user statistics

### GraphQL API (Port 3001/graphql)

#### Queries

```graphql
query GetUsers($getUsersInput: GetUsersDto) {
  users(getUsersInput: $getUsersInput) {
    users {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
    total
    page
    limit
  }
}

query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    name
    role
    isActive
    createdAt
    updatedAt
  }
}

query ValidateUser($validateUserInput: ValidateUserDto!) {
  validateUser(validateUserInput: $validateUserInput) {
    isValid
    message
    user {
      id
      email
      name
      role
    }
  }
}

query GetUserStats {
  userStats {
    total
    active
    inactive
    byRole
  }
}
```

#### Mutations

```graphql
mutation CreateUser($createUserInput: CreateUserDto!) {
  createUser(createUserInput: $createUserInput) {
    id
    email
    name
    role
    isActive
    createdAt
    updatedAt
  }
}

mutation UpdateUser($id: ID!, $updateUserInput: UpdateUserDto!) {
  updateUser(id: $id, updateUserInput: $updateUserInput) {
    id
    email
    name
    role
    isActive
    updatedAt
  }
}

mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

### gRPC Service (Port 50051)

Available methods:

- `CreateUser`
- `GetUser`
- `GetUsers`
- `UpdateUser`
- `DeleteUser`
- `ValidateUser`

## Development

### Prerequisites

- Node.js 18+
- MongoDB
- RabbitMQ
- Docker & Docker Compose

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Start in development mode:

```bash
npm run start:dev
```

3. Build for production:

```bash
npm run build
npm run start:prod
```

### Docker Development

1. Build and start services:

```bash
docker-compose up --build user-service
```

2. View logs:

```bash
docker-compose logs -f user-service
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## Environment Variables

- `MONGODB_URL` - MongoDB connection string (default: mongodb://user-mongo:27017/user_db)
- `RABBITMQ_URL` - RabbitMQ connection string (default: amqp://guest:guest@rabbitmq:5672/)
- `NODE_ENV` - Environment (development/production)

## Sample Users

The service comes with pre-seeded users:

1. **Admin User**:

   - Email: admin@example.com
   - Password: admin123
   - Role: admin

2. **Regular User**:

   - Email: user@example.com
   - Password: user123
   - Role: user

3. **Moderator**:
   - Email: moderator@example.com
   - Password: mod123
   - Role: moderator
