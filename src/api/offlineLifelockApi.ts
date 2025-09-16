/**
 * Offline-First LifeLock API
 * Seamlessly switches between online Supabase and offline IndexedDB storage
 */

import { syncService } from '@/shared/offline/syncService';
import { offlineDb } from '@/shared/offline/offlineDb';
import { 
  LifeLockProductivityMetrics,
  LifeLockHeatmapData,
  LifeLockHourlyPerformance 
} from './lifelockAnalyticsApi';

export interface OfflineLightWorkTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  original_date: string;
  task_date: string;
  estimated_duration?: number;
  actual_duration_min?: number;
  xp_reward?: number;
  difficulty?: number;
  complexity?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  _offline_id?: string;
  _needs_sync?: boolean;
  _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
}

export interface OfflineDeepWorkTask extends OfflineLightWorkTask {
  focus_blocks?: number;
}

class OfflineLifeLockApi {
  
  // ===== TASK MANAGEMENT =====
  
  async getLightWorkTasks(date?: string): Promise<OfflineLightWorkTask[]> {
    return await syncService.getTasks('light', date);
  }

  async getDeepWorkTasks(date?: string): Promise<OfflineDeepWorkTask[]> {
    return await syncService.getTasks('deep', date);
  }

  async createLightWorkTask(task: Omit<OfflineLightWorkTask, 'id' | 'created_at' | 'updated_at'>): Promise<OfflineLightWorkTask> {
    const newTask: OfflineLightWorkTask = {
      ...task,
      id: `offline-light-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await syncService.createTask(newTask, 'light');
    return newTask;
  }

  async createDeepWorkTask(task: Omit<OfflineDeepWorkTask, 'id' | 'created_at' | 'updated_at'>): Promise<OfflineDeepWorkTask> {
    const newTask: OfflineDeepWorkTask = {
      ...task,
      id: `offline-deep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await syncService.createTask(newTask, 'deep');
    return newTask;
  }

  async updateLightWorkTask(task: OfflineLightWorkTask): Promise<void> {
    const updatedTask = {
      ...task,
      updated_at: new Date().toISOString()
    };
    
    await syncService.updateTask(updatedTask, 'light');
  }

  async updateDeepWorkTask(task: OfflineDeepWorkTask): Promise<void> {
    const updatedTask = {
      ...task,
      updated_at: new Date().toISOString()
    };
    
    await syncService.updateTask(updatedTask, 'deep');
  }

  async toggleTaskCompletion(taskId: string, taskType: 'light' | 'deep'): Promise<void> {
    const tasks = taskType === 'light' 
      ? await this.getLightWorkTasks() 
      : await this.getDeepWorkTasks();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const updatedTask = {
      ...task,
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    };

    await syncService.updateTask(updatedTask, taskType);
  }

  async deleteTask(taskId: string, taskType: 'light' | 'deep'): Promise<void> {
    await syncService.deleteTask(taskId, taskType);
  }

  // ===== ANALYTICS (OFFLINE-CAPABLE) =====
  
  async fetchOfflineProductivityMetrics(): Promise<LifeLockProductivityMetrics> {
    const lightWorkTasks = await this.getLightWorkTasks();
    const deepWorkTasks = await this.getDeepWorkTasks();
    const allTasks = [...lightWorkTasks, ...deepWorkTasks];

    // Calculate XP for tasks that don't have it
    const tasksWithXP = allTasks.map(task => {
      if (task.xp_reward) return task;
      
      // Calculate XP based on task type and properties
      const baseXP = task.focus_blocks ? 25 : 10; // Deep work vs light work
      let bonusXP = 0;

      // Difficulty bonus (30% for HIGH priority)
      if (task.priority === 'HIGH' || task.priority === 'URGENT') {
        bonusXP += Math.round(baseXP * 0.3);
      }

      // Speed bonus (50% if completed faster than estimated)
      if (task.completed && task.actual_duration_min && task.estimated_duration) {
        const speedRatio = task.estimated_duration / task.actual_duration_min;
        if (speedRatio > 1.2) {
          bonusXP += Math.round(baseXP * 0.5 * (speedRatio - 1));
        }
      }

      // Focus block bonus for deep work
      if (task.focus_blocks) {
        bonusXP += task.focus_blocks * 5;
      }

      return { ...task, xp_reward: baseXP + bonusXP };
    });

    // Get current date ranges
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter tasks by time periods
    const todayTasks = tasksWithXP.filter(t => t.task_date === today);
    const weekTasks = tasksWithXP.filter(t => new Date(t.task_date) >= weekStart);
    const monthTasks = tasksWithXP.filter(t => new Date(t.task_date) >= monthStart);

    // Calculate metrics for each period
    const calculatePeriodMetrics = (tasks: typeof tasksWithXP) => {
      const completed = tasks.filter(t => t.completed);
      const totalXP = completed.reduce((sum, t) => sum + (t.xp_reward || 0), 0);
      const avgXP = completed.length > 0 ? totalXP / completed.length : 0;
      
      // Calculate productivity score based on completion rate, XP, and efficiency
      const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;
      const xpEfficiency = totalXP / Math.max(1, tasks.length) * 10; // Scale for scoring
      const productivityScore = Math.min(100, Math.round((completionRate * 0.6) + (xpEfficiency * 0.4)));

      // Calculate focus time
      const focusTimeHours = completed.reduce((sum, t) => {
        return sum + (t.actual_duration_min || t.estimated_duration || 0);
      }, 0) / 60;

      // Calculate speed bonuses
      const speedBonusCount = completed.filter(t => {
        if (!t.actual_duration_min || !t.estimated_duration) return false;
        return t.estimated_duration / t.actual_duration_min > 1.2;
      }).length;

      // Calculate XP efficiency (XP per hour)
      const xpEfficiencyScore = focusTimeHours > 0 ? totalXP / focusTimeHours : 0;

      return {
        totalTasks: tasks.length,
        completedTasks: completed.length,
        completionRate: Math.round(completionRate),
        productivityScore,
        totalXpEarned: totalXP,
        averageXpPerTask: Math.round(avgXP),
        focusTimeHours: Math.round(focusTimeHours * 100) / 100,
        speedBonusCount,
        xpEfficiencyScore: Math.round(xpEfficiencyScore * 100) / 100,
        mostProductiveHour: 14, // Default peak hour
        streak: 1, // Simplified for offline
        weeklyTrend: 5, // Simplified for offline
        categoryBreakdown: {
          'Light Work': lightWorkTasks.filter(t => tasks.includes(t)).length,
          'Deep Work': deepWorkTasks.filter(t => tasks.includes(t)).length,
        }
      };
    };

    return {
      daily: calculatePeriodMetrics(todayTasks),
      weekly: calculatePeriodMetrics(weekTasks),
      monthly: calculatePeriodMetrics(monthTasks)
    };
  }

  async fetchOfflineActivityHeatmap(): Promise<LifeLockHeatmapData[]> {
    const allTasks = [...await this.getLightWorkTasks(), ...await this.getDeepWorkTasks()];
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayTasks = allTasks.filter(t => t.task_date === date);
      const completedCount = dayTasks.filter(t => t.completed).length;
      
      let level = 0;
      if (completedCount >= 5) level = 4;
      else if (completedCount >= 3) level = 3;
      else if (completedCount >= 2) level = 2;
      else if (completedCount >= 1) level = 1;

      return {
        date,
        count: completedCount,
        level
      };
    });
  }

  async fetchOfflineHourlyPerformance(): Promise<LifeLockHourlyPerformance[]> {
    const allTasks = [...await this.getLightWorkTasks(), ...await this.getDeepWorkTasks()];
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      const hourTasks = allTasks.filter(t => {
        if (!t.completed_at) return false;
        const taskHour = new Date(t.completed_at).getHours();
        return taskHour === i;
      });

      const productivity = hourTasks.length > 0 ? Math.min(100, hourTasks.length * 20) : 0;

      return {
        hour: `${hour}:00`,
        productivity,
        tasks: hourTasks.length
      };
    });

    return hours.filter(h => h.tasks > 0); // Only return hours with activity
  }

  // ===== CONNECTION STATUS =====
  
  getConnectionStatus(): { isOnline: boolean; isSyncing: boolean } {
    return syncService.getConnectionStatus();
  }

  async getSyncStats(): Promise<{
    localTasks: number;
    pendingSync: number;
    lastSync?: string;
  }> {
    return await syncService.getSyncStats();
  }

  async forceSync(): Promise<void> {
    await syncService.forcSync();
  }

  // ===== OFFLINE UTILITIES =====
  
  async clearOfflineData(): Promise<void> {
    await offlineDb.clear();
  }

  async exportOfflineData(): Promise<{
    lightWorkTasks: OfflineLightWorkTask[];
    deepWorkTasks: OfflineDeepWorkTask[];
    stats: any;
  }> {
    const lightWorkTasks = await this.getLightWorkTasks();
    const deepWorkTasks = await this.getDeepWorkTasks();
    const stats = await this.getSyncStats();

    return {
      lightWorkTasks,
      deepWorkTasks,
      stats
    };
  }
}

// Export singleton instance
export const offlineLifelockApi = new OfflineLifeLockApi();