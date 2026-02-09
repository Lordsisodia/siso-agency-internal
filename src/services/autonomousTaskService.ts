/**
 * Autonomous Task Service
 *
 * Handles integration between the task system and autonomous subtasks.
 */

import { supabase } from '@/lib/supabase/client';

export interface AutonomousSubtask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical' | null;
  agent_metadata: Record<string, any>;
  summary: string | null;
  assigned_agent_role: 'researcher' | 'coder' | 'reviewer' | 'architect' | 'planner' | 'verifier' | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_min: number | null;
  verification_required: boolean;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubtaskInput {
  parent_task_id: string;
  title: string;
  description?: string;
  agent_role: 'researcher' | 'coder' | 'reviewer' | 'architect' | 'planner' | 'verifier';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  verification_required?: boolean;
  estimated_duration_min?: number;
}

export interface UpdateSubtaskInput {
  status?: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
  agent_metadata?: Record<string, any>;
  summary?: string;
  verification_notes?: string;
}

/**
 * Enable autonomous mode for a task
 */
export async function enableAutonomousMode(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('deep_work_tasks')
      .update({ is_autonomous_eligible: true })
      .eq('id', taskId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to enable autonomous mode'
    };
  }
}

/**
 * Disable autonomous mode for a task
 */
export async function disableAutonomousMode(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('deep_work_tasks')
      .update({ is_autonomous_eligible: false })
      .eq('id', taskId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to disable autonomous mode'
    };
  }
}

/**
 * Check if a task is autonomous-eligible
 */
export async function isAutonomousEligible(taskId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('deep_work_tasks')
      .select('is_autonomous_eligible')
      .eq('id', taskId)
      .single();

    if (error) throw error;

    return data?.is_autonomous_eligible || false;
  } catch {
    return false;
  }
}

/**
 * Get all autonomous subtasks for a parent task
 */
export async function getAutonomousSubtasks(
  taskId: string,
  statusFilter?: string
): Promise<AutonomousSubtask[]> {
  let query = supabase
    .from('autonomous_subtasks')
    .select('*')
    .eq('parent_task_id', taskId)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching autonomous subtasks:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new autonomous subtask
 */
export async function createAutonomousSubtask(
  input: CreateSubtaskInput
): Promise<{ subtask?: AutonomousSubtask; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('autonomous_subtasks')
      .insert({
        parent_task_id: input.parent_task_id,
        title: input.title,
        description: input.description || null,
        status: 'pending',
        priority: input.priority || 'medium',
        assigned_agent_role: input.agent_role,
        verification_required: input.verification_required !== false,
        estimated_duration_min: input.estimated_duration_min || null,
        agent_metadata: {
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;

    return { subtask: data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to create subtask'
    };
  }
}

/**
 * Update an autonomous subtask
 */
export async function updateAutonomousSubtask(
  subtaskId: string,
  input: UpdateSubtaskInput
): Promise<{ subtask?: AutonomousSubtask; error?: string }> {
  try {
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (input.status) {
      updates.status = input.status;

      // Set timestamps based on status
      if (input.status === 'executing') {
        updates.started_at = new Date().toISOString();
      }
      if (input.status === 'completed' || input.status === 'failed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (input.summary !== undefined) {
      updates.summary = input.summary;
    }

    if (input.verification_notes !== undefined) {
      updates.verification_notes = input.verification_notes;
    }

    if (input.agent_metadata) {
      // Get current metadata first
      const { data: current } = await supabase
        .from('autonomous_subtasks')
        .select('agent_metadata')
        .eq('id', subtaskId)
        .single();

      updates.agent_metadata = {
        ...current?.agent_metadata,
        ...input.agent_metadata
      };
    }

    const { data, error } = await supabase
      .from('autonomous_subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;

    return { subtask: data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to update subtask'
    };
  }
}

/**
 * Delete an autonomous subtask
 */
export async function deleteAutonomousSubtask(
  subtaskId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('autonomous_subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete subtask'
    };
  }
}

/**
 * Get subtask statistics for a parent task
 */
export async function getSubtaskStats(taskId: string): Promise<{
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
  byRole: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase
      .from('autonomous_subtasks')
      .select('status, assigned_agent_role')
      .eq('parent_task_id', taskId);

    if (error) throw error;

    const subtasks = data || [];

    const stats = {
      total: subtasks.length,
      completed: 0,
      failed: 0,
      inProgress: 0,
      pending: 0,
      byRole: {} as Record<string, number>
    };

    for (const subtask of subtasks) {
      // Count by status
      switch (subtask.status) {
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'executing':
        case 'verifying':
          stats.inProgress++;
          break;
        case 'pending':
        case 'planned':
          stats.pending++;
          break;
      }

      // Count by role
      if (subtask.assigned_agent_role) {
        stats.byRole[subtask.assigned_agent_role] =
          (stats.byRole[subtask.assigned_agent_role] || 0) + 1;
      }
    }

    return stats;
  } catch {
    return {
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: 0,
      pending: 0,
      byRole: {}
    };
  }
}

/**
 * Subscribe to autonomous subtask changes for a task
 */
export function subscribeToSubtasks(
  taskId: string,
  callback: (subtasks: AutonomousSubtask[]) => void
) {
  const subscription = supabase
    .channel(`autonomous-subtasks-${taskId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'autonomous_subtasks',
        filter: `parent_task_id=eq.${taskId}`
      },
      async () => {
        // Refetch all subtasks on any change
        const subtasks = await getAutonomousSubtasks(taskId);
        callback(subtasks);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Trigger autonomous planning for a task
 * This creates a planner subtask that will break down the task
 */
export async function triggerAutonomousPlanning(
  taskId: string,
  context?: Record<string, any>
): Promise<{ subtask?: AutonomousSubtask; error?: string }> {
  return createAutonomousSubtask({
    parent_task_id: taskId,
    title: 'Plan execution strategy',
    description: 'Analyze task and create detailed execution plan with subtasks',
    agent_role: 'planner',
    priority: 'high',
    verification_required: false
  });
}