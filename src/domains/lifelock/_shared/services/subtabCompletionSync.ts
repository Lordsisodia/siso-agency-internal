/**
 * Subtab Completion Sync Service
 *
 * Syncs subtab completion state with Supabase backend
 */

import { format } from 'date-fns';

export interface SubtabCompletionRecord {
  user_id: string;
  date: string;
  subtab_id: string;
  completed: boolean;
  completed_at?: string;
  updated_at: string;
}

class SubtabCompletionSyncService {
  private syncQueue: Map<string, SubtabCompletionRecord> = new Map();
  private isSyncing: boolean = false;

  /**
   * Generate a unique key for a record
   */
  private getRecordKey(userId: string, date: string, subtabId: string): string {
    return `${userId}-${date}-${subtabId}`;
  }

  /**
   * Sync a completion record to the backend
   */
  async syncCompletion(
    userId: string,
    date: Date,
    subtabId: string,
    completed: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const dateKey = format(date, 'yyyy-MM-dd');

    const record: SubtabCompletionRecord = {
      user_id: userId,
      date: dateKey,
      subtab_id: subtabId,
      completed,
      completed_at: completed ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    };

    // Add to sync queue
    const key = this.getRecordKey(userId, dateKey, subtabId);
    this.syncQueue.set(key, record);

    // Process sync queue
    return this.processSyncQueue();
  }

  /**
   * Process the sync queue
   */
  private async processSyncQueue(): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: true }; // Already syncing
    }

    this.isSyncing = true;

    try {
      for (const [key, record] of this.syncQueue.entries()) {
        try {
          const response = await fetch('/api/subtab-completion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
          });

          if (!response.ok) {
            console.error(`Failed to sync subtab completion for ${key}:`, response.statusText);
            continue;
          }

          // Remove from queue on success
          this.syncQueue.delete(key);
        } catch (error) {
          console.error(`Error syncing subtab completion for ${key}:`, error);
        }
      }

      return { success: true };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetch all completion records for a specific date
   */
  async fetchCompletions(
    userId: string,
    date: Date
  ): Promise<Record<string, boolean>> {
    const dateKey = format(date, 'yyyy-MM-dd');

    try {
      const response = await fetch(
        `/api/subtab-completion?userId=${userId}&date=${dateKey}`
      );

      if (!response.ok) {
        // API endpoint not available yet - use local storage only
        if (import.meta.env.DEV) {
          console.debug('Subtab completion API not available, using local state');
        }
        return {};
      }

      const data: SubtabCompletionRecord[] = await response.json();

      // Convert to record of subtab_id -> completed
      const completions: Record<string, boolean> = {};
      data.forEach(record => {
        completions[record.subtab_id] = record.completed;
      });

      return completions;
    } catch (error) {
      // Network error or API not available - fall back to local state
      if (import.meta.env.DEV) {
        console.debug('Subtab completion sync error, using local state');
      }
      return {};
    }
  }

  /**
   * Force sync all pending items
   */
  async forceSync(): Promise<{ success: boolean; error?: string }> {
    return this.processSyncQueue();
  }
}

// Export singleton instance
export const subtabCompletionSyncService = new SubtabCompletionSyncService();
