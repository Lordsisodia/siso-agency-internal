"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
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
  Plus,
  Edit3,
  Trash2,
  Play,
  Save,
  MoreHorizontal,
  Sparkles,
  Check,
  ArrowRight,
  GripVertical,
  Flame,
  TrendingUp,
  Activity
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
  DrawerClose
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// Types
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
  category: 'morning' | 'deep-work' | 'light-work' | 'wellness' | 'admin';
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
  workType?: 'light' | 'deep';
}

// Category configuration with premium gradients
const categoryConfig = {
  'morning': {
    icon: Flame,
    label: 'Morning Routine',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'shadow-orange-500/30'
  },
  'deep-work': {
    icon: Brain,
    label: 'Deep Work',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    glowColor: 'shadow-blue-500/30'
  },
  'light-work': {
    icon: Zap,
    label: 'Light Work',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glowColor: 'shadow-emerald-500/30'
  },
  'wellness': {
    icon: Activity,
    label: 'Wellness',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    gradient: 'from-teal-500 via-emerald-500 to-green-500',
    glowColor: 'shadow-teal-500/30'
  },
  'admin': {
    icon: Target,
    label: 'Administrative',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    glowColor: 'shadow-indigo-500/30'
  }
};

// Focus intensity configuration
const intensityConfig = {
  1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock, gradient: 'from-blue-500 to-cyan-500' },
  2: { name: 'Medium Focus', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Target, gradient: 'from-amber-500 to-orange-500' },
  3: { name: 'Deep Flow', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Brain, gradient: 'from-emerald-500 to-green-500' },
  4: { name: 'Ultra-Deep', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: Zap, gradient: 'from-rose-500 to-orange-500' }
};

