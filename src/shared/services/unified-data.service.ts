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

export interface MorningRoutineItem {
  name: string;
  completed: boolean;
  [key: string]: any;
}

export interface MorningRoutineMetadata {
  wakeUpTime?: string;
  waterAmount?: number;
  meditationDuration?: string;
  dailyPriorities?: string[];
  isPlanDayComplete?: boolean;
  pushupReps?: number;
  pushupPB?: number;
  [key: string]: any;
}

export interface MorningRoutine {
  id: string;
  userId: string;
  date: string;
  routineType: string;
  items: MorningRoutineItem[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  metadata: MorningRoutineMetadata;
  createdAt: string;
  updatedAt: string;
}

// ===== UNIFIED DATA SERVICE =====
class UnifiedDataService {
  private isOnline(): boolean {
    return navigator.onLine;
  }

  private createMorningRoutineId(userId: string, date: string): string {
    return `morning-${userId}-${date}`;
  }

  private transformMorningRoutineRecord(record: any): MorningRoutine {
    const items: MorningRoutineItem[] = Array.isArray(record?.items)
      ? record.items.map((item: any) => ({
          name: item.name,
          completed: !!item.completed,
          ...item
        }))
      : [];

    const completedCount = typeof record?.completed_count === 'number'
      ? record.completed_count
      : items.filter(item => item.completed).length;
    const totalCount = typeof record?.total_count === 'number'
      ? record.total_count
      : items.length;
    const completionPercentage = typeof record?.completion_percentage === 'number'
      ? record.completion_percentage
      : totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return {
      id: record?.id || this.createMorningRoutineId(record?.user_id || 'unknown', record?.date || ''),
      userId: record?.user_id || '',
      date: record?.date || '',
      routineType: record?.routine_type || 'morning',
      items,
      completedCount,
      totalCount,
      completionPercentage,
      metadata: record?.metadata || {},
      createdAt: record?.created_at || new Date().toISOString(),
      updatedAt: record?.updated_at || new Date().toISOString(),
    };
  }

  private prepareMorningRoutineForStorage(routine: MorningRoutine) {
    const completedCount = routine.completedCount ?? routine.items.filter(item => item.completed).length;
    const totalCount = routine.totalCount ?? routine.items.length;
    const completionPercentage = routine.completionPercentage ?? (totalCount > 0 ? (completedCount / totalCount) * 100 : 0);

    return {
      id: routine.id || this.createMorningRoutineId(routine.userId, routine.date),
      user_id: routine.userId,
      date: routine.date,
      routine_type: routine.routineType || 'morning',
      items: routine.items,
      metadata: routine.metadata || {},
      completed_count: completedCount,
      total_count: totalCount,
      completion_percentage: completionPercentage,
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: routine.updatedAt || new Date().toISOString(),
    };
  }

  private createEmptyMorningRoutine(userId: string, date: string): MorningRoutine {
    const timestamp = new Date().toISOString();
    return {
      id: this.createMorningRoutineId(userId, date),
      userId,
      date,
      routineType: 'morning',
      items: [],
      completedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      metadata: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
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
          // Transform snake_case from DB to camelCase for app
          const appRecord: DailyReflection = {
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

          // Cache locally
          const key = `reflection:${userId}:${date}`;
          await offlineDb.setSetting(key, appRecord);
          return appRecord;
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

  // ===== MORNING ROUTINE =====
  async getMorningRoutine(userId: string, date: string): Promise<MorningRoutine | null> {
    let routine: MorningRoutine | null = null;

    try {
      const localRoutines = await offlineDb.getMorningRoutines(date);
      const local = localRoutines.find(record => record.user_id === userId);
      if (local) {
        routine = this.transformMorningRoutineRecord(local);
      }
    } catch (error) {
      console.warn('Failed to load morning routine from offline DB:', error);
    }

    if (this.isOnline()) {
      try {
        const { data, error } = await supabaseAnon
          .from('daily_routines')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .eq('routine_type', 'morning')
          .maybeSingle();

        if (!error && data) {
          const transformed = this.transformMorningRoutineRecord(data);
          await offlineDb.saveMorningRoutine(this.prepareMorningRoutineForStorage(transformed), false);
          routine = transformed;
        }
      } catch (error) {
        console.warn('Failed to sync morning routine from Supabase:', error);
      }
    }

    return routine;
  }

  async saveMorningRoutine(routine: MorningRoutine): Promise<MorningRoutine> {
    const storageRecord = this.prepareMorningRoutineForStorage(routine);
    const shouldSync = this.isOnline();

    await offlineDb.saveMorningRoutine(storageRecord, !shouldSync);

    if (shouldSync) {
      try {
        const { data, error } = await supabaseAnon
          .from('daily_routines')
          .upsert({
            user_id: storageRecord.user_id,
            date: storageRecord.date,
            routine_type: storageRecord.routine_type,
            items: storageRecord.items,
            metadata: storageRecord.metadata || {},
            completed_count: storageRecord.completed_count,
            total_count: storageRecord.total_count,
            completion_percentage: storageRecord.completion_percentage,
            created_at: storageRecord.created_at,
            updated_at: storageRecord.updated_at,
          }, { onConflict: 'user_id,date,routine_type', ignoreDuplicates: false })
          .select()
          .single();

        if (error) {
          console.error('❌ Failed to sync morning routine to Supabase:', error);
          await offlineDb.saveMorningRoutine(storageRecord, true);
          return this.transformMorningRoutineRecord(storageRecord);
        }

        const transformed = this.transformMorningRoutineRecord(data);
        await offlineDb.saveMorningRoutine(this.prepareMorningRoutineForStorage(transformed), false);
        return transformed;
      } catch (error) {
        console.error('❌ Supabase sync error (morning routine):', error);
        await offlineDb.saveMorningRoutine(storageRecord, true);
      }
    }

    return this.transformMorningRoutineRecord(storageRecord);
  }

  async toggleMorningRoutineHabit(
    userId: string,
    date: string,
    habitName: string,
    completed: boolean
  ): Promise<MorningRoutine | null> {
    const existing = await this.getMorningRoutine(userId, date);
    const routine = existing ?? this.createEmptyMorningRoutine(userId, date);

    const items = Array.isArray(routine.items) ? [...routine.items] : [];
    const index = items.findIndex(item => item.name === habitName);
    if (index >= 0) {
      items[index] = { ...items[index], completed };
    } else {
      items.push({ name: habitName, completed });
    }

    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const updated: MorningRoutine = {
      ...routine,
      items,
      completedCount,
      totalCount,
      completionPercentage,
      updatedAt: new Date().toISOString(),
    };

    return await this.saveMorningRoutine(updated);
  }

  async updateMorningRoutineMetadata(
    userId: string,
    date: string,
    metadata: Partial<MorningRoutineMetadata>
  ): Promise<MorningRoutine | null> {
    const existing = await this.getMorningRoutine(userId, date);
    const routine = existing ?? this.createEmptyMorningRoutine(userId, date);

    const updated: MorningRoutine = {
      ...routine,
      metadata: { ...routine.metadata, ...metadata },
      updatedAt: new Date().toISOString(),
    };

    return await this.saveMorningRoutine(updated);
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
