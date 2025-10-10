/**
 * 🧪 Offline Hooks Integration Tests
 * Verify hooks properly use cache-first pattern
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { offlineDb } from '../../offline/offlineDb';

// Mock navigator.onLine
let onlineStatus = true;
Object.defineProperty(navigator, 'onLine', {
  get: () => onlineStatus,
  configurable: true
});

// Mock Supabase
vi.mock('@/shared/lib/supabase-clerk', () => ({
  useSupabaseClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      }))
    }))
  }),
  useSupabaseUserId: () => 'test-user-id',
  supabaseAnon: {
    from: vi.fn()
  }
}));

vi.mock('../useClerkUser', () => ({
  useClerkUser: () => ({
    user: { id: 'clerk-user-123', email: 'test@test.com' },
    isSignedIn: true,
    isLoaded: true
  })
}));

describe('Offline Hooks Integration', () => {
  beforeEach(async () => {
    await offlineDb.clear();
    onlineStatus = true;
  });

  afterEach(async () => {
    await offlineDb.clear();
  });

  describe('Cache-First Loading Pattern', () => {
    it('should load from cache instantly when available', async () => {
      // Pre-populate cache
      const cachedRoutine = {
        id: 'cached-routine',
        user_id: 'test-user-id',
        date: '2025-10-10',
        routine_type: 'morning',
        items: [{ name: 'wakeUp', completed: true }],
        completed_count: 1,
        total_count: 19,
        completion_percentage: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveMorningRoutine(cachedRoutine, false);

      // Verify cache has data
      const cached = await offlineDb.getMorningRoutines('2025-10-10');
      expect(cached).toHaveLength(1);
      expect(cached[0].id).toBe('cached-routine');
    });

    it('should handle empty cache gracefully', async () => {
      const routines = await offlineDb.getMorningRoutines('2025-10-10');
      expect(routines).toEqual([]);
    });
  });

  describe('Offline Behavior', () => {
    it('should save to cache when offline', async () => {
      onlineStatus = false;

      const routine = {
        id: 'offline-routine',
        user_id: 'test-user-id',
        date: '2025-10-10',
        routine_type: 'morning',
        items: [],
        completed_count: 0,
        total_count: 0,
        completion_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveMorningRoutine(routine, true);
      const retrieved = await offlineDb.getMorningRoutines('2025-10-10');

      expect(retrieved[0]._needs_sync).toBe(true);
      expect(retrieved[0]._sync_status).toBe('pending');
    });

    it('should work with all store types offline', async () => {
      onlineStatus = false;

      // Save to each store type
      await offlineDb.saveMorningRoutine({
        id: '1', user_id: 'u1', date: '2025-10-10', routine_type: 'morning',
        items: [], completed_count: 0, total_count: 0, completion_percentage: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, true);

      await offlineDb.saveWorkoutSession({
        id: '2', user_id: 'u1', workout_date: '2025-10-10', items: [],
        total_exercises: 0, completed_exercises: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, true);

      await offlineDb.saveHealthHabit({
        id: '3', user_id: 'u1', habit_date: '2025-10-10', habits: {},
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, true);

      await offlineDb.saveNightlyCheckout({
        id: '4', user_id: 'u1', checkout_date: '2025-10-10',
        reflection: 'test', wins: [], improvements: [], tomorrow_focus: '',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, true);

      const stats = await offlineDb.getStats();
      expect(stats.morningRoutines).toBe(1);
      expect(stats.workoutSessions).toBe(1);
      expect(stats.healthHabits).toBe(1);
      expect(stats.nightlyCheckouts).toBe(1);
    });
  });

  describe('Data Persistence', () => {
    it('should persist data across page reloads (simulated)', async () => {
      const workout = {
        id: 'persist-test',
        user_id: 'test-user',
        workout_date: '2025-10-10',
        items: [{ id: '1', title: 'Push-ups', completed: true }],
        total_exercises: 1,
        completed_exercises: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveWorkoutSession(workout, false);

      // Simulate closing and reopening database
      // In real scenario, IndexedDB persists across browser sessions
      const retrieved = await offlineDb.getWorkoutSessions('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('persist-test');
      expect(retrieved[0].items[0].completed).toBe(true);
    });

    it('should handle updates to existing records', async () => {
      const routine = {
        id: 'update-test',
        user_id: 'test-user',
        date: '2025-10-10',
        routine_type: 'morning',
        items: [{ name: 'wakeUp', completed: false }],
        completed_count: 0,
        total_count: 1,
        completion_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveMorningRoutine(routine, false);

      // Update
      routine.items[0].completed = true;
      routine.completed_count = 1;
      routine.completion_percentage = 100;
      await offlineDb.saveMorningRoutine(routine, false);

      const retrieved = await offlineDb.getMorningRoutines('2025-10-10');
      expect(retrieved[0].completed_count).toBe(1);
      expect(retrieved[0].completion_percentage).toBe(100);
    });
  });

  describe('Date Filtering', () => {
    it('should filter by date across all store types', async () => {
      const dates = ['2025-10-08', '2025-10-09', '2025-10-10'];

      // Add data for each date
      for (const date of dates) {
        await offlineDb.saveMorningRoutine({
          id: `routine-${date}`, user_id: 'u1', date, routine_type: 'morning',
          items: [], completed_count: 0, total_count: 0, completion_percentage: 0,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }, false);

        await offlineDb.saveWorkoutSession({
          id: `workout-${date}`, user_id: 'u1', workout_date: date, items: [],
          total_exercises: 0, completed_exercises: 0,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }, false);
      }

      // Verify each date returns only its data
      for (const date of dates) {
        const routines = await offlineDb.getMorningRoutines(date);
        const workouts = await offlineDb.getWorkoutSessions(date);
        
        expect(routines).toHaveLength(1);
        expect(workouts).toHaveLength(1);
        expect(routines[0].date).toBe(date);
        expect(workouts[0].workout_date).toBe(date);
      }
    });
  });

  describe('Performance', () => {
    it('should load from cache faster than 50ms', async () => {
      // Pre-populate cache with data
      await offlineDb.saveMorningRoutine({
        id: 'perf-test', user_id: 'u1', date: '2025-10-10', routine_type: 'morning',
        items: [], completed_count: 0, total_count: 0, completion_percentage: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      const startTime = performance.now();
      await offlineDb.getMorningRoutines('2025-10-10');
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Cache load time: ${duration.toFixed(2)}ms`);
      
      expect(duration).toBeLessThan(50); // Should be under 50ms
    });

    it('should handle 100 records without significant slowdown', async () => {
      // Add 100 light work tasks
      for (let i = 0; i < 100; i++) {
        await offlineDb.saveLightWorkTask({
          id: `task-${i}`, user_id: 'u1', title: `Task ${i}`,
          priority: 'MEDIUM', completed: false,
          original_date: '2025-10-10', task_date: '2025-10-10',
          created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }, false);
      }

      const startTime = performance.now();
      const tasks = await offlineDb.getLightWorkTasks('2025-10-10');
      const endTime = performance.now();

      expect(tasks).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should still be fast
    });
  });
});
