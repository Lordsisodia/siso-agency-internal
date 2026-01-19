---
name: docker-containers
category: development-workflow/deployment-ops
version: 1.0.0
description: Docker containerization patterns, best practices for building and deploying containers
author: blackbox5/core
verified: true
tags: [docker, containers, deployment, devops]
---

# Docker Containers: Containerization Patterns & Best Practices

## Context

Docker containers have revolutionized application deployment by providing a lightweight, portable, and consistent runtime environment. Unlike virtual machines, containers share the host kernel and use layered filesystems, making them extremely efficient in terms of resource utilization and startup time.

### Why Containerize?

**Consistency:** "Works on my machine" becomes irrelevant. Containers ensure the same runtime environment across development, testing, and production.

**Isolation:** Applications run in isolated environments with their own dependencies, preventing conflicts between different services.

**Portability:** Containers can run anywhere - on-premises, in the cloud, or on developer laptops - without modification.

**Efficiency:** Containers use fewer resources than VMs and start in milliseconds rather than minutes.

**Scalability:** Easy to scale horizontally by simply running more container instances.

**Microservices:** Perfect for microservices architectures where each service runs in its own container.

### Container Architecture

**Image:** A read-only template containing the application code, runtime, libraries, and dependencies needed to run the application.

**Container:** A runnable instance of an image. Multiple containers can be created from a single image.

**Registry:** A repository for storing and distributing Docker images (e.g., Docker Hub, AWS ECR, GCR).

**Dockerfile:** A script containing instructions for building a Docker image.

**Docker Daemon:** The background service that manages images, containers, networks, and storage volumes.

### Key Concepts

**Layers:** Docker images are built in layers. Each instruction in a Dockerfile creates a new layer. Layers are cached to speed up builds.

**Base Image:** The starting point for a Dockerfile (e.g., `FROM alpine:3.18`, `FROM node:20-alpine`).

**Union Filesystem:** Docker uses a union filesystem to combine multiple layers into a single filesystem.

**Namespaces:** Linux feature that isolates containers from each other (process, network, mount namespaces).

**Control Groups (cgroups):** Linux feature that limits and accounts resource usage for containers.

## Instructions

### 1. Choose the Right Base Image

Select minimal, official base images optimized for your technology stack:

```dockerfile
# Node.js applications
FROM node:20-alpine

# Python applications
FROM python:3.11-slim

# Java applications
FROM eclipse-temurin:21-jre-alpine

# Go applications
FROM golang:1.21-alpine AS builder
FROM alpine:3.18

# Static sites
FROM nginx:alpine
```

**Guidelines:**
- Prefer `alpine` variants for minimal size
- Use `slim` variants where Alpine compatibility is a concern
- Pin specific versions (e.g., `alpine:3.18` not `alpine:latest`)
- Use official images from Docker Hub or trusted registries

### 2. Optimize Layer Caching

Order Dockerfile instructions from least to most frequently changing:

```dockerfile
# Start with rarely changing dependencies
FROM node:20-alpine
WORKDIR /app

# Copy dependency files first
COPY package*.json ./
RUN npm ci --only=production

# Copy application code (changes frequently)
COPY . .

# Set metadata
EXPOSE 3000
CMD ["node", "index.js"]
```

### 3. Implement Multi-Stage Builds

Use multi-stage builds to separate build and runtime environments:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Benefits:
- Smaller final images (build tools excluded)
- Improved security (fewer packages = smaller attack surface)
- Clear separation of concerns

### 4. Use Non-Root Users

Run applications as non-root users for security:

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy and set permissions
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production
COPY --chown=nodejs:nodejs . .

USER nodejs
EXPOSE 3000
CMD ["node", "index.js"]
```

### 5. Implement Health Checks

Add health checks to monitor container status:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "index.js"]
```

Health check script (`healthcheck.js`):
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => process.exit(1));
request.end();
```

### 6. Optimize for Production

**Minimize Image Size:**
```dockerfile
# Use .dockerignore to exclude unnecessary files
# .dockerignore
node_modules
npm-debug.log
.git
.env
README.md
*.md
coverage
.nyc_output

# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm prune --production
CMD ["node", "index.js"]
```

**Use Build Arguments:**
```dockerfile
FROM node:20-alpine AS builder
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

## Rules

### Image Size Rules

1. **Prefer Alpine Images:** Use Alpine-based images when possible. They are typically <5MB compared to 100MB+ for standard images.

