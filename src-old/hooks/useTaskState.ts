/**
 * 🎛️ useTaskState Hook - UI State Management
 * 
 * Manages all client-side UI state for task interactions including:
 * - Task expansion states
 * - Filtering and sorting
 * - Search functionality  
 * - Selection management
 * - Focus session tracking
 * 
 * This hook is pure UI state - no server interactions.
 * Designed to work with processed task data from useTaskCRUD.
 */

import { useState, useMemo, useCallback } from 'react';
import { Task } from '@/components/tasks/TaskCard';

/**
 * Filter configuration for task list
 */
interface TaskFilters {
  status?: 'pending' | 'completed' | 'in-progress' | 'need-help';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dateRange?: { start: Date; end: Date };
  hasSubtasks?: boolean;
  focusIntensity?: 1 | 2 | 3 | 4;
}

/**
 * Sort configuration for task list
 */
interface TaskSortOptions {
  field: 'createdAt' | 'priority' | 'dueDate' | 'title' | 'status' | 'focusIntensity';
  direction: 'asc' | 'desc';
}

/**
 * Expansion state management
 */
interface TaskExpansionState {
  expandedTasks: Set<string>;
  expandedSubtasks: { [key: string]: boolean };
  activeFocusSession: string | null;
}

/**
 * Selection state for bulk operations
 */
interface TaskSelectionState {
  selectedTasks: Set<string>;
  selectedSubtasks: Set<string>;
}

/**
 * Main task UI state management hook
 */
