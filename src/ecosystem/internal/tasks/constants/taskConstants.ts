/**
 * Task Management Constants
 * Centralized constants for the task management system
 */

import { TaskStatus, TaskPriority, TaskCategory, TaskViewType } from '../../../../features/tasks/types/task.types';

// Status configuration
export const TASK_STATUS_CONFIG = {
  [TaskStatus.NOT_STARTED]: {
    label: 'Not Started',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    icon: '⏳',
    order: 1
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: '🔄',
    order: 2
  },
  [TaskStatus.BLOCKED]: {
    label: 'Blocked',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    icon: '🚫',
    order: 3
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    icon: '✅',
    order: 4
  },
  [TaskStatus.OVERDUE]: {
    label: 'Overdue',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    icon: '⚠️',
    order: 5
  },
  [TaskStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-300',
    icon: '❌',
    order: 6
  },
  [TaskStatus.ON_HOLD]: {
    label: 'On Hold',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    icon: '⏸️',
    order: 7
  }
} as const;

// Priority configuration
export const TASK_PRIORITY_CONFIG = {
  ultra: {
    label: 'Ultra',
    color: 'red',
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    icon: '🔥',
    order: 1,
    weight: 5
  },
  high: {
    label: 'High',
    color: 'orange',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-500',
    icon: '🔴',
    order: 2,
    weight: 4
  },
  medium: {
    label: 'Medium',
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    borderColor: 'border-yellow-500',
    icon: '🟡',
    order: 3,
    weight: 3
  },
  low: {
    label: 'Low',
    color: 'blue',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-500',
    icon: '🟢',
    order: 4,
    weight: 2
  },
  none: {
    label: 'None',
    color: 'gray',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    borderColor: 'border-gray-500',
    icon: '⚪',
    order: 5,
    weight: 1
  }
} as const;

// Category configuration
export const TASK_CATEGORY_CONFIG = {
  [TaskCategory.DEVELOPMENT]: {
    label: 'Development',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    icon: '💻',
    order: 1
  },
  [TaskCategory.DESIGN]: {
    label: 'Design',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: '🎨',
    order: 2
  },
  [TaskCategory.MARKETING]: {
    label: 'Marketing',
    color: 'pink',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    icon: '📢',
    order: 3
  },
  [TaskCategory.CLIENT]: {
    label: 'Client',
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: '👥',
    order: 4
  },
  [TaskCategory.ADMIN]: {
    label: 'Admin',
    color: 'gray',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: '⚙️',
    order: 5
  },
  [TaskCategory.RESEARCH]: {
    label: 'Research',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    icon: '🔍',
    order: 6
  },
  [TaskCategory.MAINTENANCE]: {
    label: 'Maintenance',
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    icon: '🔧',
    order: 7
  },
  [TaskCategory.STRATEGIC]: {
    label: 'Strategic',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    icon: '🎯',
    order: 8
  },
  // Legacy categories
  [TaskCategory.MAIN]: {
    label: 'Main Tasks',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    icon: '📋',
    order: 9
  },
  [TaskCategory.WEEKLY]: {
    label: 'Weekly Tasks',
    color: 'green',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    icon: '📅',
    order: 10
  },
  [TaskCategory.DAILY]: {
    label: 'Daily Tasks',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: '📆',
    order: 11
  },
  [TaskCategory.SISO_APP_DEV]: {
    label: 'SISO App Development',
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: '🏢',
    order: 12
  },
  [TaskCategory.ONBOARDING_APP]: {
    label: 'Onboarding App',
    color: 'teal',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    icon: '🚀',
    order: 13
  },
  [TaskCategory.INSTAGRAM]: {
    label: 'Instagram',
    color: 'pink',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    icon: '📱',
    order: 14
  }
} as const;

// View configuration
export const TASK_VIEW_CONFIG = {
  [TaskViewType.LIST]: {
    label: 'List View',
    icon: '📋',
    description: 'Traditional list layout'
  },
  [TaskViewType.KANBAN]: {
    label: 'Kanban Board',
    icon: '📌',
    description: 'Visual board with columns'
  },
  [TaskViewType.CALENDAR]: {
    label: 'Calendar View',
    icon: '📅',
    description: 'Calendar-based task scheduling'
  },
  [TaskViewType.TIMELINE]: {
    label: 'Timeline View',
    icon: '📊',
    description: 'Chronological timeline'
  },
  [TaskViewType.GANTT]: {
    label: 'Gantt Chart',
    icon: '📈',
    description: 'Project timeline with dependencies'
  }
} as const;

// Default values
export const DEFAULT_TASK_VALUES = {
  status: TaskStatus.NOT_STARTED,
  priority: TaskPriority.MEDIUM,
  category: TaskCategory.ADMIN,
  tags: [],
  estimated_hours: 0,
  completion_percentage: 0
} as const;

