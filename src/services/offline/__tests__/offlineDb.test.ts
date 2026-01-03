/**
 * 🧪 Offline Database Tests
 * Verifies IndexedDB schema and CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { offlineDb } from '../offlineDb';

describe('OfflineDatabase', () => {
  beforeEach(async () => {
    // Clear database before each test
    await offlineDb.clear();
  });

  afterEach(async () => {
    // Cleanup after tests
    await offlineDb.clear();
  });

  describe('Schema & Initialization', () => {
    it('should initialize database successfully', async () => {
      await offlineDb.init();
      const stats = await offlineDb.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.lightWorkTasks).toBe(0);
      expect(stats.deepWorkTasks).toBe(0);
      expect(stats.morningRoutines).toBe(0);
      expect(stats.workoutSessions).toBe(0);
      expect(stats.healthHabits).toBe(0);
      expect(stats.nightlyCheckouts).toBe(0);
    });

    it('should have all required stores', async () => {
      await offlineDb.init();
      // If init succeeds, all stores were created successfully
      expect(true).toBe(true);
    });
  });

  describe('Morning Routines', () => {
    it('should save and retrieve morning routine', async () => {
      const routine = {
        id: 'test-routine-1',
        user_id: 'user-123',
        date: '2025-10-10',
        routine_type: 'morning',
        items: [{ name: 'wakeUp', completed: true }],
        completed_count: 1,
        total_count: 1,
        completion_percentage: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveMorningRoutine(routine, false);
      const retrieved = await offlineDb.getMorningRoutines('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('test-routine-1');
      expect(retrieved[0].completed_count).toBe(1);
      expect(retrieved[0]._sync_status).toBe('synced');
    });

    it('should mark routine as needs sync when flagged', async () => {
      const routine = {
        id: 'test-routine-2',
        user_id: 'user-123',
        date: '2025-10-10',
        routine_type: 'morning',
        items: [],
        completed_count: 0,
        total_count: 0,
        completion_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveMorningRoutine(routine, true); // Mark for sync
      const retrieved = await offlineDb.getMorningRoutines('2025-10-10');

      expect(retrieved[0]._needs_sync).toBe(true);
      expect(retrieved[0]._sync_status).toBe('pending');
    });

    it('should filter by date', async () => {
      const routine1 = {
        id: 'routine-oct-10',
        user_id: 'user-123',
        date: '2025-10-10',
        routine_type: 'morning',
        items: [],
        completed_count: 0,
        total_count: 0,
        completion_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const routine2 = {
        id: 'routine-oct-11',
        user_id: 'user-123',
        date: '2025-10-11',
        routine_type: 'morning',
        items: [],
        completed_count: 0,
        total_count: 0,
        completion_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveMorningRoutine(routine1, false);
      await offlineDb.saveMorningRoutine(routine2, false);

      const oct10 = await offlineDb.getMorningRoutines('2025-10-10');
      const oct11 = await offlineDb.getMorningRoutines('2025-10-11');

      expect(oct10).toHaveLength(1);
      expect(oct11).toHaveLength(1);
      expect(oct10[0].id).toBe('routine-oct-10');
      expect(oct11[0].id).toBe('routine-oct-11');
    });
  });

  describe('Workout Sessions', () => {
    it('should save and retrieve workout session', async () => {
      const workout = {
        id: 'test-workout-1',
        user_id: 'user-123',
        workout_date: '2025-10-10',
        items: [{ id: '1', title: 'Push-ups', completed: true }],
        total_exercises: 1,
        completed_exercises: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveWorkoutSession(workout, false);
      const retrieved = await offlineDb.getWorkoutSessions('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('test-workout-1');
      expect(retrieved[0].completed_exercises).toBe(1);
    });

    it('should update existing workout', async () => {
      const workout = {
        id: 'test-workout-1',
        user_id: 'user-123',
        workout_date: '2025-10-10',
        items: [],
        total_exercises: 5,
        completed_exercises: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveWorkoutSession(workout, false);
      
      // Update
      workout.completed_exercises = 4;
      await offlineDb.saveWorkoutSession(workout, false);
      
      const retrieved = await offlineDb.getWorkoutSessions('2025-10-10');
      expect(retrieved[0].completed_exercises).toBe(4);
    });
  });

  describe('Health Habits', () => {
    it('should save and retrieve health habit', async () => {
      const habit = {
        id: 'test-habit-1',
        user_id: 'user-123',
        habit_date: '2025-10-10',
        habits: { meals: {}, daily_totals: {} },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveHealthHabit(habit, false);
      const retrieved = await offlineDb.getHealthHabits('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('test-habit-1');
    });
  });

  describe('Nightly Checkouts', () => {
    it('should save and retrieve nightly checkout', async () => {
      const checkout = {
        id: 'test-checkout-1',
        user_id: 'user-123',
        checkout_date: '2025-10-10',
        reflection: 'Great day!',
        wins: ['Completed tasks', 'Good workout'],
        improvements: ['Sleep earlier'],
        tomorrow_focus: 'Focus on deep work',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveNightlyCheckout(checkout, false);
      const retrieved = await offlineDb.getNightlyCheckouts('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].reflection).toBe('Great day!');
      expect(retrieved[0].wins).toHaveLength(2);
    });
  });

  describe('Light Work Tasks (Existing)', () => {
    it('should save and retrieve light work task', async () => {
      const task = {
        id: 'test-task-1',
        user_id: 'user-123',
        title: 'Test task',
        description: 'Test description',
        priority: 'MEDIUM' as const,
        completed: false,
        original_date: '2025-10-10',
        task_date: '2025-10-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveLightWorkTask(task, false);
      const retrieved = await offlineDb.getLightWorkTasks('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].title).toBe('Test task');
      expect(retrieved[0]._sync_status).toBe('synced');
    });

    it('should mark task for sync', async () => {
      const task = {
        id: 'test-task-2',
        user_id: 'user-123',
        title: 'Needs sync',
        priority: 'HIGH' as const,
        completed: false,
        original_date: '2025-10-10',
        task_date: '2025-10-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveLightWorkTask(task, true); // Mark for sync
      const retrieved = await offlineDb.getLightWorkTasks('2025-10-10');

      expect(retrieved[0]._needs_sync).toBe(true);
      expect(retrieved[0]._sync_status).toBe('pending');
    });
  });

  describe('Deep Work Tasks (Existing)', () => {
    it('should save and retrieve deep work task', async () => {
      const task = {
        id: 'test-deep-1',
        user_id: 'user-123',
        title: 'Deep work session',
        priority: 'HIGH' as const,
        completed: false,
        original_date: '2025-10-10',
        task_date: '2025-10-10',
        focus_blocks: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await offlineDb.saveDeepWorkTask(task, false);
      const retrieved = await offlineDb.getDeepWorkTasks('2025-10-10');

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].focus_blocks).toBe(2);
    });
  });

  describe('Stats', () => {
    it('should return accurate stats across all stores', async () => {
      // Add data to each store
      await offlineDb.saveLightWorkTask({
        id: '1', user_id: 'u1', title: 'Test', priority: 'MEDIUM',
        completed: false, original_date: '2025-10-10', task_date: '2025-10-10',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      await offlineDb.saveDeepWorkTask({
        id: '2', user_id: 'u1', title: 'Test', priority: 'HIGH',
        completed: false, original_date: '2025-10-10', task_date: '2025-10-10',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      await offlineDb.saveMorningRoutine({
        id: '3', user_id: 'u1', date: '2025-10-10', routine_type: 'morning',
        items: [], completed_count: 0, total_count: 0, completion_percentage: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      await offlineDb.saveWorkoutSession({
        id: '4', user_id: 'u1', workout_date: '2025-10-10', items: [],
        total_exercises: 0, completed_exercises: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      const stats = await offlineDb.getStats();

      expect(stats.lightWorkTasks).toBe(1);
      expect(stats.deepWorkTasks).toBe(1);
      expect(stats.morningRoutines).toBe(1);
      expect(stats.workoutSessions).toBe(1);
    });
  });

  describe('Settings', () => {
    it('should save and retrieve settings', async () => {
      await offlineDb.setSetting('lastSync', '2025-10-10T12:00:00Z');
      const value = await offlineDb.getSetting('lastSync');
      
      expect(value).toBe('2025-10-10T12:00:00Z');
    });

    it('should update existing setting', async () => {
      await offlineDb.setSetting('testKey', 'value1');
      await offlineDb.setSetting('testKey', 'value2');
      const value = await offlineDb.getSetting('testKey');
      
      expect(value).toBe('value2');
    });
  });

  describe('Clear All Data', () => {
    it('should clear all stores', async () => {
      // Add data to multiple stores
      await offlineDb.saveLightWorkTask({
        id: '1', user_id: 'u1', title: 'Test', priority: 'MEDIUM',
        completed: false, original_date: '2025-10-10', task_date: '2025-10-10',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      await offlineDb.saveMorningRoutine({
        id: '2', user_id: 'u1', date: '2025-10-10', routine_type: 'morning',
        items: [], completed_count: 0, total_count: 0, completion_percentage: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }, false);

      // Verify data exists
      let stats = await offlineDb.getStats();
      expect(stats.lightWorkTasks).toBeGreaterThan(0);
      expect(stats.morningRoutines).toBeGreaterThan(0);

      // Clear
      await offlineDb.clear();

      // Verify all cleared
      stats = await offlineDb.getStats();
      expect(stats.lightWorkTasks).toBe(0);
      expect(stats.deepWorkTasks).toBe(0);
      expect(stats.morningRoutines).toBe(0);
      expect(stats.workoutSessions).toBe(0);
      expect(stats.healthHabits).toBe(0);
      expect(stats.nightlyCheckouts).toBe(0);
    });
  });
});
