/**
 * SISO Background Sync Service
 * Handles seamless synchronization between offline storage and Supabase
 */

import { offlineDb } from './offlineDb';
import { supabase } from '@/integrations/supabase/client';

export class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private retryAttempts = 0;
  private maxRetries = 3;

  constructor() {
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Network connection restored - starting sync');
      this.isOnline = true;
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Network connection lost - switching to offline mode');
      this.isOnline = false;
    });
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    
    try {
      console.log('🔄 Starting background sync...');
      
      // 1. Push local changes to server
      await this.pushLocalChanges();
      
      // 2. Pull latest data from server
      await this.pullServerData();
      
      // 3. Update last sync timestamp
      await offlineDb.setSetting('lastSync', new Date().toISOString());
      
      this.retryAttempts = 0;
      console.log('✅ Background sync completed successfully');
      
    } catch (error) {
      this.retryAttempts++;
      console.error(`❌ Sync failed (attempt ${this.retryAttempts}/${this.maxRetries}):`, error);
      
      if (this.retryAttempts < this.maxRetries) {
        setTimeout(() => this.syncAll(), 10000 * this.retryAttempts); // Exponential backoff
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pushLocalChanges(): Promise<void> {
    const pendingActions = await offlineDb.getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await this.executeSyncAction(action);
        await offlineDb.removeAction(action.id);
        
        // Mark the task as synced
        if (action.table === 'lightWorkTasks' || action.table === 'deepWorkTasks') {
          await offlineDb.markTaskSynced(action.data.id, action.table);
        }
        
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        // Increment retry count
        action.retry_count++;
        if (action.retry_count >= this.maxRetries) {
          console.error(`Action ${action.id} failed max retries, removing from queue`);
          await offlineDb.removeAction(action.id);
        }
      }
    }
  }

  private async executeSyncAction(action: any): Promise<void> {
    const table = action.table === 'lightWorkTasks' ? 'light_work_tasks' : 'deep_work_tasks';
    
    switch (action.action) {
      case 'create':
        await supabase.from(table).insert(action.data);
        break;
        
      case 'update':
        await supabase.from(table).update(action.data).eq('id', action.data.id);
        break;
        
      case 'delete':
        await supabase.from(table).delete().eq('id', action.data.id);
        break;
    }
  }

  private async pullServerData(): Promise<void> {
    try {
      // Get last sync timestamp
      const lastSync = await offlineDb.getSetting('lastSync');
      const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);
      
      // Fetch light work tasks updated since last sync
      const { data: lightWorkTasks } = await supabase
        .from('light_work_tasks')
        .select('*')
        .gte('updated_at', lastSyncDate.toISOString());
      
      if (lightWorkTasks) {
        for (const task of lightWorkTasks) {
          await offlineDb.saveLightWorkTask(task, false); // Don't mark for sync
        }
      }
      
      // Fetch deep work tasks updated since last sync
      const { data: deepWorkTasks } = await supabase
        .from('deep_work_tasks')
        .select('*')
        .gte('updated_at', lastSyncDate.toISOString());
      
      if (deepWorkTasks) {
        for (const task of deepWorkTasks) {
          await offlineDb.saveDeepWorkTask(task, false); // Don't mark for sync
        }
      }
      
    } catch (error) {
      console.error('Failed to pull server data:', error);
      throw error;
    }
  }

  // ===== PUBLIC API =====
  
  async createTask(task: any, type: 'light' | 'deep'): Promise<void> {
    // Always save to offline storage first
    if (type === 'light') {
      await offlineDb.saveLightWorkTask(task, true);
    } else {
      await offlineDb.saveDeepWorkTask(task, true);
    }
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncAll();
    }
  }

  async updateTask(task: any, type: 'light' | 'deep'): Promise<void> {
    // Always save to offline storage first
    if (type === 'light') {
      await offlineDb.saveLightWorkTask(task, true);
    } else {
      await offlineDb.saveDeepWorkTask(task, true);
    }
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncAll();
    }
  }

  async deleteTask(taskId: string, type: 'light' | 'deep'): Promise<void> {
    // Queue the delete action
    const table = type === 'light' ? 'lightWorkTasks' : 'deepWorkTasks';
    await offlineDb.queueAction('delete', table, { id: taskId });
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncAll();
    }
  }

  async getTasks(type: 'light' | 'deep', date?: string): Promise<any[]> {
    // Always read from offline storage first
    if (type === 'light') {
      return await offlineDb.getLightWorkTasks(date);
    } else {
      return await offlineDb.getDeepWorkTasks(date);
    }
  }

  getConnectionStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress
    };
  }

  async getSyncStats(): Promise<{
    localTasks: number;
    pendingSync: number;
    lastSync?: string;
  }> {
    const stats = await offlineDb.getStats();
    return {
      localTasks: stats.lightWorkTasks + stats.deepWorkTasks,
      pendingSync: stats.pendingActions,
      lastSync: stats.lastSync
    };
  }

  // Force a manual sync
  async forcSync(): Promise<void> {
    await this.syncAll();
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Service Worker Background Sync Integration
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    // Register for background sync when app comes back online
    registration.sync.register('sync-tasks').catch(console.error);
  });
}