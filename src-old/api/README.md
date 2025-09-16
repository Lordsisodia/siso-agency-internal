# API System 🌐

Centralized API client with type-safe request/response handling, caching, and error management.

## 🎯 Purpose
Unified API layer providing consistent data fetching, caching strategies, error handling, and type safety for all external service integration.

## 🏗️ Architecture

### API Structure
```typescript
├── clients/
│   ├── lifelock-api.ts      // LifeLock service integration
│   ├── admin-api.ts         // Administrative endpoints
│   ├── user-api.ts          // User management endpoints
│   ├── tasks-api.ts         // Task management endpoints
│   └── analytics-api.ts     // Performance and usage analytics
├── interceptors/
│   ├── auth.interceptor.ts  // Authentication token management
│   ├── error.interceptor.ts // Global error handling
│   ├── cache.interceptor.ts // Response caching logic
│   └── audit.interceptor.ts // Security audit logging
├── types/
│   ├── requests.ts          // API request interfaces
│   ├── responses.ts         // API response interfaces
│   └── errors.ts            // Error type definitions
└── utils/
    ├── retry.ts             // Retry logic for failed requests
    ├── timeout.ts           // Request timeout management
    ├── serialization.ts     // Data serialization/deserialization
    └── validation.ts        // Response validation
```

## 📁 Key API Modules

### LifeLock API Client
```typescript
// lifelock-api.ts - Core business API
export class LifeLockAPIClient {
  // Identity protection endpoints
  async getIdentityProfile(userId: string): Promise<IdentityProfile> {
    return this.request<IdentityProfile>({
      endpoint: `/users/${userId}/identity`,
      method: 'GET',
      cache: { ttl: 300, strategy: 'stale-while-revalidate' }
    });
  }

  // Security monitoring
  async getThreatAlerts(userId: string): Promise<ThreatAlert[]> {
    return this.request<ThreatAlert[]>({
      endpoint: `/users/${userId}/threats`,
      method: 'GET',
      realtime: true, // WebSocket fallback for live updates
      cache: { ttl: 60 }
    });
  }

  // Data protection
  async updateProtectionSettings(
    userId: string, 
    settings: ProtectionSettings
  ): Promise<ProtectionConfig> {
    return this.request<ProtectionConfig>({
      endpoint: `/users/${userId}/protection`,
      method: 'PATCH',
      body: settings,
      audit: true, // Trigger compliance audit log
      encryption: true // Encrypt sensitive data
    });
  }
}
```

### Task Management API
```typescript
// tasks-api.ts - Task operations
export class TasksAPIClient {
  // Support for UnifiedTaskCard component
  async getTaskDetails(taskId: string): Promise<TaskCard> {
    return this.request<TaskCard>({
      endpoint: `/tasks/${taskId}`,
      method: 'GET',
      cache: { ttl: 180 },
      retries: 3
    });
  }

  // Batch operations for performance
  async updateMultipleTasks(updates: TaskUpdate[]): Promise<TaskBatchResult> {
    return this.request<TaskBatchResult>({
      endpoint: '/tasks/batch',
      method: 'PATCH',
      body: { updates },
      timeout: 10000, // Extended timeout for batch ops
      optimistic: true // Optimistic UI updates
    });
  }
}
```

## 🔧 Request/Response Patterns

### Standardized Request Format
```typescript
// Base request interface
export interface APIRequest<T = unknown> {
  endpoint: string;
  method: HttpMethod;
  body?: T;
  headers?: HeadersInit;
  cache?: CacheConfig;
  retries?: number;
  timeout?: number;
  encryption?: boolean;
  audit?: boolean;
  optimistic?: boolean;
  realtime?: boolean;
}

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  tags?: string[]; // Cache invalidation tags
}
```

### Response Standardization
```typescript
// All API responses follow this structure
export interface APIResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
  requestId: string;
  cached?: boolean;
  fromCache?: Date;
}

// Error responses
export interface APIError {
  error: {
    code: string;
    message: string;
    details: ErrorDetail[];
    retryable: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  requestId: string;
  timestamp: Date;
}
```

## 🚀 Performance Optimizations

### Intelligent Caching System
```typescript
// Multi-level caching strategy
├── Browser Cache (HTTP headers)
├── Memory Cache (in-memory storage)
├── IndexedDB Cache (persistent client storage)
└── Service Worker Cache (offline support)

// Cache invalidation strategies
export const cacheInvalidation = {
  user: ['user-profile-updated', 'user-settings-changed'],
  tasks: ['task-created', 'task-updated', 'task-deleted'],
  lifelock: ['protection-updated', 'threat-detected'],
  system: ['feature-flag-changed', 'maintenance-mode']
};
```

### Request Batching
```typescript
// Automatic request batching for performance
export class RequestBatcher {
  private batch: Array<PendingRequest> = [];
  private timeout: NodeJS.Timeout | null = null;

  public async add<T>(request: APIRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ request, resolve, reject });
      
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), 10); // 10ms batch window
      }
    });
  }

  private async flush() {
    const batchedRequests = this.batch.splice(0);
    // Process multiple requests in single HTTP call
    const results = await this.processBatch(batchedRequests);
    // Resolve individual promises with their results
  }
}
```

