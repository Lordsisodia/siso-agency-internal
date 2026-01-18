/**
 * 📊 SubtaskMetadata Component
 *
 * Contains due date, priority badges and delete button for subtasks
 * Includes calendar popup functionality for date selection
 */

import React from 'react';
import { Calendar, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubtaskMetadataProps {
  subtask: {
    id: string;
    dueDate?: string;
    priority?: string;
    estimatedTime?: string;
  };
  calendarSubtaskId: string | null;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onPriorityUpdate?: (subtaskId: string, priority: string) => void;
  onEstimatedTimeUpdate?: (subtaskId: string, estimatedTime: string) => void;
  children?: React.ReactNode; // For calendar popup
}

export const SubtaskMetadata: React.FC<SubtaskMetadataProps> = ({
  subtask,
  calendarSubtaskId,
  onCalendarToggle,
  onDeleteSubtask,
  onPriorityUpdate,
  onEstimatedTimeUpdate,
  children
}) => {
  const [priorityPopupId, setPriorityPopupId] = React.useState<string | null>(null);
  const [isEditingTime, setIsEditingTime] = React.useState(false);
  const [editTime, setEditTime] = React.useState(subtask.estimatedTime || '');

  const handlePriorityToggle = (subtaskId: string) => {
    setPriorityPopupId(priorityPopupId === subtaskId ? null : subtaskId);
  };

  const handlePrioritySelect = (priority: string) => {
    if (onPriorityUpdate) {
      onPriorityUpdate(subtask.id, priority);
    }
    setPriorityPopupId(null);
  };

  const handleTimeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEstimatedTimeUpdate) {
      setEditTime(subtask.estimatedTime || '');
      setIsEditingTime(true);
    }
  };

  const handleTimeSave = () => {
    if (onEstimatedTimeUpdate && editTime !== subtask.estimatedTime) {
      onEstimatedTimeUpdate(subtask.id, editTime);
    }
    setIsEditingTime(false);
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTimeSave();
    } else if (e.key === 'Escape') {
      setEditTime(subtask.estimatedTime || '');
      setIsEditingTime(false);
    }
  };

  const getPriorityConfig = (priority?: string) => {
    const TASK_PRIORITY_CONFIG = {
      'low': { icon: '🟢', label: 'Low', bgColor: 'bg-green-600', textColor: 'text-white' },
      'medium': { icon: '🟡', label: 'Med', bgColor: 'bg-yellow-600', textColor: 'text-white' },
      'high': { icon: '🔴', label: 'High', bgColor: 'bg-red-600', textColor: 'text-white' },
      'urgent': { icon: '🚨', label: 'Urgent', bgColor: 'bg-purple-600', textColor: 'text-white' }
    };
    return TASK_PRIORITY_CONFIG[priority?.toLowerCase() || 'medium'] || TASK_PRIORITY_CONFIG['medium'];
  };

  const priorityConfig = getPriorityConfig(subtask.priority);

  // Format date to short format (09/10)
  const formatShortDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-1">
      {/* Compact metadata row */}
      <div className="flex items-center gap-2 text-xs">
        {/* Due date - compact */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCalendarToggle(subtask.id);
          }}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
            subtask.dueDate ? (
              new Date(subtask.dueDate) < new Date() ? 'text-red-400 bg-red-900/20' :
              new Date(subtask.dueDate).toDateString() === new Date().toDateString() ? 'text-yellow-400 bg-yellow-900/20' :
              'text-gray-400 bg-gray-800/30'
            ) : 'text-gray-500 bg-gray-800/20 hover:bg-gray-800/30'
          }`}
          title="Set due date"
        >
          <Calendar className="h-3 w-3" />
          <span className="font-mono">{formatShortDate(subtask.dueDate) || '--/--'}</span>
        </button>

        {/* Priority - compact */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPriorityUpdate) {
              handlePriorityToggle(subtask.id);
            }
          }}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${onPriorityUpdate ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity ${
            subtask.priority?.toLowerCase() === 'urgent' ? 'text-purple-300 bg-purple-900/20' :
            subtask.priority?.toLowerCase() === 'high' ? 'text-red-300 bg-red-900/20' :
            subtask.priority?.toLowerCase() === 'low' ? 'text-green-300 bg-green-900/20' :
            'text-yellow-300 bg-yellow-900/20'
          }`}
          title={onPriorityUpdate ? "Change priority" : "Priority"}
        >
          <span>{priorityConfig.icon}</span>
          <span className="text-xs">{priorityConfig.label}</span>
        </button>

        {/* Time estimate - compact */}
        {isEditingTime ? (
          <input
            type="text"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            onKeyDown={handleTimeKeyDown}
            onBlur={handleTimeSave}
            autoFocus
            placeholder="30min"
            className="w-16 px-1.5 py-0.5 bg-gray-700/50 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-gray-500 text-xs"
          />
        ) : (
          <button
            onClick={handleTimeClick}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              subtask.estimatedTime 
                ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-900/30' 
                : 'text-gray-500 bg-gray-800/20 hover:bg-gray-800/30'
            }`}
            title={onEstimatedTimeUpdate ? "Set time estimate" : "Time estimate"}
          >
            <span className="text-xs">⏱</span>
            <span className="text-xs">{subtask.estimatedTime || '--'}</span>
          </button>
        )}
      </div>

      {/* Calendar Popup */}
      {calendarSubtaskId === subtask.id && children}

      {/* Priority Popup */}
      <AnimatePresence>
        {onPriorityUpdate && priorityPopupId === subtask.id && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/20"
              onClick={(e) => {
                e.stopPropagation();
                setPriorityPopupId(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] backdrop-blur-xl bg-gray-900/95 border-2 border-gray-600/50 rounded-xl shadow-2xl shadow-black/60 p-3 min-w-[160px]"
            >
              {Object.entries({
                'low': { icon: '🟢', label: 'Low', gradient: 'hover:bg-gradient-to-r hover:from-green-900/30 hover:to-green-800/20' },
                'medium': { icon: '🟡', label: 'Medium', gradient: 'hover:bg-gradient-to-r hover:from-yellow-900/30 hover:to-yellow-800/20' },
                'high': { icon: '🔴', label: 'High', gradient: 'hover:bg-gradient-to-r hover:from-red-900/30 hover:to-red-800/20' },
                'urgent': { icon: '🚨', label: 'Urgent', gradient: 'hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-red-900/20' }
              }).map(([key, config]) => {
                const isActive = subtask.priority?.toLowerCase() === key;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrioritySelect(key);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-white rounded-lg transition-all ${config.gradient} ${
                      isActive ? 'bg-gray-700/50 ring-1 ring-gray-500/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                    {isActive && <Check className="h-3 w-3 text-gray-400" />}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
}
