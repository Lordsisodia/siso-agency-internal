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

import { offlineDb, SyncableTable, OfflineSyncAction } from '@/services/offline/offlineDb';
import { supabaseAnon } from '@/lib/supabase-clerk';
import { offlineManager } from '@/services/shared/offlineManager';
import type { DeepWorkTask } from '@/domains/tasks/hooks/useDeepWorkTasksSupabase';
import type { LightWorkTask } from '@/domains/tasks/hooks/useLightWorkTasksSupabase';
import type { Database } from '@/types/supabase';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

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
type OfflineDeepWorkTask = Awaited<ReturnType<typeof offlineDb.getDeepWorkTasks>> extends Array<infer T> ? T : never;
type OfflineLightWorkTask = Awaited<ReturnType<typeof offlineDb.getLightWorkTasks>> extends Array<infer T> ? T : never;

const nowIso = () => new Date().toISOString();

const mapOfflineDeepWorkToApp = (task: OfflineDeepWorkTask): DeepWorkTask => ({
  id: task.id,
  userId: task.user_id,
  title: task.title,
  description: task.description ?? undefined,
  priority: (task.priority as DeepWorkTask['priority']) || 'MEDIUM',
  completed: Boolean(task.completed),
  originalDate: task.original_date,
  currentDate: task.task_date || task.original_date,
  taskDate: task.task_date || undefined,
  dueDate: null,
  estimatedDuration: task.estimated_duration ?? undefined,
  focusBlocks: task.focus_blocks ?? 4,
  breakDuration: 15,
  interruptionMode: false,
  rollovers: 0,
  tags: [],
  category: undefined,
  createdAt: task.created_at || nowIso(),
  updatedAt: task.updated_at || nowIso(),
  completedAt: task.completed_at ?? undefined,
  startedAt: undefined,
  actualDurationMin: task.actual_duration_min ?? undefined,
  timeEstimate: undefined,
  subtasks: []
});

const mapOfflineLightWorkToApp = (task: OfflineLightWorkTask): LightWorkTask => ({
  id: task.id,
  userId: task.user_id,
  title: task.title,
  description: task.description ?? undefined,
  priority: (task.priority as LightWorkTask['priority']) || 'MEDIUM',
  completed: Boolean(task.completed),
  originalDate: task.original_date,
  currentDate: task.task_date || task.original_date,
  taskDate: task.task_date || undefined,
  estimatedDuration: task.estimated_duration ?? undefined,
  rollovers: 0,
  tags: [],
  category: undefined,
  createdAt: task.created_at || nowIso(),
  updatedAt: task.updated_at || nowIso(),
  completedAt: task.completed_at ?? undefined,
  startedAt: undefined,
  actualDurationMin: task.actual_duration_min ?? undefined,
  timeEstimate: undefined,
  dueDate: undefined,
  subtasks: []
});

const mapDeepWorkRowToApp = (
  task: Database['public']['Tables']['deep_work_tasks']['Row']
): DeepWorkTask => ({
  id: task.id,
  userId: task.user_id,
  title: task.title,
  description: task.description ?? undefined,
  priority: (task.priority as DeepWorkTask['priority']) || 'MEDIUM',
  completed: Boolean(task.completed),
  originalDate: task.original_date,
  currentDate: task.task_date || task.original_date,
  taskDate: task.task_date || undefined,
  dueDate: task.due_date,
  estimatedDuration: task.estimated_duration ?? undefined,
  focusBlocks: task.focus_blocks ?? 4,
  breakDuration: task.break_duration ?? 15,
  interruptionMode: task.interruption_mode ?? false,
  rollovers: task.rollovers ?? 0,
  tags: task.tags ?? [],
  category: task.category ?? undefined,
  createdAt: task.created_at || nowIso(),
  updatedAt: task.updated_at || nowIso(),
  completedAt: task.completed_at ?? undefined,
  startedAt: task.started_at ?? undefined,
  actualDurationMin: task.actual_duration_min ?? undefined,
  timeEstimate: task.time_estimate ?? undefined,
  subtasks: []
});

