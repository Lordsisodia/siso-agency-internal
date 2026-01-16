import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { offlineDb } from '@/services/offline/offlineDb';
import { logger } from '@/lib/utils/logger';
import type { DeepWorkTask } from '../useDeepWorkTasksSupabase';
import { logger } from '@/lib/utils/logger';
import {
  buildDeepWorkQueuePayload,
  markDeepWorkTaskSynced,
  saveDeepWorkTaskToCache,
  mapSupabaseDeepWorkTask,
} from './deepWorkTaskCache';

export type DeepWorkAction = 'create' | 'update' | 'delete';

export interface DeepWorkMutationContext {
  supabase: SupabaseClient | null;
  action: DeepWorkAction;
  payload: any;
}

export interface DeepWorkMutationResult<T> {
  data?: T;
  queued: boolean;
  error?: string;
}

export async function persistOptimisticDeepTask(task: DeepWorkTask, markForSync = true): Promise<void> {
  await saveDeepWorkTaskToCache(task, markForSync);
}

export async function queueDeepWorkTask(action: DeepWorkAction, task: DeepWorkTask): Promise<void> {
  await offlineDb.queueAction(action, 'deepWorkTasks', buildDeepWorkQueuePayload(task));
}

export async function handleDeepWorkMutation<T>(
  ctx: DeepWorkMutationContext,
  executor: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<DeepWorkMutationResult<T | null>> {
  if (!ctx.supabase) {
    await offlineDb.queueAction(ctx.action, 'deepWorkTasks', ctx.payload);
    return { queued: true, error: 'Supabase client unavailable – queued for sync.' };
  }

  const { data, error } = await executor();
  if (error) {
    console.warn('[DeepWorkSync] Supabase mutation failed:', error.message);
    await offlineDb.queueAction(ctx.action, 'deepWorkTasks', ctx.payload);
    return { queued: true, error: error.message };
  }

  if (ctx.payload?.id) {
    await markDeepWorkTaskSynced(ctx.payload.id);
  }

  return { data, queued: false };
}

export { mapSupabaseDeepWorkTask, markDeepWorkTaskSynced };
