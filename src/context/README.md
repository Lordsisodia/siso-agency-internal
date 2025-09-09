# Context System 🔄

React Context providers for global state management, theme control, and cross-component data sharing.

## 🎯 Purpose
Centralized state management using React Context API for global application state, user sessions, theme management, and feature flag coordination.

## 🏗️ Architecture

### Context Structure
```typescript
├── providers/
│   ├── AppProvider.tsx          // Root application provider
│   ├── ThemeProvider.tsx        // Theme and styling context
│   ├── AuthProvider.tsx         // Authentication state management
│   ├── FeatureFlagsProvider.tsx // Feature flag state management
│   └── LifeLockProvider.tsx     // LifeLock domain context
├── hooks/
│   ├── useAppContext.ts         // Application context hook
│   ├── useTheme.ts              // Theme context hook
│   ├── useAuth.ts               // Authentication context hook
│   ├── useFeatureFlags.ts       // Feature flags context hook
│   └── useLifeLock.ts           // LifeLock context hook
├── types/
│   ├── context.types.ts         // Context interface definitions
│   ├── theme.types.ts           // Theme-related types
│   └── auth.types.ts            // Authentication types
└── utils/
    ├── context-helpers.ts       // Context utility functions
    ├── state-persistence.ts    // Local storage integration
    └── context-devtools.ts     // Development debugging tools
```

## 📁 Core Context Providers

### Application Provider
```typescript
// providers/AppProvider.tsx - Root application state
interface AppContextValue {
  // Application metadata
  version: string;
  buildNumber: string;
  environment: Environment;
  
  // Global UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Notification system
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  
  // Performance monitoring
  performanceMetrics: PerformanceMetrics;
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    cacheHitRate: 0
  });

  // Notification management
  const addNotification = useCallback((notification: Notification) => {
    const id = generateId();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => removeNotification(id), notification.duration || 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Performance metrics tracking
  const updateMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    setPerformanceMetrics(prev => ({ ...prev, ...metrics }));
  }, []);

  const value: AppContextValue = {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildNumber: process.env.REACT_APP_BUILD_NUMBER || 'unknown',
    environment: process.env.NODE_ENV as Environment,
    sidebarOpen,
    setSidebarOpen,
    loading,
    setLoading,
    notifications,
    addNotification,
    removeNotification,
    performanceMetrics,
    updateMetrics
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
```

### Feature Flags Provider
```typescript
// providers/FeatureFlagsProvider.tsx - Feature flag state management
interface FeatureFlagsContextValue {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  updateFlag: (flag: keyof FeatureFlags, enabled: boolean) => void;
  rolloutPercentage: Record<string, number>;
  updateRollout: (flag: string, percentage: number) => void;
  experimentConfig: ExperimentConfig;
  performanceThresholds: PerformanceThresholds;
}

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Integration with src/migration/feature-flags.ts
  const [flags, setFlags] = useState<FeatureFlags>({
    useRefactoredAdminLifeLock: true,
    useRefactoredLifeLockHooks: false, // Phase 2 ready
    useUnifiedTaskCard: true,
    useTaskCardUtils: true,
    useUnifiedThemeSystem: false, // Phase 3 planned
    useOptimizedComponents: true
  });

  const [rolloutPercentage, setRolloutPercentage] = useState<Record<string, number>>({
    useUnifiedTaskCard: 100, // Full rollout
    useRefactoredAdminLifeLock: 100,
    useRefactoredLifeLockHooks: 0, // Not yet released
    useUnifiedThemeSystem: 0
  });

  // Performance monitoring for feature flags
  const [performanceThresholds] = useState<PerformanceThresholds>({
    errorRate: 0.05, // 5% error rate triggers rollback
    renderTime: 500,  // 500ms render time threshold
    memoryUsage: 50   // 50MB memory threshold
  });

  // Feature flag evaluation with A/B testing
  const isEnabled = useCallback((flag: keyof FeatureFlags): boolean => {
    const baseEnabled = flags[flag];
    const percentage = rolloutPercentage[flag] || 0;
    
    // If fully enabled, return true
    if (baseEnabled && percentage === 100) {
      return true;
    }
    
    // If disabled or 0% rollout, return false
    if (!baseEnabled || percentage === 0) {
      return false;
    }
    
    // Gradual rollout based on user ID hash
    const userHash = getUserHash(); // Consistent per user
    return (userHash % 100) < percentage;
  }, [flags, rolloutPercentage]);

  // Dynamic flag updates with performance monitoring
  const updateFlag = useCallback((flag: keyof FeatureFlags, enabled: boolean) => {
    setFlags(prev => ({ ...prev, [flag]: enabled }));
    
    // Track flag changes for analytics
    trackFeatureFlagChange(flag, enabled);
    
    // Monitor performance impact
    monitorPerformanceImpact(flag, enabled);
  }, []);

  const value: FeatureFlagsContextValue = {
    flags,
    isEnabled,
    updateFlag,
    rolloutPercentage,
    updateRollout: (flag, percentage) => {
      setRolloutPercentage(prev => ({ ...prev, [flag]: percentage }));
    },
    experimentConfig: {
      enabled: process.env.NODE_ENV === 'production',
      sampleRate: 0.1 // 10% of users for experiments
    },
    performanceThresholds
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
```

