"use client";

/**
 * 📅 Today Tasks List - Unified View
 *
 * Shows BOTH Light Work and Deep Work tasks scheduled for today
 * Uses the shared UnifiedTaskCard component with SLATE theme
 */

import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
} from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SubtaskItem } from "@/domains/lifelock/1-daily/_shared/components/subtask/SubtaskItem";
import { useLightWorkTasksSupabase, LightWorkTask } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { useDeepWorkTasksSupabase, DeepWorkTask } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
// TODO: import { sortSubtasksHybrid } from "@/domains/lifelock/1-daily/_shared/utils/subtaskSorting";
import { useGamificationInit } from '@/domains/lifelock/_shared/hooks/useGamificationInit';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UnifiedTaskCard, UnifiedTask, AMBER_THEME } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import { useDeepWorkTimers } from "@/domains/lifelock/1-daily/4-deep-work/hooks/useDeepWorkTimers";

// Stub for missing sortSubtasksHybrid function
const sortSubtasksHybrid = (subtasks: any[]) => subtasks;

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
    })),
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    dueDate: task.currentDate || task.createdAt,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
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
    })),
    focusIntensity: (task.focusBlocks || 4) as 1 | 2 | 3 | 4,
    dueDate: task.taskDate || task.originalDate,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
  };
}

