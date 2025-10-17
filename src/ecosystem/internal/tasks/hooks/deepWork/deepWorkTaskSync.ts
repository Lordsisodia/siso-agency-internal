import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { offlineDb } from '@/shared/offline/offlineDb';
import type { DeepWorkTask } from '../useDeepWorkTasksSupabase';
import {
  markDeepWorkTaskSynced,
  mapDeepWorkTaskToOfflineRecord,
  mapSupabaseDeepWorkTask,
  saveDeepWorkTaskToCache,
} from './deepWorkTaskCache';

export type DeepWorkAction = 'create' | 'update' | 'delete';

export interface DeepWorkSyncContext {
  supabase: SupabaseClient | null;
  action: DeepWorkAction;
  queueData: any;
}

export interface DeepWorkSyncResult<T> {
  data?: T;
  queued: boolean;
  error?: string;
}

export async function queueDeepWorkAction(action: DeepWorkAction, data: any): Promise<void> {
  await offlineDb.queueAction(action, 'deepWorkTasks', data);
}

export async function handleDeepWorkMutation<T>(
  context: DeepWorkSyncContext,
  executor: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<DeepWorkSyncResult<T | null>> {
  if (!context.supabase) {
    await queueDeepWorkAction(context.action, context.queueData);
    return { queued: true, error: 'Supabase client unavailable – queued for sync.' };
  }

  const { data, error } = await executor();
  if (error) {
    console.warn('[DeepWorkSync] Supabase mutation failed, queuing offline:', error.message);
    await queueDeepWorkAction(context.action, context.queueData);
    return { queued: true, error: error.message };
  }

  if (context.queueData?.id) {
    await markDeepWorkTaskSynced(context.queueData.id);
  }

  return { data, queued: false };
}

export async function cacheSupabaseDeepWorkTasks(rows: any[]): Promise<DeepWorkTask[]> {
  const tasks = rows.map(mapSupabaseDeepWorkTask);
  for (const task of tasks) {
    await saveDeepWorkTaskToCache(task, false);
  }
  return tasks;
}

export async function persistOptimisticDeepTask(task: DeepWorkTask, markForSync = true): Promise<void> {
  await saveDeepWorkTaskToCache(task, markForSync);
}

export function buildDeepWorkQueuePayload(task: DeepWorkTask): any {
  return mapDeepWorkTaskToOfflineRecord(task);
}

