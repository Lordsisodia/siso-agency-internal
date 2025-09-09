# Constants System 📏

Application-wide constants, enumerations, and static configuration values with type safety and centralized management.

## 🎯 Purpose
Centralized constant definitions ensuring consistency across components, preventing magic numbers, and providing type-safe enumerations for application logic.

## 🏗️ Architecture

### Constants Structure
```typescript
├── enums/
│   ├── task-status.enum.ts      // Task management enumerations
│   ├── protection-level.enum.ts // LifeLock protection levels
│   ├── user-roles.enum.ts       // User permission roles
│   ├── notification-types.enum.ts // Notification categories
│   └── api-endpoints.enum.ts    // API endpoint constants
├── values/
│   ├── timeouts.constants.ts    // Timeout and duration values
│   ├── limits.constants.ts      // Size and count limitations
│   ├── formats.constants.ts     // Data format patterns
│   ├── colors.constants.ts      // Design system colors
│   └── breakpoints.constants.ts // Responsive breakpoints
├── configurations/
│   ├── feature-flags.constants.ts // Feature flag definitions
│   ├── performance.constants.ts   // Performance thresholds
│   ├── security.constants.ts      // Security configurations
│   ├── validation.constants.ts    // Validation rules
│   └── cache.constants.ts         // Cache configurations
├── business/
│   ├── lifelock.constants.ts    // LifeLock business rules
│   ├── compliance.constants.ts  // Regulatory compliance values
│   ├── pricing.constants.ts     // Pricing and billing constants
│   └── workflows.constants.ts   // Business process constants
└── ui/
    ├── animations.constants.ts  // Animation timing and easing
    ├── spacing.constants.ts     // Layout spacing values
    ├── typography.constants.ts  // Font and text constants
    └── z-index.constants.ts     // Layer stacking order
```

## 📁 Core Constant Definitions

### Task Management Constants
```typescript
// enums/task-status.enum.ts - Task lifecycle states
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  REVIEW = 'review'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

// Integration with UnifiedTaskCard component
export const TASK_STATUS_CONFIG = {
  [TaskStatus.PENDING]: {
    label: 'Pending',
    color: 'var(--color-warning)',
    icon: 'clock',
    allowedTransitions: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED]
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'var(--color-info)',
    icon: 'play',
    allowedTransitions: [TaskStatus.COMPLETED, TaskStatus.ON_HOLD, TaskStatus.CANCELLED]
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    color: 'var(--color-success)',
    icon: 'check',
    allowedTransitions: [TaskStatus.REVIEW] // Only admin can reopen
  },
  [TaskStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'var(--color-error)',
    icon: 'x',
    allowedTransitions: [TaskStatus.PENDING] // Can be reactivated
  }
} as const;

export const TASK_PRIORITY_CONFIG = {
  [TaskPriority.LOW]: {
    label: 'Low',
    color: 'var(--color-success)',
    weight: 1,
    slaHours: 120 // 5 days
  },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    color: 'var(--color-info)',
    weight: 2,
    slaHours: 72 // 3 days
  },
  [TaskPriority.HIGH]: {
    label: 'High',
    color: 'var(--color-warning)',
    weight: 3,
    slaHours: 24 // 1 day
  },
  [TaskPriority.URGENT]: {
    label: 'Urgent',
    color: 'var(--color-error)',
    weight: 4,
    slaHours: 8 // Same day
  },
  [TaskPriority.CRITICAL]: {
    label: 'Critical',
    color: 'var(--color-error-dark)',
    weight: 5,
    slaHours: 2 // Immediate attention
  }
} as const;
```

