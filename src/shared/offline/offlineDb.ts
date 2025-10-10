/**
 * SISO Offline Database - Local-First Data Layer
 * IndexedDB wrapper for offline LifeLock task management
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema for offline storage
interface OfflineDB extends DBSchema {
  lightWorkTasks: {
    key: string;
    value: {
      id: string;
      user_id: string;
      title: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      completed: boolean;
      original_date: string;
      task_date: string;
      estimated_duration?: number;
      actual_duration_min?: number;
      xp_reward?: number;
      difficulty?: number;
      complexity?: number;
      created_at: string;
      updated_at: string;
      completed_at?: string;
      // Offline sync metadata
      _offline_id?: string;
      _needs_sync?: boolean;
      _last_synced?: string;
      _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
  deepWorkTasks: {
    key: string;
    value: {
      id: string;
      user_id: string;
      title: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      completed: boolean;
      original_date: string;
      task_date: string;
      estimated_duration?: number;
      actual_duration_min?: number;
      focus_blocks?: number;
      xp_reward?: number;
      difficulty?: number;
      complexity?: number;
      created_at: string;
      updated_at: string;
      completed_at?: string;
      // Offline sync metadata
      _offline_id?: string;
      _needs_sync?: boolean;
      _last_synced?: string;
      _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
  morningRoutines: {
    key: string;
    value: {
      id: string;
      user_id: string;
      date: string;
      routine_type: string;
      items: any;
      completed_count: number;
      total_count: number;
      completion_percentage: number;
      created_at: string;
      updated_at: string;
      _needs_sync?: boolean;
      _last_synced?: string;
      _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
  workoutSessions: {
    key: string;
    value: {
      id: string;
      user_id: string;
      workout_date: string;
      items: any;
      total_exercises: number;
      completed_exercises: number;
      created_at: string;
      updated_at: string;
      _needs_sync?: boolean;
      _last_synced?: string;
      _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
  healthHabits: {
    key: string;
    value: {
      id: string;
      user_id: string;
      habit_date: string;
      habits: any;
      created_at: string;
      updated_at: string;
      _needs_sync?: boolean;
      _last_synced?: string;
      _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
  nightlyCheckouts: {
    key: string;
    value: {
      id: string;
      user_id: string;
      checkout_date: string;
      reflection: string;
      wins: string[];
      improvements: string[];
      tomorrow_focus: string;
      created_at: string;
      updated_at: string;
      _needs_sync?: boolean;
      _last_synced?: string;
      _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
    };
  };
  offlineActions: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: string;
      retry_count: number;
      error?: string;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      updated_at: string;
    };
  };
}

class OfflineDatabase {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private readonly DB_NAME = 'SISOOfflineDB';
  private readonly DB_VERSION = 2; // v2: Added morning routines, workouts, health habits, nightly checkout

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<OfflineDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Light work tasks store
        if (!db.objectStoreNames.contains('lightWorkTasks')) {
          const lightWorkStore = db.createObjectStore('lightWorkTasks', { keyPath: 'id' });
          lightWorkStore.createIndex('task_date', 'task_date');
          lightWorkStore.createIndex('completed', 'completed');
          lightWorkStore.createIndex('needs_sync', '_needs_sync');
          lightWorkStore.createIndex('sync_status', '_sync_status');
        }

        // Deep work tasks store
        if (!db.objectStoreNames.contains('deepWorkTasks')) {
          const deepWorkStore = db.createObjectStore('deepWorkTasks', { keyPath: 'id' });
          deepWorkStore.createIndex('task_date', 'task_date');
          deepWorkStore.createIndex('completed', 'completed');
          deepWorkStore.createIndex('needs_sync', '_needs_sync');
          deepWorkStore.createIndex('sync_status', '_sync_status');
        }

        // Offline actions queue
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp');
          actionsStore.createIndex('table', 'table');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Morning routines store
        if (!db.objectStoreNames.contains('morningRoutines')) {
          const morningStore = db.createObjectStore('morningRoutines', { keyPath: 'id' });
          morningStore.createIndex('date', 'date');
          morningStore.createIndex('user_id', 'user_id');
          morningStore.createIndex('needs_sync', '_needs_sync');
        }

        // Workout sessions store
        if (!db.objectStoreNames.contains('workoutSessions')) {
          const workoutStore = db.createObjectStore('workoutSessions', { keyPath: 'id' });
          workoutStore.createIndex('workout_date', 'workout_date');
          workoutStore.createIndex('user_id', 'user_id');
          workoutStore.createIndex('needs_sync', '_needs_sync');
        }

        // Health habits store
        if (!db.objectStoreNames.contains('healthHabits')) {
          const healthStore = db.createObjectStore('healthHabits', { keyPath: 'id' });
          healthStore.createIndex('habit_date', 'habit_date');
          healthStore.createIndex('user_id', 'user_id');
          healthStore.createIndex('needs_sync', '_needs_sync');
        }

        // Nightly checkout store
        if (!db.objectStoreNames.contains('nightlyCheckouts')) {
          const checkoutStore = db.createObjectStore('nightlyCheckouts', { keyPath: 'id' });
          checkoutStore.createIndex('checkout_date', 'checkout_date');
          checkoutStore.createIndex('user_id', 'user_id');
          checkoutStore.createIndex('needs_sync', '_needs_sync');
        }
      },
    });

    console.log('📱 Offline database initialized');
  }

  // ===== LIGHT WORK TASKS =====
  async getLightWorkTasks(date?: string): Promise<OfflineDB['lightWorkTasks']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('lightWorkTasks', 'readonly');
    const store = tx.objectStore('lightWorkTasks');
    
    if (date) {
      const index = store.index('task_date');
      return await index.getAll(date);
    }
    
    return await store.getAll();
  }

  async saveLightWorkTask(task: OfflineDB['lightWorkTasks']['value'], markForSync = true): Promise<void> {
    if (!this.db) await this.init();

    const taskWithMeta = {
      ...task,
      _needs_sync: markForSync,
      _sync_status: markForSync ? 'pending' as const : 'synced' as const,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('lightWorkTasks', 'readwrite');
    await tx.objectStore('lightWorkTasks').put(taskWithMeta);
    await tx.done;

    if (markForSync) {
      await this.queueAction('update', 'lightWorkTasks', task);
    }
  }

  // ===== DEEP WORK TASKS =====
  async getDeepWorkTasks(date?: string): Promise<OfflineDB['deepWorkTasks']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('deepWorkTasks', 'readonly');
    const store = tx.objectStore('deepWorkTasks');
    
    if (date) {
      const index = store.index('task_date');
      return await index.getAll(date);
    }
    
    return await store.getAll();
  }

  async saveDeepWorkTask(task: OfflineDB['deepWorkTasks']['value'], markForSync = true): Promise<void> {
    if (!this.db) await this.init();

    const taskWithMeta = {
      ...task,
      _needs_sync: markForSync,
      _sync_status: markForSync ? 'pending' as const : 'synced' as const,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('deepWorkTasks', 'readwrite');
    await tx.objectStore('deepWorkTasks').put(taskWithMeta);
    await tx.done;

    if (markForSync) {
      await this.queueAction('update', 'deepWorkTasks', task);
    }
  }

  // ===== MORNING ROUTINES =====
  async getMorningRoutines(date?: string): Promise<OfflineDB['morningRoutines']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('morningRoutines', 'readonly');
    const store = tx.objectStore('morningRoutines');
    
    if (date) {
      const index = store.index('date');
      return await index.getAll(date);
    }
    
    return await store.getAll();
  }

  async saveMorningRoutine(routine: OfflineDB['morningRoutines']['value'], markForSync = true): Promise<void> {
    if (!this.db) await this.init();

    const routineWithMeta = {
      ...routine,
      _needs_sync: markForSync,
      _sync_status: markForSync ? 'pending' as const : 'synced' as const,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('morningRoutines', 'readwrite');
    await tx.objectStore('morningRoutines').put(routineWithMeta);
    await tx.done;
  }

  // ===== WORKOUT SESSIONS =====
  async getWorkoutSessions(date?: string): Promise<OfflineDB['workoutSessions']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('workoutSessions', 'readonly');
    const store = tx.objectStore('workoutSessions');
    
    if (date) {
      const index = store.index('workout_date');
      return await index.getAll(date);
    }
    
    return await store.getAll();
  }

  async saveWorkoutSession(workout: OfflineDB['workoutSessions']['value'], markForSync = true): Promise<void> {
    if (!this.db) await this.init();

    const workoutWithMeta = {
      ...workout,
      _needs_sync: markForSync,
      _sync_status: markForSync ? 'pending' as const : 'synced' as const,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('workoutSessions', 'readwrite');
    await tx.objectStore('workoutSessions').put(workoutWithMeta);
    await tx.done;
  }

  // ===== HEALTH HABITS =====
  async getHealthHabits(date?: string): Promise<OfflineDB['healthHabits']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('healthHabits', 'readonly');
    const store = tx.objectStore('healthHabits');
    
    if (date) {
      const index = store.index('habit_date');
      return await index.getAll(date);
    }
    
    return await store.getAll();
  }

  async saveHealthHabit(habit: OfflineDB['healthHabits']['value'], markForSync = true): Promise<void> {
    if (!this.db) await this.init();

    const habitWithMeta = {
      ...habit,
      _needs_sync: markForSync,
      _sync_status: markForSync ? 'pending' as const : 'synced' as const,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('healthHabits', 'readwrite');
    await tx.objectStore('healthHabits').put(habitWithMeta);
    await tx.done;
  }

  // ===== NIGHTLY CHECKOUTS =====
  async getNightlyCheckouts(date?: string): Promise<OfflineDB['nightlyCheckouts']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('nightlyCheckouts', 'readonly');
    const store = tx.objectStore('nightlyCheckouts');
    
    if (date) {
      const index = store.index('checkout_date');
      return await index.getAll(date);
    }
    
    return await store.getAll();
  }

  async saveNightlyCheckout(checkout: OfflineDB['nightlyCheckouts']['value'], markForSync = true): Promise<void> {
    if (!this.db) await this.init();

    const checkoutWithMeta = {
      ...checkout,
      _needs_sync: markForSync,
      _sync_status: markForSync ? 'pending' as const : 'synced' as const,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('nightlyCheckouts', 'readwrite');
    await tx.objectStore('nightlyCheckouts').put(checkoutWithMeta);
    await tx.done;
  }

  // ===== OFFLINE ACTIONS QUEUE =====
  async queueAction(
    action: 'create' | 'update' | 'delete',
    table: 'lightWorkTasks' | 'deepWorkTasks',
    data: any
  ): Promise<void> {
    if (!this.db) await this.init();

    const actionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      table,
      data,
      timestamp: new Date().toISOString(),
      retry_count: 0
    };

    const tx = this.db!.transaction('offlineActions', 'readwrite');
    await tx.objectStore('offlineActions').add(actionRecord);
    await tx.done;
  }

  async getPendingActions(): Promise<OfflineDB['offlineActions']['value'][]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('offlineActions', 'readonly');
    const store = tx.objectStore('offlineActions');
    return await store.getAll();
  }

  async removeAction(actionId: string): Promise<void> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('offlineActions', 'readwrite');
    await tx.objectStore('offlineActions').delete(actionId);
    await tx.done;
  }

  // ===== SYNC STATUS =====
  async getTasksNeedingSync(): Promise<{
    lightWork: OfflineDB['lightWorkTasks']['value'][];
    deepWork: OfflineDB['deepWorkTasks']['value'][];
  }> {
    if (!this.db) await this.init();

    const lightWorkTx = this.db!.transaction('lightWorkTasks', 'readonly');
    const lightWorkIndex = lightWorkTx.objectStore('lightWorkTasks').index('needs_sync');
    const lightWork = await lightWorkIndex.getAll(true);

    const deepWorkTx = this.db!.transaction('deepWorkTasks', 'readonly');
    const deepWorkIndex = deepWorkTx.objectStore('deepWorkTasks').index('needs_sync');
    const deepWork = await deepWorkIndex.getAll(true);

    return { lightWork, deepWork };
  }

  async markTaskSynced(taskId: string, table: 'lightWorkTasks' | 'deepWorkTasks'): Promise<void> {
    if (!this.db) await this.init();

    const tx = this.db!.transaction(table, 'readwrite');
    const store = tx.objectStore(table);
    const task = await store.get(taskId);
    
    if (task) {
      task._needs_sync = false;
      task._sync_status = 'synced';
      task._last_synced = new Date().toISOString();
      await store.put(task);
    }
    
    await tx.done;
  }

  // ===== SETTINGS =====
  async getSetting(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('settings', 'readonly');
    const setting = await tx.objectStore('settings').get(key);
    return setting?.value;
  }

  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();

    const setting = {
      key,
      value,
      updated_at: new Date().toISOString()
    };

    const tx = this.db!.transaction('settings', 'readwrite');
    await tx.objectStore('settings').put(setting);
    await tx.done;
  }

  // ===== UTILITIES =====
  async clear(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['lightWorkTasks', 'deepWorkTasks', 'morningRoutines', 'workoutSessions', 'healthHabits', 'nightlyCheckouts', 'offlineActions', 'settings'] as const;
    
    for (const storeName of stores) {
      const tx = this.db!.transaction(storeName, 'readwrite');
      await tx.objectStore(storeName).clear();
      await tx.done;
    }

    console.log('🗑️ Offline database cleared');
  }

  async getStats(): Promise<{
    lightWorkTasks: number;
    deepWorkTasks: number;
    morningRoutines: number;
    workoutSessions: number;
    healthHabits: number;
    nightlyCheckouts: number;
    pendingActions: number;
    lastSync?: string;
  }> {
    if (!this.db) await this.init();

    const lightWorkCount = await this.db!.count('lightWorkTasks');
    const deepWorkCount = await this.db!.count('deepWorkTasks');
    const morningRoutinesCount = await this.db!.count('morningRoutines');
    const workoutSessionsCount = await this.db!.count('workoutSessions');
    const healthHabitsCount = await this.db!.count('healthHabits');
    const nightlyCheckoutsCount = await this.db!.count('nightlyCheckouts');
    const pendingActionsCount = await this.db!.count('offlineActions');
    const lastSync = await this.getSetting('lastSync');

    return {
      lightWorkTasks: lightWorkCount,
      deepWorkTasks: deepWorkCount,
      morningRoutines: morningRoutinesCount,
      workoutSessions: workoutSessionsCount,
      healthHabits: healthHabitsCount,
      nightlyCheckouts: nightlyCheckoutsCount,
      pendingActions: pendingActionsCount,
      lastSync
    };
  }
}

// Export singleton instance
export const offlineDb = new OfflineDatabase();

// Auto-initialize on import
offlineDb.init().catch(console.error);