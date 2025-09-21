export type TaskCategory = 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskViewType = 'list' | 'kanban' | 'calendar' | 'timeline';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  category: TaskCategory;
  labels?: string[];
  estimated_time?: number;
  assigned_to?: string;
  created_at: string;
  created_by?: string;
  parent_task_id?: string;
  rolled_over_from?: string;
  start_time?: string; // Added for timeline view
  duration?: number; // Duration in minutes
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly'; // Type of recurrence
  recurring_days?: string[]; // Days of week for weekly recurrence
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assigned_to?: string[];
  project_id?: string[];
  tags?: string[];
  search?: string;
  due_date_range?: {
    start?: string;
    end?: string;
  };
  is_overdue?: boolean;
  has_subtasks?: boolean;
}

export interface TaskEvent {
  type: 'task:created' | 'task:updated' | 'task:deleted';
  task: Task;
  timestamp: string;
}

export interface TaskStats {
  byStatus: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byDay: Array<{
    day: string;
    created: number;
    completed: number;
  }>;
  totals: {
    pending: number;
    in_progress: number;
    completed: number;
    total: number;
  };
}