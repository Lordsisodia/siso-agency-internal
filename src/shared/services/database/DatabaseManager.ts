/**
 * Database Manager - Hybrid Prisma/Supabase Client
 * Provides unified interface with feature flags for safe migration
 */

import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from './PrismaAdapter';
import { SupabaseAdapter } from './SupabaseAdapter';
import type { 
  DatabaseAdapter, 
  DatabaseMode, 
  DatabaseConfig,
  LightWorkTask,
  DeepWorkTask,
  MorningRoutineTask,
  DailyReflection,
  TaskFilters
} from './types';

export class DatabaseManager {
  private prismaAdapter: PrismaAdapter | null = null;
  private supabaseAdapter: SupabaseAdapter | null = null;
  private config: DatabaseConfig;
  private prismaClient: PrismaClient | null = null;

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      mode: (process.env.DATABASE_MODE as DatabaseMode) || 'prisma',
      fallbackMode: (process.env.DATABASE_FALLBACK_MODE as 'prisma' | 'supabase') || 'prisma',
      enableLogging: process.env.NODE_ENV === 'development',
      ...config
    };

    this.log('Database Manager initialized with config:', this.config);
    this.initializeAdapters();
  }

  private async initializeAdapters() {
    try {
      // Initialize Prisma adapter
      if (this.config.mode === 'prisma' || this.config.mode === 'hybrid' || this.config.fallbackMode === 'prisma') {
        this.prismaClient = new PrismaClient({
          log: this.config.enableLogging ? ['query', 'error', 'warn'] : ['error']
        });
        this.prismaAdapter = new PrismaAdapter(this.prismaClient);
        this.log('Prisma adapter initialized');
      }

      // Initialize Supabase adapter
      if (this.config.mode === 'supabase' || this.config.mode === 'hybrid' || this.config.fallbackMode === 'supabase') {
        this.supabaseAdapter = new SupabaseAdapter();
        this.log('Supabase adapter initialized');
      }

      // Verify connections
      await this.verifyConnections();
      
    } catch (error) {
      console.error('Failed to initialize database adapters:', error);
      throw error;
    }
  }

  private async verifyConnections() {
    const results = {
      prisma: false,
      supabase: false
    };

    if (this.prismaAdapter) {
      results.prisma = await this.prismaAdapter.healthCheck();
      this.log('Prisma health check:', results.prisma ? 'PASS' : 'FAIL');
    }

    if (this.supabaseAdapter) {
      results.supabase = await this.supabaseAdapter.healthCheck();
      this.log('Supabase health check:', results.supabase ? 'PASS' : 'FAIL');
    }

    return results;
  }

  private getActiveAdapter(): DatabaseAdapter {
    const adapter = this.selectAdapter();
    if (!adapter) {
      throw new Error(`No ${this.config.mode} adapter available`);
    }
    return adapter;
  }

  private selectAdapter(): DatabaseAdapter | null {
    switch (this.config.mode) {
      case 'prisma':
        return this.prismaAdapter;
      
      case 'supabase':
        return this.supabaseAdapter;
      
      case 'hybrid':
        // Hybrid mode: try primary, fallback to secondary
        const primary = this.supabaseAdapter; // Default to Supabase in hybrid
        const fallback = this.prismaAdapter;
        
        if (primary) {
          this.log('Using Supabase adapter (hybrid mode)');
          return primary;
        } else if (fallback) {
          this.log('Falling back to Prisma adapter (hybrid mode)');
          return fallback;
        }
        return null;
      
      default:
        throw new Error(`Unknown database mode: ${this.config.mode}`);
    }
  }

  private async executeWithFallback<T>(
    operation: (adapter: DatabaseAdapter) => Promise<T>,
    operationName: string
  ): Promise<T> {
    const primaryAdapter = this.getActiveAdapter();
    
    try {
      this.log(`Executing ${operationName} with ${this.config.mode} mode`);
      return await operation(primaryAdapter);
    } catch (error) {
      console.error(`${operationName} failed with primary adapter:`, error);
      
      // Try fallback if configured and available
      if (this.config.fallbackMode && this.config.mode !== this.config.fallbackMode) {
        const fallbackAdapter = this.config.fallbackMode === 'prisma' 
          ? this.prismaAdapter 
          : this.supabaseAdapter;
        
        if (fallbackAdapter) {
          console.warn(`Attempting ${operationName} with fallback adapter: ${this.config.fallbackMode}`);
          try {
            return await operation(fallbackAdapter);
          } catch (fallbackError) {
            console.error(`${operationName} also failed with fallback adapter:`, fallbackError);
          }
        }
      }
      
      throw error;
    }
  }

  // Public API - Light Work Tasks
  async getLightWorkTasks(filters: TaskFilters): Promise<LightWorkTask[]> {
    return this.executeWithFallback(
      adapter => adapter.getLightWorkTasks(filters),
      'getLightWorkTasks'
    );
  }

  async createLightWorkTask(data: any): Promise<LightWorkTask> {
    return this.executeWithFallback(
      adapter => adapter.createLightWorkTask(data),
      'createLightWorkTask'
    );
  }

  async updateLightWorkTask(id: string, data: any): Promise<LightWorkTask> {
    return this.executeWithFallback(
      adapter => adapter.updateLightWorkTask(id, data),
      'updateLightWorkTask'
    );
  }

  async deleteLightWorkTask(id: string): Promise<void> {
    return this.executeWithFallback(
      adapter => adapter.deleteLightWorkTask(id),
      'deleteLightWorkTask'
    );
  }

  // Public API - Light Work Subtasks
  async createLightWorkSubtask(data: any): Promise<any> {
    return this.executeWithFallback(
      adapter => adapter.createLightWorkSubtask(data),
      'createLightWorkSubtask'
    );
  }

  async updateLightWorkSubtask(id: string, data: any): Promise<any> {
    return this.executeWithFallback(
      adapter => adapter.updateLightWorkSubtask(id, data),
      'updateLightWorkSubtask'
    );
  }

  async deleteLightWorkSubtask(id: string): Promise<void> {
    return this.executeWithFallback(
      adapter => adapter.deleteLightWorkSubtask(id),
      'deleteLightWorkSubtask'
    );
  }

  // Public API - Deep Work Tasks
  async getDeepWorkTasks(filters: TaskFilters): Promise<DeepWorkTask[]> {
    return this.executeWithFallback(
      adapter => adapter.getDeepWorkTasks(filters),
      'getDeepWorkTasks'
    );
  }

  async createDeepWorkTask(data: any): Promise<DeepWorkTask> {
    return this.executeWithFallback(
      adapter => adapter.createDeepWorkTask(data),
      'createDeepWorkTask'
    );
  }

  async updateDeepWorkTask(id: string, data: any): Promise<DeepWorkTask> {
    return this.executeWithFallback(
      adapter => adapter.updateDeepWorkTask(id, data),
      'updateDeepWorkTask'
    );
  }

  async deleteDeepWorkTask(id: string): Promise<void> {
    return this.executeWithFallback(
      adapter => adapter.deleteDeepWorkTask(id),
      'deleteDeepWorkTask'
    );
  }

  // Public API - Deep Work Subtasks
  async createDeepWorkSubtask(data: any): Promise<any> {
    return this.executeWithFallback(
      adapter => adapter.createDeepWorkSubtask(data),
      'createDeepWorkSubtask'
    );
  }

  async updateDeepWorkSubtask(id: string, data: any): Promise<any> {
    return this.executeWithFallback(
      adapter => adapter.updateDeepWorkSubtask(id, data),
      'updateDeepWorkSubtask'
    );
  }

  async deleteDeepWorkSubtask(id: string): Promise<void> {
    return this.executeWithFallback(
      adapter => adapter.deleteDeepWorkSubtask(id),
      'deleteDeepWorkSubtask'
    );
  }

  // Public API - Morning Routine Tasks
  async getMorningRoutineTasks(userId: string, date: string): Promise<MorningRoutineTask[]> {
    return this.executeWithFallback(
      adapter => adapter.getMorningRoutineTasks(userId, date),
      'getMorningRoutineTasks'
    );
  }

  async createMorningRoutineTask(data: any): Promise<MorningRoutineTask> {
    return this.executeWithFallback(
      adapter => adapter.createMorningRoutineTask(data),
      'createMorningRoutineTask'
    );
  }

  async updateMorningRoutineTask(id: string, data: any): Promise<MorningRoutineTask> {
    return this.executeWithFallback(
      adapter => adapter.updateMorningRoutineTask(id, data),
      'updateMorningRoutineTask'
    );
  }

  // Public API - Daily Reflections
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | null> {
    return this.executeWithFallback(
      adapter => adapter.getDailyReflection(userId, date),
      'getDailyReflection'
    );
  }

  async createDailyReflection(data: any): Promise<DailyReflection> {
    return this.executeWithFallback(
      adapter => adapter.createDailyReflection(data),
      'createDailyReflection'
    );
  }

  async updateDailyReflection(id: string, data: any): Promise<DailyReflection> {
    return this.executeWithFallback(
      adapter => adapter.updateDailyReflection(id, data),
      'updateDailyReflection'
    );
  }

  // Utility methods
  async healthCheck(): Promise<{ prisma: boolean; supabase: boolean; active: string }> {
    const connections = await this.verifyConnections();
    return {
      ...connections,
      active: this.config.mode
    };
  }

  getCurrentMode(): DatabaseMode {
    return this.config.mode;
  }

  async switchMode(newMode: DatabaseMode): Promise<void> {
    this.log(`Switching database mode from ${this.config.mode} to ${newMode}`);
    this.config.mode = newMode;
    
    // Re-verify connections with new mode
    await this.verifyConnections();
  }

  async cleanup(): Promise<void> {
    this.log('Cleaning up database connections');
    
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
      this.prismaClient = null;
      this.prismaAdapter = null;
    }
    
    // Supabase doesn't need explicit cleanup
    this.supabaseAdapter = null;
  }

  private log(message: string, data?: any) {
    if (this.config.enableLogging) {
      console.log(`[DatabaseManager] ${message}`, data || '');
    }
  }
}

// Singleton instance
let databaseManager: DatabaseManager | null = null;

export const getDatabaseManager = (): DatabaseManager => {
  if (!databaseManager) {
    databaseManager = new DatabaseManager();
  }
  return databaseManager;
};

export const initializeDatabaseManager = (config?: Partial<DatabaseConfig>): DatabaseManager => {
  if (databaseManager) {
    console.warn('Database manager already initialized');
  }
  databaseManager = new DatabaseManager(config);
  return databaseManager;
};

// Cleanup function for graceful shutdown
export const cleanupDatabaseManager = async (): Promise<void> => {
  if (databaseManager) {
    await databaseManager.cleanup();
    databaseManager = null;
  }
};