/**
 * Subtab Completion Sync Service
 *
 * Syncs subtab completion state with Supabase backend
 * Uses direct Supabase client calls instead of API endpoints
 */

import { format } from 'date-fns';
import { supabaseAnon } from '@/lib/services/supabase/clerk-integration';

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
   * Process the sync queue using direct Supabase calls
   */
  private async processSyncQueue(): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: true }; // Already syncing
    }

    this.isSyncing = true;

    try {
      for (const [key, record] of this.syncQueue.entries()) {
        try {
          // Use direct Supabase upsert instead of API call
          const { error } = await supabaseAnon
            .from('subtab_completions')
            .upsert({
              user_id: record.user_id,
              date: record.date,
              subtab_id: record.subtab_id,
              completed: record.completed,
              completed_at: record.completed_at,
              updated_at: record.updated_at,
            }, {
              onConflict: 'user_id,date,subtab_id'
            });

          if (error) {
            // Table might not exist yet - log and continue
            if (error.code === '42P01') {
              console.debug('subtab_completions table does not exist yet');
            } else {
              console.error(`Failed to sync subtab completion for ${key}:`, error);
            }
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
   * Fetch all completion records for a specific date using direct Supabase query
   */
  async fetchCompletions(
    userId: string,
    date: Date
  ): Promise<Record<string, boolean>> {
    const dateKey = format(date, 'yyyy-MM-dd');

    try {
      const { data, error } = await supabaseAnon
        .from('subtab_completions')
        .select('subtab_id, completed')
        .eq('user_id', userId)
        .eq('date', dateKey);

      if (error) {
        // Table might not exist yet - return empty
        if (error.code === '42P01') {
          if (import.meta.env.DEV) {
            console.debug('subtab_completions table does not exist yet, using local state');
          }
        } else {
          console.error('Failed to fetch subtab completions:', error);
        }
        return {};
      }

      // Convert to record of subtab_id -> completed
      const completions: Record<string, boolean> = {};
      data?.forEach(record => {
        completions[record.subtab_id] = record.completed;
      });

      return completions;
    } catch (error) {
      // Network error or other issue - fall back to local state
      if (import.meta.env.DEV) {
        console.debug('Subtab completion fetch error, using local state');
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
