/**
 * Convex Task Hooks - Use Convex instead of Supabase for tasks
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useMemo, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ConvexTask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  taskType: 'light' | 'deep' | 'today';
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  xpEarned?: number;
  completedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  taskType: 'light' | 'deep' | 'today';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedMinutes?: number;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all tasks for current user
 */
export function useConvexTasks() {
  const { user, isSignedIn } = useClerkUser();

  const tasks = useQuery(
    api.tasks.getTasks.list,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    tasks: tasks || [],
    isLoading: tasks === undefined,
  };
}

/**
 * Get tasks by type (light, deep, today)
 */
export function useConvexTasksByType(taskType: 'light' | 'deep' | 'today') {
  const { user, isSignedIn } = useClerkUser();

  const tasks = useQuery(
    api.tasks.getTasks.listByType,
    isSignedIn && user?.id ? { userId: user.id, taskType } : 'skip'
  );

  return {
    tasks: tasks || [],
    isLoading: tasks === undefined,
  };
}

/**
 * Get Light Work tasks
 */
export function useLightWorkConvexTasks() {
  return useConvexTasksByType('light');
}

/**
 * Get Deep Work tasks
 */
export function useDeepWorkConvexTasks() {
  return useConvexTasksByType('deep');
}

/**
 * Get Today's tasks
 */
export function useTodayConvexTasks() {
  return useConvexTasksByType('today');
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new task
 */
export function useCreateTask() {
  const { user, isSignedIn } = useClerkUser();

  const createTaskMutation = useMutation(api.tasks.createTask.create);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!isSignedIn || !user?.id) {
        throw new Error('Not authenticated');
      }
      return createTaskMutation({
        ...input,
        userId: user.id,
      });
    },
    [createTaskMutation, isSignedIn, user]
  );

  return { createTask };
}

/**
 * Update task status
 */
export function useUpdateTaskStatus() {
  const updateStatusMutation = useMutation(api.tasks.createTask.updateStatus);

  const updateStatus = useCallback(
    async (taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
      return updateStatusMutation({
        taskId: taskId as any, // Convex ID type
        status,
      });
    },
    [updateStatusMutation]
  );

  return { updateStatus };
}

/**
 * Complete a task with XP
 */
export function useCompleteTask() {
  const completeMutation = useMutation(api.tasks.createTask.complete);

  const completeTask = useCallback(
    async (taskId: string, actualMinutes?: number, xpEarned?: number) => {
      return completeMutation({
        taskId: taskId as any,
        actualMinutes,
        xpEarned,
      });
    },
    [completeMutation]
  );

  return { completeTask };
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const deleteMutation = useMutation(api.tasks.createTask.deleteTask);

  const deleteTask = useCallback(
    async (taskId: string) => {
      return deleteMutation({
        taskId: taskId as any,
      });
    },
    [deleteMutation]
  );

  return { deleteTask };
}
