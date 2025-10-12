/**
 * 📋 TaskHeader Component - Enhanced UI
 * 
 * Contains task checkbox, editable title, and inline editing functionality
 * Handles completion toggle and title editing with keyboard shortcuts
 * 
 * ENHANCEMENTS:
 * ✅ Enhanced checkbox with better contrast
 * ✅ Custom checkbox with check icon
 * ✅ Improved typography and spacing
 * ✅ Card-style layout for tasks
 */

import React from 'react';
import { Check, GripVertical } from 'lucide-react';

interface TaskHeaderProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
  };
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    'data-item-id': string;
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
  onKeyDown,
  dragHandleProps
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          className="flex-shrink-0 p-1 hover:bg-gray-700/50 rounded cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to reorder"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      
      {/* Enhanced Custom Checkbox with Better Contrast and Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompletion(task.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="flex-shrink-0 hover:scale-110 active:scale-95 transition-all duration-200 touch-manipulation"
        style={{ touchAction: 'manipulation' }}
        aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
        role="checkbox"
        aria-checked={task.completed}
      >
        {task.completed ? (
          <div className="w-7 h-7 rounded-full border-3 border-emerald-400 bg-emerald-500 flex items-center justify-center shadow-lg ring-2 ring-emerald-400/30">
            <Check className="w-4 h-4 text-white font-bold stroke-[3]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-3 border-emerald-400/80 bg-gray-800 hover:bg-emerald-900/40 hover:border-emerald-300 transition-all duration-200 shadow-md ring-1 ring-emerald-400/20" />
        )}
      </button>
      
      {/* Enhanced Typography & Spacing */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, 'task', task.id)}
            onBlur={() => onSaveEdit(task.id)}
            autoFocus
            className="w-full text-lg font-semibold bg-gray-800/50 border-2 border-emerald-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/50 rounded-lg px-4 py-3 text-emerald-100 focus:outline-none transition-all duration-200 shadow-sm"
            placeholder="Enter task title..."
          />
        ) : (
          <h3 
            className={`text-lg font-semibold leading-relaxed cursor-pointer hover:text-emerald-200 transition-colors duration-200 tracking-wide ${
              task.completed 
                ? 'line-through text-emerald-200/60' 
                : 'text-emerald-100'
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