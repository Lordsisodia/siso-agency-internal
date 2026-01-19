---
name: kubernetes
category: development-workflow/deployment-ops
version: 1.0.0
description: Kubernetes deployment patterns, manifests, and best practices for container orchestration
author: blackbox5/core
verified: true
tags: [kubernetes, k8s, containers, orchestration, deployment]
---

# Kubernetes Deployment Workflows

A comprehensive guide to deploying and managing containerized applications on Kubernetes with production-ready patterns, manifests, and operational best practices.

## Context

Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It provides a framework for running distributed systems resiliently, taking care of scaling and failover for applications.

### Core Concepts

**Cluster Architecture:**
- **Control Plane**: Master components managing the cluster (API Server, Scheduler, Controller Manager, etcd)
- **Worker Nodes**: Machines running containers (Kubelet, Kube-proxy, Container Runtime)
- **Pod**: Smallest deployable unit, containing one or more containers
- **Service**: Stable network endpoint for a set of pods
- **Deployment**: Declarative updates for Pods and ReplicaSets
- **Namespace**: Virtual cluster for resource isolation

**Key Resources:**
- **Pod**: Ephemeral, replaceable unit
- **ReplicaSet**: Maintains stable set of replica pods
- **Deployment**: Manages ReplicaSets and rollout strategies
- **StatefulSet**: Manages stateful applications with stable identities
- **DaemonSet**: Ensures pod runs on each node
- **ConfigMap**: Configuration data separated from code
- **Secret**: Sensitive configuration data
- **PersistentVolume (PV)**: Storage resource in cluster
- **PersistentVolumeClaim (PVC)**: Request for storage by user
- **Ingress**: HTTP/S routing to services
- **HorizontalPodAutoscaler (HPA)**: Auto-scales pods based on metrics

**Orchestration Benefits:**
- Self-healing: Restart failed containers, replace dead pods
- Horizontal scaling: Scale up/down based on load
- Service discovery: Automatic load balancing across pods
- Rolling updates: Zero-downtime deployments
- Resource management: CPU/memory limits and requests
- Storage orchestration: Automatic mounting of storage systems

**When to Use Kubernetes:**
- Microservices architecture with multiple services
- Need for auto-scaling based on traffic/load
- Complex deployment patterns (canary, blue-green)
- Multiple environment management (dev, staging, prod)
- High availability requirements
- Large-scale container deployments (>10 containers)

**When NOT to Use Kubernetes:**
- Simple monolithic applications
- Small deployments (<5 containers)
- Limited operational expertise
- Resource-constrained environments
- Single-container applications

## Instructions

### 1. Container Preparation

Before deploying to Kubernetes, ensure containers are production-ready:

```dockerfile
# Use specific version tags, not 'latest'
FROM node:18-alpine3.18

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "server.js"]
```

**Container Requirements:**
- Use specific image versions (avoid `latest`)
- Implement health checks
- Run as non-root user
- Optimize image size (use alpine/distroless)
- Handle signals (SIGTERM/SIGINT)
- Log to stdout/stderr
- Be stateless (externalize state)

### 2. Manifest Design

Create organized, reusable manifests:

**Directory Structure:**
```
kubernetes/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── kustomization.yaml
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   ├── patches/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   ├── patches/
│   └── production/
│       ├── kustomization.yaml
│       ├── patches/
│       ├── secrets/
└── scripts/
    ├── deploy.sh
    └── rollback.sh
```

**Base Deployment:**
```yaml
# base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: my-app
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: my-app
        image: myregistry/my-app:1.0.0
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        envFrom:
        - configMapRef:
            name: my-app-config
        - secretRef:
            name: my-app-secrets
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 30
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: config
        configMap:
          name: my-app-config
      - name: tmp
        emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - my-app
              topologyKey: kubernetes.io/hostname
```

**Service:**
```yaml
# base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: my-app
```

**ConfigMap:**
```yaml
# base/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
data:
  APP_NAME: "my-app"
  LOG_LEVEL: "info"
  API_TIMEOUT: "30"
  CACHE_TTL: "3600"
```

