/**
 * 🚀 Core Task Store - Zustand Implementation
 * 
 * Replaces React Context with high-performance Zustand store
 * Features: Type-safe state, optimistic updates, persistence, dev tools
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/ecosystem/internal/tasks/types/task.types';

// ===== INTERFACES =====

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assignedTo?: string[];
  dueDateRange?: {
    start?: string;
    end?: string;
  };
  searchQuery?: string;
}

export interface TaskSortConfig {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

export interface TaskViewState {
  selectedTasks: Set<string>;
  expandedTasks: Set<string>;
  sortConfig: TaskSortConfig;
  viewMode: 'list' | 'board' | 'calendar' | 'timeline';
  groupBy?: keyof Task;
}

// ===== MAIN STORE INTERFACE =====

interface TaskStore {
  // ===== STATE =====
  tasks: Task[];
  filters: TaskFilters;
  viewState: TaskViewState;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
  optimisticUpdates: Map<string, Task>; // For handling concurrent updates

  // ===== COMPUTED SELECTORS =====
  getFilteredTasks: () => Task[];
  getSelectedTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTaskStats: () => {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    byPriority: Record<TaskPriority, number>;
    byCategory: Record<TaskCategory, number>;
  };

  // ===== TASK CRUD ACTIONS =====
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => string; // Returns generated ID
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => string; // Returns new task ID

  // ===== BULK OPERATIONS =====
  addTasks: (tasks: Omit<Task, 'id' | 'created_at'>[]) => string[];
  updateTasks: (updates: Array<{ id: string; updates: Partial<Task> }>) => void;
  deleteTasks: (ids: string[]) => void;
  completeSelectedTasks: () => void;
  deleteSelectedTasks: () => void;

  // ===== FILTER & SORT ACTIONS =====
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  setSortConfig: (sortConfig: TaskSortConfig) => void;
  setSearchQuery: (query: string) => void;

  // ===== VIEW STATE ACTIONS =====
  setViewMode: (mode: TaskViewState['viewMode']) => void;
  setGroupBy: (field: keyof Task | undefined) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  selectTasksInRange: (startId: string, endId: string) => void;
  toggleTaskExpansion: (id: string) => void;

  // ===== UTILITY ACTIONS =====
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  syncTasks: () => Promise<void>;
  resetStore: () => void;
}

// ===== INITIAL STATE =====

const initialViewState: TaskViewState = {
  selectedTasks: new Set(),
  expandedTasks: new Set(),
  sortConfig: { field: 'created_at', direction: 'desc' },
  viewMode: 'list',
  groupBy: undefined,
};

const initialState = {
  tasks: [],
  filters: {},
  viewState: initialViewState,
  isLoading: false,
  error: null,
  lastSyncTime: null,
  optimisticUpdates: new Map(),
};

// ===== HELPER FUNCTIONS =====

const generateId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const applyFilters = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter((task) => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority?.length && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Category filter
    if (filters.category?.length && !filters.category.includes(task.category)) {
      return false;
    }

    // Assigned to filter
    if (filters.assignedTo?.length && task.assigned_to && !filters.assignedTo.includes(task.assigned_to)) {
      return false;
    }

    // Due date range filter
    if (filters.dueDateRange && task.due_date) {
      const dueDate = new Date(task.due_date);
      const { start, end } = filters.dueDateRange;
      
      if (start && dueDate < new Date(start)) return false;
      if (end && dueDate > new Date(end)) return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        task.title,
        task.description,
        task.labels?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    return true;
  });
};

const applySorting = (tasks: Task[], sortConfig: TaskSortConfig): Task[] => {
  return [...tasks].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    // Compare values
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    
    // Apply direction
    return sortConfig.direction === 'desc' ? -comparison : comparison;
  });
};

// ===== ZUSTAND STORE IMPLEMENTATION =====

export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // ===== INITIAL STATE =====
          ...initialState,

          // ===== COMPUTED SELECTORS =====
          getFilteredTasks: () => {
            const { tasks, filters, viewState } = get();
            const filtered = applyFilters(tasks, filters);
            return applySorting(filtered, viewState.sortConfig);
          },

          getSelectedTasks: () => {
            const { tasks, viewState } = get();
            return tasks.filter(task => viewState.selectedTasks.has(task.id));
          },

          getTaskById: (id: string) => {
            const { tasks, optimisticUpdates } = get();
            // Check optimistic updates first
            const optimisticTask = optimisticUpdates.get(id);
            if (optimisticTask) return optimisticTask;
            
            return tasks.find(task => task.id === id);
          },

          getTaskStats: () => {
            const { tasks } = get();
            
            const stats = {
              total: tasks.length,
              completed: 0,
              inProgress: 0,
              pending: 0,
              byPriority: {} as Record<TaskPriority, number>,
              byCategory: {} as Record<TaskCategory, number>,
            };

            // Initialize counters
            const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
            const categories: TaskCategory[] = ['main', 'weekly', 'daily', 'siso_app_dev', 'onboarding_app', 'instagram'];
            
            priorities.forEach(p => stats.byPriority[p] = 0);
            categories.forEach(c => stats.byCategory[c] = 0);

            // Count stats
            tasks.forEach(task => {
              // Status counts
              if (task.status === 'completed') stats.completed++;
              else if (task.status === 'in_progress') stats.inProgress++;
              else stats.pending++;

              // Priority counts
              stats.byPriority[task.priority]++;

              // Category counts
              stats.byCategory[task.category]++;
            });

            return stats;
          },

          // ===== TASK CRUD ACTIONS =====
          setTasks: (tasks) =>
            set((state) => {
              state.tasks = tasks;
              state.lastSyncTime = Date.now();
              state.error = null;
            }),

          addTask: (taskData) => {
            const id = generateId();
            const newTask: Task = {
              ...taskData,
              id,
              created_at: new Date().toISOString(),
            };

            set((state) => {
              state.tasks.push(newTask);
            });

            return id;
          },

          updateTask: (id, updates) =>
            set((state) => {
              const taskIndex = state.tasks.findIndex(task => task.id === id);
              if (taskIndex !== -1) {
                Object.assign(state.tasks[taskIndex], updates);
              }
              
              // Add to optimistic updates for real-time feel
              const updatedTask = state.tasks[taskIndex];
              if (updatedTask) {
                state.optimisticUpdates.set(id, updatedTask);
              }
            }),

          deleteTask: (id) =>
            set((state) => {
              state.tasks = state.tasks.filter(task => task.id !== id);
              state.viewState.selectedTasks.delete(id);
              state.viewState.expandedTasks.delete(id);
              state.optimisticUpdates.delete(id);
            }),

          duplicateTask: (id) => {
            const task = get().getTaskById(id);
            if (!task) return '';

            const newId = generateId();
            const duplicatedTask: Task = {
              ...task,
              id: newId,
              title: `${task.title} (Copy)`,
              status: 'pending',
              created_at: new Date().toISOString(),
              parent_task_id: undefined, // Don't inherit parent relationship
            };

            set((state) => {
              state.tasks.push(duplicatedTask);
            });

            return newId;
          },

          // ===== BULK OPERATIONS =====
          addTasks: (tasksData) => {
            const newIds: string[] = [];
            
            set((state) => {
              tasksData.forEach(taskData => {
                const id = generateId();
                const newTask: Task = {
                  ...taskData,
                  id,
                  created_at: new Date().toISOString(),
                };
                state.tasks.push(newTask);
                newIds.push(id);
              });
            });

            return newIds;
          },

          updateTasks: (updates) =>
            set((state) => {
              updates.forEach(({ id, updates: taskUpdates }) => {
                const taskIndex = state.tasks.findIndex(task => task.id === id);
                if (taskIndex !== -1) {
                  Object.assign(state.tasks[taskIndex], taskUpdates);
                }
              });
            }),

          deleteTasks: (ids) =>
            set((state) => {
              state.tasks = state.tasks.filter(task => !ids.includes(task.id));
              ids.forEach(id => {
                state.viewState.selectedTasks.delete(id);
                state.viewState.expandedTasks.delete(id);
                state.optimisticUpdates.delete(id);
              });
            }),

          completeSelectedTasks: () => {
            const { viewState } = get();
            get().updateTasks(
              Array.from(viewState.selectedTasks).map(id => ({
                id,
                updates: { status: 'completed' as TaskStatus }
              }))
            );
            get().clearSelection();
          },

          deleteSelectedTasks: () => {
            const { viewState } = get();
            get().deleteTasks(Array.from(viewState.selectedTasks));
          },

          // ===== FILTER & SORT ACTIONS =====
          setFilters: (newFilters) =>
            set((state) => {
              state.filters = { ...state.filters, ...newFilters };
            }),

          resetFilters: () =>
            set((state) => {
              state.filters = {};
            }),

          setSortConfig: (sortConfig) =>
            set((state) => {
              state.viewState.sortConfig = sortConfig;
            }),

          setSearchQuery: (query) =>
            set((state) => {
              state.filters.searchQuery = query || undefined;
            }),

          // ===== VIEW STATE ACTIONS =====
          setViewMode: (mode) =>
            set((state) => {
              state.viewState.viewMode = mode;
            }),

          setGroupBy: (field) =>
            set((state) => {
              state.viewState.groupBy = field;
            }),

          toggleTaskSelection: (id) =>
            set((state) => {
              if (state.viewState.selectedTasks.has(id)) {
                state.viewState.selectedTasks.delete(id);
              } else {
                state.viewState.selectedTasks.add(id);
              }
            }),

          selectAllTasks: () =>
            set((state) => {
              const filteredTasks = get().getFilteredTasks();
              state.viewState.selectedTasks = new Set(filteredTasks.map(task => task.id));
            }),

          clearSelection: () =>
            set((state) => {
              state.viewState.selectedTasks.clear();
            }),

          selectTasksInRange: (startId, endId) => {
            const filteredTasks = get().getFilteredTasks();
            const startIndex = filteredTasks.findIndex(task => task.id === startId);
            const endIndex = filteredTasks.findIndex(task => task.id === endId);
            
            if (startIndex === -1 || endIndex === -1) return;
            
            const [start, end] = [startIndex, endIndex].sort((a, b) => a - b);
            
            set((state) => {
              for (let i = start; i <= end; i++) {
                state.viewState.selectedTasks.add(filteredTasks[i].id);
              }
            });
          },

          toggleTaskExpansion: (id) =>
            set((state) => {
              if (state.viewState.expandedTasks.has(id)) {
                state.viewState.expandedTasks.delete(id);
              } else {
                state.viewState.expandedTasks.add(id);
              }
            }),

          // ===== UTILITY ACTIONS =====
          setLoading: (loading) =>
            set((state) => {
              state.isLoading = loading;
            }),

          setError: (error) =>
            set((state) => {
              state.error = error;
              state.isLoading = false;
            }),

          clearError: () =>
            set((state) => {
              state.error = null;
            }),

          syncTasks: async () => {
            // Implementation for syncing with backend
            // This would typically involve API calls
            set((state) => {
              state.lastSyncTime = Date.now();
              state.optimisticUpdates.clear();
            });
          },

          resetStore: () =>
            set(() => ({
              ...initialState,
              viewState: {
                ...initialViewState,
                selectedTasks: new Set(),
                expandedTasks: new Set(),
              },
            })),
        }))
      ),
      {
        name: 'task-store', // localStorage key
        partialize: (state) => ({
          // Only persist essential state, not loading/error states
          filters: state.filters,
          viewState: {
            ...state.viewState,
            selectedTasks: new Set(), // Don't persist selections
            expandedTasks: new Set(), // Don't persist expansions
          },
        }),
      }
    ),
    {
      name: 'TaskStore', // DevTools name
    }
  )
);

// ===== SPECIALIZED HOOKS =====

// Hook for only task data (performance optimized)
export const useTaskData = () => {
  return useTaskStore((state) => ({
    tasks: state.tasks,
    filteredTasks: state.getFilteredTasks(),
    isLoading: state.isLoading,
    error: state.error,
  }));
};

// Hook for only actions (won't cause re-renders)
export const useTaskActions = () => {
  return useTaskStore((state) => ({
    addTask: state.addTask,
    updateTask: state.updateTask,
    deleteTask: state.deleteTask,
    duplicateTask: state.duplicateTask,
    addTasks: state.addTasks,
    updateTasks: state.updateTasks,
    deleteTasks: state.deleteTasks,
    completeSelectedTasks: state.completeSelectedTasks,
    deleteSelectedTasks: state.deleteSelectedTasks,
  }));
};

// Hook for only filters (minimal re-renders)
export const useTaskFilters = () => {
  return useTaskStore((state) => ({
    filters: state.filters,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    setSearchQuery: state.setSearchQuery,
  }));
};

// Hook for only view state
export const useTaskViewState = () => {
  return useTaskStore((state) => ({
    viewState: state.viewState,
    selectedTasks: state.getSelectedTasks(),
    setViewMode: state.setViewMode,
    setGroupBy: state.setGroupBy,
    setSortConfig: state.setSortConfig,
    toggleTaskSelection: state.toggleTaskSelection,
    selectAllTasks: state.selectAllTasks,
    clearSelection: state.clearSelection,
    selectTasksInRange: state.selectTasksInRange,
    toggleTaskExpansion: state.toggleTaskExpansion,
  }));
};

// Hook for only stats (computed values)
export const useTaskStats = () => {
  return useTaskStore((state) => state.getTaskStats());
};

// Hook for utilities and sync
export const useTaskUtils = () => {
  return useTaskStore((state) => ({
    getTaskById: state.getTaskById,
    syncTasks: state.syncTasks,
    resetStore: state.resetStore,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  }));
};

export default useTaskStore;