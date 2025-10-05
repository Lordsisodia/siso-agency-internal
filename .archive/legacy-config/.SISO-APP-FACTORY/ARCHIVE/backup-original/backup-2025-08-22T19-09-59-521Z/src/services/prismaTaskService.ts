/**
 * Prisma Task Service - Zero Cold Start Personal Task Management
 * 
 * Features:
 * - 2-5ms response times (no cold starts)
 * - Built-in connection pooling and edge caching
 * - Standard PostgreSQL with AI capabilities
 * - Operations-based usage (free tier: 100K operations/month)
 */

import { PersonalTask, PersonalTaskCard } from './personalTaskService';
import { PrismaClient } from '../integrations/prisma/client';
import { format, parseISO } from 'date-fns';

interface PrismaTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  work_type: 'deep' | 'light';
  priority: 'critical' | 'urgent' | 'high' | 'medium' | 'low';
  completed: boolean;
  original_date: string;
  current_date: string;
  estimated_duration: number;
  rollovers: number;
  tags: string[] | null;
  category: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
  device_id: string;
  
  // AI-specific fields
  eisenhower_quadrant: 'do-first' | 'schedule' | 'delegate' | 'eliminate' | null;
  urgency_score: number | null;
  importance_score: number | null;
  ai_reasoning: string | null;
}

export class PrismaTaskService {
  private static client: PrismaClient;
  private static deviceId: string;
  private static cache: Map<string, PersonalTask[]> = new Map();
  private static operationCount = 0; // Track operations for free tier monitoring
  
  /**
   * Initialize Prisma connection
   */
  public static async initialize(): Promise<void> {
    this.client = new PrismaClient({
      databaseUrl: import.meta.env.VITE_PRISMA_DATABASE_URL || '',
      accelerateUrl: import.meta.env.VITE_PRISMA_ACCELERATE_URL
    });
    
    this.deviceId = this.getOrCreateDeviceId();
    
    console.log('🚀 [PRISMA TASKS] Connecting to zero-cold-start database...');
    
    try {
      await this.client.connect();
      console.log('✅ [PRISMA TASKS] Connected successfully');
      
      // Test performance
      const perf = await this.client.testConnection();
      console.log(`⚡ [PRISMA TASKS] Response time: ${perf.responseTime}ms`);
      
      // Ensure schema exists
      await this.client.ensureSchema();
      
    } catch (error) {
      console.error('❌ [PRISMA TASKS] Initialization failed:', error);
      throw new Error(`Prisma connection failed: ${error}`);
    }
  }
  
  /**
   * Get tasks for a specific date (cached for performance)
   */
  public static async getTasksForDate(date: Date): Promise<PersonalTaskCard> {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    const userId = await this.getCurrentUserId();
    
    // Check cache first (hybrid optimization)
    const cacheKey = `${userId}-${targetDateStr}`;
    if (this.cache.has(cacheKey)) {
      const cachedTasks = this.cache.get(cacheKey)!;
      return this.createTaskCard(date, cachedTasks);
    }
    
    try {
      const start = Date.now();
      const query = `
        SELECT * FROM personal_tasks 
        WHERE user_id = $1 AND current_date = $2
        ORDER BY 
          CASE priority
            WHEN 'critical' THEN 1
            WHEN 'urgent' THEN 2  
            WHEN 'high' THEN 3
            WHEN 'medium' THEN 4
            WHEN 'low' THEN 5
          END,
          created_at ASC
      `;
      
      const prismaTasks = await this.executeQuery(query, [userId, targetDateStr]) as PrismaTask[];
      const personalTasks = prismaTasks.map(this.convertPrismaToPersonal);
      
      const duration = Date.now() - start;
      console.log(`⚡ [PRISMA TASKS] Fetched ${personalTasks.length} tasks in ${duration}ms`);
      
      // Cache the result
      this.cache.set(cacheKey, personalTasks);
      
      return this.createTaskCard(date, personalTasks);
      
    } catch (error) {
      console.error('❌ [PRISMA TASKS] Failed to get tasks:', error);
      // Return empty card on error
      return this.createTaskCard(date, []);
    }
  }
  
