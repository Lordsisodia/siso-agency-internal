/**
 * 🔄 TaskProvider Compatibility Layer
 * 
 * Provides backward compatibility during Context → Zustand migration
 * Maintains existing APIs while using new Zustand store internally
 */

import React, { ReactNode, createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaskStore, useTaskData, useTaskActions, useTaskFilters, useTaskViewState } from './taskStore';
import { Task, TaskFilters, TaskViewType } from '../@/domains/tasks/types/task.types';

// ===== COMPATIBILITY INTERFACES =====

// Legacy interface that components expect
interface TasksContextValue {
  // State (read-only)
  tasks: Task[];
  filteredTasks: Task[];
  filters: TaskFilters;
  currentView: TaskViewType;
  selectedTasks: Set<string>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setCurrentView: (view: TaskViewType) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  
  // Utilities
  getTaskById: (id: string) => Task | undefined;
  getTaskStats: () => any;
  
  // API instance (for backward compatibility)
  api?: any;
}

// ===== COMPATIBILITY CONTEXT =====

const TasksCompatContext = createContext<TasksContextValue | null>(null);

// ===== QUERY CLIENT SETUP =====

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      }
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        console.error('Task mutation error:', error);
      }
    }
  }
});

// ===== COMPATIBILITY PROVIDER =====

interface TasksProviderProps {
  children: ReactNode;
  initialFilters?: TaskFilters;
  initialView?: TaskViewType;
  enableRealtime?: boolean;
  enableOptimisticUpdates?: boolean;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({
  children,
  initialFilters,
  initialView,
  enableRealtime = true,
  enableOptimisticUpdates = true
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TasksProviderInner
        initialFilters={initialFilters}
        initialView={initialView}
        enableRealtime={enableRealtime}
        enableOptimisticUpdates={enableOptimisticUpdates}
      >
        {children}
      </TasksProviderInner>
    </QueryClientProvider>
  );
};

const TasksProviderInner: React.FC<TasksProviderProps> = ({
  children,
  initialFilters,
  initialView,
  enableRealtime
}) => {
  // Use our new Zustand store hooks
  const { tasks, filteredTasks, isLoading, error } = useTaskData();
  const { filters, setFilters } = useTaskFilters();
  const { viewState, setViewMode, toggleTaskSelection, selectAllTasks, clearSelection } = useTaskViewState();
  const { addTask, updateTask, deleteTask } = useTaskActions();
  const { getTaskById, setLoading, setError } = useTaskStore();

  // Initialize store with provided values
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
    if (initialView) {
      setViewMode(initialView);
    }
  }, [initialFilters, initialView, setFilters, setViewMode]);

  // Setup real-time event listeners (if needed)
  useEffect(() => {
    if (!enableRealtime) return;

    const handleTaskEvent = (event: CustomEvent<any>) => {
      
      // Handle real-time events using Zustand store
    };

    window.addEventListener('taskEvent', handleTaskEvent as EventListener);
    
    return () => {
      window.removeEventListener('taskEvent', handleTaskEvent as EventListener);
    };
  }, [enableRealtime]);

  // ===== COMPATIBILITY LAYER =====
  
  const contextValue: TasksContextValue = {
    // State - direct mapping from Zustand store
    tasks,
    filteredTasks,
    filters,
    currentView: viewState.viewMode,
    selectedTasks: viewState.selectedTasks,
    isLoading,
    error,
    
    // Actions - wrap Zustand actions to match old API
    setTasks: useTaskStore.getState().setTasks,
    
    addTask: (task: Task) => {
      // Old API expects full Task object, new API expects Omit<Task, 'id' | 'created_at'>
      const { id, created_at, ...taskData } = task;
      return addTask(taskData);
    },
    
    updateTask,
    deleteTask,
    setFilters,
    
    setCurrentView: (view: TaskViewType) => {
      setViewMode(view);
    },
    
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    
    // Utilities
    getTaskById,
    getTaskStats: useTaskStore.getState().getTaskStats,
    
    // API placeholder for backward compatibility
    api: {
      // Legacy API methods can be added here if needed
      updateTask: (id: string, updates: Partial<Task>) => updateTask(id, updates),
      deleteTask: (id: string) => deleteTask(id),
    }
  };

  return (
    <TasksCompatContext.Provider value={contextValue}>
      {children}
    </TasksCompatContext.Provider>
  );
};

// ===== COMPATIBILITY HOOKS =====

// Main hook that components currently use
export const useTasks = (): TasksContextValue => {
  const context = useContext(TasksCompatContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

// Specialized hooks for backward compatibility
export const useTasksData = () => {
  const { tasks, filteredTasks, isLoading, error } = useTasks();
  return { tasks, filteredTasks, isLoading, error };
};

export const useTasksActions = () => {
  const { 
    setTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    setFilters, 
    setCurrentView 
  } = useTasks();
  return { 
    setTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    setFilters, 
    setCurrentView 
  };
};

export const useTasksSelection = () => {
  const { 
    selectedTasks, 
    toggleTaskSelection, 
    selectAllTasks, 
    clearSelection 
  } = useTasks();
  return { 
    selectedTasks, 
    toggleTaskSelection, 
    selectAllTasks, 
    clearSelection 
  };
};

export const useTasksFilters = () => {
  const { filters, setFilters } = useTasks();
  return { filters, setFilters };
};

export const useTasksView = () => {
  const { currentView, setCurrentView } = useTasks();
  return { currentView, setCurrentView };
};

export const useTasksAPI = () => {
  const { api } = useTasks();
  return api;
};

// Higher-order component for backward compatibility
export const withTasks = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & { tasksConfig?: Partial<TasksProviderProps> }>(
    ({ tasksConfig, ...props }, ref) => (
      <TasksProvider {...tasksConfig}>
        <Component {...(props as P)} ref={ref} />
      </TasksProvider>
    )
  );
};

// Default export for drop-in replacement
export default TasksProvider;