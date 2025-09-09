/**
 * Tasks Provider
 * Context provider for task management functionality
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaskStore } from '../../stores/taskStore';
import { getTaskAPI } from '../../api/taskApi';
import { TaskFilters, TaskViewType, Task, TaskEvent } from '../../types/task.types';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
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
        // Could show toast notification here
      }
    }
  }
});

// Task context interface
interface TasksContextValue {
  // Store selectors
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
  
  // API instance
  api: ReturnType<typeof getTaskAPI>;
}

// Create context
const TasksContext = createContext<TasksContextValue | null>(null);

// Provider props
interface TasksProviderProps {
  children: ReactNode;
  initialFilters?: TaskFilters;
  initialView?: TaskViewType;
  enableRealtime?: boolean;
  enableOptimisticUpdates?: boolean;
}

// Tasks provider component
export const TasksProvider: React.FC<TasksProviderProps> = ({
  children,
  initialFilters,
  initialView,
  enableRealtime = true,
  enableOptimisticUpdates = true
}) => {
  // Get store actions and state
  const {
    tasks,
    filteredTasks,
    filters,
    views,
    ui,
    selectedTask,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    setFilters: setStoreFilters,
    setCurrentView,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    getTaskById,
    getTaskStats,
    setLoading,
    setError
  } = useTaskStore();

  // Get API instance
  const api = getTaskAPI(queryClient);

  // Initialize store with provided values
  useEffect(() => {
    if (initialFilters) {
      setStoreFilters(initialFilters);
    }
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialFilters, initialView, setStoreFilters, setCurrentView]);

  // Setup real-time event listeners
  useEffect(() => {
    if (!enableRealtime) return;

    const handleTaskEvent = (event: CustomEvent<TaskEvent>) => {
      const taskEvent = event.detail;
      console.log('Task event received:', taskEvent);
      
      // Handle different event types
      switch (taskEvent.type) {
        case 'task:created':
          // Could refresh tasks or handle optimistically
          break;
        case 'task:updated':
          // Could update specific task in store
          break;
        case 'task:deleted':
          // Could remove task from store
          break;
      }
    };

    window.addEventListener('taskEvent', handleTaskEvent as EventListener);
    
    return () => {
      window.removeEventListener('taskEvent', handleTaskEvent as EventListener);
    };
  }, [enableRealtime]);

  // Enhanced actions with API integration
  const enhancedActions = {
    setFilters: (newFilters: Partial<TaskFilters>) => {
      setStoreFilters(newFilters);
      // Could trigger API refetch here if needed
    },
    
    // These would typically be handled by React Query mutations
    // but we're providing them for direct store manipulation if needed
    setTasks,
    addTask,
    updateTask: enableOptimisticUpdates ? updateTask : (id: string, updates: Partial<Task>) => {
      // Non-optimistic update - wait for API response
      setLoading(true);
      api.updateTask(id, updates)
        .then(updatedTask => {
          updateTask(id, updatedTask);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    },
    deleteTask: enableOptimisticUpdates ? deleteTask : (id: string) => {
      setLoading(true);
      api.deleteTask(id)
        .then(() => {
          deleteTask(id);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    }
  };

  // Context value
  const contextValue: TasksContextValue = {
    // State
    tasks,
    filteredTasks,
    filters,
    currentView: views.current,
    selectedTasks: ui.selectedTasks,
    isLoading: ui.isLoading,
    error: ui.error,
    
    // Actions
    ...enhancedActions,
    setCurrentView,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    
    // Utilities
    getTaskById,
    getTaskStats,
    
    // API
    api
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TasksContext.Provider value={contextValue}>
        {children}
      </TasksContext.Provider>
    </QueryClientProvider>
  );
};

// Hook to use tasks context
export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

// Specialized hooks for specific functionality
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

// Higher-order component for tasks functionality
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

// Default export
export default TasksProvider;