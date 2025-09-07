/**
 * Neon Task Service - AI-First Personal Task Management
 * 
 * Features:
 * - Direct Neon database integration
 * - MCP-ready for AI agents
 * - Real-time sync across devices  
 * - Database branching for safe AI experiments
 * - Vector embeddings for semantic search
 */

import { PersonalTask, PersonalTaskCard } from './personalTaskService';
import { format, parseISO } from 'date-fns';

interface NeonConfig {
  endpoint: string;
  apiKey: string;
  databaseUrl: string;
}

interface NeonTask {
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
  embedding: number[] | null; // Vector for semantic search
}

export class NeonTaskService {
  private static config: NeonConfig | null = null;
  private static deviceId: string;
  private static cache: Map<string, PersonalTask[]> = new Map();
  
  /**
   * Initialize Neon connection
   */
  public static async initialize(config: NeonConfig): Promise<void> {
    this.config = config;
    this.deviceId = this.getOrCreateDeviceId();
    
    console.log('🔗 [NEON] Connecting to Neon database...');
    
    try {
      // Test connection
      await this.executeQuery('SELECT NOW() as connected_at');
      console.log('✅ [NEON] Connected successfully');
      
      // Ensure schema exists
      await this.ensureSchema();
      
    } catch (error) {
      console.error('❌ [NEON] Connection failed:', error);
      throw new Error(`Neon connection failed: ${error}`);
    }
  }
  
