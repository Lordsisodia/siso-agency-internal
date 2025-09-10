/**
 * Hybrid LifeLock API - Seamless Online/Offline Integration
 * Automatically uses offline-first API while maintaining compatibility with existing code
 */

import { 
  fetchLifeLockProductivityMetrics,
  fetchLifeLockActivityHeatmap,
  fetchLifeLockHourlyPerformance,
  type LifeLockProductivityMetrics,
  type LifeLockHeatmapData,
  type LifeLockHourlyPerformance
} from './lifelockAnalyticsApi';

import { 
  offlineLifelockApi,
  type OfflineLightWorkTask,
  type OfflineDeepWorkTask
} from './offlineLifelockApi';

class HybridLifeLockApi {
  private useOfflineFirst = true; // Always use offline-first approach

  // ===== ANALYTICS API (Enhanced with offline support) =====
  
  async getProductivityMetrics(): Promise<LifeLockProductivityMetrics> {
    try {
      // Try offline analytics first (works with local data)
      if (this.useOfflineFirst) {
        return await offlineLifelockApi.fetchOfflineProductivityMetrics();
      }
      
      // Fallback to online analytics
      return await fetchLifeLockProductivityMetrics();
    } catch (error) {
      console.error('Failed to fetch productivity metrics:', error);
      // Always fallback to offline metrics
      return await offlineLifelockApi.fetchOfflineProductivityMetrics();
    }
  }

  async getActivityHeatmap(): Promise<LifeLockHeatmapData[]> {
    try {
      // Try offline heatmap first
      if (this.useOfflineFirst) {
        return await offlineLifelockApi.fetchOfflineActivityHeatmap();
      }
      
      // Fallback to online heatmap
      return await fetchLifeLockActivityHeatmap();
    } catch (error) {
      console.error('Failed to fetch activity heatmap:', error);
      // Always fallback to offline heatmap
      return await offlineLifelockApi.fetchOfflineActivityHeatmap();
    }
  }

  async getHourlyPerformance(): Promise<LifeLockHourlyPerformance[]> {
    try {
      // Try offline hourly performance first
      if (this.useOfflineFirst) {
        return await offlineLifelockApi.fetchOfflineHourlyPerformance();
      }
      
      // Fallback to online hourly performance
      return await fetchLifeLockHourlyPerformance();
    } catch (error) {
      console.error('Failed to fetch hourly performance:', error);
      // Always fallback to offline hourly performance
      return await offlineLifelockApi.fetchOfflineHourlyPerformance();
    }
  }

  // ===== TASK MANAGEMENT API (Offline-first) =====
  
  async getLightWorkTasks(date?: string): Promise<OfflineLightWorkTask[]> {
    return await offlineLifelockApi.getLightWorkTasks(date);
  }

  async getDeepWorkTasks(date?: string): Promise<OfflineDeepWorkTask[]> {
    return await offlineLifelockApi.getDeepWorkTasks(date);
  }

  async createLightWorkTask(task: Omit<OfflineLightWorkTask, 'id' | 'created_at' | 'updated_at'>): Promise<OfflineLightWorkTask> {
    return await offlineLifelockApi.createLightWorkTask(task);
  }

  async createDeepWorkTask(task: Omit<OfflineDeepWorkTask, 'id' | 'created_at' | 'updated_at'>): Promise<OfflineDeepWorkTask> {
    return await offlineLifelockApi.createDeepWorkTask(task);
  }

  async updateLightWorkTask(task: OfflineLightWorkTask): Promise<void> {
    return await offlineLifelockApi.updateLightWorkTask(task);
  }

  async updateDeepWorkTask(task: OfflineDeepWorkTask): Promise<void> {
    return await offlineLifelockApi.updateDeepWorkTask(task);
  }

  async toggleTaskCompletion(taskId: string, taskType: 'light' | 'deep'): Promise<void> {
    return await offlineLifelockApi.toggleTaskCompletion(taskId, taskType);
  }

  async deleteTask(taskId: string, taskType: 'light' | 'deep'): Promise<void> {
    return await offlineLifelockApi.deleteTask(taskId, taskType);
  }

  // ===== CONNECTION STATUS API =====
  
  getConnectionStatus() {
    return offlineLifelockApi.getConnectionStatus();
  }

  async getSyncStats() {
    return await offlineLifelockApi.getSyncStats();
  }

  async forceSync(): Promise<void> {
    return await offlineLifelockApi.forceSync();
  }

  // ===== OFFLINE UTILITIES =====
  
  async clearOfflineData(): Promise<void> {
    return await offlineLifelockApi.clearOfflineData();
  }

  async exportOfflineData() {
    return await offlineLifelockApi.exportOfflineData();
  }

  // ===== CONFIGURATION =====
  
  setOfflineFirst(enabled: boolean): void {
    this.useOfflineFirst = enabled;
    console.log(`🔄 Hybrid API mode: ${enabled ? 'Offline-First' : 'Online-First'}`);
  }

  isOfflineFirst(): boolean {
    return this.useOfflineFirst;
  }

  // ===== COMPATIBILITY HELPERS =====
  
  // Convert offline tasks to format expected by existing components
  formatTasksForLegacyComponents(tasks: (OfflineLightWorkTask | OfflineDeepWorkTask)[]): any[] {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      estimatedDuration: task.estimated_duration,
      actualDuration: task.actual_duration_min,
      xpReward: task.xp_reward,
      difficulty: task.difficulty,
      complexity: task.complexity,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      // Offline-specific fields
      offlineId: task._offline_id,
      needsSync: task._needs_sync,
      syncStatus: task._sync_status
    }));
  }

  // Get aggregated data for dashboard (combines light + deep work)
  async getAllTasksForDate(date?: string): Promise<{
    lightWork: OfflineLightWorkTask[];
    deepWork: OfflineDeepWorkTask[];
    combined: (OfflineLightWorkTask | OfflineDeepWorkTask)[];
  }> {
    const [lightWork, deepWork] = await Promise.all([
      this.getLightWorkTasks(date),
      this.getDeepWorkTasks(date)
    ]);

    return {
      lightWork,
      deepWork,
      combined: [...lightWork, ...deepWork]
    };
  }

  // Get task statistics for the date
  async getTaskStatsForDate(date?: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    totalXP: number;
    earnedXP: number;
    needsSync: number;
  }> {
    const { combined } = await this.getAllTasksForDate(date);
    
    const completed = combined.filter(t => t.completed);
    const totalXP = combined.reduce((sum, t) => sum + (t.xp_reward || 0), 0);
    const earnedXP = completed.reduce((sum, t) => sum + (t.xp_reward || 0), 0);
    const needsSync = combined.filter(t => t._needs_sync).length;

    return {
      total: combined.length,
      completed: completed.length,
      pending: combined.length - completed.length,
      completionRate: combined.length > 0 ? (completed.length / combined.length) * 100 : 0,
      totalXP,
      earnedXP,
      needsSync
    };
  }
}

// Export singleton instance
export const hybridLifelockApi = new HybridLifeLockApi();

// Export types for convenience
export type {
  OfflineLightWorkTask,
  OfflineDeepWorkTask,
  LifeLockProductivityMetrics,
  LifeLockHeatmapData,
  LifeLockHourlyPerformance
} from './offlineLifelockApi';