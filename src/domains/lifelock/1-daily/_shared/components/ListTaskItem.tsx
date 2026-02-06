"use client";

/**
 * List Task Item Component
 *
 * Compact list view for tasks with expand/collapse functionality.
 * Used by WorkTaskList when in list view mode.
 */

import React from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  ChevronDown,
  ChevronRight,
  Calendar,
  Timer,
  Plus,
  Building2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SubtaskItem } from "@/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem";
import { CustomCalendar } from "../components";
import { ThemeConfig, WorkTask, WorkSubtask } from "./WorkTaskList";

const TASK_PRIORITY_CONFIG: Record<string, { icon: string; label: string; badgeClass: string; shortLabel: string }> = {
  low: { icon: "🟢", label: "Low", shortLabel: "Low", badgeClass: "text-green-200 bg-green-900/20 hover:bg-green-900/30" },
  medium: { icon: "🟡", label: "Medium", shortLabel: "Med", badgeClass: "text-yellow-200 bg-yellow-900/20 hover:bg-yellow-900/30" },
  high: { icon: "🔴", label: "High", shortLabel: "High", badgeClass: "text-red-200 bg-red-900/20 hover:bg-red-900/30" },
  urgent: { icon: "🚨", label: "Urgent", shortLabel: "Urgent", badgeClass: "text-purple-200 bg-purple-900/20 hover:bg-purple-900/30" }
};