**Kustomization:**
```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: my-app

resources:
- deployment.yaml
- service.yaml
- configmap.yaml

images:
- name: myregistry/my-app
  newTag: 1.0.0

commonLabels:
  app.kubernetes.io/name: my-app
  app.kubernetes.io/instance: my-app
  app.kubernetes.io/component: backend
  app.kubernetes.io/managed-by: kubectl
```

### 3. Environment Configuration

**Production Overlay:**
```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production

resources:
- ../../base

patchesStrategicMerge:
- patches/deployment-replicas.yaml
- patches/deployment-resources.yaml
- patches/service-annotation.yaml

images:
- name: myregistry/my-app
  newTag: 1.0.0

replicas:
- name: my-app
  count: 6
```

**Replicas Patch:**
```yaml
# overlays/production/patches/deployment-replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 6
```

**Resources Patch:**
```yaml
# overlays/production/patches/deployment-resources.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
      - name: my-app
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
```

### 4. Deployment Workflow

**Validate Manifests:**
```bash
# Dry-run to validate
kubectl apply --dry-run=client -k overlays/production/

# Validate with server
kubectl apply --dry-run=server -k overlays/production/

# Check diff
kubectl diff -k overlays/production/
```

**Apply Manifests:**
```bash
# Apply configuration
kubectl apply -k overlays/production/

# Wait for rollout
kubectl rollout status deployment/my-app -n production

# Verify pods are running
kubectl get pods -n production -l app=my-app
```

**Monitoring Rollout:**
```bash
# Watch rollout status
kubectl rollout status deployment/my-app -n production --watch=true

# Check rollout history
kubectl rollout history deployment/my-app -n production

# View specific revision
kubectl rollout history deployment/my-app -n production --revision=3

# Get detailed pod info
kubectl describe pod <pod-name> -n production
```

### 5. Scaling Operations

**Manual Scaling:**
```bash
# Scale to 10 replicas
kubectl scale deployment/my-app --replicas=10 -n production

# Scale based on CPU utilization
kubectl autoscale deployment/my-app --min=3 --max=10 --cpu-percent=80 -n production
```

**HorizontalPodAutoscaler:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

### 6. Updates and Rollbacks

**Rolling Update:**
```bash
# Update image
kubectl set image deployment/my-app my-app=myregistry/my-app:1.1.0 -n production

# Edit configuration
kubectl edit deployment/my-app -n production

# Apply updated manifests
kubectl apply -k overlays/production/
```

**Rollback:**
```bash
# Rollback to previous version
kubectl rollout undo deployment/my-app -n production

# Rollback to specific revision
kubectl rollout undo deployment/my-app --to-revision=2 -n production

# Pause rollout
kubectl rollout pause deployment/my-app -n production

# Resume rollout
kubectl rollout resume deployment/my-app -n production
```

## Rules

### Resource Management

**Always Set Resource Limits:**
```yaml
resources:
  requests:
    cpu: "100m"      # Minimum guaranteed CPU
    memory: "128Mi"  # Minimum guaranteed memory
  limits:
    cpu: "500m"      # Maximum CPU allowed
    memory: "512Mi"  # Maximum memory allowed
```

**Resource Sizing Guidelines:**
- Requests: What the application needs under normal load
- Limits: Maximum resources the application can consume
- CPU: Use millicores (100m = 0.1 CPU core)
- Memory: Use Mi/Gi (1024-based), not M/G (1000-based)
- Set limits slightly higher than requests for burst capacity
- Monitor usage and adjust based on actual metrics

### Health Checks

**Required Probes:**
1. **Liveness Probe**: Restart container if fails
2. **Readiness Probe**: Don't send traffic if fails
3. **Startup Probe**: Allow time for slow-starting apps

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 0
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 30  # 5s * 30 = 150s max startup time
```

**Health Check Best Practices:**
- Use lightweight checks (avoid heavy database queries)
- Check critical dependencies (database, cache, external APIs)
- Return appropriate HTTP status codes
- Include timeout and retry logic in application
- Log health check failures for debugging

### Security

**Security Context:**
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: my-app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      runAsUser: 1001
      capabilities:
        drop:
        - ALL
```

