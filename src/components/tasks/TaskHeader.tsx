/**
 * 📋 TaskHeader Component
 * 
 * Contains task checkbox, editable title, and inline editing functionality
 * Handles completion toggle and title editing with keyboard shortcuts
 */

import React from 'react';
import { Check } from 'lucide-react';

interface TaskHeaderProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
  };
  themeConfig: {
    colors: {
      text: string;
      border: string;
      input: string;
      textSecondary: string;
    };
  };
  isEditing: boolean;
  editTitle: string;
  onToggleCompletion: (taskId: string) => void;
  onStartEditing: (taskId: string, currentTitle: string) => void;
  onEditTitleChange: (title: string) => void;
  onSaveEdit: (taskId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, type: 'task', taskId: string) => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  themeConfig,
  isEditing,
  editTitle,
  onToggleCompletion,
  onStartEditing,
  onEditTitleChange,
  onSaveEdit,
  onKeyDown
}) => {
  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      {/* Left: Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompletion(task.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="flex-shrink-0 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {task.completed ? (
          <Check className={`h-5 w-5 ${themeConfig.colors.text}`} />
        ) : (
          <div className={`h-5 w-5 rounded-full border-2 border-gray-400 hover:${themeConfig.colors.border} transition-colors`} />
        )}
      </button>
      
      {/* Center: Task Title (flexible) */}
      <div className="flex-1 min-w-0 px-2">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, 'task', task.id)}
            onBlur={() => onSaveEdit(task.id)}
            autoFocus
            className={`w-full text-base font-medium bg-gray-700/50 border ${themeConfig.colors.input} rounded px-3 py-2 text-white focus:outline-none focus:ring-1 min-h-[36px]`}
          />
        ) : (
          <h3 
            className={`text-base font-medium leading-tight cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors text-white ${
              task.completed ? `line-through ${themeConfig.colors.textSecondary}/80` : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onStartEditing(task.id, task.title);
            }}
            title={`Click to edit: ${task.title}`}
          >
            {task.title || 'Untitled Task'}
          </h3>
        )}
      </div>
    </div>
  );
};