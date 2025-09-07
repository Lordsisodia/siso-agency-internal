/**
 * 📝 SubtaskItem Component
 * 
 * Individual subtask with checkbox, editable title, and metadata
 * Handles completion toggle, inline editing, and calendar popup
 */

import React from 'react';
import { Check } from 'lucide-react';
import { TaskSeparator } from './TaskSeparator';
import { SubtaskMetadata } from './SubtaskMetadata';

interface SubtaskItemProps {
  subtask: {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
  };
  taskId: string;
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
  calendarSubtaskId: string | null;
  onToggleCompletion: (taskId: string, subtaskId: string) => void;
  onStartEditing: (subtaskId: string, currentTitle: string) => void;
  onEditTitleChange: (title: string) => void;
  onSaveEdit: (taskId: string, subtaskId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => void;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  children?: React.ReactNode; // For calendar popup
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  taskId,
  themeConfig,
  isEditing,
  editTitle,
  calendarSubtaskId,
  onToggleCompletion,
  onStartEditing,
  onEditTitleChange,
  onSaveEdit,
  onKeyDown,
  onCalendarToggle,
  onDeleteSubtask,
  children
}) => {
  return (
    <div className="group flex items-start gap-3 py-2 px-3 hover:bg-gray-700/20 rounded-lg transition-all duration-200 w-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompletion(taskId, subtask.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-150 min-h-[32px] min-w-[32px] flex items-center justify-center mt-0.5 hover:bg-gray-600/30 active:bg-gray-500/40 rounded-md touch-manipulation"
        style={{ touchAction: 'manipulation' }}
        aria-label={subtask.completed ? "Mark subtask as incomplete" : "Mark subtask as complete"}
        role="checkbox"
        aria-checked={subtask.completed}
      >
        {subtask.completed ? (
          <Check className={`h-4 w-4 ${themeConfig.colors.text} drop-shadow-sm`} />
        ) : (
          <div className={`h-4 w-4 rounded-full border-2 border-gray-300 hover:${themeConfig.colors.border} hover:border-opacity-90 transition-all duration-200 bg-gray-800/10 hover:bg-gray-700/20`} />
        )}
      </button>
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, 'subtask', taskId, subtask.id)}
          onBlur={() => onSaveEdit(taskId, subtask.id)}
          autoFocus
          className={`flex-1 text-xs bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white focus:outline-none focus:ring-1 min-h-[32px]`}
        />
      ) : (
        <div className="flex-1 min-w-0 pr-1">
          {/* Subtask Title */}
          <div className="w-full mb-1.5">
            <span 
              className={`block text-xs font-normal cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors leading-relaxed break-words ${
                subtask.completed ? 'line-through text-gray-400' : 'text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing(subtask.id, subtask.title);
              }}
              title="Click to edit"
            >
              {subtask.title}
            </span>
          </div>
          
          {/* Light, thin separator line */}
          <TaskSeparator thickness="thin" opacity="light" spacing="tight" />
          
          {/* Metadata row: Due date and Delete button */}
          <SubtaskMetadata
            subtask={subtask}
            calendarSubtaskId={calendarSubtaskId}
            onCalendarToggle={onCalendarToggle}
            onDeleteSubtask={onDeleteSubtask}
          >
            {children}
          </SubtaskMetadata>
        </div>
      )}
    </div>
  );
};