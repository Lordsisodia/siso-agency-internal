/**
 * 🔍 useTaskFiltering Hook
 * 
 * Manages task filtering and sorting logic for different work types
 * Handles DEEP/LIGHT work type filtering and task ordering
 */

import { useMemo } from 'react';

interface Task {
  id: string;
  workType: 'DEEP' | 'LIGHT';
  title: string;
  isPushed?: boolean;
  [key: string]: any;
}

interface UseTaskFilteringProps {
  tasks: Task[];
  workType: 'DEEP' | 'LIGHT';
}

export const useTaskFiltering = ({ tasks, workType }: UseTaskFilteringProps) => {
  const filteredAndSortedTasks = useMemo(() => {
    // Filter tasks for current work type
    const filteredTasks = (tasks || []).filter(task => {
      if (workType === 'DEEP') {
        // For Deep Work: show DEEP tasks AND any existing tasks (backwards compatibility)
        // This ensures user's existing tasks continue to appear in Deep Work section
        return task.workType === 'DEEP' || 
               task.workType === 'LIGHT' ||  // Show existing LIGHT tasks in Deep Work too
               task.title.toLowerCase().includes('deep') ||
               task.title.toLowerCase().includes('focus');
      } else {
        // For Light Work: only show LIGHT tasks
        return task.workType === 'LIGHT' || 
               task.title.toLowerCase().includes('light');
      }
    });

    // Sort tasks: regular tasks first, then pushed tasks at bottom
    const sortedTasks = filteredTasks.sort((a, b) => {
      if (a.isPushed && !b.isPushed) return 1;
      if (!a.isPushed && b.isPushed) return -1;
      return 0;
    });

    return sortedTasks;
  }, [tasks, workType]);

  return {
    filteredAndSortedTasks
  };
};