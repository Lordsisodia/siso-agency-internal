import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface TaskStatsProps {
  activeTasksCount: number;
  completedTasksCount: number;
  showCompletedTasks: boolean;
  onToggleCompletedTasks: () => void;
}

const TaskStats: React.FC<TaskStatsProps> = ({
  activeTasksCount,
  completedTasksCount,
  showCompletedTasks,
  onToggleCompletedTasks
}) => {
  return (
    <div className="flex-shrink-0 border-t border-white/20" style={{ backgroundColor: '#252525' }}>
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <button 
          onClick={onToggleCompletedTasks}
          className="flex items-center gap-2 text-sm text-green-300 hover:text-green-200 transition-colors"
          data-toggle-completed-tasks
        >
          {showCompletedTasks ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide Completed Tasks</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Show Completed Tasks ({completedTasksCount})</span>
            </>
          )}
        </button>
        
        <div className="text-xs text-gray-400">
          <span className="text-orange-300 font-medium">{activeTasksCount}</span> active, 
          <span className="text-green-300 font-medium ml-1">{completedTasksCount}</span> completed
        </div>
      </div>
    </div>
  );
};

export default TaskStats;