2. **Multi-Stage Builds:** Always use multi-stage builds for compiled languages (Go, Rust, C++) to exclude build tools from the final image.

3. **Clean Up in Layers:** Remove package manager caches and temporary files in the same RUN instruction where they were created:
   ```dockerfile
   RUN apk add --no-cache --virtual .build-deps gcc && \
       npm install && \
       apk del .build-deps && \
       rm -rf /tmp/*
   ```

4. **Minimize Layers:** Combine related RUN instructions to reduce layers:
   ```dockerfile
   # Bad - 3 layers
   RUN apk add git
   RUN apk add curl
   RUN apk add vim

   # Good - 1 layer
   RUN apk add --no-cache git curl vim
   ```

5. **Use .dockerignore:** Always include a `.dockerignore` file to exclude unnecessary files from the build context.

### Security Rules

1. **Never Run as Root:** Always create and use a non-root user for running applications.

2. **Scan Images:** Scan images for vulnerabilities using tools like `trivy`, `clair`, or Docker Scan:
   ```bash
   docker scan myapp:latest
   trivy image myapp:latest
   ```

3. **Update Base Images:** Regularly update base images to get security patches:
   ```bash
   docker pull alpine:3.18
   ```

4. **No Secrets in Images:** Never include secrets, API keys, or passwords in Dockerfiles. Use environment variables or secrets management:
   ```dockerfile
   # Bad
   ENV API_KEY=secret123

   # Good
   ENV API_KEY=${API_KEY}
   ```

5. **Minimal Attack Surface:** Only install necessary packages. Each additional package is a potential vulnerability.

### Performance Rules

1. **Leverage Layer Caching:** Order instructions from least to most frequently changing. Copy dependency files before application code.

2. **Use BuildKit:** Enable Docker BuildKit for improved performance and caching:
   ```bash
   DOCKER_BUILDKIT=1 docker build .
   ```

3. **Parallel Builds:** Use BuildKit's parallel build capabilities for multi-stage builds:
   ```dockerfile
   FROM --platform=linux/amd64 node:20-alpine AS builder-amd64
   # ... build steps ...

   FROM --platform=linux/arm64 node:20-alpine AS builder-arm64
   # ... build steps ...

   FROM alpine:3.18
   COPY --from=builder-amd64 /app/app-amd64 ./app
   COPY --from=builder-arm64 /app/app-arm64 ./app
   ```

4. **Optimize RUN Instructions:** Use `--no-cache` and `--virtual` flags with package managers:
   ```dockerfile
   RUN apk add --no-cache --virtual .build-deps gcc musl-dev
   ```

### Configuration Rules

1. **Use ENV for Configuration:** Set environment variables for configuration:
   ```dockerfile
   ENV NODE_ENV=production
   ENV PORT=3000
   ```

2. **EXPOSE Ports:** Always declare exposed ports:
   ```dockerfile
   EXPOSE 3000/tcp
   ```

3. **Set Working Directory:** Always set a working directory:
   ```dockerfile
   WORKDIR /app
   ```

4. **Use CMD, Not ENTRYPOINT:** Prefer `CMD` for flexibility unless you need an executable that always runs:
   ```dockerfile
   # Good - allows override
   CMD ["node", "index.js"]

   # Use ENTRYPOINT when initializing entrypoint scripts
   ENTRYPOINT ["./entrypoint.sh"]
   CMD ["node", "index.js"]
   ```

5. **Signal Handling:** Use the exec form for CMD/ENTRYPOINT to ensure signals are handled correctly:
   ```dockerfile
   # Good - handles signals
   CMD ["node", "index.js"]

   # Bad - doesn't handle signals properly
   CMD node index.js
   ```

## Workflow

### Phase 1: Dockerfile Design

**Step 1: Analyze Application Requirements**
- Identify runtime dependencies (Node.js, Python, Java, etc.)
- Determine system-level dependencies (C libraries, fonts, etc.)
- List build-time tools (compilers, bundlers, etc.)
- Define runtime configuration (ports, environment variables, etc.)

**Step 2: Select Base Image**
```bash
# Search for appropriate images
docker search node
docker pull node:20-alpine
docker inspect node:20-alpine
```

