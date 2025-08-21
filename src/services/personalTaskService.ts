// Personal Task Service with Automatic Rollover
// Stores only user-created tasks and rolls over incomplete ones to the next day

import { format, isSameDay, isAfter, isBefore, subDays, parseISO } from 'date-fns';

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  workType: 'deep' | 'light';
  priority: 'critical' | 'urgent' | 'high' | 'medium' | 'low';
  completed: boolean;
  originalDate: string; // YYYY-MM-DD when task was first created
  currentDate: string;   // YYYY-MM-DD which day it's currently assigned to
  estimatedDuration?: number; // minutes
  subtasks?: PersonalSubtask[];
  tags?: string[];
  category?: string;
  createdAt: string;
  completedAt?: string;
  rollovers: number; // How many times this task has been rolled over
}

export interface PersonalSubtask {
  id: string;
  title: string;
  completed: boolean;
  workType: 'deep' | 'light';
}

export interface PersonalTaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: PersonalTask[];
}

export class PersonalTaskService {
  private static readonly STORAGE_KEY = 'lifelock-personal-tasks';
  private static readonly MAX_ROLLOVER_DAYS = 7; // Don't roll over tasks older than 7 days

  /**
   * Get all stored personal tasks
   */
  private static getAllTasks(): PersonalTask[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ [PERSONAL TASKS] Error loading tasks:', error);
      return [];
    }
  }

  /**
   * Save all personal tasks
   */
  private static saveAllTasks(tasks: PersonalTask[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      console.log(`💾 [PERSONAL TASKS] Saved ${tasks.length} tasks`);
    } catch (error) {
      console.error('❌ [PERSONAL TASKS] Error saving tasks:', error);
    }
  }

  /**
   * Get tasks for a specific date WITH automatic rollover
   */
  public static getTasksForDate(date: Date): PersonalTaskCard {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    const isToday = dateStr === today;
    const isFutureDate = isAfter(date, new Date());
    
    console.log(`📅 [PERSONAL TASKS] Getting tasks for ${dateStr} (today: ${today})`);
    
    let allTasks = this.getAllTasks();
    
    // Only perform rollover for today or future dates
    if (isToday || isFutureDate) {
      allTasks = this.performRollover(allTasks, dateStr);
    }
    
    // Get tasks for the requested date
    const dateTasks = allTasks.filter(task => task.currentDate === dateStr);
    
    console.log(`📋 [PERSONAL TASKS] Found ${dateTasks.length} tasks for ${dateStr}`);
    
    const completedTasks = dateTasks.filter(task => task.completed).length;
    
    return {
      id: dateStr,
      date,
      title: format(date, 'EEEE, MMM d'),
      completed: dateTasks.length > 0 && completedTasks === dateTasks.length,
      tasks: dateTasks.sort((a, b) => {
        // Sort by priority, then by creation time
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
    };
  }

  /**
   * Perform automatic rollover of incomplete tasks
   */
  private static performRollover(allTasks: PersonalTask[], targetDate: string): PersonalTask[] {
    const today = format(new Date(), 'yyyy-MM-dd');
    const targetDateObj = parseISO(targetDate + 'T00:00:00');
    
    console.log(`🔄 [PERSONAL TASKS] Performing rollover to ${targetDate}`);
    
    // Find incomplete tasks from previous days that need to be rolled over
    const tasksToRollover: PersonalTask[] = [];
    const updatedTasks: PersonalTask[] = [];
    
    for (const task of allTasks) {
      const taskDate = parseISO(task.currentDate + 'T00:00:00');
      
      if (!task.completed && 
          isBefore(taskDate, targetDateObj) && 
          task.rollovers < this.MAX_ROLLOVER_DAYS) {
        
        // Roll over this incomplete task
        const rolledTask: PersonalTask = {
          ...task,
          currentDate: targetDate,
          rollovers: task.rollovers + 1
        };
        
        tasksToRollover.push(rolledTask);
        console.log(`🔄 [ROLLOVER] "${task.title}" from ${task.currentDate} → ${targetDate} (rollover #${rolledTask.rollovers})`);
      } else {
        // Keep the task as-is
        updatedTasks.push(task);
      }
    }
    
    // Add rolled over tasks
    const finalTasks = [...updatedTasks, ...tasksToRollover];
    
    if (tasksToRollover.length > 0) {
      this.saveAllTasks(finalTasks);
      console.log(`✅ [ROLLOVER] Rolled over ${tasksToRollover.length} incomplete tasks to ${targetDate}`);
    }
    
    return finalTasks;
  }

  /**
   * Add new personal tasks (from thought dumps or manual creation)
   */
  public static addTasks(tasks: Partial<PersonalTask>[], targetDate?: Date): PersonalTask[] {
    const dateStr = targetDate ? format(targetDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();
    
    console.log(`➕ [PERSONAL TASKS] Adding ${tasks.length} new tasks for ${dateStr}`);
    
    const allTasks = this.getAllTasks();
    const newTasks: PersonalTask[] = [];
    
    for (const taskData of tasks) {
      const newTask: PersonalTask = {
        id: taskData.id || this.generateTaskId(),
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        workType: taskData.workType || 'deep',
        priority: taskData.priority || 'medium',
        completed: false,
        originalDate: dateStr,
        currentDate: dateStr,
        estimatedDuration: taskData.estimatedDuration,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || [],
        category: taskData.category,
        createdAt: now,
        rollovers: 0
      };
      
      newTasks.push(newTask);
    }
    
    const updatedTasks = [...allTasks, ...newTasks];
    this.saveAllTasks(updatedTasks);
    
    console.log(`✅ [PERSONAL TASKS] Added ${newTasks.length} new tasks`);
    return newTasks;
  }

  /**
   * Toggle task completion status
   */
  public static toggleTask(taskId: string): boolean {
    const allTasks = this.getAllTasks();
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      console.warn(`⚠️ [PERSONAL TASKS] Task not found: ${taskId}`);
      return false;
    }
    
    const task = allTasks[taskIndex];
    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;
    
    this.saveAllTasks(allTasks);
    
    console.log(`✅ [PERSONAL TASKS] Toggled "${task.title}": ${wasCompleted ? 'completed' : 'incomplete'} → ${task.completed ? 'completed' : 'incomplete'}`);
    return true;
  }

  /**
   * Update task details
   */
  public static updateTask(taskId: string, updates: Partial<PersonalTask>): boolean {
    const allTasks = this.getAllTasks();
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      console.warn(`⚠️ [PERSONAL TASKS] Task not found: ${taskId}`);
      return false;
    }
    
    allTasks[taskIndex] = { ...allTasks[taskIndex], ...updates };
    this.saveAllTasks(allTasks);
    
    console.log(`📝 [PERSONAL TASKS] Updated task: ${taskId}`);
    return true;
  }

  /**
   * Delete a task permanently
   */
  public static deleteTask(taskId: string): boolean {
    const allTasks = this.getAllTasks();
    const initialLength = allTasks.length;
    const filteredTasks = allTasks.filter(task => task.id !== taskId);
    
    if (filteredTasks.length === initialLength) {
      console.warn(`⚠️ [PERSONAL TASKS] Task not found for deletion: ${taskId}`);
      return false;
    }
    
    this.saveAllTasks(filteredTasks);
    console.log(`🗑️ [PERSONAL TASKS] Deleted task: ${taskId}`);
    return true;
  }

  /**
   * Get task statistics for a date range
   */
  public static getTaskStats(fromDate: Date, toDate: Date): {
    totalTasks: number;
    completedTasks: number;
    deepTasks: number;
    lightTasks: number;
    rolledOverTasks: number;
    completionRate: number;
  } {
    const allTasks = this.getAllTasks();
    const fromStr = format(fromDate, 'yyyy-MM-dd');
    const toStr = format(toDate, 'yyyy-MM-dd');
    
    const tasksInRange = allTasks.filter(task => 
      task.currentDate >= fromStr && task.currentDate <= toStr
    );
    
    const completedTasks = tasksInRange.filter(task => task.completed).length;
    const deepTasks = tasksInRange.filter(task => task.workType === 'deep').length;
    const lightTasks = tasksInRange.filter(task => task.workType === 'light').length;
    const rolledOverTasks = tasksInRange.filter(task => task.rollovers > 0).length;
    
    return {
      totalTasks: tasksInRange.length,
      completedTasks,
      deepTasks,
      lightTasks,
      rolledOverTasks,
      completionRate: tasksInRange.length > 0 ? (completedTasks / tasksInRange.length) * 100 : 0
    };
  }

  /**
   * Replace tasks for a specific date with a new task list (used by Eisenhower Matrix organizer)
   */
  public static replaceTasks(newTasks: PersonalTask[], targetDate: Date): void {
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    const allTasks = this.getAllTasks();
    
    // Remove existing tasks for the target date
    const otherDateTasks = allTasks.filter(task => task.currentDate !== targetDateStr);
    
    // Add the new tasks with correct date assignment
    const updatedTasks = newTasks.map(task => ({
      ...task,
      currentDate: targetDateStr
    }));
    
    // Combine and save
    const finalTasks = [...otherDateTasks, ...updatedTasks];
    this.saveAllTasks(finalTasks);
    
    console.log(`🔄 [PERSONAL TASKS] Replaced ${newTasks.length} tasks for ${targetDateStr}`);
  }

  /**
   * Clear all tasks (for debugging/reset)
   */
  public static clearAllTasks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log(`🧹 [PERSONAL TASKS] Cleared all tasks`);
  }

  /**
   * Get tasks that need attention (overdue, high priority, etc.)
   */
  public static getTasksNeedingAttention(): PersonalTask[] {
    const allTasks = this.getAllTasks();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return allTasks.filter(task => 
      !task.completed && (
        task.priority === 'urgent' ||
        task.rollovers >= 3 ||
        (task.currentDate < today && task.rollovers > 0)
      )
    ).sort((a, b) => {
      // Sort by urgency: urgent priority, then by rollover count
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      return b.rollovers - a.rollovers;
    });
  }

  /**
   * Convert LifeLockTask from thought dump to PersonalTask
   */
  public static convertLifeLockTaskToPersonal(lifeLockTask: any): Partial<PersonalTask> {
    return {
      id: lifeLockTask.id,
      title: lifeLockTask.title,
      description: lifeLockTask.description,
      workType: lifeLockTask.workType,
      priority: lifeLockTask.priority,
      estimatedDuration: lifeLockTask.estimatedDuration,
      tags: lifeLockTask.tags,
      category: lifeLockTask.category,
      subtasks: lifeLockTask.subtasks?.map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        completed: false,
        workType: sub.workType
      })) || []
    };
  }

  /**
   * Utility function to generate unique task IDs
   */
  private static generateTaskId(): string {
    return `personal-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export tasks for backup/migration
   */
  public static exportTasks(): string {
    const allTasks = this.getAllTasks();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      tasks: allTasks
    }, null, 2);
  }

  /**
   * Import tasks from backup
   */
  public static importTasks(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks && Array.isArray(data.tasks)) {
        this.saveAllTasks(data.tasks);
        console.log(`📥 [PERSONAL TASKS] Imported ${data.tasks.length} tasks`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [PERSONAL TASKS] Import failed:', error);
      return false;
    }
  }
}

// Export singleton-style access
export const personalTaskService = PersonalTaskService;