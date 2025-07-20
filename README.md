# Docker Demo Repository

A comprehensive Docker demonstration repository showcasing containerization patterns, microservices architecture, and modern development workflows across three distinct projects.

## 🏗️ Project Overview

This repository contains three Docker-focused demonstration projects, each highlighting different aspects of containerization and modern software architecture:

### 🎯 [Portfolio](./portfolio/) - Single Container NextJS Application

**Technology Stack**: NextJS 15.3.4, TypeScript, Tailwind CSS, Material-UI  
**Architecture**: Static site with multi-stage Docker builds  
**Focus**: Container fundamentals, image optimization, deployment strategies

**Key Features:**

- Multi-stage Dockerfile with Alpine Linux for minimal image size
- Production-ready containerization with security best practices
- Cross-platform deployment scripts (Bash & PowerShell)
- Interactive Docker commands reference guide
- Local development and cloud deployment workflows
- Health check implementations and monitoring

### 🎮 [Docker Minigames](./docker-minigames/) - Full-Stack Web Application

**Technology Stack**: React + Vite, FastAPI, MongoDB, Redis, Nginx  
**Architecture**: Multi-container application with docker-compose profiles  
**Focus**: Service orchestration, environment management, data persistence

**Key Features:**

- Profile-based deployments (local, local-dev, cloud)
- Containerized databases with persistent volumes
- Service health checks and dependency management
- Robust frontend proxy configuration with Nginx
- Makefile and script-based automation
- Environment-specific configurations

### 🔬 [Microservices Demo](./microservices-demo/) - Enterprise Microservices Platform

**Technology Stack**: NestJS, FastAPI, Next.js, Kong Gateway, MongoDB, RabbitMQ  
**Architecture**: Complete observability stack with distributed systems  
**Focus**: Production-grade microservices, monitoring, distributed tracing

**Key Features:**

- Full observability stack (ELK, Prometheus, Grafana, Zipkin)
- API Gateway with Kong for service routing
- Message-driven architecture with RabbitMQ
- Distributed tracing and performance monitoring
- gRPC and GraphQL API implementations
- Production-ready security and scaling considerations

## 🚀 Quick Start Guide

### Prerequisites

- **Docker Desktop** with 8GB+ RAM allocation
- **Docker Compose** v3.8+
- **Git** for cloning the repository
- **Node.js 18+** (for local development)

### System Requirements

- **Memory**: 8GB minimum, 12GB+ recommended for microservices demo
- **Storage**: 10GB+ free space
- **CPU**: 4+ cores recommended
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/HZeroxium/docker-demo.git
cd docker-demo

# Choose your demonstration project
cd portfolio           # Single container demo
cd docker-minigames    # Multi-container demo
cd microservices-demo  # Enterprise microservices demo
```

## 📋 Project Comparison

| Feature           | Portfolio           | Docker Minigames | Microservices Demo    |
| ----------------- | ------------------- | ---------------- | --------------------- |
| **Complexity**    | Beginner            | Intermediate     | Advanced              |
| **Containers**    | 1                   | 4                | 15+                   |
| **Database**      | None                | MongoDB + Redis  | MongoDB (3 instances) |
| **Networking**    | Single port         | Custom bridge    | Complex mesh          |
| **Monitoring**    | Basic health checks | Service health   | Full observability    |
| **Message Queue** | None                | None             | RabbitMQ              |
| **API Gateway**   | None                | None             | Kong                  |
| **Build Time**    | ~2 minutes          | ~5 minutes       | ~10 minutes           |
| **Memory Usage**  | ~100MB              | ~2GB             | ~6GB                  |

## 🛠️ Development Workflows

### Portfolio - Container Fundamentals

```bash
cd portfolio

# Local development with building
./scripts/start-local.sh     # Linux/Mac
.\scripts\start-local.ps1    # Windows

# Cloud deployment from registry
./scripts/start-cloud.sh     # Linux/Mac
.\scripts\start-cloud.ps1    # Windows

# Learn Docker commands interactively
./scripts/docker-commands.sh
```

### Docker Minigames - Service Orchestration

```bash
cd docker-minigames

# Quick start with local MongoDB
make local

# Development environment with hot reload
make dev

# Cloud deployment with external MongoDB
make cloud

# Manual docker-compose usage
docker-compose --profile local up --build
```

### Microservices Demo - Enterprise Architecture

```bash
cd microservices-demo

# Full stack deployment
docker-compose up --build -d

# Monitor startup progress
docker-compose logs -f elasticsearch

