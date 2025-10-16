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

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  Timer,
  Play,
  Pause,
  Brain,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { TaskSeparator } from "@/components/tasks/TaskSeparator";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SimpleFeedbackButton } from "@/ecosystem/internal/feedback/SimpleFeedbackButton";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { TaskDetailModal } from "@/ecosystem/internal/lifelock/components/TaskDetailModal";
import { CustomCalendar } from "../../_shared/components";
import { SubtaskItem } from "@/components/tasks/SubtaskItem";
import { useLightWorkTasksSupabase, LightWorkTask, LightWorkSubtask } from "@/ecosystem/internal/tasks/hooks/useLightWorkTasksSupabase";
import { sortSubtasksHybrid } from "@/ecosystem/internal/tasks/utils/subtaskSorting";

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
  dueDate?: string;
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
    priority: task.priority.toLowerCase(),
    level: 0,
    dependencies: [],
    focusIntensity: (task.focusBlocks || 2) as 1 | 2 | 3 | 4,
    context: "coding",
    dueDate: task.createdAt,
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
    isSyncing,
    lastSync,
    syncQueueLength
  } = useLightWorkTasksSupabase({ selectedDate });

  // Transform data
  const tasks = useMemo(() => transformSupabaseToUITasks(rawTasks), [rawTasks]);

  const formattedLastSync = useMemo(() => {
    if (!lastSync) return "Never";
    const parsed = new Date(lastSync);
    if (Number.isNaN(parsed.getTime())) {
      return "Never";
    }
    return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [lastSync]);

  const syncStatusChipClasses = useMemo(() => {
    if (isSyncing) {
      return "bg-green-500/20 border-green-300 text-green-50";
    }
    if (syncQueueLength > 0) {
      return "bg-yellow-500/10 border-yellow-400 text-yellow-100";
    }
    return "bg-green-500/10 border-green-400 text-green-100";
  }, [isSyncing, syncQueueLength]);

  const syncStatusLabel = useMemo(() => {
    if (isSyncing) {
      return "Syncing";
    }
    if (syncQueueLength > 0) {
      return "Pending sync";
    }
    return "Synced";
  }, [isSyncing, syncQueueLength]);

  const queueChipClasses = useMemo(() => (
    syncQueueLength > 0
      ? "bg-yellow-500/10 border-yellow-400 text-yellow-100"
      : "bg-green-500/5 border-green-400/40 text-green-200"
  ), [syncQueueLength]);

  const queueLabel = useMemo(() => {
    if (syncQueueLength === 0) {
      return "Queue empty";
    }
    if (syncQueueLength === 1) {
      return "1 queued";
    }
    return `${syncQueueLength} queued`;
  }, [syncQueueLength]);

  const lastSyncTooltip = useMemo(() => {
    if (!lastSync) {
      return "No successful sync recorded yet";
    }
    const parsed = new Date(lastSync);
    if (Number.isNaN(parsed.getTime())) {
      return "No successful sync recorded yet";
    }
    return parsed.toLocaleString();
  }, [lastSync]);

  // State - EXACT COPY
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1", "2", "3"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeFocusSession, setActiveFocusSession] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editingMainTask, setEditingMainTask] = useState<string | null>(null);
  const [editMainTaskTitle, setEditMainTaskTitle] = useState('');
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{[taskId: string]: boolean}>({});

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

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarSubtaskId && !(event.target as Element).closest('.calendar-popup')) {
        setCalendarSubtaskId(null);
      }
    };
    if (calendarSubtaskId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [calendarSubtaskId]);

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
    try {
      await toggleTaskCompletion(taskId);
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
  if (error) {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center text-green-400 text-base sm:text-lg">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {theme.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] sm:text-xs" aria-live="polite">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${syncStatusChipClasses}`}
                title={syncStatusLabel}
              >
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                {syncStatusLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${queueChipClasses}`}
                title={queueLabel}
              >
                <CircleDotDashed className="h-3 w-3" />
                {queueLabel}
              </span>
              <span
                className="inline-flex items-center gap-1 text-green-300/80"
                title={lastSyncTooltip}
              >
                <Clock className="h-3 w-3" />
                {formattedLastSync === "Never" ? "Last sync —" : `Last sync ${formattedLastSync}`}
              </span>
            </div>
          </div>
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
