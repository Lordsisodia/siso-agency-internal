/**
 * 📊 TaskProgress Component
 * 
 * Displays subtask completion progress with separator
 * Used in task footers to show "X out of Y subtasks completed"
 */

import React from 'react';
import { TaskSeparator } from './TaskSeparator';

interface TaskProgressProps {
  subtasks: Array<{ completed: boolean }>;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ subtasks }) => {
  // Don't render if no subtasks
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;

  return (
    <div className="mt-4 pt-3">
      <TaskSeparator opacity="strong" spacing="normal" />
      <div className="text-center">
        <div className="text-xs text-gray-500">
          {completedCount} out of {totalCount} subtasks completed
        </div>
      </div>
    </div>
  );
};