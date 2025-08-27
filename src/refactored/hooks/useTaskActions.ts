/**
 * useTaskActions Hook - Task Action Management
 * 
 * Extracted from useLifeLockData.ts (lines 140-156, ~17 lines)
 * Focused responsibility: Task CRUD operations and actions
 * 
 * Benefits:
 * - Single responsibility: Only handles task actions (toggle, add, delete)
 * - Better performance: UI updates only when actions complete
 * - Easier testing: Pure action logic can be unit tested
 * - Reusability: Any component can use task actions independently
 */

import { useState, useCallback } from 'react';
import { personalTaskService } from '@/ai-first/core/task.service';

export interface UseTaskActionsReturn {
  // Actions
  handleTaskToggle: (taskId: string) => Promise<void>;
  handleTaskAdd: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => Promise<void>;
  handleTaskDelete: (taskId: string) => Promise<void>;
  handleTaskUpdate: (taskId: string, updates: { title?: string; priority?: string }) => Promise<void>;
  
  // Loading states for actions
  isTogglingTask: boolean;
  isAddingTask: boolean;
  isDeletingTask: boolean;
  isUpdatingTask: boolean;
  
  // Error states
  actionError: string | null;
  
  // Success feedback
  lastAction: string | null;
  clearLastAction: () => void;
}

/**
 * Custom hook for task actions
 * Handles all task CRUD operations with loading states and error handling
 */
export const useTaskActions = (selectedDate: Date, onTaskChange?: () => void): UseTaskActionsReturn => {
  // Loading states for individual actions
  const [isTogglingTask, setIsTogglingTask] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  
  // Error and success states
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Clear error helper
  const clearError = () => setActionError(null);

  // Clear last action
  const clearLastAction = useCallback(() => {
    setLastAction(null);
  }, []);

  // Handle task toggle
  const handleTaskToggle = useCallback(async (taskId: string) => {
    setIsTogglingTask(true);
    clearError();
    
    try {
      await personalTaskService.toggleTask(taskId);
      setLastAction(`Task toggled successfully`);
      onTaskChange?.(); // Trigger refresh in parent
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to toggle task');
    } finally {
      setIsTogglingTask(false);
    }
  }, [onTaskChange]);

  // Handle custom task add
  const handleTaskAdd = useCallback(async (task: { title: string; priority: 'low' | 'medium' | 'high' }) => {
    setIsAddingTask(true);
    clearError();
    
    try {
      await personalTaskService.addTask(task.title, selectedDate, task.priority);
      setLastAction(`Task "${task.title}" added successfully`);
      onTaskChange?.(); // Trigger refresh in parent
    } catch (error) {
      console.error('Failed to add task:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to add task');
    } finally {
      setIsAddingTask(false);
    }
  }, [selectedDate, onTaskChange]);

  // Handle task delete
  const handleTaskDelete = useCallback(async (taskId: string) => {
    setIsDeletingTask(true);
    clearError();
    
    try {
      await personalTaskService.deleteTask(taskId);
      setLastAction('Task deleted successfully');
      onTaskChange?.(); // Trigger refresh in parent
    } catch (error) {
      console.error('Failed to delete task:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsDeletingTask(false);
    }
  }, [onTaskChange]);

  // Handle task update
  const handleTaskUpdate = useCallback(async (taskId: string, updates: { title?: string; priority?: string }) => {
    setIsUpdatingTask(true);
    clearError();
    
    try {
      await personalTaskService.updateTask(taskId, updates);
      setLastAction('Task updated successfully');
      onTaskChange?.(); // Trigger refresh in parent
    } catch (error) {
      console.error('Failed to update task:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setIsUpdatingTask(false);
    }
  }, [onTaskChange]);

  return {
    // Actions
    handleTaskToggle,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskUpdate,
    
    // Loading states
    isTogglingTask,
    isAddingTask,
    isDeletingTask,
    isUpdatingTask,
    
    // Error state
    actionError,
    
    // Success feedback
    lastAction,
    clearLastAction,
  };
};