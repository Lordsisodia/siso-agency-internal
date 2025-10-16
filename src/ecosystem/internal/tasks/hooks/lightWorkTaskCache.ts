import { offlineDb } from '@/shared/offline/offlineDb';
import {
  LightWorkTask,
  LightWorkSubtask,
  OfflineLightWorkTaskRecord,
  SupabaseLightWorkTaskRow,
  SupabaseLightWorkSubtaskRow,
  SupabaseLightWorkTaskInsert,
} from './lightWorkTaskTypes';

const DEFAULT_PRIORITY: LightWorkTask['priority'] = 'MEDIUM';

function mapOfflineSubtasks(): LightWorkSubtask[] {
  // IndexedDB currently does not store subtasks locally.
  return [];
}

export function mapOfflineTaskToLightWorkTask(task: OfflineLightWorkTaskRecord): LightWorkTask {
  return {
    id: task.id,
    userId: task.user_id,
    title: task.title,
    description: task.description,
    priority: task.priority ?? DEFAULT_PRIORITY,
    completed: task.completed,
    originalDate: task.original_date,
    currentDate: task.task_date,
    taskDate: task.task_date,
    estimatedDuration: task.estimated_duration,
    rollovers: 0,
    tags: [],
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    completedAt: task.completed_at,
    subtasks: mapOfflineSubtasks(),
  };
}

export function mapSupabaseSubtaskToLightWorkSubtask(subtask: SupabaseLightWorkSubtaskRow): LightWorkSubtask {
  return {
    id: subtask.id,
    taskId: subtask.task_id,
    title: subtask.title,
    text: subtask.text ?? subtask.title,
    completed: subtask.completed,
    priority: subtask.priority ?? undefined,
    dueDate: subtask.due_date ?? undefined,
    estimatedTime: subtask.estimated_time ?? undefined,
    createdAt: subtask.created_at,
    updatedAt: subtask.updated_at,
    completedAt: subtask.completed_at ?? undefined,
  };
}

export function mapSupabaseTaskToLightWorkTask(task: SupabaseLightWorkTaskRow): LightWorkTask {
  return {
    id: task.id,
    userId: task.user_id,
    title: task.title,
    description: task.description ?? undefined,
    priority: task.priority,
    completed: task.completed,
    originalDate: task.original_date,
    currentDate: task.task_date ?? task.original_date,
    taskDate: task.task_date ?? undefined,
    estimatedDuration: task.estimated_duration ?? undefined,
    rollovers: task.rollovers ?? 0,
    tags: task.tags ?? [],
    category: task.category ?? undefined,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    completedAt: task.completed_at ?? undefined,
    startedAt: task.started_at ?? undefined,
    actualDurationMin: task.actual_duration_min ?? undefined,
    timeEstimate: task.time_estimate ?? undefined,
    dueDate: task.due_date ?? undefined,
    subtasks: (task.subtasks ?? []).map(mapSupabaseSubtaskToLightWorkSubtask),
  };
}

export async function loadCachedLightWorkTasks(dateString: string): Promise<LightWorkTask[]> {
  const localTasks = await offlineDb.getLightWorkTasks(dateString);
  return localTasks.map(mapOfflineTaskToLightWorkTask);
}

export async function cacheSupabaseLightWorkTasks(tasks: SupabaseLightWorkTaskRow[]): Promise<void> {
  for (const task of tasks) {
    const offlineRecord: OfflineLightWorkTaskRecord = {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description ?? undefined,
      priority: task.priority,
      completed: task.completed,
      original_date: task.original_date,
      task_date: task.task_date ?? task.original_date,
      estimated_duration: task.estimated_duration ?? undefined,
      actual_duration_min: task.actual_duration_min ?? undefined,
      xp_reward: undefined,
      difficulty: undefined,
      complexity: undefined,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at ?? undefined,
    };

    await offlineDb.saveLightWorkTask(offlineRecord, false);
  }
}

export async function createLocalLightWorkTask(
  internalUserId: string,
  dateString: string,
  taskData: Partial<LightWorkTask>,
): Promise<{
  localTask: LightWorkTask;
  supabasePayload: SupabaseLightWorkTaskInsert;
}> {
  const taskId = `light-${Date.now()}`;
  const now = new Date().toISOString();

  const offlineRecord: OfflineLightWorkTaskRecord = {
    id: taskId,
    user_id: internalUserId,
    title: taskData.title || '',
    description: taskData.description,
    priority: taskData.priority ?? DEFAULT_PRIORITY,
    completed: false,
    original_date: dateString,
    task_date: dateString,
    estimated_duration: taskData.estimatedDuration,
    created_at: now,
    updated_at: now,
  };

  await offlineDb.saveLightWorkTask(offlineRecord, true);

  const localTask = mapOfflineTaskToLightWorkTask(offlineRecord);

  const supabasePayload: SupabaseLightWorkTaskInsert = {
    id: offlineRecord.id,
    user_id: offlineRecord.user_id,
    title: offlineRecord.title,
    description: offlineRecord.description,
    priority: offlineRecord.priority ?? DEFAULT_PRIORITY,
    original_date: offlineRecord.original_date,
    task_date: offlineRecord.task_date,
    completed: offlineRecord.completed,
    rollovers: taskData.rollovers ?? 0,
    tags: taskData.tags ?? [],
    category: taskData.category,
    estimated_duration: offlineRecord.estimated_duration,
    due_date: taskData.dueDate,
    time_estimate: taskData.timeEstimate,
  };

  return { localTask, supabasePayload };
}
