import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { offlineDb } from '@/shared/offline/offlineDb';
import type { LightWorkTask } from '../useLightWorkTasksSupabase';
import {
  buildLightWorkQueuePayload,
  markLightWorkTaskSynced,
  saveLightWorkTaskToCache,
  mapSupabaseLightWorkTask,
} from './lightWorkTaskCache';

export type LightWorkAction = 'create' | 'update' | 'delete';

export interface LightWorkMutationContext {
  supabase: SupabaseClient | null;
  action: LightWorkAction;
  payload: any;
}

export interface LightWorkMutationResult<T> {
  data?: T;
  queued: boolean;
  error?: string;
}

export async function persistOptimisticLightTask(task: LightWorkTask, markForSync = true): Promise<void> {
  await saveLightWorkTaskToCache(task, markForSync);
}

export async function queueLightWorkTask(action: LightWorkAction, task: LightWorkTask): Promise<void> {
  await offlineDb.queueAction(action, 'lightWorkTasks', buildLightWorkQueuePayload(task));
}

export async function handleLightWorkMutation<T>(
  ctx: LightWorkMutationContext,
  executor: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<LightWorkMutationResult<T | null>> {
  if (!ctx.supabase) {
    await offlineDb.queueAction(ctx.action, 'lightWorkTasks', ctx.payload);
    return { queued: true, error: 'Supabase client unavailable – queued for sync.' };
  }

  const { data, error } = await executor();
  if (error) {
    console.warn('[LightWorkSync] Supabase mutation failed:', error.message);
    await offlineDb.queueAction(ctx.action, 'lightWorkTasks', ctx.payload);
    return { queued: true, error: error.message };
  }

  if (ctx.payload?.id) {
    await markLightWorkTaskSynced(ctx.payload.id);
  }

  return { data, queued: false };
}

export { mapSupabaseLightWorkTask, markLightWorkTaskSynced };