# Access observability tools
open http://localhost:5601    # Kibana
open http://localhost:3002    # Grafana
open http://localhost:9411    # Zipkin
```

## 🎯 Learning Path Recommendations

### 🟢 **Beginner**: Start with Portfolio

- Learn Docker fundamentals and single-container deployments
- Understand multi-stage builds and image optimization
- Practice with deployment scripts and health checks
- **Time Investment**: 2-4 hours

### 🟡 **Intermediate**: Progress to Docker Minigames

- Master docker-compose and service orchestration
- Learn about persistent volumes and networking
- Understand environment-based deployments
- **Time Investment**: 4-8 hours

### 🔴 **Advanced**: Tackle Microservices Demo

- Explore enterprise-grade microservices architecture
- Implement comprehensive observability and monitoring
- Learn distributed systems patterns and API gateways
- **Time Investment**: 1-2 days

## 📊 Service Access Points

### Portfolio Application

- **Frontend**: <http://localhost:3000>
- **Health Check**: <http://localhost:3000/api/health>

### Docker Minigames

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:8000>
- **API Documentation**: <http://localhost:8000/docs>
- **MongoDB**: <http://localhost:27017> (local profiles)
- **Redis**: <http://localhost:6379> (local profiles)

### Microservices Demo

- **Frontend Dashboard**: <http://localhost:3000>
- **API Gateway**: <http://localhost:8000>
- **User Service**: <http://localhost:3001>
- **Todo Service**: <http://localhost:8002>
- **Kong Admin**: <http://localhost:8001>
- **RabbitMQ Management**: <http://localhost:15672>
- **Prometheus**: <http://localhost:9090>
- **Grafana**: <http://localhost:3002>
- **Kibana**: <http://localhost:5601>
- **Zipkin**: <http://localhost:9411>

## 🔧 Troubleshooting & Support

### Common Issues

#### Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :3000
lsof -i :3000

# Kill conflicting processes
sudo lsof -t -i:3000 | xargs kill -9
```

#### Memory Issues (Microservices Demo)

```bash
# Increase vm.max_map_count for Elasticsearch
sudo sysctl -w vm.max_map_count=262144

# Check Docker memory allocation
docker system info | grep "Total Memory"
```

#### Docker System Cleanup

```bash
# Clean up all unused resources
docker system prune -a --volumes

# Remove all project containers and images
docker-compose down --rmi all --volumes --remove-orphans
```

### Performance Optimization

#### Resource Monitoring

```bash
# Monitor container resource usage
docker stats

# Check system disk usage
docker system df

# View container logs
docker-compose logs -f [service-name]
```

## 🏆 Best Practices Demonstrated

### 🐳 **Container Design**

- Multi-stage builds for optimized image sizes
- Non-root user execution for security
- Proper signal handling and graceful shutdowns
- Comprehensive health checks

### 🔄 **Service Orchestration**

- Dependency management with health checks
- Network isolation and service discovery
- Volume management for data persistence
- Environment-specific configurations

### 📊 **Observability**

- Structured logging with ELK stack
- Metrics collection with Prometheus
- Distributed tracing with Zipkin
- Custom dashboards with Grafana

### 🔒 **Security**

- Secrets management with environment variables
- Network segmentation and firewall rules
- Resource limits and quotas
- Image vulnerability scanning practices

## 📚 References

### 📖 **Official Documentation**

- [Docker Documentation](https://docs.docker.com/) - Complete Docker reference
- [Docker Compose Documentation](https://docs.docker.com/compose/) - Multi-container orchestration
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/) - Optimization guidelines
- [Docker Security](https://docs.docker.com/engine/security/) - Security best practices

### 🏗️ **Architecture & Patterns**

- [Microservices Patterns](https://microservices.io/patterns/) - Design patterns for microservices
- [12-Factor App](https://12factor.net/) - Modern application development methodology
- [Container Design Patterns](https://kubernetes.io/blog/2016/06/container-design-patterns/) - Container architecture patterns
- [API Gateway Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/api-gateway) - API gateway implementation

### 🔍 **Observability & Monitoring**

- [OpenTelemetry](https://opentelemetry.io/) - Observability framework standards
- [Prometheus Documentation](https://prometheus.io/docs/) - Metrics collection and monitoring
- [ELK Stack Guide](https://www.elastic.co/what-is/elk-stack) - Elasticsearch, Logstash, Kibana
- [Distributed Tracing](https://opentracing.io/) - Tracing concepts and implementation

### 🛠️ **Tools & Technologies**

- [Kong Gateway](https://docs.konghq.com/) - API gateway and service mesh
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html) - Message broker
- [Grafana Documentation](https://grafana.com/docs/) - Monitoring and visualization
- [Next.js Documentation](https://nextjs.org/docs) - React framework
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - Modern Python web framework
- [NestJS Documentation](https://docs.nestjs.com/) - Enterprise Node.js framework

### 🎓 **Learning Resources**

- [Docker Curriculum](https://docker-curriculum.com/) - Interactive Docker tutorial
- [Kubernetes Documentation](https://kubernetes.io/docs/) - Container orchestration platform
- [Microservices.io](https://microservices.io/) - Microservices architecture resources
- [CNCF Landscape](https://landscape.cncf.io/) - Cloud native technology ecosystem

### 🔧 **Development Tools**

- [Docker Desktop](https://www.docker.com/products/docker-desktop) - Local development environment
- [Lens](https://k8slens.dev/) - Kubernetes IDE (for future migration)
- [Portainer](https://www.portainer.io/) - Docker management UI
- [Trivy](https://github.com/aquasecurity/trivy) - Container security scanner

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Acknowledgments

- Docker team for creating an amazing containerization platform
- Open source community for providing excellent tools and libraries
- Contributors who help improve this demonstration repository

---