### Theme Provider (Phase 3 Ready)
```typescript
// providers/ThemeProvider.tsx - Theme and styling context
interface ThemeContextValue {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  resolvedTheme: 'light' | 'dark';
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  colorScheme: ColorScheme;
  spacing: SpacingScale;
  typography: TypographyScale;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state management
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [highContrast, setHighContrast] = useState(false);
  
  // System preference detection
  const systemTheme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Resolved theme calculation
  const resolvedTheme = theme === 'auto' ? systemTheme : theme;
  
  // Theme configuration loading
  const themeConfig = useMemo(() => {
    const baseTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
    const contrastTheme = highContrast ? highContrastTheme : {};
    
    return mergeThemes(baseTheme, contrastTheme);
  }, [resolvedTheme, highContrast]);

  // CSS custom properties injection
  useEffect(() => {
    injectCSSCustomProperties(themeConfig);
    
    // Update document class for theme-specific styles
    document.documentElement.className = [
      `theme-${resolvedTheme}`,
      highContrast ? 'high-contrast' : '',
      reducedMotion ? 'reduced-motion' : ''
    ].filter(Boolean).join(' ');
  }, [themeConfig, resolvedTheme, highContrast, reducedMotion]);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('highContrast', String(highContrast));
  }, [theme, highContrast]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    resolvedTheme,
    highContrast,
    setHighContrast,
    reducedMotion,
    colorScheme: themeConfig.colors,
    spacing: themeConfig.spacing,
    typography: themeConfig.typography
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### LifeLock Provider
```typescript
// providers/LifeLockProvider.tsx - LifeLock domain context
interface LifeLockContextValue {
  // User protection data
  user: LifeLockUser | null;
  protectionLevel: ProtectionLevel;
  updateProtectionLevel: (level: ProtectionLevel) => void;
  
  // Security monitoring
  threatAlerts: ThreatAlert[];
  securityStatus: SecurityStatus;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  
  // Identity protection
  identityProfile: IdentityProfile | null;
  updateIdentityProfile: (profile: Partial<IdentityProfile>) => void;
  
  // Compliance and audit
  complianceStatus: ComplianceStatus;
  auditLogs: AuditLog[];
  
  // Hook decomposition ready (Phase 2)
  hooks: {
    useIdentityProtection: () => UseIdentityProtectionReturn;
    useSecurityMonitoring: () => UseSecurityMonitoringReturn;
    useThreatDetection: () => UseThreatDetectionReturn;
    useDataProtection: () => UseDataProtectionReturn;
  };
}

export const LifeLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LifeLock state management
  const [user, setUser] = useState<LifeLockUser | null>(null);
  const [protectionLevel, setProtectionLevel] = useState<ProtectionLevel>('basic');
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile | null>(null);

  // Integration with feature flags for hook decomposition
  const { isEnabled } = useFeatureFlags();
  const useDecomposedHooks = isEnabled('useRefactoredLifeLockHooks');

  // Specialized hooks for Phase 2 (when feature flag enabled)
  const hooks = useMemo(() => ({
    useIdentityProtection: () => useDecomposedHooks 
      ? useIdentityProtectionDecomposed() 
      : useIdentityProtectionLegacy(),
    useSecurityMonitoring: () => useDecomposedHooks 
      ? useSecurityMonitoringDecomposed() 
      : useSecurityMonitoringLegacy(),
    useThreatDetection: () => useDecomposedHooks 
      ? useThreatDetectionDecomposed() 
      : useThreatDetectionLegacy(),
    useDataProtection: () => useDecomposedHooks 
      ? useDataProtectionDecomposed() 
      : useDataProtectionLegacy()
  }), [useDecomposedHooks]);

  const value: LifeLockContextValue = {
    user,
    protectionLevel,
    updateProtectionLevel: setProtectionLevel,
    threatAlerts,
    securityStatus: calculateSecurityStatus(threatAlerts, protectionLevel),
    monitoringEnabled,
    toggleMonitoring: () => setMonitoringEnabled(prev => !prev),
    identityProfile,
    updateIdentityProfile: (profile) => setIdentityProfile(prev => ({ ...prev, ...profile })),
    complianceStatus: calculateComplianceStatus(user, identityProfile),
    auditLogs: [], // Populated from API
    hooks
  };

  return (
    <LifeLockContext.Provider value={value}>
      {children}
    </LifeLockContext.Provider>
  );
};
```

## 🔧 Context Integration Patterns

### Root Provider Setup
```typescript
// App.tsx - Provider composition
export const App: React.FC = () => {
  return (
    <AppProvider>
      <FeatureFlagsProvider>
        <ThemeProvider>
          <AuthProvider>
            <LifeLockProvider>
              <Router>
                <AppRoutes />
              </Router>
            </LifeLockProvider>
          </AuthProvider>
        </ThemeProvider>
      </FeatureFlagsProvider>
    </AppProvider>
  );
};
```

### Context Hook Usage
```typescript
// hooks/useAppContext.ts - Convenience hooks
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
};

