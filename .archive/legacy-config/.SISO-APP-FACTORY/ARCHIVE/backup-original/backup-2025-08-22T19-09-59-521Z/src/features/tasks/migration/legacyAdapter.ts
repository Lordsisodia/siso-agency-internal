/**
 * Legacy Adapter
 * Converts legacy task data structures to new unified Task interface
 */

import { z } from 'zod';
import { Task, TaskStatus, TaskPriority, TaskCategory, CreateTaskRequest } from '../types/task.types';

// Legacy type definitions for conversion
interface LegacyTask {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  assigned_to?: string;
  project_id?: string;
  tags?: string[];
  completion_percentage?: number;
  estimated_hours?: number;
  actual_hours?: number;
  parent_task_id?: string;
  order_index?: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  attachments?: any[];
  comments?: any[];
  subtasks?: any[];
  dependencies?: any[];
  labels?: string[];
  custom_fields?: Record<string, any>;
  
  // Legacy specific fields that need mapping
  task_status?: string;
  task_priority?: string;
  task_category?: string;
  assignee?: string;
  assignee_id?: string;
  project?: string;
  deadline?: string;
  notes?: string;
  progress?: number;
  hours_estimated?: number;
  hours_actual?: number;
  parent_id?: string;
  sort_order?: number;
  recurring?: boolean;
  repeat_pattern?: string;
  files?: any[];
  task_comments?: any[];
  sub_tasks?: any[];
  blocked_by?: any[];
  task_tags?: string[];
  metadata?: Record<string, any>;
}

// Legacy status mapping
const LEGACY_STATUS_MAP: Record<string, TaskStatus> = {
  'todo': 'not_started',
  'pending': 'not_started',
  'not_started': 'not_started',
  'in_progress': 'in_progress',
  'active': 'in_progress',
  'working': 'in_progress',
  'doing': 'in_progress',
  'completed': 'completed',
  'done': 'completed',
  'finished': 'completed',
  'on_hold': 'on_hold',
  'paused': 'on_hold',
  'blocked': 'on_hold',
  'waiting': 'on_hold',
  'cancelled': 'on_hold',
  'archived': 'completed'
};

// Legacy priority mapping
const LEGACY_PRIORITY_MAP: Record<string, TaskPriority> = {
  'low': 'low',
  '1': 'low',
  'normal': 'medium',
  'medium': 'medium',
  '2': 'medium',
  'high': 'high',
  '3': 'high',
  'urgent': 'urgent',
  'critical': 'urgent',
  '4': 'urgent',
  '5': 'urgent'
};

// Legacy category mapping
const LEGACY_CATEGORY_MAP: Record<string, TaskCategory> = {
  'main': 'main',
  'general': 'main',
  'default': 'main',
  'weekly': 'weekly',
  'week': 'weekly',
  'daily': 'daily',
  'day': 'daily',
  'siso_app_dev': 'siso_app_dev',
  'app_dev': 'siso_app_dev',
  'development': 'siso_app_dev',
  'onboarding_app': 'onboarding_app',
  'onboarding': 'onboarding_app',
  'client_onboarding': 'onboarding_app',
  'instagram': 'instagram',
  'social': 'instagram',
  'marketing': 'instagram'
};

/**
 * Converts legacy task data to new Task interface
 */