**Step 3: Create Dockerfile**
```dockerfile
# 1. Base image
FROM node:20-alpine

# 2. Metadata
LABEL maintainer="team@example.com"
LABEL version="1.0.0"
LABEL description="Production Node.js application"

# 3. Working directory
WORKDIR /app

# 4. Dependencies
COPY package*.json ./
RUN npm ci --only=production

# 5. Application code
COPY . .

# 6. Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 7. Configuration
ENV NODE_ENV=production
EXPOSE 3000

# 8. Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 9. Startup command
CMD ["node", "index.js"]
```

### Phase 2: Build Optimization

**Step 1: Create .dockerignore**
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
coverage
.nyc_output
.DS_Store
*.log
README.md
.vscode
.idea
```

**Step 2: Build Image**
```bash
# Basic build
docker build -t myapp:latest .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t myapp:latest .

# Build with BuildKit
DOCKER_BUILDKIT=1 docker build -t myapp:latest .

# Build for specific platform
docker buildx build --platform linux/amd64 -t myapp:latest .
```

**Step 3: Optimize Layers**
```bash
# View image history
docker history myapp:latest

# Dive into image layers
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive:latest myapp:latest
```

**Step 4: Scan for Vulnerabilities**
```bash
# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:latest

# Scan with Docker Scout
docker scout quickview myapp:latest
docker scout cves myapp:latest
```

### Phase 3: Testing

**Step 1: Local Testing**
```bash
# Run container
docker run -d -p 3000:3000 --name myapp-test myapp:latest

# Check logs
docker logs myapp-test

# Check health
docker inspect --format='{{.State.Health.Status}}' myapp-test

# Execute commands in container
docker exec -it myapp-test sh

# Test application
curl http://localhost:3000/health

# Stop and remove
docker stop myapp-test && docker rm myapp-test
```

**Step 2: Integration Testing**
```bash
# Test with Docker Compose
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Run tests inside container
docker run --rm myapp:latest npm test
```

**Step 3: Performance Testing**
```bash
# Check image size
docker images myapp:latest

# Measure startup time
time docker run --rm myapp:latest

# Resource usage
docker stats myapp-test
```

### Phase 4: Deployment

**Step 1: Tag Image**
```bash
# Tag with version
docker tag myapp:latest myapp:1.0.0
docker tag myapp:latest registry.example.com/myapp:1.0.0

# Tag with git commit
docker tag myapp:latest myapp:$(git rev-parse --short HEAD)
```

**Step 2: Push to Registry**
```bash
# Login to registry
docker login registry.example.com

# Push image
docker push registry.example.com/myapp:1.0.0
docker push registry.example.com/myapp:latest

# Push to Docker Hub
docker push username/myapp:1.0.0
```

**Step 3: Deploy**
```bash
# Pull image
docker pull registry.example.com/myapp:1.0.0

# Run production container
docker run -d \
  --name myapp-prod \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=${DATABASE_URL} \
  --memory="512m" \
  --cpus="1.0" \
  registry.example.com/myapp:1.0.0

# Or use Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

**Step 4: Monitor**
```bash
# Check logs
docker logs -f myapp-prod

# Check health
docker inspect --format='{{json .State.Health}}' myapp-prod | jq

# Check resource usage
docker stats myapp-prod --no-stream
```

## Best Practices

### Use Alpine Images

Alpine Linux is a security-oriented, lightweight Linux distribution. Alpine-based images are typically 5-10x smaller than standard images.

**When to Use:**
- Production deployments
- Resource-constrained environments
- When image size matters (CI/CD, edge computing)

**When to Avoid:**
- When using libraries with complex C dependencies
- When debugging (musl vs glibc differences)
- When maximum compatibility is required

```dockerfile
# Node.js Alpine
FROM node:20-alpine

# Python Alpine
FROM python:3.11-alpine

# Custom Alpine
FROM alpine:3.18
RUN apk add --no-cache nodejs npm
```

### Optimize Layer Caching

Docker builds images in layers, caching unchanged layers to speed up subsequent builds.

**Strategy:**
1. Copy dependency files first
2. Install dependencies
3. Copy application code
4. Build application (if applicable)

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Cache dependency layer
COPY package*.json ./
RUN npm ci --only=production

# Application layer (changes frequently)
COPY . .

# Build layer
RUN npm run build
```

### Use .dockerignore

Exclude unnecessary files from the build context to improve build speed and reduce image size.

```
# Dependencies
node_modules
npm-debug.log
yarn-error.log

# Git
.git
.gitignore
.gitattributes

# Documentation
README.md
LICENSE
*.md

# CI/CD
.github
.gitlab-ci.yml
.travis.yml