**Secrets Management:**
```yaml
# Create secret from file
kubectl create secret generic my-app-secrets \
  --from-file=dotenv=.env.production \
  --dry-run=client -o yaml | kubectl apply -f -

# Create secret from literal values
kubectl create secret generic my-app-secrets \
  --from-literal=API_KEY=xxx \
  --from-literal=DB_PASSWORD=yyy \
  --dry-run=client -o yaml | kubectl apply -f -

# Use external secrets operator for cloud providers
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: my-app-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: my-app-secrets
    creationPolicy: Owner
  data:
  - secretKey: api-key
    remoteRef:
      key: prod/my-app/api-key
```

**Network Policies:**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-app-network-policy
spec:
  podSelector:
    matchLabels:
      app: my-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 53  # DNS
```

### Rollout Strategy

**RollingUpdate Configuration:**
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Max extra pods during update
    maxUnavailable: 0  # Max unavailable pods during update
```

**Rollout Best Practices:**
- Set `maxUnavailable: 0` for zero-downtime deployments
- Set `maxSurge` based on cluster capacity
- Use readiness probes to prevent premature traffic
- Monitor rollout progress and rollback on failure
- Test in staging environment before production

## Workflow

### Phase 1: Containerization

**Tasks:**
1. Create optimized Dockerfile
2. Implement health check endpoint
3. Test container locally
4. Push to container registry
5. Tag images with version

**Validation:**
```bash
# Test container locally
docker run -p 3000:3000 myregistry/my-app:1.0.0

# Check health endpoint
curl http://localhost:3000/health
curl http://localhost:3000/ready

# Scan for vulnerabilities
trivy image myregistry/my-app:1.0.0
```

### Phase 2: Manifest Design

**Tasks:**
1. Create base manifests (deployment, service, configmap)
2. Define resource requirements
3. Configure health probes
4. Set up environment-specific overlays
5. Create Kustomization files

**Checklist:**
- Resource requests and limits set
- Health probes configured
- Security context defined
- Liveness/readiness endpoints exist
- Environment externalized (ConfigMap/Secret)
- Service exposed correctly
- Ingress configured (if needed)

### Phase 3: Deployment

**Tasks:**
1. Validate manifests with dry-run
2. Apply to namespace
3. Monitor rollout status
4. Verify pod health
5. Test application endpoints

**Commands:**
```bash
# Validate
kubectl apply --dry-run=server -k overlays/production/

# Deploy
kubectl apply -k overlays/production/

# Monitor
kubectl rollout status deployment/my-app -n production --watch=true

# Verify
kubectl get pods -n production -l app=my-app
kubectl logs -n production -l app=my-app --tail=50 -f
```

### Phase 4: Monitoring

**Tasks:**
1. Set up Prometheus metrics
2. Configure log aggregation
3. Set up alerting rules
4. Create dashboards
5. Monitor resource usage

**Key Metrics:**
- Pod CPU/memory usage
- Request/response latency
- Error rates
- Pod restart counts
- Deployment success rate
- Application metrics (custom)

## Best Practices

### Declarative Configuration

**Use GitOps:**
```bash
# Store manifests in Git
git add kubernetes/
git commit -m "Add Kubernetes manifests"
git push origin main

# Use ArgoCD/Flux for automatic sync
# Manifests in Git are the source of truth
```

**Benefits:**
- Version control for all changes
- Rollback via git revert
- Audit trail of changes
- Collaborative review via PRs
- Automated deployments via CI/CD

### Probes Configuration

**Liveness vs Readiness:**
- **Liveness**: Is the application alive? Restart if fails.
- **Readiness**: Is the application ready to serve traffic? Don't route if fails.
- **Startup**: Allow time for slow-starting applications.

