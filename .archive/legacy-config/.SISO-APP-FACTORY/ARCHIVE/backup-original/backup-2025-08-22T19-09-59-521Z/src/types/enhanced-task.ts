// Enhanced Task Types - Matching the updated database schema

export interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'done' | 'overdue' | 'due-today' | 'upcoming' | 'not-started' | 'started' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'main' | 'weekly' | 'daily' | 'siso_app_dev' | 'onboarding_app' | 'instagram';
  
  // Project relationship
  project_id?: string;
  project_name?: string;
  project_description?: string;
  project_status?: string;
  project_completion_percentage?: number;
  
  // Date tracking
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // Assignment
  assigned_to?: string;
  assigned_client_id?: string;
  assignee_name?: string;
  created_by?: string;
  
  // Task hierarchy
  parent_task_id?: string;
  subtasks?: EnhancedSubtask[];
  
  // Recurring tasks
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurring_days?: string[];
  rolled_over_from?: string;
  
  // Time tracking
  start_time?: string;
  duration?: number;
  estimated_hours?: number;
  actual_hours?: number;
  
  // Flexible data
  tags?: string[];
  metadata?: Record<string, any>;
  
  // Computed fields
  computed_status?: string;
  completion_duration?: string;
  completed?: boolean; // For backward compatibility
}

export interface EnhancedSubtask {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
}

export interface EnhancedProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  completion_percentage: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  tasks?: EnhancedTask[];
  total_tasks?: number;
  completed_tasks?: number;
  overdue_tasks?: number;
  total_estimated_hours?: number;
  total_actual_hours?: number;
}

export interface TaskWithProject extends EnhancedTask {
  project?: EnhancedProject;
}

export interface CompletedTaskInfo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  completed_at: string;
  completion_duration: string;
  project_name?: string;
  tags?: string[];
  
  // For component compatibility
  completedAt?: Date;
  completed: boolean;
}

// Filter and search types
export interface TaskFilter {
  status?: string[];
  priority?: string[];
  category?: string[];
  project_id?: string[];
  tags?: string[];
  assigned_to?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search_query?: string;
}

// Analytics types
export interface TaskAnalytics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  average_completion_time: number;
  productivity_score: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_category: Record<string, number>;
  tasks_by_project: Record<string, number>;
  weekly_completion_trend: Array<{
    week: string;
    completed: number;
    created: number;
  }>;
}

// API response types
export interface TasksResponse {
  data: EnhancedTask[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CompletedTasksResponse {
  data: CompletedTaskInfo[];
  count: number;
  analytics: TaskAnalytics;
}

// Component prop types
export interface TaskItemProps {
  task: EnhancedTask;
  onToggle: (taskId: string) => void;
  onUpdate?: (taskId: string, field: string, value: any) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: EnhancedTask) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showProject?: boolean;
  showTags?: boolean;
  showEstimatedTime?: boolean;
  className?: string;
}

export interface TaskListProps {
  tasks: EnhancedTask[];
  completedTasks?: CompletedTaskInfo[];
  onToggle: (taskId: string) => void;
  onUpdate?: (taskId: string, field: string, value: any) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: EnhancedTask) => void;
  variant?: 'default' | 'compact' | 'detailed';
  filter?: TaskFilter;
  emptyMessage?: string;
  className?: string;
}

// Utility functions type
export interface TaskUtils {
  getTasksByProject: (projectId: string) => Promise<EnhancedTask[]>;
  getCompletedTasks: (userId: string) => Promise<CompletedTaskInfo[]>;
  createTask: (task: Partial<EnhancedTask>) => Promise<EnhancedTask>;
  updateTask: (taskId: string, updates: Partial<EnhancedTask>) => Promise<EnhancedTask>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<EnhancedTask>;
  getTaskAnalytics: (filter?: TaskFilter) => Promise<TaskAnalytics>;
}