### LifeLock Business Constants
```typescript
// business/lifelock.constants.ts - LifeLock domain constants
export enum ProtectionLevel {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SecurityStatus {
  SECURE = 'secure',
  MONITORING = 'monitoring',
  ALERT = 'alert',
  BREACH = 'breach',
  MAINTENANCE = 'maintenance'
}

// Protection level configurations
export const PROTECTION_LEVEL_CONFIG = {
  [ProtectionLevel.BASIC]: {
    name: 'Basic Protection',
    monthlyPrice: 9.99,
    features: [
      'Identity monitoring',
      'Credit report alerts',
      'Dark web monitoring'
    ],
    maxAlerts: 10,
    scanFrequency: 'weekly',
    supportLevel: 'standard'
  },
  [ProtectionLevel.ADVANCED]: {
    name: 'Advanced Protection',
    monthlyPrice: 19.99,
    features: [
      'Identity monitoring',
      'Credit report alerts',
      'Dark web monitoring',
      'Social security monitoring',
      'Address change monitoring'
    ],
    maxAlerts: 50,
    scanFrequency: 'daily',
    supportLevel: 'priority'
  },
  [ProtectionLevel.PREMIUM]: {
    name: 'Premium Protection',
    monthlyPrice: 29.99,
    features: [
      'All Advanced features',
      'Bank account monitoring',
      'Investment account monitoring',
      '401k monitoring',
      'Insurance monitoring'
    ],
    maxAlerts: 'unlimited',
    scanFrequency: 'real-time',
    supportLevel: 'premium'
  },
  [ProtectionLevel.ENTERPRISE]: {
    name: 'Enterprise Protection',
    monthlyPrice: 99.99,
    features: [
      'All Premium features',
      'Employee monitoring',
      'Bulk management',
      'API access',
      'Custom reporting'
    ],
    maxAlerts: 'unlimited',
    scanFrequency: 'real-time',
    supportLevel: 'dedicated'
  }
} as const;

// Threat severity configurations
export const THREAT_SEVERITY_CONFIG = {
  [ThreatSeverity.LOW]: {
    name: 'Low Risk',
    color: 'var(--color-success)',
    responseTime: '7 days',
    autoResolve: true,
    notificationMethod: 'email'
  },
  [ThreatSeverity.MEDIUM]: {
    name: 'Medium Risk',
    color: 'var(--color-warning)',
    responseTime: '24 hours',
    autoResolve: false,
    notificationMethod: 'email + sms'
  },
  [ThreatSeverity.HIGH]: {
    name: 'High Risk',
    color: 'var(--color-error)',
    responseTime: '2 hours',
    autoResolve: false,
    notificationMethod: 'email + sms + push'
  },
  [ThreatSeverity.CRITICAL]: {
    name: 'Critical Risk',
    color: 'var(--color-error-dark)',
    responseTime: '30 minutes',
    autoResolve: false,
    notificationMethod: 'email + sms + push + phone'
  }
} as const;
```

### Performance and Limits Constants
```typescript
// values/limits.constants.ts - Application limits and thresholds
export const PERFORMANCE_LIMITS = {
  // Component rendering limits
  MAX_TASK_CARDS_PER_PAGE: 50,
  MAX_THREAT_ALERTS_DISPLAY: 25,
  MAX_NOTIFICATION_QUEUE: 10,
  MAX_SEARCH_RESULTS: 100,
  
  // File and data limits
  MAX_FILE_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PROFILE_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_DOCUMENT_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_BATCH_OPERATION_SIZE: 1000,
  
  // API limits
  MAX_API_RETRY_ATTEMPTS: 3,
  MAX_CONCURRENT_REQUESTS: 10,
  MAX_REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  
  // User interaction limits
  MAX_LOGIN_ATTEMPTS: 5,
  MAX_PASSWORD_RESET_ATTEMPTS: 3,
  MAX_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_IDLE_TIME: 30 * 60 * 1000, // 30 minutes
  
  // Data validation limits
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_TASK_TITLE_LENGTH: 100,
  MAX_TASK_DESCRIPTION_LENGTH: 2000
} as const;

// values/timeouts.constants.ts - Timeout and duration values
export const TIMEOUTS = {
  // API timeouts
  API_REQUEST_TIMEOUT: 10000, // 10 seconds
  FILE_UPLOAD_TIMEOUT: 60000, // 1 minute
  AUTHENTICATION_TIMEOUT: 5000, // 5 seconds
  
  // UI interaction timeouts
  NOTIFICATION_AUTO_DISMISS: 5000, // 5 seconds
  TOOLTIP_DELAY: 500, // 500ms
  DEBOUNCE_SEARCH: 300, // 300ms
  DEBOUNCE_SAVE: 1000, // 1 second
  
  // Cache timeouts
  CACHE_TTL_SHORT: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL_MEDIUM: 30 * 60 * 1000, // 30 minutes
  CACHE_TTL_LONG: 24 * 60 * 60 * 1000, // 24 hours
  
  // Feature flag refresh
  FEATURE_FLAG_REFRESH: 5 * 60 * 1000, // 5 minutes
  
  // Performance monitoring
  PERFORMANCE_METRIC_COLLECTION: 10000, // 10 seconds
  ERROR_REPORTING_BATCH: 30000 // 30 seconds
} as const;
```