export default function TodayTasksList({ onStartFocusSession, selectedDate = new Date() }: TodayTasksListProps) {
  const navigate = useNavigate();

  // Initialize gamification system for XP tracking
  useGamificationInit();

  // Initialize timer hook for deep work tracking
  const dateKey = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'), [selectedDate]);
  const { activeTimer, start, stop, getElapsedMsForTask } = useDeepWorkTimers(dateKey);

  // Get today's date string for comparison (using local time, not UTC)
  const getLocalDate = () => {
    const date = selectedDate || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr;
  };
  const todayDate = getLocalDate();

  // Helper function to normalize date strings for comparison
  const normalizeDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : null;
  };

  // Load both Light Work and Deep Work tasks
  const {
    tasks: rawLightTasks,
    loading: lightLoading,
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

    // Process Light Work tasks
    rawLightTasks.forEach(task => {
      if (task.completed) return;
      const transformed = transformLightWorkTask(task);
      const normalizedCurrentDate = normalizeDate(task.currentDate);
      const normalizedTaskDate = normalizeDate(task.taskDate);
      const taskScheduledToday = normalizedCurrentDate === todayDate || normalizedTaskDate === todayDate;
      const hasSubtaskDueToday = task.subtasks.some(sub =>
        sub.dueDate && normalizeDate(sub.dueDate) === todayDate
      );

      if (taskScheduledToday || hasSubtaskDueToday) {
        allTasks.push(transformed);
      }
    });

    // Process Deep Work tasks
    rawDeepTasks.forEach(task => {
      if (task.completed) return;
      const transformed = transformDeepWorkTask(task);
      const normalizedCurrentDate = normalizeDate(task.currentDate);
      const normalizedTaskDate = normalizeDate(task.taskDate);
      const taskScheduledToday = normalizedCurrentDate === todayDate || normalizedTaskDate === todayDate;
      const hasSubtaskDueToday = task.subtasks.some(sub =>
        sub.dueDate && normalizeDate(sub.dueDate) === todayDate
      );

      if (taskScheduledToday || hasSubtaskDueToday) {
        allTasks.push(transformed);
      }
    });

    // Sort: Deep work first, then by priority
    return allTasks.sort((a, b) => {
      if (a.id.startsWith('deep-') !== b.id.startsWith('deep-')) {
        return a.id.startsWith('deep-') ? -1 : 1;
      }
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      return aPriority - bPriority;
    });
  }, [rawLightTasks, rawDeepTasks, todayDate]);

  const loading = lightLoading || deepLoading;

  // State management
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
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

  const handleTaskCalendarToggle = (taskId: string) => {
    setActiveTaskCalendarId(prev => (prev === taskId ? null : taskId));
    setCalendarSubtaskId(null);
    setTaskPriorityMenuId(null);
    setEditingTaskTimeId(null);
  };

  const handleTaskCalendarSelect = async (taskId: string, date: Date | null) => {
    const [workType, originalId] = taskId.split('-');
    try {
      const dateString = date ? date.toISOString().split('T')[0] : null;
      if (dateString) {
        if (workType === 'light') {
          await pushLightTaskToAnotherDay(originalId, dateString);
        } else {
          await pushDeepTaskToAnotherDay(originalId, dateString);
        }
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    } finally {
      setActiveTaskCalendarId(null);
    }
  };

  const handleTaskPrioritySelect = async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const [workType, originalId] = taskId.split('-');
    try {
      const upperPriority = priority.toUpperCase() as any;
      if (workType === 'light') {
        await updateLightTaskPriority(originalId, upperPriority);
      } else {
        await updateDeepTaskPriority(originalId, upperPriority);
      }
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
    const [workType, originalId] = taskId.split('-');
    try {
      const trimmed = editTaskTimeValue.trim();
      if (workType === 'light') {
        await updateLightTaskTimeEstimate(originalId, trimmed ? trimmed : null);
      } else {
        await updateDeepTaskTimeEstimate(originalId, trimmed ? trimmed : null);
      }
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
    // No-op for TodayTasksList - no reordering
  };

  const handleTimerToggle = (taskId: string) => {
    if (activeTimer?.taskId === taskId) {
      stop(taskId);
    } else {
      start(taskId);
    }
  };

  const toggleSubtaskVisibility = (taskId: string) => {
    setShowCompletedSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
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
      const [workType, originalTaskId] = taskId.split('-');
      try {
        if (workType === 'light') {
          await updateLightSubtaskTitle(subtaskId, editSubtaskTitle.trim());
        } else {
          await updateDeepSubtaskTitle(subtaskId, editSubtaskTitle.trim());
        }
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
      const [workType, originalId] = taskId.split('-');
      try {
        const success = workType === 'light'
          ? await updateLightTaskTitle(originalId, editMainTaskTitle.trim())
          : await updateDeepTaskTitle(originalId, editMainTaskTitle.trim());
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
    // Find which task this subtask belongs to
    for (const task of tasks) {
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        const [workType, originalTaskId] = task.id.split('-');
        try {
          if (workType === 'light') {
            await deleteLightSubtask(subtaskId);
          } else {
            await deleteDeepSubtask(subtaskId);
          }
        } catch (error) {
          console.error('Error deleting subtask:', error);
        }
        break;
      }
    }
  };

  const handleUpdateSubtaskPriority = async (subtaskId: string, priority: string) => {
    const [workType] = subtaskId.split('-');
    try {
      if (workType === 'light') {
        await updateLightSubtaskPriority(subtaskId, priority);
      } else {
        await updateDeepSubtaskPriority(subtaskId, priority);
      }
    } catch (error) {
      console.error('Error updating subtask priority:', error);
    }
  };

  const handleUpdateSubtaskDescription = async (subtaskId: string, description: string) => {
    const [workType] = subtaskId.split('-');
    try {
      if (workType === 'light') {
        await updateLightSubtaskDescription(subtaskId, description);
      } else {
        await updateDeepSubtaskDescription(subtaskId, description);
      }
    } catch (error) {
      console.error('Error updating subtask description:', error);
    }
  };

  const handleUpdateSubtaskEstimatedTime = async (subtaskId: string, estimatedTime: string) => {
    const [workType] = subtaskId.split('-');
    try {
      if (workType === 'light') {
        await updateLightSubtaskEstimatedTime(subtaskId, estimatedTime);
      } else {
        await updateDeepSubtaskEstimatedTime(subtaskId, estimatedTime);
      }
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
      const [workType, originalId] = taskId.split('-');
      try {
        if (workType === 'light') {
          await addLightSubtask(originalId, newSubtaskTitle.trim());
        } else {
          await addDeepSubtask(originalId, newSubtaskTitle.trim());
        }
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

  // Helper: Schedule first available task for today (for testing)
  const scheduleFirstTaskForToday = async () => {
    if (rawLightTasks.length > 0) {
      const firstTask = rawLightTasks[0];
      await pushLightTaskToAnotherDay(firstTask.id, todayDate);
      return;
    }
    if (rawDeepTasks.length > 0) {
      const firstTask = rawDeepTasks[0];
      await pushDeepTaskToAnotherDay(firstTask.id, todayDate);
      return;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-amber-50 h-full">
        <Card className="bg-amber-900/20 border-amber-700/50">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full bg-amber-500/30" />
                <Skeleton className="h-5 w-40 bg-amber-400/20" />
              </div>
              <Skeleton className="h-4 w-16 bg-amber-400/20" />
            </div>
            <Skeleton className="h-2 w-full bg-amber-400/20 rounded-full" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Format helpers for UnifiedTaskCard
  const formatMsAsClock = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}:${remainingMinutes.toString().padStart(2, '0')}` : `${minutes}`;
  };

  const getTaskTimeSummary = (task: UnifiedTask) => {
    const baseSubtaskMinutes = task.id.startsWith('deep-') ? 45 : 30;
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

  return (
    <div className="text-amber-50 h-full">
      <Card className="bg-amber-900/20 border-amber-700/50">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-amber-300 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Today's Tasks
            </CardTitle>
            {tasks.length === 0 && (rawLightTasks.length > 0 || rawDeepTasks.length > 0) && (
              <button
                onClick={scheduleFirstTaskForToday}
                className="px-3 py-1 text-xs font-medium text-amber-300 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors"
              >
                Test: Schedule First Task
              </button>
            )}
          </div>
          <div className="border-t border-amber-600/50 my-4"></div>
          <div className="text-amber-300 text-sm">
            {tasks.length === 0
              ? 'No tasks scheduled for today.'
              : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} scheduled for today`
            }
          </div>
          <div className="border-t border-amber-600/50 my-3 sm:my-4"></div>
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
                    const isFirst = index === 0;
                    const isLast = index === tasks.length - 1;

                    return (
                      <UnifiedTaskCard
                        key={task.id}
                        task={{
                          ...task,
                          activeTimer,
                          elapsedMs: getElapsedMsForTask(task.id)
                        }}
                        theme={AMBER_THEME}
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
                        sortSubtasks={sortSubtasksHybrid}
                        workType={task.id.startsWith('light-') ? 'light' : 'deep'}
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
                        onDeleteTask={async (taskId) => {
                          const [workType, originalId] = taskId.split('-');
                          if (workType === 'light') {
                            await deleteLightTask(originalId);
                          } else {
                            await deleteDeepTask(originalId);
                          }
                        }}
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
                        themeName="AMBER"
                      />
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
                className="w-full text-amber-300 hover:text-amber-200 hover:bg-amber-700/30 border-amber-600/50 hover:border-amber-500/50 transition-all duration-200 text-sm border"
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
                  className="w-full px-3 py-2 text-sm bg-amber-900/40 border border-amber-600/50 rounded-lg text-amber-100 placeholder-amber-400/50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />

                {/* Task Type and Priority Selection */}
                <div className="flex items-center gap-2">
                  {/* Work Type Selector */}
                  <div className="flex items-center gap-1 bg-amber-900/30 rounded-lg p-1 border border-amber-600/30">
                    <button
                      onClick={() => setNewTaskType('light')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        newTaskType === 'light'
                          ? 'bg-amber-600/40 text-amber-100 border border-amber-500/50'
                          : 'text-amber-400/70 hover:text-amber-200 hover:bg-amber-800/30'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setNewTaskType('deep')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        newTaskType === 'deep'
                          ? 'bg-amber-600/40 text-amber-100 border border-amber-500/50'
                          : 'text-amber-400/70 hover:text-amber-200 hover:bg-amber-800/30'
                      }`}
                    >
                      Deep
                    </button>
                  </div>

                  {/* Priority Selector */}
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')}
                    className="flex-1 px-3 py-1.5 text-xs bg-amber-900/40 border border-amber-600/50 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
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
                      className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="px-3 py-1.5 text-xs text-amber-400/70 hover:text-amber-200 hover:bg-amber-800/30 rounded-lg transition-colors"
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
