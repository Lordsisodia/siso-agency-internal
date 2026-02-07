"use client";

/**
 * 📅 Today's Tasks - Master Task List
 *
 * Shows tasks allocated for today plus tasks due today that need allocation.
 * Uses UnifiedTaskCard for task display with AMBER theme.
 */

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { TEAL_THEME, UnifiedTaskCard } from "@/domains/lifelock/1-daily/_shared/components/UnifiedTaskCard";
import { useLightWorkTasksSupabase } from "@/domains/lifelock/1-daily/3-light-work/domain/useLightWorkTasksSupabase";
import { useDeepWorkTasksSupabase } from "@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase";
import { useTimeBlocks } from "@/domains/lifelock/1-daily/2-tasks/domain/useTimeBlocks";
import { useGamificationInit } from "@/domains/lifelock/_shared/hooks/useGamificationInit";
import { useDeepWorkTimers, formatMsAsClock } from "@/domains/lifelock/1-daily/4-deep-work/hooks/useDeepWorkTimers";
import { useClerkUser } from "@/lib/hooks/auth/useClerkUser";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Calendar,
  ArrowRight,
  ListTodo,
  Clock,
  ChevronDown,
  Brain,
  Search,
  Filter,
  CheckSquare,
  X,
  Sparkles,
  Timer,
  Zap
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useUnifiedTasks,
  UnifiedTaskWithType,
  getTaskTimeSummary,
  formatTimeDisplay,
} from "@/domains/lifelock/1-daily/2-tasks/domain/hooks/useUnifiedTasks";
import {
  useTaskHandlers,
  Toast,
} from "@/domains/lifelock/1-daily/2-tasks/domain/hooks/useTaskHandlers";
import { TimeBlockCategory } from "@/services/api/timeblocksApi.offline";

// Parse task ID into workType and originalId
function parseTaskId(taskId: string): { workType: "light" | "deep"; originalId: string } {
  const parts = taskId.split("-");
  const workType = parts[0] as "light" | "deep";
  const originalId = parts.slice(1).join("-");
  return { workType, originalId };
}

interface TodayTasksListProps {
  onStartFocusSession?: (taskId: string, intensity: number) => void;
  selectedDate?: Date;
}

const TODAY_FLOW_PROTOCOL = {
  title: "📅 Today's Tasks",
  subtitle: "Daily Focus",
  description: "Your command center for today's work. Tasks are automatically scheduled into your timebox. Complete them in order for maximum productivity.",
  rules: [
    "• Tasks auto-schedule into your timebox",
    "• Work through them in time order",
    "• Complete high priority items first",
    "• Use the timer for focused sessions"
  ]
};

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
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
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