### Feature Flag Constants
```typescript
// configurations/feature-flags.constants.ts - Feature flag definitions
export enum FeatureFlagKey {
  // Phase 1 flags (completed)
  USE_UNIFIED_TASK_CARD = 'useUnifiedTaskCard',
  USE_TASK_CARD_UTILS = 'useTaskCardUtils',
  USE_REFACTORED_ADMIN_LIFELOCK = 'useRefactoredAdminLifeLock',
  
  // Phase 2 flags (ready for implementation)
  USE_REFACTORED_LIFELOCK_HOOKS = 'useRefactoredLifeLockHooks',
  USE_OPTIMIZED_COMPONENTS = 'useOptimizedComponents',
  USE_ENHANCED_CACHING = 'useEnhancedCaching',
  
  // Phase 3 flags (planned)
  USE_UNIFIED_THEME_SYSTEM = 'useUnifiedThemeSystem',
  USE_DARK_MODE = 'useDarkMode',
  USE_HIGH_CONTRAST = 'useHighContrast',
  
  // Experimental flags
  USE_EXPERIMENTAL_CHARTS = 'useExperimentalCharts',
  USE_AI_ASSISTANCE = 'useAIAssistance',
  USE_ADVANCED_ANALYTICS = 'useAdvancedAnalytics'
}

export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlagKey, boolean> = {
  // Phase 1 - Production ready
  [FeatureFlagKey.USE_UNIFIED_TASK_CARD]: true,
  [FeatureFlagKey.USE_TASK_CARD_UTILS]: true,
  [FeatureFlagKey.USE_REFACTORED_ADMIN_LIFELOCK]: true,
  
  // Phase 2 - Development ready
  [FeatureFlagKey.USE_REFACTORED_LIFELOCK_HOOKS]: false,
  [FeatureFlagKey.USE_OPTIMIZED_COMPONENTS]: true,
  [FeatureFlagKey.USE_ENHANCED_CACHING]: true,
  
  // Phase 3 - Planned
  [FeatureFlagKey.USE_UNIFIED_THEME_SYSTEM]: false,
  [FeatureFlagKey.USE_DARK_MODE]: false,
  [FeatureFlagKey.USE_HIGH_CONTRAST]: false,
  
  // Experimental - Disabled by default
  [FeatureFlagKey.USE_EXPERIMENTAL_CHARTS]: false,
  [FeatureFlagKey.USE_AI_ASSISTANCE]: false,
  [FeatureFlagKey.USE_ADVANCED_ANALYTICS]: false
} as const;

// Feature flag metadata for migration system
export const FEATURE_FLAG_METADATA = {
  [FeatureFlagKey.USE_UNIFIED_TASK_CARD]: {
    description: 'Use refactored UnifiedTaskCard component',
    phase: 1,
    rolloutPercentage: 100,
    dependencies: [FeatureFlagKey.USE_TASK_CARD_UTILS],
    performanceImpact: 'positive',
    rollbackRisk: 'low'
  },
  [FeatureFlagKey.USE_REFACTORED_LIFELOCK_HOOKS]: {
    description: 'Use decomposed LifeLock hooks (Phase 2)',
    phase: 2,
    rolloutPercentage: 0,
    dependencies: [FeatureFlagKey.USE_REFACTORED_ADMIN_LIFELOCK],
    performanceImpact: 'positive',
    rollbackRisk: 'medium'
  },
  [FeatureFlagKey.USE_UNIFIED_THEME_SYSTEM]: {
    description: 'Complete theme system integration (Phase 3)',
    phase: 3,
    rolloutPercentage: 0,
    dependencies: [FeatureFlagKey.USE_OPTIMIZED_COMPONENTS],
    performanceImpact: 'neutral',
    rollbackRisk: 'high'
  }
} as const;
```

