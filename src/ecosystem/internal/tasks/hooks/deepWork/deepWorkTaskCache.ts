import { offlineDb } from '@/shared/offline/offlineDb';
import type { DeepWorkSubtask, DeepWorkTask } from '../useDeepWorkTasksSupabase';

export type DeepWorkTaskRow = {
  id: string;
  user_id: string;
  client_id?: string | null;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  original_date: string;
  task_date?: string | null;
  due_date?: string | null;
  estimated_duration?: number | null;
  focus_blocks?: number | null;
  break_duration?: number | null;
  interruption_mode?: boolean | null;
  rollovers?: number | null;
  tags?: string[] | null;
  category?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  started_at?: string | null;
  actual_duration_min?: number | null;
  time_estimate?: string | null;
  subtasks?: any[] | null;
};

const DEFAULT_PRIORITY: DeepWorkTask['priority'] = 'MEDIUM';

const mapSupabaseSubtask = (subtask: any): DeepWorkSubtask => ({
  id: subtask.id,
  taskId: subtask.task_id,
  title: subtask.title,
  text: subtask.text || subtask.title,
  completed: Boolean(subtask.completed),
  priority: subtask.priority,
  dueDate: subtask.due_date,
  estimatedTime: subtask.estimated_time,
  requiresFocus: subtask.requires_focus ?? false,
  complexityLevel: subtask.complexity_level ?? 1,
  createdAt: subtask.created_at,
  updatedAt: subtask.updated_at,
  completedAt: subtask.completed_at,
});

export const mapSupabaseDeepWorkTask = (task: DeepWorkTaskRow): DeepWorkTask => ({
  id: task.id,
  userId: task.user_id,
  clientId: task.client_id ?? null,
  title: task.title,
  description: task.description ?? undefined,
  priority: task.priority || DEFAULT_PRIORITY,
  completed: task.completed,
  originalDate: task.original_date,
  currentDate: task.task_date || task.original_date,
  taskDate: task.task_date || task.original_date,
  dueDate: task.due_date ?? null,
  estimatedDuration: task.estimated_duration ?? undefined,
  focusBlocks: task.focus_blocks ?? 4,
  breakDuration: task.break_duration ?? 15,
  interruptionMode: task.interruption_mode ?? false,
  rollovers: task.rollovers ?? 0,
  tags: Array.isArray(task.tags) ? task.tags : [],
  category: task.category ?? undefined,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
  completedAt: task.completed_at ?? undefined,
  startedAt: task.started_at ?? undefined,
  actualDurationMin: task.actual_duration_min ?? undefined,
  timeEstimate: task.time_estimate ?? undefined,
  subtasks: Array.isArray(task.subtasks)
    ? task.subtasks.map(mapSupabaseSubtask)
    : [],
});

export const mapOfflineRecordToDeepWorkTask = (record: any): DeepWorkTask => ({
  id: record.id,
  userId: record.user_id,
  clientId: record.client_id ?? null,
  title: record.title,
  description: record.description ?? undefined,
  priority: record.priority || DEFAULT_PRIORITY,
  completed: record.completed,
  originalDate: record.original_date,
  currentDate: record.task_date || record.original_date,
  taskDate: record.task_date || record.original_date,
  dueDate: record.due_date ?? null,
  estimatedDuration: record.estimated_duration ?? undefined,
  focusBlocks: record.focus_blocks ?? 4,
  breakDuration: record.break_duration ?? 15,
  interruptionMode: record.interruption_mode ?? false,
  rollovers: record.rollovers ?? 0,
  tags: Array.isArray(record.tags) ? record.tags : [],
  category: record.category ?? undefined,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  completedAt: record.completed_at ?? undefined,
  startedAt: record.started_at ?? undefined,
  actualDurationMin: record.actual_duration_min ?? undefined,
  timeEstimate: record.time_estimate ?? undefined,
  subtasks: Array.isArray(record.subtasks)
    ? record.subtasks.map(mapSupabaseSubtask)
    : [],
});

export const mapDeepWorkTaskToOfflineRecord = (task: DeepWorkTask) => ({
  id: task.id,
  user_id: task.userId,
  client_id: task.clientId ?? null,
  title: task.title,
  description: task.description,
  priority: task.priority,
  completed: task.completed,
  original_date: task.originalDate,
  task_date: task.currentDate,
  due_date: task.dueDate,
  estimated_duration: task.estimatedDuration,
  focus_blocks: task.focusBlocks,
  break_duration: task.breakDuration,
  interruption_mode: task.interruptionMode,
  rollovers: task.rollovers,
  tags: task.tags,
  category: task.category,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  completed_at: task.completedAt,
  started_at: task.startedAt,
  actual_duration_min: task.actualDurationMin,
  time_estimate: task.timeEstimate,
  subtasks: task.subtasks,
});

export async function loadDeepWorkTasksFromCache(date?: string): Promise<DeepWorkTask[]> {
  const records = await offlineDb.getDeepWorkTasks(date);
  return records.map(mapOfflineRecordToDeepWorkTask);
}

export async function saveDeepWorkTaskToCache(task: DeepWorkTask, markForSync = true): Promise<void> {
  await offlineDb.saveDeepWorkTask(mapDeepWorkTaskToOfflineRecord(task), markForSync);
}

export async function cacheSupabaseDeepWorkTasks(rows: DeepWorkTaskRow[]): Promise<DeepWorkTask[]> {
  const tasks = rows.map(mapSupabaseDeepWorkTask);
  for (const task of tasks) {
    await saveDeepWorkTaskToCache(task, false);
  }
  return tasks;
}

export async function markDeepWorkTaskSynced(taskId: string): Promise<void> {
  await offlineDb.markTaskSynced(taskId, 'deepWorkTasks');
}

export function buildDeepWorkQueuePayload(task: DeepWorkTask): any {
  return mapDeepWorkTaskToOfflineRecord(task);
}
