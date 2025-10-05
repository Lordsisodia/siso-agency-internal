# 🎯 tab-config.ts Decomposition Plan

## Current State Analysis

**File:** `/src/shared/services/tab-config.ts`  
**Risk Level:** 🟡 **MEDIUM** - Config errors break navigation

### Current Problems
1. **Monolithic Configuration** - All tabs in single file
2. **No Validation** - Invalid config can break app
3. **No Fallbacks** - No graceful degradation if config fails
4. **No Type Safety** - Runtime errors if config shape changes
5. **No Environment Handling** - Same config for dev/prod
6. **Hard to Extend** - Adding new tabs requires modifying core file

## Decomposition Strategy

### **Phase 1: Individual Tab Configurations**

#### `tabs/morning-tab-config.ts`
```typescript
import { TabConfig } from '../types/tab-types';
import { Sun, Coffee, Dumbbell, CheckCircle } from 'lucide-react';
import { MorningRoutineTab } from '../../shared/tabs/MorningRoutineTab';

export const morningTabConfig: TabConfig = {
  id: 'morning',
  label: 'Morning',
  icon: Sun,
  component: MorningRoutineTab,
  order: 0,
  enabled: true,
  timeRange: { start: 6, end: 10 },
  theme: {
    primary: 'text-orange-400',
    background: 'bg-orange-400/10',
    border: 'border-orange-400/30'
  },
  accessibility: {
    ariaLabel: 'Morning Routine Tab',
    description: 'Morning routine and planning'
  },
  permissions: ['user', 'admin'],
  features: ['voice-commands', 'habit-tracking', 'morning-briefing']
};
```

#### `tabs/light-work-tab-config.ts`
```typescript
export const lightWorkTabConfig: TabConfig = {
  id: 'light-work',
  label: 'Light Work',
  icon: Coffee,
  component: LightWorkTab,
  order: 1,
  enabled: true,
  timeRange: { start: 10, end: 14 },
  theme: {
    primary: 'text-emerald-400',
    background: 'bg-emerald-400/10',
    border: 'border-emerald-400/30'
  },
  accessibility: {
    ariaLabel: 'Light Work Tab',
    description: 'Light tasks and quick wins'
  },
  permissions: ['user', 'admin'],
  features: ['quick-add', 'task-templates', 'time-tracking']
};
```

#### `tabs/deep-work-tab-config.ts`
```typescript
export const deepWorkTabConfig: TabConfig = {
  id: 'deep-work',
  label: 'Deep Focus',
  icon: Brain,
  component: DeepWorkTab,
  order: 2,
  enabled: true,
  timeRange: { start: 14, end: 18 },
  theme: {
    primary: 'text-blue-400',
    background: 'bg-blue-400/10',
    border: 'border-blue-400/30'
  },
  accessibility: {
    ariaLabel: 'Deep Work Tab',
    description: 'Deep focus work and concentration'
  },
  permissions: ['user', 'admin'],
  features: ['focus-timer', 'distraction-blocking', 'deep-metrics']
};
```

### **Phase 2: Type-Safe Configuration System**

#### `types/tab-types.ts`
```typescript
import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

export interface TabTheme {
  primary: string;
  background: string;
  border: string;
  hover?: string;
  active?: string;
}

export interface TabAccessibility {
  ariaLabel: string;
  description: string;
  keyboardShortcut?: string;
}

export interface TabTimeRange {
  start: number; // Hour (0-23)
  end: number;   // Hour (0-23)
}

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType<any>;
  order: number;
  enabled: boolean;
  timeRange?: TabTimeRange;
  theme: TabTheme;
  accessibility: TabAccessibility;
  permissions: string[];
  features: string[];
  environment?: 'development' | 'production' | 'both';
}

export interface TabRegistryConfig {
  tabs: TabConfig[];
  defaultTab: string;
  enableTimeBasedSuggestions: boolean;
  enableSwipeGestures: boolean;
  animationDuration: number;
}
```

### **Phase 3: Configuration Registry**