// Component usage
export const UnifiedTaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { isEnabled } = useFeatureFlags();
  const { theme } = useTheme();
  const { addNotification } = useAppContext();
  
  const useEnhancedFeatures = isEnabled('useTaskCardUtils');
  
  return (
    <div className={`task-card theme-${theme}`}>
      {useEnhancedFeatures ? (
        <EnhancedTaskCardContent task={task} />
      ) : (
        <BasicTaskCardContent task={task} />
      )}
    </div>
  );
};
```

## 📊 Performance Optimizations

### Context Splitting Strategy
```typescript
// Optimize re-renders through context splitting
export const OptimizedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // Split frequently changing from stable contexts
    <StableConfigProvider> {/* Theme, feature flags */}
      <DynamicStateProvider> {/* User interactions, notifications */}
        <LifeLockDataProvider> {/* Business domain data */}
          {children}
        </LifeLockDataProvider>
      </DynamicStateProvider>
    </StableConfigProvider>
  );
};
```

### Memoization Patterns
```typescript
// Context value memoization
export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(initialFlags);
  
  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    flags,
    isEnabled: (flag: keyof FeatureFlags) => flags[flag],
    updateFlag: (flag: keyof FeatureFlags, enabled: boolean) => {
      setFlags(prev => ({ ...prev, [flag]: enabled }));
    }
  }), [flags]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
```

## 🎯 Migration Support Integration

### Feature Flag Context Integration
```typescript
// Direct integration with migration system
export const useMigrationContext = () => {
  const { isEnabled, updateFlag } = useFeatureFlags();
  const { addNotification } = useAppContext();
  
  return {
    // Phase tracking
    isPhase1Complete: isEnabled('useUnifiedTaskCard') && isEnabled('useTaskCardUtils'),
    isPhase2Ready: isEnabled('useRefactoredLifeLockHooks'),
    isPhase3Ready: isEnabled('useUnifiedThemeSystem'),
    
    // Migration controls
    enablePhase2: () => {
      updateFlag('useRefactoredLifeLockHooks', true);
      addNotification({
        type: 'success',
        message: 'Phase 2: Hook decomposition enabled',
        duration: 5000
      });
    },
    
    // Rollback capabilities
    rollbackToPhase1: () => {
      updateFlag('useRefactoredLifeLockHooks', false);
      addNotification({
        type: 'warning',
        message: 'Rolled back to Phase 1 configuration',
        duration: 5000
      });
    }
  };
};
```

## 🎯 Development Guidelines

### Context Best Practices
```typescript
// Context creation template
export const createContext = <T,>(name: string) => {
  const Context = React.createContext<T | undefined>(undefined);
  
  const useContext = () => {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    return context;
  };
  
  return [Context, useContext] as const;
};

// Usage
const [ThemeContext, useTheme] = createContext<ThemeContextValue>('Theme');
```

### Type Safety
```typescript
// Strict typing for context values
export interface ContextProviderProps {
  children: React.ReactNode;
  initialState?: Partial<ContextState>;
  devtools?: boolean;
}

// Context state validation
export const validateContextState = (state: unknown): ContextState => {
  const schema = z.object({
    user: z.object({}).optional(),
    preferences: z.object({}).optional(),
    featureFlags: z.record(z.boolean())
  });
  
  return schema.parse(state);
};
```

## 🎯 Next Steps
1. **Phase 2A**: Integrate decomposed hooks with LifeLock context
2. **Phase 2B**: Add performance monitoring to context providers
3. **Phase 3A**: Complete theme provider implementation
4. **Phase 3B**: Add context devtools for development
5. **Phase 4**: Context state persistence and hydration optimization

---
*Centralized context system supporting 91 feature flags with optimized re-render performance*