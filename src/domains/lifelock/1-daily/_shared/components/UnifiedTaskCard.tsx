"use client";

/**
 * 🎯 Unified Task Card Component
 *
 * Used by both Light Work and Deep Work with different themes
 * Theme colors are passed as props for flexibility
 */

import React from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  Calendar,
  Timer,
  Plus,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SubtaskItem } from "@/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem";
import { CustomCalendar } from "../components";

// Types
export interface UnifiedSubtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string;
  tools?: string[];
  completed: boolean;
  dueDate?: string;
  /** Nested sub-subtasks (2-level hierarchy) */
  subtasks?: UnifiedSubtask[];
}

export interface UnifiedTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  subtasks: UnifiedSubtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
  dueDate?: string | null;
  timeEstimate?: string | null;
  clientId?: string;
  // Timer state
  activeTimer?: { taskId: string } | null;
  elapsedMs?: number;
}

export interface ThemeConfig {
  colors: {
    bg: string;
    border: string;
    bgHover: string;
    borderHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    divider: string;
    inputBg: string;
    inputBorder: string;
    inputFocusBorder: string;
    buttonBg: string;
    buttonHover: string;
    buttonText: string;
    calendarBg: string;
    calendarBorder: string;
    priorityMenuBg: string;
    priorityMenuBorder: string;
    priorityActive: string;
    priorityInactive: string;
    priorityHover: string;
    timerActiveBg: string;
    timerActiveText: string;
    timerActiveBorder: string;
    timerBg: string;
    timerText: string;
    timerBorder: string;
    deleteButton: string;
    deleteButtonHover: string;
  };
  icons: {
    inProgress: string;
    checkbox: string;
  };
}

// Theme definitions
export const LIGHT_THEME: ThemeConfig = {
  colors: {
    bg: 'bg-green-900/10',
    border: 'border-green-700/30',
    bgHover: 'hover:bg-green-900/15',
    borderHover: 'hover:border-green-600/40',
    text: 'text-green-100',
    textSecondary: 'text-green-300',
    textMuted: 'text-green-200/80',
    divider: 'border-t-2 border-green-600/50',
    inputBg: 'bg-green-900/40',
    inputBorder: 'border-green-600/50',
    inputFocusBorder: 'focus:border-green-400',
    buttonBg: 'text-green-300 hover:text-green-200 hover:bg-green-900/20 border-green-700/30 hover:border-green-600/40',
    buttonText: 'text-green-300',
    calendarBg: 'bg-green-950/95',
    calendarBorder: 'border-green-700/60',
    priorityMenuBg: 'bg-green-950/95',
    priorityMenuBorder: 'border-green-700/60',
    priorityActive: 'bg-green-800/40 text-green-100',
    priorityInactive: 'text-green-200 hover:bg-green-800/30',
    priorityHover: 'hover:bg-green-900/25',
    timerActiveBg: 'bg-green-900/30',
    timerActiveText: 'text-green-200',
    timerActiveBorder: 'border-green-700/60',
    timerBg: 'bg-green-900/20',
    timerText: 'text-green-200',
    timerBorder: 'border-green-700/50',
    deleteButton: 'text-gray-400 hover:text-red-400',
    deleteButtonHover: 'hover:bg-green-900/25',
  },
  icons: {
    inProgress: 'text-green-400',
    checkbox: 'text-gray-400',
  }
};

export const DEEP_THEME: ThemeConfig = {
  colors: {
    bg: 'bg-blue-900/10',
    border: 'border-blue-700/30',
    bgHover: 'hover:bg-blue-900/15',
    borderHover: 'hover:border-blue-600/40',
    text: 'text-blue-100',
    textSecondary: 'text-blue-300',
    textMuted: 'text-blue-200/80',
    divider: 'border-t-2 border-blue-600/50',
    inputBg: 'bg-blue-900/40',
    inputBorder: 'border-blue-600/50',
    inputFocusBorder: 'focus:border-blue-400',
    buttonBg: 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40',
    buttonText: 'text-blue-300',
    calendarBg: 'bg-blue-950/95',
    calendarBorder: 'border-blue-700/60',
    priorityMenuBg: 'bg-blue-950/95',
    priorityMenuBorder: 'border-blue-700/60',
    priorityActive: 'bg-blue-800/40 text-blue-100',
    priorityInactive: 'text-blue-200 hover:bg-blue-800/30',
    priorityHover: 'hover:bg-blue-900/25',
    timerActiveBg: 'bg-green-900/30',
    timerActiveText: 'text-green-200',
    timerActiveBorder: 'border-green-700/60',
    timerBg: 'bg-blue-900/20',
    timerText: 'text-blue-200',
    timerBorder: 'border-blue-700/50',
    deleteButton: 'text-gray-400 hover:text-red-400',
    deleteButtonHover: 'hover:bg-blue-900/25',
  },
  icons: {
    inProgress: 'text-blue-400',
    checkbox: 'text-gray-400',
  }
};

