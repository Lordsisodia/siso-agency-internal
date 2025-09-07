/**
 * Database Service - Unified Export
 * Provides hybrid Prisma/Supabase database access
 */

export * from './types';
export * from './DatabaseManager';
export * from './PrismaAdapter';
export * from './SupabaseAdapter';

// Main exports for easy import
export { 
  getDatabaseManager, 
  initializeDatabaseManager,
  cleanupDatabaseManager,
  DatabaseManager 
} from './DatabaseManager';

export type {
  DatabaseAdapter,
  DatabaseMode,
  DatabaseConfig,
  LightWorkTask,
  LightWorkSubtask,
  DeepWorkTask,
  DeepWorkSubtask,
  MorningRoutineTask,
  DailyReflection,
  TaskFilters,
  CreateTaskData,
  UpdateTaskData,
  Priority
} from './types';