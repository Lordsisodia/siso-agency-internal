# Data System 📊

Data management, state persistence, caching strategies, and data transformation utilities.

## 🎯 Purpose
Centralized data management providing consistent data access patterns, intelligent caching, state synchronization, and data transformation across the application.

## 🏗️ Architecture

### Data Structure
```typescript
├── store/
│   ├── slices/              // Redux Toolkit slices for state management
│   ├── middleware/          // Custom middleware for data operations
│   ├── selectors/           // Memoized data selectors
│   └── store.config.ts      // Store configuration and setup
├── cache/
│   ├── strategies/          // Caching strategy implementations
│   ├── invalidation/        // Cache invalidation patterns
│   ├── persistence/         // Persistent cache storage
│   └── cache-manager.ts     // Cache orchestration
├── models/
│   ├── task.model.ts        // Task data model definitions
│   ├── user.model.ts        // User data model definitions
│   ├── lifelock.model.ts    // LifeLock data model definitions
│   └── base.model.ts        // Base model with common functionality
├── repositories/
│   ├── task.repository.ts   // Task data access layer
│   ├── user.repository.ts   // User data access layer
│   ├── lifelock.repository.ts // LifeLock data access layer
│   └── base.repository.ts   // Base repository pattern
├── transformers/
│   ├── api-transformers.ts  // API response transformation
│   ├── ui-transformers.ts   // UI data transformation
│   ├── export-transformers.ts // Data export formatting
│   └── validation-transformers.ts // Data validation and sanitization
└── sync/
    ├── offline-sync.ts      // Offline data synchronization
    ├── real-time-sync.ts    // Real-time data updates
    ├── conflict-resolution.ts // Data conflict resolution
    └── sync-manager.ts      // Synchronization orchestration
```

## 📁 Core Data Management

### State Management with Redux Toolkit
```typescript
// store/slices/task.slice.ts - Task data management
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskRepository } from '@/lib/data/repositories/task.repository';

interface TaskState {
  tasks: TaskCard[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedTaskId: string | null;
  filters: TaskFilters;
  pagination: PaginationState;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedTaskId: null,
  filters: {},
  pagination: { page: 1, limit: 20, total: 0 }
};

// Async thunks for API operations
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: TaskFetchParams, { rejectWithValue }) => {
    try {
      const repository = new TaskRepository();
      const response = await repository.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: Partial<TaskCard> }, { rejectWithValue }) => {
    try {
      const repository = new TaskRepository();
      const updatedTask = await repository.update(id, updates);
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Integration with UnifiedTaskCard component
export const batchUpdateTasks = createAsyncThunk(
  'tasks/batchUpdate',
  async (updates: TaskBatchUpdate[], { rejectWithValue }) => {
    try {
      const repository = new TaskRepository();
      const results = await repository.batchUpdate(updates);
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic updates for better UX
    optimisticUpdateTask: (state, action: PayloadAction<{ id: string; updates: Partial<TaskCard> }>) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pagination;
        state.lastUpdated = new Date();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const taskIndex = state.tasks.findIndex(task => task.id === updatedTask.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
        state.lastUpdated = new Date();
      });
  }
});

export const { setSelectedTask, updateFilters, clearError, optimisticUpdateTask } = taskSlice.actions;
export default taskSlice.reducer;
```

