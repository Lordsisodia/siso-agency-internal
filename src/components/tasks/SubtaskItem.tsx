/**
 * 📝 SubtaskItem Component
 * 
 * Individual subtask with checkbox, editable title, and metadata
 * Handles completion toggle, inline editing, and calendar popup
 */

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Clock, AlertCircle, Wrench } from 'lucide-react';
import { SubtaskMetadata } from './SubtaskMetadata';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface SubtaskItemProps {
  subtask: {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    description?: string;
    priority?: string;
    estimatedTime?: string;
    tools?: string[];
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
  isExpanded?: boolean;
  onToggleCompletion: (taskId: string, subtaskId: string) => void;
  onToggleExpansion?: (taskId: string, subtaskId: string) => void;
  onStartEditing: (subtaskId: string, currentTitle: string) => void;
  onEditTitleChange: (title: string) => void;
  onSaveEdit: (taskId: string, subtaskId: string) => void;
  onKeyDown: (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => void;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onPriorityUpdate?: (subtaskId: string, priority: string) => void;
  onEstimatedTimeUpdate?: (subtaskId: string, estimatedTime: string) => void;
  onDescriptionUpdate?: (subtaskId: string, description: string) => void;
  children?: React.ReactNode; // For calendar popup
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  taskId,
  themeConfig,
  isEditing,
  editTitle,
  calendarSubtaskId,
  isExpanded = false,
  onToggleCompletion,
  onToggleExpansion,
  onStartEditing,
  onEditTitleChange,
  onSaveEdit,
  onKeyDown,
  onCalendarToggle,
  onDeleteSubtask,
  onPriorityUpdate,
  onEstimatedTimeUpdate,
  onDescriptionUpdate,
  children
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState(subtask.description || '');

  const handleDescriptionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDescription(subtask.description || '');
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = () => {
    if (onDescriptionUpdate && editDescription !== subtask.description) {
      onDescriptionUpdate(subtask.id, editDescription);
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setEditDescription(subtask.description || '');
      setIsEditingDescription(false);
    }
  };

  return (
    <div className="group flex items-start gap-2 py-2 pl-1 pr-1 hover:bg-gray-700/20 rounded-lg transition-all duration-200 w-full">
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
          {/* Subtask Title with Expansion Button */}
          <div className="w-full mb-1.5">
            <div className="flex items-center gap-1">
              {/* Expansion Toggle */}
              {(subtask.description || subtask.priority || subtask.estimatedTime || subtask.tools?.length) && onToggleExpansion && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion(taskId, subtask.id);
                  }}
                  className="flex-shrink-0 p-0.5 hover:bg-gray-600/30 rounded transition-all duration-150"
                  aria-label={isExpanded ? "Collapse details" : "Show details"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              )}
              
              {/* Subtask Title */}
              <span 
                className={`block text-xs font-normal cursor-pointer hover:${themeConfig.colors.textSecondary} transition-colors leading-relaxed break-words flex-1 ${
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
          </div>
          
          {/* Expanded Details */}
          {isExpanded && (
            <div className="mb-3 pl-4 border-l border-gray-600/50 ml-1">
              <div className="space-y-2 text-xs">
                {/* Description */}
                {(subtask.description || isEditingDescription) && (
                  <div className="text-gray-300">
                    <span className="text-gray-500">Description:</span>{' '}
                    {isEditingDescription ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyDown={handleDescriptionKeyDown}
                        onBlur={handleDescriptionSave}
                        autoFocus
                        placeholder="Add a description..."
                        className="bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 text-xs w-full mt-1"
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:text-gray-100 transition-colors"
                        onClick={handleDescriptionClick}
                        title="Click to edit description"
                      >
                        {subtask.description || 'Add description...'}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Estimated Time only - Priority already shown in collapsed view */}
                <div className="flex items-center gap-4">
                  {subtask.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-400" />
                      <span className="text-gray-400">{subtask.estimatedTime}</span>
                    </div>
                  )}
                </div>
                
                {/* Tools */}
                {subtask.tools && subtask.tools.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Wrench className="h-3 w-3 text-purple-400" />
                      <span className="text-gray-500">Tools:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {subtask.tools.map((tool, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 bg-gray-700/50 text-gray-300 rounded text-xs border border-gray-600/30"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Metadata row: Due date, priority, estimated time, and Delete button */}
          <SubtaskMetadata
            subtask={subtask}
            calendarSubtaskId={calendarSubtaskId}
            onCalendarToggle={onCalendarToggle}
            onDeleteSubtask={onDeleteSubtask}
            onPriorityUpdate={onPriorityUpdate}
            onEstimatedTimeUpdate={onEstimatedTimeUpdate}
          >
            {children}
          </SubtaskMetadata>
        </div>
      )}
    </div>
  );
};