/**
 * ➕ AddSubtaskInput Component
 * 
 * Handles both the "Add Subtask" button and inline subtask input field
 * Switches between button mode and input mode based on active state
 */

import React from 'react';
import { Plus } from 'lucide-react';

interface AddSubtaskInputProps {
  taskId: string;
  themeConfig: {
    colors: {
      border: string;
      input: string;
      addSubtask: string;
    };
  };
  isAdding: boolean;
  newSubtaskTitle: string;
  onStartAdding: (taskId: string) => void;
  onTitleChange: (title: string) => void;
  onSave: (taskId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, type: 'newSubtask', taskId: string) => void;
}

export const AddSubtaskInput: React.FC<AddSubtaskInputProps> = ({
  taskId,
  themeConfig,
  isAdding,
  newSubtaskTitle,
  onStartAdding,
  onTitleChange,
  onSave,
  onKeyDown
}) => {
  if (isAdding) {
    // Input mode - show inline input field
    return (
      <div className="flex items-center gap-1 py-2 px-0 w-full">
        <div className={`h-4 w-4 rounded-full border-2 border-dashed ${themeConfig.colors.border} flex-shrink-0`} />
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => onKeyDown(e, 'newSubtask', taskId)}
          onBlur={() => onSave(taskId)}
          placeholder="Enter subtask..."
          autoFocus
          className={`flex-1 min-w-0 text-sm bg-gray-700/50 border ${themeConfig.colors.input} rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-1 min-h-[44px]`}
        />
      </div>
    );
  }

  // Button mode - show "Add Subtask" button
  return (
    <div className="mt-2 px-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStartAdding(taskId);
        }}
        className={`flex items-center gap-1 px-2 py-1 text-xs text-gray-400 ${themeConfig.colors.addSubtask} rounded transition-colors`}
      >
        <Plus className="h-3 w-3" />
        Add Subtask
      </button>
    </div>
  );
};