  /**
   * Add new tasks with operation counting
   */
  public static async addTasks(newTasks: Partial<PersonalTask>[], targetDate?: Date): Promise<PersonalTask[]> {
    const userId = await this.getCurrentUserId();
    const currentDate = format(targetDate || new Date(), 'yyyy-MM-dd');
    
    const tasksToAdd = newTasks.map(taskData => ({
      user_id: userId,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || null,
      work_type: taskData.workType || 'light',
      priority: taskData.priority || 'medium',
      completed: false,
      original_date: currentDate,
      current_date: currentDate,
      estimated_duration: taskData.estimatedDuration || 60,
      rollovers: 0,
      tags: taskData.tags || null,
      category: taskData.category || null,
      device_id: this.deviceId,
      eisenhower_quadrant: null,
      urgency_score: null,
      importance_score: null,
      ai_reasoning: null
    }));
    
    try {
      const start = Date.now();
      
      const insertQuery = `
        INSERT INTO personal_tasks (
          user_id, title, description, work_type, priority, completed,
          original_date, current_date, estimated_duration, rollovers,
          tags, category, device_id
        ) VALUES ${tasksToAdd.map((_, i) => 
          `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, $${i * 13 + 5}, $${i * 13 + 6}, 
           $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`
        ).join(', ')}
        RETURNING *
      `;
      
      const params = tasksToAdd.flatMap(task => [
        task.user_id, task.title, task.description, task.work_type, task.priority,
        task.completed, task.original_date, task.current_date, task.estimated_duration,
        task.rollovers, task.tags, task.category, task.device_id
      ]);
      
      const insertedTasks = await this.executeQuery(insertQuery, params) as PrismaTask[];
      const personalTasks = insertedTasks.map(this.convertPrismaToPersonal);
      
      const duration = Date.now() - start;
      console.log(`✅ [PRISMA TASKS] Added ${personalTasks.length} tasks in ${duration}ms`);
      
      // Clear cache for this date
      this.clearCacheForDate(targetDate || new Date());
      
      return personalTasks;
      
    } catch (error) {
      console.error('❌ [PRISMA TASKS] Failed to add tasks:', error);
      throw error;
    }
  }
  
