/**
 * Task Utility Functions
 * Reusable helper functions for task operations
 */

import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskCategory,
  TaskFilters,
  LegacyTaskStatus,
  LegacyTaskPriority,
  convertLegacyStatus,
  convertLegacyPriority,
  convertToLegacyStatus,
  convertToLegacyPriority
} from '@/domains/task-ui/types/task.types';
import { 
  TASK_STATUS_CONFIG, 
  TASK_PRIORITY_CONFIG, 
  TASK_CATEGORY_CONFIG,
  TIME_CONSTANTS 
} from '@/domains/task-ui/constants/taskConstants';

// Status utilities
export const getStatusConfig = (status: TaskStatus) => {
  return TASK_STATUS_CONFIG[status];
};

export const getStatusColor = (status: TaskStatus) => {
  const config = getStatusConfig(status);
  return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
};

export const getStatusIcon = (status: TaskStatus) => {
  return getStatusConfig(status).icon;
};

export const getStatusOrder = (status: TaskStatus) => {
  return getStatusConfig(status).order;
};

export const isTaskCompleted = (task: Task) => {
  return task.status === TaskStatus.COMPLETED;
};

export const isTaskOverdue = (task: Task) => {
  if (!task.due_date) return false;
  return new Date(task.due_date) < new Date() && !isTaskCompleted(task);
};

export const isTaskDueToday = (task: Task) => {
  if (!task.due_date) return false;
  const today = new Date().toDateString();
  return new Date(task.due_date).toDateString() === today;
};

export const isTaskDueSoon = (task: Task, days = TIME_CONSTANTS.DUE_SOON_THRESHOLD_DAYS) => {
  if (!task.due_date || isTaskCompleted(task)) return false;
  const dueDate = new Date(task.due_date);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};

// Priority utilities
export const getPriorityConfig = (priority: TaskPriority) => {
  return TASK_PRIORITY_CONFIG[priority];
};

export const getPriorityColor = (priority: TaskPriority) => {
  const config = getPriorityConfig(priority);
  return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
};

export const getPriorityIcon = (priority: TaskPriority) => {
  return getPriorityConfig(priority).icon;
};

export const getPriorityWeight = (priority: TaskPriority) => {
  return getPriorityConfig(priority).weight;
};

export const getPriorityOrder = (priority: TaskPriority) => {
  return getPriorityConfig(priority).order;
};

// Category utilities
export const getCategoryConfig = (category: TaskCategory) => {
  return TASK_CATEGORY_CONFIG[category];
};

export const getCategoryColor = (category: TaskCategory) => {
  const config = getCategoryConfig(category);
  return `${config.bgColor} ${config.textColor} ${config.borderColor}`;
};

export const getCategoryIcon = (category: TaskCategory) => {
  return getCategoryConfig(category).icon;
};

// Date utilities
export const formatDueDate = (dateString?: string) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { 
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, 
      color: 'text-red-500',
      isOverdue: true
    };
  }
  if (diffDays === 0) {
    return { 
      text: 'Due today', 
      color: 'text-orange-500',
      isOverdue: false
    };
  }
  if (diffDays === 1) {
    return { 
      text: 'Due tomorrow', 
      color: 'text-yellow-500',
      isOverdue: false
    };
  }
  if (diffDays <= 7) {
    return { 
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, 
      color: 'text-blue-500',
      isOverdue: false
    };
  }
  
  return { 
    text: `Due ${date.toLocaleDateString()}`, 
    color: 'text-gray-500',
    isOverdue: false
  };
};

export const getDaysUntilDue = (dateString?: string): number => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const isRecentlyUpdated = (task: Task, hours = TIME_CONSTANTS.RECENTLY_UPDATED_THRESHOLD_HOURS) => {
  const updated = new Date(task.updated_at);
  const now = new Date();
  const diffHours = (now.getTime() - updated.getTime()) / (1000 * 60 * 60);
  return diffHours <= hours;
};

// Progress utilities
export const calculateTaskProgress = (task: Task): number => {
  if (task.completion_percentage !== undefined && task.completion_percentage > 0) {
    return task.completion_percentage;
  }
  
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(st => isTaskCompleted(st)).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  }
  
  return isTaskCompleted(task) ? 100 : 0;
};

export const getProgressColor = (percentage: number) => {
  if (percentage === 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-gray-300';
};

// Filtering utilities
export const doesTaskMatchFilters = (task: Task, filters: TaskFilters): boolean => {
  // Status filter
  if (filters.status && filters.status.length > 0) {
    if (!filters.status.includes(task.status)) return false;
  }
  
  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    if (!filters.priority.includes(task.priority)) return false;
  }
  
  // Category filter
  if (filters.category && filters.category.length > 0) {
    if (!filters.category.includes(task.category)) return false;
  }
  
  // Assigned to filter
  if (filters.assigned_to && filters.assigned_to.length > 0) {
    if (!task.assigned_to || !filters.assigned_to.includes(task.assigned_to)) return false;
  }
  
  // Project filter
  if (filters.project_id && filters.project_id.length > 0) {
    if (!task.project_id || !filters.project_id.includes(task.project_id)) return false;
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    if (!filters.tags.some(tag => task.tags.includes(tag))) return false;
  }
  
  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase();
    const searchableText = [
      task.title,
      task.description || '',
      task.assigned_to || '',
      ...task.tags
    ].join(' ').toLowerCase();
    
    if (!searchableText.includes(searchTerm)) return false;
  }
  
  // Due date range filter
  if (filters.due_date_range) {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const startDate = new Date(filters.due_date_range.start);
    const endDate = new Date(filters.due_date_range.end);
    
    if (dueDate < startDate || dueDate > endDate) return false;
  }
  
  // Overdue filter
  if (filters.is_overdue !== undefined) {
    if (isTaskOverdue(task) !== filters.is_overdue) return false;
  }
  
  // Has subtasks filter
  if (filters.has_subtasks !== undefined) {
    if ((task.subtasks.length > 0) !== filters.has_subtasks) return false;
  }
  
  return true;
};

