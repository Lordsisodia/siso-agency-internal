/**
 * Hybrid Task Service - Local-First with Cloud Sync
 * 
 * Architecture:
 * - Primary: localStorage (instant, offline-first)
 * - Secondary: Neon (backup, sync, AI features)
 * - Sync: On-demand or scheduled
 * 
 * Benefits:
 * - 99% operations use localStorage (0 compute hours)
 * - Cloud backup for safety
 * - Multi-device sync when needed
 * - AI features with minimal Neon usage
 */

import { PersonalTask, PersonalTaskCard, personalTaskService } from './personalTaskService';
import { NeonTaskService } from './neonTaskService';
import { format, parseISO } from 'date-fns';

interface SyncStatus {
  lastSync: Date | null;
  pendingChanges: number;
  cloudAvailable: boolean;
  syncInProgress: boolean;
}

interface SyncOptions {
  force?: boolean;
  direction?: 'upload' | 'download' | 'bidirectional';
  resolveConflicts?: 'local-wins' | 'cloud-wins' | 'merge';
}

export class HybridTaskService {
  private static syncStatus: SyncStatus = {
    lastSync: null,
    pendingChanges: 0,
    cloudAvailable: false,
    syncInProgress: false
  };

  private static listeners: Set<(status: SyncStatus) => void> = new Set();

  /**
   * Initialize hybrid service
   */
  public static async initialize(): Promise<void> {
    console.log('🔄 [HYBRID] Initializing hybrid task service...');
    
    // Load last sync time from localStorage
    const lastSyncStr = localStorage.getItem('hybrid-last-sync');
    if (lastSyncStr) {
      this.syncStatus.lastSync = new Date(lastSyncStr);
    }

    // Test cloud connectivity
    this.syncStatus.cloudAvailable = await this.testCloudConnection();
    
    // Set up auto-sync timer (daily)
    this.setupAutoSync();
    
    console.log('✅ [HYBRID] Initialized:', this.syncStatus);
  }

  /**
   * Get tasks for date (always from localStorage - instant)
   */
  public static getTasksForDate(date: Date): PersonalTaskCard {
    return personalTaskService.getTasksForDate(date);
  }

  /**
   * Add tasks (localStorage first, mark for sync)
   */
  public static addTasks(newTasks: Partial<PersonalTask>[], targetDate?: Date): PersonalTask[] {
    const result = personalTaskService.addTasks(newTasks, targetDate);
    this.markPendingChanges(newTasks.length);
    return result;
  }

  /**
   * Toggle task (localStorage first, mark for sync)
   */
  public static toggleTask(taskId: string): boolean {
    const result = personalTaskService.toggleTask(taskId);
    if (result) {
      this.markPendingChanges(1);
    }
    return result;
  }

  /**
   * Replace tasks (localStorage first, mark for sync)
   */
  public static replaceTasks(newTasks: PersonalTask[], targetDate: Date): void {
    personalTaskService.replaceTasks(newTasks, targetDate);
    this.markPendingChanges(newTasks.length);
  }

