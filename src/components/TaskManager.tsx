/**
 * 🎛️ TaskManager - Modern Task Management Component
 * 
 * Orchestrates all task management functionality using the new decomposed
 * hook architecture. This replaces the monolithic TaskContainer with a
 * clean, modular component that leverages React Query and context.
 * 
 * Features:
 * - React Query integration with optimistic updates
 * - Comprehensive task filtering and sorting
 * - Bulk operations support
 * - Focus session management
 * - Type-safe validation
 * - Responsive design with accessibility
 */

import React, { useCallback } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Circle, 
  CircleAlert, 
  CircleDotDashed,
  Trash2,
  Edit3,
  MoreVertical,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TaskCard } from '@/domains/tasks/components/TaskCard';
import { TaskDetailModal } from './ui/task-detail-modal';
import { useTasks } from '.@/lib/stores/tasks/taskProviderCompat';
import { Task } from '@/domains/tasks/components/TaskCard';

/**
 * TaskManager component props
 */
interface TaskManagerProps {
  className?: string;
  showHeader?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showBulkActions?: boolean;
  showAddTask?: boolean;
  compactMode?: boolean;
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

/**
 * Main TaskManager component
 */
export const TaskManager: React.FC<TaskManagerProps> = ({
  className = '',
  showHeader = true,
  showSearch = true,
  showFilters = true,
  showBulkActions = true,
  showAddTask = true,
  compactMode = false,
  onStartFocusSession
}) => {
  const { 
    crud, 
    state, 
    validation, 
    utilities, 
    config 
  } = useTasks();

  // Destructure commonly used state
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    filters,
    sortOptions,
    selectedTasks,
    hasSelection,
    expandedTasks,
    expandedSubtasks,
    activeFocusSession,
    isModalOpen,
    selectedTask,
    stats
  } = state;

  // Destructure commonly used CRUD operations
  const {
    isLoading,
    isFetching,
    createTask,
    isCreating,
    isAnyOperationLoading
  } = crud;

  /**
   * TASK INTERACTION HANDLERS
   */
  
  // Handle task status toggle (cycles through statuses)
  const handleToggleTaskStatus = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const statuses = ['pending', 'in-progress', 'completed', 'need-help'];
      const currentIndex = statuses.indexOf(task.status);
      const newStatus = statuses[(currentIndex + 1) % statuses.length];
      
      crud.updateTask({ taskId, updates: { status: newStatus } });
    }
  }, [tasks, crud]);

  // Handle subtask status toggle
  const handleToggleSubtaskStatus = useCallback((taskId: string, subtaskId: string) => {
    utilities.toggleSubtaskCompletion(taskId, subtaskId);
  }, [utilities]);

  // Handle focus session start
  const handleStartFocusSession = useCallback((taskId: string, subtaskId?: string) => {
    utilities.startFocusSession(taskId, subtaskId);
    onStartFocusSession?.(taskId, 2); // Default intensity
  }, [utilities, onStartFocusSession]);

  // Handle task editing
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    crud.updateTask({ 
      taskId: updatedTask.id, 
      updates: updatedTask 
    });
  }, [crud]);

  // Handle task deletion
  const handleDeleteTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      utilities.deleteTaskWithConfirm(taskId, task.title);
    }
  }, [tasks, utilities]);

  /**
   * BULK OPERATIONS
   */
  
  const handleBulkAction = useCallback((action: 'complete' | 'delete' | 'archive') => {
    if (!hasSelection) return;

    switch (action) {
      case 'complete':
        utilities.completeSelectedTasks();
        break;
      case 'delete':
        utilities.deleteSelectedTasks();
        break;
      case 'archive':
        // This would be implemented when archive functionality is added
        
        break;
    }
  }, [hasSelection, utilities]);

  /**
   * NEW TASK CREATION
   */
  
  const handleCreateTask = useCallback(() => {
    const newTask = {
      title: 'New Task',
      description: config.features.validation.requireDescription ? 'Task description' : '',
      status: 'pending',
      priority: 'medium',
      level: 0,
      dependencies: [],
      subtasks: [],
      focusIntensity: config.type === 'deep-work' ? 2 : 1,
      context: 'general'
    };

    // Validate before creating
    if (utilities.canSaveTask(newTask)) {
      createTask(newTask);
    }
  }, [config, utilities, createTask]);

  /**
   * RENDER HELPERS
   */

  // Render loading state
  if (isLoading && tasks.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          <span className="text-lg">Loading {config.displayName} tasks...</span>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!isLoading && tasks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 text-center ${className}`}>
        <div className="text-gray-400">
          <Circle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No {config.displayName} Tasks</h3>
          <p className="text-sm mb-6 max-w-md">
            {config.description}
          </p>
          {showAddTask && (
            <Button onClick={handleCreateTask} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Animation variants (respect reduced motion preference)
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: prefersReducedMotion ? 0.1 : 0.3,
        staggerChildren: prefersReducedMotion ? 0 : 0.05
      }
    }
  };

  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: prefersReducedMotion 
        ? { duration: 0.2 }
        : { type: "spring", stiffness: 500, damping: 30 }
    }
  };

  return (
    <div className={`task-manager h-full ${className}`}>
      {/* Header Section */}
      {showHeader && (
        <div className="mb-6">
          {/* Title and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full mr-3 ${config.theme.primary}`}
                  style={{ backgroundColor: 'currentColor' }}
                />
                {config.displayName} Tasks
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {stats.total} total • {stats.completed} completed • {stats.completionRate}% done
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {isFetching && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current opacity-50" />
              )}
              
              {showAddTask && (
                <Button 
                  onClick={handleCreateTask} 
                  disabled={isCreating}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={`Search ${config.displayName.toLowerCase()} tasks...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Filter Button */}
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={state.toggleFilterPanel}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {stats.hasFiltersActive && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    Active
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && hasSelection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-muted rounded-lg border"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('complete')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={state.clearSelection}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Task List */}
      <LayoutGroup>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2" style={{ paddingBottom: '800px' }}
        >
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              variants={taskVariants}
              layout
            >
              <TaskCard
                task={task}
                isExpanded={state.isTaskExpanded(task.id)}
                expandedSubtasks={expandedSubtasks}
                activeFocusSession={activeFocusSession}
                theme={config.type}
                onToggleExpansion={state.toggleTaskExpansion}
                onToggleSubtaskExpansion={state.toggleSubtaskExpansion}
                onToggleTaskStatus={handleToggleTaskStatus}
                onToggleSubtaskStatus={handleToggleSubtaskStatus}
                onStartFocusSession={handleStartFocusSession}
                onTaskUpdate={handleTaskUpdate}
                onOpenTaskDetail={state.openTaskModal}
                prefersReducedMotion={prefersReducedMotion}
                
                // Additional props for enhanced functionality
                isSelected={state.isTaskSelected(task.id)}
                onToggleSelection={() => state.toggleTaskSelection(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
                showSelection={showBulkActions}
                compactMode={compactMode}
              />
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={state.closeTaskModal}
          onTaskUpdate={handleTaskUpdate}
          onStartFocusSession={(taskId) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              handleStartFocusSession(taskId);
            }
          }}
        />
      )}

      {/* Loading Overlay for Operations */}
      {isAnyOperationLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="bg-card p-4 rounded-lg shadow-lg border">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span>Updating tasks...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;