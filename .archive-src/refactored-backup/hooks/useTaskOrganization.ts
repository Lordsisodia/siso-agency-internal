/**
 * useTaskOrganization Hook - Task Organization & Eisenhower Matrix
 * 
 * Extracted from useLifeLockData.ts (lines 171-196, ~26 lines)
 * Focused responsibility: Task organization and Eisenhower matrix management
 * 
 * Benefits:
 * - Single responsibility: Only handles task organization
 * - Better performance: Components not using organization won't re-render
 * - Easier testing: Organization logic can be tested independently
 * - Reusability: Organization features can be used across different views
 */

import { useState, useCallback } from 'react';
import { eisenhowerMatrixOrganizer, EisenhowerMatrixResult } from '@/services/core/task.service';
import { TaskCard } from './useTaskData';

export interface UseTaskOrganizationReturn {
  // Organization actions
  handleOrganizeTasks: (tasks: TaskCard['tasks']) => Promise<void>;
  handleApplyOrganization: () => void;
  handleReanalyze: (tasks: TaskCard['tasks']) => Promise<void>;
  
  // State
  isAnalyzingTasks: boolean;
  eisenhowerResult: EisenhowerMatrixResult | null;
  showEisenhowerModal: boolean;
  
  // Modal control
  setShowEisenhowerModal: (show: boolean) => void;
  clearEisenhowerResult: () => void;
  
  // Error handling
  organizationError: string | null;
  clearOrganizationError: () => void;
}

/**
 * Custom hook for task organization using Eisenhower Matrix
 * Handles task analysis, organization, and matrix modal management
 */
export const useTaskOrganization = (onTaskChange?: () => void): UseTaskOrganizationReturn => {
  // State
  const [isAnalyzingTasks, setIsAnalyzingTasks] = useState(false);
  const [eisenhowerResult, setEisenhowerResult] = useState<EisenhowerMatrixResult | null>(null);
  const [showEisenhowerModal, setShowEisenhowerModal] = useState(false);
  const [organizationError, setOrganizationError] = useState<string | null>(null);

  // Clear organization error
  const clearOrganizationError = useCallback(() => {
    setOrganizationError(null);
  }, []);

  // Clear eisenhower result
  const clearEisenhowerResult = useCallback(() => {
    setEisenhowerResult(null);
  }, []);

  // Handle task organization
  const handleOrganizeTasks = useCallback(async (tasks: TaskCard['tasks']) => {
    if (!tasks || tasks.length === 0) {
      setOrganizationError('No tasks available to organize');
      return;
    }
    
    setIsAnalyzingTasks(true);
    setOrganizationError(null);
    
    try {
      console.log('🧠 Organizing tasks using Eisenhower Matrix...');
      
      const result = await eisenhowerMatrixOrganizer.organizeTasks(tasks);
      
      setEisenhowerResult(result);
      setShowEisenhowerModal(true);
      
      console.log('✅ Task organization completed');
    } catch (error) {
      console.error('❌ Task organization failed:', error);
      setOrganizationError(error instanceof Error ? error.message : 'Task organization failed');
    } finally {
      setIsAnalyzingTasks(false);
    }
  }, []);

  // Handle applying organization results
  const handleApplyOrganization = useCallback(() => {
    console.log('📋 Applying task organization...');
    
    setShowEisenhowerModal(false);
    setEisenhowerResult(null);
    
    // Trigger refresh in parent component to reflect changes
    onTaskChange?.();
    
    console.log('✅ Task organization applied');
  }, [onTaskChange]);

  // Handle reanalyzing tasks
  const handleReanalyze = useCallback(async (tasks: TaskCard['tasks']) => {
    console.log('🔄 Reanalyzing tasks...');
    
    setShowEisenhowerModal(false);
    setEisenhowerResult(null);
    
    // Re-run the organization process
    await handleOrganizeTasks(tasks);
  }, [handleOrganizeTasks]);

  return {
    // Organization actions
    handleOrganizeTasks,
    handleApplyOrganization,
    handleReanalyze,
    
    // State
    isAnalyzingTasks,
    eisenhowerResult,
    showEisenhowerModal,
    
    // Modal control
    setShowEisenhowerModal,
    clearEisenhowerResult,
    
    // Error handling
    organizationError,
    clearOrganizationError,
  };
};