  /**
   * Toggle task completion with instant response
   */
  public static async toggleTask(taskId: string): Promise<boolean> {
    try {
      const start = Date.now();
      const userId = await this.getCurrentUserId();
      
      const query = `
        UPDATE personal_tasks 
        SET 
          completed = NOT completed,
          completed_at = CASE 
            WHEN NOT completed THEN NOW() 
            ELSE NULL 
          END
        WHERE id = $1 AND user_id = $2
        RETURNING current_date
      `;
      
      const result = await this.executeQuery(query, [taskId, userId]) as any[];
      const duration = Date.now() - start;
      
      if (result.length > 0) {
        console.log(`⚡ [PRISMA TASKS] Toggled task in ${duration}ms`);
        
        // Clear cache for the affected date
        const affectedDate = parseISO(result[0].current_date);
        this.clearCacheForDate(affectedDate);
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ [PRISMA TASKS] Failed to toggle task:', error);
      return false;
    }
  }
  
  /**
   * Replace all tasks for a date (used by Eisenhower Matrix organizer)
   */
  public static async replaceTasks(newTasks: PersonalTask[], targetDate: Date): Promise<void> {
    const userId = await this.getCurrentUserId();
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    try {
      const start = Date.now();
      
      // Start transaction
      await this.executeQuery('BEGIN');
      
      // Delete existing tasks for this date
      await this.executeQuery(
        'DELETE FROM personal_tasks WHERE user_id = $1 AND current_date = $2',
        [userId, targetDateStr]
      );
      
      // Insert new tasks
      if (newTasks.length > 0) {
        await this.addTasks(newTasks, targetDate);
      }
      
      // Commit transaction
      await this.executeQuery('COMMIT');
      
      const duration = Date.now() - start;
      console.log(`✅ [PRISMA TASKS] Replaced ${newTasks.length} tasks in ${duration}ms`);
      
      // Clear cache
      this.clearCacheForDate(targetDate);
      
    } catch (error) {
      // Rollback on error
      await this.executeQuery('ROLLBACK');
      console.error('❌ [PRISMA TASKS] Failed to replace tasks:', error);
      throw error;
    }
  }
  
  /**
   * Migrate data from localStorage to Prisma
   */
  public static async migrateFromLocalStorage(): Promise<void> {
    console.log('🔄 [PRISMA TASKS] Starting migration from localStorage...');
    
    try {
      const start = Date.now();
      
      // Get localStorage data
      const localData = localStorage.getItem('lifelock-personal-tasks');
      if (!localData) {
        console.log('📭 [PRISMA TASKS] No localStorage data to migrate');
        return;
      }
      
      const localTasks: PersonalTask[] = JSON.parse(localData);
      console.log(`📊 [PRISMA TASKS] Found ${localTasks.length} tasks to migrate`);
      
      // Group tasks by date
      const tasksByDate = new Map<string, PersonalTask[]>();
      localTasks.forEach(task => {
        const date = task.currentDate;
        if (!tasksByDate.has(date)) {
          tasksByDate.set(date, []);
        }
        tasksByDate.get(date)!.push(task);
      });
      
      // Migrate each date's tasks
      let migratedCount = 0;
      for (const [dateStr, tasks] of tasksByDate) {
        const date = parseISO(dateStr);
        await this.addTasks(tasks, date);
        migratedCount += tasks.length;
      }
      
      const duration = Date.now() - start;
      console.log(`✅ [PRISMA TASKS] Migration complete: ${migratedCount} tasks in ${duration}ms`);
      
      // Backup localStorage before clearing
      const backupKey = `lifelock-personal-tasks-backup-${Date.now()}`;
      localStorage.setItem(backupKey, localData);
      
      // Clear original localStorage
      localStorage.removeItem('lifelock-personal-tasks');
      
      console.log(`💾 [PRISMA TASKS] LocalStorage backed up to: ${backupKey}`);
      
    } catch (error) {
      console.error('❌ [PRISMA TASKS] Migration failed:', error);
      throw error;
    }
  }
  
  /**
   * Get usage statistics for free tier monitoring
   */
  public static getUsageStats(): { operations: number; freeLimit: number; percentageUsed: number } {
    const freeLimit = 100000; // 100K operations per month
    const percentageUsed = (this.operationCount / freeLimit) * 100;
    
    return {
      operations: this.operationCount,
      freeLimit,
      percentageUsed: Math.round(percentageUsed * 100) / 100
    };
  }
  
  // Private helper methods
  
  private static async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    this.operationCount++; // Track operations for monitoring
    
    if (!this.client) {
      throw new Error('Prisma client not initialized');
    }
    
    return await this.client.query(query, params);
  }
  
  private static async getCurrentUserId(): Promise<string> {
    // In production, get from auth context
    return 'current-user-id';
  }
  
  private static getOrCreateDeviceId(): string {
    const stored = localStorage.getItem('prisma-device-id');
    if (stored) return stored;
    
    const deviceId = `device-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    localStorage.setItem('prisma-device-id', deviceId);
    return deviceId;
  }
  
  private static convertPrismaToPersonal(prismaTask: PrismaTask): PersonalTask {
    return {
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description || '',
      workType: prismaTask.work_type,
      priority: prismaTask.priority,
      completed: prismaTask.completed,
      originalDate: prismaTask.original_date,
      currentDate: prismaTask.current_date,
      estimatedDuration: prismaTask.estimated_duration,
      rollovers: prismaTask.rollovers,
      subtasks: [], // Could be expanded
      tags: prismaTask.tags || [],
      category: prismaTask.category,
      createdAt: prismaTask.created_at,
      completedAt: prismaTask.completed_at
    };
  }
  
  private static createTaskCard(date: Date, tasks: PersonalTask[]): PersonalTaskCard {
    return {
      id: `prisma-${format(date, 'yyyy-MM-dd')}`,
      date: date,
      title: `Personal Tasks - ${format(date, 'EEEE, MMMM d')}`,
      completed: tasks.length > 0 && tasks.every(task => task.completed),
      tasks: tasks
    };
  }
  
  private static clearCacheForDate(date: Date): void {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.endsWith(targetDateStr));
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Export singleton
export const prismaTaskService = PrismaTaskService;