const mapLightWorkRowToApp = (
  task: Database['public']['Tables']['light_work_tasks']['Row']
): LightWorkTask => ({
  id: task.id,
  userId: task.user_id,
  title: task.title,
  description: task.description ?? undefined,
  priority: (task.priority as LightWorkTask['priority']) || 'MEDIUM',
  completed: Boolean(task.completed),
  originalDate: task.original_date,
  currentDate: task.task_date || task.original_date,
  taskDate: task.task_date || undefined,
  estimatedDuration: task.estimated_duration ?? undefined,
  rollovers: task.rollovers ?? 0,
  tags: task.tags ?? [],
  category: task.category ?? undefined,
  createdAt: task.created_at || nowIso(),
  updatedAt: task.updated_at || nowIso(),
  completedAt: task.completed_at ?? undefined,
  startedAt: task.started_at ?? undefined,
  actualDurationMin: task.actual_duration_min ?? undefined,
  timeEstimate: task.time_estimate ?? undefined,
  dueDate: task.due_date ?? undefined,
  subtasks: []
});

const mapDeepWorkAppToOffline = (task: DeepWorkTask): OfflineDeepWorkTask => ({
  id: task.id,
  user_id: task.userId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  completed: task.completed,
  original_date: task.originalDate,
  task_date: task.taskDate ?? task.currentDate,
  estimated_duration: task.estimatedDuration,
  actual_duration_min: task.actualDurationMin,
  focus_blocks: task.focusBlocks,
  xp_reward: undefined,
  difficulty: undefined,
  complexity: undefined,
  created_at: task.createdAt || nowIso(),
  updated_at: task.updatedAt || nowIso(),
  completed_at: task.completedAt
});

const mapLightWorkAppToOffline = (task: LightWorkTask): OfflineLightWorkTask => ({
  id: task.id,
  user_id: task.userId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  completed: task.completed,
  original_date: task.originalDate,
  task_date: task.taskDate ?? task.currentDate,
  estimated_duration: task.estimatedDuration,
  actual_duration_min: task.actualDurationMin,
  xp_reward: undefined,
  difficulty: undefined,
  complexity: undefined,
  created_at: task.createdAt || nowIso(),
  updated_at: task.updatedAt || nowIso(),
  completed_at: task.completedAt
});

class UnifiedDataService {
  private isOnline(): boolean {
    return navigator.onLine;
  }

