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
  offlineActions: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: 'lightWorkTasks' | 'deepWorkTasks';
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
  private readonly DB_VERSION = 1;

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

    const stores = ['lightWorkTasks', 'deepWorkTasks', 'offlineActions', 'settings'] as const;
    
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
    pendingActions: number;
    lastSync?: string;
  }> {
    if (!this.db) await this.init();

    const lightWorkCount = await this.db!.count('lightWorkTasks');
    const deepWorkCount = await this.db!.count('deepWorkTasks');
    const pendingActionsCount = await this.db!.count('offlineActions');
    const lastSync = await this.getSetting('lastSync');

    return {
      lightWorkTasks: lightWorkCount,
      deepWorkTasks: deepWorkCount,
      pendingActions: pendingActionsCount,
      lastSync
    };
  }
}

// Export singleton instance
export const offlineDb = new OfflineDatabase();

// Auto-initialize on import
offlineDb.init().catch(console.error);