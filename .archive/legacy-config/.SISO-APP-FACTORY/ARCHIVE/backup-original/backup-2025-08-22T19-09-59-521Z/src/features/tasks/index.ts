/**
 * Tasks Feature Export Index
 * Central export point for the modern task management system
 */

// Core Components
export { TasksPage } from './components/core/TasksPage';
export { TasksHeader } from './components/core/TasksHeader';
export { TasksFilters } from './components/core/TasksFilters';
export { TasksContent } from './components/core/TasksContent';
export { TasksAI } from './components/core/TasksAI';
export { TasksSidebar } from './components/core/TasksSidebar';

// View Components
export { ListView } from './components/views/ListView';
export { KanbanView } from './components/views/KanbanView';
export { CalendarView } from './components/views/CalendarView';

// Fallback Components
export { TasksErrorFallback } from './components/fallbacks/TasksErrorFallback';
export { TasksLoadingFallback } from './components/fallbacks/TasksLoadingFallback';

// Provider and Hooks
export { 
  TasksProvider,
  useTasks,
  useTasksFilters,
  useTasksView,
  useTasksSelection
} from './components/providers/TasksProvider';

// Types and Interfaces
export type {
  Task,
  TaskCore,
  TaskRelations,
  TaskComputed,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskViewType,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskComment,
  TaskAttachment,
  TaskDependency
} from './types/task.types';

// API Layer
export { TaskAPI } from './api/taskApi';
export { TASK_QUERY_KEYS } from './api/taskApi';

// State Management
export { useTaskStore } from './stores/taskStore';

// Constants and Configuration
export {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_CATEGORY_CONFIG,
  TASK_LIMITS,
  TASK_SHORTCUTS,
  TASK_API_ENDPOINTS
} from './constants/taskConstants';

// Utilities and Helpers
export {
  getStatusColor,
  getPriorityColor,
  getCategoryColor,
  formatDueDate,
  calculateTaskProgress,
  isTaskOverdue,
  isTaskDueToday,
  filterTasks,
  sortTasks,
  searchTasks,
  validateTaskData,
  convertLegacyTask
} from './utils/taskHelpers';

// Migration and Integration
export { 
  convertLegacyTask,
  mapLegacyStatus,
  mapLegacyPriority,
  mapLegacyCategory
} from './migration/legacyAdapter';

export {
  setupTasksIntegration,
  enableProgressiveUpgrade,
  checkMigrationStatus,
  getLegacyTaskData,
  createSystemBridge
} from './migration/integrationSetup';

// Validation Schemas
export { taskSchema, createTaskSchema, updateTaskSchema } from './types/task.types';

/**
 * Default configuration for the tasks system
 */
export const TASKS_CONFIG = {
  defaultView: 'list' as TaskViewType,
  enableRealtime: true,
  enableOptimisticUpdates: true,
  enableLegacySupport: true,
  maxTasksPerPage: 50,
  autoSaveInterval: 30000, // 30 seconds
  debounceSearchMs: 300,
  enableKeyboardShortcuts: true,
  theme: {
    primaryColor: '#ea580c', // Orange-600
    accentColor: '#f97316',  // Orange-500
    successColor: '#22c55e', // Green-500
    warningColor: '#eab308', // Yellow-500
    errorColor: '#ef4444',   // Red-500
  }
};

/**
 * Quick setup function for easy integration
 */
export const setupTasks = (config?: Partial<typeof TASKS_CONFIG>) => {
  const finalConfig = { ...TASKS_CONFIG, ...config };
  
  // Setup integration
  const integrationConfig = setupTasksIntegration({
    enableLegacySupport: finalConfig.enableLegacySupport,
    debugMode: process.env.NODE_ENV === 'development'
  });
  
  // Return configuration and utilities
  return {
    config: finalConfig,
    integration: integrationConfig,
    bridge: createSystemBridge()
  };
};

/**
 * Version information
 */
export const TASKS_VERSION = '2.0.0';
export const TASKS_BUILD_DATE = new Date().toISOString();

/**
 * Feature flags for progressive enhancement
 */
export const TASKS_FEATURES = {
  AI_INSIGHTS: true,
  DRAG_AND_DROP: true,
  BULK_OPERATIONS: true,
  TIME_TRACKING: true,
  RECURRING_TASKS: true,
  TASK_TEMPLATES: true,
  ADVANCED_FILTERING: true,
  REAL_TIME_SYNC: true,
  OFFLINE_SUPPORT: false, // Future feature
  VOICE_COMMANDS: false,  // Future feature
  MOBILE_APP_SYNC: false  // Future feature
};

// Default export for convenience
export default {
  // Main components
  TasksPage,
  TasksProvider,
  
  // Configuration
  config: TASKS_CONFIG,
  features: TASKS_FEATURES,
  version: TASKS_VERSION,
  
  // Setup utilities
  setup: setupTasks,
  migration: {
    convertLegacyTask,
    setupIntegration: setupTasksIntegration,
    createBridge: createSystemBridge
  }
};