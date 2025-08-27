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
import { useTaskData, TaskCard } from './useTaskData';
import { useTaskActions } from './useTaskActions';
import { useVoiceProcessing } from './useVoiceProcessing';
import { useTaskOrganization } from './useTaskOrganization';
import { useServiceInitialization } from './useServiceInitialization';

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
  handleTaskToggle: (taskId: string) => Promise<void>;
  handleCustomTaskAdd: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => Promise<void>;
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
    handleTaskToggle,
    handleCustomTaskAdd,
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