export const convertLegacyTask = (legacyTask: LegacyTask): Task => {
  // Map status with fallback
  const status = mapLegacyStatus(
    legacyTask.status || 
    legacyTask.task_status || 
    'not_started'
  );

  // Map priority with fallback
  const priority = mapLegacyPriority(
    legacyTask.priority || 
    legacyTask.task_priority || 
    'medium'
  );

  // Map category with fallback
  const category = mapLegacyCategory(
    legacyTask.category || 
    legacyTask.task_category || 
    'main'
  );

  // Map assignee
  const assigned_to = legacyTask.assigned_to || 
                     legacyTask.assignee || 
                     legacyTask.assignee_id || 
                     undefined;

  // Map due date
  const due_date = legacyTask.due_date || 
                   legacyTask.deadline || 
                   undefined;

  // Map description
  const description = legacyTask.description || 
                     legacyTask.notes || 
                     undefined;

  // Map progress
  const completion_percentage = legacyTask.completion_percentage ?? 
                               legacyTask.progress ?? 
                               undefined;

  // Map estimated hours
  const estimated_hours = legacyTask.estimated_hours ?? 
                         legacyTask.hours_estimated ?? 
                         undefined;

  // Map actual hours
  const actual_hours = legacyTask.actual_hours ?? 
                      legacyTask.hours_actual ?? 
                      undefined;

  // Map parent task
  const parent_task_id = legacyTask.parent_task_id || 
                        legacyTask.parent_id || 
                        undefined;

  // Map order index
  const order_index = legacyTask.order_index ?? 
                     legacyTask.sort_order ?? 
                     0;

  // Map recurring settings
  const is_recurring = legacyTask.is_recurring ?? 
                      legacyTask.recurring ?? 
                      false;

  const recurrence_pattern = legacyTask.recurrence_pattern || 
                            legacyTask.repeat_pattern || 
                            undefined;

  // Map attachments
  const attachments = legacyTask.attachments || 
                     legacyTask.files || 
                     [];

  // Map comments
  const comments = legacyTask.comments || 
                  legacyTask.task_comments || 
                  [];

  // Map subtasks
  const subtasks = (legacyTask.subtasks || legacyTask.sub_tasks || [])
    .map((subtask: any) => convertLegacyTask(subtask));

  // Map dependencies
  const dependencies = legacyTask.dependencies || 
                      legacyTask.blocked_by || 
                      [];

  // Map tags
  const tags = legacyTask.tags || 
              legacyTask.task_tags || 
              legacyTask.labels || 
              [];

  // Map custom fields
  const custom_fields = legacyTask.custom_fields || 
                       legacyTask.metadata || 
                       {};

  // Map project
  const project_id = legacyTask.project_id || 
                    legacyTask.project || 
                    undefined;

  // Generate timestamps if missing
  const now = new Date().toISOString();
  const created_at = legacyTask.created_at || now;
  const updated_at = legacyTask.updated_at || now;

  return {
    // Core fields
    id: legacyTask.id,
    title: legacyTask.title,
    description,
    status,
    priority,
    category,
    due_date,
    created_at,
    updated_at,
    
    // Assignment and project
    assigned_to,
    project_id,
    
    // Progress and time tracking
    completion_percentage,
    estimated_hours,
    actual_hours,
    
    // Hierarchy and organization
    parent_task_id,
    order_index,
    tags,
    
    // Recurring tasks
    is_recurring,
    recurrence_pattern,
    
    // Relations
    attachments,
    comments,
    subtasks,
    dependencies,
    
    // Custom data
    custom_fields,
    
    // Computed fields
    is_overdue: due_date ? new Date(due_date) < new Date() && status !== 'completed' : false,
    has_subtasks: subtasks.length > 0,
    has_attachments: attachments.length > 0,
    has_comments: comments.length > 0,
    
    // Permission fields (default to true for legacy tasks)
    can_edit: true,
    can_delete: true,
    can_complete: true,
    
    // Optional fields with defaults
    is_starred: false,
    time_spent: actual_hours || 0,
    is_template: false,
    template_id: undefined,
    archived: status === 'completed' && completion_percentage === 100,
    archived_at: undefined
  };
};

/**
 * Maps legacy status to new TaskStatus enum
 */
export const mapLegacyStatus = (legacyStatus: string): TaskStatus => {
  const normalized = legacyStatus.toLowerCase().trim();
  return LEGACY_STATUS_MAP[normalized] || 'not_started';
};

/**
 * Maps legacy priority to new TaskPriority enum
 */
export const mapLegacyPriority = (legacyPriority: string | number): TaskPriority => {
  const normalized = String(legacyPriority).toLowerCase().trim();
  return LEGACY_PRIORITY_MAP[normalized] || 'medium';
};

/**
 * Maps legacy category to new TaskCategory enum
 */
export const mapLegacyCategory = (legacyCategory: string): TaskCategory => {
  const normalized = legacyCategory.toLowerCase().trim();
  return LEGACY_CATEGORY_MAP[normalized] || 'main';
};

export default {
  convertLegacyTask,
  mapLegacyStatus,
  mapLegacyPriority,
  mapLegacyCategory
};