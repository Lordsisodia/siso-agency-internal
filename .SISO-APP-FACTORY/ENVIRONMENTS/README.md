# 🌐 ENVIRONMENTS - Infrastructure & Configuration Management

**Comprehensive environment management for consistent, scalable, and secure deployments.**

## 📁 **Directory Structure**

```
ENVIRONMENTS/
├── README.md                     # This comprehensive guide
├── docker/                       # Docker containerization templates
│   ├── development/              # Development environment containers
│   ├── production/               # Production-optimized containers
│   ├── multi-stage/              # Multi-stage build configurations
│   └── README.md                # Docker configuration guide
├── cloud-providers/              # Cloud deployment configurations
│   ├── vercel/                   # Vercel deployment configurations
│   ├── aws/                      # AWS deployment templates
│   ├── gcp/                      # Google Cloud Platform configurations
│   └── README.md                # Cloud deployment guide
├── database/                     # Database environment configurations
│   ├── postgresql/               # PostgreSQL configurations
│   ├── redis/                    # Redis configurations
│   ├── migrations/               # Environment-specific migrations
│   └── README.md                # Database environment guide
├── environment-configs/          # Environment variable templates
│   ├── development.env.template  # Development environment variables
│   ├── staging.env.template      # Staging environment variables
│   ├── production.env.template   # Production environment variables
│   └── README.md                # Environment configuration guide
├── secrets-management/           # Secure secrets management
│   ├── vault-configs/            # HashiCorp Vault configurations
│   ├── kubernetes-secrets/       # Kubernetes secrets templates
│   ├── cloud-secrets/            # Cloud provider secret management
│   └── README.md                # Secrets management guide
├── load-balancing/               # Load balancer configurations
│   ├── nginx/                    # Nginx load balancer configs
│   ├── traefik/                  # Traefik configurations
│   ├── cloud-lb/                 # Cloud load balancer configs
│   └── README.md                # Load balancing guide
├── monitoring-setup/             # Environment monitoring configurations
│   ├── prometheus/               # Prometheus monitoring configs
│   ├── grafana/                  # Grafana dashboard configs
│   ├── logging/                  # Centralized logging setup
│   └── README.md                # Environment monitoring guide
└── infrastructure-as-code/       # IaC templates and configurations
    ├── terraform/                # Terraform infrastructure templates
    ├── ansible/                  # Ansible configuration management
    ├── kubernetes/               # Kubernetes deployment manifests
    └── README.md                # Infrastructure as Code guide
```

## 🎯 **Purpose & Benefits**

### **Environment Consistency**
- **Reproducible Environments**: Identical configurations across all environments
- **Infrastructure as Code**: Version-controlled infrastructure configurations
- **Environment Parity**: Development, staging, and production alignment
- **Configuration Management**: Centralized configuration and secrets management

### **Scalability & Reliability**
- **Auto-scaling**: Automatic scaling based on demand
- **High Availability**: Multi-region and fault-tolerant deployments
- **Load Distribution**: Efficient traffic distribution and load balancing
- **Disaster Recovery**: Backup and recovery procedures

### **Security & Compliance**
- **Secure Configurations**: Security-hardened environment configurations
- **Secrets Management**: Encrypted and centralized secrets management
- **Network Security**: Secure network configurations and isolation
- **Audit Trails**: Complete audit logs of infrastructure changes

## 🚀 **Quick Start Guide**

### **1. Docker Development Setup**
```bash
# Copy Docker configurations
cp -r ENVIRONMENTS/docker/development/ ./docker/dev/
cp ENVIRONMENTS/docker/docker-compose.yml ./

# Build and start development environment
docker-compose up --build
```

### **2. Environment Variables Setup**
```bash
# Copy environment templates
cp ENVIRONMENTS/environment-configs/development.env.template ./.env.development
cp ENVIRONMENTS/environment-configs/production.env.template ./.env.production

# Edit with your actual values
nano .env.development
```

### **3. Cloud Deployment Setup**
```bash
# For Vercel deployment
cp -r ENVIRONMENTS/cloud-providers/vercel/ ./deployment/vercel/
cp ENVIRONMENTS/cloud-providers/vercel/vercel.json ./

# For AWS deployment
cp -r ENVIRONMENTS/cloud-providers/aws/ ./deployment/aws/
```

### **4. Database Environment Setup**
```bash
# Setup PostgreSQL configurations
cp -r ENVIRONMENTS/database/postgresql/ ./database/
cp ENVIRONMENTS/database/docker-compose.db.yml ./
```

## 📋 **Environment Categories**

### **🐳 Docker Configurations**

#### **Development Docker Setup**
```dockerfile
# Development Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=development

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
USER nextjs

EXPOSE 3000

# Development with hot reload
CMD ["npm", "run", "dev"]
```

