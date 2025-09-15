/**
 * 🌐 TaskProvider - Context Provider for Task Management
 * 
 * Orchestrates all task management hooks and provides a unified context
 * for task operations. Integrates useTaskCRUD, useTaskState, and 
 * useTaskValidation into a cohesive system.
 * 
 * Features:
 * - Centralized task management state
 * - Type-safe context access
 * - Performance optimized with selective re-renders
 * - Error boundary integration
 * - Development mode debugging
 */

import React, { createContext, useContext, ReactNode, useMemo, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Conditional import for development only - temporarily disabled due to Vite cache issue
const ReactQueryDevtools = () => null;
import { useTaskCRUD } from '@/hooks/useTaskCRUD';
import { useTaskState } from '@/hooks/useTaskState';
import { useTaskValidation } from '@/hooks/useTaskValidation';
import { Task } from '@/components/tasks/TaskCard';

/**
 * Task type configuration for different contexts
 */
interface TaskTypeConfig {
  type: 'light-work' | 'deep-work';
  displayName: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
  };
  features: {
    focusSessions: boolean;
    timeTracking: boolean;
    subtaskExpansion: boolean;
    priorityLevels: string[];
    validation: {
      requireDescription: boolean;
      requireEstimatedTime: boolean;
      maxSubtasks: number;
    };
  };
}

/**
 * Context type definition
 */
interface TaskContextType {
  // Configuration
  taskType: 'light-work' | 'deep-work';
  config: TaskTypeConfig;
  
  // Hook instances
  crud: ReturnType<typeof useTaskCRUD>;
  state: ReturnType<typeof useTaskState>;
  validation: ReturnType<typeof useTaskValidation>;
  
  // Derived utilities
  utilities: {
    // Quick actions
    completeTask: (taskId: string) => void;
    deleteTaskWithConfirm: (taskId: string, taskTitle: string) => void;
    startFocusSession: (taskId: string, subtaskId?: string) => void;
    
    // Bulk actions
    completeSelectedTasks: () => void;
    deleteSelectedTasks: () => void;
    
    // Validation helpers
    canSaveTask: (task: Partial<Task>) => boolean;
    getTaskErrors: (task: Partial<Task>) => Record<string, string[]>;
    
    // State helpers
    isTaskInFocus: (taskId: string, subtaskId?: string) => boolean;
    getTaskProgress: (task: Task) => number;
    
    // Data helpers
    getTotalTaskCount: () => number;
    getCompletedTaskCount: () => number;
    getCompletionRate: () => number;
  };
}

/**
 * Default task type configurations
 */
const TASK_TYPE_CONFIGS: Record<'light-work' | 'deep-work', TaskTypeConfig> = {
  'light-work': {
    type: 'light-work',
    displayName: 'Light Work',
    description: 'Quick, flexible tasks for administrative work and rapid execution',
    theme: {
      primary: 'text-green-400',
      secondary: 'text-green-300',
      accent: 'border-green-400',
      border: 'border-green-700/30'
    },
    features: {
      focusSessions: false,
      timeTracking: true,
      subtaskExpansion: true,
      priorityLevels: ['low', 'medium', 'high'],
      validation: {
        requireDescription: false,
        requireEstimatedTime: false,
        maxSubtasks: 5
      }
    }
  },
  'deep-work': {
    type: 'deep-work',
    displayName: 'Deep Work',
    description: 'Focused, uninterrupted work sessions for complex cognitive tasks',
    theme: {
      primary: 'text-blue-400',
      secondary: 'text-blue-300',
      accent: 'border-blue-400',
      border: 'border-blue-700/30'
    },
    features: {
      focusSessions: true,
      timeTracking: true,
      subtaskExpansion: true,
      priorityLevels: ['low', 'medium', 'high'],
      validation: {
        requireDescription: true,
        requireEstimatedTime: true,
        maxSubtasks: 10
      }
    }
  }
};

/**
 * Task context definition
 */
const TaskContext = createContext<TaskContextType | null>(null);

/**
 * TaskProvider props
 */
interface TaskProviderProps {
  children: ReactNode;
  taskType: 'light-work' | 'deep-work';
  userId?: string;
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  
  // Optional overrides
  queryClient?: QueryClient;
  enableDevtools?: boolean;
  config?: Partial<TaskTypeConfig>;
}

/**
 * Create React Query client instance
 * Configured for optimal task management performance
 */
const createTaskQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Task data doesn't change frequently
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Reasonable retry strategy
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on every focus
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 2,
      retryDelay: 1000,
    },
  },
});

/**
 * Main TaskProvider component
 */
export const TaskProvider: React.FC<TaskProviderProps> = ({
  children,
  taskType,
  userId,
  onStartFocusSession,
  queryClient,
  enableDevtools = process.env.NODE_ENV === 'development',
  config: configOverrides
}) => {
  // Get or create query client
  const client = useMemo(() => queryClient || createTaskQueryClient(), [queryClient]);
  
  // Get task type configuration with overrides
  const config = useMemo(() => ({
    ...TASK_TYPE_CONFIGS[taskType],
    ...configOverrides
  }), [taskType, configOverrides]);

  return (
    <QueryClientProvider client={client}>
      <TaskProviderInner
        taskType={taskType}
        userId={userId}
        onStartFocusSession={onStartFocusSession}
        config={config}
      >
        {children}
      </TaskProviderInner>
      
      {/* Development tools */}
      {enableDevtools && process.env.NODE_ENV === 'development' && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </React.Suspense>
      )}
    </QueryClientProvider>
  );
};