# IDE
.vscode
.idea
*.swp
*.swo

# Environment
.env
.env.*
!.env.example

# Testing
coverage
.nyc_output
test-results

# Build artifacts
dist
build
*.log
```

### Implement Multi-Stage Builds

Multi-stage builds allow you to use multiple FROM statements in a single Dockerfile, creating smaller final images.

**Example: Node.js Application**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Example: Go Application**
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o app

# Production stage
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/app .
EXPOSE 8080
CMD ["./app"]
```

### Security Scanning

Regularly scan images for vulnerabilities.

**Using Trivy:**
```bash
# Scan local image
trivy image myapp:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL myapp:latest

# Scan in CI/CD
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

**Using Docker Scout:**
```bash
# Quick view
docker scout quickview myapp:latest

# CVEs
docker scout cves myapp:latest

# Compare images
docker scout compare myapp:1.0.0 myapp:latest
```

### Use Specific Version Tags

Always pin specific versions of base images to ensure reproducibility.

```dockerfile
# Bad - may change unexpectedly
FROM node:latest
FROM node:alpine

# Good - pinned version
FROM node:20.11.0-alpine3.18

# Acceptable - major/minor version
FROM node:20-alpine
FROM node:20-alpine3.18
```

### Implement Health Checks

Health checks allow Docker to monitor container health and restart unhealthy containers.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production

# Health check configuration
HEALTHCHECK --interval=30s \    # Check every 30 seconds
            --timeout=3s \       # Timeout after 3 seconds
            --start-period=5s \  # Grace period on startup
            --retries=3 \        # 3 consecutive failures = unhealthy
  CMD node healthcheck.js || exit 1

EXPOSE 3000
CMD ["node", "index.js"]
```

Health check endpoint (`healthcheck.js`):
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`Health check failed: ${err.message}`);
  process.exit(1);
});

request.end();
```

### Use BuildKit Features

Docker BuildKit provides improved performance, caching, and features.

**Enable BuildKit:**
```bash
# Environment variable
export DOCKER_BUILDKIT=1

# Docker daemon configuration
sudo systemctl edit docker
# [Service]
# Environment="DOCKER_BUILDKIT=1"
```

**BuildKit Features:**
```dockerfile
# Syntax version
# syntax=docker/dockerfile:1.4

# Mount build cache
RUN --mount=type=cache,target=/root/.npm \
  npm install

# Bind mount
RUN --mount=type=bind,target=. \
  npm run build

# Multi-platform builds
FROM --platform=linux/amd64 node:20-alpine AS builder-amd64
FROM --platform=linux/arm64 node:20-alpine AS builder-arm64

FROM alpine:3.18
COPY --from=builder-amd64 /app/app ./app-amd64
COPY --from=builder-arm64 /app/app ./app-arm64
```

## Anti-Patterns

### Fat Images

**Problem:** Including unnecessary tools, files, and layers increases image size and attack surface.

**Examples:**
```dockerfile
# Bad - includes unnecessary tools
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  vim \
  git \
  python3 \
  build-essential

# Good - minimal image
FROM node:20-alpine
```

**Solution:** Use Alpine images, multi-stage builds, and only include runtime dependencies.

### Running as Root

**Problem:** Running containers as root creates security vulnerabilities.

```dockerfile
# Bad - runs as root
FROM node:20-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]

# Good - non-root user
FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --chown=nodejs:nodejs . .
USER nodejs
CMD ["node", "index.js"]
```

### Secrets in Images

**Problem:** Embedding secrets in images exposes them to anyone with image access.

```dockerfile
# Bad - secret in image
FROM node:20-alpine
ENV API_KEY=sk_live_abc123...
ENV DATABASE_PASSWORD=password123
```

**Solution:** Use environment variables, secrets management, or runtime injection:
```dockerfile
# Good - external secrets
FROM node:20-alpine
ENV API_KEY=${API_KEY}
ENV DATABASE_PASSWORD=${DATABASE_PASSWORD}

# Or use Docker secrets
ENV DATABASE_PASSWORD_FILE=/run/secrets/db_password
CMD ["sh", "-c", "node index.js --db-password=$(cat $DATABASE_PASSWORD_FILE)"]
```

### Latest Tag

**Problem:** Using `latest` tag can lead to unexpected breaking changes.

```dockerfile
# Bad - unpredictable
FROM node:latest