// Sorting utilities
export const sortTasks = (tasks: Task[], sortBy: keyof Task, direction: 'asc' | 'desc' = 'asc'): Task[] => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    // Handle priority sorting with weights
    if (sortBy === 'priority') {
      const aWeight = getPriorityWeight(aValue as TaskPriority);
      const bWeight = getPriorityWeight(bValue as TaskPriority);
      return direction === 'asc' ? aWeight - bWeight : bWeight - aWeight;
    }
    
    // Handle status sorting with order
    if (sortBy === 'status') {
      const aOrder = getStatusOrder(aValue as TaskStatus);
      const bOrder = getStatusOrder(bValue as TaskStatus);
      return direction === 'asc' ? aOrder - bOrder : bOrder - aOrder;
    }
    
    // Default string comparison
    return direction === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
  
  return sortedTasks;
};

// Grouping utilities
export const groupTasks = (tasks: Task[], groupBy: keyof Task): Record<string, Task[]> => {
  const groups: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    const groupValue = String(task[groupBy] || 'ungrouped');
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    groups[groupValue].push(task);
  });
  
  return groups;
};

// Legacy compatibility utilities
export const convertFromLegacyTask = (legacyTask: any): Partial<Task> => {
  const converted: any = { ...legacyTask };
  
  // Convert legacy status
  if (legacyTask.status && typeof legacyTask.status === 'string') {
    converted.status = convertLegacyStatus(legacyTask.status as LegacyTaskStatus);
  }
  
  // Convert legacy priority
  if (legacyTask.priority && typeof legacyTask.priority === 'string') {
    converted.priority = convertLegacyPriority(legacyTask.priority as LegacyTaskPriority);
  }
  
  // Ensure arrays exist
  converted.tags = converted.tags || [];
  converted.subtasks = converted.subtasks || [];
  converted.dependencies = converted.dependencies || [];
  converted.attachments = converted.attachments || [];
  converted.comments = converted.comments || [];
  converted.history = converted.history || [];
  
  return converted;
};

export const convertToLegacyTask = (task: Task): any => {
  return {
    ...task,
    status: convertToLegacyStatus(task.status),
    priority: convertToLegacyPriority(task.priority)
  };
};

// Validation utilities
export const validateTask = (task: Partial<Task>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!task.title || task.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (task.title && task.title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }
  
  if (task.description && task.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }
  
  if (task.estimated_hours && task.estimated_hours < 0) {
    errors.push('Estimated hours must be positive');
  }
  
  if (task.completion_percentage && (task.completion_percentage < 0 || task.completion_percentage > 100)) {
    errors.push('Completion percentage must be between 0 and 100');
  }
  
  if (task.tags && task.tags.length > 20) {
    errors.push('Maximum 20 tags allowed');
  }
  
  if (task.due_date && new Date(task.due_date) < new Date(1900, 0, 1)) {
    errors.push('Due date must be valid');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Search utilities
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const getSearchableText = (task: Task): string => {
  return [
    task.title,
    task.description || '',
    task.assigned_to || '',
    ...task.tags,
    task.category,
    task.status,
    task.priority
  ].join(' ').toLowerCase();
};

// Time tracking utilities
export const formatTimeTracked = (hours: number): string => {
  if (hours === 0) return '0h';
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
};

export const calculateTimeEstimateAccuracy = (task: Task): number | null => {
  if (!task.estimated_hours || !task.actual_hours) return null;
  
  const accuracy = (task.estimated_hours / task.actual_hours) * 100;
  return Math.min(Math.max(accuracy, 0), 200); // Cap at 200% for very underestimated tasks
};

// Bulk operations utilities
export const getSelectedTasksSummary = (tasks: Task[], selectedIds: Set<string>) => {
  const selectedTasks = tasks.filter(task => selectedIds.has(task.id));
  
  return {
    count: selectedTasks.length,
    statuses: [...new Set(selectedTasks.map(t => t.status))],
    priorities: [...new Set(selectedTasks.map(t => t.priority))],
    categories: [...new Set(selectedTasks.map(t => t.category))],
    totalEstimatedHours: selectedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
    totalActualHours: selectedTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0)
  };
};

// Analytics utilities
export const calculateCompletionVelocity = (tasks: Task[], days = 30): number => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const completedInPeriod = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED &&
    new Date(task.updated_at) >= startDate &&
    new Date(task.updated_at) <= endDate
  );
  
  return completedInPeriod.length / days;
};

export const calculateBurndownData = (tasks: Task[], startDate: Date, endDate: Date) => {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalTasks = tasks.length;
  const data = [];
  
  for (let i = 0; i <= days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const completedByDate = tasks.filter(task => 
      task.status === TaskStatus.COMPLETED &&
      new Date(task.updated_at) <= currentDate
    ).length;
    
    const remaining = totalTasks - completedByDate;
    const ideal = totalTasks - (totalTasks * i / days);
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      actual: remaining,
      ideal: Math.max(0, ideal),
      completed: completedByDate
    });
  }
  
  return data;
};