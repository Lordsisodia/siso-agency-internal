"use client";

/**
 * 🧠 Deep Work Task List - PIXEL-PERFECT Blue Theme
 *
 * Exact copy of siso-deep-focus-plan.tsx with BLUE theme hardcoded
 * Zero modifications to functionality - this is the perfect working version!
 *
 * Source: /components/ui/siso-deep-focus-plan.tsx (deep-work variant)
 * ⚠️ DO NOT MODIFY - Pixel-perfect from working version
 */

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  ArrowUp,
  ArrowDown,
  Calendar,
  Timer,
  Brain,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  ListOrdered,
  Flame
} from "lucide-react";
import { TaskSeparator } from "@/components/tasks/TaskSeparator";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SimpleFeedbackButton } from "@/ecosystem/internal/feedback/SimpleFeedbackButton";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TaskDetailModal } from "@/ecosystem/internal/lifelock/components/TaskDetailModal";
import { CustomCalendar } from "../../_shared/components";
import { SubtaskItem } from "@/components/tasks/SubtaskItem";
import { useDeepWorkTasksSupabase, DeepWorkTask, DeepWorkSubtask } from "@/ecosystem/internal/tasks/hooks/useDeepWorkTasksSupabase";
import { sortSubtasksHybrid } from "@/ecosystem/internal/tasks/utils/subtaskSorting";
import { format } from 'date-fns';

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

interface DeepWorkTaskListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

