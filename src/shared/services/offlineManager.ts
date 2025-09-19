/**
 * 🚀 SISO LifeLock Offline Manager
 * Complete offline-first architecture for bulletproof productivity
 */

import { offlineDb } from '../offline/offlineDb';

interface OfflineStatus {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  pendingSyncCount: number;
  lastSyncTime?: string;
  syncInProgress: boolean;
}

class OfflineManager {
  private status: OfflineStatus = {
    isOnline: navigator.onLine,
    isSupabaseConnected: false,
    pendingSyncCount: 0,
    syncInProgress: false
  };

  private listeners: Array<(status: OfflineStatus) => void> = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Initialize offline database
    await offlineDb.init();

    // Set up network listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Set up periodic sync (every 30 seconds when online)
    this.setupPeriodicSync();

    // Initial status check
    await this.checkStatus();

    console.log('🚀 LifeLock Offline Manager initialized');
  }

  // ===== STATUS MANAGEMENT =====
  
  async checkStatus(): Promise<OfflineStatus> {
    this.status.isOnline = navigator.onLine;
    
    if (this.status.isOnline) {
      this.status.isSupabaseConnected = await this.testSupabaseConnection();
    } else {
      this.status.isSupabaseConnected = false;
    }

    const stats = await offlineDb.getStats();
    this.status.pendingSyncCount = stats.pendingActions;
    this.status.lastSyncTime = stats.lastSync;

    this.notifyListeners();
    return this.status;
  }

  private async testSupabaseConnection(): Promise<boolean> {
    try {
      // Import Supabase client directly without hooks
      const { supabaseAnon } = await import('@/shared/lib/supabase-clerk');
      const { error } = await supabaseAnon.from('users').select('id').limit(1);
      return !error;
    } catch (error) {
      console.warn('Supabase connection test failed:', error);
      return false;
    }
  }

  getStatus(): OfflineStatus {
    return { ...this.status };
  }

  onStatusChange(callback: (status: OfflineStatus) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback({ ...this.status }));
  }

  // ===== NETWORK EVENT HANDLERS =====

  private async handleOnline() {
    console.log('🌐 Back online - initiating sync');
    await this.checkStatus();
    await this.syncPendingActions();
  }

  private async handleOffline() {
    console.log('📴 Gone offline - switching to offline mode');
    await this.checkStatus();
  }

  // ===== DATA OPERATIONS =====

  // Save task with offline support
  async saveTask(
    table: string,
    task: any,
    forceOffline = false
  ): Promise<{ success: boolean; offline?: boolean; error?: string }> {
    try {
      // Try online first (unless forced offline)
      if (!forceOffline && this.status.isOnline && this.status.isSupabaseConnected) {
        const result = await this.saveToSupabase(table, task);
        if (result.success) {
          // Also save to offline db for caching (if supported table)
          if (table === 'lightWorkTasks' || table === 'deepWorkTasks') {
            await offlineDb[table === 'lightWorkTasks' ? 'saveLightWorkTask' : 'saveDeepWorkTask'](
              task, 
              false // Don't mark for sync since it's already saved online
            );
          } else {
            // For other tables, save as generic offline action
            await offlineDb.queueAction(
              table,
              'create',
              task
            );
          }
          return { success: true };
        }
      }

      // Fallback to offline storage
      console.log('💾 Saving to offline storage:', table, task.title || task.id);
      if (table === 'lightWorkTasks' || table === 'deepWorkTasks') {
        await offlineDb[table === 'lightWorkTasks' ? 'saveLightWorkTask' : 'saveDeepWorkTask'](
          task, 
          true // Mark for sync
        );
      } else {
        // For other tables, save as pending action
        await offlineDb.queueAction(
          table,
          'create',
          task
        );
      }

      await this.checkStatus(); // Update pending count
      
      return { success: true, offline: true };
    } catch (error) {
      console.error('❌ Failed to save task:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Load tasks with offline fallback
  async loadTasks(
    table: string,
    filters?: any
  ): Promise<any[]> {
    try {
      // Try online first
      if (this.status.isOnline && this.status.isSupabaseConnected) {
        const onlineTasks = await this.loadFromSupabase(table, filters);
        
        // Cache online data offline (if supported table)
        if (table === 'lightWorkTasks' || table === 'deepWorkTasks') {
          for (const task of onlineTasks) {
            await offlineDb[table === 'lightWorkTasks' ? 'saveLightWorkTask' : 'saveDeepWorkTask'](
              task, 
              false // Don't mark for sync
            );
          }
        }
        
        return onlineTasks;
      }
    } catch (error) {
      console.warn('⚠️ Online load failed, using offline data:', error);
    }

    // Fallback to offline data
    console.log('📱 Loading from offline storage:', table);
    if (table === 'lightWorkTasks' || table === 'deepWorkTasks') {
      const dateFilter = filters?.date || filters;
      return await offlineDb[table === 'lightWorkTasks' ? 'getLightWorkTasks' : 'getDeepWorkTasks'](dateFilter);
    } else {
      // For other tables, return empty array (could be enhanced to store generic data)
      console.warn('⚠️ Table not supported for offline storage:', table);
      return [];
    }
  }

  // ===== SYNC OPERATIONS =====

  async syncPendingActions(): Promise<{ synced: number; failed: number }> {
    if (this.status.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping');
      return { synced: 0, failed: 0 };
    }

    this.status.syncInProgress = true;
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingActions = await offlineDb.getPendingActions();
      console.log(`🔄 Syncing ${pendingActions.length} pending actions`);

      for (const action of pendingActions) {
        try {
          const success = await this.syncAction(action);
          if (success) {
            await offlineDb.removeAction(action.id);
            syncedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error('❌ Sync action failed:', action, error);
          failedCount++;
        }
      }

      // Update last sync time
      await offlineDb.setSetting('lastSync', new Date().toISOString());
      
    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.status.syncInProgress = false;
      await this.checkStatus();
    }

    console.log(`✅ Sync complete: ${syncedCount} synced, ${failedCount} failed`);
    return { synced: syncedCount, failed: failedCount };
  }

  private async syncAction(action: any): Promise<boolean> {
    try {
      const { supabaseAnon } = await import('@/shared/lib/supabase-clerk');
      const supabase = supabaseAnon;
      
      // Map table names to actual Supabase tables
      const tableMapping: Record<string, string> = {
        'lightWorkTasks': 'user_light_work_tasks',
        'deepWorkTasks': 'user_deep_work_tasks',
        'morning_routine': 'daily_health',
        'morning_routine_habits': 'daily_health'
      };
      
      const tableName = tableMapping[action.table] || action.table;

      switch (action.action) {
        case 'create':
        case 'update':
          const { error } = await supabase
            .from(tableName)
            .upsert(action.data);
          return !error;

        case 'delete':
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', action.data.id);
          return !deleteError;

        default:
          console.warn('Unknown action type:', action.action);
          return false;
      }
    } catch (error) {
      console.error('Sync action error:', error);
      return false;
    }
  }

  // ===== SUPABASE OPERATIONS =====

  private async saveToSupabase(table: string, task: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { supabaseAnon } = await import('@/shared/lib/supabase-clerk');
      const supabase = supabaseAnon;
      
      // Map table names to actual Supabase tables
      const tableMapping: Record<string, string> = {
        'lightWorkTasks': 'user_light_work_tasks',
        'deepWorkTasks': 'user_deep_work_tasks',
        'morning_routine': 'daily_health',
        'morning_routine_habits': 'daily_health'
      };
      
      const tableName = tableMapping[table] || table;
      
      const { error } = await supabase
        .from(tableName)
        .upsert(task);

      return { success: !error, error: error?.message };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async loadFromSupabase(table: string, filters?: any): Promise<any[]> {
    const { supabaseAnon } = await import('@/shared/lib/supabase-clerk');
    const supabase = supabaseAnon;
    
    // Map table names to actual Supabase tables
    const tableMapping: Record<string, string> = {
      'lightWorkTasks': 'user_light_work_tasks',
      'deepWorkTasks': 'user_deep_work_tasks', 
      'morning_routine': 'daily_health',
      'morning_routine_habits': 'daily_health'
    };
    
    const tableName = tableMapping[table] || table;
    let query = supabase.from(tableName).select('*');
    
    // Apply filters
    if (filters) {
      if (typeof filters === 'string') {
        // Legacy date filter
        query = query.eq('task_date', filters);
      } else if (typeof filters === 'object') {
        // Object filters
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to load from ${tableName}: ${error.message}`);
    }

    return data || [];
  }

  // ===== UTILITIES =====

  private setupPeriodicSync() {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(async () => {
      if (this.status.isOnline && this.status.isSupabaseConnected && !this.status.syncInProgress) {
        const stats = await offlineDb.getStats();
        if (stats.pendingActions > 0) {
          await this.syncPendingActions();
        }
      }
    }, 30000);
  }

  // Force immediate sync
  async forcSync(): Promise<{ synced: number; failed: number }> {
    console.log('🚀 Force sync triggered');
    return await this.syncPendingActions();
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    await offlineDb.clear();
    await this.checkStatus();
    console.log('🗑️ All offline data cleared');
  }

  // Get detailed offline stats
  async getOfflineStats(): Promise<{
    database: any;
    network: OfflineStatus;
    cacheSize: number;
  }> {
    const dbStats = await offlineDb.getStats();
    
    // Estimate cache size (rough calculation)
    const cacheSize = (dbStats.lightWorkTasks + dbStats.deepWorkTasks) * 1024; // Rough estimate

    return {
      database: dbStats,
      network: this.status,
      cacheSize
    };
  }

  // Clean up
  destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    this.listeners = [];
    console.log('🔌 Offline Manager destroyed');
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

// Export types
export type { OfflineStatus };