```yaml
# Liveness: Check if app is alive
livenessProbe:
  httpGet:
    path: /health  # Simple endpoint
  failureThreshold: 3

# Readiness: Check if app can handle traffic
readinessProbe:
  httpGet:
    path: /ready  # Check dependencies (DB, cache, etc.)
  failureThreshold: 3

# Startup: Give app time to start
startupProbe:
  httpGet:
    path: /health
  failureThreshold: 30  # Allow 150s startup time
```

### Resource Management

**Request vs Limit:**
```yaml
resources:
  requests:
    cpu: 250m      # Guaranteed minimum
    memory: 256Mi  # Guaranteed minimum
  limits:
    cpu: 1000m     # Maximum allowed (can throttle)
    memory: 1Gi    # Maximum allowed (can OOM kill)
```

**Best Practices:**
- Set requests based on actual usage under normal load
- Set limits based on maximum acceptable resource consumption
- Monitor metrics and adjust over time
- Use vertical pod autoscaler for optimization
- Consider QoS classes (Guaranteed, Burstable, BestEffort)

### Labeling and Annotations

**Standard Labels:**
```yaml
metadata:
  labels:
    app.kubernetes.io/name: my-app
    app.kubernetes.io/instance: my-app-prod
    app.kubernetes.io/version: "1.0.0"
    app.kubernetes.io/component: backend
    app.kubernetes.io/part-of: my-platform
    app.kubernetes.io/managed-by: kubectl
    app.kubernetes.io/created-by: controller-manager
```

**Useful Annotations:**
```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3000"
    prometheus.io/path: "/metrics"
    description: "My application backend service"
    contact: "team@example.com"
    cost-center: "engineering"
```

### Configuration Management

**External Configuration:**
```yaml
# ConfigMap for non-sensitive config
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
data:
  APP_NAME: "my-app"
  LOG_LEVEL: "info"
  FEATURES: "feature1,feature2"

# Secret for sensitive config
apiVersion: v1
kind: Secret
metadata:
  name: my-app-secrets
type: Opaque
data:
  API_KEY: <base64-encoded-key>
  DB_PASSWORD: <base64-encoded-password>

# Use in deployment
envFrom:
- configMapRef:
    name: my-app-config
- secretRef:
    name: my-app-secrets
```

### Multi-Environment Management

**Directory Structure:**
```
kubernetes/
├── base/           # Common manifests
├── overlays/
│   ├── dev/        # Development environment
│   ├── staging/    # Staging environment
│   └── production/ # Production environment
```

**Kustomize for Environments:**
```yaml
# overlays/production/kustomization.yaml
bases:
- ../../base

patchesStrategicMerge:
- increase-replicas.yaml
- set-resources.yaml

images:
- name: my-app
  newTag: 1.0.0

commonLabels:
  env: production
```

## Anti-Patterns

### Imperative Updates

**Bad: Imperative Commands**
```bash
# DON'T: Direct imperative changes
kubectl edit deployment/my-app
kubectl scale deployment/my-app --replicas=10
kubectl set image deployment/my-app my-app=v2
```

**Good: Declarative Manifests**
```bash
# DO: Apply manifest files
kubectl apply -f deployment.yaml
kubectl apply -k overlays/production/
```

**Why:**
- Declarative: Desired state is versioned in Git
- Imperative: Changes are ephemeral and not tracked
- Declarative: Reproducible and auditable
- Imperative: Manual and error-prone

### Missing Resource Limits

**Bad: No Resource Limits**
```yaml
# DON'T: Deploy without resource limits
spec:
  containers:
  - name: my-app
    # No resources section
```

**Good: Set Resource Limits**
```yaml
# DO: Always set requests and limits
spec:
  containers:
  - name: my-app
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 500m
        memory: 512Mi
```

**Why:**
- Prevents resource starvation
- Enables accurate capacity planning
- Avoids noisy neighbor issues
- Required for cluster autoscaling

### Missing Health Probes

