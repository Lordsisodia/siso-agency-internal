import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { offlineDb } from '@/shared/offline/offlineDb';
import type { LightWorkTask } from '../useLightWorkTasksSupabase';
import { mapLightWorkTaskToOfflineRecord, mapSupabaseLightWorkTask, saveLightWorkTaskToCache, markLightWorkTaskSynced } from './lightWorkTaskCache';

export type LightWorkAction = 'create' | 'update' | 'delete';

export interface LightWorkSyncContext {
  supabase: SupabaseClient | null;
  queueData: any;
  action: LightWorkAction;
}

export interface LightWorkSyncResult<T> {
  data?: T;
  queued: boolean;
  error?: string;
}

export async function queueLightWorkAction(action: LightWorkAction, data: any): Promise<void> {
  await offlineDb.queueAction(action, 'lightWorkTasks', data);
}

export async function handleLightWorkMutation<T>(
  context: LightWorkSyncContext,
  executor: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<LightWorkSyncResult<T | null>> {
  if (!context.supabase) {
    await queueLightWorkAction(context.action, context.queueData);
    return { queued: true, error: 'Supabase client unavailable – queued for sync.' };
  }

  const { data, error } = await executor();
  if (error) {
    console.warn('[LightWorkSync] Supabase mutation failed, queuing offline:', error.message);
    await queueLightWorkAction(context.action, context.queueData);
    return { queued: true, error: error.message };
  }

  if (context.queueData?.id) {
    await markLightWorkTaskSynced(context.queueData.id);
  }

  return { data, queued: false };
}

export async function cacheSupabaseLightWorkTasks(rows: any[]): Promise<LightWorkTask[]> {
  const tasks = rows.map(mapSupabaseLightWorkTask);
  for (const task of tasks) {
    await saveLightWorkTaskToCache(task, false);
  }
  return tasks;
}

export async function persistOptimisticLightTask(task: LightWorkTask, markForSync = true): Promise<void> {
  await saveLightWorkTaskToCache(task, markForSync);
}

export async function removeLightWorkQueuedAction(actionId: string): Promise<void> {
  await offlineDb.removeAction(actionId);
}

export function buildQueuePayload(task: LightWorkTask): any {
  return mapLightWorkTaskToOfflineRecord(task);
}