// Priority configuration
const priorityConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  low: { icon: Activity, label: 'Low', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  medium: { icon: TrendingUp, label: 'Medium', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  high: { icon: Flame, label: 'High', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  urgent: { icon: Zap, label: 'Urgent', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' }
};

// Animated gradient background component
const AnimatedGradientBackground: React.FC<{ gradient: string }> = ({ gradient }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
    </div>
  );
};

// Circular progress ring component
const CircularProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradient: string;
  children?: React.ReactNode;
}> = ({ progress, size = 80, strokeWidth = 6, gradient, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <defs>
          <linearGradient id={`gradient-${gradient.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" className="text-white/20" />
            <stop offset="100%" stopColor="currentColor" className="text-white/10" />
          </linearGradient>
        </defs>

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
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn("text-transparent bg-gradient-to-r", gradient)} />
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#ccc" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Inline editable title component
const InlineEditableTitle: React.FC<{
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}> = ({ title, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg font-semibold h-10"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
        >
          <Check className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("group flex items-center gap-2 cursor-pointer", className)}
      onClick={() => setIsEditing(true)}
      whileHover={{ x: 2 }}
    >
      <span className="text-xl font-bold text-white leading-tight">{title}</span>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit3 className="w-4 h-4 text-white/50" />
      </motion.div>
    </motion.div>
  );
};

// Swipeable subtask item component
const SwipeableSubtaskItem: React.FC<{
  subtask: Subtask;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartFocus: () => void;
  themeColor: string;
  getStatusIcon: (status: string) => React.ReactNode;
}> = ({ subtask, onToggle, onEdit, onDelete, onStartFocus, themeColor, getStatusIcon }) => {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, -100, 0, 100, 150],
    [
      "rgba(239, 68, 68, 0.3)",
      "rgba(239, 68, 68, 0.1)",
      "rgba(255, 255, 255, 0.05)",
      "rgba(59, 130, 246, 0.1)",
      "rgba(59, 130, 246, 0.3)"
    ]
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete();
    } else if (info.offset.x > 100) {
      onStartFocus();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-blue-300">
          <Play className="w-5 h-5" />
          <span className="text-sm font-medium">Focus</span>
        </div>
        <div className="flex items-center gap-2 text-rose-300">
          <span className="text-sm font-medium">Delete</span>
          <Trash2 className="w-5 h-5" />
        </div>
      </div>

      <motion.div
        style={{ x, background }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative rounded-xl border p-4 cursor-grab active:cursor-grabbing",
          "bg-white/5 border-white/10 backdrop-blur-sm"
        )}
      >
        <div className="flex items-start gap-3">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onToggle}
            className="mt-0.5 p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            {getStatusIcon(subtask.status)}
          </motion.button>

          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm transition-all",
              subtask.status === "completed"
                ? "text-white/40 line-through"
                : "text-white"
            )}>
              {subtask.title}
            </h4>
            {subtask.description && (
              <p className="text-xs text-white/50 leading-relaxed mt-1">
                {subtask.description}
              </p>
            )}
            {subtask.estimatedTime && (
              <div className="flex items-center text-xs text-white/40 mt-2">
                <Timer className="w-3 h-3 mr-1" />
                {subtask.estimatedTime}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Timeline bar component
const TimelineBar: React.FC<{
  startTime: string;
  endTime: string;
  duration: number;
  gradient: string;
}> = ({ startTime, endTime, duration, gradient }) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const durationHours = Math.floor(duration / 60);
  const durationMinutes = duration % 60;

  return (
    <div className="relative">
      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
        <span>{formatTime(startTime)}</span>
        <span className="font-medium text-white/70">
          {durationHours > 0 && `${durationHours}h `}{durationMinutes > 0 && `${durationMinutes}m`}
        </span>
        <span>{formatTime(endTime)}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", gradient)}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
};

// Completion celebration component
const CompletionCelebration: React.FC<{ show: boolean; onComplete: () => void }> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          onComplete();
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-black/80 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex items-center justify-center mb-3"
            >
              <Sparkles className="w-12 h-12 text-yellow-400" />
            </motion.div>
            <p className="text-2xl font-bold text-white text-center">Task Complete!</p>
            <p className="text-white/60 text-center mt-1">Great work!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Empty state illustration component
const EmptySubtasksState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
          <CheckCircle2 className="w-10 h-10 text-white/30" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500/30"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-blue-500/30"
        />
      </motion.div>

      <h3 className="text-lg font-semibold text-white mb-2">No subtasks yet</h3>
      <p className="text-sm text-white/50 text-center mb-6 max-w-xs">
        Break down your task into smaller, actionable steps to stay organized and track progress
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Add your first subtask</span>
      </motion.button>
    </motion.div>
  );
};

// Pressable button component with haptic feedback
const PressableButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}> = ({ children, onClick, className, variant = 'primary', disabled }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30",
    ghost: "text-white/70 hover:text-white hover:bg-white/10"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-xl px-4 py-3 font-medium transition-all",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ x: '-100%', opacity: 0 }}
        whileTap={{ x: '100%', opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};

// Main component
export const PremiumTaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onToggleComplete,
  onTaskUpdate,
  onStartFocusSession,
  workType = 'light'
}) => {
  const [editingTask, setEditingTask] = useState<TimeboxTask | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize editing state when task changes
  useEffect(() => {
    if (task) {
      setEditingTask({
        ...task,
        subtasks: task.subtasks || []
      });
      setIsCompleted(task.completed);
    }
  }, [task]);

  if (!task || !editingTask) return null;

  const config = categoryConfig[task.category];
  const intensity = intensityConfig[editingTask.focusIntensity || 2];
  const priority = priorityConfig[editingTask.priority || 'medium'];

  // Determine theme based on work type
  const isDeepWork = workType === 'deep';
  const themeColor = isDeepWork ? 'blue' : 'emerald';

  // Calculate progress
  const totalSubtasks = editingTask.subtasks?.length || 0;
  const completedSubtasks = editingTask.subtasks?.filter(s => s.completed).length || 0;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "in-progress":
        return <Circle className={cn("h-5 w-5", isDeepWork ? "text-blue-400" : "text-emerald-400")} />;
      default:
        return <Circle className="h-5 w-5 text-white/30" />;
    }
  };

  const toggleSubtaskStatus = (subtaskId: string) => {
    if (!editingTask.subtasks) return;
    const updatedSubtasks = editingTask.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        const newStatus = subtask.status === "completed" ? "pending" : "completed";
        return { ...subtask, status: newStatus, completed: newStatus === "completed" };
      }
      return subtask;
    });
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
  };

  const deleteSubtask = (subtaskId: string) => {
    if (!editingTask.subtasks) return;
    const updatedSubtasks = editingTask.subtasks.filter(s => s.id !== subtaskId);
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
  };

  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    if (!editingTask.subtasks) return;
    const updatedSubtasks = editingTask.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return { ...subtask, ...updates };
      }
      return subtask;
    });
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
  };

  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: `${editingTask.id}-${Date.now()}`,
      title: "New subtask",
      description: "",
      status: "pending",
      priority: "medium",
      estimatedTime: "30min",
      tools: [],
      completed: false
    };
    setEditingTask({
      ...editingTask,
      subtasks: [...(editingTask.subtasks || []), newSubtask]
    });
    setEditingSubtask(newSubtask.id);
  };

  const saveChanges = () => {
    onTaskUpdate?.(editingTask);
    onClose();
  };

  const handleToggleComplete = () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    setEditingTask({ ...editingTask, completed: newCompleted });
    onToggleComplete?.(task.id);

    if (newCompleted) {
      setShowCelebration(true);
    }
  };

  const handleTitleSave = (newTitle: string) => {
    setEditingTask({ ...editingTask, title: newTitle });
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent
          className={cn(
            "bg-black/95 backdrop-blur-2xl border-t border-white/10",
            "h-[95vh] max-h-[95vh]",
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Glassmorphism Header with Animated Gradient */}
          <div className="relative shrink-0">
            <AnimatedGradientBackground gradient={config.gradient} />

            {/* Drag Handle */}
            <div className="relative flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Header Content */}
            <DrawerHeader className="relative px-6 pb-6">
              <div className="flex items-start gap-4">
                {/* Circular Progress Ring with Intensity Icon */}
                <div className="shrink-0">
                  <CircularProgressRing
                    progress={progressPercentage}
                    size={72}
                    strokeWidth={5}
                    gradient={config.gradient}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br shadow-lg",
                      config.gradient,
                      config.glowColor,
                      "shadow-lg"
                    )}>
                      <intensity.icon className="w-6 h-6 text-white" />
                    </div>
                  </CircularProgressRing>
                </div>

                {/* Title & Badges */}
                <div className="flex-1 min-w-0 pt-1">
                  <InlineEditableTitle
                    title={editingTask.title}
                    onSave={handleTitleSave}
                    className="mb-3"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs font-medium backdrop-blur-sm",
                        config.bgColor,
                        config.borderColor,
                        config.textColor,
                        "border"
                      )}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>

                    <Badge
                      className={cn(
                        "text-xs font-medium border backdrop-blur-sm",
                        intensity.color
                      )}
                    >
                      {intensity.name}
                    </Badge>

                    <Badge
                      className={cn(
                        "text-xs font-medium border backdrop-blur-sm",
                        priority.color
                      )}
                    >
                      <priority.icon className="h-3 w-3 mr-1" />
                      {priority.label}
                    </Badge>
                  </div>
                </div>

                {/* Close Button */}
                <DrawerClose asChild>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </DrawerClose>
              </div>

              {/* Timeline Bar */}
              <div className="mt-6">
                <TimelineBar
                  startTime={editingTask.startTime}
                  endTime={editingTask.endTime}
                  duration={editingTask.duration}
                  gradient={config.gradient}
                />
              </div>
            </DrawerHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "rounded-2xl border p-5",
                "bg-white/5 border-white/10 backdrop-blur-sm"
              )}
            >
              <div className="flex items-center gap-2 text-white/40 text-xs mb-3 uppercase tracking-wider font-semibold">
                <Edit3 className="h-3.5 w-3.5" />
                Description
              </div>
              <Textarea
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                className={cn(
                  "min-h-[100px] resize-none text-sm bg-transparent border-0",
                  "text-white placeholder:text-white/30",
                  "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                placeholder="Add task description..."
              />
            </motion.div>

            {/* Status & Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "rounded-2xl border p-5",
                "bg-white/5 border-white/10 backdrop-blur-sm"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleComplete}
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30"
                        : "bg-white/10 hover:bg-white/20"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="completed"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <Check className="h-7 w-7 text-white" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="incomplete"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Circle className="h-7 w-7 text-white/40" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <div>
                    <div className={cn(
                      "text-base font-semibold transition-colors",
                      isCompleted ? "text-emerald-400" : "text-white"
                    )}>
                      {isCompleted ? "Task Completed" : "Mark as Complete"}
                    </div>
                    <div className="text-sm text-white/50">
                      {isCompleted
                        ? "Great job! Task is done."
                        : "Tap the circle when finished"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-xs text-white/50">
                    {completedSubtasks}/{totalSubtasks} done
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subtasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Subtasks
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSubtask}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </motion.button>
              </div>

              {/* Subtasks List */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {editingTask.subtasks?.map((subtask, index) => (
                    <motion.div
                      key={subtask.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {editingSubtask === subtask.id ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl border p-4 bg-white/10 border-white/20"
                        >
                          <div className="space-y-3">
                            <Input
                              value={subtask.title}
                              onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                              className="bg-white/10 border-white/20 text-white text-sm"
                              placeholder="Subtask title"
                            />
                            <Textarea
                              value={subtask.description}
                              onChange={(e) => updateSubtask(subtask.id, { description: e.target.value })}
                              className="bg-white/10 border-white/20 text-white text-sm min-h-[60px] resize-none"
                              placeholder="Description"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Input
                                value={subtask.estimatedTime || ""}
                                onChange={(e) => updateSubtask(subtask.id, { estimatedTime: e.target.value })}
                                className="bg-white/10 border-white/20 text-white text-sm flex-1"
                                placeholder="30min"
                              />
                              <PressableButton
                                onClick={() => setEditingSubtask(null)}
                                variant="primary"
                                className="py-2 px-4"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </PressableButton>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <SwipeableSubtaskItem
                          subtask={subtask}
                          onToggle={() => toggleSubtaskStatus(subtask.id)}
                          onEdit={() => setEditingSubtask(subtask.id)}
                          onDelete={() => deleteSubtask(subtask.id)}
                          onStartFocus={() => onStartFocusSession?.(editingTask.id, subtask.id)}
                          themeColor={themeColor}
                          getStatusIcon={getStatusIcon}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {(!editingTask.subtasks || editingTask.subtasks.length === 0) && (
                  <EmptySubtasksState onAdd={addSubtask} />
                )}
              </div>
            </motion.div>
          </div>

          {/* Floating Action Bar */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
            className="relative shrink-0"
          >
            <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-black/95 to-transparent pointer-events-none" />
            <div className="px-6 py-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
              <div className="flex gap-3">
                <PressableButton
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </PressableButton>
                <PressableButton
                  onClick={() => onStartFocusSession?.(editingTask.id)}
                  variant="ghost"
                  className="px-4"
                >
                  <Play className="w-5 h-5" />
                </PressableButton>
                <PressableButton
                  onClick={saveChanges}
                  variant="primary"
                  className="flex-[2]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </PressableButton>
              </div>
            </div>
          </motion.div>
        </DrawerContent>
      </Drawer>

      {/* Completion Celebration */}
      <CompletionCelebration
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
};

export default PremiumTaskDetailModal;
