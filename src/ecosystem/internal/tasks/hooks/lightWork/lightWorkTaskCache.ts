import { offlineDb } from '@/shared/offline/offlineDb';
import type { LightWorkSubtask, LightWorkTask } from '../useLightWorkTasksSupabase';

export type LightWorkTaskRow = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  original_date: string;
  task_date?: string | null;
  estimated_duration?: number | null;
  rollovers?: number | null;
  tags?: string[] | null;
  category?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  started_at?: string | null;
  actual_duration_min?: number | null;
  time_estimate?: string | null;
  due_date?: string | null;
  subtasks?: any[] | null;
};

const DEFAULT_PRIORITY: LightWorkTask['priority'] = 'MEDIUM';

const mapSupabaseSubtask = (subtask: any): LightWorkSubtask => ({
  id: subtask.id,
  taskId: subtask.task_id,
  title: subtask.title,
  text: subtask.text || subtask.title,
  completed: Boolean(subtask.completed),
  priority: subtask.priority,
  dueDate: subtask.due_date,
  estimatedTime: subtask.estimated_time,
  createdAt: subtask.created_at,
  updatedAt: subtask.updated_at,
  completedAt: subtask.completed_at,
});

export const mapSupabaseLightWorkTask = (task: LightWorkTaskRow): LightWorkTask => ({
  id: task.id,
  userId: task.user_id,
  title: task.title,
  description: task.description ?? undefined,
  priority: task.priority || DEFAULT_PRIORITY,
  completed: task.completed,
  originalDate: task.original_date,
  currentDate: task.task_date || task.original_date,
  taskDate: task.task_date || task.original_date,
  estimatedDuration: task.estimated_duration ?? undefined,
  rollovers: task.rollovers ?? 0,
  tags: Array.isArray(task.tags) ? task.tags : [],
  category: task.category ?? undefined,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
  completedAt: task.completed_at ?? undefined,
  startedAt: task.started_at ?? undefined,
  actualDurationMin: task.actual_duration_min ?? undefined,
  timeEstimate: task.time_estimate ?? undefined,
  dueDate: task.due_date ?? undefined,
  subtasks: Array.isArray(task.subtasks)
    ? task.subtasks.map(mapSupabaseSubtask)
    : [],
});

export const mapOfflineRecordToLightWorkTask = (record: any): LightWorkTask => ({
  id: record.id,
  userId: record.user_id,
  title: record.title,
  description: record.description ?? undefined,
  priority: record.priority || DEFAULT_PRIORITY,
  completed: record.completed,
  originalDate: record.original_date,
  currentDate: record.task_date || record.original_date,
  taskDate: record.task_date || record.original_date,
  estimatedDuration: record.estimated_duration ?? undefined,
  rollovers: record.rollovers ?? 0,
  tags: Array.isArray(record.tags) ? record.tags : [],
  category: record.category ?? undefined,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  completedAt: record.completed_at ?? undefined,
  startedAt: record.started_at ?? undefined,
  actualDurationMin: record.actual_duration_min ?? undefined,
  timeEstimate: record.time_estimate ?? undefined,
  dueDate: record.due_date ?? undefined,
  subtasks: Array.isArray(record.subtasks)
    ? record.subtasks.map(mapSupabaseSubtask)
    : [],
});

export const mapLightWorkTaskToOfflineRecord = (task: LightWorkTask) => ({
  id: task.id,
  user_id: task.userId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  completed: task.completed,
  original_date: task.originalDate,
  task_date: task.currentDate,
  estimated_duration: task.estimatedDuration,
  rollovers: task.rollovers,
  tags: task.tags,
  category: task.category,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  completed_at: task.completedAt,
  started_at: task.startedAt,
  actual_duration_min: task.actualDurationMin,
  time_estimate: task.timeEstimate,
  due_date: task.dueDate,
  subtasks: task.subtasks,
});

export async function loadLightWorkTasksFromCache(date?: string): Promise<LightWorkTask[]> {
  const records = await offlineDb.getLightWorkTasks(date);
  return records.map(mapOfflineRecordToLightWorkTask);
}

export async function saveLightWorkTaskToCache(task: LightWorkTask, markForSync = true): Promise<void> {
  await offlineDb.saveLightWorkTask(mapLightWorkTaskToOfflineRecord(task), markForSync);
}

export async function cacheSupabaseLightWorkTasks(rows: LightWorkTaskRow[]): Promise<LightWorkTask[]> {
  const tasks = rows.map(mapSupabaseLightWorkTask);
  for (const task of tasks) {
    await saveLightWorkTaskToCache(task, false);
  }
  return tasks;
}

export async function markLightWorkTaskSynced(taskId: string): Promise<void> {
  await offlineDb.markTaskSynced(taskId, 'lightWorkTasks');
}

export function buildLightWorkQueuePayload(task: LightWorkTask): any {
  return mapLightWorkTaskToOfflineRecord(task);
}
