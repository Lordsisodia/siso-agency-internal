/**
 * Optimized Task Hooks - Direct Zustand Usage
 * 
 * These hooks provide optimized, selective subscriptions to the Zustand store
 * for maximum performance and minimal re-renders.
 */

import { useTaskStore } from './taskStore';
import { TaskViewType, TaskFilters } from '../@/domains/tasks/types/task.types';

// =============================================================================
// OPTIMIZED DATA HOOKS - Selective Subscriptions
// =============================================================================

/**
 * Hook for task data with minimal re-renders
 * Only subscribes to tasks and loading state
 */
export const useTasksData = () => {
  const tasks = useTaskStore(state => state.tasks);
  const filteredTasks = useTaskStore(state => state.filteredTasks);
  const isLoading = useTaskStore(state => state.isLoading);
  const error = useTaskStore(state => state.error);
  
  return { tasks, filteredTasks, isLoading, error };
};

/**
 * Hook for only tasks array - most optimized
 * Use when you only need the tasks list
 */
export const useTasksOnly = () => {
  return useTaskStore(state => state.tasks);
};

/**
 * Hook for only filtered tasks - optimized for lists
 * Use when displaying filtered task lists
 */
export const useFilteredTasks = () => {
  return useTaskStore(state => state.filteredTasks);
};

/**
 * Hook for loading and error states only
 * Use for loading indicators and error displays
 */
export const useTasksStatus = () => {
  const isLoading = useTaskStore(state => state.isLoading);
  const error = useTaskStore(state => state.error);
  
  return { isLoading, error };
};

/**
 * Hook for task counts and stats - optimized for headers
 * Use in headers, dashboards, and analytics
 */
export const useTasksStats = () => {
  const tasks = useTaskStore(state => state.tasks);
  const filteredTasks = useTaskStore(state => state.filteredTasks);
  
  // Memoized calculations for performance
  const stats = {
    totalTasks: tasks.length,
    filteredCount: filteredTasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    pendingTasks: tasks.filter(task => task.status === 'pending').length,
    inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0
  };
  
  return stats;
};

// =============================================================================
// ACTION HOOKS - Performance Optimized
// =============================================================================

/**
 * Hook for task actions - no re-renders
 * Actions are stable and don't cause re-renders
 */
export const useTaskActions = () => {
  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const setTasks = useTaskStore(state => state.setTasks);
  
  return { addTask, updateTask, deleteTask, setTasks };
};

/**
 * Hook for filter actions - stable references
 */
export const useFilterActions = () => {
  const setFilters = useTaskStore(state => state.setFilters);
  const clearFilters = useTaskStore(state => state.clearFilters);
  const setSort = useTaskStore(state => state.setSort);
  
  return { setFilters, clearFilters, setSort };
};

/**
 * Hook for view actions - stable references
 */
export const useViewActions = () => {
  const setViewMode = useTaskStore(state => state.setViewMode);
  const toggleTaskSelection = useTaskStore(state => state.toggleTaskSelection);
  const selectAllTasks = useTaskStore(state => state.selectAllTasks);
  const clearSelection = useTaskStore(state => state.clearSelection);
  
  return { setViewMode, toggleTaskSelection, selectAllTasks, clearSelection };
};

// =============================================================================
// STATE HOOKS - UI State Management
// =============================================================================

/**
 * Hook for current filters - optimized subscription
 */
export const useCurrentFilters = () => {
  return useTaskStore(state => state.filters);
};

/**
 * Hook for current view mode - minimal subscription
 */
export const useCurrentView = () => {
  return useTaskStore(state => state.viewState.viewMode);
};

/**
 * Hook for selection state - optimized for bulk operations
 */
export const useTaskSelection = () => {
  const selectedTasks = useTaskStore(state => state.viewState.selectedTasks);
  const toggleTaskSelection = useTaskStore(state => state.toggleTaskSelection);
  const selectAllTasks = useTaskStore(state => state.selectAllTasks);
  const clearSelection = useTaskStore(state => state.clearSelection);
  
  return { 
    selectedTasks, 
    selectedCount: selectedTasks.size,
    hasSelection: selectedTasks.size > 0,
    toggleTaskSelection, 
    selectAllTasks, 
    clearSelection 
  };
};

// =============================================================================
// COMPUTED HOOKS - Derived State with Memoization
// =============================================================================

/**
 * Hook for task by ID - efficient lookup
 */
export const useTaskById = (taskId: string) => {
  return useTaskStore(state => state.tasks.find(task => task.id === taskId));
};

/**
 * Hook for task search functionality
 */
export const useTaskSearch = (searchTerm: string) => {
  const tasks = useTaskStore(state => state.tasks);
  
  // Only recalculate when tasks or searchTerm changes
  const searchResults = searchTerm.trim() === '' 
    ? tasks
    : tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  return { searchResults, resultCount: searchResults.length };
};

// =============================================================================
// UTILITY HOOKS - Helper Functions
// =============================================================================

/**
 * Hook for computed task properties
 */
export const useTaskUtils = () => {
  const getTaskProgress = (taskId: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
    if (!task?.subtasks?.length) return task?.status === 'completed' ? 100 : 0;
    
    const completed = task.subtasks.filter(sub => sub.status === 'completed').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };
  
  const isTaskOverdue = (taskId: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
    if (!task?.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };
  
  const getTaskPriority = (taskId: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
    return task?.priority || 'medium';
  };
  
  return { getTaskProgress, isTaskOverdue, getTaskPriority };
};

// =============================================================================
// MIGRATION COMPATIBILITY - Temporary Helpers
// =============================================================================

/**
 * Temporary compatibility hook - matches old useTasks interface
 * Use this during migration, then replace with specific hooks above
 */
export const useTasksCompatible = () => {
  const tasks = useTaskStore(state => state.tasks);
  const filteredTasks = useTaskStore(state => state.filteredTasks);
  const filters = useTaskStore(state => state.filters);
  const currentView = useTaskStore(state => state.viewState.viewMode);
  const selectedTasks = useTaskStore(state => state.viewState.selectedTasks);
  const isLoading = useTaskStore(state => state.isLoading);
  const error = useTaskStore(state => state.error);
  
  // Actions
  const setTasks = useTaskStore(state => state.setTasks);
  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const setFilters = useTaskStore(state => state.setFilters);
  const setCurrentView = useTaskStore(state => state.setViewMode);
  const toggleTaskSelection = useTaskStore(state => state.toggleTaskSelection);
  const selectAllTasks = useTaskStore(state => state.selectAllTasks);
  const clearSelection = useTaskStore(state => state.clearSelection);
  
  // Utilities
  const getTaskById = (id: string) => tasks.find(task => task.id === id);
  const getTaskStats = () => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length
  });
  
  return {
    // State
    tasks,
    filteredTasks,
    filters,
    currentView,
    selectedTasks,
    isLoading,
    error,
    
    // Actions
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    setFilters,
    setCurrentView,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    
    // Utilities
    getTaskById,
    getTaskStats
  };
};

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type TasksDataHook = ReturnType<typeof useTasksData>;
export type TaskActionsHook = ReturnType<typeof useTaskActions>;
export type TaskSelectionHook = ReturnType<typeof useTaskSelection>;
export type TaskStatsHook = ReturnType<typeof useTasksStats>;