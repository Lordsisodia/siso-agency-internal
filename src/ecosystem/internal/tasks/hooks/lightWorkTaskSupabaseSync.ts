import type { SupabaseClient } from '@supabase/supabase-js';
import { cacheSupabaseLightWorkTasks, mapSupabaseTaskToLightWorkTask } from './lightWorkTaskCache';
import type { LightWorkTask, SupabaseLightWorkTaskRow } from './lightWorkTaskTypes';

export async function fetchLightWorkTasksFromSupabase(
  client: SupabaseClient,
  userId: string,
): Promise<LightWorkTask[]> {
  const { data, error } = await client
    .from('light_work_tasks')
    .select(`
      *,
      subtasks:light_work_subtasks(*)
    `)
    .eq('user_id', userId)
    .eq('completed', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const tasks = (data as SupabaseLightWorkTaskRow[]) ?? [];

  await cacheSupabaseLightWorkTasks(tasks);

  return tasks.map(mapSupabaseTaskToLightWorkTask);
}
