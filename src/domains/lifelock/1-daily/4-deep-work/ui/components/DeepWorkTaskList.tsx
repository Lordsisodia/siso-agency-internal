"use client";

/**
 * 🧠 Deep Work Task List - Using Unified Task Card
 *
 * Uses the shared UnifiedTaskCard component with BLUE theme
 */

import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Plus,
} from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetailModal } from "@/domains/lifelock/components/TaskDetailModal";
import { TaskDetailSheet } from "@/domains/lifelock/_shared/components/ui/TaskDetailSheet";
import { CustomCalendar } from "../../../_shared/components";
import { useDeepWorkTasksSupabase, DeepWorkTask } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
import { sortSubtasksHybrid } from "@/domains/lifelock/1-daily/_shared/utils/subtaskSorting";
import { GamificationService } from "@/domains/lifelock/_shared/services/gamificationService";
import { getDeepWorkPriorityMultiplier } from "@/domains/lifelock/1-daily/_shared/utils/taskXpCalculations";
import { useGamificationInit } from '@/domains/lifelock/_shared/hooks/useGamificationInit';
import { useDeepWorkTimers, formatMsAsClock } from "../../hooks/useDeepWorkTimers";
import { format } from 'date-fns';
import { UnifiedTaskCard, DEEP_THEME, UnifiedTask } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import { logger } from '@/lib/utils/logger';
import { useClientsList } from '@/domains/admin/clients/hooks/useClientsList';

// Type definitions
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string;
  subtasks: any[];
  focusIntensity?: 1 | 2 | 3 | 4;
  context?: string;
  dueDate?: string | null;
  timeEstimate?: string | null;
  actualDurationMin?: number;
  clientId?: string;
}

interface DeepWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

