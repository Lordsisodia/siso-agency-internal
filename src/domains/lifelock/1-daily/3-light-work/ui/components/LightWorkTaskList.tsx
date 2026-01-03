"use client";

/**
 * 🌱 Light Work Task List - PIXEL-PERFECT Green Theme
 *
 * Exact copy of siso-deep-focus-plan.tsx with GREEN theme hardcoded
 * Zero modifications to functionality - this is the perfect working version!
 *
 * Source: /components/ui/siso-deep-focus-plan.tsx (light-work variant)
 * ⚠️ DO NOT MODIFY - Pixel-perfect from working version
 */

import React, { useState, useMemo, useCallback } from "react";
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
import { TaskSeparator } from "@/components/tasks/TaskSeparator";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SimpleFeedbackButton } from "@/domains/feedback/SimpleFeedbackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetailModal } from "@/domains/lifelock/components/TaskDetailModal";
import { CustomCalendar } from "../../../_shared/components";
import { SubtaskItem } from "@/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem";
import { useLightWorkTasksSupabase, LightWorkTask, LightWorkSubtask } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { sortSubtasksHybrid } from "@/domains/lifelock/1-daily/_shared/utils/subtaskSorting";
import { GamificationService } from "@/domains/lifelock/_shared/services/gamificationService";
import { getLightWorkPriorityMultiplier } from "@/domains/lifelock/1-daily/_shared/utils/taskXpCalculations";
import { useGamificationInit } from "@/lib/hooks/useGamificationInit";

// Type definitions - exact same as original
interface Subtask {
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

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
  context?: string;
  dueDate?: string | null;
  timeEstimate?: string | null;
}

interface LightWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

// Transform Supabase data - EXACT COPY
function transformSupabaseToUITasks(tasks: LightWorkTask[]): Task[] {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || 'MEDIUM').toLowerCase(),
    level: 0,
    dependencies: [],
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    context: "coding",
    dueDate: task.dueDate || task.currentDate || task.createdAt,
    timeEstimate: task.timeEstimate || null,
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.text || subtask.title,
      status: subtask.completed ? "completed" : "pending",
      priority: subtask.priority || "medium",
      estimatedTime: subtask.estimatedTime,
      tools: [],
      completed: subtask.completed,
      dueDate: subtask.dueDate
    }))
  }));
}