# Good - predictable
FROM node:20.11.0-alpine3.18
```

### Poor Layer Ordering

**Problem:** Placing frequently changing instructions before rarely changing ones invalidates cache.

```dockerfile
# Bad - poor cache utilization
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install

# Good - optimized cache
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

### Monolithic Containers

**Problem:** Running multiple processes in a single container violates container best practices.

```dockerfile
# Bad - multiple processes
FROM node:20-alpine
COPY . .
RUN npm install
CMD ["sh", "-c", "node api.js & node worker.js & node scheduler.js"]
```

**Solution:** Use separate containers or Docker Compose:
```yaml
version: '3.8'
services:
  api:
    build: .
    command: node api.js
  worker:
    build: .
    command: node worker.js
  scheduler:
    build: .
    command: node scheduler.js
```

### Ignoring .dockerignore

**Problem:** Not using .dockerignore leads to unnecessary files in build context and image.

```
# Without .dockerignore, all these are included:
node_modules/
.git/
.env
coverage/
test-results/
```

**Solution:** Always use .dockerignore to exclude unnecessary files.

## Examples

### Node.js Application

**Dockerfile:**
```dockerfile
# syntax=docker/dockerfile:1.4

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci

# Copy and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user
USER nodejs

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

**.dockerignore:**
```
node_modules
npm-debug.log
.git
.env
.env.local
coverage
.nyc_output
*.log
README.md
.vscode
.idea
dist
```

### Python Application

**Dockerfile:**
```dockerfile
# syntax=docker/dockerfile:1.4

# Base image
FROM python:3.11-slim as base

# Build stage
FROM base AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
  pip install --user -r requirements.txt

# Production stage
FROM base
WORKDIR /app

# Create non-root user
RUN groupadd -g 1001 appuser && \
    useradd -r -u 1001 -g appuser appuser

# Copy dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Switch to non-root user
USER appuser

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Expose port
EXPOSE 8000

# Start application
CMD ["python", "app.py"]
```

### Go Application

**Dockerfile:**
```dockerfile
# syntax=docker/dockerfile:1.4

# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.* ./
RUN go mod download

# Copy source code
COPY . .

# Build application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# Production stage
FROM alpine:3.18
WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Create non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

# Copy binary from builder
COPY --from=builder /app/app .
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start application
CMD ["./app"]
```

### Multi-Stage Build for Static Sites

**Dockerfile:**
```dockerfile
# syntax=docker/dockerfile:1.4

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci

# Copy and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy built assets from builder
COPY --from=builder /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Integration Notes

### Docker Compose

Use Docker Compose for multi-container applications.

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:password@db:5432/myapp
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
```

**Commands:**
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Restart service
docker-compose restart app

# Scale service
docker-compose up -d --scale app=3
```

### CI/CD Integration

**GitHub Actions:**
```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and test
        run: |
          docker build -t myapp:test .
          docker run --rm myapp:test npm test

      - name: Scan for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:test
          format: 'table'
          exit-code: '1'
          severity: 'HIGH,CRITICAL'

      - name: Build and push
        if: github.ref == 'refs/heads/main'
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            username/myapp:latest
            username/myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**GitLab CI:**
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:
  stage: test
  image: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  script:
    - npm test

deploy:
  stage: deploy
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker pull $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
```

### Container Registries

**Docker Hub:**
```bash
# Login
docker login

# Tag
docker tag myapp:latest username/myapp:latest

# Push
docker push username/myapp:latest

# Pull
docker pull username/myapp:latest
```

**AWS ECR:**
```bash
# Login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag myapp:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest

# Pull
docker pull 123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
```

**Google GCR:**
```bash
# Configure authentication
gcloud auth configure-docker

# Tag
docker tag myapp:latest gcr.io/my-project/myapp:latest

# Push
docker push gcr.io/my-project/myapp:latest

# Pull
docker pull gcr.io/my-project/myapp:latest
```

## Error Handling

### Build Failures

**Common Issues:**

1. **Dependency Installation Failure**
   ```bash
   # Error: npm install fails
   RUN npm install

   # Solution: Use specific package manager and cache
   RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production
   ```

2. **Missing Dependencies**
   ```bash
   # Error: command not found
   RUN ./build.sh

   # Solution: Install required packages
   RUN apk add --no-cache bash make gcc
   ```

3. **Copy Failures**
   ```bash
   # Error: no such file or directory
   COPY app.js /app/

   # Solution: Check file exists and use correct path
   COPY app.js /app/app.js
   ```

