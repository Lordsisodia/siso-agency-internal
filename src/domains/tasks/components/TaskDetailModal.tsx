"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Tag,
  Brain,
  Target,
  Zap,
  Timer,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Play,
  Save,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

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

interface TimeboxTask {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: "morning" | "deep-work" | "light-work" | "wellness" | "admin";
  description?: string;
  completed: boolean;
  color: string;
  focusIntensity?: 1 | 2 | 3 | 4;
  subtasks?: Subtask[];
  priority?: string;
  clientId?: string;
  timeEstimate?: string;
}

interface TaskDetailModalProps {
  task: TimeboxTask | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete?: (taskId: string) => void;
  onTaskUpdate?: (updatedTask: TimeboxTask) => void;
  onStartFocusSession?: (taskId: string, subtaskId?: string) => void;
  workType?: "light" | "deep";
}

// =============================================================================
// STATIC CONFIGURATION OBJECTS (defined once, not on every render)
// =============================================================================

const CATEGORY_CONFIG = {
  morning: {
    icon: "",
    label: "Morning Routine",
    textColor: "text-orange-300",
    bgColor: "bg-orange-900/20",
    borderColor: "border-orange-500/40",
    gradient: "from-orange-500 to-amber-500",
  },
  "deep-work": {
    icon: "",
    label: "Deep Work",
    textColor: "text-blue-300",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-500/40",
    gradient: "from-blue-500 to-cyan-500",
  },
  "light-work": {
    icon: "",
    label: "Light Work",
    textColor: "text-green-300",
    bgColor: "bg-green-900/20",
    borderColor: "border-green-500/40",
    gradient: "from-emerald-500 to-teal-500",
  },
  wellness: {
    icon: "",
    label: "Wellness",
    textColor: "text-teal-300",
    bgColor: "bg-teal-900/20",
    borderColor: "border-teal-500/40",
    gradient: "from-teal-500 to-emerald-500",
  },
  admin: {
    icon: "",
    label: "Administrative",
    textColor: "text-indigo-300",
    bgColor: "bg-indigo-900/20",
    borderColor: "border-indigo-500/40",
    gradient: "from-indigo-500 to-purple-500",
  },
} as const;

const INTENSITY_CONFIG = {
  1: {
    name: "Light Focus",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: Clock,
    gradient: "from-blue-500 to-cyan-500",
  },
  2: {
    name: "Medium Focus",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    icon: Target,
    gradient: "from-yellow-500 to-amber-500",
  },
  3: {
    name: "Deep Flow",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: Brain,
    gradient: "from-emerald-500 to-green-500",
  },
  4: {
    name: "Ultra-Deep",
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: Zap,
    gradient: "from-red-500 to-orange-500",
  },
} as const;

const PRIORITY_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  low: {
    icon: "",
    label: "Low",
    color: "bg-green-900/30 text-green-300 border-green-500/30",
  },
  medium: {
    icon: "",
    label: "Medium",
    color: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  },
  high: {
    icon: "",
    label: "High",
    color: "bg-red-900/30 text-red-300 border-red-500/30",
  },
  urgent: {
    icon: "",
    label: "Urgent",
    color: "bg-purple-900/30 text-purple-300 border-purple-500/30",
  },
};

const STATUS_ICONS = {
  completed: CheckCircle2,
  "in-progress": Circle,
  pending: Circle,
} as const;

// =============================================================================
// ANIMATION CONFIGS (respects reduced motion)
// =============================================================================

const getModalAnimation = (shouldReduceMotion: boolean) => ({
  initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 },
  animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  exit: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 },
  transition: shouldReduceMotion
    ? { duration: 0.1 }
    : { duration: 0.2, ease: "easeOut" },
});

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

/**
 * Focus trap hook - traps focus within the modal when open
 */
