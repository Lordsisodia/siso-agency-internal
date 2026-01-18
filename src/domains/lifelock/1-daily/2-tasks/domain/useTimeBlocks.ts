/**
 * 🕐 useTimeBlocks Hook - OFFLINE-FIRST PWA VERSION
 *
 * Offline-first time block management using IndexedDB + Supabase
 * Works offline, syncs when online
 *
 * NO PRISMA - Browser-native only!
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import {
  TimeBlocksAPI,
  TimeBlock,
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
  TimeBlockConflict
} from '@/services/api/timeblocksApi.offline';

export interface UseTimeBlocksOptions {
  userId: string;
  selectedDate: Date;
  autoSave?: boolean;
  autoSaveDelay?: number;
  enableOptimisticUpdates?: boolean;
}

export interface TimeBlockState {
  timeBlocks: TimeBlock[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  conflicts: TimeBlockConflict[];
  lastUpdated: Date | null;
}

export interface TimeBlockActions {
  // CRUD operations
  createTimeBlock: (data: Omit<CreateTimeBlockInput, 'userId' | 'date'>) => Promise<boolean>;
  updateTimeBlock: (id: string, data: UpdateTimeBlockInput) => Promise<boolean>;
  deleteTimeBlock: (id: string) => Promise<boolean>;
  toggleCompletion: (id: string, actualTime?: { start?: string; end?: string }) => Promise<boolean>;
  
  // Conflict management
  checkConflicts: (startTime: string, endTime: string, excludeId?: string) => Promise<TimeBlockConflict[]>;
  resolveConflicts: (conflicts: TimeBlockConflict[]) => Promise<void>;
  
  // Utility functions
  refreshTimeBlocks: () => Promise<void>;
  clearError: () => void;
  getTimeBlockById: (id: string) => TimeBlock | undefined;
  getTimeBlocksInRange: (startTime: string, endTime: string) => TimeBlock[];
}

export function useTimeBlocks(options: UseTimeBlocksOptions): TimeBlockState & TimeBlockActions {
  const {
    userId,
    selectedDate,
    autoSave = true,
    autoSaveDelay = 500,
    enableOptimisticUpdates = true
  } = options;

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  // State
  const [state, setState] = useState<TimeBlockState>({
    timeBlocks: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    conflicts: [],
    lastUpdated: null
  });

  // Refs for optimistic updates and auto-save
  const optimisticUpdatesRef = useRef<Map<string, TimeBlock>>(new Map());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update state helper
  const updateState = useCallback((updates: Partial<TimeBlockState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load time blocks from API
  const loadTimeBlocks = useCallback(async () => {
    // Don't load if userId is not available yet
    if (!userId) {
      updateState({ isLoading: false, timeBlocks: [] });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const result = await TimeBlocksAPI.getTimeBlocks(userId, dateKey);

      if (result.success && result.data) {
        updateState({
          timeBlocks: result.data,
          isLoading: false,
          lastUpdated: new Date()
        });
      } else {
        updateState({
          isLoading: false,
          error: result.error || 'Failed to load time blocks'
        });
      }
    } catch (error) {
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unexpected error'
      });
    }
  }, [userId, dateKey, updateState]);

  // Auto-save mechanism
  const scheduleAutoSave = useCallback(() => {
    if (!autoSave) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Auto-save logic can be implemented here if needed
      
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay]);

  // Create time block
  const createTimeBlock = useCallback(async (
    data: Omit<CreateTimeBlockInput, 'userId' | 'date'>
  ): Promise<boolean> => {
    // Don't create if userId is not available yet
    if (!userId) {
      updateState({ error: 'User not authenticated' });
      return false;
    }

    updateState({ isCreating: true, error: null });

    const createData: CreateTimeBlockInput = {
      ...data,
      userId,
      date: dateKey
    };
    
    // Optimistic update
    if (enableOptimisticUpdates) {
      const optimisticBlock: TimeBlock = {
        id: `temp-${Date.now()}`,
        userId,
        date: dateKey,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data
      };
      
      optimisticUpdatesRef.current.set(optimisticBlock.id, optimisticBlock);
      updateState({
        timeBlocks: [...(Array.isArray(state.timeBlocks) ? state.timeBlocks : []), optimisticBlock]
      });
    }
    
    try {
      const result = await TimeBlocksAPI.createTimeBlock(createData);
      
      if (result.success && result.data) {
        // Remove optimistic update and add real data
        if (enableOptimisticUpdates) {
          const tempId = Array.from(optimisticUpdatesRef.current.keys())[0];
          optimisticUpdatesRef.current.delete(tempId);
          
          // Use setState callback to avoid stale closure
          setState(prev => {
            const filteredBlocks = (Array.isArray(prev.timeBlocks) ? prev.timeBlocks : [])
              .filter(block => {
                // Skip API response objects that got added incorrectly
                const hasSuccessProp = Object.prototype.hasOwnProperty.call(block, 'success');
                const hasDataProp = Object.prototype.hasOwnProperty.call(block, 'data');
                if (hasSuccessProp && hasDataProp) {
                  return false;
                }
                return block.id && !block.id.startsWith('temp-');
              });
            return {
              ...prev,
              timeBlocks: [...filteredBlocks, result.data],
              isCreating: false
            };
          });
        } else {
          await loadTimeBlocks();
        }
        
        scheduleAutoSave();
        return true;
      } else {
        // Handle conflicts
        if (result.conflicts && result.conflicts.length > 0) {
          updateState({
            isCreating: false,
            conflicts: result.conflicts,
            error: 'Time block conflicts detected'
          });
        } else {
          updateState({
            isCreating: false,
            error: result.error || 'Failed to create time block'
          });
        }
        
        // Remove optimistic update on failure
        if (enableOptimisticUpdates) {
          optimisticUpdatesRef.current.clear();
          updateState({
            timeBlocks: (Array.isArray(state.timeBlocks) ? state.timeBlocks : []).filter(block => !block.id.startsWith('temp-'))
          });
        }
        
        return false;
      }
    } catch (error) {
      updateState({
        isCreating: false,
        error: error instanceof Error ? error.message : 'Unexpected error'
      });
      
      // Remove optimistic update on error
      if (enableOptimisticUpdates) {
        optimisticUpdatesRef.current.clear();
        updateState({
          timeBlocks: (Array.isArray(state.timeBlocks) ? state.timeBlocks : []).filter(block => !block.id.startsWith('temp-'))
        });
      }
      
      return false;
    }
  }, [userId, dateKey, enableOptimisticUpdates, state.timeBlocks, updateState, loadTimeBlocks, scheduleAutoSave]);

  // Update time block
  const updateTimeBlock = useCallback(async (
    id: string,
    data: UpdateTimeBlockInput
  ): Promise<boolean> => {
    updateState({ isUpdating: true, error: null });
    
    // Optimistic update
    if (enableOptimisticUpdates) {
      updateState({
        timeBlocks: (Array.isArray(state.timeBlocks) ? state.timeBlocks : []).map(block =>
          block.id === id ? { ...block, ...data, updatedAt: new Date().toISOString() } : block
        )
      });
    }
    
    try {
      const result = await TimeBlocksAPI.updateTimeBlock(id, {
        ...data,
        userId,
        date: dateKey
      });
      
      if (result.success) {
        if (!enableOptimisticUpdates) {
          await loadTimeBlocks();
        }
        updateState({ isUpdating: false });
        scheduleAutoSave();
        return true;
      } else {
        // Handle conflicts
        if (result.conflicts && result.conflicts.length > 0) {
          updateState({
            isUpdating: false,
            conflicts: result.conflicts,
            error: 'Time block conflicts detected'
          });
        } else {
          updateState({
            isUpdating: false,
            error: result.error || 'Failed to update time block'
          });
        }
        
        // Revert optimistic update on failure
        if (enableOptimisticUpdates) {
          await loadTimeBlocks();
        }
        
        return false;
      }
    } catch (error) {
      updateState({
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Unexpected error'
      });
      
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        await loadTimeBlocks();
      }
      
      return false;
    }
  }, [enableOptimisticUpdates, state.timeBlocks, updateState, loadTimeBlocks, scheduleAutoSave, userId, dateKey]);

  // Delete time block
  const deleteTimeBlock = useCallback(async (id: string): Promise<boolean> => {
    updateState({ isDeleting: true, error: null });
    
    // Store original for potential rollback
    const originalBlocks = Array.isArray(state.timeBlocks) ? state.timeBlocks : [];
    
    // Optimistic update
    if (enableOptimisticUpdates) {
      updateState({
        timeBlocks: originalBlocks.filter(block => block.id !== id)
      });
    }
    
    try {
      const result = await TimeBlocksAPI.deleteTimeBlock(id);
      
      if (result.success) {
        if (!enableOptimisticUpdates) {
          await loadTimeBlocks();
        }
        updateState({ isDeleting: false });
        scheduleAutoSave();
        return true;
      } else {
        updateState({
          isDeleting: false,
          error: result.error || 'Failed to delete time block'
        });
        
        // Revert optimistic update on failure
        if (enableOptimisticUpdates) {
          updateState({ timeBlocks: originalBlocks });
        }
        
        return false;
      }
    } catch (error) {
      updateState({
        isDeleting: false,
        error: error instanceof Error ? error.message : 'Unexpected error'
      });
      
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        updateState({ timeBlocks: originalBlocks });
      }
      
      return false;
    }
  }, [enableOptimisticUpdates, state.timeBlocks, updateState, loadTimeBlocks, scheduleAutoSave]);

  // Toggle completion
  const toggleCompletion = useCallback(async (
    id: string,
    actualTime?: { start?: string; end?: string }
  ): Promise<boolean> => {
    const timeBlock = (Array.isArray(state.timeBlocks) ? state.timeBlocks : []).find(block => block.id === id);
    if (!timeBlock) return false;
    
    const updateData: UpdateTimeBlockInput = {
      completed: !timeBlock.completed,
      actualStart: actualTime?.start,
      actualEnd: actualTime?.end,
      userId,
      date: dateKey
    };
    
    return await updateTimeBlock(id, updateData);
  }, [state.timeBlocks, updateTimeBlock, userId, dateKey]);

  // Check conflicts
  const checkConflicts = useCallback(async (
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<TimeBlockConflict[]> => {
    // Don't check conflicts if userId is not available yet
    if (!userId) return [];

    try {
      const result = await TimeBlocksAPI.checkConflicts(
        userId,
        dateKey,
        startTime,
        endTime,
        excludeId
      );

      if (result.success && result.data) {
        return result.data.conflicts;
      }

      return [];
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      return [];
    }
  }, [userId, dateKey]);

  // Resolve conflicts (placeholder for now)
  const resolveConflicts = useCallback(async (conflicts: TimeBlockConflict[]): Promise<void> => {
    // This would implement conflict resolution strategies
    // For now, just clear the conflicts
    updateState({ conflicts: [] });
  }, [updateState]);

  // Utility functions
  const refreshTimeBlocks = useCallback(async () => {
    await loadTimeBlocks();
  }, [loadTimeBlocks]);

  const clearError = useCallback(() => {
    updateState({ error: null, conflicts: [] });
  }, [updateState]);

  const getTimeBlockById = useCallback((id: string): TimeBlock | undefined => {
    return (Array.isArray(state.timeBlocks) ? state.timeBlocks : []).find(block => block.id === id);
  }, [state.timeBlocks]);

  const getTimeBlocksInRange = useCallback((
    startTime: string,
    endTime: string
  ): TimeBlock[] => {
    return (Array.isArray(state.timeBlocks) ? state.timeBlocks : []).filter(block =>
      (block.startTime >= startTime && block.startTime < endTime) ||
      (block.endTime > startTime && block.endTime <= endTime) ||
      (block.startTime <= startTime && block.endTime >= endTime)
    );
  }, [state.timeBlocks]);

  // Load time blocks on mount and date change
  useEffect(() => {
    loadTimeBlocks();
  }, [loadTimeBlocks]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    toggleCompletion,
    checkConflicts,
    resolveConflicts,
    refreshTimeBlocks,
    clearError,
    getTimeBlockById,
    getTimeBlocksInRange
  };
}