export default function LightWorkTaskList({ onStartFocusSession, selectedDate = new Date() }: LightWorkTaskListProps) {
  // Initialize gamification system for XP tracking
  useGamificationInit();

  // GREEN THEME - Hardcoded from working version
  const theme = {
    title: '🌱 Light Work Tasks',
    subtitle: 'Light Focus Work',
    description: 'Light work sessions require focused attention without deep cognitive load. These blocks are designed for your routine, administrative, and quick-turnaround work that creates steady progress.',
    rules: [
      '• Light interruptions allowed for urgent matters',
      '• Phone on normal mode - check periodically',
      '• Work in 1-2 hour focused blocks',
      '• Quick breaks encouraged between tasks'
    ]
  };

  const awardLightWorkTaskCompletion = useCallback((task: LightWorkTask) => {
    const priorityMultiplier = getLightWorkPriorityMultiplier(task.priority);
    const baseXP = 20;
    const desiredXP = Math.round(baseXP * priorityMultiplier);

    if (desiredXP <= 0) {
      return;
    }

    const multiplier = desiredXP / baseXP;
    const awarded = GamificationService.awardXP('light_task_complete', multiplier);

    if (import.meta.env.DEV) {
      console.debug(
        `[XP] Light work task complete → priority=${task.priority}, multiplier=${multiplier.toFixed(2)}, awarded=${awarded} XP`
      );
    }
  }, []);

  // Use Light Work Supabase hook
  const {
    tasks: rawTasks,
    loading,
    error,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    createTask,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateSubtaskDueDate,
    updateSubtaskTitle,
    updateSubtaskPriority,
    updateSubtaskEstimatedTime,
    updateSubtaskDescription,
    updateTaskTitle,
    updateTaskDueDate,
    updateTaskPriority,
    updateTaskTimeEstimate
  } = useLightWorkTasksSupabase({ selectedDate });

  // Transform data
  const tasks = useMemo(() => transformSupabaseToUITasks(rawTasks), [rawTasks]);
  const hasTasks = tasks.length > 0;

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    return !navigator.onLine;
  });

  // State - EXACT COPY (with dynamic task expansion defaults)
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const isInitialExpansionSet = React.useRef(false);

  React.useEffect(() => {
    if (!isInitialExpansionSet.current && tasks.length > 0) {
      setExpandedTasks(tasks.slice(0, 3).map(task => task.id));
      isInitialExpansionSet.current = true;
    }
  }, [tasks]);

  // Theme config for SubtaskItem - GREEN
  const themeConfig = {
    colors: {
      text: 'text-green-400',
      border: 'border-green-400',
      input: 'border-gray-600 focus:border-green-400',
      textSecondary: 'text-green-300'
    }
  };

  // Reduced motion support
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const hasOpenCalendar = Boolean(calendarSubtaskId || activeTaskCalendarId);
      if (hasOpenCalendar && !(event.target as Element).closest('.calendar-popup')) {
        setCalendarSubtaskId(null);
        setActiveTaskCalendarId(null);
      }
    };
    if (calendarSubtaskId || activeTaskCalendarId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarSubtaskId, activeTaskCalendarId]);

  // Handlers - EXACT COPY

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
    const previousTask = rawTasks.find(task => task.id === taskId);
    const wasCompleted = previousTask?.completed ?? false;

    try {
      const updatedTask = await toggleTaskCompletion(taskId);

      if (updatedTask && !wasCompleted && updatedTask.completed) {
        awardLightWorkTaskCompletion(updatedTask);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleToggleSubtaskStatus = async (taskId: string, subtaskId: string) => {
    try {
      await toggleSubtaskCompletion(taskId, subtaskId);
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
    }
  };

  const startFocusSession = async (taskId: string, subtaskId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        setActiveFocusSession(subtaskId ? `${taskId}-${subtaskId}` : taskId);
        onStartFocusSession?.(taskId, task.focusIntensity || 2);

        if (subtaskId) {
          await handleToggleSubtaskStatus(taskId, subtaskId);
        } else {
          await handleToggleTaskStatus(taskId);
        }
      } catch (error) {
        console.error('Error starting focus session:', error);
        setActiveFocusSession(null);
      }
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const updateTask = (updatedTask: Task) => {
    console.log('Update task:', updatedTask);
  };

  const handleUpdateSubtaskDueDate = async (taskId: string, subtaskId: string, dueDate: Date | null) => {
    try {
      await updateSubtaskDueDate(subtaskId, dueDate);
    } catch (error) {
      console.error('Error updating subtask due date:', error);
      return;
    }
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
        await updateSubtaskTitle(subtaskId, editSubtaskTitle.trim());
        console.log('✅ Subtask title updated successfully');
      } catch (error) {
        console.error('❌ Failed to update subtask title:', error);
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
        const success = await updateTaskTitle(taskId, editMainTaskTitle.trim());
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
    await deleteSubtask(subtaskId);
  };

  const handleUpdateSubtaskPriority = async (subtaskId: string, priority: string) => {
    try {
      await updateSubtaskPriority(subtaskId, priority);
    } catch (error) {
      console.error('Error updating subtask priority:', error);
    }
  };

  const handleUpdateSubtaskDescription = async (subtaskId: string, description: string) => {
    try {
      await updateSubtaskDescription(subtaskId, description);
    } catch (error) {
      console.error('Error updating subtask description:', error);
    }
  };

  const handleUpdateSubtaskEstimatedTime = async (subtaskId: string, estimatedTime: string) => {
    try {
      await updateSubtaskEstimatedTime(subtaskId, estimatedTime);
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
        await addSubtask(taskId, newSubtaskTitle.trim());
        console.log('✅ New subtask created successfully');
      } catch (error) {
        console.error('❌ Failed to create new subtask:', error);
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

  const baseSubtaskMinutes = 30;

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

  const getTaskTimeSummary = (task: Task) => {
    let totalMinutes = 0;

    // ONLY count INCOMPLETE subtasks
    task.subtasks
      .filter(subtask => subtask.status !== 'completed')
      .forEach(subtask => {
        const estimateMinutes = parseTimeEstimateToMinutes(subtask.estimatedTime);
        totalMinutes += estimateMinutes > 0 ? estimateMinutes : baseSubtaskMinutes;
      });

    // Manual override takes precedence
    const manualMinutes = parseTimeEstimateToMinutes(task.timeEstimate);

    if (task.subtasks.length === 0) {
      // No subtasks - use manual or default
      totalMinutes = manualMinutes > 0 ? manualMinutes : baseSubtaskMinutes;
    } else if (manualMinutes > 0) {
      // Has subtasks but user set manual time - use manual
      totalMinutes = manualMinutes;
    }

    return {
      totalMinutes,
      formatted: formatMinutes(totalMinutes)
    };
  };

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
      return 'text-green-200/80 bg-green-900/20 hover:bg-green-900/30';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'text-green-200/80 bg-green-900/20 hover:bg-green-900/30';
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

    return 'text-green-200 bg-green-900/30 hover:bg-green-900/40';
  };

  const handleTaskCalendarToggle = (taskId: string) => {
    setActiveTaskCalendarId(prev => (prev === taskId ? null : taskId));
    setCalendarSubtaskId(null);
    setTaskPriorityMenuId(null);
    setEditingTaskTimeId(null);
  };

  const handleTaskCalendarSelect = async (taskId: string, date: Date | null) => {
    try {
      await updateTaskDueDate(taskId, date);
    } catch (error) {
      console.error('Error updating task due date:', error);
    } finally {
      setActiveTaskCalendarId(null);
    }
  };

  const handleTaskPrioritySelect = async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      await updateTaskPriority(taskId, priority);
      setTaskPriorityMenuId(null);
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const handleTaskTimeStartEditing = (task: Task, fallbackLabel: string) => {
    setEditingTaskTimeId(task.id);
    setEditTaskTimeValue(task.timeEstimate || fallbackLabel);
    setActiveTaskCalendarId(null);
    setTaskPriorityMenuId(null);
  };

  const handleTaskTimeSave = async (taskId: string) => {
    try {
      const trimmed = editTaskTimeValue.trim();
      await updateTaskTimeEstimate(taskId, trimmed ? trimmed : null);
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

  // Animation variants - EXACT COPY
  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: 500,
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined
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
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren",
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: 500,
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
  };

  // Loading state - GREEN THEME
  if (loading) {
    return (
      <div className="text-green-50 h-full">
        <Card className="bg-green-900/20 border-green-700/50">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full bg-green-500/30" />
                <Skeleton className="h-5 w-40 bg-green-400/20" />
              </div>
              <Skeleton className="h-4 w-16 bg-green-400/20" />
            </div>
            <Skeleton className="h-2 w-full bg-green-400/20 rounded-full" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`light-work-skeleton-${index}`}
                className="rounded-xl border border-green-700/50 bg-green-900/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-green-500/20" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36 bg-green-400/20" />
                      <Skeleton className="h-3 w-48 bg-green-400/10" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 bg-green-400/20 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full bg-green-400/10 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - GREEN THEME
  if (error && !hasTasks) {
    return (
      <div className="text-green-50 h-full">
        <Card className="bg-green-900/20 border-green-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-red-400 mb-4">
              <CircleAlert className="h-8 w-8 mx-auto mb-2" />
              Error loading Light Work tasks
            </div>
            <p className="text-sm text-green-200 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-green-50 h-full">
      <Card className="bg-green-900/20 border-green-700/50">
        <CardHeader className="p-3 sm:p-4">
          {(error || isOffline) && (
            <div className="mb-4 rounded-xl border border-green-500/50 bg-green-900/60 px-3 py-3 sm:px-4 sm:py-3">
              <div className="flex flex-col gap-2 text-xs sm:text-sm text-green-100">
                <div className="flex items-start gap-2">
                  <CircleAlert className={`h-5 w-5 flex-shrink-0 ${error ? 'text-red-300' : 'text-green-300'}`} />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {error ? 'We could not sync your Light Work tasks.' : 'Offline mode: working from local data'}
                    </p>
                    <p className="text-green-200 text-xs sm:text-sm">
                      {error
                        ? `${error} — any edits will be saved locally and retried soon.`
                        : 'You are offline. We will keep everything in sync once you are back online.'}
                    </p>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center justify-end">
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Retry sync
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <CardTitle className="flex items-center text-green-400 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {theme.title}
          </CardTitle>
          <div className="border-t border-green-600/50 my-4"></div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">Flow State Protocol</h3>
              <p className="text-green-200 text-xs sm:text-sm leading-relaxed">
                {theme.description}
              </p>
            </div>
            <div className="border-t border-green-600/50 my-4"></div>
            <div>
              <h3 className="font-bold text-green-300 mb-2 text-sm sm:text-base">{theme.subtitle} Rules</h3>
              <ul className="text-green-200 text-xs sm:text-sm space-y-1">
                {theme.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-green-600/50 my-3 sm:my-4"></div>
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
	                const summary = getTaskTimeSummary(task);
	                const priorityConfig = getPriorityConfig(task.priority);
	
	                return (
	                  <motion.li
                    key={task.id}
                    className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    {/* Task Container */}
                    <div className="group bg-green-900/10 border-green-700/30 hover:bg-green-900/15 hover:border-green-600/40 hover:shadow-green-500/5 rounded-xl transition-all duration-300 hover:shadow-lg">
                      {/* Task Header */}
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
                                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                                ) : task.status === "in-progress" ? (
                                  <CircleDotDashed className="h-5 w-5 text-green-400" />
                                ) : task.status === "need-help" ? (
                                  <CircleAlert className="h-5 w-5 text-yellow-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
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
                                onChange={(e) => handleMainTaskEditTitleChange(e.target.value)}
                                onKeyDown={(e) => handleMainTaskKeyDown(e, task.id)}
                                onBlur={() => handleMainTaskSaveEdit(task.id)}
                                className="w-full bg-green-900/40 text-green-100 font-semibold text-sm sm:text-base px-2 py-1 rounded border border-green-600/50 focus:border-green-400 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <h4
                                className="text-green-100 hover:text-green-50 font-semibold text-sm sm:text-base cursor-pointer transition-colors truncate"
                                onClick={() => handleMainTaskStartEditing(task.id, task.title)}
                              >
                                {task.title}
                              </h4>
                            )}
                          </div>

                          {/* Toggle Button */}
                          <div className="flex items-center flex-shrink-0">
                            <motion.button
                              className="p-1 rounded-md hover:bg-green-900/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(task.id);
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-green-300" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-green-300" />
                              )}
                            </motion.button>
                          </div>
                        </div>

	                        {/* Top divider */}
	                        <div className="border-t border-green-600/50 mt-3"></div>
	
	                        <div className="pt-3">
	                          {/* Single-row metadata: Date | Priority | Time */}
	                          <div className="flex items-center gap-2">
	                            <button
	                              onClick={(e) => {
	                                e.stopPropagation();
	                                handleTaskCalendarToggle(task.id);
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
	                                setTaskPriorityMenuId(prev => (prev === task.id ? null : task.id));
	                                setActiveTaskCalendarId(null);
	                                setCalendarSubtaskId(null);
	                                setEditingTaskTimeId(null);
	                              }}
	                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${priorityConfig.badgeClass}`}
	                              title="Adjust priority"
	                            >
	                              <span>{priorityConfig.icon}</span>
	                              <span>{priorityConfig.label}</span>
	                            </button>
	
	                            {editingTaskTimeId === task.id ? (
	                              <input
	                                type="text"
	                                value={editTaskTimeValue}
	                                onChange={(e) => setEditTaskTimeValue(e.target.value)}
	                                onKeyDown={(e) => handleTaskTimeKeyDown(e, task.id)}
	                                onBlur={() => handleTaskTimeSave(task.id)}
	                                autoFocus
	                                className="px-2 py-1 rounded-md text-xs font-medium bg-green-900/40 border border-green-600/60 text-green-100 focus:border-green-300 focus:outline-none"
	                                placeholder="e.g. 2h"
	                              />
	                            ) : (
	                              <button
	                                onClick={(e) => {
	                                  e.stopPropagation();
	                                  handleTaskTimeStartEditing(task, summary.formatted);
	                                }}
	                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-green-200/90 bg-green-900/20 hover:bg-green-900/30 transition-colors"
	                                title="Set total focus time"
	                              >
	                                <Clock className="h-3.5 w-3.5" />
	                                <span>{summary.formatted}</span>
	                              </button>
	                            )}
	                          </div>
	
	                          {activeTaskCalendarId === task.id && (
	                            <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
	                              <CustomCalendar
	                                theme='LIGHT'
	                                subtask={{ dueDate: task.dueDate }}
	                                onDateSelect={(date) => handleTaskCalendarSelect(task.id, date)}
	                                onClose={() => setActiveTaskCalendarId(null)}
	                              />
	                            </div>
	                          )}
	
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
	                                    setTaskPriorityMenuId(null);
	                                  }}
	                                />
	                                <motion.div
	                                  initial={{ opacity: 0, scale: 0.95 }}
	                                  animate={{ opacity: 1, scale: 1 }}
	                                  exit={{ opacity: 0, scale: 0.98 }}
	                                  transition={{ duration: 0.15, ease: [0.2, 0.65, 0.3, 0.9] }}
	                                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] backdrop-blur-xl bg-green-950/95 border border-green-700/60 rounded-xl shadow-2xl shadow-black/60 p-3 min-w-[200px]"
	                                >
	                                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => {
	                                    const isActive = task.priority?.toLowerCase() === key;
	                                    return (
	                                      <motion.button
	                                        key={key}
	                                        onClick={(e) => {
	                                          e.stopPropagation();
	                                          handleTaskPrioritySelect(task.id, key as 'low' | 'medium' | 'high' | 'urgent');
	                                        }}
	                                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
	                                          isActive ? 'bg-green-800/40 text-green-100' : 'text-green-200 hover:bg-green-800/30'
	                                        }`}
	                                        whileHover={{ scale: 1.01 }}
	                                        whileTap={{ scale: 0.98 }}
	                                      >
	                                        <span className="flex items-center gap-2">
	                                          <span>{config.icon}</span>
	                                          <span>{config.label}</span>
	                                        </span>
	                                        {isActive && <CheckCircle2 className="h-4 w-4 text-green-300" />}
	                                      </motion.button>
	                                    );
	                                  })}
	                                </motion.div>
	                              </>
	                            )}
	                          </AnimatePresence>
	                        </div>
	
	                        <div className="border-t border-green-600/50 mt-3"></div>
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
                              {sortSubtasksHybrid(task.subtasks.filter((subtask) => {
                                const shouldShowCompleted = showCompletedSubtasks[task.id];
                                if (shouldShowCompleted === undefined) return subtask.status !== "completed";
                                return shouldShowCompleted ? subtask.status === "completed" : subtask.status !== "completed";
                              })).map((subtask) => {
                              return (
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
                                      completed: subtask.status === "completed",
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
                                    onStartEditing={handleSubtaskStartEditing}
                                    onEditTitleChange={handleSubtaskEditTitleChange}
                                    onSaveEdit={handleSubtaskSaveEdit}
                                    onKeyDown={handleSubtaskKeyDown}
                                    onCalendarToggle={handleCalendarToggle}
                                    onDeleteSubtask={handleDeleteSubtask}
                                    onPriorityUpdate={handleUpdateSubtaskPriority}
                                    onEstimatedTimeUpdate={handleUpdateSubtaskEstimatedTime}
                                    onDescriptionUpdate={handleUpdateSubtaskDescription}
                                  >
                                    {/* Calendar popup */}
                                    {calendarSubtaskId === subtask.id && (
                                      <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                                        <CustomCalendar
                                          theme='LIGHT'
                                          subtask={subtask}
                                          onDateSelect={async (date) => {
                                            try {
                                              await handleUpdateSubtaskDueDate(task.id, subtask.id, date);
                                              setCalendarSubtaskId(null);
                                            } catch (error) {
                                              console.error('Failed to update due date:', error);
                                            }
                                          }}
                                          onClose={() => setCalendarSubtaskId(null)}
                                        />
                                      </div>
                                    )}
                                  </SubtaskItem>
                                </motion.li>
                                );
                              })}
                            </ul>
                          )}

                          {/* Add Subtask Button */}
                          <div className="px-3 pb-2 mt-2">
                            {addingSubtaskToTask === task.id ? (
                              <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => handleNewSubtaskTitleChange(e.target.value)}
                                onKeyDown={(e) => handleNewSubtaskKeyDown(e, task.id)}
                                onBlur={() => handleSaveNewSubtask(task.id)}
                                placeholder="Enter subtask title..."
                                className="w-full bg-green-900/40 text-green-100 border-green-600/50 focus:border-green-400 text-xs px-3 py-2 rounded border focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-green-300 hover:text-green-200 hover:bg-green-900/20 border-green-700/30 hover:border-green-600/40 transition-all duration-200 text-xs border"
                                onClick={() => handleStartAddingSubtask(task.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Subtask
                              </Button>
                            )}
                          </div>

                          {/* Bottom divider */}
                          <div className="border-t border-green-600/50 mt-3"></div>

                          {/* Progress Summary */}
                          {(
                            <div className="mt-3 pb-2 px-3">
                              <div className="flex items-center justify-between">
                                <div></div>
                                <button
                                  className="text-xs text-green-400 hover:text-green-300 cursor-pointer transition-colors"
                                  onClick={() => toggleSubtaskVisibility(task.id)}
                                  title="Toggle completed subtasks visibility"
                                >
                                  {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
                                </button>
                                <button
                                  className="text-gray-400 hover:text-red-400 cursor-pointer transition-colors text-lg font-bold leading-none"
                                  onClick={() => {
                                    deleteTask(task.id);
                                  }}
                                  title="Delete Task"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}

                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Progress Summary when collapsed */}
                    {!isExpanded && (
                      <div className="px-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div></div>
                          <button
                            className="text-xs text-green-400 hover:text-green-300 cursor-pointer transition-colors"
                            onClick={() => toggleSubtaskVisibility(task.id)}
                            title="Toggle completed subtasks visibility"
                          >
                            {task.subtasks.filter(s => s.status === "completed").length} of {task.subtasks.length} subtasks completed
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-400 cursor-pointer transition-colors text-lg font-bold leading-none"
                            onClick={() => {
                              deleteTask(task.id);
                            }}
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
              })}
            </ul>

            {/* Add Task Button */}
            <div className="mt-4 px-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-green-300 hover:text-green-200 hover:bg-green-900/20 border-green-700/30 hover:border-green-600/40 transition-all duration-200 text-sm border"
                onClick={async () => {
                  try {
                    const taskTitle = 'New Light Work Task';
                    const newTask = await createTask({
                      title: taskTitle,
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

              </div>
            </LayoutGroup>
          </motion.div>
        </CardContent>
      </Card>

      {/* Feedback Button */}
      <div className="mt-4">
        <SimpleFeedbackButton variant="bar" className="w-full" />
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={updateTask}
        onStartFocusSession={(taskId, subtaskId) => {
          setIsModalOpen(false);
          onStartFocusSession?.(taskId, tasks.find(t => t.id === taskId)?.focusIntensity || 2);
        }}
      />
    </div>
  );
}