// Transform Supabase data
function transformSupabaseToUITasks(tasks: DeepWorkTask[]): Task[] {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.completed ? "completed" : "in-progress",
    priority: (task.priority || 'MEDIUM').toLowerCase(),
    level: 0,
    dependencies: "",
    focusIntensity: (task.focusBlocks || 4) as 1 | 2 | 3 | 4,
    context: "deep-work",
    dueDate: task.dueDate || task.taskDate || task.currentDate || task.createdAt,
    timeEstimate: task.timeEstimate || null,
    actualDurationMin: task.actualDurationMin,
    clientId: task.clientId ?? undefined,
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

// Convert Task to UnifiedTask
function taskToUnified(task: Task, activeTimer?: { taskId: string } | null, elapsedMs?: number): UnifiedTask {
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

export default function DeepWorkTaskList({ onStartFocusSession, selectedDate = new Date() }: DeepWorkTaskListProps) {
  const navigate = useNavigate();

  // Initialize gamification system
  useGamificationInit();

  // Fetch clients for badges
  const { clients } = useClientsList();
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => {
      map.set(client.id, client.business_name || client.full_name || 'Unnamed Client');
    });
    return map;
  }, [clients]);

  // BLUE THEME
  const theme = {
    title: '🧠 Deep Work Tasks',
    subtitle: 'Deep Focus Work',
    description: 'Deep work sessions require your highest cognitive capacity and total focus. These blocks are designed for your most challenging, high-value work that creates breakthrough results.',
    rules: [
      '• Zero interruptions - total focus required',
      '• Phone on Do Not Disturb mode',
      '• Work in 90-minute intense cycles',
      '• No social media or quick email checks'
    ]
  };

  const awardDeepWorkTaskCompletion = useCallback((task: DeepWorkTask) => {
    const priorityMultiplier = getDeepWorkPriorityMultiplier(task.priority);
    const baseXP = 30;
    const desiredXP = Math.round(baseXP * priorityMultiplier);

    if (desiredXP <= 0) return;

    const multiplier = desiredXP / baseXP;
    const awarded = GamificationService.awardXP('deep_task_complete', multiplier);

    if (import.meta.env.DEV) {
      console.debug(
        `[XP] Deep work task complete → priority=${task.priority}, multiplier=${multiplier.toFixed(2)}, awarded=${awarded} XP`
      );
    }
  }, []);

  // Use Deep Work Supabase hook
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
    updateTaskTimeEstimate,
    pushTaskToAnotherDay
  } = useDeepWorkTasksSupabase({ selectedDate });

  // Transform data
  const tasks = useMemo(() => transformSupabaseToUITasks(rawTasks), [rawTasks]);
  const hasTasks = tasks.length > 0;

  // State
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{ [key: string]: boolean }>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{[taskId: string]: boolean}>({});

  // Task order
  const dateKey = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'), [selectedDate]);
  const [taskOrder, setTaskOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(`deepwork-${dateKey}-taskOrder`);
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
    const previousTask = rawTasks.find(task => task.id === taskId);
    const wasCompleted = previousTask?.completed ?? false;

    try {
      const updatedTask = await toggleTaskCompletion(taskId);

      if (updatedTask && !wasCompleted && updatedTask.completed) {
        awardDeepWorkTaskCompletion(updatedTask);
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

  const handleTaskCalendarToggle = (taskId: string) => {
    setActiveTaskCalendarId(prev => (prev === taskId ? null : taskId));
    setCalendarSubtaskId(null);
    setTaskPriorityMenuId(null);
    setEditingTaskTimeId(null);
  };

  const handleTaskCalendarSelect = async (taskId: string, date: Date | null) => {
    try {
      const dateString = date ? date.toISOString().split('T')[0] : null;
      if (dateString) {
        await pushTaskToAnotherDay(taskId, dateString);
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    } finally {
      setActiveTaskCalendarId(null);
    }
  };

  const handleTaskPrioritySelect = async (taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      await updateTaskPriority(taskId, priority.toUpperCase() as any);
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
        await updateSubtaskTitle(subtaskId, editSubtaskTitle.trim());
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

  const baseSubtaskMinutes = 45;

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

  // Load task order from localStorage when date changes
  React.useEffect(() => {
    const saved = localStorage.getItem(`deepwork-${dateKey}-taskOrder`);
    if (saved) {
      setTaskOrder(JSON.parse(saved));
    } else {
      setTaskOrder([]);
    }
  }, [dateKey]);

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
      localStorage.setItem(`deepwork-${dateKey}-taskOrder`, JSON.stringify(taskOrder));
    }
  }, [taskOrder, dateKey]);

  // Loading state
  if (loading) {
    return (
      <div className="text-blue-50 h-full">
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full bg-blue-500/30" />
                <Skeleton className="h-5 w-40 bg-blue-400/20" />
              </div>
              <Skeleton className="h-4 w-16 bg-blue-400/20" />
            </div>
            <Skeleton className="h-2 w-full bg-blue-400/20 rounded-full" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !hasTasks) {
    return (
      <div className="text-blue-50 h-full">
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-sm text-blue-200 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-blue-50 h-full">
      <Card className="bg-blue-900/20 border-blue-700/50">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center text-blue-400 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {theme.title}
          </CardTitle>
          <div className="border-t border-blue-600/50 my-4"></div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">Flow State Protocol</h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">{theme.description}</p>
            </div>
            <div className="border-t border-blue-600/50 my-4"></div>
            <div>
              <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">{theme.subtitle} Rules</h3>
              <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
                {theme.rules.map((rule, index) => <li key={index}>{rule}</li>)}
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-600/50 my-3 sm:my-4"></div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
          >
            <LayoutGroup>
              <div className="overflow-hidden">
                <ul className="space-y-1 overflow-hidden">
                  {activeTasks.map((task, index) => {
                    const isFirst = index === 0;
                    const isLast = index === activeTasks.length - 1;
                    const isExpanded = expandedTasks.includes(task.id);

                    return (
                      <UnifiedTaskCard
                        key={task.id}
                        task={taskToUnified(task, activeTimer, getElapsedMsForTask(task.id))}
                        theme={DEEP_THEME}
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
                        clientMap={clientMap}
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
                        onDeleteTask={deleteTask}
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
                        themeName="DEEP"
                      />
                    );
                  })}
                </ul>

                {/* Add Task Button */}
                <div className="mt-4 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40 transition-all duration-200 text-sm border"
                    onClick={async () => {
                      try {
                        const newTask = await createTask({
                          title: 'New Deep Work Task',
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

      {/* Feedback Button - Hidden for now */}
      {/* <div className="mt-4">
        <SimpleFeedbackButton variant="bar" className="w-full" />
      </div> */}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={() => {}}
        onStartFocusSession={(taskId, subtaskId) => {
          setIsModalOpen(false);
          onStartFocusSession?.(taskId, tasks.find(t => t.id === taskId)?.focusIntensity || 4);
        }}
      />

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedTask(null);
        }}
        workType="deep"
        selectedDate={selectedDate}
        onToggleSubtaskCompletion={handleToggleSubtaskStatus}
        onAddSubtask={async (taskId, title) => {
          await addSubtask(taskId, title);
        }}
        onUpdateSubtaskDueDate={async (taskId, subtaskId, date) => {
          await updateSubtaskDueDate(subtaskId, date);
        }}
        onUpdateSubtaskPriority={handleUpdateSubtaskPriority}
        onUpdateSubtaskDescription={handleUpdateSubtaskDescription}
        onUpdateSubtaskEstimatedTime={handleUpdateSubtaskEstimatedTime}
        onDeleteSubtask={handleDeleteSubtask}
      />
    </div>
  );
}