// Transform Supabase data - EXACT COPY
function transformSupabaseToUITasks(tasks: DeepWorkTask[]): Task[] {
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

export default function DeepWorkTaskList({ onStartFocusSession, selectedDate = new Date() }: DeepWorkTaskListProps) {
  // BLUE THEME - Hardcoded from working version
  const theme = {
    title: '🧠 Deep Work Sessions',
    subtitle: 'Deep Focus Work',
    description: 'Deep work sessions require sustained focus without interruption. These blocks are designed for your most important, cognitively demanding work that creates maximum value.',
    rules: [
      '• No interruptions or task switching allowed',
      '• Phone on airplane mode or Do Not Disturb',
      '• Work in 2-4 hour focused blocks',
      '• Deep cognitive work only'
    ]
  };

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
    updateTaskTimeEstimate
  } = useDeepWorkTasksSupabase({ selectedDate });

  // Transform data
  const tasks = useMemo(() => transformSupabaseToUITasks(rawTasks), [rawTasks]);

  // State - EXACT COPY
  const [expandedTasks, setExpandedTasks] = useState<string[]>(["1", "2", "3"]);
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

  // Persist task order to localStorage (per-date)
  const dateKey = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'), [selectedDate]);
  const [taskOrder, setTaskOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(`deepwork-${dateKey}-taskOrder`);
    return saved ? JSON.parse(saved) : [];
  });

  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editingMainTask, setEditingMainTask] = useState<string | null>(null);
  const [editMainTaskTitle, setEditMainTaskTitle] = useState('');
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{[taskId: string]: boolean}>({});

  // Load task order from localStorage when date changes
  React.useEffect(() => {
    const saved = localStorage.getItem(`deepwork-${dateKey}-taskOrder`);
    if (saved) {
      setTaskOrder(JSON.parse(saved));
    } else {
      setTaskOrder([]);
    }
  }, [dateKey]);

  // Sync task order with current tasks (handle new/deleted tasks)
  React.useEffect(() => {
    setTaskOrder(prevOrder => {
      if (tasks.length === 0) {
        return [];
      }

      if (prevOrder.length === 0) {
        return tasks.map(task => task.id);
      }

      const taskIds = tasks.map(task => task.id);
      const filtered = prevOrder.filter(id => taskIds.includes(id));
      const missing = taskIds.filter(id => !filtered.includes(id));

      if (missing.length === 0 && filtered.length === prevOrder.length) {
        return prevOrder;
      }

      return [...filtered, ...missing];
    });
  }, [tasks]);

  // Save task order to localStorage whenever it changes
  React.useEffect(() => {
    if (taskOrder.length > 0) {
      localStorage.setItem(`deepwork-${dateKey}-taskOrder`, JSON.stringify(taskOrder));
    }
  }, [taskOrder, dateKey]);

  const orderedTasks = useMemo(() => {
    if (taskOrder.length === 0) {
      return tasks;
    }

    const orderMap = new Map(taskOrder.map((id, index) => [id, index]));
    return [...tasks].sort((a, b) => {
      const aIndex = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const bIndex = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [tasks, taskOrder]);

  // Theme config for SubtaskItem - BLUE
  const themeConfig = {
    colors: {
      text: 'text-blue-400',
      border: 'border-blue-400',
      input: 'border-gray-600 focus:border-blue-400',
      textSecondary: 'text-blue-300'
    }
  };

  // Reduced motion support
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Close calendar popovers when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((calendarSubtaskId || activeTaskCalendarId) && !(event.target as Element).closest('.calendar-popup')) {
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
    low: { icon: '🟢', label: 'Low', badgeClass: 'text-green-300 bg-green-900/20 hover:bg-green-900/30' },
    medium: { icon: '🟡', label: 'Medium', badgeClass: 'text-yellow-300 bg-yellow-900/20 hover:bg-yellow-900/30' },
    high: { icon: '🔴', label: 'High', badgeClass: 'text-red-300 bg-red-900/20 hover:bg-red-900/30' },
    urgent: { icon: '🚨', label: 'Urgent', badgeClass: 'text-purple-300 bg-purple-900/20 hover:bg-purple-900/30' }
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
      return 'text-blue-200/80 bg-blue-900/20 hover:bg-blue-900/30';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'text-blue-200/80 bg-blue-900/20 hover:bg-blue-900/30';
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

    return 'text-blue-200 bg-blue-900/30 hover:bg-blue-900/40';
  };

  const handleTaskCalendarToggle = (taskId: string) => {
    setActiveTaskCalendarId(prev => (prev === taskId ? null : taskId));
    setCalendarSubtaskId(null);
    setTaskPriorityMenuId(null);
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

  const handleMoveTask = (taskId: string, direction: 'up' | 'down') => {
    setTaskOrder(prevOrder => {
      const baseOrder = prevOrder.length ? [...prevOrder] : tasks.map(task => task.id);
      const index = baseOrder.indexOf(taskId);

      if (index === -1) {
        return baseOrder;
      }

      if (direction === 'up') {
        if (index === 0) {
          return baseOrder;
        }
        [baseOrder[index - 1], baseOrder[index]] = [baseOrder[index], baseOrder[index - 1]];
      } else {
        if (index === baseOrder.length - 1) {
          return baseOrder;
        }
        [baseOrder[index + 1], baseOrder[index]] = [baseOrder[index], baseOrder[index + 1]];
      }

      return baseOrder;
    });
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

  // Loading state - BLUE THEME
  if (loading) {
    return (
      <div className="text-blue-50 h-full">
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-blue-300">Loading {theme.subtitle} tasks...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - BLUE THEME
  if (error) {
    return (
      <div className="text-blue-50 h-full">
        <Card className="bg-blue-900/20 border-blue-700/50">
          <CardContent className="p-4 text-center">
            <div className="text-red-400 mb-4">
              <CircleAlert className="h-8 w-8 mx-auto mb-2" />
              Error loading Deep Work tasks
            </div>
            <p className="text-sm text-blue-200 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                {theme.description}
              </p>
            </div>
            <div className="border-t border-blue-600/50 my-4"></div>
            <div>
              <h3 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">{theme.subtitle} Rules</h3>
              <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
                {theme.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-600/50 my-3 sm:my-4"></div>
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
              {orderedTasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";
                const summary = getTaskTimeSummary(task);
                const priorityConfig = getPriorityConfig(task.priority);
                const isFirst = index === 0;
                const isLast = index === orderedTasks.length - 1;

                return (
                  <motion.li
                    key={task.id}
                    className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    {/* Task Container */}
                    <div className="group bg-blue-900/10 border-blue-700/30 hover:bg-blue-900/15 hover:border-blue-600/40 hover:shadow-blue-500/5 rounded-xl transition-all duration-300 hover:shadow-lg">
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
                                  <CircleDotDashed className="h-5 w-5 text-blue-400" />
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
                                className="w-full bg-blue-900/40 text-blue-100 font-semibold text-sm sm:text-base px-2 py-1 rounded border border-blue-600/50 focus:border-blue-400 focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <h4
                                className="text-blue-100 hover:text-blue-50 font-semibold text-sm sm:text-base cursor-pointer transition-colors truncate"
                                onClick={() => handleMainTaskStartEditing(task.id, task.title)}
                              >
                                {task.title}
                              </h4>
                            )}
                          </div>

                          {/* Toggle Button */}
                          <div className="flex items-center flex-shrink-0">
                            <motion.button
                              className="p-1 rounded-md hover:bg-blue-900/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(task.id);
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-blue-300" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-blue-300" />
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* Top divider */}
                        <div className="border-t border-blue-600/50 mt-3"></div>

                        <div className="pt-3">
                          {/* Single-row metadata: Date | Priority | Time | Arrows */}
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
                                className="px-2 py-1 rounded-md text-xs font-medium bg-blue-900/40 border border-blue-600/60 text-blue-100 focus:border-blue-300 focus:outline-none"
                                placeholder="e.g. 2h"
                              />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskTimeStartEditing(task, summary.formatted);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-blue-200/90 bg-blue-900/20 hover:bg-blue-900/30 transition-colors"
                                title="Set total focus time"
                              >
                                <Clock className="h-3.5 w-3.5" />
                                <span>{summary.formatted}</span>
                              </button>
                            )}

                            {/* Reorder Arrows - Inline */}
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, 'up');
                                }}
                                disabled={isFirst}
                                className={`p-1 rounded-md border border-blue-700/40 text-blue-300 transition-colors ${
                                  isFirst ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-900/25'
                                }`}
                                title="Move up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, 'down');
                                }}
                                disabled={isLast}
                                className={`p-1 rounded-md border border-blue-700/40 text-blue-300 transition-colors ${
                                  isLast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-900/25'
                                }`}
                                title="Move down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {activeTaskCalendarId === task.id && (
                            <div className="calendar-popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 min-w-[280px] max-w-[90vw] max-h-[90vh] overflow-auto">
                              <CustomCalendar
                                theme='DEEP'
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
                                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] backdrop-blur-xl bg-blue-950/95 border border-blue-700/60 rounded-xl shadow-2xl shadow-black/60 p-3 min-w-[200px]"
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
                                          isActive ? 'bg-blue-800/40 text-blue-100' : 'text-blue-200 hover:bg-blue-800/30'
                                        }`}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <span className="flex items-center gap-2">
                                          <span>{config.icon}</span>
                                          <span>{config.label}</span>
                                        </span>
                                        {isActive && <CheckCircle2 className="h-4 w-4 text-blue-300" />}
                                      </motion.button>
                                    );
                                  })}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="border-t border-blue-600/50 mt-3"></div>
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
                                          theme='DEEP'
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
                                className="w-full bg-blue-900/40 text-blue-100 border-blue-600/50 focus:border-blue-400 text-xs px-3 py-2 rounded border focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40 transition-all duration-200 text-xs border"
                                onClick={() => handleStartAddingSubtask(task.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Subtask
                              </Button>
                            )}
                          </div>

                          {/* Bottom divider */}
                          <div className="border-t border-blue-600/50 mt-3"></div>

                          {/* Progress Summary */}
                          {(
                            <div className="mt-3 pb-2 px-3">
                              <div className="flex items-center justify-between">
                                <div></div>
                                <button
                                  className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
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
                            className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
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
                className="w-full text-blue-300 hover:text-blue-200 hover:bg-blue-900/20 border-blue-700/30 hover:border-blue-600/40 transition-all duration-200 text-sm border"
                onClick={async () => {
                  try {
                    const taskTitle = 'New Deep Work Task';
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