interface ListTaskItemProps {
  task: WorkTask;
  theme: ThemeConfig;
  themeName: 'LIGHT' | 'DEEP';
  index: number;
  isExpanded: boolean;
  expandedTasks: string[];
  taskVariants: any;
  subtaskListVariants: any;
  subtaskVariants: any;
  editingMainTask: string | null;
  editMainTaskTitle: string;
  editingSubtask: string | null;
  editSubtaskTitle: string;
  addingSubtaskToTask: string | null;
  newSubtaskTitle: string;
  showCompletedSubtasks: { [taskId: string]: boolean };
  calendarSubtaskId: string | null;
  activeTaskCalendarId: string | null;
  taskPriorityMenuId: string | null;
  editingTaskTimeId: string | null;
  editTaskTimeValue: string;
  clientMap?: Map<string, string>;
  activeTimer?: { taskId: string } | null;
  getElapsedMsForTask: (taskId: string) => number;
  formatMsAsClock: (ms: number) => string;
  getTaskTimeSummary?: (task: WorkTask) => { totalMinutes: number; formatted: string };
  sortSubtasks?: (subtasks: WorkSubtask[]) => WorkSubtask[];
  // Handlers
  onToggleTaskStatus: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onMainTaskStartEditing: (taskId: string, currentTitle: string) => void;
  onMainTaskEditTitleChange: (value: string) => void;
  onMainTaskSaveEdit: (taskId: string) => void;
  onMainTaskKeyDown: (e: React.KeyboardEvent, taskId: string) => void;
  onToggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  onSubtaskStartEditing: (subtaskId: string, currentTitle: string) => void;
  onSubtaskEditTitleChange: (title: string) => void;
  onSubtaskSaveEdit: (taskId: string, subtaskId: string) => void;
  onSubtaskKeyDown: (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => void;
  onCalendarToggle: (subtaskId: string) => void;
  onTaskCalendarToggle: (taskId: string) => void;
  onTaskCalendarSelect: (taskId: string, date: Date | null) => void;
  onTaskPrioritySelect: (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onTaskTimeStartEditing: (task: WorkTask, fallbackLabel: string) => void;
  onTaskTimeChange: (value: string) => void;
  onTaskTimeSave: (taskId: string) => void;
  onTaskTimeKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, taskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onUpdateSubtaskPriority: (subtaskId: string, priority: string) => void;
  onUpdateSubtaskEstimatedTime: (subtaskId: string, estimatedTime: string) => void;
  onUpdateSubtaskDescription: (subtaskId: string, description: string) => void;
  onStartAddingSubtask: (taskId: string) => void;
  onNewSubtaskTitleChange: (title: string) => void;
  onSaveNewSubtask: (taskId: string) => void;
  onNewSubtaskKeyDown: (e: React.KeyboardEvent, taskId: string) => void;
  onToggleSubtaskVisibility: (taskId: string) => void;
  onToggleSubtaskExpansion: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTimerToggle: (taskId: string) => void;
}

export function ListTaskItem({
  task,
  theme,
  themeName,
  index,
  isExpanded,
  taskVariants,
  subtaskListVariants,
  subtaskVariants,
  editingMainTask,
  editMainTaskTitle,
  editingSubtask,
  editSubtaskTitle,
  addingSubtaskToTask,
  newSubtaskTitle,
  showCompletedSubtasks,
  calendarSubtaskId,
  activeTaskCalendarId,
  taskPriorityMenuId,
  editingTaskTimeId,
  editTaskTimeValue,
  clientMap,
  activeTimer,
  getElapsedMsForTask,
  formatMsAsClock,
  getTaskTimeSummary,
  sortSubtasks,
  onToggleTaskStatus,
  onToggleExpansion,
  onMainTaskStartEditing,
  onMainTaskEditTitleChange,
  onMainTaskSaveEdit,
  onMainTaskKeyDown,
  onToggleSubtaskStatus,
  onSubtaskStartEditing,
  onSubtaskEditTitleChange,
  onSubtaskSaveEdit,
  onSubtaskKeyDown,
  onCalendarToggle,
  onTaskCalendarToggle,
  onTaskCalendarSelect,
  onTaskPrioritySelect,
  onTaskTimeStartEditing,
  onTaskTimeChange,
  onTaskTimeSave,
  onTaskTimeKeyDown,
  onDeleteSubtask,
  onUpdateSubtaskPriority,
  onUpdateSubtaskEstimatedTime,
  onUpdateSubtaskDescription,
  onStartAddingSubtask,
  onNewSubtaskTitleChange,
  onSaveNewSubtask,
  onNewSubtaskKeyDown,
  onToggleSubtaskVisibility,
  onToggleSubtaskExpansion,
  onDeleteTask,
  onTimerToggle,
}: ListTaskItemProps) {
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
  const elapsedMs = getElapsedMsForTask(task.id);
  const formattedTime = formatMsAsClock(elapsedMs);

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

  const isFirst = index === 0;
  const isLast = false;

  return (
    <motion.li
      key={task.id}
      className={`${index !== 0 ? "mt-1" : ""}`}
      initial="hidden"
      animate="visible"
      variants={taskVariants}
    >
      {/* Compact List Item Container */}
      <div className={`group ${theme.colors.bg} ${theme.colors.border} ${theme.colors.bgHover} ${theme.colors.borderHover} rounded-lg transition-all duration-200 hover:shadow-md`}>
        {/* Main Row - Always Visible */}
        <div className="px-3 py-2">
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
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : task.status === "in-progress" ? (
                    <CircleDotDashed className={`h-4 w-4 ${themeName === 'LIGHT' ? 'text-green-400' : 'text-blue-400'}`} />
                  ) : task.status === "need-help" ? (
                    <CircleAlert className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Circle className={`h-4 w-4 ${theme.colors.textMuted}`} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Title - Truncated */}
            <div className="flex-1 min-w-0">
              {editingMainTask === task.id ? (
                <input
                  type="text"
                  value={editMainTaskTitle}
                  onChange={(e) => onMainTaskEditTitleChange(e.target.value)}
                  onKeyDown={(e) => onMainTaskKeyDown(e, task.id)}
                  onBlur={() => onMainTaskSaveEdit(task.id)}
                  className={`w-full ${theme.colors.inputBg} ${theme.colors.text} font-medium text-sm px-2 py-0.5 rounded border ${theme.colors.inputBorder} ${theme.colors.inputFocusBorder} focus:outline-none`}
                  autoFocus
                />
              ) : (
                <h4
                  className={`${theme.colors.text} hover:${theme.colors.textSecondary} font-medium text-sm cursor-pointer transition-colors truncate`}
                  onClick={() => onMainTaskStartEditing(task.id, task.title)}
                  title={task.title}
                >
                  {task.title}
                </h4>
              )}
            </div>

            {/* Compact Metadata Row */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Due Date - Compact */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskCalendarToggle(task.id);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${getDueDateClasses(task.dueDate)}`}
                title={`Due: ${task.dueDate ? formatShortDate(task.dueDate) : 'Not set'}`}
              >
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">{formatShortDate(task.dueDate)}</span>
              </button>

              {/* Priority Badge - Compact */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskPrioritySelect(task.id, task.priority as any);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${priorityConfig.badgeClass}`}
                title={`Priority: ${priorityConfig.label}`}
              >
                <span className="hidden sm:inline">{priorityConfig.icon}</span>
                <span>{priorityConfig.shortLabel}</span>
              </button>

              {/* Timer Button - Compact */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTimerToggle(task.id);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border transition-colors ${
                  activeTimer?.taskId === task.id
                    ? `${theme.colors.timerActiveBg} ${theme.colors.timerActiveText} ${theme.colors.timerActiveBorder}`
                    : `${theme.colors.timerBg} ${theme.colors.timerText} ${theme.colors.timerBorder}`
                }`}
                title={activeTimer?.taskId === task.id ? 'Stop timer' : 'Start timer'}
              >
                <Timer className="h-3 w-3" />
                <span className="hidden sm:inline">{formattedTime}</span>
              </button>

              {/* Expand/Collapse Toggle */}
              <motion.button
                className={`p-1 rounded-md ${theme.colors.bg}/20 transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpansion(task.id);
                }}
                whileTap={{ scale: 0.9 }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className={`h-4 w-4 ${theme.colors.textSecondary}`} />
                ) : (
                  <ChevronRight className={`h-4 w-4 ${theme.colors.textSecondary}`} />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
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
              {/* Divider */}
              <div className={`${theme.colors.divider} mx-3`}></div>

              {/* Expanded Metadata Row */}
              <div className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
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
                      <span>Est: {summary.formatted}</span>
                    </button>
                  )}

                  {/* Client Badge */}
                  {task.clientId && clientMap && clientMap.has(task.clientId) && (
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-900/20 text-purple-200 border border-purple-700/40"
                      title={`Linked to ${clientMap.get(task.clientId)}`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="max-w-[100px] truncate">{clientMap.get(task.clientId)}</span>
                    </div>
                  )}

                  {/* Subtask Count */}
                  {task.subtasks.length > 0 && (
                    <button
                      className={`text-xs ${theme.colors.textSecondary} hover:${theme.colors.text} cursor-pointer transition-colors`}
                      onClick={() => onToggleSubtaskVisibility(task.id)}
                      title="Toggle completed subtasks"
                    >
                      {task.subtasks.filter(s => s.status === "completed").length} / {task.subtasks.length} subtasks
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    className={`${theme.colors.deleteButton} cursor-pointer transition-colors text-lg font-bold leading-none ml-auto`}
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete Task"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                <>
                  <div className={`${theme.colors.divider} mx-3`}></div>
                  <ul className="px-3 pb-2 space-y-1">
                    {subtasksToShow.map((subtask) => (
                      <motion.li
                        key={subtask.id}
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
                            tools: subtask.tools
                          }}
                          taskId={task.id}
                          themeConfig={{
                            colors: {
                              text: theme.colors.textSecondary,
                              border: themeName === 'LIGHT' ? 'border-green-400' : 'border-blue-400',
                              input: 'border-gray-600 focus:border-' + (themeName === 'LIGHT' ? 'green' : 'blue') + '-400',
                              textSecondary: theme.colors.textSecondary,
                            }
                          }}
                          isEditing={editingSubtask === subtask.id}
                          editTitle={editSubtaskTitle}
                          calendarSubtaskId={calendarSubtaskId}
                          isExpanded={false}
                          onToggleCompletion={() => onToggleSubtaskStatus(task.id, subtask.id)}
                          onToggleExpansion={() => onToggleSubtaskExpansion(task.id, subtask.id)}
                          onStartEditing={(subtaskId, currentTitle) => onSubtaskStartEditing(subtaskId, currentTitle)}
                          onEditTitleChange={(title) => onSubtaskEditTitleChange(title)}
                          onSaveEdit={(taskId, subtaskId) => onSubtaskSaveEdit(taskId, subtaskId)}
                          onKeyDown={(e, type, taskId, subtaskId) => onSubtaskKeyDown(e, type, taskId, subtaskId)}
                          onCalendarToggle={(subtaskId) => onCalendarToggle(subtaskId)}
                          onDeleteSubtask={(subtaskId) => onDeleteSubtask(subtaskId)}
                          onPriorityUpdate={(subtaskId, priority) => onUpdateSubtaskPriority(subtaskId, priority)}
                          onEstimatedTimeUpdate={(subtaskId, time) => onUpdateSubtaskEstimatedTime(subtaskId, time)}
                          onDescriptionUpdate={(subtaskId, desc) => onUpdateSubtaskDescription(subtaskId, desc)}
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
                </>
              )}

              {/* Add Subtask Button */}
              <div className="px-3 pb-3">
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

              {/* Calendar Popup for Task */}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
