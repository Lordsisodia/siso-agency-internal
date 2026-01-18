"use client";

/**
 * 📅 Today Tasks List - Unified View
 *
 * Shows BOTH Light Work and Deep Work tasks that are due today
 * Reuses the exact same UI components from Light Work
 * Filters tasks where:
 * - Main task's task_date = today, OR
 * - Any subtask's due_date = today
 */

import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  Calendar,
  Timer,
  Play,
  Pause,
  Brain,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { TaskSeparator } from "@/domains/lifelock/1-daily/2-tasks/components-from-root/TaskSeparator";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SimpleFeedbackButton } from "@/domains/feedback/SimpleFeedbackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetailModal } from "@/domains/lifelock/components/TaskDetailModal";
import { TaskDetailSheet } from "@/domains/lifelock/_shared/components/ui/TaskDetailSheet";
import { CustomCalendar } from "../../../_shared/components";
import { SubtaskItem } from "@/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem";
import { useLightWorkTasksSupabase, LightWorkTask, LightWorkSubtask } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { useDeepWorkTasksSupabase, DeepWorkTask, DeepWorkSubtask } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
import { sortSubtasksHybrid } from "@/domains/lifelock/1-daily/_shared/utils/subtaskSorting";
import { GamificationService } from "@/domains/lifelock/_shared/services/gamificationService";
import { getLightWorkPriorityMultiplier } from "@/domains/lifelock/1-daily/_shared/utils/taskXpCalculations";
import { useGamificationInit } from '@/domains/lifelock/_shared/hooks/useGamificationInit';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Type definitions - unified for both work types
interface UnifiedSubtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedTime?: string;
  tools?: string[];
  completed: boolean;
  dueDate?: string;
  workType: 'light' | 'deep';
  taskId: string;
}

interface UnifiedTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: UnifiedSubtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
  context?: string;
  dueDate?: string | null;
  deadline?: string | null;
  timeEstimate?: string | null;
  actualDurationMin?: number;
  workType: 'light' | 'deep';
}

interface TodayTasksListProps {
  selectedDate?: Date;
  onStartFocusSession?: (taskId: string, intensity: number) => void;
}

// Transform Light Work task
function transformLightWorkTask(task: LightWorkTask): UnifiedTask {
  return {
    id: `light-${task.id}`,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || 'MEDIUM').toLowerCase(),
    level: 0,
    dependencies: [],
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    context: "coding",
    dueDate: task.currentDate || task.createdAt,
    deadline: task.dueDate || null,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
    workType: 'light',
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      taskId: task.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate,
      workType: 'light' as const
    }))
  };
}

// Transform Deep Work task
function transformDeepWorkTask(task: DeepWorkTask): UnifiedTask {
  return {
    id: `deep-${task.id}`,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || 'MEDIUM').toLowerCase(),
    level: 0,
    dependencies: [],
    focusIntensity: (task.focusBlocks || 4) as 1 | 2 | 3 | 4,
    context: "deep-work",
    dueDate: task.taskDate || task.originalDate,
    deadline: task.dueDate || null,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
    workType: 'deep',
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      taskId: task.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate,
      workType: 'deep' as const
    }))
  };
}

