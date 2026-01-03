/**
 * Unified Task Type System
 * Single source of truth for all task-related types across the application
 */

import { z } from 'zod';

// Base interfaces for composition
export interface BaseTask {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface TaskCore extends BaseTask {
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date?: string;
  assigned_to?: string;
  project_id?: string;
  parent_task_id?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage?: number;
  tags: string[];
}

export interface TaskRelations {
  subtasks: Task[];
  dependencies: TaskDependency[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  history: TaskHistory[];
}

export interface TaskComputed {
  is_overdue: boolean;
  days_until_due: number;
  completion_status: CompletionStatus;
  progress_percentage: number;
  time_tracked: number;
  blocked_by: string[];
  blocking: string[];
}

// Main Task interface - combines all aspects
export interface Task extends TaskCore, TaskRelations, TaskComputed {
  // Additional computed properties
  can_edit: boolean;
  can_delete: boolean;
  can_complete: boolean;
}

// Enums with extensible design
export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high', 
  MEDIUM = 'medium',
  LOW = 'low',
  BACKLOG = 'backlog'
}

export enum TaskCategory {
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  MARKETING = 'marketing',
  CLIENT = 'client',
  ADMIN = 'admin',
  RESEARCH = 'research',
  MAINTENANCE = 'maintenance',
  STRATEGIC = 'strategic',
  // Legacy support
  MAIN = 'main',
  WEEKLY = 'weekly',
  DAILY = 'daily',
  SISO_APP_DEV = 'siso_app_dev',
  ONBOARDING_APP = 'onboarding_app',
  INSTAGRAM = 'instagram'
}

export enum CompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  NEARLY_COMPLETE = 'nearly_complete',
  COMPLETE = 'complete',
  OVERDUE = 'overdue'
}

// Supporting interfaces
export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'requires' | 'relates_to';
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_system_comment: boolean;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: TaskHistoryAction;
  old_value?: any;
  new_value?: any;
  timestamp: string;
}

export enum TaskHistoryAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  ASSIGNED = 'assigned',
  COMMENTED = 'commented',
  ATTACHMENT_ADDED = 'attachment_added',
  DEPENDENCY_ADDED = 'dependency_added',
  COMPLETED = 'completed',
  DELETED = 'deleted'
}

// Request/Response types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string;
  assigned_to?: string;
  project_id?: string;
  parent_task_id?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage?: number;
  tags?: string[];
}

export interface BulkTaskUpdate {
  id: string;
  updates: UpdateTaskRequest;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assigned_to?: string[];
  project_id?: string[];
  due_date_range?: {
    start: string;
    end: string;
  };
  search?: string;
  tags?: string[];
  created_date_range?: {
    start: string;
    end: string;
  };
  has_subtasks?: boolean;
  is_overdue?: boolean;
  custom?: Record<string, any>;
}

// View types
export enum TaskViewType {
  LIST = 'list',
  KANBAN = 'kanban',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline',
  GANTT = 'gantt'
}

export interface TaskViewConfig {
  type: TaskViewType;
  groupBy?: keyof Task;
  sortBy?: keyof Task;
  sortDirection?: 'asc' | 'desc';
  filters?: TaskFilters;
  columns?: string[];
  settings?: Record<string, any>;
}

export interface TaskViewState {
  current: TaskViewType;
  configs: Record<TaskViewType, TaskViewConfig>;
  presets: Record<string, TaskViewConfig>;
}

// Analytics types
export interface TaskAnalytics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  average_completion_time: number;
  productivity_score: number;
  task_velocity: number;
  burndown_data: BurndownDataPoint[];
  priority_distribution: Record<TaskPriority, number>;
  status_distribution: Record<TaskStatus, number>;
  category_distribution: Record<TaskCategory, number>;
}

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
}

// AI types
export interface TaskAIContext {
  project_context?: string;
  user_preferences?: Record<string, any>;
  recent_tasks?: Task[];
  current_workload?: number;
  team_context?: Record<string, any>;
}

export interface TaskAISuggestion {
  id: string;
  type: 'decomposition' | 'optimization' | 'scheduling' | 'assignment';
  title: string;
  description: string;
  confidence: number;
  suggested_action: any;
  metadata?: Record<string, any>;
}

type PluginHandler = (...args: unknown[]) => unknown;

// Plugin system types
export interface TaskPlugin {
  name: string;
  version: string;
  extends: keyof Task;
  schema: z.ZodSchema;
  components?: React.ComponentType[];
  hooks?: PluginHandler[];
  services?: PluginHandler[];
  migrations?: PluginMigration[];
}