/**
 * Inner provider component (separated for cleaner QueryClient wrapping)
 */
const TaskProviderInner: React.FC<{
  children: ReactNode;
  taskType: 'light-work' | 'deep-work';
  userId?: string;
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  config: TaskTypeConfig;
}> = ({ children, taskType, userId, onStartFocusSession, config }) => {
  
  // Initialize all task management hooks
  const crud = useTaskCRUD({ taskType, userId });
  const state = useTaskState(crud.tasks);
  const validation = useTaskValidation(taskType);

  /**
   * Create utility functions that combine multiple hooks
   */
  const utilities = useMemo(() => ({
    // Quick actions
    completeTask: (taskId: string) => {
      crud.updateTask({ taskId, updates: { status: 'completed' } });
    },

    deleteTaskWithConfirm: (taskId: string, taskTitle: string) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`
      );
      
      if (confirmed) {
        crud.deleteTask(taskId);
        
        // Clear from selection if selected
        if (state.isTaskSelected(taskId)) {
          state.toggleTaskSelection(taskId);
        }
        
        // Clear from expansion if expanded
        if (state.isTaskExpanded(taskId)) {
          state.toggleTaskExpansion(taskId);
        }
      }
    },

    startFocusSession: (taskId: string, subtaskId?: string) => {
      const task = crud.tasks.find(t => t.id === taskId);
      if (task) {
        // Set active focus session in state
        const sessionKey = subtaskId ? `${taskId}-${subtaskId}` : taskId;
        state.setActiveFocusSession(sessionKey);
        
        // Update task/subtask status to in-progress
        if (subtaskId) {
          crud.updateSubtask({ taskId, subtaskId, updates: { status: 'in-progress' } });
        } else {
          crud.updateTask({ taskId, updates: { status: 'in-progress' } });
        }
        
        // Notify external handler (e.g., for timer integration)
        onStartFocusSession?.(taskId, task.focusIntensity || 2);
      }
    },

    // Bulk actions
    completeSelectedTasks: () => {
      state.selectedTasks.forEach(taskId => {
        crud.updateTask({ taskId, updates: { status: 'completed' } });
      });
      state.clearSelection();
    },

    deleteSelectedTasks: () => {
      const taskCount = state.selectedTasks.length;
      const confirmed = window.confirm(
        `Are you sure you want to delete ${taskCount} selected task${taskCount > 1 ? 's' : ''}? This action cannot be undone.`
      );
      
      if (confirmed) {
        state.selectedTasks.forEach(taskId => {
          crud.deleteTask(taskId);
        });
        state.clearSelection();
      }
    },

    // Validation helpers
    canSaveTask: (task: Partial<Task>) => {
      return validation.canSaveTask(task, { taskType });
    },

    getTaskErrors: (task: Partial<Task>) => {
      const result = validation.validateTask(task, { taskType });
      return result.errors;
    },

    // State helpers
    isTaskInFocus: (taskId: string, subtaskId?: string) => {
      return state.isInFocusSession(taskId, subtaskId);
    },

    getTaskProgress: (task: Task) => {
      if (task.subtasks.length === 0) {
        return task.status === 'completed' ? 100 : 0;
      }
      
      const completedSubtasks = task.subtasks.filter(s => s.status === 'completed').length;
      return Math.round((completedSubtasks / task.subtasks.length) * 100);
    },

    // Data helpers
    getTotalTaskCount: () => crud.tasks.length,
    
    getCompletedTaskCount: () => 
      crud.tasks.filter(task => task.status === 'completed').length,
    
    getCompletionRate: () => {
      const total = crud.tasks.length;
      const completed = crud.tasks.filter(task => task.status === 'completed').length;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
  }), [crud, state, validation, taskType, onStartFocusSession]);

  /**
   * Context value with memoization for performance
   */
  const contextValue = useMemo((): TaskContextType => ({
    taskType,
    config,
    crud,
    state,
    validation,
    utilities
  }), [taskType, config, crud, state, validation, utilities]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

/**
 * Hook to access task context
 * 
 * Provides type-safe access to all task management functionality
 */
export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  
  return context;
};

/**
 * Convenience hooks for specific functionality
 */

// Hook for CRUD operations only
export const useTaskCRUDContext = () => {
  const { crud } = useTaskContext();
  return crud;
};

// Hook for UI state only
export const useTaskStateContext = () => {
  const { state } = useTaskContext();
  return state;
};

// Hook for validation only
export const useTaskValidationContext = () => {
  const { validation } = useTaskContext();
  return validation;
};

// Hook for utilities only
export const useTaskUtilities = () => {
  const { utilities } = useTaskContext();
  return utilities;
};

// Hook for configuration only
export const useTaskConfig = () => {
  const { config } = useTaskContext();
  return config;
};

/**
 * Error boundary for task provider
 * Catches errors in task management and provides fallback UI
 */
interface TaskErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface TaskErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class TaskErrorBoundary extends React.Component<
  TaskErrorBoundaryProps,
  TaskErrorBoundaryState
> {
  constructor(props: TaskErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TaskErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TaskProvider Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-64 text-center">
          <div className="text-red-400">
            <h3 className="text-lg font-semibold mb-2">Task Management Error</h3>
            <p className="text-sm text-gray-400 mb-4">
              Something went wrong with task management.
            </p>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Type exports
 */
export type { TaskTypeConfig, TaskContextType };