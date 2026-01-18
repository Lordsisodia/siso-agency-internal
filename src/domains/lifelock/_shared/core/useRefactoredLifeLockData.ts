/**
 * useRefactoredLifeLockData Hook - Refactored Master Hook
 * 
 * Replaces the monolithic useLifeLockData.ts (226 lines → focused hooks)
 * Combines all split hooks with same interface for easy migration
 * 
 * Benefits:
 * - Performance: Components only re-render when relevant data changes
 * - Maintainability: Each concern is separated and testable
 * - Reusability: Individual hooks can be used independently
 * - Type safety: Better interfaces for each responsibility
 * - Error handling: Granular error states for each concern
 */

import { useMemo } from 'react';
import { useTaskData, TaskCard } from '@/domains/lifelock/_shared/tasks/hooks/useTaskData';
import { useTaskActions } from '@/domains/lifelock/_shared/tasks/hooks/useTaskActions';
import { useVoiceProcessing } from '@/lib/hooks/performance/useVoiceProcessing';
import { useTaskOrganization } from '@/domains/lifelock/_shared/tasks/hooks/useTaskOrganization';
import { useServiceInitialization } from '@/domains/lifelock/_shared/hooks/useServiceInitialization';

// Re-export types for compatibility
export type { TaskCard };

export interface UseRefactoredLifeLockDataReturn {
  // Data (from useTaskData)
  todayCard: TaskCard | null;
  weekCards: TaskCard[];
  weekStart: Date;
  
  // Loading states (granular)
  isLoadingToday: boolean;
  isLoadingWeek: boolean;
  isProcessingVoice: boolean;
  isAnalyzingTasks: boolean;
  isTogglingTask: boolean;
  isAddingTask: boolean;
  
  // Service initialization
  isInitializingServices: boolean;
  isServicesInitialized: boolean;
  
  // Results and data
  lastThoughtDumpResult: any;
  eisenhowerResult: any;
  showEisenhowerModal: boolean;
  
  // Actions (combined from all hooks)
  handleTaskToggle: (taskOrTaskId: string | { id: string; workType: 'LIGHT' | 'DEEP'; completed: boolean }) => Promise<void>;
  handleCustomTaskAdd: (task: { title: string; priority: 'low' | 'medium' | 'high'; workType?: 'LIGHT' | 'DEEP' }) => Promise<void>;
  handleVoiceCommand: (command: string) => Promise<void>;
  handleOrganizeTasks: () => Promise<void>;
  handleApplyOrganization: () => void;
  handleReanalyze: () => Promise<void>;
  refresh: () => void;
  
  // State setters (for compatibility)
  setLastThoughtDumpResult: (result: any) => void;
  setShowEisenhowerModal: (show: boolean) => void;
  setEisenhowerResult: (result: any) => void;
  
  // Enhanced error handling
  errors: {
    todayError: string | null;
    weekError: string | null;
    actionError: string | null;
    voiceError: string | null;
    organizationError: string | null;
    initializationError: string | null;
  };
  
  // Enhanced success feedback
  feedback: {
    lastAction: string | null;
    clearLastAction: () => void;
  };
}

/**
 * Refactored LifeLock data hook using composition pattern
 * Combines focused hooks while maintaining the same interface
 */