**Bad: No Health Checks**
```yaml
# DON'T: Deploy without health probes
spec:
  containers:
  - name: my-app
    # No probes defined
```

**Good: Define All Probes**
```yaml
# DO: Define liveness, readiness, startup probes
spec:
  containers:
  - name: my-app
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
    readinessProbe:
      httpGet:
        path: /ready
        port: 3000
    startupProbe:
      httpGet:
        path: /health
        port: 3000
```

**Why:**
- Automatic failure detection and recovery
- Prevents traffic to unready pods
- Enables graceful rollout
- Provides observability

### Using Latest Tag

**Bad: Floating Tags**
```yaml
# DON'T: Use latest or floating tags
spec:
  containers:
  - name: my-app
    image: myregistry/my-app:latest
    image: myregistry/my-app:v1  # Also bad
```

**Good: Specific Tags**
```yaml
# DO: Use specific version tags
spec:
  containers:
  - name: my-app
    image: myregistry/my-app:1.0.0
```

**Why:**
- Reproducible deployments
- Rollback capability
- Version tracking
- Avoids unexpected updates

### Hardcoded Configuration

**Bad: Hardcoded in Container**
```dockerfile
# DON'T: Hardcode config in Dockerfile
ENV DATABASE_URL=postgresql://prod-db...
ENV API_KEY=secret-key-here
```

**Good: Externalized Config**
```yaml
# DO: Use ConfigMap/Secret
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
data:
  DATABASE_URL: "postgresql://prod-db..."

---
apiVersion: v1
kind: Secret
metadata:
  name: my-app-secrets
data:
  API_KEY: <base64-encoded-key>
```

**Why:**
- Configuration separate from code
- Environment-specific config
- Security (secrets not in images)
- Easy configuration updates

### Running as Root

**Bad: Root User**
```dockerfile
# DON'T: Run as root
USER root
```

**Good: Non-Root User**
```dockerfile
# DO: Create and use non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001
USER appuser
```

**Why:**
- Security best practice
- Limits attack surface
- Prevents privilege escalation
- Compliance requirement

### Large Images

**Bad: Large Base Images**
```dockerfile
# DON'T: Use large base images
FROM node:18  # ~900MB
FROM ubuntu:latest  # ~70MB+
```

**Good: Minimal Images**
```dockerfile
# DO: Use minimal base images
FROM node:18-alpine  # ~120MB
FROM gcr.io/distroless/nodejs18-debian11  # ~50MB
```

**Why:**
- Faster deployment/pull times
- Reduced storage costs
- Smaller attack surface
- Faster startup times

## Examples

### Complete Deployment Example

**Deployment with All Best Practices:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
  namespace: production
  labels:
    app: web-api
    version: v1
    environment: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: web-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      initContainers:
      - name: wait-for-db
        image: busybox:1.36
        command:
        - sh
        - -c
        - |
          until nc -z -v -w30 postgres 5432
          do
            echo "Waiting for database..."
            sleep 5
          done
      containers:
      - name: web-api
        image: registry.example.com/web-api:1.0.0
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: web-api-secrets
              key: database-url
        envFrom:
        - configMapRef:
            name: web-api-config
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL
        livenessProbe:
          httpGet:
            path: /health
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: http
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health
            port: http
            scheme: HTTP
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 30
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /app/cache
      volumes:
      - name: config
        configMap:
          name: web-api-config
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir:
          sizeLimit: 100Mi
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - web-api
              topologyKey: topology.kubernetes.io/zone
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values:
                - amd64
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: web-api
```

### Service with Ingress

**Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-api
  namespace: production
  labels:
    app: web-api
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: web-api
```

**Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-api
  namespace: production
  labels:
    app: web-api
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/limit-rps: "50"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: web-api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-api
            port:
              number: 80
```

### StatefulSet for Databases

**StatefulSet:**
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: production
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: mydb
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: password
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 4Gi
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes:
      - ReadWriteOnce
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 100Gi
```