export default function TodayTasksList({ onStartFocusSession, selectedDate = new Date() }: TodayTasksListProps) {
  const navigate = useNavigate();

  // Initialize gamification system for XP tracking
  useGamificationInit();

  // Get today's date string for comparison (using local time, not UTC)
  const getLocalDate = () => {
    const date = selectedDate || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    console.log('🔍 [TodayTasksList] getLocalDate():', {
      selectedDate: selectedDate?.toISOString(),
      dateObject: date,
      year,
      month,
      day,
      result: dateStr
    });
    return dateStr;
  };
  const todayDate = getLocalDate();

  // Helper function to normalize date strings for comparison
  const normalizeDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    // Extract just the date part (YYYY-MM-DD) from any datetime string
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : null;
  };

  // Load both Light Work and Deep Work tasks
  const {
    tasks: rawLightTasks,
    loading: lightLoading,
    error: lightError,
    toggleTaskCompletion: toggleLightTaskCompletion,
    toggleSubtaskCompletion: toggleLightSubtaskCompletion,
    createTask: createLightTask,
    addSubtask: addLightSubtask,
    deleteTask: deleteLightTask,
    deleteSubtask: deleteLightSubtask,
    updateSubtaskDueDate: updateLightSubtaskDueDate,
    updateSubtaskTitle: updateLightSubtaskTitle,
    updateSubtaskPriority: updateLightSubtaskPriority,
    updateSubtaskEstimatedTime: updateLightSubtaskEstimatedTime,
    updateSubtaskDescription: updateLightSubtaskDescription,
    updateTaskTitle: updateLightTaskTitle,
    updateTaskDueDate: updateLightTaskDueDate,
    updateTaskPriority: updateLightTaskPriority,
    updateTaskTimeEstimate: updateLightTaskTimeEstimate,
    pushTaskToAnotherDay: pushLightTaskToAnotherDay
  } = useLightWorkTasksSupabase({ selectedDate });

  const {
    tasks: rawDeepTasks,
    loading: deepLoading,
    error: deepError,
    toggleTaskCompletion: toggleDeepTaskCompletion,
    toggleSubtaskCompletion: toggleDeepSubtaskCompletion,
    createTask: createDeepTask,
    addSubtask: addDeepSubtask,
    deleteTask: deleteDeepTask,
    deleteSubtask: deleteDeepSubtask,
    updateSubtaskDueDate: updateDeepSubtaskDueDate,
    updateSubtaskTitle: updateDeepSubtaskTitle,
    updateSubtaskPriority: updateDeepSubtaskPriority,
    updateSubtaskEstimatedTime: updateDeepSubtaskEstimatedTime,
    updateSubtaskDescription: updateDeepSubtaskDescription,
    updateTaskTitle: updateDeepTaskTitle,
    updateTaskDueDate: updateDeepTaskDueDate,
    updateTaskPriority: updateDeepTaskPriority,
    updateTaskTimeEstimate: updateDeepTaskTimeEstimate,
    pushTaskToAnotherDay: pushDeepTaskToAnotherDay
  } = useDeepWorkTasksSupabase({ selectedDate });

  // Transform and filter tasks for today
  const tasks = useMemo(() => {
    const allTasks: UnifiedTask[] = [];

    // Debug logging to track filtering
    console.log('🔍 [TodayTasksList] Filtering for today:', {
      todayDate,
      rawLightTasksCount: rawLightTasks.length,
      rawDeepTasksCount: rawDeepTasks.length
    });

    // Process Light Work tasks
    rawLightTasks.forEach(task => {
      // Skip completed tasks
      if (task.completed) return;

      const transformed = transformLightWorkTask(task);
      // Include if task is scheduled for today OR any subtask is due today
      const normalizedCurrentDate = normalizeDate(task.currentDate);
      const normalizedTaskDate = normalizeDate(task.taskDate);
      const taskScheduledToday = normalizedCurrentDate === todayDate || normalizedTaskDate === todayDate;
      const hasSubtaskDueToday = task.subtasks.some(sub =>
        sub.dueDate && normalizeDate(sub.dueDate) === todayDate
      );

      // Debug: Log first few tasks
      if (allTasks.length < 5) {
        console.log('🔍 [TodayTasksList] Light task:', {
          title: task.title,
          completed: task.completed,
          currentDate: task.currentDate,
          taskDate: task.taskDate,
          normalizedCurrentDate,
          normalizedTaskDate,
          taskScheduledToday,
          hasSubtaskDueToday,
          comparison: `normalizedCurrentDate (${normalizedCurrentDate}) === todayDate (${todayDate}): ${normalizedCurrentDate === todayDate}`
        });
      }

      if (taskScheduledToday || hasSubtaskDueToday) {
        allTasks.push(transformed);
      }
    });

    // Process Deep Work tasks
    rawDeepTasks.forEach(task => {
      // Skip completed tasks
      if (task.completed) return;

      const transformed = transformDeepWorkTask(task);
      // Include if task is scheduled for today OR any subtask is due today
      const normalizedCurrentDate = normalizeDate(task.currentDate);
      const normalizedTaskDate = normalizeDate(task.taskDate);
      const taskScheduledToday = normalizedCurrentDate === todayDate || normalizedTaskDate === todayDate;
      const hasSubtaskDueToday = task.subtasks.some(sub =>
        sub.dueDate && normalizeDate(sub.dueDate) === todayDate
      );

      // Debug: Log first few tasks
      if (allTasks.length < 3) {
        console.log('🔍 [TodayTasksList] Deep task:', {
          title: task.title,
          completed: task.completed,
          currentDate: task.currentDate,
          taskDate: task.taskDate,
          normalizedCurrentDate,
          normalizedTaskDate,
          taskScheduledToday,
          hasSubtaskDueToday
        });
      }

      if (taskScheduledToday || hasSubtaskDueToday) {
        allTasks.push(transformed);
      }
    });

    console.log('✅ [TodayTasksList] Filtered tasks:', allTasks.length);

    // Sort: Deep work first, then by priority
    return allTasks.sort((a, b) => {
      if (a.workType !== b.workType) {
        return a.workType === 'deep' ? -1 : 1;
      }
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      return aPriority - bPriority;
    });
  }, [rawLightTasks, rawDeepTasks, todayDate]);

  const loading = lightLoading || deepLoading;
  const hasTasks = tasks.length > 0;

  // State management
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);
  const [activeTaskCalendarId, setActiveTaskCalendarId] = useState<string | null>(null);
  const [taskPriorityMenuId, setTaskPriorityMenuId] = useState<string | null>(null);
  const [editingTaskTimeId, setEditingTaskTimeId] = useState<string | null>(null);
  const [editTaskTimeValue, setEditTaskTimeValue] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editingMainTask, setEditingMainTask] = useState<string | null>(null);
  const [editMainTaskTitle, setEditMainTaskTitle] = useState('');
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{[taskId: string]: boolean}>({});

  // New task creation state
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'light' | 'deep'>('light');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  const isInitialExpansionSet = React.useRef(false);

  React.useEffect(() => {
    if (!isInitialExpansionSet.current && tasks.length > 0) {
      setExpandedTasks(tasks.slice(0, 3).map(task => task.id));
      isInitialExpansionSet.current = true;
    }
  }, [tasks]);

  // Theme config for SubtaskItem - SLATE for Today view
  const themeConfig = {
    colors: {
      text: 'text-slate-400',
      border: 'border-slate-700',
      input: 'border-gray-600 focus:border-slate-500',
      textSecondary: 'text-slate-300'
    }
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
    const [workType, originalId] = taskId.split('-');
    try {
      if (workType === 'light') {
        await toggleLightTaskCompletion(originalId);
      } else {
        await toggleDeepTaskCompletion(originalId);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleToggleSubtaskStatus = async (taskId: string, subtaskId: string) => {
    const [workType, originalTaskId] = taskId.split('-');
    try {
      if (workType === 'light') {
        await toggleLightSubtaskCompletion(originalTaskId, subtaskId);
      } else {
        await toggleDeepSubtaskCompletion(originalTaskId, subtaskId);
      }
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
    }
  };

  // ... (rest of the handlers - similar to LightWorkTaskList but with unified logic)

  const TASK_PRIORITY_CONFIG: Record<string, { icon: string; label: string; badgeClass: string }> = {
    low: { icon: '🟢', label: 'Low', badgeClass: 'text-green-200 bg-green-900/30 hover:bg-green-900/40' },
    medium: { icon: '🟡', label: 'Medium', badgeClass: 'text-yellow-200 bg-yellow-900/30 hover:bg-yellow-900/40' },
    high: { icon: '🔴', label: 'High', badgeClass: 'text-red-200 bg-red-900/30 hover:bg-red-900/40' },
    urgent: { icon: '🚨', label: 'Urgent', badgeClass: 'text-purple-200 bg-purple-900/30 hover:bg-purple-900/40' }
  };

  const getPriorityConfig = (priority: string) => {
    const normalized = priority?.toLowerCase() || 'medium';
    return TASK_PRIORITY_CONFIG[normalized] || TASK_PRIORITY_CONFIG['medium'];
  };

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
      return 'text-slate-200/80 bg-slate-900/20 hover:bg-slate-900/30';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'text-slate-200/80 bg-slate-900/20 hover:bg-slate-900/30';
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

    return 'text-slate-200 bg-slate-900/30 hover:bg-slate-900/40';
  };

  // Helper: Schedule first available task for today (for testing)
  const scheduleFirstTaskForToday = async () => {
    // Try Light Work tasks first
    if (rawLightTasks.length > 0) {
      const firstTask = rawLightTasks[0];
      await pushLightTaskToAnotherDay(firstTask.id, todayDate);
      return;
    }
    // Try Deep Work tasks
    if (rawDeepTasks.length > 0) {
      const firstTask = rawDeepTasks[0];
      await pushDeepTaskToAnotherDay(firstTask.id, todayDate);
      return;
    }
  };

  // Handler for creating new tasks
  const handleCreateNewTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      if (newTaskType === 'light') {
        await createLightTask({
          title: newTaskTitle.trim(),
          description: '',
          priority: newTaskPriority,
          completed: false,
          currentDate: todayDate,
          createdAt: new Date().toISOString(),
          focusBlocks: 2
        });
      } else {
        await createDeepTask({
          title: newTaskTitle.trim(),
          description: '',
          priority: newTaskPriority,
          completed: false,
          taskDate: todayDate,
          originalDate: todayDate,
          createdAt: new Date().toISOString(),
          focusBlocks: 4
        });
      }

      // Reset form
      setNewTaskTitle('');
      setNewTaskType('light');
      setNewTaskPriority('MEDIUM');
      setIsAddingNewTask(false);
    } catch (error) {
      console.error('Error creating new task:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-slate-50 h-full">
        <Card className="bg-slate-900/20 border-slate-700/50">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full bg-slate-500/30" />
                <Skeleton className="h-5 w-40 bg-slate-400/20" />
              </div>
              <Skeleton className="h-4 w-16 bg-slate-400/20" />
            </div>
            <Skeleton className="h-2 w-full bg-slate-400/20 rounded-full" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-slate-50 h-full">
      <Card className="bg-slate-900/20 border-slate-700/50">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-slate-300 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Today's Tasks
            </CardTitle>
            {tasks.length === 0 && (rawLightTasks.length > 0 || rawDeepTasks.length > 0) && (
              <button
                onClick={scheduleFirstTaskForToday}
                className="px-3 py-1 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Test: Schedule First Task
              </button>
            )}
          </div>
          <div className="border-t border-slate-600/50 my-4"></div>
          <div className="text-slate-300 text-sm">
            {tasks.length === 0
              ? 'No tasks scheduled for today.'
              : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} scheduled for today`
            }
          </div>
          <div className="border-t border-slate-600/50 my-3 sm:my-4"></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }
            }}
          >
            <LayoutGroup>
              <div className="overflow-hidden">
                <ul className="space-y-1 overflow-hidden">
                  {tasks.map((task, index) => {
                    const isExpanded = expandedTasks.includes(task.id);
                    const isCompleted = task.status === "completed";
                    const priorityConfig = getPriorityConfig(task.priority);

                    return (
                      <motion.li
                        key={task.id}
                        className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="group bg-slate-900/10 border-slate-700/30 hover:bg-slate-900/15 hover:border-slate-600/40 hover:shadow-slate-500/5 rounded-xl transition-all duration-300 hover:shadow-lg">
                          <div className="p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <motion.div
                                className="flex-shrink-0 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTaskStatus(task.id);
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
                                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    ) : task.status === "in-progress" ? (
                                      <CircleDotDashed className="h-5 w-5 text-slate-400" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-400" />
                                    )}
                                  </motion.div>
                                </AnimatePresence>
                              </motion.div>

                              {/* Title */}
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={cn(
                                    "text-sm sm:text-base font-semibold truncate",
                                    isCompleted ? "text-slate-400/60 line-through" : "text-slate-100"
                                  )}
                                >
                                  {task.title}
                                </h4>
                              </div>

                              {/* Work Type Badge */}
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                task.workType === 'deep'
                                  ? "bg-purple-500/20 border border-purple-500/40 text-purple-200"
                                  : "bg-green-500/20 border border-green-500/40 text-green-200"
                              )}>
                                {task.workType === 'deep' ? 'Deep' : 'Light'}
                              </span>

                              {/* Toggle Button */}
                              <div className="flex items-center flex-shrink-0">
                                <motion.button
                                  className="p-1 rounded-md hover:bg-slate-900/20 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskExpansion(task.id);
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-slate-300" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            {/* Top divider */}
                            <div className="border-t border-slate-600/50 mt-3"></div>

                            <div className="pt-3">
                              {/* Metadata: Date | Priority | Time */}
                              <div className="flex items-center gap-2">
                                <button
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${getDueDateClasses(task.dueDate)}`}
                                  title="Scheduled date"
                                >
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{formatShortDate(task.dueDate)}</span>
                                </button>

                                <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${priorityConfig.badgeClass}`}>
                                  <span>{priorityConfig.icon}</span>
                                  <span>{priorityConfig.label}</span>
                                </span>

                                {task.timeEstimate && (
                                  <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-200/90 bg-slate-900/20 transition-colors">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{task.timeEstimate}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="border-t border-slate-600/50 mt-3"></div>
                          </div>

                          {/* Subtasks */}
                          <AnimatePresence mode="wait">
                            {isExpanded && (
                              <motion.div
                                className="relative overflow-hidden"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                {task.subtasks.length > 0 && (
                                  <ul className="mt-1 mr-2 mb-2 ml-2 space-y-1">
                                    {task.subtasks
                                      .filter((subtask) => {
                                        const shouldShowCompleted = showCompletedSubtasks[task.id];
                                        if (shouldShowCompleted === undefined) return subtask.status !== "completed";
                                        return shouldShowCompleted ? subtask.status === "completed" : subtask.status !== "completed";
                                      })
                                      .map((subtask) => (
                                        <motion.li
                                          key={subtask.id}
                                          className="pl-1"
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.2 }}
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
                                            themeConfig={themeConfig}
                                            isEditing={editingSubtask === subtask.id}
                                            editTitle={editSubtaskTitle}
                                            calendarSubtaskId={calendarSubtaskId}
                                            isExpanded={expandedSubtasks[`${task.id}-${subtask.id}`] || false}
                                            onToggleCompletion={handleToggleSubtaskStatus}
                                            onToggleExpansion={toggleSubtaskExpansion}
                                            onStartEditing={(subtaskId, currentTitle) => {
                                              setEditingSubtask(subtaskId);
                                              setEditSubtaskTitle(currentTitle);
                                            }}
                                            onEditTitleChange={(title) => setEditSubtaskTitle(title)}
                                            onSaveEdit={(taskId, subtaskId) => {
                                              // Handle save
                                              setEditingSubtask(null);
                                              setEditSubtaskTitle('');
                                            }}
                                            onKeyDown={(e, type, taskId, subtaskId) => {
                                              if (e.key === 'Enter') {
                                                setEditingSubtask(null);
                                                setEditSubtaskTitle('');
                                              }
                                            }}
                                            onCalendarToggle={(subtaskId) => {
                                              setCalendarSubtaskId(prev => prev === subtaskId ? null : subtaskId);
                                            }}
                                            onDeleteSubtask={(subtaskId) => {
                                              // Handle delete
                                            }}
                                            onPriorityUpdate={(subtaskId, priority) => {
                                              // Handle priority update
                                            }}
                                            onEstimatedTimeUpdate={(subtaskId, time) => {
                                              // Handle time update
                                            }}
                                            onDescriptionUpdate={(subtaskId, desc) => {
                                              // Handle description update
                                            }}
                                          />
                                        </motion.li>
                                      ))}
                                  </ul>
                                )}

                                {/* Progress Summary */}
                                <div className="mt-3 pb-2 px-3">
                                  <div className="flex items-center justify-between">
                                    <div></div>
                                    <button
                                      className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer transition-colors"
                                      onClick={() => {
                                        setShowCompletedSubtasks(prev => ({
                                          ...prev,
                                          [task.id]: !prev[task.id]
                                        }));
                                      }}
                                      title="Toggle completed subtasks visibility"
                                    >
                                      {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
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
                                  className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setShowCompletedSubtasks(prev => ({
                                      ...prev,
                                      [task.id]: !prev[task.id]
                                    }));
                                  }}
                                  title="Toggle completed subtasks visibility"
                                >
                                  {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </LayoutGroup>
          </motion.div>

          {/* Add Task Button or Form */}
          <div className="mt-4 px-4">
            {!isAddingNewTask ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-300 hover:text-slate-200 hover:bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 text-sm border"
                onClick={() => setIsAddingNewTask(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task for Today
              </Button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewTask();
                    } else if (e.key === 'Escape') {
                      setIsAddingNewTask(false);
                      setNewTaskTitle('');
                    }
                  }}
                  placeholder="Enter task title..."
                  className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  autoFocus
                />

                {/* Task Type and Priority Selection */}
                <div className="flex items-center gap-2">
                  {/* Work Type Selector */}
                  <div className="flex items-center gap-1 bg-slate-800/30 rounded-lg p-1 border border-slate-600/30">
                    <button
                      onClick={() => setNewTaskType('light')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        newTaskType === 'light'
                          ? 'bg-green-600/30 text-green-200 border border-green-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setNewTaskType('deep')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        newTaskType === 'deep'
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                      }`}
                    >
                      Deep
                    </button>
                  </div>

                  {/* Priority Selector */}
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-slate-500"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent</option>
                  </select>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={handleCreateNewTask}
                      disabled={!newTaskTitle.trim()}
                      className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingNewTask(false);
                        setNewTaskTitle('');
                      }}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 rounded-lg transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Button - Hidden for now */}
      {/* <div className="mt-4">
        <SimpleFeedbackButton variant="bar" className="w-full" />
      </div> */}
    </div>
  );
}