export const useRefactoredLifeLockData = (selectedDate: Date): UseRefactoredLifeLockDataReturn => {
  // Initialize services first
  const {
    isInitializing: isInitializingServices,
    isInitialized: isServicesInitialized,
    initializationError
  } = useServiceInitialization();

  // Task data management (pure data loading)
  const {
    todayCard,
    weekCards,
    weekStart,
    isLoadingToday,
    isLoadingWeek,
    refresh,
    todayError,
    weekError
  } = useTaskData(selectedDate);

  // Task actions (CRUD operations)
  const {
    handleTaskToggle,
    handleTaskAdd: handleCustomTaskAdd,
    isTogglingTask,
    isAddingTask,
    actionError,
    lastAction,
    clearLastAction
  } = useTaskActions(selectedDate, refresh);

  // Voice processing
  const {
    handleVoiceCommand,
    isProcessingVoice,
    lastThoughtDumpResult,
    clearThoughtDumpResult,
    voiceError
  } = useVoiceProcessing(selectedDate, refresh);

  // Task organization
  const {
    handleOrganizeTasks: organizeTasksAction,
    handleApplyOrganization,
    handleReanalyze: reanalyzeAction,
    isAnalyzingTasks,
    eisenhowerResult,
    showEisenhowerModal,
    setShowEisenhowerModal,
    clearEisenhowerResult,
    organizationError
  } = useTaskOrganization(refresh);

  // Wrapper functions to maintain original interface
  const handleOrganizeTasks = async () => {
    if (todayCard && todayCard.tasks.length > 0) {
      await organizeTasksAction(todayCard.tasks);
    }
  };

  const handleReanalyze = async () => {
    if (todayCard && todayCard.tasks.length > 0) {
      await reanalyzeAction(todayCard.tasks);
    }
  };

  // Task toggle wrapper - supports both legacy (taskId) and new (task object) interfaces
  const wrappedHandleTaskToggle = async (taskOrTaskId: string | { id: string; workType: 'LIGHT' | 'DEEP'; completed: boolean }) => {
    if (typeof taskOrTaskId === 'string') {
      // Legacy mode: find task by ID and construct task object
      const taskId = taskOrTaskId;
      let foundTask = null;
      
      // Search in todayCard tasks
      if (todayCard && todayCard.tasks) {
        foundTask = todayCard.tasks.find(task => task.id === taskId);
      }
      
      if (!foundTask) {
        // Search in weekCards tasks if not found in today
        for (const card of weekCards) {
          if (card.tasks) {
            foundTask = card.tasks.find(task => task.id === taskId);
            if (foundTask) break;
          }
        }
      }
      
      if (foundTask && 'workType' in foundTask) {
        // Call with task object that has workType
        await handleTaskToggle(foundTask as { id: string; workType: 'LIGHT' | 'DEEP'; completed: boolean });
      } else {
        console.warn('Task not found or missing workType:', taskId);
        // Fallback - assume LIGHT work
        await handleTaskToggle({ id: taskId, workType: 'LIGHT', completed: false });
      }
    } else {
      // New mode: task object provided directly
      await handleTaskToggle(taskOrTaskId);
    }
  };

  // Custom task add wrapper - defaults to LIGHT work if workType not specified
  const wrappedHandleCustomTaskAdd = async (task: { title: string; priority: 'low' | 'medium' | 'high'; workType?: 'LIGHT' | 'DEEP' }) => {
    const taskWithWorkType = { ...task, workType: task.workType || 'LIGHT' as 'LIGHT' | 'DEEP' };
    await handleCustomTaskAdd(taskWithWorkType);
  };

  // Compatibility setters
  const setLastThoughtDumpResult = (result: any) => {
    if (result === null) {
      clearThoughtDumpResult();
    }
    // Note: The new architecture doesn't allow setting arbitrary results
    // This is by design for better state management
  };

  const setEisenhowerResult = (result: any) => {
    if (result === null) {
      clearEisenhowerResult();
    }
    // Note: Results are managed internally by the organization hook
  };

  // Combine all errors for easy access
  const errors = useMemo(() => ({
    todayError,
    weekError,
    actionError,
    voiceError,
    organizationError,
    initializationError
  }), [todayError, weekError, actionError, voiceError, organizationError, initializationError]);

  // Feedback system
  const feedback = useMemo(() => ({
    lastAction,
    clearLastAction
  }), [lastAction, clearLastAction]);

  return {
    // Data
    todayCard,
    weekCards,
    weekStart,
    
    // Loading states (more granular than original)
    isLoadingToday,
    isLoadingWeek,
    isProcessingVoice,
    isAnalyzingTasks,
    isTogglingTask,
    isAddingTask,
    
    // Service initialization
    isInitializingServices,
    isServicesInitialized,
    
    // Results
    lastThoughtDumpResult,
    eisenhowerResult,
    showEisenhowerModal,
    
    // Actions (same interface as original)
    handleTaskToggle: wrappedHandleTaskToggle,
    handleCustomTaskAdd: wrappedHandleCustomTaskAdd,
    handleVoiceCommand,
    handleOrganizeTasks,
    handleApplyOrganization,
    handleReanalyze,
    refresh,
    
    // State setters (for compatibility)
    setLastThoughtDumpResult,
    setShowEisenhowerModal,
    setEisenhowerResult,
    
    // Enhanced error handling
    errors,
    
    // Enhanced feedback
    feedback
  };
};
