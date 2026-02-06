"use client";

import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  Brain,
  Zap,
  Play,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/task-detail-drawer";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  timeEstimate?: string;
  subtasks: Subtask[];
  focusIntensity?: 1 | 2 | 3 | 4;
}

interface BeautifulTaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  workType?: "light" | "deep";
  onToggleComplete?: (taskId: string) => void;
  onUpdate?: (task: Task) => void;
  onStartFocus?: (taskId: string) => void;
}

// =============================================================================
// THEME CONFIG
// =============================================================================

const THEMES = {
  light: {
    primary: "emerald",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/20",
    accentBorder: "border-emerald-500/30",
    accentGradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-950/30",
    ring: "ring-emerald-500/30",
  },
  deep: {
    primary: "blue",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/20",
    accentBorder: "border-blue-500/30",
    accentGradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-950/30",
    ring: "ring-blue-500/30",
  },
};

const PRIORITY_CONFIG = {
  urgent: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Urgent" },
  high: { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", label: "High" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Medium" },
  low: { color: "text-gray-400", bg: "bg-gray-500/20", border: "border-gray-500/30", label: "Low" },
};

// =============================================================================
// COMPONENTS
// =============================================================================

const ProgressRing = memo(({ progress, size = 48, strokeWidth = 4, theme }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  theme: typeof THEMES.light;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={theme.accent}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-sm font-bold", theme.accent)}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
});

const Badge = memo(({ children, variant = "default", theme }: {
  children: React.ReactNode;
  variant?: "default" | "priority" | "intensity";
  theme: typeof THEMES.light;
}) => {
  const variants = {
    default: cn("bg-white/5 text-white/70 border-white/10"),
    priority: cn(theme.accentBg, theme.accent, theme.accentBorder),
    intensity: cn("bg-white/10 text-white/80 border-white/20"),
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      variants[variant]
    )}>
      {children}
    </span>
  );
});

const SubtaskItem = memo(({ subtask, theme, onToggle }: {
  subtask: Subtask;
  theme: typeof THEMES.light;
  onToggle: (id: string) => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      "bg-white/5 border-white/5 hover:bg-white/10",
      subtask.completed && "opacity-50"
    )}
  >
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onToggle(subtask.id)}
      className={cn(
        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
        subtask.completed
          ? cn(theme.accentBg, theme.accentBorder, theme.accent)
          : "border-white/30 hover:border-white/50"
      )}
    >
      {subtask.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
    </motion.button>
    <span className={cn(
      "flex-1 text-sm transition-all",
      subtask.completed ? "text-white/40 line-through" : "text-white/80"
    )}>
      {subtask.title}
    </span>
  </motion.div>
));

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const BeautifulTaskDetail = memo(({
  task,
  isOpen,
  onClose,
  workType = "light",
  onToggleComplete,
  onUpdate,
  onStartFocus,
}: BeautifulTaskDetailProps) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const theme = THEMES[workType];

  // Calculate progress
  const progress = task
    ? Math.round((task.subtasks.filter(s => s.completed).length / (task.subtasks.length || 1)) * 100)
    : 0;

  const handleToggleSubtask = useCallback((subtaskId: string) => {
    if (!editedTask) return;
    setEditedTask(prev => prev ? {
      ...prev,
      subtasks: prev.subtasks.map(s =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      )
    } : null);
  }, [editedTask]);

  const handleAddSubtask = useCallback(() => {
    if (!editedTask) return;
    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: "New subtask",
      completed: false,
    };
    setEditedTask(prev => prev ? {
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    } : null);
  }, [editedTask]);

  if (!task) return null;

  const priority = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent theme={workType} onClose={onClose} className="h-[92vh]">
        {/* Header */}
        <DrawerHeader className="space-y-4">
          {/* Top Row: Progress + Actions */}
          <div className="flex items-start gap-4">
            <ProgressRing progress={progress} theme={theme} />

            <div className="flex-1 min-w-0 space-y-2">
              {/* Title */}
              <DrawerTitle className="text-2xl leading-tight">
                {task.title}
              </DrawerTitle>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                {priority && (
                  <Badge variant="priority" theme={theme}>
                    <Zap className="w-3 h-3" />
                    {priority.label}
                  </Badge>
                )}
                {task.focusIntensity && (
                  <Badge variant="intensity" theme={theme}>
                    <Brain className="w-3 h-3" />
                    Focus {task.focusIntensity}
                  </Badge>
                )}
                {task.dueDate && (
                  <Badge variant="default" theme={theme}>
                    <Calendar className="w-3 h-3" />
                    {task.dueDate}
                  </Badge>
                )}
                {task.timeEstimate && (
                  <Badge variant="default" theme={theme}>
                    <Clock className="w-3 h-3" />
                    {task.timeEstimate}
                  </Badge>
                )}
              </div>
            </div>

            {/* Complete Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleComplete?.(task.id)}
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                "border-2",
                task.completed
                  ? cn(theme.accentBg, theme.accentBorder, theme.accent)
                  : "bg-white/5 border-white/20 hover:border-white/40"
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6 text-white/40" />
              )}
            </motion.button>
          </div>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6 scrollbar-hide">
          {/* Description */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Description
            </label>
            <Textarea
              value={task.description || ""}
              placeholder="Add a description..."
              className={cn(
                "min-h-[100px] bg-white/5 border-white/10 rounded-xl",
                "text-white/80 placeholder:text-white/30",
                "focus:border-white/20 focus:ring-1 focus:ring-white/10",
                "resize-none transition-all"
              )}
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
              </label>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddSubtask}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  theme.accentBg,
                  theme.accent,
                  "hover:bg-opacity-30"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </motion.button>
            </div>

            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    theme={theme}
                    onToggle={handleToggleSubtask}
                  />
                ))}
              </div>
            </AnimatePresence>

            {task.subtasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-3", theme.accentBg)}>
                  <CheckCircle2 className={cn("w-8 h-8", theme.accent)} />
                </div>
                <p className="text-white/40 text-sm">No subtasks yet</p>
                <p className="text-white/30 text-xs mt-1">Break this task into smaller steps</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DrawerFooter>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartFocus?.(task.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all",
                "bg-gradient-to-r",
                theme.accentGradient,
                "text-white shadow-lg",
                workType === "light"
                  ? "shadow-emerald-500/25"
                  : "shadow-blue-500/25"
              )}
            >
              <Play className="w-4 h-4 fill-current" />
              Start Focus
            </motion.button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

BeautifulTaskDetail.displayName = "BeautifulTaskDetail";
