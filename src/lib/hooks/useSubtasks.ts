
import { useState } from 'react';
import { calculateTaskProgress } from '@/domains/tasks/utils/taskCardUtils';
import { isFeatureEnabled } from '@/migration/feature-flags';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export function useSubtasks(initialSubtasks: Subtask[]) {
  const [subtasks, setSubtasks] = useState(initialSubtasks);

  const handleSubtaskToggle = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleAddSubtask = () => {
    const newId = String(subtasks.length + 1);
    setSubtasks([...subtasks, { id: newId, title: 'New subtask', completed: false }]);
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const getProgress = () => {
    // Feature flag: Use refactored progress calculation or fallback to original  
    if (isFeatureEnabled('useTaskCardUtils')) {
      // NEW: Use centralized utility function
      const taskForCalculation = {
        id: 'subtasks-progress',
        title: 'Progress Calculation',
        completed: false,
        subtasks
      };
      return calculateTaskProgress(taskForCalculation).percentage;
    } else {
      // OLD: Original calculation logic (fallback)
      const completedSubtasks = subtasks.filter(st => st.completed).length;
      return subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
    }
  };

  return {
    subtasks,
    handleSubtaskToggle,
    handleAddSubtask,
    handleDeleteSubtask,
    getProgress
  };
}
