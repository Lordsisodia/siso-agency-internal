/**
 * SISO Background Sync Service
 * Pushes queued mutations from IndexedDB to Supabase and keeps local cache fresh.
 */

import { offlineDb, OfflineSyncAction, SyncableTable } from './offlineDb';
import { supabase, TABLES } from '@/services/integrations/supabase/client';
import type { Database } from '@/types/supabase';
import { syncMonitor } from './syncMonitor';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSyncedAt?: string;
  lastError?: string;
}

type SyncListener = (status: SyncStatus) => void;

type SyncTableConfig = {
  table: string;
  primaryKey: string;
  userKey: string;
  staticFilters?: Record<string, string | number | boolean>;
  onConflict?: string; // Custom conflict resolution key (defaults to primaryKey)
};

const SYNC_TABLE_MAP: Record<SyncableTable, SyncTableConfig> = {
  lightWorkTasks: {
    table: TABLES.LIGHT_WORK_TASKS,
    primaryKey: 'id',
    userKey: 'user_id',
  },
  deepWorkTasks: {
    table: TABLES.DEEP_WORK_TASKS,
    primaryKey: 'id',
    userKey: 'user_id',
  },
  morningRoutines: {
    table: TABLES.DAILY_ROUTINES ?? 'daily_routines',
    primaryKey: 'id',
    userKey: 'user_id',
    staticFilters: { routine_type: 'morning' },
    onConflict: 'user_id,date,routine_type', // Composite unique constraint
  },
  workoutSessions: {
    table: TABLES.HOME_WORKOUTS ?? 'home_workouts',
    primaryKey: 'id',
    userKey: 'user_id',
    onConflict: 'user_id,date', // Composite unique constraint
  },
  nightlyCheckouts: {
    table: TABLES.DAILY_REFLECTIONS ?? 'daily_reflections',
    primaryKey: 'id',
    userKey: 'user_id',
    onConflict: 'user_id,date', // Composite unique constraint
  },
  dailyReflections: {
    table: TABLES.DAILY_REFLECTIONS ?? 'daily_reflections',
    primaryKey: 'id',
    userKey: 'user_id',
    onConflict: 'user_id,date', // Composite unique constraint
  },
  timeBlocks: {
    table: TABLES.TIME_BLOCKS ?? 'time_blocks',
    primaryKey: 'id',
    userKey: 'user_id',
    onConflict: 'user_id,date,start_time', // Composite unique constraint
  },
};

const RETRY_BACKOFF_MS = [5_000, 10_000, 20_000];

type WorkoutItem = Database['public']['Tables']['workout_items']['Row'];

export class SyncService {
  private isBrowser = typeof window !== 'undefined';
  private isOnline = this.isBrowser ? navigator.onLine : true;
  private syncInProgress = false;
  private retryAttempts = 0;
  private activeUserId: string | null = null;
  private periodicTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<SyncListener>();
  private status: SyncStatus = {
    isOnline: this.isOnline,
    isSyncing: false,
    pendingActions: 0,
    lastSyncedAt: undefined,
    lastError: undefined,
  };

  constructor() {
    if (this.isBrowser) {
      this.setupNetworkListeners();
      this.setupVisibilityListener();
      this.startPeriodicSync();
    }

    void this.bootstrapStatus();
  }

  // --- Public API ----------------------------------------------------------

  /**
   * Subscribe to sync status updates.
   */
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Expose current status synchronously (for initial hook state).
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Provide the current authenticated Supabase user id so background
   * pulls can be scoped correctly.
   */
  setActiveUser(userId: string | null): void {
    this.activeUserId = userId;
    if (userId) {
      void offlineDb.setSetting('activeUserId', userId);
    }
    void this.emitStatus();
  }