export const useTaskState = (initialTasks: Task[] = []) => {
  // Filter and search state
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Expansion state management
  const [expansionState, setExpansionState] = useState<TaskExpansionState>({
    expandedTasks: new Set(initialTasks.slice(0, 2).map(task => task.id)), // Auto-expand first 2 tasks
    expandedSubtasks: {},
    activeFocusSession: null
  });

  // Selection state for bulk operations
  const [selectionState, setSelectionState] = useState<TaskSelectionState>({
    selectedTasks: new Set(),
    selectedSubtasks: new Set()
  });

  // UI interaction states
  const [editingStates, setEditingStates] = useState<{
    editingTask: string | null;
    editingSubtask: string | null;
    editTaskTitle: string;
    editSubtaskTitle: string;
  }>({
    editingTask: null,
    editingSubtask: null,
    editTaskTitle: '',
    editSubtaskTitle: ''
  });

  // Calendar and modal states
  const [uiStates, setUiStates] = useState({
    calendarSubtaskId: null as string | null,
    selectedTask: null as Task | null,
    isModalOpen: false,
    showFilters: false,
    showBulkActions: false
  });

  /**
   * COMPUTED DATA - Filtered, sorted, and processed tasks
   * 
   * This is the main data processing pipeline that transforms
   * raw task data into the final UI state.
   */
  const processedTasks = useMemo(() => {
    let result = [...initialTasks];

    // Apply text search first (most selective)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(task => {
        // Search in task title and description
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query);
        
        // Search in subtask titles and descriptions
        const subtaskMatch = task.subtasks.some(subtask =>
          subtask.title.toLowerCase().includes(query) ||
          subtask.description?.toLowerCase().includes(query)
        );
        
        return titleMatch || descMatch || subtaskMatch;
      });
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(task => task.context === filters.category);
    }

    // Apply subtask filter
    if (filters.hasSubtasks !== undefined) {
      result = result.filter(task => 
        filters.hasSubtasks ? task.subtasks.length > 0 : task.subtasks.length === 0
      );
    }

    // Apply focus intensity filter (for deep work tasks)
    if (filters.focusIntensity) {
      result = result.filter(task => task.focusIntensity === filters.focusIntensity);
    }

    // Apply date range filter
    if (filters.dateRange) {
      result = result.filter(task => {
        // This would work with a createdAt timestamp if available
        // For now, we'll skip date filtering until the data model is enhanced
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          // Priority order: high > medium > low
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          // Status order: in-progress > pending > need-help > completed
          const statusOrder = { 
            'in-progress': 4, 
            pending: 3, 
            'need-help': 2, 
            completed: 1 
          };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        case 'focusIntensity':
          aValue = a.focusIntensity || 0;
          bValue = b.focusIntensity || 0;
          break;
        case 'createdAt':
        case 'dueDate':
        default:
          // For now, maintain original order since we don't have timestamps
          // This would be enhanced when the data model includes proper dates
          aValue = initialTasks.indexOf(a);
          bValue = initialTasks.indexOf(b);
          break;
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [initialTasks, filters, sortOptions, searchQuery]);

  /**
   * EXPANSION STATE MANAGEMENT
   * 
   * Handles task and subtask expansion with intelligent defaults
   */
  const expansionActions = {
    // Toggle task expansion
    toggleTaskExpansion: useCallback((taskId: string) => {
      setExpansionState(prev => {
        const newExpandedTasks = new Set(prev.expandedTasks);
        if (newExpandedTasks.has(taskId)) {
          newExpandedTasks.delete(taskId);
        } else {
          newExpandedTasks.add(taskId);
        }
        return { ...prev, expandedTasks: newExpandedTasks };
      });
    }, []),

    // Toggle subtask expansion
    toggleSubtaskExpansion: useCallback((taskId: string, subtaskId: string) => {
      const key = `${taskId}-${subtaskId}`;
      setExpansionState(prev => ({
        ...prev,
        expandedSubtasks: {
          ...prev.expandedSubtasks,
          [key]: !prev.expandedSubtasks[key]
        }
      }));
    }, []),

    // Expand all tasks
    expandAllTasks: useCallback(() => {
      setExpansionState(prev => ({
        ...prev,
        expandedTasks: new Set(processedTasks.map(task => task.id))
      }));
    }, [processedTasks]),

    // Collapse all tasks
    collapseAllTasks: useCallback(() => {
      setExpansionState(prev => ({
        ...prev,
        expandedTasks: new Set(),
        expandedSubtasks: {}
      }));
    }, []),

    // Focus session management
    setActiveFocusSession: useCallback((sessionKey: string | null) => {
      setExpansionState(prev => ({
        ...prev,
        activeFocusSession: sessionKey
      }));
    }, [])
  };

  /**
   * SELECTION MANAGEMENT
   * 
   * Handles single and bulk selection for task operations
   */
  const selectionActions = {
    // Toggle single task selection
    toggleTaskSelection: useCallback((taskId: string) => {
      setSelectionState(prev => {
        const newSelectedTasks = new Set(prev.selectedTasks);
        if (newSelectedTasks.has(taskId)) {
          newSelectedTasks.delete(taskId);
        } else {
          newSelectedTasks.add(taskId);
        }
        return { ...prev, selectedTasks: newSelectedTasks };
      });
    }, []),

    // Select all visible tasks
    selectAllTasks: useCallback(() => {
      setSelectionState(prev => ({
        ...prev,
        selectedTasks: new Set(processedTasks.map(task => task.id))
      }));
    }, [processedTasks]),

    // Clear all selections
    clearSelection: useCallback(() => {
      setSelectionState({
        selectedTasks: new Set(),
        selectedSubtasks: new Set()
      });
    }, []),

    // Toggle subtask selection
    toggleSubtaskSelection: useCallback((taskId: string, subtaskId: string) => {
      const key = `${taskId}-${subtaskId}`;
      setSelectionState(prev => {
        const newSelectedSubtasks = new Set(prev.selectedSubtasks);
        if (newSelectedSubtasks.has(key)) {
          newSelectedSubtasks.delete(key);
        } else {
          newSelectedSubtasks.add(key);
        }
        return { ...prev, selectedSubtasks: newSelectedSubtasks };
      });
    }, [])
  };

  /**
   * FILTER AND SORT MANAGEMENT
   * 
   * Controls data processing and view configuration
   */
  const filterActions = {
    // Update filters
    updateFilters: useCallback((newFilters: Partial<TaskFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }, []),

    // Clear all filters
    clearAllFilters: useCallback(() => {
      setFilters({});
      setSearchQuery('');
    }, []),

    // Update sort options
    updateSortOptions: useCallback((newSort: Partial<TaskSortOptions>) => {
      setSortOptions(prev => ({ ...prev, ...newSort }));
    }, []),

    // Toggle sort direction for current field
    toggleSortDirection: useCallback(() => {
      setSortOptions(prev => ({
        ...prev,
        direction: prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    }, []),

    // Reset to default sort
    resetSort: useCallback(() => {
      setSortOptions({ field: 'createdAt', direction: 'desc' });
    }, [])
  };

  /**
   * EDITING STATE MANAGEMENT
   * 
   * Handles inline editing of tasks and subtasks
   */
  const editingActions = {
    // Start editing task
    startEditingTask: useCallback((taskId: string, currentTitle: string) => {
      setEditingStates(prev => ({
        ...prev,
        editingTask: taskId,
        editTaskTitle: currentTitle,
        editingSubtask: null // Close subtask editing
      }));
    }, []),

    // Start editing subtask
    startEditingSubtask: useCallback((subtaskId: string, currentTitle: string) => {
      setEditingStates(prev => ({
        ...prev,
        editingSubtask: subtaskId,
        editSubtaskTitle: currentTitle,
        editingTask: null // Close task editing
      }));
    }, []),

    // Update editing titles
    updateEditTaskTitle: useCallback((title: string) => {
      setEditingStates(prev => ({ ...prev, editTaskTitle: title }));
    }, []),

    updateEditSubtaskTitle: useCallback((title: string) => {
      setEditingStates(prev => ({ ...prev, editSubtaskTitle: title }));
    }, []),

    // Cancel editing
    cancelEditing: useCallback(() => {
      setEditingStates({
        editingTask: null,
        editingSubtask: null,
        editTaskTitle: '',
        editSubtaskTitle: ''
      });
    }, [])
  };

  /**
   * UI STATE MANAGEMENT
   * 
   * Handles modals, calendars, and other UI elements
   */
  const uiActions = {
    // Modal management
    openTaskModal: useCallback((task: Task) => {
      setUiStates(prev => ({
        ...prev,
        selectedTask: task,
        isModalOpen: true
      }));
    }, []),

    closeTaskModal: useCallback(() => {
      setUiStates(prev => ({
        ...prev,
        selectedTask: null,
        isModalOpen: false
      }));
    }, []),

    // Calendar management
    toggleCalendar: useCallback((subtaskId: string | null) => {
      setUiStates(prev => ({
        ...prev,
        calendarSubtaskId: prev.calendarSubtaskId === subtaskId ? null : subtaskId
      }));
    }, []),

    // Filter panel management
    toggleFilterPanel: useCallback(() => {
      setUiStates(prev => ({
        ...prev,
        showFilters: !prev.showFilters
      }));
    }, []),

    // Bulk actions management
    toggleBulkActions: useCallback(() => {
      setUiStates(prev => ({
        ...prev,
        showBulkActions: !prev.showBulkActions
      }));
    }, [])
  };

  /**
   * COMPUTED GETTERS
   * 
   * Derived state for easy access in components
   */
  const getters = {
    // Check if task is expanded
    isTaskExpanded: useCallback((taskId: string) => {
      return expansionState.expandedTasks.has(taskId);
    }, [expansionState.expandedTasks]),

    // Check if subtask is expanded
    isSubtaskExpanded: useCallback((taskId: string, subtaskId: string) => {
      const key = `${taskId}-${subtaskId}`;
      return !!expansionState.expandedSubtasks[key];
    }, [expansionState.expandedSubtasks]),

    // Check if task is selected
    isTaskSelected: useCallback((taskId: string) => {
      return selectionState.selectedTasks.has(taskId);
    }, [selectionState.selectedTasks]),

    // Check if subtask is selected
    isSubtaskSelected: useCallback((taskId: string, subtaskId: string) => {
      const key = `${taskId}-${subtaskId}`;
      return selectionState.selectedSubtasks.has(key);
    }, [selectionState.selectedSubtasks]),

    // Get active focus session
    getActiveFocusSession: useCallback(() => {
      return expansionState.activeFocusSession;
    }, [expansionState.activeFocusSession]),

    // Check if task/subtask has active focus session
    isInFocusSession: useCallback((taskId: string, subtaskId?: string) => {
      const sessionKey = subtaskId ? `${taskId}-${subtaskId}` : taskId;
      return expansionState.activeFocusSession === sessionKey;
    }, [expansionState.activeFocusSession])
  };

  /**
   * STATISTICS AND METRICS
   * 
   * Computed stats for dashboard and progress indicators
   */
  const stats = useMemo(() => {
    const total = processedTasks.length;
    const completed = processedTasks.filter(task => task.status === 'completed').length;
    const inProgress = processedTasks.filter(task => task.status === 'in-progress').length;
    const needHelp = processedTasks.filter(task => task.status === 'need-help').length;
    const pending = processedTasks.filter(task => task.status === 'pending').length;

    const totalSubtasks = processedTasks.reduce((acc, task) => acc + task.subtasks.length, 0);
    const completedSubtasks = processedTasks.reduce((acc, task) => 
      acc + task.subtasks.filter(subtask => subtask.status === 'completed').length, 0
    );

    return {
      total,
      completed,
      inProgress,
      needHelp,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalSubtasks,
      completedSubtasks,
      subtaskCompletionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
      selectedCount: selectionState.selectedTasks.size,
      hasFiltersActive: Object.keys(filters).length > 0 || searchQuery.trim().length > 0,
    };
  }, [processedTasks, selectionState.selectedTasks, filters, searchQuery]);

  return {
    // Processed data
    tasks: processedTasks,
    stats,
    
    // Current state
    filters,
    sortOptions,
    searchQuery,
    
    // Expansion state
    expandedTasks: Array.from(expansionState.expandedTasks),
    expandedSubtasks: expansionState.expandedSubtasks,
    activeFocusSession: expansionState.activeFocusSession,
    
    // Selection state
    selectedTasks: Array.from(selectionState.selectedTasks),
    selectedSubtasks: Array.from(selectionState.selectedSubtasks),
    hasSelection: selectionState.selectedTasks.size > 0,
    
    // Editing state
    editingTask: editingStates.editingTask,
    editingSubtask: editingStates.editingSubtask,
    editTaskTitle: editingStates.editTaskTitle,
    editSubtaskTitle: editingStates.editSubtaskTitle,
    
    // UI state
    calendarSubtaskId: uiStates.calendarSubtaskId,
    selectedTask: uiStates.selectedTask,
    isModalOpen: uiStates.isModalOpen,
    showFilters: uiStates.showFilters,
    showBulkActions: uiStates.showBulkActions,
    
    // Actions
    setSearchQuery,
    ...expansionActions,
    ...selectionActions,
    ...filterActions,
    ...editingActions,
    ...uiActions,
    ...getters
  };
};

/**
 * Type exports for external use
 */
export type { 
  TaskFilters, 
  TaskSortOptions, 
  TaskExpansionState, 
  TaskSelectionState 
};