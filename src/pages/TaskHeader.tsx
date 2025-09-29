import React from 'react';
import { Button } from '@/shared/ui/button';
import { User } from 'lucide-react';

interface TaskHeaderProps {
  completedTasksCount: number;
  activeTasksCount: number;
  showContextMenu: boolean;
  onContextMenuToggle: () => void;
  onProjectSelect: (project: string) => void;
  onProjectContextShow: () => void;
  onContextMenuClose: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  completedTasksCount,
  activeTasksCount,
  showContextMenu,
  onContextMenuToggle,
  onProjectSelect,
  onProjectContextShow,
  onContextMenuClose
}) => {
  const handleProjectSelect = (project: string) => {
    onProjectSelect(project);
    onProjectContextShow();
    onContextMenuClose();
  };

  return (
    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-black">SISO AGENCY</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Task Count Pill */}
        <div className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
          {completedTasksCount} completed, {activeTasksCount} active
        </div>
        
        {/* Project Context Icon */}
        <div className="relative context-menu-container">
          <Button
            size="sm"
            variant="ghost"
            onClick={onContextMenuToggle}
            className="text-black hover:bg-gray-100 px-2 py-2 h-8"
            title="Project Context"
          >
            <User className="h-4 w-4" />
          </Button>
          
          {showContextMenu && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">Project Context</p>
                <p className="text-xs text-gray-500">Select active project</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => handleProjectSelect('siso-agency')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  SISO Agency
                </button>
                <button 
                  onClick={() => handleProjectSelect('client-project')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Client Project
                </button>
                <button 
                  onClick={() => handleProjectSelect('internal-tools')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Internal Tools
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;