export const SLATE_THEME: ThemeConfig = {
  colors: {
    bg: 'bg-slate-900/10',
    border: 'border-slate-700/30',
    bgHover: 'hover:bg-slate-900/15',
    borderHover: 'hover:border-slate-600/40',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-200/80',
    divider: 'border-t-2 border-slate-600/50',
    inputBg: 'bg-slate-800/50',
    inputBorder: 'border-slate-600/50',
    inputFocusBorder: 'focus:border-slate-500',
    buttonBg: 'text-slate-300 hover:text-slate-200 hover:bg-slate-900/20 border-slate-700/30 hover:border-slate-600/40',
    buttonText: 'text-slate-300',
    calendarBg: 'bg-slate-950/95',
    calendarBorder: 'border-slate-700/60',
    priorityMenuBg: 'bg-slate-950/95',
    priorityMenuBorder: 'border-slate-700/60',
    priorityActive: 'bg-slate-800/40 text-slate-100',
    priorityInactive: 'text-slate-200 hover:bg-slate-800/30',
    priorityHover: 'hover:bg-slate-900/25',
    timerActiveBg: 'bg-green-900/30',
    timerActiveText: 'text-green-200',
    timerActiveBorder: 'border-green-700/60',
    timerBg: 'bg-slate-900/20',
    timerText: 'text-slate-200',
    timerBorder: 'border-slate-700/50',
    deleteButton: 'text-gray-400 hover:text-red-400',
    deleteButtonHover: 'hover:bg-slate-900/25',
  },
  icons: {
    inProgress: 'text-slate-400',
    checkbox: 'text-gray-400',
  }
};

export const AMBER_THEME: ThemeConfig = {
  colors: {
    bg: 'bg-amber-900/10',
    border: 'border-amber-700/30',
    bgHover: 'hover:bg-amber-900/15',
    borderHover: 'hover:border-amber-600/40',
    text: 'text-amber-100',
    textSecondary: 'text-amber-300',
    textMuted: 'text-amber-200/80',
    divider: 'border-t-2 border-amber-600/50',
    inputBg: 'bg-amber-900/40',
    inputBorder: 'border-amber-600/50',
    inputFocusBorder: 'focus:border-amber-400',
    buttonBg: 'text-amber-300 hover:text-amber-200 hover:bg-amber-900/20 border-amber-700/30 hover:border-amber-600/40',
    buttonText: 'text-amber-300',
    calendarBg: 'bg-amber-950/95',
    calendarBorder: 'border-amber-700/60',
    priorityMenuBg: 'bg-amber-950/95',
    priorityMenuBorder: 'border-amber-700/60',
    priorityActive: 'bg-amber-800/40 text-amber-100',
    priorityInactive: 'text-amber-200 hover:bg-amber-800/30',
    priorityHover: 'hover:bg-amber-900/25',
    timerActiveBg: 'bg-amber-900/30',
    timerActiveText: 'text-amber-200',
    timerActiveBorder: 'border-amber-700/60',
    timerBg: 'bg-amber-900/20',
    timerText: 'text-amber-200',
    timerBorder: 'border-amber-700/50',
    deleteButton: 'text-amber-400/70 hover:text-red-400',
    deleteButtonHover: 'hover:bg-amber-900/25',
  },
  icons: {
    inProgress: 'text-amber-400',
    checkbox: 'text-amber-400/60',
  }
};

