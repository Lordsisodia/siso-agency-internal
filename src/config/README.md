# Configuration System ⚙️

Centralized configuration management with environment-specific settings, feature flags, and runtime configuration.

## 🎯 Purpose
Unified configuration system managing environment variables, feature flags, API endpoints, and application settings with type safety and hot-reloading support.

## 🏗️ Architecture

### Configuration Structure
```typescript
├── environments/
│   ├── development.ts       // Development environment config
│   ├── staging.ts           // Staging environment config
│   ├── production.ts        // Production environment config
│   └── test.ts              // Testing environment config
├── features/
│   ├── feature-flags.ts     // Feature flag definitions
│   ├── experiments.ts       // A/B testing configuration
│   ├── rollout-config.ts    // Gradual rollout settings
│   └── performance.ts       // Performance thresholds
├── api/
│   ├── endpoints.ts         // API endpoint configuration
│   ├── timeouts.ts          // Request timeout settings
│   ├── retry-policies.ts    // Retry configuration
│   └── rate-limits.ts       // Rate limiting configuration
├── security/
│   ├── encryption.ts        // Encryption configuration
│   ├── auth.ts              // Authentication settings
│   ├── compliance.ts        // Regulatory compliance settings
│   └── audit.ts             // Audit logging configuration
└── theme/
    ├── colors.ts            // Color palette configuration
    ├── typography.ts        // Font and text configuration
    ├── spacing.ts           // Layout spacing configuration
    └── breakpoints.ts       // Responsive breakpoints
```

## 📁 Core Configuration Modules

### Environment Configuration
```typescript
// environments/production.ts
export const productionConfig: AppConfig = {
  app: {
    name: 'SISO Internal',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildNumber: process.env.REACT_APP_BUILD_NUMBER || 'unknown',
    environment: 'production'
  },
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'https://api.siso-internal.com',
    timeout: 10000,
    retries: 3,
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 100
    }
  },
  features: {
    // Production feature flags
    useRefactoredAdminLifeLock: true,
    useRefactoredLifeLockHooks: true,
    useUnifiedTaskCard: true,
    useTaskCardUtils: true,
    useUnifiedThemeSystem: false, // Phase 3
    useOptimizedComponents: true,
    enablePerformanceMonitoring: true,
    enableErrorTracking: true
  },
  security: {
    encryptionEnabled: true,
    auditLoggingEnabled: true,
    complianceMode: 'strict',
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5
  }
};
```

### Feature Flag Management
```typescript
// features/feature-flags.ts - Integration with migration system
export interface FeatureFlagConfig {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: Environment[];
  dependencies: string[];
  metrics: string[];
  rollbackThreshold: PerformanceThreshold;
}

export const featureFlags: Record<string, FeatureFlagConfig> = {
  useUnifiedTaskCard: {
    key: 'useUnifiedTaskCard',
    name: 'Unified Task Card Component',
    description: 'Use refactored UnifiedTaskCard replacing 5,100+ lines',
    enabled: true,
    rolloutPercentage: 100,
    environment: ['development', 'staging', 'production'],
    dependencies: ['useTaskCardUtils'],
    metrics: ['render_time', 'memory_usage', 'error_rate'],
    rollbackThreshold: {
      errorRate: 0.05, // 5% error rate triggers rollback
      renderTime: 500,  // 500ms render time threshold
      memoryUsage: 50   // 50MB memory threshold
    }
  },
  useRefactoredLifeLockHooks: {
    key: 'useRefactoredLifeLockHooks',
    name: 'Decomposed LifeLock Hooks',
    description: 'Phase 2: Decompose 227-line useLifeLockData hook',
    enabled: false, // Planned for Phase 2
    rolloutPercentage: 0,
    environment: ['development'],
    dependencies: ['useRefactoredAdminLifeLock'],
    metrics: ['hook_execution_time', 're_render_count', 'memory_efficiency'],
    rollbackThreshold: {
      errorRate: 0.02,
      renderTime: 200,
      memoryUsage: 30
    }
  }
};
```

### Performance Configuration
```typescript
// features/performance.ts
export const performanceConfig = {
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1, // 10% of users for performance monitoring
    vitalsThresholds: {
      FCP: 1800,  // First Contentful Paint (ms)
      LCP: 2500,  // Largest Contentful Paint (ms)
      FID: 100,   // First Input Delay (ms)
      CLS: 0.1    // Cumulative Layout Shift
    }
  },
  optimization: {
    lazyLoading: {
      enabled: true,
      threshold: 0.1, // Load when 10% visible
      rootMargin: '50px'
    },
    memoization: {
      enabled: true,
      maxCacheSize: 100,
      ttl: 300000 // 5 minutes
    },
    bundleSplitting: {
      enabled: true,
      chunkSizeThreshold: 250000, // 250KB
      maxChunks: 10
    }
  }
};
```

## 🔧 Configuration Loading System

### Environment Detection
```typescript
// config/index.ts - Main configuration loader
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: AppConfig;
  private featureFlags: FeatureFlags;

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private constructor() {
    this.loadConfiguration();
    this.setupHotReloading();
  }

  private loadConfiguration() {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
      case 'production':
        this.config = productionConfig;
        break;
      case 'staging':
        this.config = stagingConfig;
        break;
      case 'test':
        this.config = testConfig;
        break;
      default:
        this.config = developmentConfig;
    }

    // Load feature flags from remote config service
    this.loadFeatureFlags();
  }

  private async loadFeatureFlags() {
    try {
      // In production, load from remote service
      if (this.config.app.environment === 'production') {
        const remoteFlags = await this.fetchRemoteFeatureFlags();
        this.featureFlags = { ...featureFlags, ...remoteFlags };
      } else {
        this.featureFlags = featureFlags;
      }
    } catch (error) {
      console.warn('Failed to load remote feature flags, using defaults');
      this.featureFlags = featureFlags;
    }
  }
}
```