  private ensureArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value as string[];
    }

    if (typeof value === 'string' && value.length > 0) {
      return [value];
    }

    return [];
  }

  private mapDbReflectionToApp(record: any): DailyReflection {
    if (!record) {
      return {
        id: '',
        user_id: '',
        date: '',
        winOfDay: '',
        mood: '',
        bedTime: '',
        wentWell: [],
        evenBetterIf: [],
        dailyAnalysis: '',
        actionItems: '',
        overallRating: undefined,
        energyLevel: undefined,
        keyLearnings: '',
        tomorrowFocus: '',
        tomorrowTopTasks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return {
      id: record.id || '',
      user_id: record.user_id || record.userId || '',
      date: record.date || '',
      winOfDay: record.win_of_day || record.winOfDay || '',
      mood: record.mood || '',
      bedTime: record.bed_time || record.bedTime || '',
      wentWell: this.ensureArray(record.went_well ?? record.wentWell),
      evenBetterIf: this.ensureArray(record.even_better_if ?? record.evenBetterIf),
      dailyAnalysis: record.daily_analysis ?? record.dailyAnalysis ?? '',
      actionItems: record.action_items ?? record.actionItems ?? '',
      overallRating: record.overall_rating ?? record.overallRating ?? undefined,
      energyLevel: record.energy_level ?? record.energyLevel ?? undefined,
      keyLearnings: record.key_learnings ?? record.keyLearnings ?? '',
      tomorrowFocus: record.tomorrow_focus ?? record.tomorrowFocus ?? '',
      tomorrowTopTasks: this.ensureArray(record.tomorrow_top_tasks ?? record.tomorrowTopTasks),
      created_at: record.created_at ?? record.createdAt ?? new Date().toISOString(),
      updated_at: record.updated_at ?? record.updatedAt ?? new Date().toISOString()
    };
  }

  private buildCacheKey(userId: string, date: string) {
    return `reflection:${userId}:${date}`;
  }

  private transformDbReflection(record: any): DailyReflection {
    return this.mapDbReflectionToApp(record);
  }

  // ===== DAILY REFLECTIONS =====
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | null> {
    const key = this.buildCacheKey(userId, date);

    // Try local first
    try {
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
          const appRecord = this.transformDbReflection(data);

          // Cache locally
          await offlineDb.setSetting(key, appRecord);
          return appRecord;
        }
      } catch (error) {
        console.warn('Failed to get Supabase reflection:', error);
      }
    }

    return null;
  }

  async getDailyReflections(userId: string, dates: string[]): Promise<Record<string, DailyReflection>> {
    const uniqueDates = Array.from(new Set(dates.filter(Boolean)));
    const reflections: Record<string, DailyReflection> = {};
    const missingDates: string[] = [];

    await Promise.all(
      uniqueDates.map(async date => {
        const key = this.buildCacheKey(userId, date);
        try {
          const local = await offlineDb.getSetting(key);
          if (local) {
            reflections[date] = local;
            return;
          }
        } catch (error) {
          console.warn('Failed to get local reflection:', error);
        }

        missingDates.push(date);
      })
    );

    if (missingDates.length && this.isOnline()) {
      try {
        const { data, error } = await supabaseAnon
          .from('daily_reflections')
          .select('*')
          .eq('user_id', userId)
          .in('date', missingDates);

        if (!error && data) {
          await Promise.all(
            data.map(async record => {
              const appRecord = this.transformDbReflection(record);
              reflections[record.date] = appRecord;
              await offlineDb.setSetting(this.buildCacheKey(userId, record.date), appRecord);
            })
          );
        }
      } catch (error) {
        console.warn('Failed to batch fetch Supabase reflections:', error);
      }
    }

    return reflections;
  }

  async saveDailyReflection(reflection: DailyReflection): Promise<void> {
    const key = `reflection:${reflection.user_id}:${reflection.date}`;

    // Always save locally first
    await offlineDb.setSetting(key, {
      ...reflection,
      updated_at: new Date().toISOString()
    });

    await offlineDb.saveNightlyCheckout({
      id: reflection.id ?? `checkout-${reflection.user_id}-${reflection.date}`,
      user_id: reflection.user_id,
      checkout_date: reflection.date,
      reflection: reflection.dailyAnalysis ?? '',
      wins: reflection.wentWell ?? [],
      improvements: reflection.evenBetterIf ?? [],
      tomorrow_focus: reflection.tomorrowFocus ?? '',
      created_at: reflection.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, !this.isOnline());

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
          .select()
          .maybeSingle();

        if (error) {
          console.error('❌ Failed to sync reflection to Supabase:', error);

          const isRlsDenied = error.code === '42501' || error.message?.includes('row-level security');
          if (isRlsDenied) {
            const fallback = await this.syncDailyReflectionViaApi(reflection, key);
            if (fallback) {
              console.log('✅ Saved daily reflection via API fallback');
              return;
            }
          }

          // Queue for later sync
          await this.queueForSync('daily_reflections', 'upsert', dbRecord);
        } else {
          console.log('✅ Successfully saved to Supabase:', data);

          if (data) {
            const syncedRecord = this.mapDbReflectionToApp(data);
            await offlineDb.setSetting(key, syncedRecord);
          }
        }
      } catch (error) {
        console.error('❌ Supabase sync error:', error);
        const fallback = await this.syncDailyReflectionViaApi(reflection, key);
        if (!fallback) {
          await this.queueForSync('daily_reflections', 'upsert', dbRecord);
        }
      }
    } else {
      console.log('📴 Offline - queuing for later sync');
      // Queue for later sync
      await this.queueForSync('daily_reflections', 'upsert', dbRecord);
    }
  }

  private async syncDailyReflectionViaApi(reflection: DailyReflection, cacheKey: string): Promise<DailyReflection | null> {
    const baseUrl = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '';
    const endpoint = `${baseUrl}/api/daily-reflections`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          internalUserId: reflection.user_id,
          date: reflection.date,
          wentWell: reflection.wentWell || [],
          evenBetterIf: reflection.evenBetterIf || [],
          dailyAnalysis: reflection.dailyAnalysis || '',
          actionItems: reflection.actionItems || '',
          overallRating: reflection.overallRating ?? null,
          energyLevel: reflection.energyLevel ?? null,
          keyLearnings: reflection.keyLearnings || '',
          tomorrowFocus: reflection.tomorrowFocus || '',
          tomorrowTopTasks: reflection.tomorrowTopTasks || [],
          winOfDay: reflection.winOfDay || '',
          mood: reflection.mood || '',
          bedTime: reflection.bedTime || ''
        })
      });

      if (!response.ok) {
        console.warn('⚠️ API fallback failed to save reflection:', response.statusText);
        return null;
      }

      const payload = await response.json();
      const remoteRecord = payload?.data;

      if (!remoteRecord) {
        return null;
      }

      const appRecord = this.mapDbReflectionToApp(remoteRecord);
      await offlineDb.setSetting(cacheKey, {
        ...appRecord,
        updated_at: appRecord.updated_at || new Date().toISOString()
      });

      return appRecord;
    } catch (error) {
      console.warn('⚠️ API fallback error:', error);
      return null;
    }
  }

  // ===== TIME BLOCKS =====
  async getTimeBlocks(userId: string, date: string): Promise<TimeBlock[]> {
    try {
      const local = await offlineDb.getTimeBlocks(userId, date);
      if (local.length > 0) {
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
          for (const record of data) {
            await offlineDb.saveTimeBlock(record, false);
          }
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

    const online = this.isOnline();
    await offlineDb.saveTimeBlock(dbRecord, !online);

    console.log('💾 Saving time block to Supabase:', {
      title: dbRecord.title,
      userId: dbRecord.user_id,
      type: dbRecord.type,
      taskIds: dbRecord.task_ids
    });

    // If online, sync to Supabase
    if (online) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .upsert(dbRecord, { onConflict: 'user_id,date,start_time' });

        if (error) {
          console.warn('❌ Failed to sync timeblock to Supabase:', error);
          await this.queueForSync('time_blocks', 'upsert', dbRecord);
        } else {
          console.log('✅ Time block synced to Supabase:', timeBlock.title);
          await offlineDb.saveTimeBlock(dbRecord, false);
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
      created_at: updatedBlock.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const online = this.isOnline();
    await offlineDb.saveTimeBlock({ ...dbRecord, created_at: updatedBlock.created_at || new Date().toISOString() }, !online);

    // Sync to Supabase if online
    if (online) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .update(dbRecord)
          .eq('id', id);

        if (error) {
          console.warn('❌ Failed to update in Supabase:', error);
          await this.queueForSync('time_blocks', 'upsert', dbRecord);
        } else {
          console.log('✅ Time block updated in Supabase');
          await offlineDb.saveTimeBlock({ ...dbRecord, created_at: updatedBlock.created_at || new Date().toISOString() }, false);
        }
      } catch (error) {
        console.warn('❌ Supabase update error:', error);
        await this.queueForSync('time_blocks', 'upsert', dbRecord);
      }
    }
  }

  async deleteTimeBlock(id: string): Promise<void> {
    console.log('🗑️ Deleting time block:', id);

    await offlineDb.deleteTimeBlock(id);

    let deleteFailed = false;

    if (this.isOnline()) {
      try {
        const { error } = await supabaseAnon
          .from('time_blocks')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('❌ Failed to delete from Supabase:', error);
          deleteFailed = true;
        } else {
          console.log('✅ Time block deleted from Supabase');
        }
      } catch (error) {
        console.warn('❌ Supabase delete error:', error);
        deleteFailed = true;
      }
    } else {
      deleteFailed = true;
    }

    if (deleteFailed) {
      await this.queueForSync('time_blocks', 'delete', { id });
    }
  }

  async getDeepWorkTasks(userId?: string | null, date?: string): Promise<DeepWorkTask[]> {
    let localTasks: OfflineDeepWorkTask[] = [];

    try {
      localTasks = await offlineDb.getDeepWorkTasks(date);
    } catch (error) {
      console.warn('Failed to get local deep work tasks:', error);
    }

    const filteredLocal = userId ? localTasks.filter(task => task.user_id === userId) : localTasks;

    if (filteredLocal.length > 0) {
      return filteredLocal.map(mapOfflineDeepWorkToApp);
    }

    if (!this.isOnline() || !userId) {
      return [];
    }

    try {
      let query = supabaseAnon
        .from('deep_work_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('task_date', date);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Failed to fetch deep work tasks from Supabase:', error);
        return [];
      }

      const mappedTasks = (data ?? []).map(mapDeepWorkRowToApp);

      await Promise.allSettled(
        mappedTasks.map(task => offlineDb.saveDeepWorkTask(mapDeepWorkAppToOffline(task), false))
      );

      return mappedTasks;
    } catch (error) {
      console.warn('Failed to load deep work tasks from Supabase:', error);
      return [];
    }
  }

  async getLightWorkTasks(userId?: string | null, date?: string): Promise<LightWorkTask[]> {
    let localTasks: OfflineLightWorkTask[] = [];

    try {
      localTasks = await offlineDb.getLightWorkTasks(date);
    } catch (error) {
      console.warn('Failed to get local light work tasks:', error);
    }

    const filteredLocal = userId ? localTasks.filter(task => task.user_id === userId) : localTasks;

    if (filteredLocal.length > 0) {
      return filteredLocal.map(mapOfflineLightWorkToApp);
    }

    if (!this.isOnline() || !userId) {
      return [];
    }

    try {
      let query = supabaseAnon
        .from('light_work_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('task_date', date);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Failed to fetch light work tasks from Supabase:', error);
        return [];
      }

      const mappedTasks = (data ?? []).map(mapLightWorkRowToApp);

      await Promise.allSettled(
        mappedTasks.map(task => offlineDb.saveLightWorkTask(mapLightWorkAppToOffline(task), false))
      );

      return mappedTasks;
    } catch (error) {
      console.warn('Failed to load light work tasks from Supabase:', error);
      return [];
    }
  }

  // ===== SYNC QUEUE =====
  private async queueForSync(table: string, action: string, data: any): Promise<void> {
    const tableMap: Record<string, SyncableTable | undefined> = {
      daily_reflections: 'dailyReflections',
      time_blocks: 'timeBlocks',
      daily_routines: 'morningRoutines',
      home_workouts: 'workoutSessions',
    };

    const mappedTable = tableMap[table];

    if (!mappedTable) {
      console.warn('[UnifiedDataService] Attempted to queue unsupported table:', table);
      return;
    }

    const actionMap: Record<string, OfflineSyncAction['action']> = {
      upsert: 'upsert',
      insert: 'create',
      update: 'update',
      delete: 'delete',
    };

    const mappedAction = actionMap[action] ?? 'upsert';

    const sanitized = { ...data };
    delete sanitized._needs_sync;
    delete sanitized._sync_status;
    delete sanitized._last_synced;

    await offlineDb.queueAction(mappedAction, mappedTable, sanitized);
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
