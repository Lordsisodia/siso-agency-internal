# Hooks Directory

**75+ custom React hooks for shared logic and state management**

## 🏗️ Directory Overview

This directory contains all custom React hooks that encapsulate shared logic, state management, and side effects for the SISO Internal application. Hooks follow React best practices and provide reusable functionality across components.

### 📊 Hook Statistics  
- **Total Hooks**: 75+ custom hooks (.ts/.tsx files)
- **Organization**: Feature-based hook grouping
- **Usage**: Comprehensive coverage of app functionality
- **TypeScript Coverage**: 100% (strict mode)

## 📁 Hook Structure

### Authentication & User Management

#### Core Authentication
```
useSupabaseAuth.tsx        # Supabase authentication integration
useClerkUser.ts           # Clerk user management
useAuthSession.tsx        # Session state management
useUser.tsx              # User data and profile management
useBasicUserData.tsx     # Essential user information
useOnboardingAuth.tsx    # Onboarding authentication flow
useAdminCheck.ts         # Admin role verification
```

#### User Experience & Preferences
```
useProfileData.tsx       # User profile and settings
usePoints.tsx           # Gamification points system
useDayPeriod.ts         # Time-based UI adaptations
```

### Task & Project Management

#### Core Task Management
```
useTasks.ts                    # Main task management hook
useRealTasks.ts               # Production task operations
useTaskOperations.ts          # CRUD operations for tasks
useTaskEditing.ts             # Task editing and modification
useTaskFiltering.ts           # Task search and filtering
useTaskDragDrop.ts            # Drag and drop functionality
useTaskPositioning.ts         # Task positioning and layout
useClientTasks.ts             # Client-specific task management
useDeepWorkTasks.ts           # Deep work task tracking
useDeepWorkTasksSupabase.ts   # Supabase deep work integration
useLightWorkTasks.ts          # Light work task management
useLightWorkTasksSupabase.ts  # Supabase light work integration
useSubtasks.ts               # Subtask management
```

#### Project Management
```
useProjects.ts            # Project lifecycle management
useUserProjects.ts        # User-specific project data
useCreateProject.ts       # Project creation workflow
useSelectedProject.ts     # Current project selection
useProjectWireframes.ts   # Project wireframe management
```

### Business Intelligence & Analytics

#### Performance & Metrics
```
usePerformanceMetrics.ts  # Performance tracking and analytics
useLeadStats.ts          # Lead conversion metrics
usePartnerStats.ts       # Partnership performance data
useAnalyticsData.ts      # General analytics collection
useFlowStatsService.ts   # User flow analytics
```

#### Business Operations
```
useCheckInOut.ts         # Time tracking and attendance
useTimeWindow.ts         # Time-based filtering
useTimeBlocks.ts         # Calendar and scheduling
useOutreachCampaigns.ts  # Marketing campaign management
useOutreachAccounts.ts   # Account relationship management
useInstagramLeads.ts     # Instagram lead processing
useLeadImport.ts         # Lead data import functionality
useBulkImport.ts         # Bulk data import operations
```

### Data Management & UI State

#### Data Tables & Views
```
useTableColumns.ts           # Dynamic table column management
useTableViews.ts            # Table view state and persistence
useExpensesTableData.ts     # Financial data table management
useExpensesSort.ts          # Expense sorting and filtering
use-pagination.tsx          # Pagination state management
useOutreachColumnPreferences.ts # Column customization
```

#### Client & Portfolio Management
```
useClientData.ts            # Client information management
useClientAppDetails.ts      # Client application details
usePortfolioData.ts         # Portfolio project data
useAddPortfolioProjects.ts  # Portfolio addition workflow
```

### Gamification & XP System

#### XP & Rewards
```
useXPStore.ts           # XP store and purchase management
useXPPreview.ts         # XP earning previews and calculations
```

### Partnership & Referrals

#### Partner Management
```
usePartnerNavigation.ts     # Partner portal navigation
usePartnerApplication.ts    # Partner application process
useReferralsManagement.ts   # Referral tracking and management
```

### Content & Media Management

#### Video & Content Processing
```
useVideoDetail.ts       # Video content management
useVideoProcessing.ts   # Video processing and analysis
useBlogPostActions.ts   # Blog post management
useAiArticleSummary.ts  # AI-powered article summarization
useAiDailySummary.ts    # Daily AI insights and summaries
```

### Planning & Features

#### Application Planning
```
usePlanData.ts              # Application plan data management
usePlanFeatures.ts          # Feature planning and selection
usePlanViewTracking.ts      # Plan view analytics
useFeatures.ts              # Feature flag management
useFeatureSelection.ts      # Feature selection workflow
useFeatureDetail.ts         # Feature detail views
useRecommendedPackage.ts    # Package recommendation logic
```

### UI/UX & Interaction Hooks

#### Responsive Design & Layout
```
use-mobile.tsx          # Mobile device detection and optimization
useElementSize.ts       # Element dimension tracking
useViewportLoading.ts   # Viewport-based loading states
```

