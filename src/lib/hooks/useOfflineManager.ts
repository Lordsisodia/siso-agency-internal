/**
 * 🚀 useOfflineManager Hook
 * React hook for seamless offline-first functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineManager, OfflineStatus } from '../services/offlineManager';

interface UseOfflineManagerReturn {
  // Status
  status: OfflineStatus;
  isOnline: boolean;
  isOffline: boolean;
  canSync: boolean;
  
  // Data operations
  saveTask: (table: string, task: any) => Promise<{
    success: boolean;
    offline?: boolean;
    error?: string;
  }>;
  loadTasks: (table: string, filters?: any) => Promise<any[]>;
  
  // Sync operations
  sync: () => Promise<{ synced: number; failed: number }>;
  clearOfflineData: () => Promise<void>;
  clearPendingActions: () => Promise<void>;

  // Stats
  getStats: () => Promise<any>;
}

export function useOfflineManager(): UseOfflineManagerReturn {
  const [status, setStatus] = useState<OfflineStatus>(offlineManager.getStatus());

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = offlineManager.onStatusChange(setStatus);
    
    // Initial status check
    offlineManager.checkStatus();
    
    return unsubscribe;
  }, []);

  // Memoized operations
  const saveTask = useCallback(async (
    table: string, 
    task: any
  ) => {
    return await offlineManager.saveTask(table, task);
  }, []);

  const loadTasks = useCallback(async (
    table: string, 
    filters?: any
  ) => {
    return await offlineManager.loadTasks(table, filters);
  }, []);

  const sync = useCallback(async () => {
    return await offlineManager.forcSync();
  }, []);

  const clearOfflineData = useCallback(async () => {
    await offlineManager.clearOfflineData();
  }, []);

  const clearPendingActions = useCallback(async () => {
    await offlineManager.clearPendingActions();
  }, []);

  const getStats = useCallback(async () => {
    return await offlineManager.getOfflineStats();
  }, []);

  return {
    // Status
    status,
    isOnline: status.isOnline,
    isOffline: !status.isOnline,
    canSync: status.isOnline && status.isSupabaseConnected && !status.syncInProgress,

    // Operations
    saveTask,
    loadTasks,
    sync,
    clearOfflineData,
    clearPendingActions,
    getStats
  };
}