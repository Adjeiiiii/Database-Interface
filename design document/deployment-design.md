# Deployment Design

## 🚀 Deployment Overview

Phil's Project uses Docker-based deployment with containerized services for both development and production environments. The deployment strategy emphasizes simplicity, reproducibility, and scalability.

## 🏗️ Infrastructure Architecture

### Development Environment
```
Developer Machine
├── Docker Desktop
├── MySQL Container (Port 3306)
├── Flask Container (Port 5001)
└── React Dev Server (Port 5173)
```

### Production Environment
```
Production Server
├── Docker Compose
├── MySQL Container
├── Flask Container
├── Nginx (Reverse Proxy)
└── SSL/TLS Termination
```

## 🐳 Container Strategy

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: phil_project_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: phil_project
      MYSQL_USER: phil_user
      MYSQL_PASSWORD: phil_password
    ports:
      - "3306:3306"
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./seed_data.sql:/docker-entrypoint-initdb.d/02-seed.sql
    networks:
      - phil_network

  backend:
    build: .
    container_name: phil_project_backend
    restart: always
    ports:
      - "5001:5000"
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: password
      DB_NAME: phil_project
    depends_on:
      - mysql
    networks:
      - phil_network
    volumes:
      - .:/app

networks:
  phil_network:
    driver: bridge
```

### Container Specifications

#### MySQL Container
- **Base Image**: `mysql:8.0`
- **Port**: 3306
- **Memory**: 512MB
- **Storage**: Ephemeral (no persistence)
- **Initialization**: Automatic schema and data loading

#### Flask Container
- **Base Image**: Custom Python 3.11
- **Port**: 5000 (internal), 5001 (external)
- **Memory**: 256MB
- **Dependencies**: Flask, SQLAlchemy, PyMySQL
- **Health Check**: `/health` endpoint

#### React Container (Production)
- **Base Image**: `nginx:alpine`
- **Port**: 80
- **Memory**: 64MB
- **Content**: Static build files
- **Configuration**: Nginx reverse proxy

## 🔧 Environment Configuration

### Development Environment
```bash
# Backend Environment
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=phil_project
FLASK_ENV=development
FLASK_DEBUG=True

# Frontend Environment
VITE_API_BASE_URL=http://localhost:5001
VITE_APP_TITLE=Phil's Project
```

### Production Environment
```bash
# Backend Environment
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secure_password
DB_NAME=phil_project
FLASK_ENV=production
FLASK_DEBUG=False

# Frontend Environment
VITE_API_BASE_URL=https://api.philsproject.com
VITE_APP_TITLE=Phil's Project
```

## 📦 Build Process

### Backend Build
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["python", "app.py"]
```

### Frontend Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 Network Configuration

### Docker Network
```yaml
networks:
  phil_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Port Mapping
- **MySQL**: 3306:3306
- **Backend**: 5001:5000
- **Frontend**: 5173:5173 (dev), 80:80 (prod)

### Service Discovery
- **Internal Communication**: Container names as hostnames
- **External Access**: Localhost ports
- **Database Connection**: `mysql:3306` from backend

## 🔒 Security Configuration

### Container Security
```yaml
# Security context
security_opt:
  - no-new-privileges:true

# Resource limits
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'

# Read-only filesystem
read_only: true
tmpfs:
  - /tmp
  - /var/run
```

### Network Security
```yaml
# Network isolation
networks:
  phil_network:
    driver: bridge
    internal: false
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
```

### Environment Variables Security
```bash
# Use secrets for sensitive data
MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
DB_PASSWORD_FILE=/run/secrets/db_password
```

## 📊 Monitoring and Logging

### Health Checks
```yaml
# Backend health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

# MySQL health check
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logging Configuration
```yaml
# Logging driver
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Monitoring Stack
```yaml
# Prometheus monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🚀 Deployment Strategies

### Development Deployment
```bash
# Quick start
docker-compose up --build -d

# With logs
docker-compose up --build

# Clean restart
docker-compose down -v && docker-compose up --build -d
```

### Production Deployment
```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build -d

# With environment file
docker-compose --env-file .env.prod up --build -d

# Rolling update
docker-compose up --build -d --no-deps backend
```

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and deploy
        run: |
          docker-compose -f docker-compose.prod.yml up --build -d
          
      - name: Health check
        run: |
          curl -f http://localhost:5001/health
```

## 📈 Scaling Strategy

### Horizontal Scaling
```yaml
# Multiple backend instances
  backend:
    build: .
    deploy:
      replicas: 3
    ports:
      - "5001-5003:5000"
```

### Load Balancing
```nginx
# Nginx load balancer configuration
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend;
    }
}
```

### Database Scaling
```yaml
# MySQL with read replicas
  mysql-master:
    image: mysql:8.0
    environment:
      MYSQL_REPLICATION_MODE: master
      
  mysql-slave:
    image: mysql:8.0
    environment:
      MYSQL_REPLICATION_MODE: slave
      MYSQL_MASTER_HOST: mysql-master
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Backup script
#!/bin/bash
docker exec phil_project_mysql mysqldump -u root -ppassword phil_project > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Data Persistence
```yaml
# Persistent volumes
volumes:
  mysql_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/phil_project/mysql_data
```

### Recovery Process
```bash
# Restore from backup
docker exec -i phil_project_mysql mysql -u root -ppassword phil_project < backup_20240115_120000.sql
```

## 🌍 Multi-Environment Strategy

### Environment Files
```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:5001
DEBUG=true

# .env.production
NODE_ENV=production
API_URL=https://api.philsproject.com
DEBUG=false
```

### Environment-Specific Configs
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=True
    volumes:
      - .:/app  # Hot reload

# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - FLASK_ENV=production
      - FLASK_DEBUG=False
    restart: always
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] Tests passing
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup strategy in place

### Deployment
- [ ] Build process successful
- [ ] Containers starting correctly
- [ ] Health checks passing
- [ ] Database connectivity verified
- [ ] API endpoints responding
- [ ] Frontend loading correctly

### Post-Deployment
- [ ] Monitoring alerts configured
- [ ] Logs being collected
- [ ] Performance metrics baseline
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Team notified

## 🚨 Troubleshooting

### Common Issues
1. **Port Conflicts**: Check port availability
2. **Container Startup**: Check logs and dependencies
3. **Database Connection**: Verify credentials and network
4. **Memory Issues**: Adjust resource limits
5. **Volume Mounts**: Check file permissions

### Debug Commands
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend bash

# Check resource usage
docker stats

# Restart specific service
docker-compose restart backend
```

---

*This deployment design provides a robust, scalable, and maintainable deployment strategy for Phil's Project.*
