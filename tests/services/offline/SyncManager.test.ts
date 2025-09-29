import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase with factory function
vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      }))
    }))
  }
}));

// Now import the modules after mocking
import { syncManager } from '@/services/offline/SyncManager';
import { offlineStorageService, MutationOperation } from '@/services/offline/OfflineStorageService';
import { supabase } from '@/shared/lib/supabase';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('SyncManager', () => {
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    await offlineStorageService.init();
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Queue Processing', () => {
    it('should process empty queue successfully', async () => {
      const result = await syncManager.processQueue(testUserId);
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should process light work task mutations', async () => {
      const mutations: MutationOperation[] = [
        {
          id: 'mutation-1',
          type: 'create',
          table: 'light_work_tasks',
          data: { title: 'New Task', priority: 'high' },
          timestamp: Date.now(),
          userId: testUserId
        },
        {
          id: 'mutation-2', 
          type: 'update',
          table: 'light_work_tasks',
          data: { completed: true },
          timestamp: Date.now(),
          userId: testUserId
        },
        {
          id: 'mutation-3',
          type: 'delete',
          table: 'light_work_tasks',
          data: {},
          timestamp: Date.now(),
          userId: testUserId
        }
      ];

      // Queue the mutations
      for (const mutation of mutations) {
        await offlineStorageService.queueMutation(mutation);
      }

      const result = await syncManager.processQueue(testUserId);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // Verify Supabase calls
      expect(supabase.from).toHaveBeenCalledWith('light_work_tasks');
      expect(supabase.from('light_work_tasks').insert).toHaveBeenCalledWith({
        title: 'New Task',
        priority: 'high'
      });
    });

    it('should process deep work task mutations', async () => {
      const mutation: MutationOperation = {
        id: 'mutation-1',
        type: 'create',
        table: 'deep_work_tasks',
        data: { title: 'Deep Work Task', estimatedDuration: 120 },
        timestamp: Date.now(),
        userId: testUserId
      };

      await offlineStorageService.queueMutation(mutation);
      const result = await syncManager.processQueue(testUserId);

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('deep_work_tasks');
    });

    it('should process morning routine mutations', async () => {
      const mutation: MutationOperation = {
        id: 'mutation-1',
        type: 'update',
        table: 'morning_routine',
        data: { completed: true },
        timestamp: Date.now(),
        userId: testUserId
      };

      await offlineStorageService.queueMutation(mutation);
      const result = await syncManager.processQueue(testUserId);

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('morning_routine');
    });

    it('should process home workout mutations', async () => {
      const mutation: MutationOperation = {
        id: 'mutation-1',
        type: 'create',
        table: 'home_workout',
        data: { exercise: 'Push-ups', sets: 3 },
        timestamp: Date.now(),
        userId: testUserId
      };

      await offlineStorageService.queueMutation(mutation);
      const result = await syncManager.processQueue(testUserId);

      expect(result.success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('home_workout');
    });

    it('should handle sync errors gracefully', async () => {
      // Mock Supabase to throw error
      const errorSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockRejectedValue(new Error('Network error'))
        }))
      };
      
      vi.doMock('@/shared/lib/supabase', () => ({
        supabase: errorSupabase
      }));

      const mutation: MutationOperation = {
        id: 'mutation-1',
        type: 'create',
        table: 'light_work_tasks',
        data: { title: 'Test Task' },
        timestamp: Date.now(),
        userId: testUserId
      };

      await offlineStorageService.queueMutation(mutation);
      const result = await syncManager.processQueue(testUserId);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Network error');
    });

    it('should filter mutations by user ID', async () => {
      const user1Mutation: MutationOperation = {
        id: 'mutation-1',
        type: 'create',
        table: 'light_work_tasks',
        data: { title: 'User 1 Task' },
        timestamp: Date.now(),
        userId: 'user-1'
      };

      const user2Mutation: MutationOperation = {
        id: 'mutation-2',
        type: 'create',
        table: 'light_work_tasks',
        data: { title: 'User 2 Task' },
        timestamp: Date.now(),
        userId: 'user-2'
      };

      await offlineStorageService.queueMutation(user1Mutation);
      await offlineStorageService.queueMutation(user2Mutation);

      // Process only user-1's mutations
      const result = await syncManager.processQueue('user-1');

      expect(result.success).toBe(true);
      // Should only process one mutation (user-1's)
      expect(supabase.from('light_work_tasks').insert).toHaveBeenCalledTimes(1);
      expect(supabase.from('light_work_tasks').insert).toHaveBeenCalledWith({
        title: 'User 1 Task'
      });
    });
  });

  describe('Conflict Resolution', () => {
    it('should prefer more recent local data', async () => {
      const localData = {
        title: 'Local Title',
        updated_at: '2025-01-20T12:00:00Z'
      };
      
      const remoteData = {
        title: 'Remote Title',
        updated_at: '2025-01-20T11:00:00Z'
      };

      const result = await syncManager.handleConflicts(localData, remoteData);
      expect(result.title).toBe('Local Title');
    });

    it('should prefer more recent remote data', async () => {
      const localData = {
        title: 'Local Title',
        updated_at: '2025-01-20T11:00:00Z'
      };
      
      const remoteData = {
        title: 'Remote Title',
        updated_at: '2025-01-20T12:00:00Z'
      };

      const result = await syncManager.handleConflicts(localData, remoteData);
      expect(result.title).toBe('Remote Title');
    });

    it('should handle updatedAt format as well', async () => {
      const localData = {
        title: 'Local Title',
        updatedAt: '2025-01-20T12:00:00Z'
      };
      
      const remoteData = {
        title: 'Remote Title',
        updatedAt: '2025-01-20T11:00:00Z'
      };

      const result = await syncManager.handleConflicts(localData, remoteData);
      expect(result.title).toBe('Local Title');
    });
  });

  describe('Online Status Detection', () => {
    it('should detect online status', () => {
      expect(syncManager.detectOnlineStatus()).toBe(true);
    });

    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      expect(syncManager.detectOnlineStatus()).toBe(false);
    });
  });

  describe('Force Sync', () => {
    it('should return false when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const result = await syncManager.forceSyncNow(testUserId);
      expect(result).toBe(false);
    });

    it('should return true when sync succeeds', async () => {
      const result = await syncManager.forceSyncNow(testUserId);
      expect(result).toBe(true);
    });
  });

  describe('Sync Status', () => {
    it('should provide sync status information', () => {
      const status = syncManager.getSyncStatus();
      
      expect(status).toHaveProperty('inProgress');
      expect(status).toHaveProperty('retryCount');
      expect(status).toHaveProperty('maxRetries');
      expect(status).toHaveProperty('canRetry');
      
      expect(typeof status.inProgress).toBe('boolean');
      expect(typeof status.retryCount).toBe('number');
      expect(typeof status.maxRetries).toBe('number');
      expect(typeof status.canRetry).toBe('boolean');
    });
  });

  describe('Background Sync', () => {
    it('should schedule background sync when supported', async () => {
      // Mock service worker and background sync support
      const mockRegistration = {
        sync: {
          register: vi.fn().mockResolvedValue(undefined)
        }
      };

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(mockRegistration)
        }
      });

      Object.defineProperty(window, 'ServiceWorkerRegistration', {
        value: {
          prototype: {
            sync: {}
          }
        }
      });

      await syncManager.scheduleBackgroundSync();
      
      expect(mockRegistration.sync.register).toHaveBeenCalledWith('background-sync');
    });
  });
});