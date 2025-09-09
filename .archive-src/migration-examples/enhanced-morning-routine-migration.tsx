/**
 * Enhanced Morning Routine Migration Example
 * 
 * Updated to demonstrate how to migrate the enhanced MorningRoutineSection
 * component to use the refactored data and utilities while maintaining
 * backward compatibility through feature flags.
 * 
 * This shows migration from the comprehensive 119-line task structure
 * to extracted, reusable utilities.
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Feature flag imports
import { 
  isFeatureEnabled, 
  useImplementation 
} from './feature-flags';

// Enhanced refactored utilities
import { getMorningRoutineTasks } from '../refactored/data/morning-routine-defaults';
import { 
  calculateMorningRoutineProgress,
  getTaskCompletionStatus,
  getTotalEstimatedTime
} from '../refactored/utils/morning-routine-progress';
import { MorningRoutineData, MorningTask } from '../refactored/types/morning-routine.types';

/**
 * Example of migrating the enhanced task structure
 */
export function EnhancedMigrationExample() {
  
  // OLD vs NEW task data (119 lines → external file)
  const OLD_MORNING_ROUTINE_TASKS = [
    // ... original 119-line hardcoded array from component
    {
      key: 'wakeUp' as const,
      title: 'Wake Up',
      description: 'Start the day before midday to maximize productivity. Track your wake-up time.',
      timeEstimate: '5 min',
      icon: 'Sun', // Would be actual Sun component
      hasTimeTracking: true,
      subtasks: []
    },
    // ... rest of tasks
  ];
  
  // Feature-flagged data source
  const morningTasks = useImplementation(
    'useRefactoredDefaultTasks',
    getMorningRoutineTasks(),     // NEW: from extracted data file (119 lines saved)
    OLD_MORNING_ROUTINE_TASKS     // OLD: hardcoded in component
  );

  // Example state (would come from actual component)
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineData | null>(null);

  // OLD vs NEW progress calculation
  const getRoutineProgress = () => {
    if (isFeatureEnabled('useRefactoredProgressCalculator')) {
      // NEW: use extracted utility function with subtask support
      return calculateMorningRoutineProgress(morningRoutine, morningTasks).percentage;
    } else {
      // OLD: inline calculation logic (lines 182-204 in component)
      if (!morningRoutine) return 0;
      let totalItems = 0;
      let completedItems = 0;
      
      morningTasks.forEach(task => {
        if (task.subtasks.length > 0) {
          totalItems += task.subtasks.length;
          task.subtasks.forEach(subtask => {
            if (morningRoutine[subtask.key]) completedItems++;
          });
        } else {
          totalItems += 1;
          if (morningRoutine[task.key]) completedItems++;
        }
      });
      
      return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    }
  };

  // NEW utility functions available with feature flags
  const totalEstimatedTime = isFeatureEnabled('useRefactoredDefaultTasks') 
    ? getTotalEstimatedTime() 
    : 57; // Old hardcoded calculation

  const getTaskCompletion = (task: MorningTask) => {
    if (isFeatureEnabled('useRefactoredProgressCalculator')) {
      return getTaskCompletionStatus(morningRoutine, task);
    } else {
      // Old inline logic for task completion
      const completedSubtasks = task.subtasks.filter(subtask => 
        morningRoutine?.[subtask.key]
      ).length;
      return {
        completed: completedSubtasks,
        total: task.subtasks.length || 1,
        isFullyCompleted: task.subtasks.length > 0 
          ? completedSubtasks === task.subtasks.length
          : morningRoutine?.[task.key] || false
      };
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Enhanced Migration Example</h2>
      
      <div className="space-y-4">
        {/* Data Source Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold">Task Data Source:</h3>
          <p>{isFeatureEnabled('useRefactoredDefaultTasks') 
            ? '✅ Using extracted task configuration (119 lines saved)' 
            : '❌ Using hardcoded tasks in component'}</p>
          <p className="text-sm text-gray-600">
            Total estimated time: {totalEstimatedTime} minutes
          </p>
        </div>

        {/* Progress Calculation Info */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold">Progress Calculation:</h3>
          <p>{isFeatureEnabled('useRefactoredProgressCalculator')
            ? '✅ Using extracted progress utilities with subtask support'
            : '❌ Using inline progress calculation'}</p>
          <p className="text-sm text-gray-600">
            Current progress: {getRoutineProgress().toFixed(1)}%
          </p>
        </div>

        {/* Task List Preview */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold">Task Configuration:</h3>
          <p className="text-sm text-gray-600 mb-2">
            {morningTasks.length} tasks with {morningTasks.reduce((sum, task) => sum + task.subtasks.length, 0)} subtasks
          </p>
          <div className="space-y-1 text-sm">
            {morningTasks.map(task => {
              const completion = getTaskCompletion(task);
              return (
                <div key={task.key} className="flex justify-between items-center">
                  <span>{task.title} ({task.timeEstimate})</span>
                  <span className={completion.isFullyCompleted ? 'text-green-600' : 'text-gray-500'}>
                    {completion.completed}/{completion.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Migration Steps for Enhanced MorningRoutineSection.tsx:
 * 
 * 1. Add feature flag imports at the top of the file:
 * ```typescript
 * import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
 * import { getMorningRoutineTasks } from '@/refactored/data/morning-routine-defaults';
 * import { calculateMorningRoutineProgress } from '@/refactored/utils/morning-routine-progress';
 * ```
 * 
 * 2. Replace the MORNING_ROUTINE_TASKS array (lines 47-119):
 * ```typescript
 * const MORNING_ROUTINE_TASKS = useImplementation(
 *   'useRefactoredDefaultTasks',
 *   getMorningRoutineTasks(), // NEW: extracted data
 *   // OLD: keep existing 119-line array as fallback
 *   [original array here...]
 * );
 * ```
 * 
 * 3. Replace the getRoutineProgress function (lines 182-202):
 * ```typescript
 * const getRoutineProgress = () => {
 *   return useImplementation(
 *     'useRefactoredProgressCalculator',
 *     () => calculateMorningRoutineProgress(morningRoutine, MORNING_ROUTINE_TASKS).percentage,
 *     () => {
 *       // OLD: original inline calculation
 *       // ... keep existing logic as fallback
 *     }
 *   )();
 * };
 * ```
 * 
 * 4. Test migration with feature flags:
 * - Enable useRefactoredDefaultTasks: true
 * - Enable useRefactoredProgressCalculator: true
 * - Verify identical functionality and visual appearance
 * 
 * 5. Benefits achieved:
 * - ✅ 119 lines of task data extracted to external file
 * - ✅ 21 lines of progress logic extracted to reusable utility
 * - ✅ Enhanced type safety with comprehensive interfaces
 * - ✅ Easy A/B testing of different task configurations
 * - ✅ Testable pure functions for progress calculation
 * - ✅ Foundation for future performance optimizations
 */