/**
 * Personal Task Cloud Service with Supabase Integration
 * 
 * Provides cloud storage for personal tasks with:
 * - Auto-sync across devices
 * - Offline-first with local caching
 * - Conflict resolution
 * - Real-time updates
 */

import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { PersonalTask, PersonalTaskCard } from './personalTaskService';

export interface CloudPersonalTask extends Omit<PersonalTask, 'id'> {
  id?: string; // Supabase will generate this
  user_id: string;
  sync_status: 'synced' | 'pending' | 'conflict';
  device_id: string;
  last_modified: string;
}

export class PersonalTaskCloudService {
  private static readonly DEVICE_ID_KEY = 'lifelock-device-id';
  private static readonly LOCAL_CACHE_KEY = 'lifelock-personal-tasks-cache';
  private static readonly LAST_SYNC_KEY = 'lifelock-last-sync';
  private static deviceId: string;
  
  /**
   * Initialize the cloud service
   */
  public static async initialize(): Promise<void> {
    // Get or create device ID
    this.deviceId = localStorage.getItem(this.DEVICE_ID_KEY) || this.generateDeviceId();
    localStorage.setItem(this.DEVICE_ID_KEY, this.deviceId);
    
    // Attempt initial sync
    try {
      await this.syncFromCloud();
      console.log('✅ [CLOUD TASKS] Initial sync completed');
    } catch (error) {
      console.warn('⚠️ [CLOUD TASKS] Initial sync failed, using local cache:', error);
    }
  }
  
  /**
   * Save tasks to cloud with local cache
   */
  public static async saveTasks(tasks: PersonalTask[]): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      // Convert personal tasks to cloud format
      const cloudTasks: CloudPersonalTask[] = tasks.map(task => ({
        ...task,
        user_id: user.id,
        device_id: this.deviceId,
        sync_status: 'pending',
        last_modified: new Date().toISOString()
      }));
      
      // Save to cache first (for speed)
      localStorage.setItem(this.LOCAL_CACHE_KEY, JSON.stringify(cloudTasks));
      