### HorizontalPodAutoscaler

**HPA with Custom Metrics:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  - type: Object
    object:
      metric:
        name: requests_per_second
      describedObject:
        apiVersion: networking.k8s.io/v1
        kind: Ingress
        name: web-api
      target:
        type: Value
        value: "10k"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 5
        periodSeconds: 60
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 10
        periodSeconds: 30
      selectPolicy: Max
```

### ConfigMap and Secret

**ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-api-config
  namespace: production
  labels:
    app: web-api
data:
  APP_NAME: "web-api"
  APP_ENV: "production"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  SERVER_PORT: "8080"
  SERVER_TIMEOUT: "30"
  DATABASE_POOL_MIN: "2"
  DATABASE_POOL_MAX: "10"
  CACHE_TTL: "3600"
  CACHE_MAX_SIZE: "1000"
  RATE_LIMIT_ENABLED: "true"
  RATE_LIMIT_MAX: "100"
  RATE_LIMIT_WINDOW: "60"
  FEATURE_FLAGS: "new-ui,experimental-api"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: production
data:
  nginx.conf: |
    user nginx;
    worker_processes auto;
    error_log /var/log/nginx/error.log warn;
    pid /var/run/nginx.pid;

    events {
        worker_connections 1024;
    }

    http {
        include /etc/nginx/mime.types;
        default_type application/octet-stream;
        sendfile on;
        keepalive_timeout 65;
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;

        upstream backend {
            server web-api:80;
        }

        server {
            listen 80;
            location / {
                proxy_pass http://backend;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
            }
        }
    }
```

**Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: web-api-secrets
  namespace: production
  labels:
    app: web-api
type: Opaque
stringData:
  database-url: "postgresql://user:pass@postgres:5432/dbname"
  redis-url: "redis://redis:6379"
  api-key: "your-api-key-here"
  jwt-secret: "your-jwt-secret-here"
---
apiVersion: v1
kind: Secret
metadata:
  name: tls-cert
  namespace: production
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-cert>
  tls.key: <base64-encoded-key>
---
apiVersion: v1
kind: Secret
metadata:
  name: docker-registry
  namespace: production
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: <base64-encoded-docker-config>
```

## Integration Notes

### kubectl

**Essential Commands:**
```bash
# Get cluster info
kubectl cluster-info
kubectl version
kubectl config current-context

# Get resources
kubectl get all -n production
kubectl get pods,svc,deploy -n production
kubectl get pods -n production -l app=my-app

# Describe resources
kubectl describe pod <pod-name> -n production
kubectl describe deployment/my-app -n production

# Get logs
kubectl logs <pod-name> -n production
kubectl logs <pod-name> -n production --tail=100 -f
kubectl logs deployment/my-app -n production --all-containers=true

# Exec into container
kubectl exec -it <pod-name> -n production -- sh

# Port forwarding
kubectl port-forward <pod-name> 8080:8080 -n production
kubectl port-forward deployment/my-app 8080:8080 -n production

# Copy files
kubectl cp ./local-file.txt <pod-name>:/app/file.txt -n production
kubectl cp <pod-name>:/app/file.txt ./local-file.txt -n production

# Apply manifests
kubectl apply -f manifest.yaml
kubectl apply -k overlays/production/
kubectl apply -f https://example.com/manifest.yaml

# Delete resources
kubectl delete pod/<pod-name> -n production
kubectl delete deployment/my-app -n production
kubectl delete -f manifest.yaml

# Scale deployments
kubectl scale deployment/my-app --replicas=10 -n production

# Rollouts
kubectl rollout status deployment/my-app -n production
kubectl rollout history deployment/my-app -n production
kubectl rollout undo deployment/my-app -n production

# Top resources
kubectl top nodes
kubectl top pods -n production

# Events
kubectl get events -n production --sort-by='.lastTimestamp'
kubectl get events -n production --field-selector type=Warning
```

### Helm

**Helm Charts:**
```bash
# Create a chart
helm create my-chart

