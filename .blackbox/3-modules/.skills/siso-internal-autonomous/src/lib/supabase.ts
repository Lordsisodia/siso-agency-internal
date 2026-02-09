/**
 * Supabase client utilities for autonomous task skill
 */

import { SkillContext } from '../index';

export interface AutonomousSubtask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical' | null;
  agent_metadata: Record<string, any>;
  summary: string | null;
  created_by_agent_id: string | null;
  assigned_agent_role: 'researcher' | 'coder' | 'reviewer' | 'architect' | 'planner' | 'verifier' | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_min: number | null;
  verification_required: boolean;
  verified_by_agent_id: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Build Supabase REST API URL
 */
function buildUrl(supabaseUrl: string, table: string, query?: string): string {
  const base = `${supabaseUrl}/rest/v1/${table}`;
  return query ? `${base}?${query}` : base;
}

/**
 * Get auth headers for Supabase requests
 */
function getHeaders(supabaseKey: string): Record<string, string> {
  return {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

/**
 * Create a new autonomous subtask
 */
export async function insertSubtask(
  subtask: Omit<AutonomousSubtask, 'id' | 'created_at' | 'updated_at'>,
  context: SkillContext
): Promise<AutonomousSubtask> {
  const url = buildUrl(context.supabaseUrl, 'autonomous_subtasks');
  const headers = getHeaders(context.supabaseKey);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(subtask)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subtask: ${error}`);
  }

  const data = await response.json();
  return data[0];
}

/**
 * Update subtask status and metadata
 */
export async function updateSubtask(
  subtaskId: string,
  updates: Partial<AutonomousSubtask>,
  context: SkillContext
): Promise<AutonomousSubtask> {
  const query = `id=eq.${subtaskId}`;
  const url = buildUrl(context.supabaseUrl, 'autonomous_subtasks', query);
  const headers = getHeaders(context.supabaseKey);

  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update subtask: ${error}`);
  }

  const data = await response.json();
  return data[0];
}

/**
 * Get subtask by ID
 */
export async function getSubtask(
  subtaskId: string,
  context: SkillContext
): Promise<AutonomousSubtask | null> {
  const query = `id=eq.${subtaskId}`;
  const url = buildUrl(context.supabaseUrl, 'autonomous_subtasks', query);
  const headers = getHeaders(context.supabaseKey);

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get subtask: ${error}`);
  }

  const data = await response.json();
  return data[0] || null;
}

/**
 * List subtasks for a parent task
 */
export async function listSubtasksByParent(
  parentTaskId: string,
  statusFilter?: string,
  context: SkillContext
): Promise<AutonomousSubtask[]> {
  let query = `parent_task_id=eq.${parentTaskId}`;
  if (statusFilter) {
    query += `&status=eq.${statusFilter}`;
  }
  query += '&order=created_at.desc';

  const url = buildUrl(context.supabaseUrl, 'autonomous_subtasks', query);
  const headers = getHeaders(context.supabaseKey);

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list subtasks: ${error}`);
  }

  return await response.json();
}

/**
 * Merge agent metadata (deep merge JSONB)
 */
export async function mergeAgentMetadata(
  subtaskId: string,
  metadata: Record<string, any>,
  context: SkillContext
): Promise<AutonomousSubtask> {
  // First get current metadata
  const subtask = await getSubtask(subtaskId, context);
  if (!subtask) {
    throw new Error(`Subtask ${subtaskId} not found`);
  }

  // Deep merge
  const mergedMetadata = {
    ...subtask.agent_metadata,
    ...metadata,
    // Special handling for arrays - append rather than replace
    spawned_agents: [
      ...(subtask.agent_metadata?.spawned_agents || []),
      ...(metadata.spawned_agents || [])
    ]
  };

  return updateSubtask(subtaskId, { agent_metadata: mergedMetadata }, context);
}