import { supabase } from '@/lib/services/supabase/client';
import { offlineStorageService, MutationOperation } from './OfflineStorageService';

export class SyncManager {
  private syncInProgress = false;
  private retryCount = 0;
  private maxRetries = 3;

  async processQueue(userId: string): Promise<{ success: boolean; errors: string[] }> {
    if (this.syncInProgress) {
      return { success: false, errors: ['Sync already in progress'] };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    
    try {
      const queue = await offlineStorageService.getSyncQueue();
      const userQueue = queue.filter(op => op.userId === userId);
      
      
      
      for (const operation of userQueue) {
        try {
          await this.processOperation(operation);
        } catch (error) {
          const errorMsg = `Failed to sync ${operation.type} on ${operation.table}: ${error}`;
          console.error('[SyncManager]', errorMsg);
          errors.push(errorMsg);
        }
      }
      
      // Clear queue if all operations succeeded
      if (errors.length === 0) {
        await offlineStorageService.clearSyncQueue();
        this.retryCount = 0;
      } else {
        this.retryCount++;
      }
      
      return { success: errors.length === 0, errors };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processOperation(operation: MutationOperation): Promise<void> {
    const { type, table, data, id } = operation;
    
    switch (table) {
      case 'light_work_tasks':
        await this.syncLightWorkTask(type, data, id);
        break;
      case 'deep_work_tasks':
        await this.syncDeepWorkTask(type, data, id);
        break;
      case 'morning_routine':
        await this.syncMorningRoutineTask(type, data, id);
        break;
      case 'home_workout':
        await this.syncHomeWorkoutTask(type, data, id);
        break;
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  private async syncLightWorkTask(type: string, data: any, id: string): Promise<void> {
    switch (type) {
      case 'create':
        await supabase.from('light_work_tasks').insert(data);
        break;
      case 'update':
        await supabase.from('light_work_tasks').update(data).eq('id', id);
        break;
      case 'delete':
        await supabase.from('light_work_tasks').delete().eq('id', id);
        break;
    }
  }

  private async syncDeepWorkTask(type: string, data: any, id: string): Promise<void> {
    switch (type) {
      case 'create':
        await supabase.from('deep_work_tasks').insert(data);
        break;
      case 'update':
        await supabase.from('deep_work_tasks').update(data).eq('id', id);
        break;
      case 'delete':
        await supabase.from('deep_work_tasks').delete().eq('id', id);
        break;
    }
  }

  private async syncMorningRoutineTask(type: string, data: any, id: string): Promise<void> {
    switch (type) {
      case 'create':
        await supabase.from('morning_routine').insert(data);
        break;
      case 'update':
        await supabase.from('morning_routine').update(data).eq('id', id);
        break;
      case 'delete':
        await supabase.from('morning_routine').delete().eq('id', id);
        break;
    }
  }

  private async syncHomeWorkoutTask(type: string, data: any, id: string): Promise<void> {
    switch (type) {
      case 'create':
        await supabase.from('home_workout').insert(data);
        break;
      case 'update':
        await supabase.from('home_workout').update(data).eq('id', id);
        break;
      case 'delete':
        await supabase.from('home_workout').delete().eq('id', id);
        break;
    }
  }

  async handleConflicts(localData: any, remoteData: any): Promise<any> {
    // Simple conflict resolution: prefer most recent update
    const localTime = new Date(localData.updated_at || localData.updatedAt).getTime();
    const remoteTime = new Date(remoteData.updated_at || remoteData.updatedAt).getTime();
    
    if (localTime > remoteTime) {
      
      return localData;
    } else {
      
      return remoteData;
    }
  }

  detectOnlineStatus(): boolean {
    return navigator.onLine;
  }

  async scheduleBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        
      } catch (error) {
        console.error('[SyncManager] Failed to schedule background sync:', error);
      }
    }
  }

  async forceSyncNow(userId: string): Promise<boolean> {
    if (!this.detectOnlineStatus()) {
      
      return false;
    }

    const result = await this.processQueue(userId);
    
    if (result.success) {
      
      return true;
    } else {
      console.error('[SyncManager] Sync failed:', result.errors);
      
      // Retry with exponential backoff
      if (this.retryCount < this.maxRetries) {
        const delay = Math.pow(2, this.retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => this.forceSyncNow(userId), delay);
      }
      return false;
    }
  }

  // Get sync status for UI
  getSyncStatus(): { 
    inProgress: boolean; 
    retryCount: number; 
    maxRetries: number; 
    canRetry: boolean;
  } {
    return {
      inProgress: this.syncInProgress,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      canRetry: this.retryCount < this.maxRetries
    };
  }
}

export const syncManager = new SyncManager();