#### `TabRegistry.ts`
```typescript
import { TabConfig, TabRegistryConfig } from './types/tab-types';
import { morningTabConfig } from './tabs/morning-tab-config';
import { lightWorkTabConfig } from './tabs/light-work-tab-config';
import { deepWorkTabConfig } from './tabs/deep-work-tab-config';
import { wellnessTabConfig } from './tabs/wellness-tab-config';
import { timeboxTabConfig } from './tabs/timebox-tab-config';
import { checkoutTabConfig } from './tabs/checkout-tab-config';

class TabRegistry {
  private tabs: Map<string, TabConfig> = new Map();
  private config: TabRegistryConfig;

  constructor() {
    this.config = this.getDefaultConfig();
    this.registerDefaultTabs();
  }

  private getDefaultConfig(): TabRegistryConfig {
    return {
      tabs: [],
      defaultTab: 'morning',
      enableTimeBasedSuggestions: true,
      enableSwipeGestures: true,
      animationDuration: 300
    };
  }

  private registerDefaultTabs(): void {
    const defaultTabs = [
      morningTabConfig,
      lightWorkTabConfig,
      deepWorkTabConfig,
      wellnessTabConfig,
      timeboxTabConfig,
      checkoutTabConfig
    ];

    defaultTabs.forEach(tab => this.registerTab(tab));
  }

  public registerTab(tab: TabConfig): void {
    if (!this.validateTab(tab)) {
      console.warn(`Invalid tab configuration for ${tab.id}`);
      return;
    }

    this.tabs.set(tab.id, tab);
  }

  public getTab(id: string): TabConfig | null {
    return this.tabs.get(id) || null;
  }

  public getAllTabs(): TabConfig[] {
    return Array.from(this.tabs.values())
      .filter(tab => tab.enabled)
      .filter(tab => this.isTabAllowedInEnvironment(tab))
      .sort((a, b) => a.order - b.order);
  }

  public getTabsByPermission(userPermissions: string[]): TabConfig[] {
    return this.getAllTabs().filter(tab => 
      tab.permissions.some(permission => 
        userPermissions.includes(permission)
      )
    );
  }

  public getSuggestedTab(currentHour?: number): string {
    if (!this.config.enableTimeBasedSuggestions) {
      return this.config.defaultTab;
    }

    const hour = currentHour ?? new Date().getHours();
    
    const timeBasedTab = this.getAllTabs().find(tab => 
      tab.timeRange && 
      hour >= tab.timeRange.start && 
      hour < tab.timeRange.end
    );

    return timeBasedTab?.id || this.config.defaultTab;
  }

  private validateTab(tab: TabConfig): boolean {
    const required = ['id', 'label', 'icon', 'component', 'order', 'theme', 'accessibility', 'permissions'];
    
    return required.every(field => {
      const hasField = field in tab && tab[field] !== undefined;
      if (!hasField) {
        console.error(`Tab ${tab.id} missing required field: ${field}`);
      }
      return hasField;
    });
  }

  private isTabAllowedInEnvironment(tab: TabConfig): boolean {
    if (!tab.environment) return true;
    
    const currentEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    
    return tab.environment === 'both' || tab.environment === currentEnv;
  }

  public updateConfig(newConfig: Partial<TabRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): TabRegistryConfig {
    return { ...this.config, tabs: this.getAllTabs() };
  }
}

export const tabRegistry = new TabRegistry();
```

### **Phase 4: Safe Configuration Loading**

