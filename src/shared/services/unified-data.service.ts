/**
 * 🚀 Unified Data Service - Offline-First Architecture
 *
 * ARCHITECTURE:
 * 1. IndexedDB (offlineDb) - Single source of truth for all local data
 * 2. Supabase - Cloud sync when online
 * 3. Auto-sync via offlineManager
 *
 * NO PRISMA - Browser-native only!
 */

import { offlineDb } from '@/shared/offline/offlineDb';
import { supabaseAnon } from '@/shared/lib/supabase-clerk';
import { offlineManager } from '@/shared/services/offlineManager';

// ===== TYPES =====
export interface DailyReflection {
  id?: string;
  user_id: string;
  date: string;
  wentWell?: string[];
  evenBetterIf?: string[];
  dailyAnalysis?: string;
  actionItems?: string;
  overallRating?: number;
  keyLearnings?: string;
  tomorrowFocus?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeBlock {
  id?: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  type?: 'DEEP_WORK' | 'LIGHT_WORK' | 'BREAK' | 'MEETING';
  task_id?: string;
  created_at?: string;
  updated_at?: string;
}

// ===== UNIFIED DATA SERVICE =====
class UnifiedDataService {
  private isOnline(): boolean {
    return navigator.onLine;
  }

  // ===== DAILY REFLECTIONS =====
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | null> {
    // Try local first
    try {
      const key = `reflection:${userId}:${date}`;
      const local = await offlineDb.getSetting(key);
      if (local) return local;
    } catch (error) {
      console.warn('Failed to get local reflection:', error);
    }

    // If online, try Supabase
    if (this.isOnline()) {
      try {
        const { data, error } = await supabaseAnon
          .from('daily_reflections')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .maybeSingle(); // ✅ FIX: Use maybeSingle() instead of single() to handle no records gracefully

        if (!error && data) {
          // Cache locally
          const key = `reflection:${userId}:${date}`;
          await offlineDb.setSetting(key, data);
          return data;
        }
      } catch (error) {
        console.warn('Failed to get Supabase reflection:', error);
      }
    }

    return null;
  }

  async saveDailyReflection(reflection: DailyReflection): Promise<void> {
    const key = `reflection:${reflection.user_id}:${reflection.date}`;

    // Always save locally first
    await offlineDb.setSetting(key, {
      ...reflection,
      updated_at: new Date().toISOString()
    });

    // If online, sync to Supabase
    if (this.isOnline()) {
      try {
        const { error } = await supabaseAnon
          .from('daily_reflections')
          .upsert(reflection, { onConflict: 'user_id,date' });

        if (error) {
          console.warn('Failed to sync reflection to Supabase:', error);
          // Queue for later sync
          await this.queueForSync('daily_reflections', 'upsert', reflection);
        }
      } catch (error) {
        console.warn('Supabase sync error:', error);
        await this.queueForSync('daily_reflections', 'upsert', reflection);
      }
    } else {
      // Queue for later sync
      await this.queueForSync('daily_reflections', 'upsert', reflection);
    }
  }

  // ===== TIME BLOCKS =====
  async getTimeBlocks(userId: string, date: string): Promise<TimeBlock[]> {
    // Try local first
    try {
      const key = `timeblocks:${userId}:${date}`;
      const local = await offlineDb.getSetting(key);
      if (local) return local;
    } catch (error) {
      console.warn('Failed to get local timeblocks:', error);
    }

    // If online, try Supabase
    if (this.isOnline()) {
      try {
        const { data, error } = await supabaseAnon
          .from('time_blocks')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date);

        if (!error && data) {
          // Cache locally
          const key = `timeblocks:${userId}:${date}`;
          await offlineDb.setSetting(key, data);
          return data;
        }
      } catch (error) {
        console.warn('Failed to get Supabase timeblocks:', error);
      }
    }

    return [];
  }

  async saveTimeBlock(timeBlock: TimeBlock): Promise<void> {
    const key = `timeblock:${timeBlock.id || Date.now()}`;

    // Always save locally first
    await offlineDb.setSetting(key, {
      ...timeBlock,
      updated_at: new Date().toISOString()
    });

    // If online, sync to Supabase
    if (this.isOnline()) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .upsert(timeBlock);

        if (error) {
          console.warn('Failed to sync timeblock to Supabase:', error);
          await this.queueForSync('time_blocks', 'upsert', timeBlock);
        }
      } catch (error) {
        console.warn('Supabase sync error:', error);
        await this.queueForSync('time_blocks', 'upsert', timeBlock);
      }
    } else {
      await this.queueForSync('time_blocks', 'upsert', timeBlock);
    }
  }

  // ===== SYNC QUEUE =====
  private async queueForSync(table: string, action: string, data: any): Promise<void> {
    const queueKey = `sync_queue:${Date.now()}`;
    await offlineDb.setSetting(queueKey, {
      table,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // ===== SYNC OPERATIONS =====
  async syncAll(userId: string): Promise<void> {
    if (!this.isOnline()) {
      console.log('⚠️ Offline - skipping sync');
      return;
    }

    console.log('🔄 Starting full sync...');

    // Get all queued sync operations
    const allSettings = await this.getAllSettings();
    const syncQueue = allSettings.filter(s => s.key.startsWith('sync_queue:'));

    for (const item of syncQueue) {
      try {
        const { table, action, data } = item.value;

        if (action === 'upsert') {
          const { error } = await supabaseAnon.from(table).upsert(data);
          if (!error) {
            // Remove from queue on success
            await offlineDb.setSetting(item.key, null);
          }
        }
      } catch (error) {
        console.warn('Sync failed for item:', item.key, error);
      }
    }

    console.log('✅ Sync complete');
  }

  private async getAllSettings(): Promise<Array<{ key: string; value: any }>> {
    // This is a helper - you'll need to implement proper settings enumeration
    // For now, return empty array
    return [];
  }
}

// Export singleton
export const unifiedDataService = new UnifiedDataService();