#### User Interactions
```
use-smooth-scroll.ts    # Smooth scrolling behavior
use-auto-scroll.tsx     # Automatic scrolling functionality
use-toast.ts           # Toast notification management
```

#### Educational & Communication
```
useEducationChat.tsx    # Educational chat interfaces
useThoughtDump.ts      # Thought capture and organization
```

### External Integrations

#### LifeLock Integration
```
useLifeLockData.ts      # LifeLock service integration
```

### Data Persistence & Storage

#### Local Storage & Persistence
```
useLocalStorage.ts      # Browser local storage management
```

### Client-Specific Hooks

#### Client Portal Features
```
client/                 # Client-specific hook directory
├── [Client-specific hooks for portal functionality]
```

## 🎯 Hook Architecture Patterns

### Standard Custom Hook Structure
```typescript
// useFeatureName.ts
import { useState, useEffect, useCallback } from 'react';
import { serviceLayer } from '@/services/serviceLayer';

interface UseFeatureNameReturn {
  data: FeatureData | null;
  loading: boolean;
  error: string | null;
  actions: FeatureActions;
}

interface FeatureActions {
  create: (data: CreateData) => Promise<void>;
  update: (id: string, data: UpdateData) => Promise<void>;
  delete: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useFeatureName = (params?: FeatureParams): UseFeatureNameReturn => {
  const [data, setData] = useState<FeatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await serviceLayer.getData(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const actions: FeatureActions = {
    create: async (createData) => {
      await serviceLayer.create(createData);
      await fetchData();
    },
    
    update: async (id, updateData) => {
      await serviceLayer.update(id, updateData);
      await fetchData();
    },
    
    delete: async (id) => {
      await serviceLayer.delete(id);
      await fetchData();
    },
    
    refresh: fetchData
  };

  return { data, loading, error, actions };
};
```

### Authentication Hook Pattern
```typescript
// useSupabaseAuth.tsx
import { useContext, createContext } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within AuthProvider');
  }
  return context;
};
```

### Data Fetching Hook Pattern
```typescript
// useTableData.ts - Generic table data hook
import { useMemo } from 'react';
import { useQuery } from 'react-query';

interface UseTableDataProps<T> {
  queryKey: string;
  fetchFn: () => Promise<T[]>;
  dependencies?: any[];
  filters?: FilterParams;
  sorting?: SortParams;
  pagination?: PaginationParams;
}

export const useTableData = <T>({
  queryKey,
  fetchFn,
  dependencies = [],
  filters,
  sorting,
  pagination
}: UseTableDataProps<T>) => {
  const { data: rawData, loading, error } = useQuery(
    [queryKey, ...dependencies, filters, sorting, pagination],
    fetchFn,
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  const processedData = useMemo(() => {
    if (!rawData) return [];
    
    let result = [...rawData];
    
    // Apply filters
    if (filters) {
      result = applyFilters(result, filters);
    }
    
    // Apply sorting
    if (sorting) {
      result = applySorting(result, sorting);
    }
    
    // Apply pagination
    if (pagination) {
      result = applyPagination(result, pagination);
    }
    
    return result;
  }, [rawData, filters, sorting, pagination]);

  return { data: processedData, loading, error, rawData };
};
```

## 🔌 Integration Patterns

### Service Integration
```typescript
// Hook integrating with services
import { taskPersistenceService } from '@/services/taskPersistenceService';
import { gamificationSystem } from '@/services/gamificationSystem';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const completeTask = async (taskId: string) => {
    // Update task via service
    await taskPersistenceService.updateTask(taskId, { completed: true });
    
    // Award XP through gamification
    await gamificationSystem.awardXP('task_completion', taskId);
    
    // Update local state
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };
  
  return { tasks, completeTask };
};
```

### Context Integration
```typescript
// Hook using React Context
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
};
```

### Local Storage Hook
```typescript
// useLocalStorage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(
  key: string, 
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

## 🎮 Gamification Hook Examples

### XP Management
```typescript
// useXPStore.ts usage
import { useXPStore } from '@/hooks/useXPStore';

const ProfileComponent = () => {
  const { 
    currentXP, 
    level, 
    nextLevelXP, 
    purchaseItem, 
    previewPurchase 
  } = useXPStore();

  const handlePurchase = async (itemId: string) => {
    const preview = await previewPurchase(itemId);
    if (preview.canAfford) {
      await purchaseItem(itemId);
    }
  };

  return (
    <div>
      <div>Level {level} - {currentXP}/{nextLevelXP} XP</div>
      <button onClick={() => handlePurchase('item-1')}>
        Purchase Item
      </button>
    </div>
  );
};
```

### Task Operations with Gamification
```typescript
// useTaskOperations.ts integration
export const useTaskOperations = () => {
  const { awardXP } = usePoints();
  const { trackEvent } = useAnalytics();
  
  const completeTask = async (task: Task) => {
    // Complete the task
    await taskService.complete(task.id);
    
    // Award XP based on task complexity
    const xpAmount = calculateTaskXP(task);
    await awardXP(xpAmount, 'task_completion');
    
    // Track analytics
    trackEvent('task_completed', {
      task_id: task.id,
      category: task.category,
      xp_awarded: xpAmount
    });
  };
  
  return { completeTask };
};
```

## 🔄 State Management Patterns

### Complex State Management
```typescript
// useTaskFiltering.ts - Complex filtering logic
import { useReducer, useMemo } from 'react';