### LifeLock Data Management
```typescript
// store/slices/lifelock.slice.ts - LifeLock domain data
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LifeLockRepository } from '@/lib/data/repositories/lifelock.repository';

interface LifeLockState {
  user: LifeLockUser | null;
  identityProfile: IdentityProfile | null;
  threatAlerts: ThreatAlert[];
  securityStatus: SecurityStatus;
  protectionLevel: ProtectionLevel;
  monitoring: {
    enabled: boolean;
    lastScan: Date | null;
    scanFrequency: string;
  };
  loading: {
    profile: boolean;
    threats: boolean;
    status: boolean;
  };
  error: {
    profile: string | null;
    threats: string | null;
    status: string | null;
  };
  lastUpdated: {
    profile: Date | null;
    threats: Date | null;
    status: Date | null;
  };
}

// Async thunks for LifeLock operations
export const fetchIdentityProfile = createAsyncThunk(
  'lifelock/fetchIdentityProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const repository = new LifeLockRepository();
      const profile = await repository.getIdentityProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchThreatAlerts = createAsyncThunk(
  'lifelock/fetchThreatAlerts',
  async ({ userId, filters }: { userId: string; filters?: ThreatFilters }, { rejectWithValue }) => {
    try {
      const repository = new LifeLockRepository();
      const alerts = await repository.getThreatAlerts(userId, filters);
      return alerts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Specialized data for hook decomposition (Phase 2)
export const fetchIdentityProtectionData = createAsyncThunk(
  'lifelock/fetchIdentityProtectionData',
  async (userId: string, { rejectWithValue }) => {
    try {
      const repository = new LifeLockRepository();
      const data = await repository.getIdentityProtectionData(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSecurityMonitoringData = createAsyncThunk(
  'lifelock/fetchSecurityMonitoringData',
  async (userId: string, { rejectWithValue }) => {
    try {
      const repository = new LifeLockRepository();
      const data = await repository.getSecurityMonitoringData(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const lifelockSlice = createSlice({
  name: 'lifelock',
  initialState,
  reducers: {
    updateProtectionLevel: (state, action: PayloadAction<ProtectionLevel>) => {
      state.protectionLevel = action.payload;
    },
    toggleMonitoring: (state) => {
      state.monitoring.enabled = !state.monitoring.enabled;
    },
    markThreatAsResolved: (state, action: PayloadAction<string>) => {
      const alertIndex = state.threatAlerts.findIndex(alert => alert.id === action.payload);
      if (alertIndex !== -1) {
        state.threatAlerts[alertIndex].status = 'resolved';
        state.threatAlerts[alertIndex].resolvedAt = new Date();
      }
    },
    clearErrors: (state) => {
      state.error = {
        profile: null,
        threats: null,
        status: null
      };
    }
  },
  extraReducers: (builder) => {
    // Identity Profile
    builder
      .addCase(fetchIdentityProfile.pending, (state) => {
        state.loading.profile = true;
        state.error.profile = null;
      })
      .addCase(fetchIdentityProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.identityProfile = action.payload;
        state.lastUpdated.profile = new Date();
      })
      .addCase(fetchIdentityProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error.profile = action.payload as string;
      })
      
    // Threat Alerts
    builder
      .addCase(fetchThreatAlerts.pending, (state) => {
        state.loading.threats = true;
        state.error.threats = null;
      })
      .addCase(fetchThreatAlerts.fulfilled, (state, action) => {
        state.loading.threats = false;
        state.threatAlerts = action.payload;
        state.lastUpdated.threats = new Date();
      })
      .addCase(fetchThreatAlerts.rejected, (state, action) => {
        state.loading.threats = false;
        state.error.threats = action.payload as string;
      });
  }
});

export const { updateProtectionLevel, toggleMonitoring, markThreatAsResolved, clearErrors } = lifelockSlice.actions;
export default lifelockSlice.reducer;
```

