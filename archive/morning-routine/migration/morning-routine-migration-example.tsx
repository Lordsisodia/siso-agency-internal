/**
 * Morning Routine Migration Example
 * 
 * This file demonstrates how to safely migrate the MorningRoutineSection
 * component to use refactored data and utilities while maintaining
 * backward compatibility through feature flags.
 * 
 * USAGE:
 * 1. Copy the pattern below into your existing MorningRoutineSection.tsx
 * 2. Enable feature flags one by one to test refactored code
 * 3. Once stable, remove old code and feature flag checks
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Feature flag imports
import { 
  isFeatureEnabled, 
  useImplementation 
} from './feature-flags';

// Refactored utilities (conditionally imported)
import { getMorningHabits } from '../refactored/data/morning-routine-defaults';
import { calculateMorningRoutineProgress } from '../refactored/utils/morning-routine-progress';
import { MorningRoutineData, MorningHabit } from '../refactored/types/morning-routine.types';

// Example of how to modify existing component
export function ExampleMigrationPattern() {
  
  // OLD vs NEW habit data
  const OLD_MORNING_HABITS = [
    // ... original hardcoded array from component
  ];
  
  const morningHabits = useImplementation(
    'useRefactoredDefaultTasks',
    getMorningHabits(), // NEW: from extracted data file
    OLD_MORNING_HABITS  // OLD: hardcoded in component
  );

  // Example of progress calculation migration
  const calculateProgress = (routineData: MorningRoutineData | null) => {
    if (isFeatureEnabled('useRefactoredProgressCalculator')) {
      // NEW: use extracted utility function
      return calculateMorningRoutineProgress(routineData, morningHabits);
    } else {
      // OLD: inline calculation logic
      // ... original progress calculation code
      return { completed: 0, total: morningHabits.length, percentage: 0 };
    }
  };

  return (
    <div>
      {/* Component renders exactly the same, but uses refactored utilities */}
      <p>Using {isFeatureEnabled('useRefactoredDefaultTasks') ? 'NEW' : 'OLD'} task data</p>
      <p>Using {isFeatureEnabled('useRefactoredProgressCalculator') ? 'NEW' : 'OLD'} progress calculation</p>
    </div>
  );
}

/**
 * Complete migration pattern for MorningRoutineSection.tsx
 * 
 * Replace the hardcoded MORNING_HABITS array with:
 */
export const MIGRATION_PATTERN = `
// At the top of MorningRoutineSection.tsx, add feature flag imports:
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';
import { getMorningHabits } from '@/refactored/data/morning-routine-defaults';
import { calculateMorningRoutineProgress } from '@/refactored/utils/morning-routine-progress';

// Replace the hardcoded MORNING_HABITS array with:
const MORNING_HABITS = useImplementation(
  'useRefactoredDefaultTasks',
  getMorningHabits(), // NEW: extracted data
  [
    // OLD: existing hardcoded array
    {
      key: 'drinkWater' as const,
      label: 'Drink Water',
      // ... rest of original array
    }
  ]
);

// Replace inline progress calculation with:
const progress = useImplementation(
  'useRefactoredProgressCalculator',
  calculateMorningRoutineProgress(morningRoutine, MORNING_HABITS), // NEW
  // OLD: original inline calculation
  (() => {
    if (!morningRoutine) return { completed: 0, total: MORNING_HABITS.length, percentage: 0 };
    // ... original calculation logic
  })()
);
`;

/**
 * Testing checklist for migration:
 * 
 * 1. ✅ Verify original component still works (all flags false)
 * 2. ✅ Enable useRefactoredDefaultTasks - check tasks display correctly
 * 3. ✅ Enable useRefactoredProgressCalculator - check progress calculation
 * 4. ✅ Test with both flags enabled - full refactored experience
 * 5. ✅ Verify no visual or functional differences
 * 6. ✅ Check performance (should be same or better)
 * 7. ✅ Remove old code once stable
 */