### UI and Design Constants
```typescript
// ui/spacing.constants.ts - Layout spacing system
export const SPACING = {
  // Base spacing unit (4px)
  BASE: 4,
  
  // Spacing scale
  XS: 4,   // 4px
  SM: 8,   // 8px
  MD: 16,  // 16px
  LG: 24,  // 24px
  XL: 32,  // 32px
  XXL: 48, // 48px
  XXXL: 64, // 64px
  
  // Component-specific spacing
  COMPONENT_PADDING: 16,
  SECTION_MARGIN: 32,
  PAGE_PADDING: 24,
  CARD_PADDING: 20,
  BUTTON_PADDING: 12,
  
  // Grid system
  GRID_GUTTER: 16,
  GRID_MARGIN: 24,
  CONTAINER_MAX_WIDTH: 1200,
  
  // Interactive elements
  FOCUS_OUTLINE_WIDTH: 2,
  BORDER_WIDTH: 1,
  BORDER_RADIUS_SM: 4,
  BORDER_RADIUS_MD: 8,
  BORDER_RADIUS_LG: 12
} as const;

// ui/z-index.constants.ts - Layer stacking order
export const Z_INDEX = {
  // Base layers
  BASE: 0,
  CONTENT: 1,
  
  // Interactive elements
  DROPDOWN: 100,
  STICKY: 200,
  TOOLTIP: 300,
  POPOVER: 400,
  
  // Overlays
  MODAL_BACKDROP: 900,
  MODAL: 1000,
  NOTIFICATION: 1100,
  
  // System overlays
  LOADING_OVERLAY: 1200,
  ERROR_OVERLAY: 1300,
  DEBUG_OVERLAY: 9999
} as const;

// ui/animations.constants.ts - Animation timing and easing
export const ANIMATIONS = {
  // Duration constants
  DURATION_FAST: 150,
  DURATION_NORMAL: 250,
  DURATION_SLOW: 350,
  DURATION_SLOWER: 500,
  
  // Easing functions
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Transition configurations
  TRANSITIONS: {
    DEFAULT: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    FAST: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    SLOW: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSFORM: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    OPACITY: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Component-specific animations
  TASK_CARD_HOVER: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: ['transform', 'box-shadow']
  },
  
  MODAL_ENTER: {
    duration: 300,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    properties: ['opacity', 'transform']
  },
  
  NOTIFICATION_SLIDE: {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: ['transform', 'opacity']
  }
} as const;
```

### Security and Compliance Constants
```typescript
// configurations/security.constants.ts - Security configurations
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUserInfoInPassword: true
  },
  
  // Session security
  SESSION_CONFIG: {
    maxDuration: 24 * 60 * 60 * 1000, // 24 hours
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    renewThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    secureCookies: true,
    sameSitePolicy: 'strict'
  },
  
  // Rate limiting
  RATE_LIMITS: {
    login: { attempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    passwordReset: { attempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    apiGeneral: { attempts: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    fileUpload: { attempts: 10, windowMs: 60 * 1000 } // 10 uploads per minute
  },
  
  // Encryption settings
  ENCRYPTION: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
    ivLength: 12,
    tagLength: 16,
    keyRotationDays: 90
  },
  
  // Compliance settings
  COMPLIANCE: {
    auditRetentionDays: 2555, // 7 years for financial data
    piiEncryptionRequired: true,
    dataMinimization: true,
    rightToErasure: true,
    consentRequired: true
  }
} as const;
```

## 🔧 Constant Usage Patterns

### Type-Safe Constant Access
```typescript
// utils/constant-helpers.ts - Type-safe constant utilities
export const getTaskStatusConfig = (status: TaskStatus) => {
  return TASK_STATUS_CONFIG[status];
};

export const getProtectionLevelFeatures = (level: ProtectionLevel) => {
  return PROTECTION_LEVEL_CONFIG[level].features;
};

export const isValidTaskTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  return TASK_STATUS_CONFIG[from].allowedTransitions.includes(to);
};

// Validation using constants
export const validateTaskPriority = (priority: string): priority is TaskPriority => {
  return Object.values(TaskPriority).includes(priority as TaskPriority);
};

export const validateProtectionLevel = (level: string): level is ProtectionLevel => {
  return Object.values(ProtectionLevel).includes(level as ProtectionLevel);
};
```

