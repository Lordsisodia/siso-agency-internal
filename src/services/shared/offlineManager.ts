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

    // 🔧 AUTO-CLEANUP: Clear broken daily_health sync actions (one-time fix)
    // This removes any pending actions with malformed UUIDs that would fail
    try {
      const pending = await offlineDb.getPendingActions();
      const brokenActions = pending.filter(action =>
        action.table === 'daily_health' &&
        action.data?.id &&
        typeof action.data.id === 'string' &&
        action.data.id.includes('-2025-') // Detect malformed "userId-date" format
      );

      if (brokenActions.length > 0) {
        console.log(`🧹 [AUTO-CLEANUP] Removing ${brokenActions.length} broken daily_health sync actions...`);
        for (const action of brokenActions) {
          await offlineDb.removeAction(action.id);
        }
        console.log('✅ [AUTO-CLEANUP] Broken actions cleared - sync will work now!');
      }
    } catch (error) {
      console.warn('⚠️ Auto-cleanup failed (non-critical):', error);
    }

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
      const { supabaseAnon } = await import('@/lib/supabase-clerk');
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

  // ===== UNIVERSAL DATA OPERATIONS - BMAD Phase 2A =====

  // 🚀 Universal save method for any table
  async saveUniversal(
    table: string,
    data: any,
    forceOffline = false
  ): Promise<{ success: boolean; offline?: boolean; error?: string }> {
    try {
      // Try online first (unless forced offline)
      if (!forceOffline && this.status.isOnline && this.status.isSupabaseConnected) {
        const result = await this.saveToSupabase(table, data);
        if (result.success) {
          // Cache to offline storage for supported tables
          await this.cacheToOfflineStorage(table, data, false);
          return { success: true };
        }
      }

      // Fallback to offline storage
      console.log('💾 Universal offline save:', table, data.title || data.name || data.id);
      await this.cacheToOfflineStorage(table, data, true);
      await this.checkStatus(); // Update pending count
      
      return { success: true, offline: true };
    } catch (error) {
      console.error('❌ Universal save failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 🚀 Universal load method for any table
  async loadUniversal(table: string, filters?: any): Promise<any[]> {
    try {
      // 🚀 FIXED: Check IndexedDB first for offline-first architecture
      console.log('🔍 Loading from IndexedDB first:', table);
      const offlineData = await this.loadFromOfflineStorage(table, filters);
      
      // If we have offline data, return it immediately (offline-first)
      if (offlineData && offlineData.length > 0) {
        console.log(`📱 Found ${offlineData.length} items in IndexedDB for ${table}`);
        return offlineData;
      }
      
      // Only try online if no offline data and we're connected
      if (this.status.isOnline && this.status.isSupabaseConnected) {
        console.log('☁️ No offline data, trying Supabase:', table);
        const onlineData = await this.loadFromSupabase(table, filters);
        
        // Cache online data offline for future use
        for (const item of onlineData) {
          await this.cacheToOfflineStorage(table, item, false);
        }
        
        return onlineData;
      }
    } catch (error) {
      console.warn('⚠️ Load failed, returning empty array:', error);
    }

    // Fallback to empty array if everything fails
    console.log('📭 No data found for:', table);
    return [];
  }

  // 🚀 Smart caching method
  private async cacheToOfflineStorage(table: string, data: any, markForSync: boolean): Promise<void> {
    if (table === 'lightWorkTasks' || table === 'deepWorkTasks') {
      // Use existing specialized methods
      await offlineDb[table === 'lightWorkTasks' ? 'saveLightWorkTask' : 'saveDeepWorkTask'](
        data, 
        markForSync
      );
    } else {
      // Queue as generic action for other tables
      await offlineDb.queueAction('create', table as any, data);
    }
  }

  // 🚀 Universal offline loading
  private async loadFromOfflineStorage(table: string, filters?: any): Promise<any[]> {
    if (table === 'lightWorkTasks' || table === 'deepWorkTasks') {
      const dateFilter = filters?.date || filters;
      return await offlineDb[table === 'lightWorkTasks' ? 'getLightWorkTasks' : 'getDeepWorkTasks'](dateFilter);
    } else {
      // For other tables, could implement generic storage or return empty
      console.warn('⚠️ Table not yet supported for offline storage:', table);
      return [];
    }
  }

  // Legacy method for backward compatibility
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
              'create',
              table,
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
          'create',
          table as any,
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
      const { supabaseAnon } = await import('@/lib/supabase-clerk');
      const supabase = supabaseAnon;
      
      // 🚀 UNIVERSAL TABLE MAPPING - BMAD Phase 2A (syncAction)
      const tableMapping: Record<string, string> = {
        // Work Tasks (Phase 1 - Complete)
        'lightWorkTasks': 'light_work_tasks',
        'deepWorkTasks': 'deep_work_sessions',
        
        // Health & Routine Data  
        'morning_routine': 'daily_health',
        'morning_routine_habits': 'daily_health',
        'dailyHealth': 'daily_health',
        
        // Generic Task Management
        'tasks': 'tasks',
        'genericTasks': 'tasks',
        
        // User & Memory Data
        'users': 'users',
        'memories': 'memories',
        'projectMemories': 'project_memories',
        'businessContext': 'business_context',
        
        // System Tables
        'learningPatterns': 'learning_patterns',
        'workingStylePreferences': 'working_style_preferences',
        'embeddingJobs': 'embedding_jobs',
        'claudeEffectiveness': 'claude_effectiveness_metrics'
      };
      
      const tableName = tableMapping[action.table] || action.table;

      switch (action.action) {
        case 'create':
        case 'update':
          // Use proper upsert with conflict resolution
          const upsertOptions = tableName === 'daily_health'
            ? { onConflict: 'user_id,date', ignoreDuplicates: false }
            : {};

          // 🔧 FIX: Remove id field from daily_health records
          // Database uses (user_id, date) composite key, not id
          let dataToUpsert = action.data;
          if (tableName === 'daily_health' && action.data.id) {
            const { id, ...dataWithoutId } = action.data;
            dataToUpsert = dataWithoutId;
            console.log('🔧 [SYNC FIX] Stripped invalid id from daily_health record:', id);
          }

          const { error } = await supabase
            .from(tableName)
            .upsert(dataToUpsert, upsertOptions);

          if (error) {
            console.error(`❌ Sync upsert failed for ${tableName}:`, error);
          }
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
      const { supabaseAnon } = await import('@/lib/supabase-clerk');
      const supabase = supabaseAnon;
      
      // 🚀 UNIVERSAL TABLE MAPPING - BMAD Phase 2A (saveToSupabase)
      const tableMapping: Record<string, string> = {
        // Work Tasks (Phase 1 - Complete)
        'lightWorkTasks': 'light_work_tasks',
        'deepWorkTasks': 'deep_work_sessions',
        
        // Health & Routine Data  
        'morning_routine': 'daily_health',
        'morning_routine_habits': 'daily_health',
        'dailyHealth': 'daily_health',
        
        // Generic Task Management
        'tasks': 'tasks',
        'genericTasks': 'tasks',
        
        // User & Memory Data
        'users': 'users',
        'memories': 'memories',
        'projectMemories': 'project_memories',
        'businessContext': 'business_context',
        
        // System Tables
        'learningPatterns': 'learning_patterns',
        'workingStylePreferences': 'working_style_preferences',
        'embeddingJobs': 'embedding_jobs',
        'claudeEffectiveness': 'claude_effectiveness_metrics'
      };
      
      const tableName = tableMapping[table] || table;
      
      // 🐛 ENHANCED DEBUG: Log what we're trying to save
      console.log('💾 Saving to Supabase:', {
        originalTable: table,
        mappedTable: tableName,
        dataKeys: Object.keys(task),
        sampleData: { id: task.id, title: task.title, user_id: task.user_id }
      });
      
      // Use upsert with proper conflict resolution
      // For daily_health, the unique key is (user_id, date)
      const upsertOptions = tableName === 'daily_health'
        ? { onConflict: 'user_id,date', ignoreDuplicates: false }
        : {};

      // 🔧 FIX: Remove id field from daily_health records
      // Database uses (user_id, date) composite key, not id
      let dataToUpsert = task;
      if (tableName === 'daily_health' && task.id) {
        const { id, ...dataWithoutId } = task;
        dataToUpsert = dataWithoutId;
        console.log('🔧 [SAVE FIX] Stripped invalid id from daily_health record:', id);
      }

      const { data, error } = await supabase
        .from(tableName)
        .upsert(dataToUpsert, upsertOptions)
        .select(); // Add select to get better error info

      // 🐛 ENHANCED DEBUG: Log response
      if (error) {
        console.error('❌ Supabase save error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log('✅ Supabase save success:', data);
      }

      return { success: !error, error: error?.message };
    } catch (error) {
      console.error('❌ Supabase save exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async loadFromSupabase(table: string, filters?: any): Promise<any[]> {
    const { supabaseAnon } = await import('@/lib/supabase-clerk');
    const supabase = supabaseAnon;
    
    // 🚀 UNIVERSAL TABLE MAPPING - BMAD Phase 2A (loadFromSupabase)
    const tableMapping: Record<string, string> = {
      // Work Tasks (Phase 1 - Complete)
      'lightWorkTasks': 'light_work_tasks',
      'deepWorkTasks': 'deep_work_sessions',
      
      // Health & Routine Data  
      'morning_routine': 'daily_health',
      'morning_routine_habits': 'daily_health',
      'dailyHealth': 'daily_health',
      
      // Generic Task Management
      'tasks': 'tasks',
      'genericTasks': 'tasks',
      
      // User & Memory Data
      'users': 'users',
      'memories': 'memories',
      'projectMemories': 'project_memories',
      'businessContext': 'business_context',
      
      // System Tables
      'learningPatterns': 'learning_patterns',
      'workingStylePreferences': 'working_style_preferences',
      'embeddingJobs': 'embedding_jobs',
      'claudeEffectiveness': 'claude_effectiveness_metrics'
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

  // Clear only pending sync actions (keeps cached data)
  async clearPendingActions(): Promise<void> {
    const pending = await offlineDb.getPendingActions();
    console.log(`🗑️ Clearing ${pending.length} pending actions...`);

    for (const action of pending) {
      await offlineDb.removeAction(action.id);
    }

    await this.checkStatus();
    console.log('✅ Pending actions cleared');
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

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).offlineManager = offlineManager;
  console.log('🔧 [OFFLINE] offlineManager available globally as window.offlineManager');
  console.log('💡 [OFFLINE] Run offlineManager.clearPendingActions() to clear failed sync queue');
}

// Export types
export type { OfflineStatus };