## 📊 Migration Support

### Feature Flag Integration
```typescript
// API endpoints controlled by feature flags
export class APIClient {
  private async request<T>(config: APIRequest): Promise<T> {
    // Check if new endpoint should be used
    const useRefactoredEndpoint = this.featureFlags.useRefactoredAPI;
    
    const endpoint = useRefactoredEndpoint 
      ? config.endpoint.replace('/v1/', '/v2/')
      : config.endpoint;
    
    return this.executeRequest({ ...config, endpoint });
  }
}
```

### A/B Testing Support
```typescript
// API client supports A/B testing
export interface ExperimentConfig {
  experimentId: string;
  variant: 'control' | 'treatment';
  percentage: number;
  metrics: string[];
}

// Automatic experiment tracking
export const withExperiment = (config: APIRequest, experiment: ExperimentConfig) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'X-Experiment-ID': experiment.experimentId,
      'X-Variant': experiment.variant
    }
  };
};
```

## 🔐 Security Implementation

### Authentication Management
```typescript
// auth.interceptor.ts - Token management
export class AuthInterceptor {
  async onRequest(config: APIRequest): Promise<APIRequest> {
    const token = await this.tokenManager.getValidToken();
    
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'X-Request-ID': generateRequestId(),
        'X-Timestamp': Date.now().toString()
      }
    };
  }

  async onResponse(response: APIResponse): Promise<APIResponse> {
    if (response.status === 401) {
      await this.tokenManager.refreshToken();
      // Retry original request with new token
    }
    return response;
  }
}
```

### Data Encryption
```typescript
// Automatic PII encryption for LifeLock
export class EncryptionInterceptor {
  async onRequest(config: APIRequest): Promise<APIRequest> {
    if (config.encryption && config.body) {
      const encryptedBody = await this.encryptPII(config.body);
      return { ...config, body: encryptedBody };
    }
    return config;
  }

  private async encryptPII(data: unknown): Promise<EncryptedData> {
    // Use AES-256-GCM for PII data encryption
    // Integrate with key management service
  }
}
```

## 📈 Monitoring & Analytics

### Performance Tracking
```typescript
// Request performance monitoring
export interface RequestMetrics {
  endpoint: string;
  method: string;
  duration: number;
  cacheHit: boolean;
  retryCount: number;
  errorRate: number;
  userAgent: string;
  timestamp: Date;
}

// Automatic performance data collection
export class MetricsCollector {
  async trackRequest(request: APIRequest, response: APIResponse, duration: number) {
    const metrics: RequestMetrics = {
      endpoint: request.endpoint,
      method: request.method,
      duration,
      cacheHit: response.cached || false,
      retryCount: request.retries || 0,
      errorRate: this.calculateErrorRate(request.endpoint),
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };

    // Send to analytics service
    await this.analyticsClient.track('api-request', metrics);
  }
}
```

## 🚨 Error Handling

### Comprehensive Error Strategy
```typescript
// error.interceptor.ts - Global error handling
export class ErrorInterceptor {
  async onError(error: APIError, request: APIRequest): Promise<APIResponse | never> {
    // Log error with context
    this.logger.error('API Error', {
      error: error.error,
      request: this.sanitizeRequest(request),
      userContext: this.getUserContext()
    });

    // Determine retry strategy
    if (error.error.retryable && request.retries > 0) {
      await this.delay(this.calculateBackoff(request.retries));
      return this.retryRequest({ ...request, retries: request.retries - 1 });
    }

    // Handle specific error types
    switch (error.error.code) {
      case 'RATE_LIMITED':
        return this.handleRateLimit(error, request);
      case 'MAINTENANCE':
        return this.handleMaintenance(error);
      case 'PII_ENCRYPTION_FAILED':
        return this.handleEncryptionError(error, request);
      default:
        throw error;
    }
  }
}
```

## 🎯 Integration Points

### Component Integration
- **UnifiedTaskCard**: Uses tasks-api for real-time task data
- **AdminLifeLock**: Integrates with lifelock-api for identity management
- **Migration System**: API versioning supports gradual endpoint migration
- **Feature Flags**: API client adapts based on enabled features

### Hook Integration
```typescript
// API client works with specialized hooks (Phase 2 ready)
export const useAPIWithHooks = () => {
  const apiClient = useLifeLockAPIClient();
  const identity = useIdentityProtection();
  const security = useSecurityMonitoring();
  
  return { apiClient, identity, security };
};
```

## 🎯 Next Steps
1. **Phase 2A**: Implement specialized API clients for decomposed hooks
2. **Phase 2B**: Add real-time WebSocket integration for live updates
3. **Phase 2C**: Enhance caching with smart invalidation strategies
4. **Phase 3**: API versioning system for seamless migrations
5. **Phase 4**: GraphQL integration for optimized data fetching

---
*Unified API system with intelligent caching, security, and performance monitoring*