### Hot Reloading Support
```typescript
// Development hot reloading for feature flags
export class HotReloadManager {
  private watchers: Map<string, Function> = new Map();

  public watchFeatureFlags(callback: (flags: FeatureFlags) => void) {
    if (process.env.NODE_ENV === 'development') {
      const watcher = setInterval(async () => {
        const updatedFlags = await this.checkForUpdates();
        if (updatedFlags) {
          callback(updatedFlags);
        }
      }, 5000); // Check every 5 seconds

      this.watchers.set('feature-flags', () => clearInterval(watcher));
    }
  }

  public dispose() {
    this.watchers.forEach(dispose => dispose());
    this.watchers.clear();
  }
}
```

## 📊 Configuration Validation

### Runtime Validation
```typescript
// config/validation.ts - Configuration validation
import { z } from 'zod';

export const configSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    environment: z.enum(['development', 'staging', 'production', 'test'])
  }),
  api: z.object({
    baseURL: z.string().url(),
    timeout: z.number().positive(),
    retries: z.number().min(0).max(5)
  }),
  features: z.record(z.boolean()),
  security: z.object({
    encryptionEnabled: z.boolean(),
    sessionTimeout: z.number().positive(),
    maxLoginAttempts: z.number().positive()
  })
});

export const validateConfig = (config: unknown): AppConfig => {
  try {
    return configSchema.parse(config);
  } catch (error) {
    throw new Error(`Invalid configuration: ${error.message}`);
  }
};
```

### Type Safety
```typescript
// Strict typing for all configuration
export interface AppConfig {
  app: AppMetadata;
  api: APIConfiguration;
  features: FeatureFlags;
  security: SecurityConfiguration;
  theme: ThemeConfiguration;
  performance: PerformanceConfiguration;
}

// Environment-specific overrides
export type EnvironmentConfig = {
  [K in keyof AppConfig]?: Partial<AppConfig[K]>;
};
```

## 🚀 Migration Integration

### Feature Flag Orchestration
```typescript
// Integration with src/migration/feature-flags.ts
export class MigrationConfigManager {
  public async enableFeature(featureKey: string, percentage: number = 100) {
    const config = await this.getFeatureConfig(featureKey);
    
    // Gradual rollout
    await this.updateRolloutPercentage(featureKey, percentage);
    
    // Monitor performance metrics
    this.startPerformanceMonitoring(featureKey, config.metrics);
    
    // Set up automatic rollback if thresholds exceeded
    this.setupRollbackTriggers(featureKey, config.rollbackThreshold);
  }

  public async rollbackFeature(featureKey: string) {
    await this.updateRolloutPercentage(featureKey, 0);
    await this.notifyDevelopmentTeam('Feature rollback', { featureKey });
  }
}
```

### Phase Planning Configuration
```typescript
// Phase-based configuration management
export const phaseConfiguration = {
  phase1: {
    name: 'Component Unification',
    features: ['useUnifiedTaskCard', 'useTaskCardUtils'],
    status: 'completed',
    rolloutPercentage: 100
  },
  phase2: {
    name: 'Hook Decomposition',
    features: ['useRefactoredLifeLockHooks', 'useOptimizedComponents'],
    status: 'planned',
    rolloutPercentage: 0,
    prerequisites: ['phase1']
  },
  phase3: {
    name: 'Theme System Integration',
    features: ['useUnifiedThemeSystem'],
    status: 'planned',
    rolloutPercentage: 0,
    prerequisites: ['phase2']
  }
};
```

## 🔐 Security Configuration

### Compliance Settings
```typescript
// security/compliance.ts
export const complianceConfig = {
  gdpr: {
    enabled: true,
    dataRetentionDays: 1095, // 3 years
    rightToErasure: true,
    consentRequired: true
  },
  ccpa: {
    enabled: true,
    doNotSellEnabled: true,
    dataDisclosureRequired: true
  },
  soc2: {
    enabled: true,
    auditLoggingLevel: 'detailed',
    encryptionAtRest: true,
    encryptionInTransit: true
  },
  lifelockCompliance: {
    piiEncryption: 'AES-256-GCM',
    keyRotationDays: 90,
    accessLogging: 'all',
    anomalyDetection: true
  }
};
```

## 🎯 Development Guidelines

### Configuration Best Practices
```typescript
// Always use the configuration manager
const config = ConfigurationManager.getInstance();
const apiUrl = config.get('api.baseURL');
const isFeatureEnabled = config.isFeatureEnabled('useUnifiedTaskCard');

// Environment-specific behavior
if (config.isDevelopment()) {
  // Development-only features
  enableDebugMode();
}

// Type-safe configuration access
const timeout: number = config.get('api.timeout'); // TypeScript ensures number type
```

### Testing Configuration
```typescript
// Test configuration override
export const createTestConfig = (overrides: Partial<AppConfig> = {}): AppConfig => {
  return {
    ...defaultConfig,
    ...overrides,
    app: {
      ...defaultConfig.app,
      environment: 'test',
      ...overrides.app
    }
  };
};
```

## 🎯 Next Steps
1. **Phase 2A**: Add specialized configuration for decomposed hooks
2. **Phase 2B**: Implement remote feature flag management service
3. **Phase 2C**: Add real-time configuration updates
4. **Phase 3**: Theme system configuration integration
5. **Phase 4**: AI-assisted configuration optimization

---
*Centralized configuration system supporting 91 feature flags with type-safe environment management*