const useFocusTrap = (isOpen: boolean, onEscape: () => void) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;

    // Find all focusable elements
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const getFocusableElements = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));

    // Focus first element when modal opens
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      // Small delay to ensure modal is rendered
      setTimeout(() => focusableElements[0]?.focus(), 50);
    }

    // Handle tab key for focus trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      // Shift + Tab on first element -> move to last
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> move to first
      else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleEscape);

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onEscape]);

  return containerRef;
};

// =============================================================================
// COMPONENT
// =============================================================================

const TaskDetailModal: React.FC<TaskDetailModalProps> = memo(({
  task,
  isOpen,
  onClose,
  onToggleComplete,
  onTaskUpdate,
  onStartFocusSession,
  workType = "light",
}) => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [editingTask, setEditingTask] = useState<TimeboxTask | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(
    new Set()
  );

  // ---------------------------------------------------------------------------
  // HOOKS
  // ---------------------------------------------------------------------------
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useFocusTrap(isOpen, onClose);

  // ---------------------------------------------------------------------------
  // MEMOIZED VALUES
  // ---------------------------------------------------------------------------

  // Initialize editing state when task changes
  useEffect(() => {
    if (task) {
      setEditingTask({
        ...task,
        subtasks: task.subtasks || [],
      });
    }
  }, [task]);

  // Memoized config lookups
  const config = useMemo(
    () => (task ? CATEGORY_CONFIG[task.category] : null),
    [task?.category]
  );

  const intensity = useMemo(
    () => INTENSITY_CONFIG[editingTask?.focusIntensity || 2],
    [editingTask?.focusIntensity]
  );

  const priority = useMemo(
    () => PRIORITY_CONFIG[editingTask?.priority || "medium"],
    [editingTask?.priority]
  );

  // Memoized duration calculation
  const duration = useMemo(() => {
    if (!task) return { hours: 0, minutes: 0 };
    return {
      hours: Math.floor(task.duration / 60),
      minutes: task.duration % 60,
    };
  }, [task?.duration]);

  // Memoized theme colors based on work type
  const theme = useMemo(() => {
    const isDeepWork = workType === "deep";
    return {
      isDeepWork,
      color: isDeepWork ? "blue" : "green",
      bg: isDeepWork ? "bg-blue-900/20" : "bg-green-900/20",
      border: isDeepWork ? "border-blue-500/30" : "border-green-500/30",
      text: isDeepWork ? "text-blue-300" : "text-green-300",
      textSecondary: isDeepWork ? "text-blue-200" : "text-green-200",
      inputBg: isDeepWork ? "bg-blue-900/30" : "bg-green-900/30",
      inputBorder: isDeepWork ? "border-blue-600/40" : "border-green-600/40",
      button: isDeepWork
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : "bg-emerald-600 hover:bg-emerald-700 text-white",
      badge: isDeepWork
        ? "bg-blue-900/30 text-blue-300 border-blue-500/30"
        : "bg-emerald-900/30 text-emerald-300 border-emerald-500/30",
    };
  }, [workType]);

  // Memoized animation config
  const modalAnimation = useMemo(
    () => getModalAnimation(!!shouldReduceMotion),
    [shouldReduceMotion]
  );

  // ---------------------------------------------------------------------------
  // CALLBACKS (memoized event handlers)
  // ---------------------------------------------------------------------------

  const getStatusIcon = useCallback(
    (status: string) => {
      const IconComponent =
        status === "completed"
          ? CheckCircle2
          : status === "in-progress"
          ? Circle
          : Circle;
      const className =
        status === "completed"
          ? "h-4 w-4 text-green-400"
          : status === "in-progress"
          ? cn("h-4 w-4", theme.text)
          : "h-4 w-4 text-gray-500";
      return <IconComponent className={className} />;
    },
    [theme.text]
  );

  const toggleSubtaskExpansion = useCallback((subtaskId: string) => {
    setExpandedSubtasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
  }, []);

  const toggleSubtaskStatus = useCallback(
    (subtaskId: string) => {
      if (!editingTask?.subtasks) return;
      const updatedSubtasks = editingTask.subtasks.map((subtask) => {
        if (subtask.id === subtaskId) {
          const newStatus =
            subtask.status === "completed" ? "pending" : "completed";
          return {
            ...subtask,
            status: newStatus,
            completed: newStatus === "completed",
          };
        }
        return subtask;
      });
      setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
    },
    [editingTask]
  );

  const deleteSubtask = useCallback(
    (subtaskId: string) => {
      if (!editingTask?.subtasks) return;
      const updatedSubtasks = editingTask.subtasks.filter(
        (s) => s.id !== subtaskId
      );
      setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
    },
    [editingTask]
  );

  const updateSubtask = useCallback(
    (subtaskId: string, updates: Partial<Subtask>) => {
      if (!editingTask?.subtasks) return;
      const updatedSubtasks = editingTask.subtasks.map((subtask) => {
        if (subtask.id === subtaskId) {
          return { ...subtask, ...updates };
        }
        return subtask;
      });
      setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
    },
    [editingTask]
  );

  const addSubtask = useCallback(() => {
    if (!editingTask) return;
    const newSubtask: Subtask = {
      id: `${editingTask.id}-${Date.now()}`,
      title: "New subtask",
      description: "",
      status: "pending",
      priority: "medium",
      estimatedTime: "30min",
      tools: [],
      completed: false,
    };
    setEditingTask({
      ...editingTask,
      subtasks: [...(editingTask.subtasks || []), newSubtask],
    });
    setEditingSubtask(newSubtask.id);
  }, [editingTask]);

  const saveChanges = useCallback(() => {
    if (editingTask) {
      onTaskUpdate?.(editingTask);
    }
    onClose();
  }, [editingTask, onTaskUpdate, onClose]);

  const handleToggleComplete = useCallback(() => {
    if (!editingTask) return;
    onToggleComplete?.(editingTask.id);
    setEditingTask({ ...editingTask, completed: !editingTask.completed });
  }, [editingTask, onToggleComplete]);

  const handleStartFocusSession = useCallback(() => {
    if (editingTask) {
      onStartFocusSession?.(editingTask.id);
    }
  }, [editingTask, onStartFocusSession]);

  const handleStartSubtaskFocus = useCallback(
    (subtaskId: string) => {
      if (editingTask) {
        onStartFocusSession?.(editingTask.id, subtaskId);
      }
    },
    [editingTask, onStartFocusSession]
  );

  const handleCloseEditingSubtask = useCallback(() => {
    setEditingSubtask(null);
  }, []);

  const handleStartEditingSubtask = useCallback((subtaskId: string) => {
    setEditingSubtask(subtaskId);
  }, []);

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (editingTask) {
        setEditingTask({ ...editingTask, description: e.target.value });
      }
    },
    [editingTask]
  );

  const handleSubtaskTitleChange = useCallback(
    (subtaskId: string, value: string) => {
      updateSubtask(subtaskId, { title: value });
    },
    [updateSubtask]
  );

  const handleSubtaskDescriptionChange = useCallback(
    (subtaskId: string, value: string) => {
      updateSubtask(subtaskId, { description: value });
    },
    [updateSubtask]
  );

  const handleSubtaskTimeChange = useCallback(
    (subtaskId: string, value: string) => {
      updateSubtask(subtaskId, { estimatedTime: value });
    },
    [updateSubtask]
  );

  // ---------------------------------------------------------------------------
  // EARLY RETURN
  // ---------------------------------------------------------------------------

  if (!task || !editingTask || !config) return null;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent
        ref={containerRef}
        className={cn(
          "bg-siso-bg/95 backdrop-blur-xl border-t border-white/10",
          "h-[92vh] max-h-[92vh]",
          "flex flex-col"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div
            className="w-14 h-1.5 bg-white/20 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Header */}
        <DrawerHeader className="px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-4">
            {/* Intensity Icon */}
            <div
              className={cn(
                "p-3 rounded-2xl shrink-0",
                "bg-gradient-to-br",
                intensity.gradient,
                "shadow-lg"
              )}
              aria-hidden="true"
            >
              <intensity.icon className="w-6 h-6 text-white" />
            </div>

            {/* Title & Badges */}
            <div className="flex-1 min-w-0">
              <DrawerTitle
                id="task-detail-title"
                className="text-xl font-bold text-white leading-tight mb-2"
              >
                {editingTask.title}
              </DrawerTitle>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Badge */}
                <Badge
                  className={cn(
                    "text-xs font-medium",
                    config.bgColor,
                    config.borderColor,
                    config.textColor,
                    "border"
                  )}
                >
                  <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                  {config.label}
                </Badge>

                {/* Intensity Badge */}
                <Badge
                  className={cn(
                    "text-xs font-medium border",
                    intensity.color
                  )}
                >
                  {intensity.name}
                </Badge>

                {/* Priority Badge */}
                <Badge
                  className={cn(
                    "text-xs font-medium border",
                    priority.color
                  )}
                >
                  {priority.label}
                </Badge>

                {/* Work Type Badge */}
                <Badge
                  className={cn(
                    "text-xs font-medium border",
                    theme.badge
                  )}
                >
                  {theme.isDeepWork ? "Deep Work" : "Light Work"}
                </Badge>
              </div>
            </div>

            {/* Close Button */}
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl shrink-0"
                aria-label="Close task details"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Time Card */}
            <div
              className={cn(
                "rounded-xl p-4 border",
                "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-medium uppercase tracking-wider">
                  Time
                </span>
              </div>
              <div className="text-white font-semibold">
                {editingTask.startTime} - {editingTask.endTime}
              </div>
            </div>

            {/* Duration Card */}
            <div
              className={cn(
                "rounded-xl p-4 border",
                "bg-white/5 border-white/10"
              )}
            >
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-medium uppercase tracking-wider">
                  Duration
                </span>
              </div>
              <div className="text-white font-semibold">
                {duration.hours > 0 && `${duration.hours}h `}
                {duration.minutes > 0 && `${duration.minutes}m`}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div
            className={cn(
              "rounded-xl p-4 border",
              theme.bg,
              theme.border
            )}
          >
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
              <span className="font-medium uppercase tracking-wider">
                Description
              </span>
            </div>
            <Textarea
              value={editingTask.description || ""}
              onChange={handleDescriptionChange}
              className={cn(
                "min-h-[80px] resize-none text-sm",
                "bg-black/20 border-white/10 text-white placeholder:text-gray-500",
                "focus:border-white/20 focus:ring-0"
              )}
              placeholder="Add task description..."
              aria-label="Task description"
            />
          </div>

          {/* Status & Actions */}
          <div
            className={cn(
              "rounded-xl p-4 border",
              "bg-white/5 border-white/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleComplete}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    editingTask.completed
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/5 text-gray-500 hover:bg-white/10"
                  )}
                  aria-label={
                    editingTask.completed
                      ? "Mark task as incomplete"
                      : "Mark task as complete"
                  }
                  aria-pressed={editingTask.completed}
                >
                  {editingTask.completed ? (
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Circle className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                <div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      editingTask.completed ? "text-green-400" : "text-gray-300"
                    )}
                  >
                    {editingTask.completed ? "Completed" : "Not Completed"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tap to toggle status
                  </div>
                </div>
              </div>

              {/* Start Focus Button */}
              <Button
                onClick={handleStartFocusSession}
                className={cn("rounded-xl font-medium", theme.button)}
                size="sm"
                aria-label="Start focus session for this task"
              >
                <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                Start Focus
              </Button>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className={cn("text-sm font-semibold", theme.textSecondary)}
              >
                Subtasks ({editingTask.subtasks?.length || 0})
              </h3>
              <Button
                size="sm"
                onClick={addSubtask}
                className={cn("rounded-lg text-xs", theme.button)}
                aria-label="Add new subtask"
              >
                <Plus className="w-3 h-3 mr-1" aria-hidden="true" />
                Add
              </Button>
            </div>

            {/* Subtasks List */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {editingTask.subtasks?.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    {...modalAnimation}
                    className={cn(
                      "rounded-xl border p-4",
                      theme.bg,
                      theme.border
                    )}
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleSubtaskStatus(subtask.id)}
                          className="mt-0.5 p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                          aria-label={
                            subtask.status === "completed"
                              ? "Mark subtask as pending"
                              : "Mark subtask as completed"
                          }
                          aria-pressed={subtask.status === "completed"}
                        >
                          {getStatusIcon(subtask.status)}
                        </button>

                        <div className="flex-1 min-w-0">
                          {editingSubtask === subtask.id ? (
                            <div className="space-y-2">
                              <Input
                                value={subtask.title}
                                onChange={(e) =>
                                  handleSubtaskTitleChange(
                                    subtask.id,
                                    e.target.value
                                  )
                                }
                                className={cn(
                                  "text-sm",
                                  theme.inputBg,
                                  theme.inputBorder,
                                  "text-white border focus:border-white/30"
                                )}
                                placeholder="Subtask title"
                                aria-label="Subtask title"
                              />
                              <Textarea
                                value={subtask.description}
                                onChange={(e) =>
                                  handleSubtaskDescriptionChange(
                                    subtask.id,
                                    e.target.value
                                  )
                                }
                                className={cn(
                                  "text-sm min-h-[60px] resize-none",
                                  theme.inputBg,
                                  theme.inputBorder,
                                  "text-white border focus:border-white/30"
                                )}
                                placeholder="Description"
                                rows={2}
                                aria-label="Subtask description"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={subtask.estimatedTime || ""}
                                  onChange={(e) =>
                                    handleSubtaskTimeChange(
                                      subtask.id,
                                      e.target.value
                                    )
                                  }
                                  className={cn(
                                    "text-sm flex-1",
                                    theme.inputBg,
                                    theme.inputBorder,
                                    "text-white border focus:border-white/30"
                                  )}
                                  placeholder="30min"
                                  aria-label="Estimated time"
                                />
                                <Button
                                  size="sm"
                                  onClick={handleCloseEditingSubtask}
                                  className="bg-green-600 hover:bg-green-700 rounded-lg"
                                  aria-label="Save subtask changes"
                                >
                                  <Save
                                    className="w-3 h-3 mr-1"
                                    aria-hidden="true"
                                  />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <h4
                                className={cn(
                                  "font-medium text-sm",
                                  subtask.status === "completed"
                                    ? "text-gray-500 line-through"
                                    : "text-white"
                                )}
                              >
                                {subtask.title}
                              </h4>
                              {subtask.description && (
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  {subtask.description}
                                </p>
                              )}
                              {subtask.estimatedTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Timer
                                    className="w-3 h-3 mr-1"
                                    aria-hidden="true"
                                  />
                                  {subtask.estimatedTime}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subtask Actions */}
                      {editingSubtask !== subtask.id && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartSubtaskFocus(subtask.id)}
                            className={cn(
                              "h-8 w-8 p-0 rounded-lg",
                              theme.text,
                              "hover:bg-white/10"
                            )}
                            aria-label={`Start focus session for subtask: ${subtask.title}`}
                          >
                            <Play
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEditingSubtask(subtask.id)}
                            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                            aria-label={`Edit subtask: ${subtask.title}`}
                          >
                            <Edit3
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSubtask(subtask.id)}
                            className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            aria-label={`Delete subtask: ${subtask.title}`}
                          >
                            <Trash2
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(!editingTask.subtasks || editingTask.subtasks.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No subtasks yet</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Add subtasks to break down your work
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0 bg-white/5">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Cancel changes and close"
            >
              Cancel
            </Button>
            <Button
              onClick={saveChanges}
              className={cn("flex-1 rounded-xl font-medium", theme.button)}
              aria-label="Save task changes"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

TaskDetailModal.displayName = "TaskDetailModal";

export default TaskDetailModal;
