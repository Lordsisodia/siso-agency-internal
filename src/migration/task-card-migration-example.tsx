/**
 * TaskCard Migration Examples - Complete Guide
 * 
 * This file demonstrates how to migrate from the old task card implementations
 * (5,100+ lines of duplicated code) to the new UnifiedTaskCard component.
 * 
 * Benefits of Migration:
 * - 5,100+ lines → ~200 lines reusable component
 * - Consistent UI across all sections
 * - Theme variants for different contexts
 * - Better accessibility and performance
 * - Centralized utility functions
 */

import React from 'react';
import { UnifiedTaskCard, TaskCardTask } from '@/features/tasks/components/UnifiedTaskCard';
import { 
  calculateTaskProgress, 
  getTaskTheme, 
  sortTasks, 
  filterTasks,
  taskBatchOperations 
} from '@/features/tasks/utils/taskCardUtils';
import { isFeatureEnabled, useImplementation } from '@/migration/feature-flags';

// ============================================================================
// MIGRATION EXAMPLE 1: Morning Routine Tasks
// ============================================================================

// BEFORE: Custom morning routine card (from MorningRoutineSection.tsx)
const OldMorningTaskCard = ({ task, onToggle }) => {
  return (
    <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-4 
                    hover:bg-yellow-900/15 hover:border-yellow-600/40 transition-all">
      <div className="flex items-center space-x-3">
        <input 
          type="checkbox" 
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="border-yellow-600 checked:bg-yellow-600"
        />
        <span className={task.completed ? 'line-through text-gray-500' : 'text-yellow-400'}>
          {task.title}
        </span>
      </div>
      
      {/* Custom progress logic - duplicated across components */}
      {task.subtasks && (
        <div className="mt-2 ml-6">
          <div className="text-xs text-yellow-300">
            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} complete
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div 
              className="h-1 bg-yellow-500 rounded-full"
              style={{ 
                width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// AFTER: Using UnifiedTaskCard with morning theme
const NewMorningTaskCard = ({ task, onToggle }) => {
  return (
    <UnifiedTaskCard
      task={task}
      theme="morning"        // Automatic yellow/orange styling
      variant="standard"
      onTaskToggle={onToggle}
      showProgress={true}
      animateCompletion={true}
    />
  );
};

// ============================================================================
// MIGRATION EXAMPLE 2: Work/Deep Focus Tasks  
// ============================================================================

// BEFORE: Custom work task card with manual styling
const OldWorkTaskCard = ({ task, onToggle, onSubtaskToggle }) => {
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  
  return (
    <div className="bg-purple-900/10 border border-purple-700/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
          <div>
            <h3 className="text-purple-400 font-medium">{task.title}</h3>
            {task.priority && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                {task.priority}
              </span>
            )}
          </div>
        </div>
        
        {totalSubtasks > 0 && (
          <div className="text-xs text-purple-300">
            {completedSubtasks}/{totalSubtasks}
          </div>
        )}
      </div>
      
      {/* Manual subtask rendering - more duplication */}
      {task.subtasks && (
        <div className="mt-3 ml-6 space-y-2">
          {task.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={subtask.completed}
                onChange={() => onSubtaskToggle(task.id, subtask.id)}
              />
              <span className={subtask.completed ? 'line-through text-gray-500' : 'text-purple-300'}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// AFTER: Using UnifiedTaskCard with work theme
const NewWorkTaskCard = ({ task, onToggle, onSubtaskToggle }) => {
  return (
    <UnifiedTaskCard
      task={task}
      theme="work"           // Automatic purple/blue styling
      variant="collapsible"  // Expandable for detailed tasks
      onTaskToggle={onToggle}
      onSubtaskToggle={onSubtaskToggle}
      showProgress={true}
      showSubtasks={true}
    />
  );
};

// ============================================================================
// MIGRATION EXAMPLE 3: Wellness/Health Tasks
// ============================================================================

// BEFORE: Custom wellness card (from various health sections)
const OldWellnessCard = ({ task, onToggle }) => {
  return (
    <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3
                    hover:bg-green-900/15 transition-all">
      <div className="flex items-center space-x-2">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="text-green-400">{task.title}</span>
        {task.timeEstimate && (
          <span className="text-xs text-green-300 flex items-center">
            🕐 {task.timeEstimate}
          </span>
        )}
      </div>
    </div>
  );
};

// AFTER: Using UnifiedTaskCard with wellness theme
const NewWellnessCard = ({ task, onToggle }) => {
  return (
    <UnifiedTaskCard
      task={task}
      theme="wellness"       // Automatic green/emerald styling
      variant="compact"      // Smaller for quick health tasks
      onTaskToggle={onToggle}
      showTimeEstimate={true}
    />
  );
};

// ============================================================================
// MIGRATION EXAMPLE 4: Mobile/Today View Cards
// ============================================================================

// BEFORE: MobileTodayCard.tsx (320 lines of custom mobile styling)
const OldMobileTodayCard = ({ task, onToggle }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30 
                    touch-manipulation select-none">
      <div className="flex items-start space-x-3">
        <button 
          className="mt-1 w-5 h-5 rounded border-2 border-gray-600 flex items-center justify-center"
          onClick={() => onToggle(task.id)}
        >
          {task.completed && <span className="text-green-400">✓</span>}
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
            {task.title}
          </h4>
          
          {/* Mobile-specific layout logic */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            {task.priority && <span>🔴 {task.priority}</span>}
            {task.timeEstimate && <span>⏱️ {task.timeEstimate}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// AFTER: Using UnifiedTaskCard for mobile
const NewMobileTodayCard = ({ task, onToggle }) => {
  return (
    <UnifiedTaskCard
      task={task}
      theme={getTaskTheme('light', new Date().getHours())} // Dynamic theme based on time
      variant="compact"       // Perfect for mobile lists
      onTaskToggle={onToggle}
      showTimeEstimate={true}
      showProgress={false}    // Less clutter on mobile
      className="touch-manipulation" // Mobile-optimized
    />
  );
};

// ============================================================================
// UTILITY FUNCTIONS MIGRATION EXAMPLES
// ============================================================================

// BEFORE: Duplicated progress calculation logic (found in 8+ components)
const calculateProgressOldWay = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return { completed: task.completed ? 1 : 0, total: 1, percentage: task.completed ? 100 : 0 };
  }
  const completed = task.subtasks.filter(st => st.completed).length;
  const total = task.subtasks.length;
  return { completed, total, percentage: Math.round((completed / total) * 100) };
};

// AFTER: Using centralized utility
const calculateProgressNewWay = (task) => {
  return calculateTaskProgress(task); // One function, used everywhere
};

// BEFORE: Custom sorting logic in each component
const sortTasksOldWay = (tasks) => {
  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    return 0;
  });
};

// AFTER: Using centralized utility
const sortTasksNewWay = (tasks) => {
  return sortTasks(tasks); // Handles all priority levels and completion states
};

// ============================================================================
// FEATURE FLAG INTEGRATION EXAMPLES
// ============================================================================

// Safe migration pattern using feature flags
const TaskCardWithFeatureFlag = ({ task, onToggle }) => {
  return useImplementation(
    'useUnifiedTaskCard',
    // New implementation
    <UnifiedTaskCard 
      task={task} 
      theme="default" 
      onTaskToggle={onToggle}
    />,
    // Old implementation (fallback)
    <OldCustomTaskCard task={task} onToggle={onToggle} />
  );
};

// Batch operations example
const TaskListWithUtilities = ({ tasks, onTasksUpdate }) => {
  // Using utility functions for common operations
  const handleToggleAll = (completed: boolean) => {
    const updatedTasks = taskBatchOperations.toggleAll(tasks, completed);
    onTasksUpdate(updatedTasks);
  };
  
  const handleClearCompleted = () => {
    const filteredTasks = taskBatchOperations.clearCompleted(tasks);
    onTasksUpdate(filteredTasks);
  };
  
  const getTaskStats = () => {
    return taskBatchOperations.getStats(tasks);
  };
  
  // Render with sorted and filtered tasks
  const sortedTasks = sortTasks(tasks);
  const pendingTasks = filterTasks(sortedTasks, 'pending');
  
  return (
    <div>
      {/* Stats display using utility */}
      <div className="mb-4 text-sm text-gray-400">
        {getTaskStats().completed} of {getTaskStats().total} tasks completed
        ({getTaskStats().completionPercentage}%)
      </div>
      
      {/* Task list using UnifiedTaskCard */}
      {pendingTasks.map(task => (
        <UnifiedTaskCard
          key={task.id}
          task={task}
          theme={getTaskTheme(undefined, new Date().getHours())}
          onTaskToggle={(id, completed) => {
            const updated = tasks.map(t => 
              t.id === id ? { ...t, completed } : t
            );
            onTasksUpdate(updated);
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// THEME MAPPING GUIDE
// ============================================================================

/*
THEME MAPPING FROM OLD STYLES TO NEW THEMES:

Morning Routine Cards (yellow/orange) → theme="morning"
- bg-yellow-900/10, border-yellow-700/30, text-yellow-400

Work/Deep Focus Cards (purple/blue) → theme="work" 
- bg-purple-900/10, border-purple-700/30, text-purple-400

Light Work Cards (green/teal) → theme="light"
- bg-green-900/10, border-green-700/30, text-green-400

Wellness/Health Cards (emerald/green) → theme="wellness"
- bg-emerald-900/10, border-emerald-700/30, text-emerald-400

Timebox Cards (pink/purple) → theme="timebox"
- bg-pink-900/10, border-pink-700/30, text-pink-400

Evening/Checkout Cards (blue/indigo) → theme="checkout"
- bg-blue-900/10, border-blue-700/30, text-blue-400

Generic/Default Cards (gray) → theme="default"
- bg-gray-900/10, border-gray-700/30, text-gray-400

VARIANT MAPPING:

Large detailed cards → variant="expanded"
Standard task cards → variant="standard" 
Mobile/compact cards → variant="compact"
Expandable cards → variant="collapsible"
*/

// ============================================================================
// COMPLETE MIGRATION STEPS
// ============================================================================

/*
MIGRATION CHECKLIST:

□ 1. Enable feature flag: useUnifiedTaskCard = true
□ 2. Replace task card component imports
□ 3. Map old theme styles to new theme props
□ 4. Replace custom progress logic with calculateTaskProgress()
□ 5. Replace custom sorting with sortTasks()
□ 6. Replace custom filtering with filterTasks()
□ 7. Update event handlers to use new prop names
□ 8. Test all task interactions (toggle, subtasks, etc.)
□ 9. Verify theme consistency across sections
□ 10. Remove old task card components
□ 11. Enable related utility flags: useTaskCardUtils = true
□ 12. Update any remaining hardcoded task card logic

BENEFITS AFTER MIGRATION:
✅ 5,100+ lines → ~200 lines reusable component
✅ Consistent UI/UX across all task sections  
✅ Centralized utility functions (no more duplication)
✅ Theme variants for easy section customization
✅ Better accessibility with proper ARIA labels
✅ Performance optimizations with React.memo
✅ Animation support built-in
✅ Mobile-responsive by default
✅ Easier to maintain and extend
*/

export {
  NewMorningTaskCard,
  NewWorkTaskCard, 
  NewWellnessCard,
  NewMobileTodayCard,
  TaskCardWithFeatureFlag,
  TaskListWithUtilities
};