### Repository Pattern Implementation
```typescript
// repositories/base.repository.ts - Base repository with common functionality
export abstract class BaseRepository<T> {
  protected apiClient: APIClient;
  protected cacheManager: CacheManager;
  protected validator: DataValidator;

  constructor(endpoint: string) {
    this.apiClient = new APIClient(endpoint);
    this.cacheManager = new CacheManager();
    this.validator = new DataValidator();
  }

  // Generic CRUD operations
  async getAll(params?: any): Promise<PaginatedResponse<T>> {
    const cacheKey = this.generateCacheKey('getAll', params);
    
    // Check cache first
    const cached = await this.cacheManager.get<PaginatedResponse<T>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await this.apiClient.get<T[]>('/', { params });
    
    // Validate response
    const validated = await this.validator.validateArray(response.data);
    
    const result = {
      ...response,
      data: validated
    };

    // Cache result
    await this.cacheManager.set(cacheKey, result, { ttl: 300 }); // 5 minutes
    
    return result;
  }

  async getById(id: string): Promise<T> {
    const cacheKey = this.generateCacheKey('getById', id);
    
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiClient.get<T>(`/${id}`);
    const validated = await this.validator.validate(response.data);
    
    await this.cacheManager.set(cacheKey, validated, { ttl: 600 }); // 10 minutes
    
    return validated;
  }

  async create(data: Partial<T>): Promise<T> {
    const validated = await this.validator.validate(data);
    const response = await this.apiClient.post<T>('/', validated);
    
    // Invalidate list caches
    await this.cacheManager.invalidatePattern('getAll*');
    
    return response.data;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const validated = await this.validator.validate(data);
    const response = await this.apiClient.patch<T>(`/${id}`, validated);
    
    // Invalidate related caches
    await this.cacheManager.invalidatePattern(`*${id}*`);
    await this.cacheManager.invalidatePattern('getAll*');
    
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/${id}`);
    
    // Invalidate related caches
    await this.cacheManager.invalidatePattern(`*${id}*`);
    await this.cacheManager.invalidatePattern('getAll*');
  }

  // Batch operations
  async batchUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
    const response = await this.apiClient.patch<T[]>('/batch', { updates });
    
    // Invalidate all related caches
    await this.cacheManager.invalidatePattern('*');
    
    return response.data;
  }

  protected generateCacheKey(operation: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${this.constructor.name}:${operation}:${paramsStr}`;
  }

  protected abstract validateEntity(entity: any): Promise<T>;
}

// repositories/task.repository.ts - Task-specific repository
export class TaskRepository extends BaseRepository<TaskCard> {
  constructor() {
    super('/api/tasks');
  }

  // Task-specific operations for UnifiedTaskCard
  async getTasksByStatus(status: TaskStatus): Promise<TaskCard[]> {
    const cacheKey = this.generateCacheKey('getTasksByStatus', status);
    
    const cached = await this.cacheManager.get<TaskCard[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.apiClient.get<TaskCard[]>('/', {
      params: { status }
    });

    const validated = await Promise.all(
      response.data.map(task => this.validateEntity(task))
    );

    await this.cacheManager.set(cacheKey, validated, { ttl: 180 }); // 3 minutes
    
    return validated;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<TaskCard> {
    // Validate status transition
    const currentTask = await this.getById(id);
    const validTransition = this.isValidStatusTransition(currentTask.status, status);
    
    if (!validTransition) {
      throw new Error(`Invalid status transition from ${currentTask.status} to ${status}`);
    }

    return this.update(id, { 
      status,
      updatedAt: new Date(),
      statusChangedAt: new Date()
    });
  }

  async searchTasks(criteria: TaskSearchCriteria): Promise<PaginatedResponse<TaskCard>> {
    const response = await this.apiClient.get<TaskCard[]>('/search', {
      params: criteria
    });

    return {
      ...response,
      data: await Promise.all(
        response.data.map(task => this.validateEntity(task))
      )
    };
  }

  protected async validateEntity(entity: any): Promise<TaskCard> {
    // Task-specific validation
    const schema = z.object({
      id: z.string(),
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(2000),
      status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      createdAt: z.date(),
      updatedAt: z.date(),
      dueDate: z.date().optional(),
      assignee: z.string().optional()
    });

    return schema.parse(entity);
  }

  private isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
    const allowedTransitions = TASK_STATUS_CONFIG[from].allowedTransitions;
    return allowedTransitions.includes(to);
  }
}
```

### Intelligent Caching System
```typescript
// cache/cache-manager.ts - Advanced caching with multiple strategies
export class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private persistentCache: IDBPDatabase | null = null;
  private strategies: Map<string, CacheStrategy> = new Map();

  constructor() {
    this.initializeCacheStrategies();
    this.initializePersistentCache();
  }

  private initializeCacheStrategies() {
    // Different strategies for different data types
    this.strategies.set('default', new LRUCacheStrategy(100));
    this.strategies.set('user-data', new TimeBasedCacheStrategy(30 * 60 * 1000)); // 30 minutes
    this.strategies.set('static-data', new PersistentCacheStrategy(24 * 60 * 60 * 1000)); // 24 hours
    this.strategies.set('real-time', new NoopCacheStrategy()); // No caching for real-time data
  }

  async get<T>(key: string, strategy: string = 'default'): Promise<T | null> {
    const cacheStrategy = this.strategies.get(strategy) || this.strategies.get('default')!;
    
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !cacheStrategy.isExpired(memoryEntry)) {
      cacheStrategy.onHit(key);
      return memoryEntry.data;
    }

    // Try persistent cache
    if (this.persistentCache && cacheStrategy.supportsPersistence()) {
      const persistentEntry = await this.persistentCache.get('cache', key);
      if (persistentEntry && !cacheStrategy.isExpired(persistentEntry)) {
        // Promote to memory cache
        this.memoryCache.set(key, persistentEntry);
        cacheStrategy.onHit(key);
        return persistentEntry.data;
      }
    }

    cacheStrategy.onMiss(key);
    return null;
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const strategy = options.strategy || 'default';
    const cacheStrategy = this.strategies.get(strategy) || this.strategies.get('default')!;
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || cacheStrategy.getDefaultTTL(),
      tags: options.tags || [],
      strategy
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);
    cacheStrategy.onSet(key, entry);

    // Store in persistent cache if supported
    if (this.persistentCache && cacheStrategy.supportsPersistence()) {
      await this.persistentCache.put('cache', entry, key);
    }

    // Cleanup if needed
    await this.cleanup();
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.persistentCache) {
      await this.persistentCache.delete('cache', key);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    // Clear from memory cache
    for (const [key] of this.memoryCache) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from persistent cache
    if (this.persistentCache) {
      const keys = await this.persistentCache.getAllKeys('cache');
      const keysToDelete = keys.filter(key => regex.test(String(key)));
      
      await Promise.all(
        keysToDelete.map(key => this.persistentCache!.delete('cache', key))
      );
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToDelete: string[] = [];
    
    // Find entries with matching tags
    for (const [key, entry] of this.memoryCache) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    // Delete found entries
    await Promise.all(keysToDelete.map(key => this.invalidate(key)));
  }

  private async cleanup(): Promise<void> {
    // Cleanup expired entries
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache) {
      if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    await Promise.all(expiredKeys.map(key => this.invalidate(key)));

    // Limit cache size
    if (this.memoryCache.size > 1000) {
      const oldestEntries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, this.memoryCache.size - 800);

      await Promise.all(
        oldestEntries.map(([key]) => this.invalidate(key))
      );
    }
  }

  // Cache performance metrics
  getMetrics(): CacheMetrics {
    const strategies = Array.from(this.strategies.values());
    
    return {
      totalEntries: this.memoryCache.size,
      hitRate: this.calculateHitRate(strategies),
      memoryUsage: this.calculateMemoryUsage(),
      strategyMetrics: strategies.map(strategy => strategy.getMetrics())
    };
  }

  private calculateHitRate(strategies: CacheStrategy[]): number {
    const totalRequests = strategies.reduce((sum, strategy) => sum + strategy.getTotalRequests(), 0);
    const totalHits = strategies.reduce((sum, strategy) => sum + strategy.getTotalHits(), 0);
    
    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [, entry] of this.memoryCache) {
      totalSize += JSON.stringify(entry).length;
    }
    
    return totalSize;
  }
}
```

## 📊 Data Performance Optimization

### Memoized Selectors
```typescript
// store/selectors/task.selectors.ts - Optimized data selection
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store.config';

// Base selectors
const selectTasksState = (state: RootState) => state.tasks;
const selectTaskFilters = (state: RootState) => state.tasks.filters;

// Memoized selectors for UnifiedTaskCard
export const selectAllTasks = createSelector(
  [selectTasksState],
  (tasksState) => tasksState.tasks
);

export const selectTaskById = createSelector(
  [selectAllTasks, (_, taskId: string) => taskId],
  (tasks, taskId) => tasks.find(task => task.id === taskId)
);

export const selectTasksByStatus = createSelector(
  [selectAllTasks, (_, status: TaskStatus) => status],
  (tasks, status) => tasks.filter(task => task.status === status)
);

export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectTaskFilters],
  (tasks, filters) => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               task.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }
);

export const selectTasksByPriority = createSelector(
  [selectAllTasks],
  (tasks) => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = [];
      }
      acc[task.priority].push(task);
      return acc;
    }, {} as Record<TaskPriority, TaskCard[]>);
  }
);

// Performance-optimized selectors
export const selectTasksStatistics = createSelector(
  [selectAllTasks],
  (tasks) => {
    const stats = {
      total: tasks.length,
      byStatus: {} as Record<TaskStatus, number>,
      byPriority: {} as Record<TaskPriority, number>,
      overdue: 0,
      completedThisWeek: 0
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      // Count by status
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      
      // Count by priority
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      
      // Count overdue tasks
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== TaskStatus.COMPLETED) {
        stats.overdue++;
      }
      
      // Count completed this week
      if (task.status === TaskStatus.COMPLETED && task.completedAt && new Date(task.completedAt) > weekAgo) {
        stats.completedThisWeek++;
      }
    });

    return stats;
  }
);
```

### Data Synchronization
```typescript
// sync/sync-manager.ts - Real-time data synchronization
export class SyncManager {
  private websocket: WebSocket | null = null;
  private store: Store;
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor(store: Store) {
    this.store = store;
    this.initializeSync();
    this.setupOfflineDetection();
  }

  private initializeSync() {
    // Establish WebSocket connection for real-time updates
    this.websocket = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8080');
    
    this.websocket.onopen = () => {
      console.log('Real-time sync connected');
      this.processOfflineQueue();
    };

    this.websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleRealTimeUpdate(message);
    };

    this.websocket.onclose = () => {
      console.log('Real-time sync disconnected');
      setTimeout(() => this.initializeSync(), 5000); // Reconnect after 5 seconds
    };
  }

  private handleRealTimeUpdate(message: SyncMessage) {
    switch (message.type) {
      case 'TASK_UPDATED':
        this.store.dispatch(updateTask.fulfilled(message.data));
        break;
      case 'TASK_CREATED':
        this.store.dispatch(fetchTasks({})); // Refresh task list
        break;
      case 'THREAT_ALERT':
        this.store.dispatch(fetchThreatAlerts({ userId: message.userId }));
        break;
      case 'FEATURE_FLAG_CHANGED':
        // Update feature flags in real-time
        this.store.dispatch(updateFeatureFlag(message.data));
        break;
    }
  }

  // Queue operations when offline
  public queueOperation(operation: SyncOperation) {
    if (this.isOnline && this.websocket?.readyState === WebSocket.OPEN) {
      this.executeOperation(operation);
    } else {
      this.syncQueue.push(operation);
      this.saveOfflineQueue();
    }
  }

  private async executeOperation(operation: SyncOperation) {
    try {
      switch (operation.type) {
        case 'UPDATE_TASK':
          await this.store.dispatch(updateTask(operation.payload));
          break;
        case 'CREATE_TASK':
          await this.store.dispatch(createTask(operation.payload));
          break;
        case 'DELETE_TASK':
          await this.store.dispatch(deleteTask(operation.payload.id));
          break;
      }
    } catch (error) {
      console.error('Sync operation failed:', error);
      // Re-queue operation for retry
      this.syncQueue.push(operation);
    }
  }

  private async processOfflineQueue() {
    if (this.syncQueue.length === 0) return;

    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      await this.executeOperation(operation);
    }

    this.clearOfflineQueue();
  }

  private setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.initializeSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private saveOfflineQueue() {
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  private clearOfflineQueue() {
    localStorage.removeItem('syncQueue');
  }

  // Load queued operations on startup
  public loadOfflineQueue() {
    const saved = localStorage.getItem('syncQueue');
    if (saved) {
      this.syncQueue = JSON.parse(saved);
    }
  }
}
```

## 🎯 Migration Integration

### Feature Flag Data Integration
```typescript
// Integration with migration system data requirements
export const createMigrationDataSlice = () => createSlice({
  name: 'migration',
  initialState: {
    currentPhase: 1,
    featureFlags: FEATURE_FLAG_DEFAULTS,
    performanceMetrics: {},
    rolloutStatus: {},
    migrationHistory: []
  },
  reducers: {
    updateFeatureFlag: (state, action: PayloadAction<{ flag: string; enabled: boolean }>) => {
      const { flag, enabled } = action.payload;
      state.featureFlags[flag] = enabled;
      
      // Track migration history
      state.migrationHistory.push({
        flag,
        enabled,
        timestamp: new Date().toISOString(),
        phase: state.currentPhase
      });
    },
    
    updatePerformanceMetric: (state, action: PayloadAction<{ metric: string; value: number }>) => {
      const { metric, value } = action.payload;
      state.performanceMetrics[metric] = value;
    },
    
    advancePhase: (state) => {
      state.currentPhase++;
    }
  }
});
```

## 🎯 Development Guidelines

### Data Layer Testing
```typescript
// data/__tests__/task.repository.test.ts
describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockApiClient: jest.Mocked<APIClient>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    repository = new TaskRepository();
    (repository as any).apiClient = mockApiClient;
  });

  test('should cache task data', async () => {
    const mockTask: TaskCard = createMockTask();
    mockApiClient.get.mockResolvedValue({ data: mockTask });

    // First call - should hit API
    const result1 = await repository.getById('123');
    expect(mockApiClient.get).toHaveBeenCalledTimes(1);

    // Second call - should hit cache
    const result2 = await repository.getById('123');
    expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
  });

  test('should validate status transitions', async () => {
    const mockTask: TaskCard = createMockTask({ status: TaskStatus.COMPLETED });
    mockApiClient.get.mockResolvedValue({ data: mockTask });

    await expect(
      repository.updateTaskStatus('123', TaskStatus.PENDING)
    ).rejects.toThrow('Invalid status transition');
  });
});
```

## 🎯 Next Steps
1. **Phase 2A**: Implement specialized data selectors for decomposed hooks
2. **Phase 2B**: Add real-time data synchronization for LifeLock updates
3. **Phase 2C**: Optimize cache strategies for performance
4. **Phase 3**: Add offline-first data capabilities
5. **Phase 4**: Implement advanced conflict resolution and data versioning

---
*Comprehensive data management system with intelligent caching and real-time synchronization*