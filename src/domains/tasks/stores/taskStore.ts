/**
 * Modern Task State Management with Zustand
 * Provides centralized state management for the task system
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Task, 
  TaskFilters, 
  TaskViewState, 
  TaskViewType, 
  TaskViewConfig,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  BulkTaskUpdate 
} from '@/domains/tasks/types/task.types';
import { DEFAULT_TASK_VALUES } from '@/domains/tasks/constants/taskConstants';

// UI State interface
interface TaskUIState {
  sidebarOpen: boolean;
  selectedTasks: Set<string>;
  bulkActionsMode: boolean;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Main Task Store interface
interface TaskState {
  // Data
  tasks: Task[];
  filteredTasks: Task[];
  
  // Filters
  filters: TaskFilters;
  activeFilters: string[];
  
  // Views
  views: TaskViewState;
  
  // UI State
  ui: TaskUIState;
  
  // Selected task for editing
  selectedTask: Task | null;
  
  // Actions - Data Management
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  bulkUpdateTasks: (updates: BulkTaskUpdate[]) => void;
  bulkDeleteTasks: (ids: string[]) => void;
  
  // Actions - Filtering
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  addFilterPreset: (name: string, filters: TaskFilters) => void;
  
  // Actions - Views
  setCurrentView: (view: TaskViewType) => void;
  updateViewConfig: (view: TaskViewType, config: Partial<TaskViewConfig>) => void;
  saveViewPreset: (name: string, config: TaskViewConfig) => void;
  
  // Actions - Task Selection
  setSelectedTasks: (tasks: Set<string>) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  selectTasksByFilter: (predicate: (task: Task) => boolean) => void;
  
  // Actions - UI State
  setSidebarOpen: (open: boolean) => void;
  setBulkActionsMode: (mode: boolean) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTask: (task: Task | null) => void;
  
  // Actions - Utilities
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
  getOverdueTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksCompletedToday: () => Task[];
  
  // Actions - Analytics
  getTaskStats: () => {
    total: number;
    completed: number;
    overdue: number;
    inProgress: number;
    completionRate: number;
    avgCompletionTime: number;
  };
}

// Default states
const defaultFilters: TaskFilters = {
  status: [],
  priority: [],
  category: [],
  assigned_to: [],
  project_id: [],
  tags: [],
  search: '',
  is_overdue: undefined,
  has_subtasks: undefined
};

const defaultViewState: TaskViewState = {
  current: TaskViewType.LIST,
  configs: {
    [TaskViewType.LIST]: {
      type: TaskViewType.LIST,
      sortBy: 'created_at',
      sortDirection: 'desc',
      columns: ['title', 'status', 'priority', 'due_date', 'assigned_to']
    },
    [TaskViewType.KANBAN]: {
      type: TaskViewType.KANBAN,
      groupBy: 'status',
      sortBy: 'priority',
      sortDirection: 'desc'
    },
    [TaskViewType.CALENDAR]: {
      type: TaskViewType.CALENDAR,
      groupBy: 'due_date',
      sortBy: 'due_date',
      sortDirection: 'asc'
    },
    [TaskViewType.TIMELINE]: {
      type: TaskViewType.TIMELINE,
      sortBy: 'created_at',
      sortDirection: 'asc'
    },
    [TaskViewType.GANTT]: {
      type: TaskViewType.GANTT,
      sortBy: 'due_date',
      sortDirection: 'asc'
    }
  },
  presets: {}
};

const defaultUIState: TaskUIState = {
  sidebarOpen: true,
  selectedTasks: new Set(),
  bulkActionsMode: false,
  searchQuery: '',
  isLoading: false,
  error: null,
  lastUpdated: null
};

// Utility functions
const filterTasks = (tasks: Task[], filters: TaskFilters, searchQuery: string): Task[] => {
  let filtered = [...tasks];
  
  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query)) ||
      task.assigned_to?.toLowerCase().includes(query)
    );
  }
  
  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(task => filters.status!.includes(task.status));
  }
  
  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(task => filters.priority!.includes(task.priority));
  }
  
  // Category filter
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(task => filters.category!.includes(task.category));
  }
  
  // Assigned to filter
  if (filters.assigned_to && filters.assigned_to.length > 0) {
    filtered = filtered.filter(task => 
      task.assigned_to && filters.assigned_to!.includes(task.assigned_to)
    );
  }
  
  // Project filter
  if (filters.project_id && filters.project_id.length > 0) {
    filtered = filtered.filter(task => 
      task.project_id && filters.project_id!.includes(task.project_id)
    );
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(task => 
      filters.tags!.some(tag => task.tags.includes(tag))
    );
  }
  
  // Due date range filter
  if (filters.due_date_range) {
    const { start, end } = filters.due_date_range;
    filtered = filtered.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= new Date(start) && dueDate <= new Date(end);
    });
  }
  
  // Overdue filter
  if (filters.is_overdue !== undefined) {
    filtered = filtered.filter(task => task.is_overdue === filters.is_overdue);
  }
  
  // Has subtasks filter
  if (filters.has_subtasks !== undefined) {
    filtered = filtered.filter(task => 
      (task.subtasks.length > 0) === filters.has_subtasks
    );
  }
  
  return filtered;
};

const getActiveFilters = (filters: TaskFilters, searchQuery: string): string[] => {
  const active: string[] = [];
  
  if (searchQuery.trim()) active.push('search');
  if (filters.status && filters.status.length > 0) active.push('status');
  if (filters.priority && filters.priority.length > 0) active.push('priority');
  if (filters.category && filters.category.length > 0) active.push('category');
  if (filters.assigned_to && filters.assigned_to.length > 0) active.push('assigned_to');
  if (filters.project_id && filters.project_id.length > 0) active.push('project_id');
  if (filters.tags && filters.tags.length > 0) active.push('tags');
  if (filters.due_date_range) active.push('due_date_range');
  if (filters.is_overdue !== undefined) active.push('is_overdue');
  if (filters.has_subtasks !== undefined) active.push('has_subtasks');
  
  return active;
};

// Create the store
export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          tasks: [],
          filteredTasks: [],
          filters: defaultFilters,
          activeFilters: [],
          views: defaultViewState,
          ui: defaultUIState,
          selectedTask: null,
          
          // Data Management Actions
          setTasks: (tasks) => set((state) => {
            state.tasks = tasks;
            state.ui.lastUpdated = new Date().toISOString();
            // Re-apply filters when tasks change
            const { filters, ui } = get();
            state.filteredTasks = filterTasks(tasks, filters, ui.searchQuery);
            state.activeFilters = getActiveFilters(filters, ui.searchQuery);
          }),
          
          addTask: (task) => set((state) => {
            state.tasks.push(task);
            state.ui.lastUpdated = new Date().toISOString();
            // Re-apply filters
            const { filters, ui } = get();
            state.filteredTasks = filterTasks(state.tasks, filters, ui.searchQuery);
          }),
          
          updateTask: (id, updates) => set((state) => {
            const taskIndex = state.tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
              Object.assign(state.tasks[taskIndex], updates, {
                updated_at: new Date().toISOString()
              });
              state.ui.lastUpdated = new Date().toISOString();
              
              // Update selected task if it's the one being updated
              if (state.selectedTask?.id === id) {
                Object.assign(state.selectedTask, updates);
              }
              
              // Re-apply filters
              const { filters, ui } = get();
              state.filteredTasks = filterTasks(state.tasks, filters, ui.searchQuery);
            }
          }),
          
          deleteTask: (id) => set((state) => {
            state.tasks = state.tasks.filter(t => t.id !== id);
            state.ui.selectedTasks.delete(id);
            if (state.selectedTask?.id === id) {
              state.selectedTask = null;
            }
            state.ui.lastUpdated = new Date().toISOString();
            
            // Re-apply filters
            const { filters, ui } = get();
            state.filteredTasks = filterTasks(state.tasks, filters, ui.searchQuery);
          }),
          
          bulkUpdateTasks: (updates) => set((state) => {
            updates.forEach(({ id, updates: taskUpdates }) => {
              const taskIndex = state.tasks.findIndex(t => t.id === id);
              if (taskIndex !== -1) {
                Object.assign(state.tasks[taskIndex], taskUpdates, {
                  updated_at: new Date().toISOString()
                });
              }
            });
            state.ui.lastUpdated = new Date().toISOString();
            
            // Re-apply filters
            const { filters, ui } = get();
            state.filteredTasks = filterTasks(state.tasks, filters, ui.searchQuery);
          }),
          
          bulkDeleteTasks: (ids) => set((state) => {
            state.tasks = state.tasks.filter(t => !ids.includes(t.id));
            ids.forEach(id => state.ui.selectedTasks.delete(id));
            if (state.selectedTask && ids.includes(state.selectedTask.id)) {
              state.selectedTask = null;
            }
            state.ui.lastUpdated = new Date().toISOString();
            
            // Re-apply filters
            const { filters, ui } = get();
            state.filteredTasks = filterTasks(state.tasks, filters, ui.searchQuery);
          }),
          
          // Filter Actions
          setFilters: (newFilters) => set((state) => {
            Object.assign(state.filters, newFilters);
            const { tasks, ui } = get();
            state.filteredTasks = filterTasks(tasks, state.filters, ui.searchQuery);
            state.activeFilters = getActiveFilters(state.filters, ui.searchQuery);
          }),
          
          resetFilters: () => set((state) => {
            state.filters = { ...defaultFilters };
            const { tasks, ui } = get();
            state.filteredTasks = filterTasks(tasks, state.filters, ui.searchQuery);
            state.activeFilters = getActiveFilters(state.filters, ui.searchQuery);
          }),
          
          applyFilters: () => set((state) => {
            const { tasks, filters, ui } = get();
            state.filteredTasks = filterTasks(tasks, filters, ui.searchQuery);
            state.activeFilters = getActiveFilters(filters, ui.searchQuery);
          }),
          
          addFilterPreset: (name, filters) => set((state) => {
            // Could store filter presets in the future
            console.log('Filter preset saved:', name, filters);
          }),
          
          // View Actions
          setCurrentView: (view) => set((state) => {
            state.views.current = view;
          }),
          
          updateViewConfig: (view, config) => set((state) => {
            Object.assign(state.views.configs[view], config);
          }),
          
          saveViewPreset: (name, config) => set((state) => {
            state.views.presets[name] = config;
          }),
          
          // Selection Actions
          setSelectedTasks: (tasks) => set((state) => {
            state.ui.selectedTasks = new Set(tasks);
          }),
          
          toggleTaskSelection: (id) => set((state) => {
            if (state.ui.selectedTasks.has(id)) {
              state.ui.selectedTasks.delete(id);
            } else {
              state.ui.selectedTasks.add(id);
            }
          }),
          
          selectAllTasks: () => set((state) => {
            state.ui.selectedTasks = new Set(state.filteredTasks.map(t => t.id));
          }),
          
          clearSelection: () => set((state) => {
            state.ui.selectedTasks.clear();
            state.ui.bulkActionsMode = false;
          }),
          
          selectTasksByFilter: (predicate) => set((state) => {
            const matchingIds = state.filteredTasks
              .filter(predicate)
              .map(t => t.id);
            state.ui.selectedTasks = new Set(matchingIds);
          }),
          
          // UI Actions
          setSidebarOpen: (open) => set((state) => {
            state.ui.sidebarOpen = open;
          }),
          
          setBulkActionsMode: (mode) => set((state) => {
            state.ui.bulkActionsMode = mode;
            if (!mode) {
              state.ui.selectedTasks.clear();
            }
          }),
          
          setSearchQuery: (query) => set((state) => {
            state.ui.searchQuery = query;
            const { tasks, filters } = get();
            state.filteredTasks = filterTasks(tasks, filters, query);
            state.activeFilters = getActiveFilters(filters, query);
          }),
          
          setLoading: (loading) => set((state) => {
            state.ui.isLoading = loading;
          }),
          
          setError: (error) => set((state) => {
            state.ui.error = error;
          }),
          
          setSelectedTask: (task) => set((state) => {
            state.selectedTask = task;
          }),
          
          // Utility Functions
          getTaskById: (id) => {
            return get().tasks.find(t => t.id === id);
          },
          
          getTasksByStatus: (status) => {
            return get().tasks.filter(t => t.status === status);
          },
          
          getTasksByPriority: (priority) => {
            return get().tasks.filter(t => t.priority === priority);
          },
          
          getTasksByCategory: (category) => {
            return get().tasks.filter(t => t.category === category);
          },
          
          getOverdueTasks: () => {
            return get().tasks.filter(t => t.is_overdue);
          },
          
          getCompletedTasks: () => {
            return get().tasks.filter(t => t.status === TaskStatus.COMPLETED);
          },
          
          getTasksCompletedToday: () => {
            const today = new Date().toDateString();
            return get().tasks.filter(t => 
              t.status === TaskStatus.COMPLETED && 
              new Date(t.updated_at).toDateString() === today
            );
          },
          
          // Analytics
          getTaskStats: () => {
            const tasks = get().tasks;
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            const overdue = tasks.filter(t => t.is_overdue).length;
            const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
            
            return {
              total,
              completed,
              overdue,
              inProgress,
              completionRate: total > 0 ? (completed / total) * 100 : 0,
              avgCompletionTime: 0 // TODO: Calculate based on task history
            };
          }
        }))
      ),
      {
        name: 'task-store',
        partialize: (state) => ({
          filters: state.filters,
          views: state.views,
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            searchQuery: state.ui.searchQuery
          }
        })
      }
    ),
    { name: 'TaskStore' }
  )
);

// Selectors for better performance
export const useTaskFilters = () => useTaskStore(state => state.filters);
export const useFilteredTasks = () => useTaskStore(state => state.filteredTasks);
export const useTaskSelection = () => useTaskStore(state => ({
  selectedTasks: state.ui.selectedTasks,
  bulkActionsMode: state.ui.bulkActionsMode,
  toggleTaskSelection: state.toggleTaskSelection,
  selectAllTasks: state.selectAllTasks,
  clearSelection: state.clearSelection,
  setBulkActionsMode: state.setBulkActionsMode
}));
export const useTaskViews = () => useTaskStore(state => ({
  currentView: state.views.current,
  viewConfigs: state.views.configs,
  setCurrentView: state.setCurrentView,
  updateViewConfig: state.updateViewConfig
}));
export const useTaskUI = () => useTaskStore(state => state.ui);
export const useTaskStats = () => useTaskStore(state => state.getTaskStats());

// Subscribe to store changes for debugging
if (process.env.NODE_ENV === 'development') {
  useTaskStore.subscribe(
    (state) => state.tasks.length,
    (tasksLength) => console.log('Tasks count changed:', tasksLength)
  );
}