#### `ConfigLoader.ts`
```typescript
export class ConfigLoader {
  private static fallbackConfig: TabConfig[] = [
    {
      id: 'fallback',
      label: 'Home',
      icon: Home,
      component: () => <div>Loading...</div>,
      order: 0,
      enabled: true,
      theme: { primary: 'text-gray-400', background: 'bg-gray-400/10', border: 'border-gray-400/30' },
      accessibility: { ariaLabel: 'Fallback Tab', description: 'Fallback content' },
      permissions: ['user'],
      features: []
    }
  ];

  public static async loadTabConfiguration(): Promise<TabConfig[]> {
    try {
      // Load configuration with error handling
      const tabs = tabRegistry.getAllTabs();
      
      if (tabs.length === 0) {
        console.warn('No tabs loaded, using fallback configuration');
        return this.fallbackConfig;
      }

      // Validate all tabs
      const validTabs = tabs.filter(tab => this.validateTabAtRuntime(tab));
      
      if (validTabs.length === 0) {
        console.error('All tabs failed validation, using fallback');
        return this.fallbackConfig;
      }

      return validTabs;
    } catch (error) {
      console.error('Failed to load tab configuration:', error);
      return this.fallbackConfig;
    }
  }

  private static validateTabAtRuntime(tab: TabConfig): boolean {
    try {
      // Runtime validation
      if (!tab.component) {
        console.error(`Tab ${tab.id} has no component`);
        return false;
      }

      if (!tab.icon) {
        console.error(`Tab ${tab.id} has no icon`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Tab ${tab.id} validation failed:`, error);
      return false;
    }
  }
}
```

### **Phase 5: Configuration Hooks**

#### `useTabConfiguration.ts`
```typescript
export const useTabConfiguration = (userPermissions: string[] = ['user']) => {
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTabs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const allTabs = await ConfigLoader.loadTabConfiguration();
        const userTabs = tabRegistry.getTabsByPermission(userPermissions);
        
        setTabs(userTabs.length > 0 ? userTabs : allTabs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tabs');
        setTabs(await ConfigLoader.loadTabConfiguration());
      } finally {
        setIsLoading(false);
      }
    };

    loadTabs();
  }, [userPermissions]);

  const getSuggestedTab = useCallback(() => {
    return tabRegistry.getSuggestedTab();
  }, []);

  const getTabConfig = useCallback((tabId: string) => {
    return tabRegistry.getTab(tabId);
  }, []);

  return {
    tabs,
    isLoading,
    error,
    getSuggestedTab,
    getTabConfig
  };
};
```

## Final Decomposed Structure

```typescript
// tab-config.ts (now just exports!)
export { tabRegistry } from './TabRegistry';
export { useTabConfiguration } from './hooks/useTabConfiguration';
export { ConfigLoader } from './ConfigLoader';
export * from './types/tab-types';

// Simple usage:
const { tabs, getSuggestedTab } = useTabConfiguration(userPermissions);
```

## Benefits of This Decomposition

### **1. Modularity**
- Each tab configuration in its own file
- Easy to add/remove tabs without touching core system
- Independent feature flags per tab

### **2. Type Safety**
- Runtime validation of tab configurations
- TypeScript interfaces catch errors at build time
- Fallback mechanisms prevent app crashes

### **3. Extensibility**
- Plugin-like architecture for tabs
- Environment-specific configurations
- Permission-based tab filtering

### **4. Maintainability**
- Clear separation of concerns
- Easy to test individual tab configurations
- Graceful degradation with fallbacks

## Migration Strategy

### **Step 1: Create Type System**
- Define TabConfig and related interfaces
- Ensure existing tab-config.ts matches types

### **Step 2: Split Configurations**
- Extract each tab to individual files
- Maintain exact same configuration structure
- Test that tabs still load correctly

### **Step 3: Implement Registry**
- Create TabRegistry class
- Load tabs through registry
- Verify all tabs still work

### **Step 4: Add Validation**
- Implement configuration validation
- Add fallback mechanisms
- Test error scenarios

### **Step 5: Create Hooks**
- Create useTabConfiguration hook
- Replace direct imports with hook usage
- Test configuration loading

## Safety Protocols

### **Testing Checklist:**
- [ ] All tabs still load correctly
- [ ] Tab navigation works as before
- [ ] Configuration errors don't crash app
- [ ] Permission filtering works
- [ ] Time-based suggestions work
- [ ] Fallback configuration loads when needed
- [ ] TypeScript compilation succeeds
- [ ] No runtime configuration errors

## Expected Outcome

**Before:** Single config file with all tabs  
**After:** Modular system with validation and fallbacks

**Risk Reduction:** 🟡 Medium → 🟢 Low  
**Extensibility:** 🔴 Hard → 🟢 Easy  
**Error Handling:** ❌ None → ✅ Robust