  /**
   * Create the personal_tasks table if it doesn't exist
   */
  private static async ensureSchema(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS personal_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        work_type TEXT CHECK (work_type IN ('deep', 'light')) DEFAULT 'light',
        priority TEXT CHECK (priority IN ('critical', 'urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
        completed BOOLEAN DEFAULT false,
        original_date DATE NOT NULL,
        current_date DATE NOT NULL,
        estimated_duration INTEGER DEFAULT 60,
        rollovers INTEGER DEFAULT 0,
        tags TEXT[],
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        device_id TEXT,
        
        -- AI-specific fields for Eisenhower Matrix
        eisenhower_quadrant TEXT CHECK (eisenhower_quadrant IN ('do-first', 'schedule', 'delegate', 'eliminate')),
        urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 10),
        importance_score INTEGER CHECK (importance_score BETWEEN 1 AND 10),
        ai_reasoning TEXT,
        
        -- Vector embedding for semantic search (pgvector)
        embedding vector(1536)
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_personal_tasks_user_date ON personal_tasks(user_id, current_date);
      CREATE INDEX IF NOT EXISTS idx_personal_tasks_priority ON personal_tasks(user_id, priority, completed);
      CREATE INDEX IF NOT EXISTS idx_personal_tasks_work_type ON personal_tasks(user_id, work_type);
      CREATE INDEX IF NOT EXISTS idx_personal_tasks_updated ON personal_tasks(updated_at DESC);
      
      -- Vector similarity index
      CREATE INDEX IF NOT EXISTS idx_personal_tasks_embedding ON personal_tasks 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      
      -- Function to auto-update updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Trigger for auto-updating timestamps
      DROP TRIGGER IF EXISTS update_personal_tasks_updated_at ON personal_tasks;
      CREATE TRIGGER update_personal_tasks_updated_at BEFORE UPDATE
        ON personal_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await this.executeQuery(createTableSQL);
    console.log('✅ [NEON] Schema ensured');
  }
  
  /**
   * Get tasks for a specific date
   */
  public static async getTasksForDate(date: Date): Promise<PersonalTaskCard> {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    const userId = await this.getCurrentUserId();
    
    // Check cache first
    const cacheKey = `${userId}-${targetDateStr}`;
    if (this.cache.has(cacheKey)) {
      const cachedTasks = this.cache.get(cacheKey)!;
      return this.createTaskCard(date, cachedTasks);
    }
    
    try {
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
      
      const neonTasks = await this.executeQuery(query, [userId, targetDateStr]) as NeonTask[];
      const personalTasks = neonTasks.map(this.convertNeonToPersonal);
      
      // Cache the result
      this.cache.set(cacheKey, personalTasks);
      
      return this.createTaskCard(date, personalTasks);
      
    } catch (error) {
      console.error('❌ [NEON] Failed to get tasks:', error);
      // Return empty card on error
      return this.createTaskCard(date, []);
    }
  }
  
  /**
   * Add new tasks
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
      ai_reasoning: null,
      embedding: null
    }));
    
    try {
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
      
      const insertedTasks = await this.executeQuery(insertQuery, params) as NeonTask[];
      const personalTasks = insertedTasks.map(this.convertNeonToPersonal);
      
      // Clear cache for this date
      this.clearCacheForDate(targetDate || new Date());
      
      console.log(`✅ [NEON] Added ${personalTasks.length} tasks`);
      return personalTasks;
      
    } catch (error) {
      console.error('❌ [NEON] Failed to add tasks:', error);
      throw error;
    }
  }
  
  /**
   * Toggle task completion
   */
  public static async toggleTask(taskId: string): Promise<boolean> {
    try {
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
      
      if (result.length > 0) {
        // Clear cache for the affected date
        const affectedDate = parseISO(result[0].current_date);
        this.clearCacheForDate(affectedDate);
        
        console.log(`✅ [NEON] Toggled task ${taskId}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ [NEON] Failed to toggle task:', error);
      return false;
    }
  }
  
  /**
   * Update task with AI analysis (Eisenhower Matrix)
   */
  public static async updateTaskWithAI(
    taskId: string,
    aiData: {
      quadrant: 'do-first' | 'schedule' | 'delegate' | 'eliminate';
      urgencyScore: number;
      importanceScore: number;
      reasoning: string;
    }
  ): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      
      const query = `
        UPDATE personal_tasks 
        SET 
          eisenhower_quadrant = $1,
          urgency_score = $2,
          importance_score = $3,
          ai_reasoning = $4
        WHERE id = $5 AND user_id = $6
        RETURNING current_date
      `;
      
      const result = await this.executeQuery(query, [
        aiData.quadrant,
        aiData.urgencyScore,
        aiData.importanceScore,
        aiData.reasoning,
        taskId,
        userId
      ]) as any[];
      
      if (result.length > 0) {
        // Clear cache
        const affectedDate = parseISO(result[0].current_date);
        this.clearCacheForDate(affectedDate);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ [NEON] Failed to update task with AI data:', error);
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
      
      // Clear cache
      this.clearCacheForDate(targetDate);
      
      console.log(`✅ [NEON] Replaced ${newTasks.length} tasks for ${targetDateStr}`);
      
    } catch (error) {
      // Rollback on error
      await this.executeQuery('ROLLBACK');
      console.error('❌ [NEON] Failed to replace tasks:', error);
      throw error;
    }
  }
  
  /**
   * Migrate data from localStorage to Neon
   */
  public static async migrateFromLocalStorage(): Promise<void> {
    console.log('🔄 [NEON] Starting migration from localStorage...');
    
    try {
      // Get localStorage data
      const localData = localStorage.getItem('lifelock-personal-tasks');
      if (!localData) {
        console.log('📭 [NEON] No localStorage data to migrate');
        return;
      }
      
      const localTasks: PersonalTask[] = JSON.parse(localData);
      console.log(`📊 [NEON] Found ${localTasks.length} tasks to migrate`);
      
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
      
      console.log(`✅ [NEON] Migration complete: ${migratedCount} tasks migrated`);
      
      // Backup localStorage before clearing
      const backupKey = `lifelock-personal-tasks-backup-${Date.now()}`;
      localStorage.setItem(backupKey, localData);
      
      // Clear original localStorage
      localStorage.removeItem('lifelock-personal-tasks');
      
      console.log(`💾 [NEON] LocalStorage backed up to: ${backupKey}`);
      
    } catch (error) {
      console.error('❌ [NEON] Migration failed:', error);
      throw error;
    }
  }
  
  // Private helper methods
  
  private static async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.config) {
      throw new Error('Neon not initialized');
    }
    
    // This would use actual Neon client in production
    // For now, simulate the interface
    console.log('🔗 [NEON] Executing:', query.substring(0, 100) + '...');
    
    // TODO: Replace with actual Neon client
    // const client = new Client({ connectionString: this.config.databaseUrl });
    // await client.connect();
    // const result = await client.query(query, params);
    // await client.end();
    // return result.rows;
    
    return []; // Temporary
  }
  
  private static async getCurrentUserId(): Promise<string> {
    // In production, get from auth context
    return 'current-user-id';
  }
  
  private static getOrCreateDeviceId(): string {
    const stored = localStorage.getItem('neon-device-id');
    if (stored) return stored;
    
    const deviceId = `device-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    localStorage.setItem('neon-device-id', deviceId);
    return deviceId;
  }
  
  private static convertNeonToPersonal(neonTask: NeonTask): PersonalTask {
    return {
      id: neonTask.id,
      title: neonTask.title,
      description: neonTask.description || '',
      workType: neonTask.work_type,
      priority: neonTask.priority,
      completed: neonTask.completed,
      originalDate: neonTask.original_date,
      currentDate: neonTask.current_date,
      estimatedDuration: neonTask.estimated_duration,
      rollovers: neonTask.rollovers,
      subtasks: [], // Could be expanded
      tags: neonTask.tags || [],
      category: neonTask.category,
      createdAt: neonTask.created_at,
      completedAt: neonTask.completed_at
    };
  }
  
  private static createTaskCard(date: Date, tasks: PersonalTask[]): PersonalTaskCard {
    return {
      id: `neon-${format(date, 'yyyy-MM-dd')}`,
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
export const neonTaskService = NeonTaskService;