// TEAL_THEME for Today Tasks - bridges Light (green) and Deep (blue) work
export const TEAL_THEME: ThemeConfig = {
  colors: {
    bg: 'bg-teal-900/10',
    border: 'border-teal-700/30',
    bgHover: 'hover:bg-teal-900/15',
    borderHover: 'hover:border-teal-600/40',
    text: 'text-teal-100',
    textSecondary: 'text-teal-300',
    textMuted: 'text-teal-200/80',
    divider: 'border-t-2 border-teal-600/50',
    inputBg: 'bg-teal-900/40',
    inputBorder: 'border-teal-600/50',
    inputFocusBorder: 'focus:border-teal-400',
    buttonBg: 'text-teal-300 hover:text-teal-200 hover:bg-teal-900/20 border-teal-700/30 hover:border-teal-600/40',
    buttonText: 'text-teal-300',
    calendarBg: 'bg-teal-950/95',
    calendarBorder: 'border-teal-700/60',
    priorityMenuBg: 'bg-teal-950/95',
    priorityMenuBorder: 'border-teal-700/60',
    priorityActive: 'bg-teal-800/40 text-teal-100',
    priorityInactive: 'text-teal-200 hover:bg-teal-800/30',
    priorityHover: 'hover:bg-teal-900/25',
    timerActiveBg: 'bg-teal-900/30',
    timerActiveText: 'text-teal-200',
    timerActiveBorder: 'border-teal-700/60',
    timerBg: 'bg-teal-900/20',
    timerText: 'text-teal-200',
    timerBorder: 'border-teal-700/50',
    deleteButton: 'text-teal-400/70 hover:text-red-400',
    deleteButtonHover: 'hover:bg-teal-900/25',
  },
  icons: {
    inProgress: 'text-teal-400',
    checkbox: 'text-teal-400/60',
  }
};

const TASK_PRIORITY_CONFIG: Record<string, { icon: string; label: string; badgeClass: string }> = {
  low: { icon: '🟢', label: 'Low', badgeClass: 'text-green-200 bg-green-900/20 hover:bg-green-900/30' },
  medium: { icon: '🟡', label: 'Medium', badgeClass: 'text-yellow-200 bg-yellow-900/20 hover:bg-yellow-900/30' },
  high: { icon: '🔴', label: 'High', badgeClass: 'text-red-200 bg-red-900/20 hover:bg-red-900/30' },
  urgent: { icon: '🚨', label: 'Urgent', badgeClass: 'text-purple-200 bg-purple-900/20 hover:bg-purple-900/30' }
};

