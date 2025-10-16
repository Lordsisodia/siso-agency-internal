import { offlineDb } from '@/shared/offline/offlineDb';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseLightWorkTaskInsert } from './lightWorkTaskTypes';

export async function syncLightWorkTaskCreation({
  supabase,
  payload,
  taskId,
}: {
  supabase: SupabaseClient | null;
  payload: SupabaseLightWorkTaskInsert;
  taskId: string;
}): Promise<void> {
  if (!supabase || !navigator.onLine) {
    await offlineDb.queueAction('create', 'lightWorkTasks', payload);
    return;
  }

  try {
    const { error } = await supabase.from('light_work_tasks').insert(payload);

    if (error) {
      throw new Error(error.message);
    }

    await offlineDb.markTaskSynced(taskId, 'lightWorkTasks');
  } catch (error) {
    await offlineDb.queueAction('create', 'lightWorkTasks', payload);
    throw error;
  }
}
