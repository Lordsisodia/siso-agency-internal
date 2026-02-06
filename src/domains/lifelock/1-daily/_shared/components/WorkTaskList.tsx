"use client";

/**
 * 🎯 Unified Work Task List Component
 *
 * Consolidated component for both Light Work and Deep Work task management.
 * Accepts theme configuration and work-type-specific props.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Brain, Plus, Info, X, ListTodo, Clock, Trophy, Grid3X3, List, Columns3 } from "lucide-react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { UnifiedTaskCard, LIGHT_THEME, DEEP_THEME, ThemeConfig, UnifiedTask } from "./UnifiedTaskCard";
import { useDeepWorkTimers, formatMsAsClock } from "@/domains/lifelock/1-daily/4-deep-work/hooks/useDeepWorkTimers";
import { ListTaskItem } from "./ListTaskItem";
import { KanbanBoard } from "./kanban";
import { TaskDetailModal } from "@/domains/lifelock/_shared/components/ui/TaskDetailModal";

// Stub for missing sortSubtasksHybrid function
const sortSubtasksHybrid = (subtasks: any[]) => subtasks;

// View mode type
export type ViewMode = 'card' | 'list' | 'kanban';

// Types
export type WorkType = 'light' | 'deep';

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  subtasks: WorkSubtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
  dueDate?: string | null;
  timeEstimate?: string | null;
  actualDurationMin?: number;
  clientId?: string;
}

export interface WorkSubtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string;
  tools?: string[];
  completed: boolean;
  dueDate?: string;
}

export interface FlowProtocolConfig {
  title: string;
  subtitle: string;
  description: string;
  rules: string[];
}

export interface WorkTaskListProps {
  workType: WorkType;
  tasks: WorkTask[];
  loading: boolean;
  error: string | null;
  selectedDate?: Date;
  flowProtocol: FlowProtocolConfig;
  theme: ThemeConfig;
  themeName: 'LIGHT' | 'DEEP';
  baseSubtaskMinutes: number;
  // Optional: for deep work client badges
  clientMap?: Map<string, string>;
  // Gamification
  onAwardTaskCompletion?: (task: any) => void;
  // Task operations
  onToggleTaskCompletion: (taskId: string) => Promise<any>;
  onToggleSubtaskCompletion: (taskId: string, subtaskId: string) => Promise<void>;
  onCreateTask: (task: Partial<WorkTask>) => Promise<any>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onUpdateSubtaskDueDate: (subtaskId: string, date: string | null) => Promise<void>;
  onUpdateSubtaskTitle: (subtaskId: string, title: string) => Promise<void>;
  onUpdateSubtaskPriority: (subtaskId: string, priority: string) => Promise<void>;
  onUpdateSubtaskEstimatedTime: (subtaskId: string, time: string) => Promise<void>;
  onUpdateSubtaskDescription: (subtaskId: string, description: string) => Promise<void>;
  onUpdateTaskTitle: (taskId: string, title: string) => Promise<boolean>;
  onUpdateTaskDueDate: (taskId: string, date: string | null) => Promise<void>;
  onUpdateTaskPriority: (taskId: string, priority: string) => Promise<void>;
  onUpdateTaskTimeEstimate: (taskId: string, estimate: string | null) => Promise<void>;
  onPushTaskToAnotherDay?: (taskId: string, date: string) => Promise<void>;
  onUpdateTaskActualDuration?: (taskId: string, durationMin: number | null) => Promise<void>;
  // Optional callbacks
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  // Kanban specific
  onUpdateTaskStatus?: (taskId: string, status: string) => Promise<void>;
}

// Convert WorkTask to UnifiedTask
function taskToUnified(
  task: WorkTask,
  activeTimer?: { taskId: string } | null,
  elapsedMs?: number
): UnifiedTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    subtasks: task.subtasks,
    focusIntensity: task.focusIntensity,
    dueDate: task.dueDate,
    timeEstimate: task.timeEstimate,
    clientId: task.clientId,
    activeTimer,
    elapsedMs,
  };
}

export function WorkTaskList({
  workType,
  tasks,
  loading,
  error,
  selectedDate = new Date(),
  flowProtocol,
  theme,
  themeName,
  baseSubtaskMinutes,
  clientMap,
  onAwardTaskCompletion,
  onToggleTaskCompletion,
  onToggleSubtaskCompletion,
  onCreateTask,
  onAddSubtask,
  onDeleteTask,
  onDeleteSubtask,
  onUpdateSubtaskDueDate,
  onUpdateSubtaskTitle,
  onUpdateSubtaskPriority,
  onUpdateSubtaskEstimatedTime,
  onUpdateSubtaskDescription,
  onUpdateTaskTitle,
  onUpdateTaskDueDate,
  onUpdateTaskPriority,
  onUpdateTaskTimeEstimate,
  onPushTaskToAnotherDay,
  onUpdateTaskActualDuration,
  onStartFocusSession,
  onUpdateTaskStatus,
}: WorkTaskListProps) {
  const dateKey = useMemo(
    () => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    [selectedDate]
  );

  // State
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{ [key: string]: boolean }>({});
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);
  const [activeTaskCalendarId, setActiveTaskCalendarId] = useState<string | null>(null);
  const [taskPriorityMenuId, setTaskPriorityMenuId] = useState<string | null>(null);
  const [editingTaskTimeId, setEditingTaskTimeId] = useState<string | null>(null);
  const [editTaskTimeValue, setEditTaskTimeValue] = useState('');
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editingMainTask, setEditingMainTask] = useState<string | null>(null);
  const [editMainTaskTitle, setEditMainTaskTitle] = useState('');
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{ [taskId: string]: boolean }>({});
  const [isProtocolExpanded, setIsProtocolExpanded] = useState(false);

  // View mode state (persisted to localStorage)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(`${workType}work-viewMode`);
    return (saved as ViewMode) || 'card';
  });

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Persist view mode preference
  React.useEffect(() => {
    localStorage.setItem(`${workType}work-viewMode`, viewMode);
  }, [viewMode, workType]);

  // Handle task click to open detail modal
  const handleTaskClick = (task: WorkTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle task update from modal
  const handleTaskUpdate = async (updatedTask: any) => {
    // Update task title if changed
    if (updatedTask.title !== selectedTask?.title) {
      await onUpdateTaskTitle(updatedTask.id, updatedTask.title);
    }
    // Update task description if changed
    if (updatedTask.description !== selectedTask?.description) {
      await onUpdateSubtaskDescription(updatedTask.id, updatedTask.description);
    }
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Task order (persisted to localStorage)
  const [taskOrder, setTaskOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${workType}work-${dateKey}-taskOrder`);
    return saved ? JSON.parse(saved) : [];
  });

  // Timer functionality
  const { activeTimer, start, stop, getElapsedMsForTask } = useDeepWorkTimers(dateKey);

  const handleTimerToggle = (taskId: string) => {
    if (activeTimer?.taskId === taskId) {
      stop(taskId);
    } else {
      start(taskId);
    }
  };

  // Auto-expand first 3 tasks on initial load
  const isInitialExpansionSet = React.useRef(false);
  React.useEffect(() => {
    if (!isInitialExpansionSet.current && tasks.length > 0) {
      setExpandedTasks(tasks.slice(0, 3).map(task => task.id));
      isInitialExpansionSet.current = true;
    }
  }, [tasks]);

  // Animation variants
  const taskVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      }
    },
  };

  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
      height: "auto",
      opacity: 1,
      overflow: "visible",
      transition: {
        duration: 0.25,
        staggerChildren: 0.05,
        when: "beforeChildren",
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      }
    },
  };

  // Handlers
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    const previousTask = tasks.find(task => task.id === taskId);
    const wasCompleted = previousTask?.status === 'completed';

    try {
      const updatedTask = await onToggleTaskCompletion(taskId);
      if (updatedTask && !wasCompleted && onAwardTaskCompletion) {
        onAwardTaskCompletion(updatedTask);
      }

      // Auto-populate actualDurationMin from timer when task is completed
      // Only if actualDurationMin is empty (don't overwrite user input)
      if (updatedTask && !wasCompleted && onUpdateTaskActualDuration) {
        const hasNoActualDuration = !previousTask?.actualDurationMin;
        const timerWasRunning = activeTimer?.taskId === taskId;

        if (hasNoActualDuration) {
          // Get elapsed time from timer service (includes both active and completed sessions)
          const elapsedMs = getElapsedMsForTask(taskId);

          if (elapsedMs > 0) {
            // Convert to minutes and round to nearest 5
            const elapsedMinutes = Math.round(elapsedMs / 60000);
            const roundedMinutes = Math.round(elapsedMinutes / 5) * 5;

            if (roundedMinutes > 0) {
              await onUpdateTaskActualDuration(taskId, roundedMinutes);
            }
          }
        }

        // Stop the timer if it was running for this task
        if (timerWasRunning) {
          stop(taskId);
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleToggleSubtaskStatus = async (taskId: string, subtaskId: string) => {
    try {
      await onToggleSubtaskCompletion(taskId, subtaskId);
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
    }
  };

  const handleTaskCalendarToggle = (taskId: string) => {
    setActiveTaskCalendarId(prev => (prev === taskId ? null : taskId));
    setCalendarSubtaskId(null);
    setTaskPriorityMenuId(null);
    setEditingTaskTimeId(null);
  };

  const handleTaskCalendarSelect = async (taskId: string, date: Date | null) => {
    try {
      const dateString = date ? date.toISOString().split('T')[0] : null;
      if (dateString && onPushTaskToAnotherDay) {
        await onPushTaskToAnotherDay(taskId, dateString);
      } else if (dateString) {
        await onUpdateTaskDueDate(taskId, dateString);
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    } finally {
      setActiveTaskCalendarId(null);
    }
  };

  const handleTaskPrioritySelect = async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      await onUpdateTaskPriority(taskId, priority.toUpperCase());
      setTaskPriorityMenuId(null);
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const handleTaskTimeStartEditing = (task: any, fallbackLabel: string) => {
    setEditingTaskTimeId(task.id);
    setEditTaskTimeValue(task.timeEstimate || fallbackLabel);
    setActiveTaskCalendarId(null);
    setTaskPriorityMenuId(null);
  };

  const handleTaskTimeSave = async (taskId: string) => {
    try {
      const trimmed = editTaskTimeValue.trim();
      await onUpdateTaskTimeEstimate(taskId, trimmed ? trimmed : null);
    } catch (error) {
      console.error('Error updating task time estimate:', error);
    }
    setEditingTaskTimeId(null);
    setEditTaskTimeValue('');
  };

  const handleTaskTimeKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTaskTimeSave(taskId);
    } else if (event.key === 'Escape') {
      setEditingTaskTimeId(null);
      setEditTaskTimeValue('');
    }
  };

  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
    setTaskOrder(prevOrder => {
      const baseOrder = prevOrder.length ? [...prevOrder] : tasks.map(task => task.id);
      const index = baseOrder.indexOf(taskId);

      if (index === -1) return baseOrder;

      if (direction === 'up') {
        if (index === 0) return baseOrder;
        [baseOrder[index - 1], baseOrder[index]] = [baseOrder[index], baseOrder[index - 1]];
      } else {
        if (index === baseOrder.length - 1) return baseOrder;
        [baseOrder[index + 1], baseOrder[index]] = [baseOrder[index], baseOrder[index + 1]];
      }

      return baseOrder;
    });
  };

  const handleSubtaskStartEditing = (subtaskId: string, currentTitle: string) => {
    setEditingSubtask(subtaskId);
    setEditSubtaskTitle(currentTitle);
  };

  const handleSubtaskEditTitleChange = (title: string) => {
    setEditSubtaskTitle(title);
  };

  const handleSubtaskSaveEdit = async (taskId: string, subtaskId: string) => {
    if (editSubtaskTitle.trim()) {
      try {
        await onUpdateSubtaskTitle(subtaskId, editSubtaskTitle.trim());
      } catch (error) {
        console.error('Failed to update subtask title:', error);
      }
    }
    setEditingSubtask(null);
    setEditSubtaskTitle('');
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent, type: 'subtask', taskId: string, subtaskId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'subtask' && subtaskId) {
        handleSubtaskSaveEdit(taskId, subtaskId);
      }
    } else if (e.key === 'Escape') {
      setEditingSubtask(null);
      setEditSubtaskTitle('');
    }
  };

  const handleCalendarToggle = (subtaskId: string) => {
    setCalendarSubtaskId(prev => prev === subtaskId ? null : subtaskId);
  };

  const handleMainTaskStartEditing = (taskId: string, currentTitle: string) => {
    setEditingMainTask(taskId);
    setEditMainTaskTitle(currentTitle);
  };

  const handleMainTaskEditTitleChange = (value: string) => {
    setEditMainTaskTitle(value);
  };

  const handleMainTaskSaveEdit = async (taskId: string) => {
    if (editMainTaskTitle.trim()) {
      try {
        const success = await onUpdateTaskTitle(taskId, editMainTaskTitle.trim());
        if (success) {
          setEditingMainTask(null);
          setEditMainTaskTitle('');
        }
      } catch (error) {
        console.error('Error updating main task title:', error);
      }
    }
  };

  const handleMainTaskKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleMainTaskSaveEdit(taskId);
    } else if (e.key === 'Escape') {
      setEditingMainTask(null);
      setEditMainTaskTitle('');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await onDeleteSubtask(subtaskId);
  };

  const handleUpdateSubtaskPriority = async (subtaskId: string, priority: string) => {
    try {
      await onUpdateSubtaskPriority(subtaskId, priority);
    } catch (error) {
      console.error('Error updating subtask priority:', error);
    }
  };

  const handleUpdateSubtaskDescription = async (subtaskId: string, description: string) => {
    try {
      await onUpdateSubtaskDescription(subtaskId, description);
    } catch (error) {
      console.error('Error updating subtask description:', error);
    }
  };

  const handleUpdateSubtaskEstimatedTime = async (subtaskId: string, estimatedTime: string) => {
    try {
      await onUpdateSubtaskEstimatedTime(subtaskId, estimatedTime);
    } catch (error) {
      console.error('Error updating subtask estimated time:', error);
    }
  };

  const handleStartAddingSubtask = (taskId: string) => {
    setAddingSubtaskToTask(taskId);
    setNewSubtaskTitle('');
  };

  const handleNewSubtaskTitleChange = (title: string) => {
    setNewSubtaskTitle(title);
  };

  const handleSaveNewSubtask = async (taskId: string) => {
    if (newSubtaskTitle.trim()) {
      try {
        await onAddSubtask(taskId, newSubtaskTitle.trim());
      } catch (error) {
        console.error('Failed to create new subtask:', error);
      }
    }
    setAddingSubtaskToTask(null);
    setNewSubtaskTitle('');
  };

  const handleNewSubtaskKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveNewSubtask(taskId);
    } else if (e.key === 'Escape') {
      setAddingSubtaskToTask(null);
      setNewSubtaskTitle('');
    }
  };

  const toggleSubtaskVisibility = (taskId: string) => {
    setShowCompletedSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Time parsing helpers
  const parseTimeEstimateToMinutes = (value?: string | null): number => {
    if (!value) return 0;
    const normalized = value.toString().toLowerCase();
    let minutes = 0;

    const hourMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/g);
    for (const match of hourMatches) {
      minutes += Math.round(parseFloat(match[1]) * 60);
    }

    const minuteMatches = normalized.matchAll(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/g);
    for (const match of minuteMatches) {
      minutes += Math.round(parseFloat(match[1]));
    }

    if (minutes === 0) {
      const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) {
        minutes = Math.round(parseFloat(numberMatch[1]));
      }
    }

    return minutes;
  };

  const formatMinutes = (totalMinutes: number): string => {
    const rounded = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getTaskTimeSummary = (task: WorkTask) => {
    let totalMinutes = 0;

    task.subtasks
      .filter(subtask => subtask.status !== 'completed')
      .forEach(subtask => {
        const estimateMinutes = parseTimeEstimateToMinutes(subtask.estimatedTime);
        totalMinutes += estimateMinutes > 0 ? estimateMinutes : baseSubtaskMinutes;
      });

    const manualMinutes = parseTimeEstimateToMinutes(task.timeEstimate);

    if (task.subtasks.length === 0) {
      totalMinutes = manualMinutes > 0 ? manualMinutes : baseSubtaskMinutes;
    } else if (manualMinutes > 0) {
      totalMinutes = manualMinutes;
    }

    return {
      totalMinutes,
      formatted: formatMinutes(totalMinutes)
    };
  };

  // Order and filter tasks
  let displayTasks = tasks;
  if (taskOrder.length > 0) {
    const orderMap = new Map(taskOrder.map((id, index) => [id, index]));
    displayTasks = [...tasks].sort((a, b) => {
      const aIndex = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const bIndex = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }
  const activeTasks = displayTasks.filter(task => task.status !== "completed");
  const completedTasks = displayTasks.filter(task => task.status === "completed");

  // Calculate progress stats
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const totalEstimatedMinutes = activeTasks.reduce((sum, task) => sum + getTaskTimeSummary(task).totalMinutes, 0);

  // Load task order from localStorage when date changes
  React.useEffect(() => {
    const saved = localStorage.getItem(`${workType}work-${dateKey}-taskOrder`);
    if (saved) {
      setTaskOrder(JSON.parse(saved));
    } else {
      setTaskOrder([]);
    }
  }, [dateKey, workType]);

  // Sync task order with current tasks
  React.useEffect(() => {
    setTaskOrder(prevOrder => {
      const currentTaskIds = tasks.map(task => task.id);
      const validOrder = prevOrder.filter(id => currentTaskIds.includes(id));
      const newTasks = currentTaskIds.filter(id => !prevOrder.includes(id));
      return [...validOrder, ...newTasks];
    });
  }, [tasks]);

  // Save task order to localStorage
  React.useEffect(() => {
    if (taskOrder.length > 0) {
      localStorage.setItem(`${workType}work-${dateKey}-taskOrder`, JSON.stringify(taskOrder));
    }
  }, [taskOrder, dateKey, workType]);

  // Theme color classes aligned with Morning Routine / Nightly Checkout patterns
  const themeColors = themeName === 'LIGHT' ? {
    // Light work (green) theme
    cardBg: 'bg-green-900/20 border-green-700/40',
    iconBg: 'bg-white/5',
    iconBorder: 'border-green-400/30',
    iconColor: 'text-green-400',
    titleColor: 'text-white',
    subtitleColor: 'text-green-300',
    textColor: 'text-green-200',
    textMuted: 'text-green-400/60',
    statCardBg: 'bg-green-900/20',
    statCardBorder: 'border-green-700/30',
    statValueColor: 'text-green-300',
    statLabelColor: 'text-green-400',
    buttonClass: 'text-green-300 hover:text-green-200 hover:bg-green-900/20 border-green-700/30 hover:border-green-600/40',
    accentColor: 'text-green-400',
  } : {
    // Deep work (blue) theme
    cardBg: 'bg-blue-900/20 border-blue-700/40',
    iconBg: 'bg-white/5',
    iconBorder: 'border-blue-400/30',
    iconColor: 'text-blue-400',
    titleColor: 'text-white',
    subtitleColor: 'text-blue-300',
    textColor: 'text-blue-200',
    textMuted: 'text-blue-400/60',
    statCardBg: 'bg-blue-900/20',
    statCardBorder: 'border-blue-700/30',
    statValueColor: 'text-blue-300',
    statLabelColor: 'text-blue-400',
    buttonClass: 'text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40',
    accentColor: 'text-blue-400',
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${themeName === 'LIGHT' ? 'text-green-50' : 'text-blue-50'} min-h-screen w-full relative overflow-x-hidden`}>
        <div className="w-full max-w-none p-4 sm:p-6 space-y-4">
          {/* Header Skeleton */}
          <div className="px-3 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className={`h-10 w-10 rounded-lg ${themeName === 'LIGHT' ? 'bg-green-500/30' : 'bg-blue-500/30'}`} />
                <div className="space-y-2">
                  <Skeleton className={`h-5 w-40 ${themeName === 'LIGHT' ? 'bg-green-400/20' : 'bg-blue-400/20'}`} />
                  <Skeleton className={`h-3 w-24 ${themeName === 'LIGHT' ? 'bg-green-400/20' : 'bg-blue-400/20'}`} />
                </div>
              </div>
            </div>
          </div>
          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className={`h-16 ${themeName === 'LIGHT' ? 'bg-green-400/20' : 'bg-blue-400/20'} rounded-lg`} />
            <Skeleton className={`h-16 ${themeName === 'LIGHT' ? 'bg-green-400/20' : 'bg-blue-400/20'} rounded-lg`} />
            <Skeleton className={`h-16 ${themeName === 'LIGHT' ? 'bg-green-400/20' : 'bg-blue-400/20'} rounded-lg`} />
          </div>
          {/* Task Cards Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className={`h-20 w-full ${themeName === 'LIGHT' ? 'bg-green-900/20' : 'bg-blue-900/20'} rounded-xl`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <div className={`${themeName === 'LIGHT' ? 'text-green-50' : 'text-blue-50'} min-h-screen w-full relative overflow-x-hidden`}>
        <div className="w-full max-w-none p-4 sm:p-6 space-y-4">
          <div className="px-3 py-4 border-b border-white/10 text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-sm text-gray-200 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className={themeName === 'LIGHT' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeName === 'LIGHT' ? 'text-green-50' : 'text-blue-50'} min-h-screen w-full relative overflow-x-hidden`}>
      <div className="w-full max-w-none p-4 sm:p-6 space-y-4">
        {/* Page Header - Title, Icon, Subtext - Morning Routine style */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Icon Container - Morning Routine style */}
              <div className={`p-1.5 rounded-lg ${themeColors.iconBg} border ${themeColors.iconBorder} flex items-center justify-center flex-shrink-0`}>
                <Brain className={`h-4 w-4 ${themeColors.iconColor}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className={`text-lg font-semibold ${themeColors.titleColor} tracking-tight truncate`}>
                  {flowProtocol.title}
                </h1>
                <p className={`text-xs ${themeColors.textMuted}`}>
                  {totalTasks > 0 ? `${completedCount}/${totalTasks} completed` : 'No tasks'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View Mode Toggle - Clean Segmented Control */}
              <div className={`flex items-center rounded-lg border ${themeColors.iconBorder} overflow-hidden`}>
                <button
                  onClick={() => setViewMode('card')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                    viewMode === 'card'
                      ? `${themeColors.iconBg} ${themeColors.iconColor}`
                      : `hover:${themeColors.iconBg} ${themeColors.textMuted}`
                  )}
                  title="Card View"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <div className={`w-px h-4 ${themeColors.iconBorder.replace('border-', 'bg-').replace('/30', '/20')}`} />
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                    viewMode === 'list'
                      ? `${themeColors.iconBg} ${themeColors.iconColor}`
                      : `hover:${themeColors.iconBg} ${themeColors.textMuted}`
                  )}
                  title="List View"
                >
                  <Columns3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <div className={`w-px h-4 ${themeColors.iconBorder.replace('border-', 'bg-').replace('/30', '/20')}`} />
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                    viewMode === 'kanban'
                      ? `${themeColors.iconBg} ${themeColors.iconColor}`
                      : `hover:${themeColors.iconBg} ${themeColors.textMuted}`
                  )}
                  title="Kanban View"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Kanban</span>
                </button>
              </div>

              {/* Protocol Toggle Button */}
              <motion.button
                onClick={() => setIsProtocolExpanded(!isProtocolExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg border ${themeColors.iconBorder} ${themeColors.iconColor} hover:${themeColors.iconBg} transition-colors`}
                title="Flow State Protocol"
              >
                {isProtocolExpanded ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>

          {/* Bento Grid Stats - Nightly Checkout / Timebox pattern */}
          {totalTasks > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {/* Active Tasks */}
              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ListTodo className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Active</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {activeTasks.length}
                </div>
              </div>

              {/* Completed Tasks */}
              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Done</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {completedCount}
                </div>
              </div>

              {/* Time Remaining */}
              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder} col-span-2 sm:col-span-1`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Time Left</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {formatMinutes(totalEstimatedMinutes)}
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Flow State Protocol */}
          <AnimatePresence>
            {isProtocolExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-gray-900/30 border border-gray-700/40 space-y-3">
                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                    {flowProtocol.description}
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2 text-sm">
                      {flowProtocol.subtitle} Rules
                    </h4>
                    <ul className="text-gray-300 text-xs sm:text-sm space-y-1">
                      {flowProtocol.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{rule.replace('• ', '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Task List - Card, List, or Kanban View */}
        <div className={viewMode === 'kanban' ? 'h-[calc(100vh-280px)]' : 'space-y-3'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
            className={viewMode === 'kanban' ? 'h-full' : ''}
          >
            <LayoutGroup>
              <div className={viewMode === 'kanban' ? 'h-full' : 'overflow-hidden'}>
                <AnimatePresence mode="wait">
                  {viewMode === 'card' ? (
                    <motion.ul
                      key="card-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {activeTasks.map((task, index) => {
                        const isFirst = index === 0;
                        const isLast = index === activeTasks.length - 1;
                        const isExpanded = expandedTasks.includes(task.id);

                        return (
                          <UnifiedTaskCard
                            key={task.id}
                            task={taskToUnified(task, activeTimer, getElapsedMsForTask(task.id))}
                            theme={theme}
                            index={index}
                            isExpanded={isExpanded}
                            isFirst={isFirst}
                            isLast={isLast}
                            taskVariants={taskVariants}
                            subtaskListVariants={subtaskListVariants}
                            subtaskVariants={subtaskVariants}
                            activeTaskCalendarId={activeTaskCalendarId}
                            taskPriorityMenuId={taskPriorityMenuId}
                            editingTaskTimeId={editingTaskTimeId}
                            editTaskTimeValue={editTaskTimeValue}
                            editingMainTask={editingMainTask}
                            editMainTaskTitle={editMainTaskTitle}
                            calendarSubtaskId={calendarSubtaskId}
                            editingSubtask={editingSubtask}
                            editSubtaskTitle={editSubtaskTitle}
                            addingSubtaskToTask={addingSubtaskToTask}
                            newSubtaskTitle={newSubtaskTitle}
                            showCompletedSubtasks={showCompletedSubtasks}
                            clientMap={clientMap}
                            sortSubtasks={sortSubtasksHybrid}
                            onToggleTaskStatus={handleToggleTaskStatus}
                            onToggleExpansion={toggleTaskExpansion}
                            onTaskCalendarToggle={handleTaskCalendarToggle}
                            onTaskCalendarSelect={handleTaskCalendarSelect}
                            onTaskPrioritySelect={handleTaskPrioritySelect}
                            onTaskTimeStartEditing={handleTaskTimeStartEditing}
                            onTaskTimeSave={handleTaskTimeSave}
                            onTaskTimeKeyDown={handleTaskTimeKeyDown}
                            onTaskTimeChange={(value) => setEditTaskTimeValue(value)}
                            onMoveTask={handleMoveTask}
                            onTimerToggle={handleTimerToggle}
                            onToggleSubtaskVisibility={toggleSubtaskVisibility}
                            onDeleteTask={onDeleteTask}
                            onMainTaskStartEditing={handleMainTaskStartEditing}
                            onMainTaskEditTitleChange={handleMainTaskEditTitleChange}
                            onMainTaskSaveEdit={handleMainTaskSaveEdit}
                            onMainTaskKeyDown={handleMainTaskKeyDown}
                            onToggleSubtaskStatus={handleToggleSubtaskStatus}
                            onToggleSubtaskExpansion={toggleSubtaskExpansion}
                            onSubtaskStartEditing={handleSubtaskStartEditing}
                            onSubtaskEditTitleChange={handleSubtaskEditTitleChange}
                            onSubtaskSaveEdit={handleSubtaskSaveEdit}
                            onSubtaskKeyDown={handleSubtaskKeyDown}
                            onCalendarToggle={handleCalendarToggle}
                            onDeleteSubtask={handleDeleteSubtask}
                            onUpdateSubtaskPriority={handleUpdateSubtaskPriority}
                            onUpdateSubtaskEstimatedTime={handleUpdateSubtaskEstimatedTime}
                            onUpdateSubtaskDescription={handleUpdateSubtaskDescription}
                            onStartAddingSubtask={handleStartAddingSubtask}
                            onNewSubtaskTitleChange={handleNewSubtaskTitleChange}
                            onSaveNewSubtask={handleSaveNewSubtask}
                            onNewSubtaskKeyDown={handleNewSubtaskKeyDown}
                            formatMsAsClock={formatMsAsClock}
                            getTaskTimeSummary={getTaskTimeSummary}
                            themeName={themeName}
                          />
                        );
                      })}
                    </motion.ul>
                  ) : viewMode === 'list' ? (
                    <motion.ul
                      key="list-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {activeTasks.map((task, index) => {
                        const isExpanded = expandedTasks.includes(task.id);

                        return (
                          <ListTaskItem
                            key={task.id}
                            task={task}
                            theme={theme}
                            themeName={themeName}
                            index={index}
                            isExpanded={isExpanded}
                            expandedTasks={expandedTasks}
                            taskVariants={taskVariants}
                            subtaskListVariants={subtaskListVariants}
                            subtaskVariants={subtaskVariants}
                            editingMainTask={editingMainTask}
                            editMainTaskTitle={editMainTaskTitle}
                            editingSubtask={editingSubtask}
                            editSubtaskTitle={editSubtaskTitle}
                            addingSubtaskToTask={addingSubtaskToTask}
                            newSubtaskTitle={newSubtaskTitle}
                            showCompletedSubtasks={showCompletedSubtasks}
                            calendarSubtaskId={calendarSubtaskId}
                            activeTaskCalendarId={activeTaskCalendarId}
                            taskPriorityMenuId={taskPriorityMenuId}
                            editingTaskTimeId={editingTaskTimeId}
                            editTaskTimeValue={editTaskTimeValue}
                            clientMap={clientMap}
                            activeTimer={activeTimer}
                            getElapsedMsForTask={getElapsedMsForTask}
                            formatMsAsClock={formatMsAsClock}
                            getTaskTimeSummary={getTaskTimeSummary}
                            onToggleTaskStatus={handleToggleTaskStatus}
                            onToggleExpansion={toggleTaskExpansion}
                            onMainTaskStartEditing={handleMainTaskStartEditing}
                            onMainTaskEditTitleChange={handleMainTaskEditTitleChange}
                            onMainTaskSaveEdit={handleMainTaskSaveEdit}
                            onMainTaskKeyDown={handleMainTaskKeyDown}
                            onToggleSubtaskStatus={handleToggleSubtaskStatus}
                            onSubtaskStartEditing={handleSubtaskStartEditing}
                            onSubtaskEditTitleChange={handleSubtaskEditTitleChange}
                            onSubtaskSaveEdit={handleSubtaskSaveEdit}
                            onSubtaskKeyDown={handleSubtaskKeyDown}
                            onCalendarToggle={handleCalendarToggle}
                            onTaskCalendarToggle={handleTaskCalendarToggle}
                            onTaskCalendarSelect={handleTaskCalendarSelect}
                            onTaskPrioritySelect={handleTaskPrioritySelect}
                            onTaskTimeStartEditing={handleTaskTimeStartEditing}
                            onTaskTimeChange={setEditTaskTimeValue}
                            onTaskTimeSave={handleTaskTimeSave}
                            onTaskTimeKeyDown={handleTaskTimeKeyDown}
                            onDeleteSubtask={handleDeleteSubtask}
                            onUpdateSubtaskPriority={handleUpdateSubtaskPriority}
                            onUpdateSubtaskEstimatedTime={handleUpdateSubtaskEstimatedTime}
                            onUpdateSubtaskDescription={handleUpdateSubtaskDescription}
                            onStartAddingSubtask={handleStartAddingSubtask}
                            onNewSubtaskTitleChange={handleNewSubtaskTitleChange}
                            onSaveNewSubtask={handleSaveNewSubtask}
                            onNewSubtaskKeyDown={handleNewSubtaskKeyDown}
                            onToggleSubtaskVisibility={toggleSubtaskVisibility}
                            onToggleSubtaskExpansion={toggleSubtaskExpansion}
                            onDeleteTask={onDeleteTask}
                            onTimerToggle={handleTimerToggle}
                            sortSubtasks={sortSubtasksHybrid}
                          />
                        );
                      })}
                    </motion.ul>
                  ) : (
                    <motion.div
                      key="kanban-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <KanbanBoard
                        tasks={tasks}
                        themeName={themeName}
                        workType={workType}
                        onToggleTaskStatus={handleToggleTaskStatus}
                        onToggleExpansion={toggleTaskExpansion}
                        onUpdateTaskStatus={onUpdateTaskStatus}
                        onTaskClick={handleTaskClick}
                        expandedTasks={expandedTasks}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add Task Button - Hidden in Kanban view */}
                {viewMode !== 'kanban' && (
                  <div className="mt-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full ${themeColors.buttonClass} transition-all duration-200 text-sm border`}
                      onClick={async () => {
                        try {
                          const newTask = await onCreateTask({
                            title: `New ${workType === 'light' ? 'Light' : 'Deep'} Work Task`,
                            priority: 'HIGH'
                          });
                          if (newTask) {
                            setTimeout(() => {
                              setEditingMainTask(newTask.id);
                              setEditMainTaskTitle(newTask.title);
                            }, 100);
                          }
                        } catch (error) {
                          console.error('Error creating new task:', error);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                )}
              </div>
            </LayoutGroup>
          </motion.div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask ? {
          id: selectedTask.id,
          title: selectedTask.title,
          description: selectedTask.description,
          status: selectedTask.status,
          priority: selectedTask.priority,
          level: 1,
          dependencies: [],
          subtasks: selectedTask.subtasks.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            status: s.status,
            priority: s.priority,
            estimatedTime: s.estimatedTime,
            tools: s.tools,
            completed: s.completed,
            dueDate: s.dueDate,
          })),
          focusIntensity: selectedTask.focusIntensity,
          context: workType,
          dueDate: selectedTask.dueDate || undefined,
        } : null}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleTaskUpdate}
        onStartFocusSession={onStartFocusSession}
      />
    </div>
  );
}

export default WorkTaskList;