### Component Integration
```typescript
// Example: UnifiedTaskCard using constants
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, SPACING, Z_INDEX } from '@/constants';

export const UnifiedTaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  
  return (
    <div
      className="task-card"
      style={{
        padding: SPACING.CARD_PADDING,
        borderLeft: `4px solid ${priorityConfig.color}`,
        zIndex: Z_INDEX.CONTENT
      }}
    >
      <div className="task-status" style={{ color: statusConfig.color }}>
        <Icon name={statusConfig.icon} />
        {statusConfig.label}
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
};
```

## 📊 Constant Validation and Testing

### Runtime Validation
```typescript
// utils/constant-validation.ts - Runtime constant validation
export const validateConstants = () => {
  const errors: string[] = [];
  
  // Validate enum completeness
  const taskStatuses = Object.keys(TASK_STATUS_CONFIG);
  const enumStatuses = Object.values(TaskStatus);
  
  if (taskStatuses.length !== enumStatuses.length) {
    errors.push('Task status config incomplete');
  }
  
  // Validate timeout values
  if (TIMEOUTS.API_REQUEST_TIMEOUT < 1000) {
    errors.push('API timeout too short');
  }
  
  // Validate limits
  if (PERFORMANCE_LIMITS.MAX_TASK_CARDS_PER_PAGE > 100) {
    errors.push('Task card limit too high for performance');
  }
  
  if (errors.length > 0) {
    throw new Error(`Constant validation failed: ${errors.join(', ')}`);
  }
};

// Development mode validation
if (process.env.NODE_ENV === 'development') {
  validateConstants();
}
```

### Constant Testing
```typescript
// constants/__tests__/constants.test.ts
describe('Application Constants', () => {
  test('task status transitions are valid', () => {
    expect(TASK_STATUS_CONFIG[TaskStatus.PENDING].allowedTransitions).toContain(TaskStatus.IN_PROGRESS);
    expect(TASK_STATUS_CONFIG[TaskStatus.COMPLETED].allowedTransitions).not.toContain(TaskStatus.PENDING);
  });
  
  test('protection levels have valid pricing', () => {
    Object.values(PROTECTION_LEVEL_CONFIG).forEach(config => {
      expect(config.monthlyPrice).toBeGreaterThan(0);
      expect(config.features).toHaveLength.toBeGreaterThan(0);
    });
  });
  
  test('performance limits are reasonable', () => {
    expect(PERFORMANCE_LIMITS.MAX_TASK_CARDS_PER_PAGE).toBeLessThanOrEqual(100);
    expect(TIMEOUTS.API_REQUEST_TIMEOUT).toBeGreaterThanOrEqual(5000);
  });
});
```

## 🎯 Migration Integration

### Feature Flag Constant Integration
```typescript
// Integration with migration system constants
export const MIGRATION_CONSTANTS = {
  PHASES: {
    PHASE_1: {
      name: 'Component Unification',
      flags: [
        FeatureFlagKey.USE_UNIFIED_TASK_CARD,
        FeatureFlagKey.USE_TASK_CARD_UTILS,
        FeatureFlagKey.USE_REFACTORED_ADMIN_LIFELOCK
      ],
      completionCriteria: {
        allFlagsEnabled: true,
        performanceThreshold: 0.05, // 5% error rate max
        rolloutPercentage: 100
      }
    },
    PHASE_2: {
      name: 'Hook Decomposition',
      flags: [
        FeatureFlagKey.USE_REFACTORED_LIFELOCK_HOOKS,
        FeatureFlagKey.USE_OPTIMIZED_COMPONENTS
      ],
      prerequisites: ['PHASE_1'],
      targetMetrics: {
        hookExecutionTime: 200, // ms
        reRenderReduction: 60, // percent
        memoryReduction: 45 // percent
      }
    }
  },
  
  ROLLBACK_THRESHOLDS: {
    errorRate: 0.05, // 5%
    performanceDegradation: 0.3, // 30%
    userSatisfaction: 0.7 // 70% minimum
  }
} as const;
```

## 🎯 Next Steps
1. **Phase 2A**: Add constants for decomposed hook configurations
2. **Phase 2B**: Implement constant-driven performance monitoring
3. **Phase 3A**: Add theme system constants
4. **Phase 3B**: Implement constant validation automation
5. **Phase 4**: Dynamic constant loading and A/B testing

---
*Centralized constants system with type safety and comprehensive validation*