**Debugging Builds:**
```bash
# Build with verbose output
DOCKER_BUILDKIT=0 docker build -t myapp:latest .

# Build specific stage
docker build --target builder -t myapp:builder .

# Interactive build debugging
docker run --rm -it myapp:builder sh
```

### Runtime Errors

**Common Issues:**

1. **Permission Denied**
   ```dockerfile
   # Error: permission denied
   CMD ["node", "index.js"]

   # Solution: Fix file permissions
   COPY --chown=nodejs:nodejs . .
   USER nodejs
   CMD ["node", "index.js"]
   ```

2. **Port Already in Use**
   ```bash
   # Error: port is already allocated
   docker run -p 3000:3000 myapp:latest

   # Solution: Use different port or stop existing container
   docker run -p 3001:3000 myapp:latest
   docker stop $(docker ps -q --filter "publish=3000")
   ```

3. **Out of Memory**
   ```bash
   # Error: container killed due to OOM

   # Solution: Increase memory limit
   docker run -m 1g myapp:latest
   ```

**Debugging Runtime:**
```bash
# View logs
docker logs myapp
docker logs -f myapp  # Follow logs
docker logs --tail 100 myapp  # Last 100 lines

# Execute commands
docker exec -it myapp sh
docker exec myapp ps aux
docker exec myapp cat /app/package.json

# Inspect container
docker inspect myapp
docker stats myapp
```

### Health Check Failures

**Common Issues:**

1. **Health Check Path Incorrect**
   ```dockerfile
   # Error: health check fails

   # Solution: Verify health check endpoint
   HEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1
   ```

2. **Health Check Timeout**
   ```dockerfile
   # Error: health check times out

   # Solution: Increase timeout
   HEALTHCHECK --timeout=10s CMD curl -f http://localhost:3000/health || exit 1
   ```

3. **Health Check Command Missing**
   ```dockerfile
   # Error: command not found

   # Solution: Install required tools
   RUN apk add --no-cache curl
   HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1
   ```

**Debugging Health Checks:**
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' myapp

# View health check log
docker inspect --format='{{json .State.Health}}' myapp | jq

# Test health check manually
docker exec myapp curl -f http://localhost:3000/health
```

## Output Format

### Dockerfile Format

Dockerfiles should follow this format:

```dockerfile
# syntax=docker/dockerfile:1.4

# 1. Base image
FROM node:20-alpine AS builder

# 2. Metadata
LABEL maintainer="team@example.com"
LABEL version="1.0.0"
LABEL description="Production Node.js application"

# 3. Working directory
WORKDIR /app

# 4. Dependencies
COPY package*.json ./
RUN npm ci --only=production

# 5. Application code
COPY . .

# 6. Build
RUN npm run build

# 7. Production stage
FROM node:20-alpine
WORKDIR /app

# 8. Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 9. Copy from builder
COPY --from=builder /app/dist ./dist

# 10. Environment
ENV NODE_ENV=production
ENV PORT=3000

# 11. Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider http://localhost:3000/health || exit 1

# 12. Expose port
EXPOSE 3000

# 13. Start command
CMD ["node", "dist/index.js"]
```

### Docker Compose Format

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
      args:
        NODE_ENV: production
    image: myapp:latest
    container_name: myapp
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:password@db:5432/myapp
    volumes:
      - ./data:/app/data
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:16-alpine
    container_name: myapp-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Related Skills

- **kubernetes:** Container orchestration, scaling, and management
- **ci-cd:** Continuous integration and deployment pipelines
- **infrastructure-as-code:** Managing infrastructure with code
- **monitoring:** Application performance monitoring and logging
- **security:** Container security best practices and scanning

## See Also

### Official Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Books
- "Docker Deep Dive" by Nigel Poulton
- "Docker in Action" by Jeff Nickoloff
- "The Docker Book" by James Turnbull

### Articles
- [Dockerfile Best Practices](https://snyk.io/blog/10-docker-image-security-best-practices/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://snyk.io/blog/10-docker-image-security-best-practices/)

### Tools
- [Dive](https://github.com/wagoodman/dive) - Docker image analyzer
- [Trivy](https://github.com/aquasecurity/trivy) - Container vulnerability scanner
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile linter
- [Docker Scout](https://docs.docker.com/scout/) - Docker's vulnerability analysis tool

---

**Author:** blackbox5/core
**Version:** 1.0.0
**Last Updated:** 2025-01-18
**Status:** Production Ready
