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
  winOfDay?: string; // NEW: Biggest win of the day
  mood?: string; // NEW: Quick mood selector
  bedTime?: string; // ✅ FIXED: Bedtime tracking
  wentWell?: string[];
  evenBetterIf?: string[];
  dailyAnalysis?: string;
  actionItems?: string;
  overallRating?: number;
  energyLevel?: number; // NEW: Energy rating 1-10
  keyLearnings?: string;
  tomorrowFocus?: string;
  tomorrowTopTasks?: string[]; // NEW: Top 3 specific tasks
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
  type?: 'DEEP_WORK' | 'LIGHT_WORK' | 'BREAK' | 'MEETING'; // This maps to 'category' in the API
  category?: string; // Alias for compatibility
  task_ids?: string[]; // Database uses array
  task_id?: string; // API uses single string
  created_at?: string;
  updated_at?: string;
}

// ===== UNIFIED DATA SERVICE =====
class UnifiedDataService {
  private isOnline(): boolean {
    return navigator.onLine;
  }

  private transformSupabaseReflection(data: any): DailyReflection {
    return {
      id: data.id,
      user_id: data.user_id,
      date: data.date,
      winOfDay: data.win_of_day || '',
      mood: data.mood || '',
      bedTime: data.bed_time || '', // ✅ FIXED: Transform bed_time from DB
      wentWell: data.went_well || [],
      evenBetterIf: data.even_better_if || [],
      dailyAnalysis: data.daily_analysis || '',
      actionItems: data.action_items || '',
      overallRating: data.overall_rating,
      energyLevel: data.energy_level,
      keyLearnings: data.key_learnings || '',
      tomorrowFocus: data.tomorrow_focus || '',
      tomorrowTopTasks: data.tomorrow_top_tasks || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  // ===== DAILY REFLECTIONS =====
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | null> {
    const reflections = await this.getDailyReflectionsBatch(userId, [date]);
    return reflections[date] ?? null;
  }

  async getDailyReflectionsBatch(userId: string, dates: string[]): Promise<Record<string, DailyReflection | null>> {
    const uniqueDates = Array.from(new Set(dates.filter(Boolean)));
    if (uniqueDates.length === 0) return {};

    const results: Record<string, DailyReflection | null> = {};
    const missingDates: string[] = [];

    for (const date of uniqueDates) {
      try {
        const key = `reflection:${userId}:${date}`;
        const local = await offlineDb.getSetting(key);
        if (local) {
          results[date] = local;
        } else {
          missingDates.push(date);
        }
      } catch (error) {
        console.warn('Failed to get local reflection:', error);
        missingDates.push(date);
      }
    }

    if (missingDates.length > 0 && this.isOnline()) {
      try {
        const { data, error } = await supabaseAnon
          .from('daily_reflections')
          .select('*')
          .eq('user_id', userId)
          .in('date', missingDates);

        if (!error && data) {
          for (const record of data) {
            const appRecord = this.transformSupabaseReflection(record);
            results[appRecord.date] = appRecord;

            const key = `reflection:${userId}:${appRecord.date}`;
            await offlineDb.setSetting(key, appRecord);
          }
        }
      } catch (error) {
        console.warn('Failed to get Supabase reflections batch:', error);
      }
    }

    for (const date of uniqueDates) {
      if (!(date in results)) {
        results[date] = null;
      }
    }

    return results;
  }

  async saveDailyReflection(reflection: DailyReflection): Promise<void> {
    const key = `reflection:${reflection.user_id}:${reflection.date}`;

    // Always save locally first
    await offlineDb.setSetting(key, {
      ...reflection,
      updated_at: new Date().toISOString()
    });

    // Transform camelCase to snake_case for Supabase
    const dbRecord = {
      user_id: reflection.user_id,
      date: reflection.date,
      win_of_day: reflection.winOfDay || '',
      mood: reflection.mood || '',
      bed_time: reflection.bedTime || null, // ✅ FIXED: Transform bedTime to bed_time for DB
      went_well: reflection.wentWell || [],
      even_better_if: reflection.evenBetterIf || [],
      daily_analysis: reflection.dailyAnalysis || '',
      action_items: reflection.actionItems || '',
      overall_rating: reflection.overallRating,
      energy_level: reflection.energyLevel,
      key_learnings: reflection.keyLearnings || '',
      tomorrow_focus: reflection.tomorrowFocus || '',
      tomorrow_top_tasks: reflection.tomorrowTopTasks || [],
      updated_at: new Date().toISOString()
    };

    // If online, sync to Supabase
    if (this.isOnline()) {
      try {
        console.log('🚀 Syncing to Supabase:', {
          date: dbRecord.date,
          fields: Object.keys(dbRecord).filter(k => {
            const val = dbRecord[k as keyof typeof dbRecord];
            return val !== null && val !== '' && (!Array.isArray(val) || val.length > 0);
          })
        });

        const { error, data } = await supabaseAnon
          .from('daily_reflections')
          .upsert(dbRecord, { onConflict: 'user_id,date' })
          .select();

        if (error) {
          console.error('❌ Failed to sync reflection to Supabase:', error);
          // Queue for later sync
          await this.queueForSync('daily_reflections', 'upsert', dbRecord);
        } else {
          console.log('✅ Successfully saved to Supabase:', data);
        }
      } catch (error) {
        console.error('❌ Supabase sync error:', error);
        await this.queueForSync('daily_reflections', 'upsert', dbRecord);
      }
    } else {
      console.log('📴 Offline - queuing for later sync');
      // Queue for later sync
      await this.queueForSync('daily_reflections', 'upsert', dbRecord);
    }
  }

  // ===== TIME BLOCKS =====
  async getTimeBlocks(userId: string, date: string): Promise<TimeBlock[]> {
    // Try local first
    try {
      const key = `timeblocks:${userId}:${date}`;
      const local = await offlineDb.getSetting(key);
      if (local && Array.isArray(local)) {
        console.log('📦 Loaded time blocks from cache:', local.length);
        return local;
      }
    } catch (error) {
      console.warn('Failed to get local timeblocks:', error);
    }

    // If online, try Supabase
    if (this.isOnline()) {
      try {
        console.log('🌐 Fetching time blocks from Supabase...');
        const { data, error } = await supabaseAnon
          .from('time_blocks')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .order('start_time', { ascending: true });

        if (!error && data) {
          console.log('✅ Fetched time blocks from Supabase:', data.length);
          // Cache locally
          const key = `timeblocks:${userId}:${date}`;
          await offlineDb.setSetting(key, data);
          return data;
        } else if (error) {
          console.warn('⚠️ Supabase fetch error:', error);
        }
      } catch (error) {
        console.warn('Failed to get Supabase timeblocks:', error);
      }
    }

    return [];
  }

  async saveTimeBlock(timeBlock: TimeBlock): Promise<void> {
    // Map category to database type format
    const categoryToTypeMap: Record<string, string> = {
      'DEEP_WORK': 'deep_focus',
      'LIGHT_WORK': 'light_focus',
      'MEETING': 'meeting',
      'BREAK': 'break',
      'PERSONAL': 'personal',
      'HEALTH': 'health',
      'LEARNING': 'learning',
      'ADMIN': 'admin'
    };

    const dbType = categoryToTypeMap[timeBlock.category || ''] || timeBlock.type || 'work';

    // Validate UUID format for task_ids (database expects uuid[])
    const isValidUUID = (str: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Filter task_ids to only include valid UUIDs
    let validTaskIds: string[] = [];
    if (timeBlock.task_id && isValidUUID(timeBlock.task_id)) {
      validTaskIds = [timeBlock.task_id];
    } else if (Array.isArray(timeBlock.task_ids)) {
      validTaskIds = timeBlock.task_ids.filter(isValidUUID);
    }

    // Map API fields to database schema
    const dbRecord = {
      id: timeBlock.id,
      user_id: timeBlock.user_id,
      date: timeBlock.date,
      start_time: timeBlock.start_time,
      end_time: timeBlock.end_time,
      title: timeBlock.title,
      description: timeBlock.description,
      type: dbType, // Map 'category' to database type format
      task_ids: validTaskIds, // Only valid UUIDs
      created_at: timeBlock.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Always save to local cache using date-based key for easy retrieval
    const cacheKey = `timeblocks:${timeBlock.user_id}:${timeBlock.date}`;
    const existingBlocks = await this.getTimeBlocks(timeBlock.user_id, timeBlock.date);
    
    // Update or add the block
    const updatedBlocks = existingBlocks.filter(b => b.id !== timeBlock.id);
    updatedBlocks.push(dbRecord);
    await offlineDb.setSetting(cacheKey, updatedBlocks);

    console.log('💾 Saving time block to Supabase:', {
      title: dbRecord.title,
      userId: dbRecord.user_id,
      type: dbRecord.type,
      taskIds: dbRecord.task_ids
    });

    // If online, sync to Supabase
    if (this.isOnline()) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .upsert(dbRecord);

        if (error) {
          console.warn('❌ Failed to sync timeblock to Supabase:', error);
          await this.queueForSync('time_blocks', 'upsert', dbRecord);
        } else {
          console.log('✅ Time block synced to Supabase:', timeBlock.title);
        }
      } catch (error) {
        console.warn('❌ Supabase sync error:', error);
        await this.queueForSync('time_blocks', 'upsert', dbRecord);
      }
    } else {
      console.log('📴 Offline - queued for sync');
      await this.queueForSync('time_blocks', 'upsert', dbRecord);
    }
  }

  async updateTimeBlock(userId: string, date: string, id: string, updates: Partial<TimeBlock>): Promise<void> {
    console.log('📝 Updating time block:', id, updates);

    // Get existing blocks for this date
    const existingBlocks = await this.getTimeBlocks(userId, date);
    const blockIndex = existingBlocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) {
      throw new Error('Time block not found');
    }

    // Merge updates
    const updatedBlock = {
      ...existingBlocks[blockIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Map category to database type format
    const categoryToTypeMap: Record<string, string> = {
      'DEEP_WORK': 'deep_focus',
      'LIGHT_WORK': 'light_focus',
      'MEETING': 'meeting',
      'BREAK': 'break',
      'PERSONAL': 'personal',
      'HEALTH': 'health',
      'LEARNING': 'learning',
      'ADMIN': 'admin'
    };

    const dbType = updates.category ? categoryToTypeMap[updates.category] : (updatedBlock.type || 'work');

    // Validate UUID format for task_ids
    const isValidUUID = (str: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Filter task_ids to only include valid UUIDs
    let validTaskIds: string[] = [];
    if (updates.task_id && isValidUUID(updates.task_id)) {
      validTaskIds = [updates.task_id];
    } else if (Array.isArray(updatedBlock.task_ids)) {
      validTaskIds = updatedBlock.task_ids.filter(isValidUUID);
    }

    // Map to database schema
    const dbRecord = {
      id: updatedBlock.id,
      user_id: updatedBlock.user_id,
      date: updatedBlock.date,
      start_time: updates.start_time || updatedBlock.start_time,
      end_time: updates.end_time || updatedBlock.end_time,
      title: updates.title || updatedBlock.title,
      description: updates.description !== undefined ? updates.description : updatedBlock.description,
      type: dbType,
      task_ids: validTaskIds, // Only valid UUIDs
      updated_at: updatedBlock.updated_at
    };

    // Update local cache
    const cacheKey = `timeblocks:${userId}:${date}`;
    existingBlocks[blockIndex] = dbRecord;
    await offlineDb.setSetting(cacheKey, existingBlocks);

    // Sync to Supabase if online
    if (this.isOnline()) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .update(dbRecord)
          .eq('id', id);

        if (error) {
          console.warn('❌ Failed to update in Supabase:', error);
          await this.queueForSync('time_blocks', 'update', { id, data: dbRecord });
        } else {
          console.log('✅ Time block updated in Supabase');
        }
      } catch (error) {
        console.warn('❌ Supabase update error:', error);
        await this.queueForSync('time_blocks', 'update', { id, data: dbRecord });
      }
    }
  }

  async deleteTimeBlock(id: string): Promise<void> {
    console.log('🗑️ Deleting time block:', id);

    // Remove from all local caches (we need to find which date it belongs to)
    // For now, we'll just try to delete from Supabase and invalidate all caches
    
    // If online, delete from Supabase
    if (this.isOnline()) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('❌ Failed to delete from Supabase:', error);
        } else {
          console.log('✅ Time block deleted from Supabase');
        }
      } catch (error) {
        console.warn('❌ Supabase delete error:', error);
      }
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