      // Upload to Supabase using the existing tasks table
      const { error } = await supabase
        .from('tasks')
        .upsert(
          cloudTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            category: this.mapWorkTypeToCategory(task.workType),
            priority: task.priority,
            status: task.completed ? 'completed' : 'pending',
            assigned_to: user.id,
            created_by: user.id,
            due_date: task.currentDate,
            created_at: task.createdAt,
            completed_at: task.completedAt,
            updated_at: task.last_modified
          })),
          { onConflict: 'id' }
        );
      
      if (error) throw error;
      
      // Mark as synced
      const syncedTasks = cloudTasks.map(task => ({
        ...task,
        sync_status: 'synced' as const
      }));
      localStorage.setItem(this.LOCAL_CACHE_KEY, JSON.stringify(syncedTasks));
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      
      console.log('✅ [CLOUD TASKS] Saved to cloud:', tasks.length, 'tasks');
      
    } catch (error) {
      console.error('❌ [CLOUD TASKS] Save failed:', error);
      throw error;
    }
  }
  
  /**
   * Load tasks from cloud with local fallback
   */
  public static async loadTasks(): Promise<PersonalTask[]> {
    try {
      // Try to sync from cloud first
      const cloudTasks = await this.syncFromCloud();
      if (cloudTasks.length > 0) {
        return this.convertCloudTasksToPersonal(cloudTasks);
      }
    } catch (error) {
      console.warn('⚠️ [CLOUD TASKS] Cloud load failed, using cache:', error);
    }
    
    // Fallback to local cache
    return this.loadFromCache();
  }
  
  /**
   * Sync from cloud and merge with local changes
   */
  public static async syncFromCloud(): Promise<CloudPersonalTask[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];
    
    const { data: cloudTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .or('created_by.eq.' + user.id);
    
    if (error) throw error;
    
    // Convert Supabase tasks to cloud format
    const convertedTasks: CloudPersonalTask[] = (cloudTasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      workType: this.mapCategoryToWorkType(task.category),
      priority: task.priority || 'medium',
      completed: task.status === 'completed',
      originalDate: task.created_at?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
      currentDate: task.due_date || format(new Date(), 'yyyy-MM-dd'),
      estimatedDuration: task.duration || 60,
      createdAt: task.created_at || new Date().toISOString(),
      completedAt: task.completed_at,
      rollovers: 0, // Will be calculated
      user_id: user.id,
      device_id: this.deviceId,
      sync_status: 'synced',
      last_modified: task.updated_at || task.created_at || new Date().toISOString()
    }));
    
    // Merge with local changes using conflict resolution
    const mergedTasks = await this.mergeWithLocalChanges(convertedTasks);
    
    // Cache the merged result
    localStorage.setItem(this.LOCAL_CACHE_KEY, JSON.stringify(mergedTasks));
    localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
    
    return mergedTasks;
  }
  
  /**
   * Real-time sync setup (call this once on app start)
   */
  public static setupRealTimeSync(): void {
    const user_id = this.getCurrentUser().then(user => user?.id);
    
    if (!user_id) return;
    
    // Subscribe to changes in tasks table
    supabase
      .channel('personal-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${user_id}`
        },
        (payload) => {
          console.log('🔄 [CLOUD TASKS] Real-time update received:', payload);
          this.syncFromCloud().catch(console.error);
        }
      )
      .subscribe();
  }
  
  /**
   * Get tasks for a specific date (with cloud sync)
   */
  public static async getTasksForDate(date: Date): Promise<PersonalTaskCard> {
    const allTasks = await this.loadTasks();
    const targetDateStr = format(date, 'yyyy-MM-dd');
    
    // Filter tasks for the target date
    const dateTasks = allTasks.filter(task => task.currentDate === targetDateStr);
    
    return {
      id: `personal-${targetDateStr}`,
      date: date,
      title: `Personal Tasks - ${format(date, 'EEEE, MMMM d')}`,
      completed: dateTasks.length > 0 && dateTasks.every(task => task.completed),
      tasks: dateTasks
    };
  }
  
  /**
   * Add new tasks to cloud
   */
  public static async addTasks(newTasks: Partial<PersonalTask>[], targetDate?: Date): Promise<PersonalTask[]> {
    const existingTasks = await this.loadTasks();
    
    // Create full task objects
    const tasksToAdd: PersonalTask[] = newTasks.map(taskData => {
      const currentDate = format(targetDate || new Date(), 'yyyy-MM-dd');
      return {
        id: this.generateTaskId(),
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        workType: taskData.workType || 'light',
        priority: taskData.priority || 'medium',
        completed: false,
        originalDate: currentDate,
        currentDate: currentDate,
        estimatedDuration: taskData.estimatedDuration || 60,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
        category: taskData.category,
        createdAt: new Date().toISOString(),
        rollovers: 0
      };
    });
    
    // Combine with existing tasks
    const allTasks = [...existingTasks, ...tasksToAdd];
    
    // Save to cloud
    await this.saveTasks(allTasks);
    
    return tasksToAdd;
  }
  
  /**
   * Toggle task completion (with cloud sync)
   */
  public static async toggleTask(taskId: string): Promise<boolean> {
    const allTasks = await this.loadTasks();
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return false;
    
    // Toggle completion
    allTasks[taskIndex].completed = !allTasks[taskIndex].completed;
    allTasks[taskIndex].completedAt = allTasks[taskIndex].completed 
      ? new Date().toISOString() 
      : undefined;
    
    // Save to cloud
    await this.saveTasks(allTasks);
    
    return true;
  }
  
  // Private helper methods
  
  private static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  
  private static generateDeviceId(): string {
    return 'device-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
  
  private static generateTaskId(): string {
    return 'task-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
  
  private static loadFromCache(): PersonalTask[] {
    try {
      const cached = localStorage.getItem(this.LOCAL_CACHE_KEY);
      if (cached) {
        const cloudTasks: CloudPersonalTask[] = JSON.parse(cached);
        return this.convertCloudTasksToPersonal(cloudTasks);
      }
    } catch (error) {
      console.error('❌ [CLOUD TASKS] Cache load failed:', error);
    }
    return [];
  }
  
  private static convertCloudTasksToPersonal(cloudTasks: CloudPersonalTask[]): PersonalTask[] {
    return cloudTasks.map(task => ({
      id: task.id || task.title + '-' + Date.now(),
      title: task.title,
      description: task.description,
      workType: task.workType,
      priority: task.priority,
      completed: task.completed,
      originalDate: task.originalDate,
      currentDate: task.currentDate,
      estimatedDuration: task.estimatedDuration,
      subtasks: task.subtasks,
      tags: task.tags,
      category: task.category,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      rollovers: task.rollovers
    }));
  }
  
  private static async mergeWithLocalChanges(cloudTasks: CloudPersonalTask[]): Promise<CloudPersonalTask[]> {
    const localTasks = this.loadFromCache();
    const localMap = new Map(localTasks.map(task => [task.id, task]));
    
    // Simple conflict resolution: local changes win if more recent
    const merged = cloudTasks.map(cloudTask => {
      const localTask = localMap.get(cloudTask.id || '');
      if (localTask && localTask.completedAt && cloudTask.last_modified) {
        const localTime = new Date(localTask.completedAt || localTask.createdAt).getTime();
        const cloudTime = new Date(cloudTask.last_modified).getTime();
        
        if (localTime > cloudTime) {
          // Local is more recent
          return {
            ...cloudTask,
            completed: localTask.completed,
            completedAt: localTask.completedAt,
            sync_status: 'pending' as const
          };
        }
      }
      return cloudTask;
    });
    
    return merged;
  }
  
  private static mapWorkTypeToCategory(workType: 'deep' | 'light'): string {
    return workType === 'deep' ? 'siso_app_dev' : 'daily';
  }
  
  private static mapCategoryToWorkType(category: string): 'deep' | 'light' {
    return ['siso_app_dev', 'development'].includes(category) ? 'deep' : 'light';
  }
}

// Export singleton
export const personalTaskCloudService = PersonalTaskCloudService;