/**
 * Data Migration Utility
 * Migrates localStorage task data to Prisma Postgres
 * One-time migration for hybrid architecture setup
 */

import { PersonalTaskService } from '@/shared/services/task.service';
import { RealPrismaTaskService } from '@/shared/services/task.service';
import { supabase } from '@/integrations/supabase/client';

export interface MigrationResult {
  success: boolean;
  message: string;
  tasksMigrated: number;
  errors: string[];
}

export class DataMigration {
  /**
   * Migrate all localStorage tasks to Prisma
   * Requires user to be authenticated with Supabase
   */
  public static async migrateLocalStorageToPrisma(): Promise<MigrationResult> {
    const startTime = Date.now();
    console.log('🚀 [MIGRATION] Starting localStorage to Prisma migration...');
    
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return {
          success: false,
          message: 'User must be authenticated to migrate data',
          tasksMigrated: 0,
          errors: ['Authentication required'],
        };
      }

      console.log(`👤 [MIGRATION] Migrating data for user: ${user.email}`);

      // Get all localStorage tasks
      const localStorageKey = 'lifelock-personal-tasks';
      const storedTasks = localStorage.getItem(localStorageKey);
      
      if (!storedTasks) {
        return {
          success: true,
          message: 'No localStorage tasks found to migrate',
          tasksMigrated: 0,
          errors: [],
        };
      }

      const tasks = JSON.parse(storedTasks);
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return {
          success: true,
          message: 'No valid tasks found in localStorage',
          tasksMigrated: 0,
          errors: [],
        };
      }

      console.log(`📊 [MIGRATION] Found ${tasks.length} tasks to migrate`);

      // Group tasks by date for efficient migration
      const tasksByDate = new Map<string, any[]>();
      
      tasks.forEach(task => {
        const date = task.currentDate || task.originalDate;
        if (!tasksByDate.has(date)) {
          tasksByDate.set(date, []);
        }
        tasksByDate.get(date)!.push(task);
      });

      let totalMigrated = 0;
      const errors: string[] = [];

      // Migrate tasks date by date
      for (const [dateStr, dateTasks] of tasksByDate) {
        try {
          console.log(`📅 [MIGRATION] Migrating ${dateTasks.length} tasks for ${dateStr}`);
          
          const targetDate = new Date(dateStr);
          await RealPrismaTaskService.addTasks(
            user.id,
            user.email || '',
            dateTasks,
            targetDate
          );
          
          totalMigrated += dateTasks.length;
          console.log(`✅ [MIGRATION] Migrated ${dateTasks.length} tasks for ${dateStr}`);
        } catch (error) {
          const errorMsg = `Failed to migrate tasks for ${dateStr}: ${error}`;
          console.error(`❌ [MIGRATION] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`🎉 [MIGRATION] Completed in ${duration}ms. Migrated ${totalMigrated} tasks`);

      // Backup localStorage data before clearing (optional)
      if (totalMigrated > 0 && errors.length === 0) {
        localStorage.setItem(`${localStorageKey}_backup_${Date.now()}`, storedTasks);
        console.log('💾 [MIGRATION] Created backup of localStorage data');
      }

      return {
        success: true,
        message: `Successfully migrated ${totalMigrated} tasks to Prisma`,
        tasksMigrated: totalMigrated,
        errors,
      };

    } catch (error) {
      console.error('❌ [MIGRATION] Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error}`,
        tasksMigrated: 0,
        errors: [String(error)],
      };
    }
  }

  /**
   * Check migration status and provide recommendations
   */
  public static async checkMigrationStatus(): Promise<{
    needsMigration: boolean;
    localStorageTasks: number;
    prismaConnectionWorking: boolean;
    recommendation: string;
  }> {
    try {
      // Check localStorage data
      const localStorageKey = 'lifelock-personal-tasks';
      const storedTasks = localStorage.getItem(localStorageKey);
      const localTaskCount = storedTasks ? JSON.parse(storedTasks).length : 0;

      // Check Prisma connection
      const healthCheck = await RealPrismaTaskService.healthCheck();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      let recommendation = '';
      let needsMigration = false;

      if (!user) {
        recommendation = 'Please log in to check migration status';
      } else if (!healthCheck.success) {
        recommendation = 'Prisma database connection failed. Please check configuration.';
      } else if (localTaskCount > 0) {
        needsMigration = true;
        recommendation = `Found ${localTaskCount} tasks in localStorage. Migration recommended for better performance and reliability.`;
      } else {
        recommendation = 'No migration needed. Ready to use Prisma database.';
      }

      return {
        needsMigration,
        localStorageTasks: localTaskCount,
        prismaConnectionWorking: healthCheck.success,
        recommendation,
      };

    } catch (error) {
      console.error('❌ [MIGRATION] Status check failed:', error);
      return {
        needsMigration: false,
        localStorageTasks: 0,
        prismaConnectionWorking: false,
        recommendation: 'Unable to check migration status. Please try again.',
      };
    }
  }

  /**
   * Clear localStorage after successful migration (with confirmation)
   */
  public static clearLocalStorageAfterMigration(confirmed: boolean = false): boolean {
    if (!confirmed) {
      console.warn('⚠️ [MIGRATION] clearLocalStorageAfterMigration requires explicit confirmation');
      return false;
    }

    try {
      const localStorageKey = 'lifelock-personal-tasks';
      const storedTasks = localStorage.getItem(localStorageKey);
      
      if (storedTasks) {
        // Final backup before clearing
        localStorage.setItem(`${localStorageKey}_final_backup_${Date.now()}`, storedTasks);
        localStorage.removeItem(localStorageKey);
        console.log('✅ [MIGRATION] localStorage cleared after successful migration');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [MIGRATION] Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Emergency restore from backup
   */
  public static listBackups(): string[] {
    const backups: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('lifelock-personal-tasks_backup')) {
        backups.push(key);
      }
    }
    
    return backups.sort().reverse(); // Most recent first
  }

  public static restoreFromBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        console.error('❌ [MIGRATION] Backup not found:', backupKey);
        return false;
      }

      const originalKey = 'lifelock-personal-tasks';
      localStorage.setItem(originalKey, backupData);
      console.log('✅ [MIGRATION] Restored from backup:', backupKey);
      return true;
    } catch (error) {
      console.error('❌ [MIGRATION] Restore failed:', error);
      return false;
    }
  }
}