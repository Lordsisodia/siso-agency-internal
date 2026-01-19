# Docker Containerization

> **Category:** Development Workflow
> **Skill:** docker-containers
> **Created:** 2026-01-18
> **Last Updated:** 2026-01-18
> **Status:** Production Ready
> **Agents:** primary, subagent, tools
> **Priority:** High

## Overview

Docker containerization skill for building, deploying, and managing containerized applications. Covers Dockerfiles, multi-stage builds, Docker Compose, orchestration, security best practices, and production deployment strategies.

## Key Capabilities

- Dockerfile optimization and multi-stage builds
- Image layer caching and size optimization
- Development vs production configurations
- Docker Compose for local development
- Container orchestration basics
- Security scanning and vulnerability management
- Log aggregation and monitoring
- CI/CD pipeline integration
- Multi-environment deployments
- Troubleshooting container issues

## Prerequisites

- Docker Desktop or Docker Engine installed
- Basic understanding of containers
- Shell/terminal knowledge
- Application to containerize

## Dockerfile Patterns

### Multi-Stage Build for Node.js

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### Python Application with Poetry

```dockerfile
# Base stage
FROM python:3.11-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_VERSION=1.7.1
ENV POETRY_HOME=/opt/poetry
ENV POETRY_NO_INTERACTION=1
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN curl -sSL https://install.python-poetry.org | python3 -
RUN poetry config virtualenvs.create false

# Dependencies stage
FROM base AS deps
WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev --no-root

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .

RUN poetry install --no-dev

# Production stage
FROM python:3.11-slim AS production
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy application
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /app /app

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Go Application

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates curl

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /root

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["./main"]
```

## Docker Compose Patterns

### Development Environment

```yaml
# docker-compose.yml
version: '3.9'

services:
  # Main application
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  # PostgreSQL database
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # PgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@admin.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    depends_on:
      - db

  # Mailhog for email testing
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  app:
    image: ${REGISTRY}/app:${TAG:-latest}
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        max_attempts: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - app-network
    depends_on:
      - db
      - redis
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    command: redis-server --requirepass ${REDIS_PASSWORD}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - app-network
    depends_on:
      - app

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Multi-Environment Setup

```yaml
# docker-compose.base.yml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```yaml
# docker-compose.dev.yml
version: '3.9'

services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    command: npm run dev

  db:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"
```

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  app:
    image: ${REGISTRY}/app:${TAG}
    restart: always
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: 3
```

## Optimization Techniques

### Layer Caching

```dockerfile
# Bad: Changes to any file invalidate all layers
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Good: Optimize layer caching
FROM node:20-alpine
WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json ./

# Install dependencies (cached unless package files change)
RUN npm ci

# Then copy source code
COPY . .

# Build (only reruns if source changes)
RUN npm run build
```

### .dockerignore

```dockerignore
# Node modules
node_modules
npm-debug.log
yarn-error.log

# Build outputs
dist
build
.next
out

# Environment files
.env
.env.local
.env.*.local

# Git
.git
.gitignore

# Docker
Dockerfile
docker-compose*.yml
.dockerignore

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Tests
coverage
.nyc_output

# Misc
README.md
*.md
```

### Image Size Optimization

```dockerfile
# Use alpine-based images
FROM node:20-alpine  # ~120MB vs ~900MB for standard

# Multi-stage builds to exclude build tools
FROM node:20-alpine AS builder
# ... build steps ...

FROM node:20-alpine AS runner
COPY --from=builder /app/dist ./dist
# No build tools included in final image

# Clean up in same layer
RUN apt-get update && \
    apt-get install -y package && \
    rm -rf /var/lib/apt/lists/*

# Use .dockerignore to exclude unnecessary files

# Minimize layers by combining RUN commands
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Use specific version tags
FROM node:20.11.0-alpine  # Better than node:20-alpine
```

## Security Best Practices

### Security Scanning

```bash
# Scan image for vulnerabilities
docker scout cves image:tag

# Trivy scanner
trivy image image:tag

# Snyk scanner
snyk test --docker image:tag

# Docker bench security
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /etc:/etc:ro \
  -v /bin:/bin:ro \
  docker/docker-bench-security
```

### Secure Dockerfile

```dockerfile
# Use specific versions
FROM node:20.11.0-alpine AS base

# Use non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Don't run as root
USER nextjs

# Minimal permissions
COPY --chown=nextjs:nodejs . .

# Scan for vulnerabilities in dependencies
RUN npm audit --audit-level=high

# Don't include secrets in image
# Use environment variables or secrets management

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          target: production

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

## Monitoring and Logging

### Logging Configuration

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "app,production"
```

### Health Checks

```dockerfile
# Application health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Database health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD pg_isready -U postgres || exit 1

# Redis health check
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD redis-cli ping || exit 1
```

## Troubleshooting

### Common Issues

```bash
# Container won't start
docker logs container_name
docker inspect container_name

# Image too large
docker history image:tag
docker scout image image:tag

# Network issues
docker network inspect bridge
docker exec container_name cat /etc/hosts

# Permission issues
docker exec -u root container_name ls -la /app
docker run --user $(id -u):$(id -g) image:tag

# Disk space
docker system df
docker system prune -a
docker volume prune
```

### Debugging Container

```bash
# Run container in shell mode
docker run -it image:tag sh

# Debug running container
docker exec -it container_name sh

# View container logs
docker logs -f container_name

# Inspect container
docker inspect container_name

# Resource usage
docker stats
```

## Best Practices

1. **Use Multi-Stage Builds**: Separate build and runtime environments
2. **Minimize Layers**: Combine RUN commands and use caching
3. **Use .dockerignore**: Exclude unnecessary files
4. **Run as Non-Root**: Create specific users in the image
5. **Scan for Vulnerabilities**: Regular security scanning
6. **Implement Health Checks**: Ensure container health
7. **Optimize Image Size**: Use alpine-based images when possible
8. **Tag Properly**: Use semantic versioning for tags
9. **Document Everything**: Comment complex Dockerfile instructions
10. **Test Locally**: Test containers before pushing to production

## Production Checklist

- [ ] Multi-stage build implemented
- [ ] Non-root user configured
- [ ] Health checks defined
- [ ] Environment variables externalized
- [ ] Secrets not in image
- [ ] Security scans passed
- [ ] Image optimized for size
- [ ] Logging configured
- [ ] Resource limits set
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Rollback procedure documented