  /**
   * Trigger a manual sync. By default it will skip if offline.
   */
  async syncAll({ force = false }: { force?: boolean } = {}): Promise<void> {
    if (!this.isOnline && !force) {
      return;
    }

    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    await this.emitStatus({ isSyncing: true }, { refreshCounts: false });

    try {
      const pushErrors = await this.pushLocalChanges();

      if (pushErrors.length > 0) {
        throw new Error(pushErrors.join('\n'));
      }

      await this.pullServerData();

      const syncedAt = new Date().toISOString();
      await offlineDb.setSetting('lastSync', syncedAt);
      this.retryAttempts = 0;

      await this.emitStatus(
        { isSyncing: false, lastSyncedAt: syncedAt, lastError: undefined },
        { refreshCounts: true },
      );
    } catch (error) {
      this.retryAttempts = Math.min(this.retryAttempts + 1, RETRY_BACKOFF_MS.length);
      const message =
        error instanceof Error ? error.message : 'Unknown sync error';

      await this.emitStatus(
        { isSyncing: false, lastError: message },
        { refreshCounts: true },
      );

      if (this.retryAttempts <= RETRY_BACKOFF_MS.length) {
        const delay = RETRY_BACKOFF_MS[this.retryAttempts - 1];
        if (this.isBrowser) {
          setTimeout(() => void this.syncAll({ force: true }), delay);
        }
      }

      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Wrapper for legacy callers to request a sync.
   */
  forceSync(): Promise<void> {
    return this.syncAll({ force: true });
  }

  /**
   * Update or enqueue task mutations. These helpers are still consumed by
   * older APIs that haven't migrated to the per-hook queue helpers.
   */
  async createTask(task: any, type: 'light' | 'deep'): Promise<void> {
    if (type === 'light') {
      await offlineDb.saveLightWorkTask(task, true);
    } else {
      await offlineDb.saveDeepWorkTask(task, true);
    }

    await this.emitStatus({}, { refreshCounts: true });

    if (this.isOnline) {
      await this.syncAll({ force: false });
    }
  }

  async updateTask(task: any, type: 'light' | 'deep'): Promise<void> {
    if (type === 'light') {
      await offlineDb.saveLightWorkTask(task, true);
    } else {
      await offlineDb.saveDeepWorkTask(task, true);
    }

    await this.emitStatus({}, { refreshCounts: true });

    if (this.isOnline) {
      await this.syncAll({ force: false });
    }
  }

  async deleteTask(taskId: string, type: 'light' | 'deep'): Promise<void> {
    const table: SyncableTable =
      type === 'light' ? 'lightWorkTasks' : 'deepWorkTasks';

    await offlineDb.queueAction('delete', table, { id: taskId });
    await this.emitStatus({}, { refreshCounts: true });

    if (this.isOnline) {
      await this.syncAll({ force: false });
    }
  }

  async getTasks(type: 'light' | 'deep', date?: string): Promise<any[]> {
    if (type === 'light') {
      return offlineDb.getLightWorkTasks(date);
    }
    return offlineDb.getDeepWorkTasks(date);
  }

  getConnectionStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: this.status.isOnline,
      isSyncing: this.status.isSyncing,
    };
  }

  async getSyncStats(): Promise<{
    localTasks: number;
    pendingSync: number;
    lastSync?: string;
  }> {
    const stats = await offlineDb.getStats();
    return {
      localTasks: stats.lightWorkTasks + stats.deepWorkTasks,
      pendingSync: stats.pendingActions,
      lastSync: stats.lastSync,
    };
  }

  // --- Lifecycle -----------------------------------------------------------

