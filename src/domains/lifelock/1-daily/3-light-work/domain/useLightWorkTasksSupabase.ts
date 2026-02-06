/**
 * Light Work Tasks Hook - REFACTORED to use Generic Task Hook Factory
 * Maintains full backward compatibility with the original API
 */

import { createTaskHook, type TaskHookFactoryConfig } from '../../_shared/hooks/useTaskHookFactory';
import {
  lightWorkCacheAdapter,
  mapSupabaseLightWorkTask,
  type LightWorkTaskRow,
} from './lightWork/lightWorkTaskCache';
import { lightWorkSyncAdapter } from './lightWork/lightWorkTaskSync';

// ============================================================================
// TYPES (maintained for backward compatibility)
// ============================================================================

export interface LightWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LightWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  taskDate?: string;
  estimatedDuration?: number;
  rollovers: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  actualDurationMin?: number;
  timeEstimate?: string;
  dueDate?: string;
  subtasks: LightWorkSubtask[];
}

export interface UseLightWorkTasksProps {
  selectedDate: Date;
}

// ============================================================================
// FACTORY CONFIGURATION
// ============================================================================

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

const lightWorkConfig: TaskHookFactoryConfig<LightWorkTask, LightWorkSubtask> = {
  taskType: 'light',

  tables: {
    tasks: 'light_work_tasks',
    subtasks: 'light_work_subtasks',
  },

  cacheStoreName: 'lightWorkTasks',

  cacheAdapter: lightWorkCacheAdapter,

  syncAdapter: lightWorkSyncAdapter,

  generateTaskId: () => `light-${Date.now()}`,

  getDefaultSubtasks: () => [],

  mapSupabaseTask: mapSupabaseLightWorkTask,

  mapSupabaseSubtask,

  buildInsertPayload: (taskData, internalUserId, dateString) => ({
    user_id: internalUserId,
    title: taskData.title ?? '',
    description: taskData.description,
    priority: taskData.priority || 'MEDIUM',
    original_date: dateString,
    task_date: dateString,
    completed: false,
    rollovers: taskData.rollovers ?? 0,
    tags: taskData.tags ?? [],
    category: taskData.category,
    estimated_duration: taskData.estimatedDuration,
    time_estimate: taskData.timeEstimate ?? null,
    due_date: taskData.dueDate ?? null,
  }),

  buildOptimisticTask: (taskData, internalUserId, dateString, now) => ({
    id: '', // Will be set by the factory
    userId: internalUserId,
    title: taskData.title || '',
    description: taskData.description,
    priority: (taskData.priority as LightWorkTask['priority']) || 'MEDIUM',
    completed: false,
    originalDate: dateString,
    currentDate: dateString,
    estimatedDuration: taskData.estimatedDuration,
    timeEstimate: taskData.timeEstimate,
    dueDate: taskData.dueDate,
    rollovers: 0,
    tags: taskData.tags ?? [],
    category: taskData.category,
    createdAt: now,
    updatedAt: now,
    subtasks: [],
  }),
};

// ============================================================================
// HOOK FACTORY INSTANCE
// ============================================================================

const useLightWorkTasksHook = createTaskHook<LightWorkTask, LightWorkSubtask>(lightWorkConfig);

// ============================================================================
// EXPORT (maintains backward compatibility)
// ============================================================================

export function useLightWorkTasksSupabase({ selectedDate }: UseLightWorkTasksProps) {
  return useLightWorkTasksHook({ selectedDate });
}

// Re-export types for consumers
export type { LightWorkTaskRow } from './lightWork/lightWorkTaskCache';
export { lightWorkCacheAdapter, lightWorkSyncAdapter };