interface UnifiedTaskCardProps {
  task: UnifiedTask;
  theme: ThemeConfig;
  index: number;
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  taskVariants: any;
  subtaskListVariants: any;
  subtaskVariants: any;
  activeTaskCalendarId: string | null;
  taskPriorityMenuId: string | null;
  editingTaskTimeId: string | null;
  editTaskTimeValue: string;
  editingMainTask: string | null;
  editMainTaskTitle: string;
  calendarSubtaskId: string | null;
  editingSubtask: string | null;
  editSubtaskTitle: string;
  addingSubtaskToTask: string | null;
  newSubtaskTitle: string;
  showCompletedSubtasks: { [taskId: string]: boolean };
  expandedSubtasks: { [key: string]: boolean };
  clientMap?: Map<string, string>;
  sortSubtasks?: (subtasks: UnifiedSubtask[]) => UnifiedSubtask[];
  workType?: 'light' | 'deep';
  // Handlers
  onToggleTaskStatus: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onTaskCalendarToggle: (taskId: string) => void;
  onTaskCalendarSelect: (taskId: string, date: Date | null) => void;
  onTaskPrioritySelect: (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onTaskTimeStartEditing: (task: UnifiedTask, fallbackLabel: string) => void;
  onTaskTimeSave: (taskId: string) => void;
  onTaskTimeKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, taskId: string) => void;
  onTaskTimeChange: (value: string) => void;
  onMoveTask: (taskId: string, direction: 'up' | 'down') => void;
  onTimerToggle: (taskId: string) => void;
  onToggleSubtaskVisibility: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMainTaskStartEditing: (taskId: string, currentTitle: string) => void;
  onMainTaskEditTitleChange: (value: string) => void;
  onMainTaskSaveEdit: (taskId: string) => void;
  onMainTaskKeyDown: (e: React.KeyboardEvent, taskId: string) => void;
  onToggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  onToggleSubtaskExpansion: (taskId: string, subtaskId: string) => void;
  onSubtaskStartEditing: (subtaskId: string, currentTitle: string) => void;
  onSubtaskEditTitleChange: (title: string) => void;
  onSubtaskSaveEdit: (taskId: string, subtaskId: string) => void;
  onSubtaskKeyDown: (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => void;
  onCalendarToggle: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onUpdateSubtaskPriority: (subtaskId: string, priority: string) => void;
  onUpdateSubtaskEstimatedTime: (subtaskId: string, estimatedTime: string) => void;
  onUpdateSubtaskDescription: (subtaskId: string, description: string) => void;
  onStartAddingSubtask: (taskId: string) => void;
  onNewSubtaskTitleChange: (title: string) => void;
  onSaveNewSubtask: (taskId: string) => void;
  onNewSubtaskKeyDown: (e: React.KeyboardEvent, taskId: string) => void;
  formatMsAsClock?: (ms: number) => string;
  getTaskTimeSummary?: (task: UnifiedTask) => { totalMinutes: number; formatted: string };
  themeName?: 'LIGHT' | 'DEEP' | 'AMBER';
}

export function UnifiedTaskCard({
  task,
  theme,
  index,
  isExpanded,
  isFirst,
  isLast,
  taskVariants,
  subtaskListVariants,
  subtaskVariants,
  activeTaskCalendarId,
  taskPriorityMenuId,
  editingTaskTimeId,
  editTaskTimeValue,
  editingMainTask,
  editMainTaskTitle,
  calendarSubtaskId,
  editingSubtask,
  editSubtaskTitle,
  addingSubtaskToTask,
  newSubtaskTitle,
  showCompletedSubtasks,
  expandedSubtasks,
  clientMap,
  sortSubtasks,
  onToggleTaskStatus,
  onToggleExpansion,
  onTaskCalendarToggle,
  onTaskCalendarSelect,
  onTaskPrioritySelect,
  onTaskTimeStartEditing,
  onTaskTimeSave,
  onTaskTimeKeyDown,
  onTaskTimeChange,
  onMoveTask,
  onTimerToggle,
  onToggleSubtaskVisibility,
  onDeleteTask,
  onMainTaskStartEditing,
  onMainTaskEditTitleChange,
  onMainTaskSaveEdit,
  onMainTaskKeyDown,
  onToggleSubtaskStatus,
  onToggleSubtaskExpansion,
  onSubtaskStartEditing,
  onSubtaskEditTitleChange,
  onSubtaskSaveEdit,
  onSubtaskKeyDown,
  onCalendarToggle,
  onDeleteSubtask,
  onUpdateSubtaskPriority,
  onUpdateSubtaskEstimatedTime,
  onUpdateSubtaskDescription,
  onStartAddingSubtask,
  onNewSubtaskTitleChange,
  onSaveNewSubtask,
  onNewSubtaskKeyDown,
  formatMsAsClock,
  getTaskTimeSummary,
  themeName = 'DEEP',
  workType,
}: UnifiedTaskCardProps) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority?.toLowerCase()] || TASK_PRIORITY_CONFIG['medium'];

  const formatShortDate = (dateString?: string | null) => {
    if (!dateString) return '--/--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--/--';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const getDueDateClasses = (dateString?: string | null) => {
    if (!dateString) {
      return `${theme.colors.textMuted} ${theme.colors.bg}/20 hover:${theme.colors.bg}/30`;
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return `${theme.colors.textMuted} ${theme.colors.bg}/20 hover:${theme.colors.bg}/30`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) {
      return 'text-yellow-300 bg-yellow-900/30 hover:bg-yellow-900/40';
    }

    if (target < today) {
      return 'text-red-300 bg-red-900/30 hover:bg-red-900/40';
    }

    return `${theme.colors.text} ${theme.colors.bg}/30 hover:${theme.colors.bg}/40`;
  };

  const summary = getTaskTimeSummary?.(task);
  const elapsedMs = task.elapsedMs ?? 0;
  const formattedTime = formatMsAsClock?.(elapsedMs) ?? '0:00';

  const subtasksToShow = sortSubtasks
    ? sortSubtasks(
        task.subtasks.filter((subtask) => {
          const shouldShowCompleted = showCompletedSubtasks[task.id];
          if (shouldShowCompleted === undefined) return subtask.status !== "completed";
          return shouldShowCompleted ? subtask.status === "completed" : subtask.status !== "completed";
        })
      )
    : task.subtasks.filter((subtask) => {
        const shouldShowCompleted = showCompletedSubtasks[task.id];
        if (shouldShowCompleted === undefined) return subtask.status !== "completed";
        return shouldShowCompleted ? subtask.status === "completed" : subtask.status !== "completed";
      });

  return (
    <motion.li
      key={task.id}
      className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
      initial="hidden"
      animate="visible"
      variants={taskVariants}
    >
      {/* Task Container */}
      <div className={`group ${theme.colors.bg} ${theme.colors.border} ${theme.colors.bgHover} ${theme.colors.borderHover} hover:shadow-${themeName === 'LIGHT' ? 'green' : themeName === 'AMBER' ? 'amber' : 'blue'}-500/5 rounded-xl transition-all duration-300 hover:shadow-lg`}>
        {/* Task Header */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <motion.div
              className="flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTaskStatus(task.id);
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={task.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : task.status === "in-progress" ? (
                    <CircleDotDashed className={`h-5 w-5 ${theme.icons.inProgress}`} />
                  ) : task.status === "need-help" ? (
                    <CircleAlert className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Circle className={`h-5 w-5 ${theme.icons.checkbox}`} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              {editingMainTask === task.id ? (
                <input
                  type="text"
                  value={editMainTaskTitle}
                  onChange={(e) => onMainTaskEditTitleChange(e.target.value)}
                  onKeyDown={(e) => onMainTaskKeyDown(e, task.id)}
                  onBlur={() => onMainTaskSaveEdit(task.id)}
                  className={`w-full ${theme.colors.inputBg} ${theme.colors.text} font-semibold text-sm sm:text-base px-2 py-1 rounded border ${theme.colors.inputBorder} ${theme.colors.inputFocusBorder} focus:outline-none`}
                  autoFocus
                />
              ) : (
                <h4
                  className={`${theme.colors.text} hover:${theme.colors.textSecondary} font-semibold text-sm sm:text-base cursor-pointer transition-colors break-words`}
                  onClick={() => {
                    // Could open detail sheet here if needed
                  }}
                >
                  {task.title}
                </h4>
              )}
            </div>

            {/* Toggle Button */}
            <div className="flex items-center flex-shrink-0">
              <motion.button
                className={`p-1 rounded-md ${theme.colors.bg}/20 transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpansion(task.id);
                }}
                whileTap={{ scale: 0.9 }}
              >
                {isExpanded ? (
                  <ChevronDown className={`h-4 w-4 ${theme.colors.textSecondary}`} />
                ) : (
                  <ChevronRight className={`h-4 w-4 ${theme.colors.textSecondary}`} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Top divider */}
          <div className={`${theme.colors.divider} mt-3`}></div>

          <div className="pt-3">
            {/* Single-row metadata: Date | Priority | Time | Timer | Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskCalendarToggle(task.id);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${getDueDateClasses(task.dueDate)}`}
                title="Schedule this task"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatShortDate(task.dueDate)}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskPrioritySelect(task.id, task.priority as any);
                  onTaskCalendarToggle('');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${priorityConfig.badgeClass}`}
                title="Adjust priority"
              >
                <span>{priorityConfig.icon}</span>
                <span>{priorityConfig.label}</span>
              </button>

              {/* Work Type Badge */}
              {workType && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  workType === 'light'
                    ? 'bg-green-900/30 text-green-300 border border-green-700/40'
                    : 'bg-blue-900/30 text-blue-300 border border-blue-700/40'
                }`}>
                  {workType === 'light' ? 'Light' : 'Deep'}
                </span>
              )}

              {/* Client Badge (Deep Work only) */}
              {task.clientId && clientMap && clientMap.has(task.clientId) && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-900/20 text-purple-200 border border-purple-700/40"
                  title={`Linked to ${clientMap.get(task.clientId)}`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] break-words">{clientMap.get(task.clientId)}</span>
                </div>
              )}

              {/* Time Estimate */}
              {editingTaskTimeId === task.id ? (
                <input
                  type="text"
                  value={editTaskTimeValue}
                  onChange={(e) => onTaskTimeChange(e.target.value)}
                  onKeyDown={(e) => onTaskTimeKeyDown(e, task.id)}
                  onBlur={() => onTaskTimeSave(task.id)}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${theme.colors.inputBg} border ${theme.colors.inputBorder} ${theme.colors.text} ${theme.colors.inputFocusBorder} focus:outline-none`}
                  placeholder="e.g. 2h"
                  autoFocus
                />
              ) : summary && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskTimeStartEditing(task, summary.formatted);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${theme.colors.textMuted}/90 ${theme.colors.bg}/20 transition-colors`}
                  title="Set total focus time"
                >
                  <Timer className="h-3.5 w-3.5" />
                  <span>{summary.formatted}</span>
                </button>
              )}

              {/* Timer Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTimerToggle(task.id);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                  task.activeTimer?.taskId === task.id
                    ? `${theme.colors.timerActiveBg} ${theme.colors.timerActiveText} border ${theme.colors.timerActiveBorder} hover:${theme.colors.timerActiveBg}/40`
                    : `${theme.colors.timerBg} ${theme.colors.timerText} border ${theme.colors.timerBorder} hover:${theme.colors.bg}/30`
                }`}
                title="Start or stop timer"
              >
                <Timer className="h-3.5 w-3.5" />
                <span>{task.activeTimer?.taskId === task.id ? 'Stop' : 'Start'} • {formattedTime}</span>
              </button>

              {/* Reorder Arrows - Inline */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveTask(task.id, 'up');
                  }}
                  disabled={isFirst}
                  className={`p-1 rounded-md border ${theme.colors.inputBorder} ${theme.colors.textSecondary} transition-colors ${
                    isFirst ? 'opacity-40 cursor-not-allowed' : theme.colors.priorityHover
                  }`}
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveTask(task.id, 'down');
                  }}
                  disabled={isLast}
                  className={`p-1 rounded-md border ${theme.colors.inputBorder} ${theme.colors.textSecondary} transition-colors ${
                    isLast ? 'opacity-40 cursor-not-allowed' : theme.colors.priorityHover
                  }`}
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar Popup */}
            {activeTaskCalendarId === task.id && (
              <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                <CustomCalendar
                  theme={themeName}
                  subtask={{ dueDate: task.dueDate }}
                  onDateSelect={(date) => onTaskCalendarSelect(task.id, date)}
                  onClose={() => onTaskCalendarToggle('')}
                />
              </div>
            )}

            {/* Priority Menu */}
            <AnimatePresence>
              {taskPriorityMenuId === task.id && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9998] bg-black/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskPrioritySelect(task.id, task.priority as any);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] backdrop-blur-xl ${theme.colors.priorityMenuBg} border ${theme.colors.priorityMenuBorder} rounded-xl shadow-2xl shadow-black/60 p-3 min-w-[200px]`}
                  >
                    {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => {
                      const isActive = task.priority?.toLowerCase() === key;
                      return (
                        <motion.button
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskPrioritySelect(task.id, key as 'low' | 'medium' | 'high' | 'urgent');
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            isActive ? theme.colors.priorityActive : theme.colors.priorityInactive
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </span>
                          {isActive && <CheckCircle2 className={`h-4 w-4 ${theme.colors.textSecondary}`} />}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className={`${theme.colors.divider} mt-3`}></div>
        </div>

        {/* Subtasks */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              className="relative overflow-hidden"
              variants={subtaskListVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layout
            >
              {task.subtasks.length > 0 && (
                <ul className="mt-1 mr-2 mb-2 ml-2 space-y-1">
                  {subtasksToShow.map((subtask) => (
                    <motion.li
                      key={subtask.id}
                      className="pl-1"
                      variants={subtaskVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                    >
                      <SubtaskItem
                        subtask={{
                          id: subtask.id,
                          title: subtask.title,
                          completed: subtask.completed,
                          dueDate: subtask.dueDate,
                          description: subtask.description,
                          priority: subtask.priority,
                          estimatedTime: subtask.estimatedTime,
                          tools: subtask.tools,
                          subtasks: subtask.subtasks // Pass nested sub-subtasks
                        }}
                        taskId={task.id}
                        themeConfig={{
                          colors: {
                            text: theme.colors.textSecondary,
                            border: themeName === 'LIGHT' ? 'border-green-400' : themeName === 'AMBER' ? 'border-amber-400' : 'border-blue-400',
                            input: 'border-gray-600 focus:border-' + (themeName === 'LIGHT' ? 'green' : themeName === 'AMBER' ? 'amber' : 'blue') + '-400',
                            textSecondary: theme.colors.textSecondary,
                          }
                        }}
                        isEditing={editingSubtask === subtask.id}
                        editTitle={editSubtaskTitle}
                        calendarSubtaskId={calendarSubtaskId}
                        depth={0}
                        isExpanded={expandedSubtasks[`${task.id}-${subtask.id}`] || false}
                        onToggleCompletion={(_taskId, subtaskId, _depth) => onToggleSubtaskStatus(task.id, subtaskId)}
                        onToggleExpansion={(_taskId, subtaskId) => onToggleSubtaskExpansion(task.id, subtaskId)}
                        onStartEditing={(subtaskId, currentTitle, _depth) => onSubtaskStartEditing(subtaskId, currentTitle)}
                        onEditTitleChange={(title) => onSubtaskEditTitleChange(title)}
                        onSaveEdit={(_taskId, subtaskId, _depth) => onSubtaskSaveEdit(task.id, subtaskId)}
                        onKeyDown={(e, type, _taskId, subtaskId, _depth) => onSubtaskKeyDown(e, type, task.id, subtaskId)}
                        onCalendarToggle={(subtaskId) => onCalendarToggle(subtaskId)}
                        onDeleteSubtask={(subtaskId, _depth) => onDeleteSubtask(subtaskId)}
                        onPriorityChange={(subtaskId, priority, _depth) => onUpdateSubtaskPriority(subtaskId, priority)}
                        onEstimatedTimeChange={(subtaskId, time, _depth) => onUpdateSubtaskEstimatedTime(subtaskId, time)}
                      >
                        {/* Calendar popup */}
                        {calendarSubtaskId === subtask.id && (
                          <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                            <CustomCalendar
                              theme={themeName}
                              subtask={subtask}
                              onDateSelect={async (date) => {
                                try {
                                  await onTaskCalendarSelect(task.id, date);
                                  onCalendarToggle('');
                                } catch (error) {
                                  console.error('Failed to update due date:', error);
                                }
                              }}
                              onClose={() => onCalendarToggle('')}
                            />
                          </div>
                        )}
                      </SubtaskItem>
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* Add Subtask Button */}
              <div className="px-3 pb-2 mt-2">
                {addingSubtaskToTask === task.id ? (
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => onNewSubtaskTitleChange(e.target.value)}
                    onKeyDown={(e) => onNewSubtaskKeyDown(e, task.id)}
                    onBlur={() => onSaveNewSubtask(task.id)}
                    placeholder="Enter subtask title..."
                    className={`w-full ${theme.colors.inputBg} ${theme.colors.text} border ${theme.colors.inputBorder} ${theme.colors.inputFocusBorder} text-xs px-3 py-2 rounded border focus:outline-none`}
                    autoFocus
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full ${theme.colors.buttonBg} transition-all duration-200 text-xs border`}
                    onClick={() => onStartAddingSubtask(task.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Subtask
                  </Button>
                )}
              </div>

              {/* Bottom divider */}
              <div className={`${theme.colors.divider} mt-3`}></div>

              {/* Progress Summary */}
              <div className="mt-3 pb-2 px-3">
                <div className="flex items-center justify-between">
                  <div></div>
                  <button
                    className={`text-xs ${theme.colors.textSecondary} hover:${theme.colors.text} cursor-pointer transition-colors`}
                    onClick={() => onToggleSubtaskVisibility(task.id)}
                    title="Toggle completed subtasks visibility"
                  >
                    {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
                  </button>
                  <button
                    className={`${theme.colors.deleteButton} cursor-pointer transition-colors text-lg font-bold leading-none`}
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete Task"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Summary when collapsed */}
        {!isExpanded && (
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between">
              <div></div>
              <button
                className={`text-xs ${theme.colors.textSecondary} hover:${theme.colors.text} cursor-pointer transition-colors`}
                onClick={() => onToggleSubtaskVisibility(task.id)}
                title="Toggle completed subtasks visibility"
              >
                {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
              </button>
              <button
                className={`${theme.colors.deleteButton} cursor-pointer transition-colors text-lg font-bold leading-none`}
                onClick={() => onDeleteTask(task.id)}
                title="Delete Task"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.li>
  );
}