// Limits and constraints
export const TASK_LIMITS = {
  TITLE_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 5000,
  TAGS_MAX_COUNT: 20,
  TAG_MAX_LENGTH: 50,
  ESTIMATED_HOURS_MAX: 1000,
  ATTACHMENTS_MAX_COUNT: 20,
  COMMENTS_MAX_LENGTH: 2000
} as const;

// Time-related constants
export const TIME_CONSTANTS = {
  OVERDUE_THRESHOLD_DAYS: 0,
  DUE_SOON_THRESHOLD_DAYS: 3,
  RECENTLY_UPDATED_THRESHOLD_HOURS: 24,
  ACTIVITY_TIMEOUT_MINUTES: 30
} as const;

// Pagination and performance
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
  INFINITE_SCROLL_THRESHOLD: 10
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  CREATE_TASK: 'mod+n',
  SEARCH: 'mod+k',
  TOGGLE_SIDEBAR: 'mod+b',
  NEXT_VIEW: 'mod+shift+]',
  PREV_VIEW: 'mod+shift+[',
  COMPLETE_TASK: 'mod+enter',
  DELETE_TASK: 'mod+backspace',
  EDIT_TASK: 'enter',
  ESCAPE: 'escape'
} as const;

// Filter presets
export const FILTER_PRESETS = {
  MY_TASKS: {
    name: 'My Tasks',
    icon: '👤',
    description: 'Tasks assigned to me'
  },
  OVERDUE: {
    name: 'Overdue',
    icon: '⚠️',
    description: 'Tasks past their due date'
  },
  DUE_TODAY: {
    name: 'Due Today',
    icon: '📅',
    description: 'Tasks due today'
  },
  HIGH_PRIORITY: {
    name: 'High Priority',
    icon: '🔥',
    description: 'Critical and high priority tasks'
  },
  IN_PROGRESS: {
    name: 'In Progress',
    icon: '🔄',
    description: 'Currently active tasks'
  },
  COMPLETED_TODAY: {
    name: 'Completed Today',
    icon: '✅',
    description: 'Tasks completed today'
  }
} as const;

// Sort options
export const SORT_OPTIONS = [
  { key: 'due_date', label: 'Due Date', icon: '📅' },
  { key: 'priority', label: 'Priority', icon: '🔥' },
  { key: 'created_at', label: 'Created Date', icon: '📝' },
  { key: 'updated_at', label: 'Last Updated', icon: '🔄' },
  { key: 'title', label: 'Title', icon: '📋' },
  { key: 'status', label: 'Status', icon: '📊' }
] as const;

// Group options
export const GROUP_OPTIONS = [
  { key: 'status', label: 'Status', icon: '📊' },
  { key: 'priority', label: 'Priority', icon: '🔥' },
  { key: 'category', label: 'Category', icon: '📁' },
  { key: 'assigned_to', label: 'Assignee', icon: '👤' },
  { key: 'project_id', label: 'Project', icon: '📂' },
  { key: 'due_date', label: 'Due Date', icon: '📅' }
] as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 200,
  MODAL_TRANSITION: 250,
  TOAST_DURATION: 3000
} as const;

// API endpoints
export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  TASK_ANALYTICS: '/api/tasks/analytics',
  TASK_EXPORT: '/api/tasks/export',
  TASK_IMPORT: '/api/tasks/import',
  TASK_TEMPLATES: '/api/tasks/templates',
  TASK_DEPENDENCIES: '/api/tasks/dependencies',
  TASK_COMMENTS: '/api/tasks/comments',
  TASK_ATTACHMENTS: '/api/tasks/attachments'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TASK_FILTERS: 'task_filters',
  TASK_VIEW_PREFERENCES: 'task_view_preferences',
  TASK_COLUMN_WIDTHS: 'task_column_widths',
  TASK_SIDEBAR_STATE: 'task_sidebar_state',
  TASK_AI_CONTEXT: 'task_ai_context'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  TASK_NOT_FOUND: 'Task not found',
  TASK_CREATE_FAILED: 'Failed to create task',
  TASK_UPDATE_FAILED: 'Failed to update task',
  TASK_DELETE_FAILED: 'Failed to delete task',
  INVALID_TASK_DATA: 'Invalid task data',
  PERMISSION_DENIED: 'Permission denied',
  NETWORK_ERROR: 'Network error occurred',
  VALIDATION_ERROR: 'Validation error'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_COMPLETED: 'Task marked as completed',
  BULK_UPDATE_SUCCESS: 'Tasks updated successfully',
  EXPORT_SUCCESS: 'Tasks exported successfully'
} as const;