  private async bootstrapStatus(): Promise<void> {
    try {
      const storedUserId = await offlineDb.getSetting('activeUserId');
      if (storedUserId && typeof storedUserId === 'string') {
        this.activeUserId = storedUserId;
      }
    } catch (error) {
      console.error('[SyncService] Failed to restore active user id:', error);
    } finally {
      await this.emitStatus({}, { refreshCounts: true });
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  private startPeriodicSync(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
    }

    this.periodicTimer = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        void this.syncAll({ force: false });
      }
    }, 5 * 60 * 1000);
  }

  // --- Event handlers ------------------------------------------------------

  private handleOnline = () => {
    console.log('[SyncService] Network restored, kicking sync');
    this.isOnline = true;
    void this.emitStatus({ isOnline: true });
    void this.syncAll({ force: true });
  };

  private handleOffline = () => {
    console.log('[SyncService] Network lost, operating offline');
    this.isOnline = false;
    this.retryAttempts = 0;
    void this.emitStatus({ isOnline: false });
  };

  private handleVisibility = () => {
    if (document.visibilityState === 'visible' && this.isOnline) {
      void this.syncAll({ force: false });
    }
  };

  // --- Core sync steps -----------------------------------------------------

  private async pushLocalChanges(): Promise<string[]> {
    const errors: string[] = [];
    const pendingActions = await offlineDb.getPendingActions();

    if (pendingActions.length === 0) {
      return errors;
    }

    for (const action of pendingActions) {
      try {
        const syncedId = await this.executeSyncAction(action);

        await offlineDb.removeAction(action.id);

        if (syncedId) {
          await offlineDb.markRecordSynced(syncedId, action.table);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(message);

        const retries = action.retry_count + 1;

        // Record failure for monitoring
        syncMonitor.recordFailure(action.table, action.action, message, retries);

        if (retries >= RETRY_BACKOFF_MS.length) {
          console.error('[SyncService] Dropping action after max retries:', action);
          await offlineDb.removeAction(action.id);
        } else {
          await offlineDb.updateActionRetry(action.id, retries, message);
        }
      }
    }

    return errors;
  }

  private stripLocalMetadata(
    data: Record<string, any> | null | undefined,
  ): Record<string, any> | null {
    if (!data) {
      return null;
    }

    return Object.entries(data).reduce<Record<string, any>>((acc, [key, value]) => {
      if (!key.startsWith('_')) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  private async executeSyncAction(action: OfflineSyncAction): Promise<string | null> {
    if (action.table === 'workoutSessions') {
      return this.syncWorkoutSessionAction(action);
    }

    const mapping = SYNC_TABLE_MAP[action.table];
    const supabaseTable = mapping.table;
    const primaryKey = mapping.primaryKey;
    const conflictKey = mapping.onConflict ?? primaryKey; // Use custom or default to primaryKey

    const sanitizedData = this.stripLocalMetadata(action.data);

    // Table-specific scrubbing for schema mismatches
    if (action.table === 'deepWorkTasks' && sanitizedData) {
      delete sanitizedData['due_date']; // column does not exist
      delete sanitizedData['subtasks']; // not a column
    }
    if (action.table === 'lightWorkTasks' && sanitizedData) {
      delete sanitizedData['subtasks']; // not a column
    }
    const payloadId = (sanitizedData?.[primaryKey] ??
      action.data?.[primaryKey]) as string | undefined;

    switch (action.action) {
      case 'create': {
        if (!sanitizedData) {
          throw new Error(`[SyncService] Missing payload for create action on ${supabaseTable}`);
        }

        const { data, error } = await supabase
          .from(supabaseTable)
          .insert(sanitizedData)
          .select()
          .single();

        if (error) {
          throw new Error(`[SyncService] Failed to create in ${supabaseTable}: ${error.message}`);
        }

        if (data) {
          await this.persistServerRecord(action.table, data);
          return data[primaryKey] as string;
        }

        return payloadId ?? null;
      }

      case 'upsert': {
        if (!sanitizedData) {
          throw new Error(`[SyncService] Missing payload for upsert action on ${supabaseTable}`);
        }

        const { data, error } = await supabase
          .from(supabaseTable)
          .upsert(sanitizedData, { onConflict: conflictKey })
          .select()
          .maybeSingle();

        if (error) {
          throw new Error(`[SyncService] Failed to upsert ${supabaseTable}: ${error.message}`);
        }

        if (data) {
          await this.persistServerRecord(action.table, data);
          return (data as Record<string, any>)[primaryKey] as string;
        }

        return payloadId ?? null;
      }

      case 'update': {
        if (!sanitizedData) {
          throw new Error(`[SyncService] Missing payload for update action on ${supabaseTable}`);
        }

        const { data, error, status } = await supabase
          .from(supabaseTable)
          .update(sanitizedData)
          .eq(primaryKey, payloadId)
          .select()
          .maybeSingle();

        if (error && status !== 406) {
          throw new Error(`[SyncService] Failed to update ${supabaseTable}: ${error.message}`);
        }

        if (!data) {
          // Record may have been removed remotely; treat this as an upsert fallback.
          const { data: created, error: insertError } = await supabase
            .from(supabaseTable)
            .insert(sanitizedData)
            .select()
            .single();

          if (insertError) {
            throw new Error(`[SyncService] Failed to upsert ${supabaseTable}: ${insertError.message}`);
          }

          if (created) {
            await this.persistServerRecord(action.table, created);
            return created[primaryKey] as string;
          }

          return payloadId ?? null;
        }

        await this.persistServerRecord(action.table, data);
        return (data as Record<string, any>)[primaryKey] as string;
      }

      case 'delete': {
        const { error } = await supabase
          .from(supabaseTable)
          .delete()
          .eq(primaryKey, payloadId);

        if (error) {
          throw new Error(`[SyncService] Failed to delete from ${supabaseTable}: ${error.message}`);
        }

        return payloadId ?? null;
      }

      default:
        return payloadId ?? null;
    }
  }

  private async pullServerData(): Promise<void> {
    if (!this.activeUserId) {
      // Nothing to refresh without a scoped user.
      return;
    }

    const lastSync = (await offlineDb.getSetting('lastSync')) as string | undefined;
    const since = lastSync ? new Date(lastSync).toISOString() : undefined;

    for (const tableKey of Object.keys(SYNC_TABLE_MAP) as SyncableTable[]) {
      if (tableKey === 'nightlyCheckouts') {
        // nightlyCheckouts reuse dailyReflections store, avoid duplicate pulls
        continue;
      }

      if (tableKey === 'workoutSessions') {
        await this.pullWorkoutSessions(since);
        continue;
      }

      const { table, userKey, staticFilters } = SYNC_TABLE_MAP[tableKey];

      let query = supabase.from(table).select('*').eq(userKey, this.activeUserId);

      if (staticFilters) {
        for (const [filterKey, filterValue] of Object.entries(staticFilters)) {
          query = query.eq(filterKey, filterValue as any);
        }
      }

      if (since) {
        query = query.gte('updated_at', since);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || /does not exist/i.test(error.message ?? '')) {
          console.warn(`[SyncService] Skipping pull for ${table} (table missing)`);
          continue;
        }
        throw new Error(`[SyncService] Failed to pull ${table}: ${error.message}`);
      }

      if (!data || data.length === 0) {
        continue;
      }

      for (const record of data) {
        await this.persistServerRecord(tableKey, record);
      }
    }
  }

  private async syncWorkoutSessionAction(action: OfflineSyncAction): Promise<string | null> {
    const sanitizedData = this.stripLocalMetadata(action.data);
    if (!sanitizedData) {
      throw new Error('[SyncService] Missing workout session payload');
    }

    const userId = sanitizedData.user_id;
    const date = sanitizedData.date;
    if (!userId || !date) {
      throw new Error('[SyncService] Workout session payload missing user_id/date');
    }

    const sessionId = sanitizedData.id ?? `session-${userId}-${date}`;
    const items = Array.isArray(sanitizedData.items) ? sanitizedData.items : [];

    const sessionRecord = {
      id: sessionId,
      user_id: userId,
      workout_date: date,
      items,
      total_exercises: items.length,
      completed_exercises: items.filter(item => item?.completed).length,
      created_at: sanitizedData.created_at ?? new Date().toISOString(),
      updated_at: sanitizedData.updated_at ?? new Date().toISOString(),
    };

    try {
      const upsertResult = await supabase
        .from('home_workouts')
        .upsert(
          {
            id: sessionId,
            user_id: userId,
            date,
            workout_items: items,
            completed_count: sessionRecord.completed_exercises,
            total_count: sessionRecord.total_exercises,
            completion_percentage:
              sessionRecord.total_exercises > 0
                ? Math.round((sessionRecord.completed_exercises / sessionRecord.total_exercises) * 100)
                : 0,
            created_at: sessionRecord.created_at,
            updated_at: sessionRecord.updated_at,
          },
          { onConflict: 'user_id,date' },
        );

      if (upsertResult.error && (upsertResult.error.code === '42P01' || /does not exist/i.test(upsertResult.error.message ?? ''))) {
        await this.persistWorkoutItemsFallback(sessionRecord);
      } else if (upsertResult.error) {
        throw upsertResult.error;
      }
    } catch (error) {
      console.warn('[SyncService] home_workouts upsert failed, using workout_items fallback:', error);
      await this.persistWorkoutItemsFallback(sessionRecord);
    }

    await offlineDb.saveWorkoutSession(sessionRecord, false);
    return sessionId;
  }

  private async persistWorkoutItemsFallback(session: {
    id: string;
    user_id: string;
    workout_date: string;
    items: Array<any>;
    created_at: string;
    updated_at: string;
  }): Promise<void> {
    const { error: deleteError } = await supabase
      .from('workout_items')
      .delete()
      .eq('user_id', session.user_id)
      .eq('workout_date', session.workout_date);

    if (deleteError && deleteError.code !== 'PGRST116') {
      throw deleteError;
    }

    if (session.items.length === 0) {
      return;
    }

    const rows = session.items.map((item: any, index: number) => {
      const base = {
        user_id: session.user_id,
        workout_date: session.workout_date,
        title: item.title ?? `Exercise ${index + 1}`,
        target: item.target ?? null,
        logged: item.logged ?? null,
        completed: Boolean(item.completed),
        created_at: session.created_at,
        updated_at: session.updated_at,
      };

      if (item.id) {
        return { id: item.id, ...base };
      }

      return base;
    });

    const { error: insertError } = await supabase.from('workout_items').insert(rows);
    if (insertError) {
      throw insertError;
    }
  }

  private async pullWorkoutSessions(since?: string): Promise<void> {
    if (!this.activeUserId) {
      return;
    }

    const userId = this.activeUserId;

    const fetchFromAggregator = async (): Promise<boolean> => {
      let query = supabase.from('home_workouts').select('*').eq('user_id', userId);
      if (since) {
        query = query.gte('updated_at', since);
      }
      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01' || /does not exist/i.test(error.message ?? '')) {
          return false;
        }
        throw new Error(`[SyncService] Failed to pull home_workouts: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return true;
      }

      for (const record of data) {
        const sessionRecord = {
          id: record.id,
          user_id: record.user_id,
          workout_date: record.date,
          items: record.workout_items ?? [],
          total_exercises: record.total_count ?? (record.workout_items?.length ?? 0),
          completed_exercises: record.completed_count ?? 0,
          created_at: record.created_at ?? new Date().toISOString(),
          updated_at: record.updated_at ?? new Date().toISOString(),
        };
        await offlineDb.saveWorkoutSession(sessionRecord, false);
      }

      return true;
    };

    const handled = await fetchFromAggregator();
    if (handled) {
      return;
    }

    let query = supabase.from('workout_items').select('*').eq('user_id', userId);
    if (since) {
      query = query.gte('updated_at', since);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`[SyncService] Failed to pull workout_items: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return;
    }

    const grouped = new Map<string, WorkoutItem[]>();
    for (const row of data as WorkoutItem[]) {
      const date = row.workout_date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(row);
    }

    for (const [date, rows] of grouped.entries()) {
      const items = rows.map(item => ({
        id: item.id,
        title: item.title,
        target: item.target,
        logged: item.logged,
        completed: Boolean(item.completed),
      }));

      const sessionRecord = {
        id: `session-${userId}-${date}`,
        user_id: userId,
        workout_date: date,
        items,
        total_exercises: items.length,
        completed_exercises: items.filter(item => item.completed).length,
        created_at: rows[0]?.created_at ?? new Date().toISOString(),
        updated_at: rows[0]?.updated_at ?? new Date().toISOString(),
      };

      await offlineDb.saveWorkoutSession(sessionRecord, false);
    }
  }

  private async persistServerRecord(tableKey: SyncableTable, record: any): Promise<void> {
    switch (tableKey) {
      case 'lightWorkTasks':
        await offlineDb.saveLightWorkTask(record, false);
        break;
      case 'deepWorkTasks':
        await offlineDb.saveDeepWorkTask(record, false);
        break;
      case 'morningRoutines': {
        const payload = {
          id: record.id,
          user_id: record.user_id,
          date: record.date,
          routine_type: record.routine_type ?? 'morning',
          items: record.items ?? [],
          completed_count: record.completed_count ?? 0,
          total_count: record.total_count ?? (record.items?.length ?? 0),
          completion_percentage: record.completion_percentage ?? 0,
          metadata: record.metadata ?? null,
          created_at: record.created_at ?? new Date().toISOString(),
          updated_at: record.updated_at ?? new Date().toISOString(),
        };
        await offlineDb.saveMorningRoutine(payload, false);
        break;
      }
      case 'workoutSessions': {
        const payload = {
          id: record.id,
          user_id: record.user_id,
          workout_date: record.workout_date ?? record.date,
          items: record.items ?? record.workout_items ?? [],
          total_exercises: record.total_count ?? (record.items?.length ?? record.workout_items?.length ?? 0),
          completed_exercises: record.completed_count ?? 0,
          created_at: record.created_at ?? new Date().toISOString(),
          updated_at: record.updated_at ?? new Date().toISOString(),
        };
        await offlineDb.saveWorkoutSession(payload, false);
        break;
      }
      case 'dailyReflections':
      case 'nightlyCheckouts': {
        const payload = {
          id: record.id ?? `${record.user_id}-${record.date}`,
          user_id: record.user_id,
          checkout_date: record.date,
          reflection: record.key_learnings ?? '',
          wins: record.went_well ?? [],
          improvements: record.even_better_if ?? [],
          tomorrow_focus: record.tomorrow_focus ?? '',
          created_at: record.created_at ?? new Date().toISOString(),
          updated_at: record.updated_at ?? new Date().toISOString(),
        };
        await offlineDb.saveNightlyCheckout(payload, false);
        break;
      }
      case 'timeBlocks': {
        const payload = {
          id: record.id,
          user_id: record.user_id,
          date: record.date,
          start_time: record.start_time,
          end_time: record.end_time,
          title: record.title,
          description: record.description ?? null,
          type: record.type ?? null,
          task_ids: record.task_ids ?? null,
          created_at: record.created_at ?? new Date().toISOString(),
          updated_at: record.updated_at ?? new Date().toISOString(),
        };
        await offlineDb.saveTimeBlock(payload, false);
        break;
      }
      default:
        break;
    }
  }

  // --- Status management ---------------------------------------------------

  private async emitStatus(
    partial: Partial<SyncStatus> = {},
    options: { refreshCounts?: boolean } = { refreshCounts: true },
  ): Promise<void> {
    let pendingActions = this.status.pendingActions;
    let lastSyncedAt = this.status.lastSyncedAt;

    if (options.refreshCounts) {
      const actions = await offlineDb.getPendingActions();
      pendingActions = actions.length;
      const lastSyncSetting = (await offlineDb.getSetting('lastSync')) as string | undefined;
      if (lastSyncSetting) {
        lastSyncedAt = lastSyncSetting;
      }
    }

    this.status = {
      ...this.status,
      ...partial,
      isOnline: partial.isOnline ?? this.isOnline,
      pendingActions,
      lastSyncedAt,
    };

    for (const listener of this.listeners) {
      listener(this.status);
    }
  }
}

export const syncService = new SyncService();

// Register a background sync task when service workers are available.
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready
      .then((registration) => registration.sync.register('lifelock-sync'))
      .catch((error) => console.error('[SyncService] Failed to register background sync', error));
  }

  // Expose sync service for debugging (DevTools > console).
  (window as any).__lifelockSyncService = syncService;
}
