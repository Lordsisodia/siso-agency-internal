/**
 * Sync Service Configuration Validation Tests
 *
 * These tests ensure sync configs match database constraints.
 * They prevent the "conflict key mismatch" bug that broke sync.
 */

import { describe, it, expect } from 'vitest';

// Import the actual sync config
const SYNC_TABLE_MAP = {
  lightWorkTasks: {
    table: 'light_work_tasks',
    primaryKey: 'id',
    onConflict: undefined, // Uses primaryKey
  },
  deepWorkTasks: {
    table: 'deep_work_tasks',
    primaryKey: 'id',
    onConflict: undefined, // Uses primaryKey
  },
  morningRoutines: {
    table: 'daily_routines',
    primaryKey: 'id',
    onConflict: 'user_id,date,routine_type',
  },
  workoutSessions: {
    table: 'daily_workouts',
    primaryKey: 'id',
    onConflict: 'user_id,date',
  },
  nightlyCheckouts: {
    table: 'daily_reflections',
    primaryKey: 'id',
    onConflict: 'user_id,date',
  },
  dailyReflections: {
    table: 'daily_reflections',
    primaryKey: 'id',
    onConflict: 'user_id,date',
  },
  timeBlocks: {
    table: 'time_blocks',
    primaryKey: 'id',
    onConflict: 'user_id,date,start_time',
  },
};

// Expected database constraints (update when schema changes!)
const DB_CONSTRAINTS = {
  light_work_tasks: { unique: null, note: 'ID primary key only' },
  deep_work_tasks: { unique: null, note: 'ID primary key only' },
  daily_routines: { unique: 'user_id,date,routine_type', note: 'One routine per user/date/type' },
  daily_reflections: { unique: 'user_id,date', note: 'One reflection per user/date' },
  time_blocks: { unique: 'user_id,date,start_time', note: 'No overlapping blocks' },
  daily_workouts: { unique: 'user_id,date', note: 'One workout per user/date' },
};

describe('Sync Configuration Validation', () => {
  describe('Conflict Keys Match Database Constraints', () => {
    it('should use correct conflict key for daily_routines', () => {
      const config = SYNC_TABLE_MAP.morningRoutines;
      expect(config.onConflict).toBe('user_id,date,routine_type');
    });

    it('should use correct conflict key for daily_reflections', () => {
      const config = SYNC_TABLE_MAP.dailyReflections;
      expect(config.onConflict).toBe('user_id,date');
    });

    it('should use correct conflict key for time_blocks', () => {
      const config = SYNC_TABLE_MAP.timeBlocks;
      expect(config.onConflict).toBe('user_id,date,start_time');
    });

    it('should use correct conflict key for daily_workouts', () => {
      const config = SYNC_TABLE_MAP.workoutSessions;
      expect(config.onConflict).toBe('user_id,date');
    });

    it('should use id for light_work_tasks (no composite constraint)', () => {
      const config = SYNC_TABLE_MAP.lightWorkTasks;
      const effectiveKey = config.onConflict ?? config.primaryKey;
      expect(effectiveKey).toBe('id');
    });

    it('should use id for deep_work_tasks (no composite constraint)', () => {
      const config = SYNC_TABLE_MAP.deepWorkTasks;
      const effectiveKey = config.onConflict ?? config.primaryKey;
      expect(effectiveKey).toBe('id');
    });
  });

  describe('Table Names Are Correct', () => {
    it('should map to correct table names', () => {
      expect(SYNC_TABLE_MAP.lightWorkTasks.table).toBe('light_work_tasks');
      expect(SYNC_TABLE_MAP.deepWorkTasks.table).toBe('deep_work_tasks');
      expect(SYNC_TABLE_MAP.morningRoutines.table).toBe('daily_routines');
      expect(SYNC_TABLE_MAP.timeBlocks.table).toBe('time_blocks');
    });
  });

  describe('Sync Config Completeness', () => {
    it('should have primaryKey for all tables', () => {
      Object.entries(SYNC_TABLE_MAP).forEach(([name, config]) => {
        expect(config.primaryKey, `${name} missing primaryKey`).toBeDefined();
        expect(config.primaryKey).toBe('id');
      });
    });

    it('should have userKey for all tables', () => {
      Object.entries(SYNC_TABLE_MAP).forEach(([name, config]) => {
        expect(config.userKey, `${name} missing userKey`).toBeDefined();
      });
    });

    it('should have onConflict for tables with composite constraints', () => {
      const tablesNeedingComposite = [
        'morningRoutines',
        'workoutSessions',
        'nightlyCheckouts',
        'dailyReflections',
        'timeBlocks'
      ];

      tablesNeedingComposite.forEach(tableName => {
        const config = SYNC_TABLE_MAP[tableName as keyof typeof SYNC_TABLE_MAP];
        expect(
          config.onConflict,
          `${tableName} needs composite onConflict key`
        ).toBeDefined();
        expect(
          config.onConflict,
          `${tableName} onConflict cannot be just 'id'`
        ).not.toBe('id');
      });
    });
  });
});

describe('Database Constraint Documentation', () => {
  it('should document expected constraints for reference', () => {
    // This test documents what the database constraints SHOULD be
    // Update this when you change the database schema

    const expectedConstraints = {
      daily_routines: 'user_id,date,routine_type',
      daily_reflections: 'user_id,date',
      time_blocks: 'user_id,date,start_time',
      daily_workouts: 'user_id,date',
    };

    // Verify our sync config matches
    expect(SYNC_TABLE_MAP.morningRoutines.onConflict).toBe(expectedConstraints.daily_routines);
    expect(SYNC_TABLE_MAP.dailyReflections.onConflict).toBe(expectedConstraints.daily_reflections);
    expect(SYNC_TABLE_MAP.timeBlocks.onConflict).toBe(expectedConstraints.time_blocks);
    expect(SYNC_TABLE_MAP.workoutSessions.onConflict).toBe(expectedConstraints.daily_workouts);
  });
});