#### **Production Docker Setup**
```dockerfile
# Multi-stage production Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies stage
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Builder stage
FROM base AS builder
COPY . .
RUN npm ci && npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### **☁️ Cloud Provider Configurations**

#### **Vercel Configuration**
```json
{
  "version": 2,
  "name": "siso-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database_url"
    }
  },
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### **AWS ECS Task Definition**
```json
{
  "family": "siso-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "siso-app",
      "image": "your-registry/siso-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/siso-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### **🗄️ Database Environment Configurations**

#### **PostgreSQL Docker Compose**
```yaml
version: '3.8'
services:
  postgres-dev:
    image: postgres:15-alpine
    container_name: siso-postgres-dev
    environment:
      POSTGRES_DB: siso_dev
      POSTGRES_USER: siso_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - siso-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U siso_user -d siso_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis-dev:
    image: redis:7-alpine
    container_name: siso-redis-dev
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_dev_data:/data
    ports:
      - "6379:6379"
    networks:
      - siso-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_dev_data:
  redis_dev_data:

networks:
  siso-network:
    driver: bridge
```

### **⚙️ Environment Variable Templates**

#### **Development Environment Template**
```bash
# Development Environment Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://siso_user:password@localhost:5432/siso_dev
DATABASE_POOL_SIZE=10
DATABASE_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=dev_redis_password

# Authentication
NEXTAUTH_SECRET=dev_nextauth_secret_change_this
NEXTAUTH_URL=http://localhost:3000

# External APIs (Development Keys)
OPENAI_API_KEY=sk-dev-your-openai-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-dev-supabase-anon-key

# Monitoring & Logging
LOG_LEVEL=debug
ENABLE_METRICS=true
METRICS_PORT=9090

# Feature Flags
ENABLE_EXPERIMENTAL_FEATURES=true
ENABLE_DEBUG_MODE=true
ENABLE_HOT_RELOAD=true

# Security (Relaxed for Development)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_ENABLED=false
```

#### **Production Environment Template**
```bash
# Production Environment Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration (Use Secrets Manager)
DATABASE_URL=${DATABASE_URL}
DATABASE_POOL_SIZE=50
DATABASE_SSL=true
DATABASE_CONNECTION_TIMEOUT=10000

# Redis Configuration
REDIS_URL=${REDIS_URL}
REDIS_PASSWORD=${REDIS_PASSWORD}

# Authentication
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://app.siso.com

# External APIs
OPENAI_API_KEY=${OPENAI_API_KEY}
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_METRICS=true
METRICS_PORT=9090
SENTRY_DSN=${SENTRY_DSN}

# Feature Flags
ENABLE_EXPERIMENTAL_FEATURES=false
ENABLE_DEBUG_MODE=false

# Security
CORS_ORIGIN=https://app.siso.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# Performance
ENABLE_GZIP=true
ENABLE_CACHING=true
CACHE_TTL=3600
```

### **🔐 Secrets Management**

#### **Kubernetes Secrets Configuration**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: siso-app-secrets
  namespace: production
type: Opaque
stringData:
  database-url: "postgresql://user:pass@db.example.com:5432/siso_prod"
  redis-url: "redis://redis.example.com:6379"
  nextauth-secret: "super-secret-nextauth-key"
  openai-api-key: "sk-your-openai-api-key"
  supabase-service-key: "your-supabase-service-key"

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: siso-app-config
  namespace: production
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  ENABLE_METRICS: "true"
  CORS_ORIGIN: "https://app.siso.com"
```

### **🔄 Load Balancer Configurations**

#### **Nginx Load Balancer**
```nginx
upstream siso_app {
    least_conn;
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name app.siso.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.siso.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/siso.crt;
    ssl_certificate_key /etc/ssl/private/siso.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Health Check Endpoint
    location /health {
        access_log off;
        proxy_pass http://siso_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://siso_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Authentication Endpoints
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://siso_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://siso_app;
    }

    # Main Application
    location / {
        proxy_pass http://siso_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🔧 **Infrastructure as Code**

### **Terraform AWS Infrastructure**
```hcl
# VPC Configuration
resource "aws_vpc" "siso_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "siso-vpc"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "siso_cluster" {
  name = "siso-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "siso_alb" {
  name               = "siso-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production"

  tags = {
    Environment = var.environment
  }
}

# RDS Database
resource "aws_db_instance" "siso_db" {
  identifier = "siso-db-${var.environment}"
  
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_encrypted     = true
  
  db_name  = "siso_${var.environment}"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.siso_db_subnet_group.name
  
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"

  tags = {
    Environment = var.environment
  }
}
```

## 🔗 **Integration with Factory**

### **Connects With**
- **AUTOMATION/**: Automated environment provisioning and deployment
- **SECURITY/**: Secure environment configurations and secrets management
- **MONITORING/**: Environment-specific monitoring and observability
- **TESTING/**: Environment-specific testing and validation

### **Supports**
- **Consistent Deployments**: Identical configurations across environments
- **Scalable Infrastructure**: Auto-scaling and load balancing
- **Secure Operations**: Encrypted secrets and secure configurations
- **Disaster Recovery**: Backup and recovery procedures

## 💡 **Pro Tips**

### **Environment Strategy**
- Keep development environments as close to production as possible
- Use infrastructure as code for all environment configurations
- Implement proper secrets management from the beginning
- Regular testing of disaster recovery procedures

### **Configuration Management**
- Use environment variables for all configuration
- Never commit secrets to version control
- Validate configurations before deployment
- Document all environment-specific settings

### **Monitoring & Maintenance**
- Monitor resource usage and costs across environments
- Regular security updates and patches
- Automated backup verification
- Performance tuning based on actual usage patterns

---

*Consistent Environments | Scalable Infrastructure | Secure Deployments*