# Install chart
helm install my-release ./my-chart
helm install my-release ./my-chart --values production.yaml
helm install my-release ./my-chart --set image.tag=1.0.0

# Upgrade chart
helm upgrade my-release ./my-chart
helm upgrade my-release ./my-chart --values production.yaml
helm upgrade my-release ./my-chart --reuse-values --set image.tag=1.1.0

# Rollback
helm rollback my-release
helm rollback my-release 2

# Uninstall
helm uninstall my-release

# List releases
helm list
helm list --all-namespaces

# Get values
helm get values my-release
helm get values my-release --all

# Template rendering
helm template my-release ./my-chart
```

**values.yaml:**
```yaml
# Chart values
replicaCount: 3

image:
  repository: myregistry/my-app
  tag: 1.0.0
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: http

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
  - host: app.example.com
    paths:
    - path: /
      pathType: Prefix
  tls:
  - secretName: app-tls
    hosts:
    - app.example.com

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

config:
  logLevel: info
  features: feature1,feature2

secrets:
  apiKey: changeme
  databasePassword: changeme

nodeSelector: {}

tolerations: []

affinity: {}
```

### Kustomize

**Kustomization:**
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Namespace
namespace: production

# Base resources
resources:
- deployment.yaml
- service.yaml
- configmap.yaml

# Patches
patchesStrategicMerge:
- patches/deployment-resources.yaml
- patches/deployment-replicas.yaml

patchesJson6902:
- target:
    group: apps
    version: v1
    kind: Deployment
    name: my-app
  patch: |-
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: NEW_ENV
        value: "new-value"

# Images
images:
- name: myregistry/my-app
  newTag: 1.0.0
- name: nginx
  newTag: 1.25-alpine

# Common labels
commonLabels:
  environment: production
  team: backend
  managed-by: kustomize

# ConfigMap generator
configMapGenerator:
- name: my-app-config
  literals:
  - LOG_LEVEL=info
  - FEATURE_FLAGS=feature1,feature2
  behavior: merge

# Secret generator
secretGenerator:
- name: my-app-secrets
  literals:
  - API_KEY=changeme
  behavior: merge

# Replicas
replicas:
- name: my-app
  count: 6
```

**Build and Apply:**
```bash
# Build manifests
kustomize build overlays/production/

# Apply manifests
kubectl apply -k overlays/production/

# Dry-run
kustomize build overlays/production/ | kubectl apply --dry-run=server -f -

# Output to file
kustomize build overlays/production/ > manifests.yaml
```

## Error Handling

### Common Pod Failures

**CrashLoopBackOff:**
```bash
# Check logs
kubectl logs <pod-name> -n production
kubectl logs <pod-name> -n production --previous

# Common causes:
# 1. Application error (check logs)
# 2. Missing config/secrets
# 3. Failed health checks
# 4. Resource limits too low
```

**ImagePullBackOff:**
```bash
# Check image
kubectl describe pod <pod-name> -n production

# Common causes:
# 1. Image doesn't exist
# 2. Wrong registry credentials
# 3. Network issues
# 4. Image tag invalid

# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=email@example.com
```

**Pending Pods:**
```bash
# Check events
kubectl describe pod <pod-name> -n production | grep Events

# Common causes:
# 1. Insufficient resources (cpu/memory)
# 2. Node selector/affinity not matching
# 3. Taints/Tolerations
# 4. Persistent volume issues
```

### Rollout Issues

**Rollout Stuck:**
```bash
# Check rollout status
kubectl rollout status deployment/my-app -n production

# Check replicaset
kubectl get rs -n production -l app=my-app

# Common causes:
# 1. Readiness probe failing
# 2. Resource limits preventing new pods
# 3. Image pull issues
# 4. Configuration errors

# Rollback
kubectl rollout undo deployment/my-app -n production
```

**Rollback Failure:**
```bash
# Check history
kubectl rollout history deployment/my-app -n production

# Rollback to specific revision
kubectl rollout undo deployment/my-app --to-revision=2 -n production

# If still failing, scale up old replicaset manually
kubectl scale rs/my-app-<old-hash> --replicas=3 -n production
```

