/**
 * Deep Work Tasks Hook - REFACTORED to use Generic Task Hook Factory
 * Maintains full backward compatibility with the original API
 */

import { createTaskHook, type TaskHookFactoryConfig } from '../../_shared/hooks/useTaskHookFactory';
import {
  deepWorkCacheAdapter,
  mapSupabaseDeepWorkTask,
  type DeepWorkTaskRow,
} from './deepWork/deepWorkTaskCache';
import { deepWorkSyncAdapter } from './deepWork/deepWorkTaskSync';

// ============================================================================
// TYPES (maintained for backward compatibility)
// ============================================================================

export interface DeepWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  estimatedTime?: string;
  requiresFocus: boolean;
  complexityLevel?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DeepWorkTask {
  id: string;
  userId: string;
  clientId?: string | null;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  taskDate?: string;
  dueDate?: string | null;
  estimatedDuration?: number;
  focusBlocks: number;
  breakDuration: number;
  interruptionMode: boolean;
  rollovers: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  actualDurationMin?: number;
  timeEstimate?: string | null;
  subtasks: DeepWorkSubtask[];
}

export interface UseDeepWorkTasksProps {
  selectedDate: Date;
}

// ============================================================================
// FACTORY CONFIGURATION
// ============================================================================

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

const deepWorkConfig: TaskHookFactoryConfig<DeepWorkTask, DeepWorkSubtask> = {
  taskType: 'deep',

  tables: {
    tasks: 'deep_work_tasks',
    subtasks: 'deep_work_subtasks',
  },

  cacheStoreName: 'deepWorkTasks',

  cacheAdapter: deepWorkCacheAdapter,

  syncAdapter: deepWorkSyncAdapter,

  generateTaskId: () => `deep-${Date.now()}`,

  getDefaultSubtasks: () => [],

  mapSupabaseTask: mapSupabaseDeepWorkTask,

  mapSupabaseSubtask,

  buildInsertPayload: (taskData, internalUserId, dateString) => ({
    user_id: internalUserId,
    client_id: taskData.clientId ?? null,
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
    focus_blocks: taskData.focusBlocks ?? 4,
    break_duration: taskData.breakDuration ?? 15,
    interruption_mode: taskData.interruptionMode ?? false,
  }),

  buildOptimisticTask: (taskData, internalUserId, dateString, now) => ({
    id: '', // Will be set by the factory
    userId: internalUserId,
    clientId: taskData.clientId ?? null,
    title: taskData.title || '',
    description: taskData.description,
    priority: (taskData.priority as DeepWorkTask['priority']) || 'MEDIUM',
    completed: false,
    originalDate: dateString,
    currentDate: dateString,
    dueDate: taskData.dueDate ?? null,
    estimatedDuration: taskData.estimatedDuration,
    focusBlocks: taskData.focusBlocks ?? 4,
    breakDuration: taskData.breakDuration ?? 15,
    interruptionMode: taskData.interruptionMode ?? false,
    rollovers: taskData.rollovers ?? 0,
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

const useDeepWorkTasksHook = createTaskHook<DeepWorkTask, DeepWorkSubtask>(deepWorkConfig);

// ============================================================================
// EXPORT (maintains backward compatibility)
// ============================================================================

export function useDeepWorkTasksSupabase({ selectedDate }: UseDeepWorkTasksProps) {
  return useDeepWorkTasksHook({ selectedDate });
}

// Re-export types for consumers
export type { DeepWorkTaskRow } from './deepWork/deepWorkTaskCache';
export { deepWorkCacheAdapter, deepWorkSyncAdapter };