// Toast component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="region" aria-label="Notifications">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              "px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[200px]",
              toast.type === "success" && "bg-green-900/90 text-green-100 border border-green-700",
              toast.type === "error" && "bg-red-900/90 text-red-100 border border-red-700",
              toast.type === "info" && "bg-slate-800/90 text-slate-100 border border-slate-700"
            )}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && <Sparkles className="h-4 w-4" />}
              {toast.type === "error" && <X className="h-4 w-4" />}
              <span>{toast.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Time Badge Component - shows scheduled time
function TimeBadge({ startTime, endTime }: { startTime: string; endTime: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal-800/50 border border-teal-600/30 text-teal-200 text-xs font-medium">
      <Timer className="h-3 w-3" />
      <span>{formatTimeDisplay(startTime)} - {formatTimeDisplay(endTime)}</span>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ allocated, completed, total }: { allocated: number; completed: number; total: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-teal-400/70">Daily Progress</span>
        <span className="text-teal-300 font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-600 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-teal-400/60">
        <span>{completed} completed</span>
        <span>{allocated - completed} remaining</span>
      </div>
    </div>
  );
}

// Search and Filter Bar
function SearchFilterBar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  typeFilter,
  onTypeFilterChange,
  showFilters,
  onToggleFilters,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (priorities: string[]) => void;
  typeFilter: ('light' | 'deep')[];
  onTypeFilterChange: (types: ('light' | 'deep')[]) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  const priorities = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'low', label: 'Low', color: 'bg-green-500' },
  ];

  const types = [
    { value: 'deep', label: 'Deep', color: 'bg-blue-500' },
    { value: 'light', label: 'Light', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400/50" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-900/50 border-teal-700/30 text-teal-100 placeholder:text-teal-400/40"
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400/50 hover:text-teal-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFilters}
          className={cn(
            "text-teal-400/70 hover:text-teal-300 hover:bg-teal-900/20",
            showFilters && "bg-teal-900/30 text-teal-300"
          )}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {/* Priority filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-teal-400/60">Priority:</span>
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    const newFilter = priorityFilter.includes(p.value)
                      ? priorityFilter.filter((v) => v !== p.value)
                      : [...priorityFilter, p.value];
                    onPriorityFilterChange(newFilter);
                  }}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border transition-colors",
                    priorityFilter.includes(p.value)
                      ? `${p.color} text-white border-transparent`
                      : "border-teal-700/30 text-teal-400/70 hover:text-teal-300"
                  )}
                  aria-pressed={priorityFilter.includes(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Type filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-teal-400/60">Type:</span>
              {types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    const newFilter = typeFilter.includes(t.value as 'light' | 'deep')
                      ? typeFilter.filter((v) => v !== t.value)
                      : [...typeFilter, t.value as 'light' | 'deep'];
                    onTypeFilterChange(newFilter);
                  }}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border transition-colors",
                    typeFilter.includes(t.value as 'light' | 'deep')
                      ? `${t.color} text-white border-transparent`
                      : "border-teal-700/30 text-teal-400/70 hover:text-teal-300"
                  )}
                  aria-pressed={typeFilter.includes(t.value as 'light' | 'deep')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Bulk Actions Bar
function BulkActionsBar({
  selectedTasks,
  onClearSelection,
  onCompleteSelected,
  onDeleteSelected,
}: {
  selectedTasks: Set<string>;
  onClearSelection: () => void;
  onCompleteSelected: () => void;
  onDeleteSelected: () => void;
}) {
  if (selectedTasks.size === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between px-4 py-2 bg-teal-900/30 border border-teal-700/30 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-teal-400" />
        <span className="text-sm text-teal-200">
          {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCompleteSelected}
          className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          Complete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDeleteSelected}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <X className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-teal-400/70 hover:text-teal-300"
        >
          Clear
        </Button>
      </div>
    </motion.div>
  );
}

export default function TodayTasksList({ onStartFocusSession, selectedDate = new Date() }: TodayTasksListProps) {
  // Initialize gamification system
  useGamificationInit();

  const prefersReducedMotion = useReducedMotion();
  const { user } = useClerkUser();
  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  // Timer functionality
  const { activeTimer, start, stop, getElapsedMsForTask } = useDeepWorkTimers(dateKey);

  const handleTimerToggle = (taskId: string) => {
    if (activeTimer?.taskId === taskId) {
      stop(taskId);
    } else {
      start(taskId);
    }
  };

  // Get today's date string
  const todayDate = useMemo(() => {
    const date = selectedDate || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // UI State
  const [showUnallocated, setShowUnallocated] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<('light' | 'deep')[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Task editing state
  const [activeTaskCalendarId, setActiveTaskCalendarId] = useState<string | null>(null);
  const [taskPriorityMenuId, setTaskPriorityMenuId] = useState<string | null>(null);
  const [editingTaskTimeId, setEditingTaskTimeId] = useState<string | null>(null);
  const [editTaskTimeValue, setEditTaskTimeValue] = useState('');
  const [calendarSubtaskId, setCalendarSubtaskId] = useState<string | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editingMainTask, setEditingMainTask] = useState<string | null>(null);
  const [editMainTaskTitle, setEditMainTaskTitle] = useState('');
  const [addingSubtaskToTask, setAddingSubtaskToTask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCompletedSubtasks, setShowCompletedSubtasks] = useState<{[taskId: string]: boolean}>({});

  // Light Work hook
  const lightWorkHook = useLightWorkTasksSupabase({ selectedDate });

  // Deep Work hook
  const deepWorkHook = useDeepWorkTasksSupabase({ selectedDate });

  // Time Blocks hook - for timebox integration
  const timeBlocksHook = useTimeBlocks({
    userId: user?.id || '',
    selectedDate,
  });

  // Auto-schedule handler - creates time block for task
  const handleAutoSchedule = useCallback(async (
    taskId: string,
    startTime: string,
    endTime: string
  ) => {
    const task = lightWorkHook.tasks.find(t => t.id === taskId) ||
                 deepWorkHook.tasks.find(t => t.id === taskId);

    if (!task || !user?.id) return;

    const isDeepWork = deepWorkHook.tasks.some(t => t.id === taskId);

    await timeBlocksHook.createTimeBlock({
      title: task.title,
      description: task.description,
      startTime,
      endTime,
      category: isDeepWork ? 'DEEP_WORK' : 'LIGHT_WORK',
      taskId: taskId,
      notes: `Auto-scheduled from Today's Tasks`,
    });
  }, [lightWorkHook.tasks, deepWorkHook.tasks, user?.id, timeBlocksHook]);

  // Unified tasks hook with timebox integration
  const {
    allocatedTasks,
    unallocatedTasks,
    stats,
    autoScheduleTask,
    findNextAvailableSlot,
  } = useUnifiedTasks({
    rawLightTasks: lightWorkHook.tasks,
    rawDeepTasks: deepWorkHook.tasks,
    timeBlocks: timeBlocksHook.timeBlocks,
    selectedDate,
    searchQuery,
    priorityFilter,
    typeFilter,
    userId: user?.id,
    onAutoSchedule: handleAutoSchedule,
  });

  // Task handlers
  const {
    handleToggleTaskStatus,
    handleToggleSubtaskStatus,
    handleCreateNewTask,
    handleDeleteTask,
    handleDeleteSubtask,
    handleTaskCalendarSelect,
    handleTaskPrioritySelect,
    handleTaskTimeSave,
    handleMainTaskSaveEdit,
    handleAllocateTask,
    handleSubtaskSaveEdit,
    handleUpdateSubtaskPriority,
    handleUpdateSubtaskDescription,
    handleUpdateSubtaskEstimatedTime,
    handleSaveNewSubtask,
    toasts,
    removeToast,
    loadingOperations,
  } = useTaskHandlers({
    toggleLightTaskCompletion: lightWorkHook.toggleTaskCompletion,
    toggleDeepTaskCompletion: deepWorkHook.toggleTaskCompletion,
    toggleLightSubtaskCompletion: lightWorkHook.toggleSubtaskCompletion,
    toggleDeepSubtaskCompletion: deepWorkHook.toggleSubtaskCompletion,
    createLightTask: lightWorkHook.createTask,
    createDeepTask: deepWorkHook.createTask,
    addLightSubtask: lightWorkHook.addSubtask,
    addDeepSubtask: deepWorkHook.addSubtask,
    deleteLightTask: lightWorkHook.deleteTask,
    deleteDeepTask: deepWorkHook.deleteTask,
    deleteLightSubtask: lightWorkHook.deleteSubtask,
    deleteDeepSubtask: deepWorkHook.deleteSubtask,
    updateLightSubtaskTitle: lightWorkHook.updateSubtaskTitle,
    updateDeepSubtaskTitle: deepWorkHook.updateSubtaskTitle,
    updateLightSubtaskPriority: lightWorkHook.updateSubtaskPriority,
    updateDeepSubtaskPriority: deepWorkHook.updateSubtaskPriority,
    updateLightSubtaskDescription: lightWorkHook.updateSubtaskDescription,
    updateDeepSubtaskDescription: deepWorkHook.updateSubtaskDescription,
    updateLightSubtaskEstimatedTime: lightWorkHook.updateSubtaskEstimatedTime,
    updateDeepSubtaskEstimatedTime: deepWorkHook.updateSubtaskEstimatedTime,
    updateLightTaskTitle: lightWorkHook.updateTaskTitle,
    updateDeepTaskTitle: deepWorkHook.updateTaskTitle,
    updateLightTaskDueDate: lightWorkHook.updateTaskDueDate,
    updateDeepTaskDueDate: deepWorkHook.updateTaskDueDate,
    updateLightTaskPriority: lightWorkHook.updateTaskPriority,
    updateDeepTaskPriority: deepWorkHook.updateTaskPriority,
    updateLightTaskTimeEstimate: lightWorkHook.updateTaskTimeEstimate,
    updateDeepTaskTimeEstimate: deepWorkHook.updateTaskTimeEstimate,
    pushLightTaskToAnotherDay: lightWorkHook.pushTaskToAnotherDay,
    pushDeepTaskToAnotherDay: deepWorkHook.pushTaskToAnotherDay,
    todayDate,
  });

  const loading = lightWorkHook.loading || deepWorkHook.loading || timeBlocksHook.isLoading;
  const error = lightWorkHook.error || deepWorkHook.error || timeBlocksHook.error;

  // Auto-expand first 3 tasks on initial load
  const isInitialExpansionSet = useRef(false);
  useEffect(() => {
    if (!isInitialExpansionSet.current && allocatedTasks.length > 0) {
      setExpandedTasks(allocatedTasks.slice(0, 3).map(task => task.id));
      isInitialExpansionSet.current = true;
    }
  }, [allocatedTasks]);

  // Helper to find parent task for subtask operations
  const findParentTask = useCallback((subtaskId: string): { workType: 'light' | 'deep' } | undefined => {
    const allTasks = [...allocatedTasks, ...unallocatedTasks];
    const parentTask = allTasks.find(task => task.subtasks.some(st => st.id === subtaskId));
    return parentTask ? { workType: parentTask.workType } : undefined;
  }, [allocatedTasks, unallocatedTasks]);

  // Task expansion toggle
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Bulk operations
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const clearSelection = () => setSelectedTasks(new Set());

  const completeSelected = async () => {
    const promises = Array.from(selectedTasks).map(taskId =>
      handleToggleTaskStatus(taskId)
    );
    await Promise.all(promises);
    clearSelection();
  };

  const deleteSelected = async () => {
    const promises = Array.from(selectedTasks).map(taskId =>
      handleDeleteTask(taskId)
    );
    await Promise.all(promises);
    clearSelection();
  };

  // Handle creating a new task with auto-edit
  const onCreateNewTask = async () => {
    const newTaskId = await handleCreateNewTask();
    if (newTaskId) {
      setTimeout(() => {
        setEditingMainTask(newTaskId);
        const task = allocatedTasks.find(t => t.id === newTaskId);
        if (task) {
          setEditMainTaskTitle(task.title);
        }
      }, 100);
    }
  };

  // Theme colors - TEAL for Today Tasks (bridges Light green + Deep blue)
  const themeColors = {
    cardBg: 'bg-teal-900/20 border-teal-700/40',
    iconBg: 'bg-white/5',
    iconBorder: 'border-teal-400/30',
    iconColor: 'text-teal-400',
    titleColor: 'text-white',
    subtitleColor: 'text-teal-300',
    textColor: 'text-teal-200',
    textMuted: 'text-teal-400/60',
    statCardBg: 'bg-teal-900/20',
    statCardBorder: 'border-teal-700/30',
    statValueColor: 'text-teal-300',
    statLabelColor: 'text-teal-400',
    buttonClass: 'text-teal-300 hover:text-teal-200 hover:bg-teal-900/20 border-teal-700/30 hover:border-teal-600/40',
    accentColor: 'text-teal-400',
    sectionHeader: 'text-teal-300/80',
    unallocatedBg: 'bg-slate-900/20 border-slate-700/30',
    timeBadge: 'bg-teal-800/50 text-teal-200 border-teal-600/30',
  };

  if (loading) {
    return (
      <div className="text-amber-50 min-h-screen w-full relative overflow-x-hidden">
        <div className="w-full max-w-none p-4 sm:p-6 space-y-4">
          <div className="px-3 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/5 border border-amber-400/30">
                  <Calendar className="h-4 w-4 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-amber-400/20 rounded" />
                  <div className="h-3 w-24 bg-amber-400/20 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-amber-400/20 rounded-lg" />
            <div className="h-16 bg-amber-400/20 rounded-lg" />
            <div className="h-16 bg-teal-400/20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error && stats.total === 0) {
    return (
      <div className="text-teal-50 min-h-screen w-full relative overflow-x-hidden">
        <div className="w-full max-w-none p-4 sm:p-6 space-y-4">
          <div className="px-3 py-4 border-b border-white/10 text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-sm text-gray-200 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-teal-600 hover:bg-teal-700">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-teal-50 min-h-screen w-full relative overflow-x-hidden">
      <div className="w-full max-w-none p-4 sm:p-6 space-y-4 pb-32">
        {/* Page Header */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1.5 rounded-lg ${themeColors.iconBg} border ${themeColors.iconBorder} flex items-center justify-center flex-shrink-0`}>
                <Calendar className={`h-4 w-4 ${themeColors.iconColor}`} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className={`text-lg font-semibold ${themeColors.titleColor} tracking-tight truncate`}>
                  {TODAY_FLOW_PROTOCOL.title}
                </h1>
                <p className={`text-xs ${themeColors.textMuted}`}>
                  {stats.total > 0
                    ? `${stats.scheduled} scheduled, ${stats.allocated - stats.scheduled} unscheduled${stats.unallocated > 0 ? `, ${stats.unallocated} to allocate` : ''}`
                    : 'No tasks for today'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {stats.total > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ListTodo className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Tasks</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {stats.allocated}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Timer className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Scheduled</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {stats.scheduled}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Unscheduled</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {stats.allocated - stats.scheduled}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${themeColors.statCardBg} border ${themeColors.statCardBorder}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`h-3.5 w-3.5 ${themeColors.statLabelColor}`} />
                  <span className={`text-xs ${themeColors.statLabelColor}`}>Est. Time</span>
                </div>
                <div className={`text-lg font-bold ${themeColors.statValueColor}`}>
                  {(() => {
                    const rounded = Math.max(0, Math.round(stats.totalEstimatedMinutes));
                    const hours = Math.floor(rounded / 60);
                    const minutes = rounded % 60;
                    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
                    if (hours > 0) return `${hours}h`;
                    return `${minutes}m`;
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {stats.total > 0 && (
            <ProgressBar
              allocated={stats.allocated}
              completed={stats.completed}
              total={stats.total}
            />
          )}
        </div>

        {/* Search and Filters */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedTasks={selectedTasks}
          onClearSelection={clearSelection}
          onCompleteSelected={completeSelected}
          onDeleteSelected={deleteSelected}
        />

        {/* ALLOCATED SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-center px-3">
            <h2 className={`text-sm font-medium ${themeColors.sectionHeader} uppercase tracking-wider text-center`}>
              {stats.scheduled > 0 ? 'Scheduled Tasks' : 'Allocated for Today'}
              <span className={`ml-2 text-xs ${themeColors.textMuted} normal-case`}>
                ({allocatedTasks.length} tasks
                {stats.scheduled > 0 && ` • ${stats.scheduled} scheduled`})
              </span>
            </h2>
          </div>

          {allocatedTasks.length > 0 ? (
            <LayoutGroup>
              <div className="overflow-hidden">
                <ul className="space-y-3 overflow-hidden" role="list" aria-label="Allocated tasks">
                  {allocatedTasks.map((task, index) => {
                    const isExpanded = expandedTasks.includes(task.id);
                    const isFirst = index === 0;
                    const isLast = index === allocatedTasks.length - 1;
                    const isSelected = selectedTasks.has(task.id);

                    return (
                      <motion.li
                        key={task.id}
                        layout={!prefersReducedMotion}
                        variants={taskVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                          "relative",
                          isSelected && "ring-2 ring-teal-500/50 rounded-lg"
                        )}
                      >
                        {/* Selection checkbox */}
                        <div className="absolute left-2 top-4 z-10">
                          <button
                            onClick={() => toggleTaskSelection(task.id)}
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-teal-500 border-teal-500"
                                : "border-teal-700/50 hover:border-teal-500"
                            )}
                            aria-label={isSelected ? "Deselect task" : "Select task"}
                            aria-pressed={isSelected}
                          >
                            {isSelected && <CheckSquare className="h-3 w-3 text-white" />}
                          </button>
                        </div>

                        <div className="pl-8">
                          {/* Time Badge - shows scheduled time */}
                          {task.timebox && (
                            <div className="mb-2 flex items-center gap-2">
                              <TimeBadge startTime={task.timebox.startTime} endTime={task.timebox.endTime} />
                              {activeTimer?.taskId === task.id && (
                                <span className="text-xs text-teal-400 animate-pulse flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  In Progress
                                </span>
                              )}
                            </div>
                          )}
                          {/* Auto-schedule button for tasks without time */}
                          {!task.timebox && (
                            <div className="mb-2">
                              <button
                                onClick={() => autoScheduleTask(task.id)}
                                disabled={loadingOperations[`schedule-${task.id}`]}
                                className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal-800/30 border border-teal-700/30 text-teal-300 hover:bg-teal-800/50 hover:border-teal-600/40 transition-colors"
                              >
                                <Zap className="h-3 w-3" />
                                {loadingOperations[`schedule-${task.id}`] ? 'Scheduling...' : 'Auto-schedule'}
                              </button>
                            </div>
                          )}
                          <UnifiedTaskCard
                            task={{
                              ...task,
                              activeTimer,
                              elapsedMs: getElapsedMsForTask(task.id)
                            }}
                            theme={TEAL_THEME}
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
                            sortSubtasks={(subtasks) => subtasks}
                            workType={task.workType}
                            onToggleTaskStatus={handleToggleTaskStatus}
                            onToggleExpansion={toggleTaskExpansion}
                            onTaskCalendarToggle={(taskId) => {
                              setActiveTaskCalendarId(prev => (prev === taskId ? null : taskId));
                              setCalendarSubtaskId(null);
                              setTaskPriorityMenuId(null);
                              setEditingTaskTimeId(null);
                            }}
                            onTaskCalendarSelect={handleTaskCalendarSelect}
                            onTaskPrioritySelect={handleTaskPrioritySelect}
                            onTaskPriorityMenuToggle={(taskId) => {
                              setTaskPriorityMenuId(prev => (prev === taskId ? null : taskId));
                              setActiveTaskCalendarId(null);
                              setEditingTaskTimeId(null);
                            }}
                            onWorkTypeToggle={async (taskId, newWorkType) => {
                              // Parse current task info
                              const { workType, originalId } = parseTaskId(taskId);
                              const currentTask = allocatedTasks.find(t => t.id === taskId) ||
                                                 unallocatedTasks.find(t => t.id === taskId);
                              if (!currentTask) return;

                              // Create new task in the target work type
                              const newTaskData = {
                                title: currentTask.title,
                                description: currentTask.description,
                                priority: currentTask.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
                                dueDate: currentTask.dueDate || todayDate,
                                timeEstimate: currentTask.timeEstimate,
                              };

                              try {
                                if (newWorkType === 'light') {
                                  await lightWorkHook.createTask({
                                    ...newTaskData,
                                    currentDate: todayDate,
                                  });
                                } else {
                                  await deepWorkHook.createTask({
                                    ...newTaskData,
                                    taskDate: todayDate,
                                    focusBlocks: 4,
                                  });
                                }
                                // Delete the old task
                                if (workType === 'light') {
                                  await lightWorkHook.deleteTask(originalId);
                                } else {
                                  await deepWorkHook.deleteTask(originalId);
                                }
                              } catch (error) {
                                console.error('Error toggling work type:', error);
                              }
                            }}
                            onTaskTimeStartEditing={(task, fallbackLabel) => {
                              setEditingTaskTimeId(task.id);
                              setEditTaskTimeValue(task.timeEstimate || fallbackLabel);
                              setActiveTaskCalendarId(null);
                              setTaskPriorityMenuId(null);
                            }}
                            onTaskTimeSave={async (taskId) => {
                              await handleTaskTimeSave(taskId, editTaskTimeValue);
                              setEditingTaskTimeId(null);
                              setEditTaskTimeValue('');
                            }}
                            onTaskTimeKeyDown={(event, taskId) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                handleTaskTimeSave(taskId, editTaskTimeValue);
                                setEditingTaskTimeId(null);
                                setEditTaskTimeValue('');
                              } else if (event.key === 'Escape') {
                                setEditingTaskTimeId(null);
                                setEditTaskTimeValue('');
                              }
                            }}
                            onTaskTimeChange={setEditTaskTimeValue}
                            onMoveTask={() => {}}
                            onTimerToggle={handleTimerToggle}
                            onToggleSubtaskVisibility={(taskId) => {
                              setShowCompletedSubtasks(prev => ({
                                ...prev,
                                [taskId]: !prev[taskId]
                              }));
                            }}
                            onDeleteTask={handleDeleteTask}
                            onMainTaskStartEditing={(taskId, currentTitle) => {
                              setEditingMainTask(taskId);
                              setEditMainTaskTitle(currentTitle);
                            }}
                            onMainTaskEditTitleChange={setEditMainTaskTitle}
                            onMainTaskSaveEdit={async (taskId) => {
                              await handleMainTaskSaveEdit(taskId, editMainTaskTitle);
                              setEditingMainTask(null);
                              setEditMainTaskTitle('');
                            }}
                            onMainTaskKeyDown={(e, taskId) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleMainTaskSaveEdit(taskId, editMainTaskTitle);
                                setEditingMainTask(null);
                                setEditMainTaskTitle('');
                              } else if (e.key === 'Escape') {
                                setEditingMainTask(null);
                                setEditMainTaskTitle('');
                              }
                            }}
                            onToggleSubtaskStatus={handleToggleSubtaskStatus}
                            onToggleSubtaskExpansion={() => {}}
                            onSubtaskStartEditing={(subtaskId, currentTitle) => {
                              setEditingSubtask(subtaskId);
                              setEditSubtaskTitle(currentTitle);
                            }}
                            onSubtaskEditTitleChange={setEditSubtaskTitle}
                            onSubtaskSaveEdit={async (taskId, subtaskId) => {
                              await handleSubtaskSaveEdit(subtaskId, editSubtaskTitle, findParentTask);
                              setEditingSubtask(null);
                              setEditSubtaskTitle('');
                            }}
                            onSubtaskKeyDown={(e, type, taskId, subtaskId) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (subtaskId) {
                                  handleSubtaskSaveEdit(subtaskId, editSubtaskTitle, findParentTask);
                                  setEditingSubtask(null);
                                  setEditSubtaskTitle('');
                                }
                              } else if (e.key === 'Escape') {
                                setEditingSubtask(null);
                                setEditSubtaskTitle('');
                              }
                            }}
                            onCalendarToggle={(subtaskId) => {
                              setCalendarSubtaskId(prev => prev === subtaskId ? null : subtaskId);
                            }}
                            onDeleteSubtask={(subtaskId) => handleDeleteSubtask(subtaskId, findParentTask)}
                            onUpdateSubtaskPriority={(subtaskId, priority) =>
                              handleUpdateSubtaskPriority(subtaskId, priority, findParentTask)
                            }
                            onUpdateSubtaskEstimatedTime={(subtaskId, time) =>
                              handleUpdateSubtaskEstimatedTime(subtaskId, time, findParentTask)
                            }
                            onUpdateSubtaskDescription={(subtaskId, description) =>
                              handleUpdateSubtaskDescription(subtaskId, description, findParentTask)
                            }
                            onStartAddingSubtask={(taskId) => {
                              setAddingSubtaskToTask(taskId);
                              setNewSubtaskTitle('');
                            }}
                            onNewSubtaskTitleChange={setNewSubtaskTitle}
                            onSaveNewSubtask={async (taskId) => {
                              await handleSaveNewSubtask(taskId, newSubtaskTitle);
                              setAddingSubtaskToTask(null);
                              setNewSubtaskTitle('');
                            }}
                            onNewSubtaskKeyDown={(e, taskId) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveNewSubtask(taskId, newSubtaskTitle);
                                setAddingSubtaskToTask(null);
                                setNewSubtaskTitle('');
                              } else if (e.key === 'Escape') {
                                setAddingSubtaskToTask(null);
                                setNewSubtaskTitle('');
                              }
                            }}
                            formatMsAsClock={formatMsAsClock}
                            getTaskTimeSummary={getTaskTimeSummary}
                            themeName="AMBER"
                          />
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </LayoutGroup>
          ) : (
            <div className={`p-6 rounded-lg ${themeColors.cardBg} border text-center`}>
              <p className={`text-sm ${themeColors.textMuted}`}>
                No tasks allocated for today yet.
              </p>
              <p className={`text-xs ${themeColors.textMuted} mt-1`}>
                Add a task below or pull one from "To Be Allocated"
              </p>
            </div>
          )}

          {/* Add Task Button */}
          <div className="px-3">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full ${themeColors.buttonClass} transition-all duration-200 text-sm border`}
              onClick={onCreateNewTask}
              disabled={loadingOperations['create-task']}
              aria-label="Add new task for today"
            >
              <Plus className="h-4 w-4 mr-2" />
              {loadingOperations['create-task'] ? 'Creating...' : 'Add Task for Today'}
            </Button>
          </div>
        </div>

        {/* TO BE ALLOCATED SECTION */}
        {unallocatedTasks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setShowUnallocated(!showUnallocated)}
              className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
              aria-expanded={showUnallocated}
              aria-controls="unallocated-tasks"
            >
              <div className="flex items-center gap-2">
                <h2 className={`text-sm font-medium ${themeColors.sectionHeader} uppercase tracking-wider`}>
                  To Be Allocated
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300`}>
                  {unallocatedTasks.length}
                </span>
              </div>
              <motion.div
                animate={{ rotate: showUnallocated ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className={`h-4 w-4 ${themeColors.textMuted}`} />
              </motion.div>
            </button>

            <AnimatePresence>
              {showUnallocated && (
                <motion.div
                  id="unallocated-tasks"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    {unallocatedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout={!prefersReducedMotion}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 rounded-lg ${themeColors.unallocatedBg} border flex items-center justify-between group`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            task.workType === 'deep' ? 'bg-blue-400' : 'bg-green-400'
                          )} aria-hidden="true" />

                          <div className="min-w-0">
                            <p className={`text-sm ${themeColors.textColor} truncate`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                task.priority === 'urgent' && "bg-red-900/30 text-red-300",
                                task.priority === 'high' && "bg-orange-900/30 text-orange-300",
                                task.priority === 'medium' && "bg-yellow-900/30 text-yellow-300",
                                task.priority === 'low' && "bg-green-900/30 text-green-300",
                              )}>
                                {task.priority}
                              </span>
                              <span className={`text-xs ${themeColors.textMuted}`}>
                                {task.workType === 'deep' ? 'Deep' : 'Light'}
                              </span>
                              {(() => {
                                const summary = getTaskTimeSummary(task);
                                return summary.totalMinutes > 0 ? (
                                  <span className={`text-xs ${themeColors.textMuted}`}>
                                    {summary.formatted}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            // First allocate to today
                            await handleAllocateTask(task.id);
                            // Then auto-schedule into timebox
                            setTimeout(() => {
                              autoScheduleTask(task.id);
                            }, 200);
                          }}
                          disabled={loadingOperations[`allocate-${task.id}`] || loadingOperations[`schedule-${task.id}`]}
                          className={`flex-shrink-0 ${themeColors.buttonClass} text-xs`}
                          aria-label={`Auto-schedule "${task.title}"`}
                        >
                          <Zap className="h-3.5 w-3.5 mr-1" />
                          {loadingOperations[`allocate-${task.id}`] || loadingOperations[`schedule-${task.id}`]
                            ? 'Scheduling...'
                            : 'Auto-schedule'}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