### Debugging Tips

**Check Pod Status:**
```bash
# Get pod info
kubectl get pod <pod-name> -n production -o wide

# Describe pod
kubectl describe pod <pod-name> -n production

# Get logs
kubectl logs <pod-name> -n production --tail=100 -f

# Get logs for all containers
kubectl logs <pod-name> -n production --all-containers=true

# Get previous logs
kubectl logs <pod-name> -n production --previous
```

**Check Events:**
```bash
# Get all events
kubectl get events -n production --sort-by='.lastTimestamp'

# Get warning events
kubectl get events -n production --field-selector type=Warning

# Watch events
kubectl get events -n production --watch
```

**Connect to Pod:**
```bash
# Exec into container
kubectl exec -it <pod-name> -n production -- sh

# Port forward
kubectl port-forward <pod-name> 8080:8080 -n production

# Copy files
kubectl cp ./local-file <pod-name>:/app/file -n production
```

**Network Debugging:**
```bash
# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://my-service

# Test DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  nslookup my-service

# Check network policies
kubectl get networkpolicies -n production
```

## Output Format

**Standard Kubernetes YAML Manifest:**

All Kubernetes manifests should follow this format:

```yaml
# Metadata section
apiVersion: <api-version>
kind: <resource-kind>
metadata:
  name: <resource-name>
  namespace: <namespace>
  labels:
    app.kubernetes.io/name: <app-name>
    app.kubernetes.io/instance: <instance-name>
    app.kubernetes.io/version: "<version>"
    app.kubernetes.io/component: <component>
    app.kubernetes.io/part-of: <platform>
    app.kubernetes.io/managed-by: <management-tool>
  annotations:
    <key>: <value>

# Spec section (varies by resource type)
spec:
  <resource-specific-configuration>

# Status section (system-managed, not usually set)
status:
  <current-state>
```

**Key Requirements:**
- Use YAML format (not JSON)
- Use 2-space indentation
- Include namespace in metadata
- Add standard labels and annotations
- Separate multiple resources with `---`
- Version control all manifests
- Use semantic versioning for images

## Related Skills

- **docker-containers**: Container creation and optimization before deploying to K8s
- **monitoring**: Observability, metrics collection, and alerting for K8s workloads
- **ci-cd**: Automated deployment pipelines for K8s applications
- **security**: Container and cluster security best practices
- **cloud-platforms**: Cloud-managed K8s services (EKS, GKE, AKS)
- **service-mesh**: Advanced traffic management with Istio, Linkerd
- **helm-chart-management**: Package and distribute K8s applications
- **infrastructure-as-code**: K8s cluster provisioning with Terraform

## See Also

**Official Documentation:**
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
- [kubectl Command Reference](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

**Learning Resources:**
- [Kubernetes.io Tutorials](https://kubernetes.io/docs/tutorials/)
- [CNCF Kubernetes Training](https://www.cncf.io/certification/training/)
- [Kubernetes.io Blog](https://kubernetes.io/blog/)

**Tools and Ecosystem:**
- [Helm](https://helm.sh/) - Package manager for K8s
- [Kustomize](https://kustomize.io/) - Native K8s configuration management
- [ArgoCD](https://argoproj.github.io/argo-cd/) - GitOps continuous delivery
- [Flux](https://fluxcd.io/) - GitOps operations toolkit
- [Prometheus Operator](https://prometheus-operator.dev/) - Prometheus monitoring
- [Traefik](https://traefik.io/) - Cloud-native edge router
- [Istio](https://istio.io/) - Open service mesh
- [Lens](https://k8slens.dev/) - K8s IDE

**Best Practices:**
- [Kubernetes Production Patterns](https://github.com/globalscale/kubernetes-production-patterns)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/security-checklist/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Logging Architecture](https://kubernetes.io/docs/concepts/cluster-administration/logging/)