export interface PluginMigration {
  version: string;
  up: (task: Task) => Task;
  down: (task: Task) => Task;
}

// Event system types
export interface TaskEvent {
  type: TaskEventType;
  task_id: string;
  user_id: string;
  timestamp: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export enum TaskEventType {
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_STATUS_CHANGED = 'task:status_changed',
  TASK_ASSIGNED = 'task:assigned',
  TASK_COMPLETED = 'task:completed',
  TASK_COMMENTED = 'task:commented',
  TASK_DEPENDENCY_ADDED = 'task:dependency_added',
  TASK_ATTACHMENT_ADDED = 'task:attachment_added'
}

// Zod schemas for validation
export const TaskStatusSchema = z.nativeEnum(TaskStatus);
export const TaskPrioritySchema = z.nativeEnum(TaskPriority);
export const TaskCategorySchema = z.nativeEnum(TaskCategory);

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: TaskStatusSchema.optional().default(TaskStatus.NOT_STARTED),
  priority: TaskPrioritySchema.optional().default(TaskPriority.MEDIUM),
  category: TaskCategorySchema.optional().default(TaskCategory.ADMIN),
  due_date: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  parent_task_id: z.string().uuid().optional(),
  estimated_hours: z.number().positive().optional(),
  tags: z.array(z.string()).optional().default([])
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskFiltersSchema = z.object({
  status: z.array(TaskStatusSchema).optional(),
  priority: z.array(TaskPrioritySchema).optional(),
  category: z.array(TaskCategorySchema).optional(),
  assigned_to: z.array(z.string().uuid()).optional(),
  project_id: z.array(z.string().uuid()).optional(),
  due_date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  created_date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  has_subtasks: z.boolean().optional(),
  is_overdue: z.boolean().optional(),
  custom: z.record(z.any()).optional()
});

// Type guards
export function isTask(value: any): value is Task {
  return value && typeof value.id === 'string' && typeof value.title === 'string';
}

export function isTaskStatus(value: any): value is TaskStatus {
  return Object.values(TaskStatus).includes(value);
}

export function isTaskPriority(value: any): value is TaskPriority {
  return Object.values(TaskPriority).includes(value);
}

export function isTaskCategory(value: any): value is TaskCategory {
  return Object.values(TaskCategory).includes(value);
}

// Utility types
export type TaskSortKey = keyof Pick<Task, 'title' | 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'status'>;
export type TaskGroupKey = keyof Pick<Task, 'status' | 'priority' | 'category' | 'assigned_to' | 'project_id'>;

// Legacy type mappings for backward compatibility
export type LegacyTaskStatus = 'overdue' | 'due-today' | 'upcoming' | 'in-progress' | 'blocked' | 'not-started' | 'started' | 'done';
export type LegacyTaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'backlog';

export const legacyStatusMap: Record<LegacyTaskStatus, TaskStatus> = {
  'overdue': TaskStatus.OVERDUE,
  'due-today': TaskStatus.IN_PROGRESS,
  'upcoming': TaskStatus.NOT_STARTED,
  'in-progress': TaskStatus.IN_PROGRESS,
  'blocked': TaskStatus.BLOCKED,
  'not-started': TaskStatus.NOT_STARTED,
  'started': TaskStatus.IN_PROGRESS,
  'done': TaskStatus.COMPLETED
};

export const legacyPriorityMap: Record<LegacyTaskPriority, TaskPriority> = {
  'urgent': TaskPriority.CRITICAL,
  'high': TaskPriority.HIGH,
  'medium': TaskPriority.MEDIUM,
  'low': TaskPriority.LOW,
  'backlog': TaskPriority.BACKLOG
};

// Helper functions for legacy conversion
export function convertLegacyStatus(legacyStatus: LegacyTaskStatus): TaskStatus {
  return legacyStatusMap[legacyStatus] || TaskStatus.NOT_STARTED;
}

export function convertLegacyPriority(legacyPriority: LegacyTaskPriority): TaskPriority {
  return legacyPriorityMap[legacyPriority] || TaskPriority.MEDIUM;
}

export function convertToLegacyStatus(status: TaskStatus): LegacyTaskStatus {
  const reverseMap = Object.entries(legacyStatusMap).find(([_, value]) => value === status);
  return (reverseMap?.[0] as LegacyTaskStatus) || 'not-started';
}

export function convertToLegacyPriority(priority: TaskPriority): LegacyTaskPriority {
  const reverseMap = Object.entries(legacyPriorityMap).find(([_, value]) => value === priority);
  return (reverseMap?.[0] as LegacyTaskPriority) || 'medium';
}
