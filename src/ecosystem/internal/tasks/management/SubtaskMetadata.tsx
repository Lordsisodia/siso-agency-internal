/**
 * 📊 SubtaskMetadata Component
 * 
 * Contains due date badge and delete button for subtasks
 * Includes calendar popup functionality for date selection
 */

import React from 'react';
import { Calendar, X } from 'lucide-react';

interface SubtaskMetadataProps {
  subtask: {
    id: string;
    dueDate?: string;
    priority?: string;
  };
  calendarSubtaskId: string | null;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onPriorityChange?: (subtaskId: string, priority: string) => void;
  children?: React.ReactNode; // For calendar popup
}

export const SubtaskMetadata: React.FC<SubtaskMetadataProps> = ({
  subtask,
  calendarSubtaskId,
  onCalendarToggle,
  onDeleteSubtask,
  onPriorityChange,
  children
}) => {
  const [priorityPopupId, setPriorityPopupId] = React.useState<string | null>(null);
  

  const handlePriorityToggle = (subtaskId: string) => {
    setPriorityPopupId(priorityPopupId === subtaskId ? null : subtaskId);
  };

  const handlePrioritySelect = (priority: string) => {
    if (onPriorityChange) {
      onPriorityChange(subtask.id, priority);
    }
    setPriorityPopupId(null);
  };

  const getPriorityConfig = (priority?: string) => {
    const TASK_PRIORITY_CONFIG = {
      'low': { icon: '🟢', label: 'Low', bgColor: 'bg-green-600', textColor: 'text-white' },
      'medium': { icon: '🟡', label: 'Medium', bgColor: 'bg-yellow-600', textColor: 'text-white' },
      'high': { icon: '🔴', label: 'High', bgColor: 'bg-red-600', textColor: 'text-white' },
      'urgent': { icon: '🚨', label: 'Urgent', bgColor: 'bg-purple-600', textColor: 'text-white' }
    };
    return TASK_PRIORITY_CONFIG[priority || 'medium'] || TASK_PRIORITY_CONFIG['medium'];
  };

  const priorityConfig = getPriorityConfig(subtask.priority);
  
  return (
    <div className="flex items-center justify-between">
      {/* Left side: Due date and Priority */}
      <div className="flex items-center gap-3">
        {/* Due date indicator - opens calendar */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCalendarToggle(subtask.id);
            }}
            className={`flex items-center gap-1 text-xs font-normal cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded ${
              subtask.dueDate ? (
                new Date(subtask.dueDate) < new Date() ? 'text-red-400 font-medium bg-red-900/20' : // Overdue
                new Date(subtask.dueDate).toDateString() === new Date().toDateString() ? 'text-yellow-400 font-medium bg-yellow-900/20' : // Due today
                'text-gray-300 bg-gray-800/50' // Normal
              ) : 'text-gray-500 bg-gray-800/30'
            }`}
            title="Click to set due date"
          >
            <Calendar className="h-3 w-3" />
            {subtask.dueDate ? (
              new Date(subtask.dueDate) < new Date() ? 'Overdue' :
              new Date(subtask.dueDate).toDateString() === new Date().toDateString() ? 'Due Today' :
              new Date(subtask.dueDate).toLocaleDateString()
            ) : 'No due date'}
          </button>
          
          {/* Calendar Popup - rendered as children */}
          {calendarSubtaskId === subtask.id && children}
        </div>
        
        {/* Priority Badge - similar to due date */}
        {onPriorityChange && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePriorityToggle(subtask.id);
              }}
              className={`flex items-center gap-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded ${priorityConfig.bgColor} ${priorityConfig.textColor}`}
              title="Click to change priority"
            >
              <span>{priorityConfig.icon}</span>
              <span className="hidden sm:inline">{priorityConfig.label}</span>
            </button>
            
            {/* Priority Popup */}
            {priorityPopupId === subtask.id && (
              <div className="absolute top-8 left-0 z-[99999] bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 min-w-[120px]">
                {Object.entries({
                  'low': { icon: '🟢', label: 'Low', bgColor: 'bg-green-600', textColor: 'text-white' },
                  'medium': { icon: '🟡', label: 'Medium', bgColor: 'bg-yellow-600', textColor: 'text-white' },
                  'high': { icon: '🔴', label: 'High', bgColor: 'bg-red-600', textColor: 'text-white' },
                  'urgent': { icon: '🚨', label: 'Urgent', bgColor: 'bg-purple-600', textColor: 'text-white' }
                }).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrioritySelect(key);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1 text-xs text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Right side: Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteSubtask(subtask.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100 min-h-[24px] min-w-[24px] flex items-center justify-center rounded-md"
        title="Delete subtask"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};