interface FilterState {
  search: string;
  category: string[];
  priority: Priority[];
  dateRange: DateRange;
  completed: boolean | null;
}

type FilterAction = 
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'SET_PRIORITY'; payload: Priority[] }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'RESET_FILTERS' };

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'TOGGLE_CATEGORY':
      const category = action.payload;
      return {
        ...state,
        category: state.category.includes(category)
          ? state.category.filter(c => c !== category)
          : [...state.category, category]
      };
    case 'RESET_FILTERS':
      return initialFilterState;
    default:
      return state;
  }
};

export const useTaskFiltering = (tasks: Task[]) => {
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category.length && !filters.category.includes(task.category)) {
        return false;
      }
      // Additional filtering logic...
      return true;
    });
  }, [tasks, filters]);
  
  return { filters, dispatch, filteredTasks };
};
```

### Performance Optimization Hooks
```typescript
// useViewportLoading.ts - Intersection Observer
import { useEffect, useRef, useState } from 'react';

export const useViewportLoading = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasLoaded) {
          setHasLoaded(true);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, hasLoaded]);

  return { elementRef, isIntersecting, hasLoaded };
};
```

## 🔍 Hook Discovery & Usage

### Finding Hooks
```bash
# Search by feature
find src/hooks -name "*task*" -type f
find src/hooks -name "*auth*" -type f  
find src/hooks -name "*xp*" -type f

# Search by functionality
grep -r "useState" src/hooks/
grep -r "useEffect" src/hooks/
grep -r "useCallback" src/hooks/
```

### Import Patterns
```typescript
// Authentication hooks
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useUser } from '@/hooks/useUser';

// Task management hooks
import { useTasks } from '@/hooks/useTasks';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useTaskFiltering } from '@/hooks/useTaskFiltering';

// UI/UX hooks
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Business logic hooks
import { useXPStore } from '@/hooks/useXPStore';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
```

## 🚨 Common Patterns & Best Practices

### Hook Naming Convention
- **camelCase**: All hooks start with `use` followed by camelCase
- **Descriptive**: Names clearly indicate purpose (e.g., `useTaskOperations`)
- **Consistent**: Similar functionality uses consistent naming patterns

### Error Handling in Hooks
```typescript
// Comprehensive error handling
export const useDataFetching = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
};
```

### Memory Management
```typescript
// Proper cleanup in hooks
export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    // Cleanup function
    return () => {
      ws.close();
      setSocket(null);
    };
  }, [url]);

  const sendMessage = useCallback((message: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }, [socket]);

  return { messages, sendMessage, connected: socket?.readyState === WebSocket.OPEN };
};
```

### Performance Optimization
```typescript
// Optimized hook with proper memoization
export const useExpensiveComputation = (data: ComplexData[], filters: Filters) => {
  const processedData = useMemo(() => {
    console.log('Processing expensive computation...');
    return data
      .filter(item => matchesFilters(item, filters))
      .sort((a, b) => a.priority - b.priority)
      .map(item => enhanceWithComputedFields(item));
  }, [data, filters]);

  const actions = useMemo(() => ({
    refresh: () => {
      // Trigger data refresh
    },
    export: () => {
      // Export processed data
    }
  }), []); // Stable reference

  return { processedData, actions };
};
```

## 📈 Hook Performance & Testing

### Testing Custom Hooks
```typescript
// useFeatureName.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFeatureName } from './useFeatureName';

describe('useFeatureName', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFeatureName());
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle data operations', async () => {
    const { result } = renderHook(() => useFeatureName());
    
    await act(async () => {
      await result.current.actions.create({ name: 'Test Item' });
    });
    
    expect(result.current.data).toContainEqual(
      expect.objectContaining({ name: 'Test Item' })
    );
  });
});
```

### Performance Monitoring
```typescript
// Hook performance monitoring
export const usePerformanceMonitoring = (hookName: string) => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      console.log(`${hookName} lifecycle duration: ${duration}ms`);
    };
  }, [hookName]);
};

// Usage in hooks
export const useComplexFeature = () => {
  usePerformanceMonitoring('useComplexFeature');
  
  // Hook implementation...
};
```

---

**Last Updated**: January 29, 2025  
**Total Hooks**: 75+ custom hooks across 8+ categories  
**Integration Coverage**: Authentication, Tasks, Analytics, UI/UX, Business Logic  
**Performance**: Optimized with proper memoization and cleanup patterns

> Need help with a specific hook? Check the import patterns above or refer to the component documentation in `/src/components/README.md` for usage examples.