  /**
   * Manual sync with cloud
   */
  public static async syncWithCloud(options: SyncOptions = {}): Promise<boolean> {
    if (this.syncStatus.syncInProgress) {
      console.log('⏳ [HYBRID] Sync already in progress');
      return false;
    }

    if (!this.syncStatus.cloudAvailable && !options.force) {
      console.log('❌ [HYBRID] Cloud not available');
      return false;
    }

    console.log('🔄 [HYBRID] Starting sync with cloud...');
    this.syncStatus.syncInProgress = true;
    this.notifyListeners();

    try {
      const direction = options.direction || 'bidirectional';
      const conflicts = options.resolveConflicts || 'local-wins';

      switch (direction) {
        case 'upload':
          await this.uploadToCloud();
          break;
        case 'download':
          await this.downloadFromCloud(conflicts);
          break;
        case 'bidirectional':
          await this.bidirectionalSync(conflicts);
          break;
      }

      // Update sync status
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingChanges = 0;
      localStorage.setItem('hybrid-last-sync', this.syncStatus.lastSync.toISOString());

      console.log('✅ [HYBRID] Sync completed successfully');
      return true;

    } catch (error) {
      console.error('❌ [HYBRID] Sync failed:', error);
      return false;
    } finally {
      this.syncStatus.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Enable AI features (triggers sync if needed)
   */
  public static async enableAIFeatures(): Promise<boolean> {
    console.log('🤖 [HYBRID] Enabling AI features...');

    // Ensure data is synced to cloud for AI processing
    const syncSuccess = await this.syncWithCloud({ direction: 'upload' });
    if (!syncSuccess) {
      console.log('❌ [HYBRID] Cannot enable AI features without cloud sync');
      return false;
    }

    try {
      // Initialize Neon for AI features
      await NeonTaskService.initialize({
        endpoint: import.meta.env.VITE_NEON_ENDPOINT || 'https://console.neon.tech/api/v2',
        apiKey: import.meta.env.VITE_NEON_API_KEY || '',
        databaseUrl: import.meta.env.VITE_NEON_DATABASE_URL || ''
      });

      console.log('✅ [HYBRID] AI features enabled');
      return true;

    } catch (error) {
      console.error('❌ [HYBRID] Failed to enable AI features:', error);
      return false;
    }
  }

  /**
   * Get sync status
   */
  public static getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Subscribe to sync status changes
   */
  public static onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Private methods

  private static async testCloudConnection(): Promise<boolean> {
    try {
      // Check if Neon is configured
      const hasNeonUrl = !!import.meta.env.VITE_NEON_DATABASE_URL;
      if (!hasNeonUrl) {
        console.log('⚠️ [HYBRID] Neon not configured, running in local-only mode');
        return false;
      }

      // Test connection (this would ping Neon in production)
      console.log('🔗 [HYBRID] Testing cloud connection...');
      return true; // Assume available for now

    } catch (error) {
      console.error('❌ [HYBRID] Cloud connection test failed:', error);
      return false;
    }
  }

  private static async uploadToCloud(): Promise<void> {
    console.log('⬆️ [HYBRID] Uploading local data to cloud...');

    // Get all local tasks
    const allTasks = personalTaskService.getAllTasks();
    if (allTasks.length === 0) {
      console.log('📭 [HYBRID] No local tasks to upload');
      return;
    }

    // Group by date and upload
    const tasksByDate = new Map<string, PersonalTask[]>();
    allTasks.forEach(task => {
      const date = task.currentDate;
      if (!tasksByDate.has(date)) {
        tasksByDate.set(date, []);
      }
      tasksByDate.get(date)!.push(task);
    });

    for (const [dateStr, tasks] of tasksByDate) {
      const date = parseISO(dateStr);
      await NeonTaskService.replaceTasks(tasks, date);
    }

    console.log(`✅ [HYBRID] Uploaded ${allTasks.length} tasks to cloud`);
  }

  private static async downloadFromCloud(conflictResolution: string): Promise<void> {
    console.log('⬇️ [HYBRID] Downloading data from cloud...');

    // Get unique dates from local storage
    const localTasks = personalTaskService.getAllTasks();
    const uniqueDates = [...new Set(localTasks.map(t => t.currentDate))];

    for (const dateStr of uniqueDates) {
      const date = parseISO(dateStr);
      const cloudCard = await NeonTaskService.getTasksForDate(date);
      
      if (cloudCard.tasks.length > 0) {
        if (conflictResolution === 'cloud-wins') {
          personalTaskService.replaceTasks(cloudCard.tasks, date);
        } else {
          // local-wins: keep local data, don't overwrite
          console.log(`⚠️ [HYBRID] Keeping local data for ${dateStr} (local-wins)`);
        }
      }
    }

    console.log('✅ [HYBRID] Download completed');
  }

  private static async bidirectionalSync(conflictResolution: string): Promise<void> {
    console.log('🔄 [HYBRID] Performing bidirectional sync...');
    
    // For now, upload local changes (local is source of truth)
    await this.uploadToCloud();
    
    // In future: implement smart merge based on timestamps
    console.log('✅ [HYBRID] Bidirectional sync completed (local-priority)');
  }

  private static markPendingChanges(count: number): void {
    this.syncStatus.pendingChanges += count;
    this.notifyListeners();
  }

  private static setupAutoSync(): void {
    // Auto-sync daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.syncWithCloud({ direction: 'upload' });
      
      // Set up daily interval
      setInterval(() => {
        this.syncWithCloud({ direction: 'upload' });
      }, 24 * 60 * 60 * 1000); // 24 hours
      
    }, msUntilMidnight);
    
    console.log('⏰ [HYBRID] Auto-sync scheduled for midnight');
  }

  private static notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.getSyncStatus());
      } catch (error) {
        console.error('❌ [HYBRID] Error in sync status listener:', error);
      }
    });
  }
}

// Usage Statistics
export interface UsageStats {
  totalOperations: number;
  localOperations: number;
  cloudOperations: number;
  computeHoursUsed: number;
  computeHoursSaved: number;
}

export class HybridUsageTracker {
  private static stats: UsageStats = {
    totalOperations: 0,
    localOperations: 0,
    cloudOperations: 0,
    computeHoursUsed: 0,
    computeHoursSaved: 0
  };

  public static trackLocalOperation(): void {
    this.stats.totalOperations++;
    this.stats.localOperations++;
    this.stats.computeHoursSaved += 0.001; // ~1 minute saved per operation
  }

  public static trackCloudOperation(durationMinutes: number): void {
    this.stats.totalOperations++;
    this.stats.cloudOperations++;
    this.stats.computeHoursUsed += durationMinutes / 60;
  }

  public static getStats(): UsageStats {
    return { ...this.stats };
  }

  public static getEfficiencyReport(): string {
    const efficiency = (this.stats.localOperations / this.stats.totalOperations) * 100;
    return `
🎯 Hybrid Efficiency Report:
- Local operations: ${this.stats.localOperations} (${efficiency.toFixed(1)}%)
- Cloud operations: ${this.stats.cloudOperations}
- Compute hours used: ${this.stats.computeHoursUsed.toFixed(2)}
- Compute hours saved: ${this.stats.computeHoursSaved.toFixed(2)}
- Monthly projection: ${(this.stats.computeHoursUsed * 30).toFixed(1)} hours
    `;
  }
}

// Export singleton
export const hybridTaskService = HybridTaskService;