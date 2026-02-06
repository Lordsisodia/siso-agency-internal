"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Building2
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

// Category configuration with app colors
const categoryConfig = {
  'morning': {
    icon: '',
    label: 'Morning Routine',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-500/40',
    gradient: 'from-orange-500 to-amber-500'
  },
  'deep-work': {
    icon: '',
    label: 'Deep Work',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/40',
    gradient: 'from-blue-500 to-cyan-500'
  },
  'light-work': {
    icon: '',
    label: 'Light Work',
    textColor: 'text-green-300',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/40',
    gradient: 'from-emerald-500 to-teal-500'
  },
  'wellness': {
    icon: '',
    label: 'Wellness',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-900/20',
    borderColor: 'border-teal-500/40',
    gradient: 'from-teal-500 to-emerald-500'
  },
  'admin': {
    icon: '',
    label: 'Administrative',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-500/40',
    gradient: 'from-indigo-500 to-purple-500'
  }
};

// Focus intensity configuration
const intensityConfig = {
  1: { name: 'Light Focus', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock, gradient: 'from-blue-500 to-cyan-500' },
  2: { name: 'Medium Focus', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Target, gradient: 'from-yellow-500 to-amber-500' },
  3: { name: 'Deep Flow', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Brain, gradient: 'from-emerald-500 to-green-500' },
  4: { name: 'Ultra-Deep', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: Zap, gradient: 'from-red-500 to-orange-500' }
};

// Priority configuration
const priorityConfig: Record<string, { icon: string; label: string; color: string }> = {
  low: { icon: '', label: 'Low', color: 'bg-green-900/30 text-green-300 border-green-500/30' },
  medium: { icon: '', label: 'Medium', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' },
  high: { icon: '', label: 'High', color: 'bg-red-900/30 text-red-300 border-red-500/30' },
  urgent: { icon: '', label: 'Urgent', color: 'bg-purple-900/30 text-purple-300 border-purple-500/30' }
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
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
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  // Initialize editing state when task changes
  useEffect(() => {
    if (task) {
      setEditingTask({
        ...task,
        subtasks: task.subtasks || []
      });
    }
  }, [task]);

  if (!task || !editingTask) return null;

  const config = categoryConfig[task.category];
  const durationHours = Math.floor(task.duration / 60);
  const durationMinutes = task.duration % 60;
  const intensity = intensityConfig[editingTask.focusIntensity || 2];
  const priority = priorityConfig[editingTask.priority || 'medium'];

  // Determine theme based on work type
  const isDeepWork = workType === 'deep';
  const themeColor = isDeepWork ? 'blue' : 'green';
  const themeBg = isDeepWork ? 'bg-blue-900/20' : 'bg-green-900/20';
  const themeBorder = isDeepWork ? 'border-blue-500/30' : 'border-green-500/30';
  const themeText = isDeepWork ? 'text-blue-300' : 'text-green-300';
  const themeTextSecondary = isDeepWork ? 'text-blue-200' : 'text-green-200';
  const themeInputBg = isDeepWork ? 'bg-blue-900/30' : 'bg-green-900/30';
  const themeInputBorder = isDeepWork ? 'border-blue-600/40' : 'border-green-600/40';
  const themeButton = isDeepWork
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "in-progress":
        return <Circle className={cn("h-4 w-4", themeText)} />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleSubtaskExpansion = (subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subtaskId)) {
        newSet.delete(subtaskId);
      } else {
        newSet.add(subtaskId);
      }
      return newSet;
    });
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
    onToggleComplete?.(task.id);
    setEditingTask({ ...editingTask, completed: !editingTask.completed });
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent
        className={cn(
          "bg-siso-bg/95 backdrop-blur-xl border-t border-white/10",
          "h-[92vh] max-h-[92vh]",
          "flex flex-col"
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-14 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <DrawerHeader className="px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-4">
            {/* Intensity Icon */}
            <div className={cn(
              "p-3 rounded-2xl shrink-0",
              "bg-gradient-to-br",
              intensity.gradient,
              "shadow-lg"
            )}>
              <intensity.icon className="w-6 h-6 text-white" />
            </div>

            {/* Title & Badges */}
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-bold text-white leading-tight mb-2">
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
                  <Tag className="h-3 w-3 mr-1" />
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
                    isDeepWork
                      ? "bg-blue-900/30 text-blue-300 border-blue-500/30"
                      : "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                  )}
                >
                  {isDeepWork ? 'Deep Work' : 'Light Work'}
                </Badge>
              </div>
            </div>

            {/* Close Button */}
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Time Card */}
            <div className={cn(
              "rounded-xl p-4 border",
              "bg-white/5 border-white/10"
            )}>
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium uppercase tracking-wider">Time</span>
              </div>
              <div className="text-white font-semibold">
                {editingTask.startTime} - {editingTask.endTime}
              </div>
            </div>

            {/* Duration Card */}
            <div className={cn(
              "rounded-xl p-4 border",
              "bg-white/5 border-white/10"
            )}>
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Timer className="h-3.5 w-3.5" />
                <span className="font-medium uppercase tracking-wider">Duration</span>
              </div>
              <div className="text-white font-semibold">
                {durationHours > 0 && `${durationHours}h `}{durationMinutes > 0 && `${durationMinutes}m`}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className={cn(
            "rounded-xl p-4 border",
            themeBg,
            themeBorder
          )}>
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
              <span className="font-medium uppercase tracking-wider">Description</span>
            </div>
            <Textarea
              value={editingTask.description || ''}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className={cn(
                "min-h-[80px] resize-none text-sm",
                "bg-black/20 border-white/10 text-white placeholder:text-gray-500",
                "focus:border-white/20 focus:ring-0"
              )}
              placeholder="Add task description..."
            />
          </div>

          {/* Status & Actions */}
          <div className={cn(
            "rounded-xl p-4 border",
            "bg-white/5 border-white/10"
          )}>
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
                >
                  {editingTask.completed ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
                <div>
                  <div className={cn(
                    "text-sm font-medium",
                    editingTask.completed ? "text-green-400" : "text-gray-300"
                  )}>
                    {editingTask.completed ? "Completed" : "Not Completed"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tap to toggle status
                  </div>
                </div>
              </div>

              {/* Start Focus Button */}
              <Button
                onClick={() => onStartFocusSession?.(editingTask.id)}
                className={cn(
                  "rounded-xl font-medium",
                  themeButton
                )}
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Focus
              </Button>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={cn("text-sm font-semibold", themeTextSecondary)}>
                Subtasks ({editingTask.subtasks?.length || 0})
              </h3>
              <Button
                size="sm"
                onClick={addSubtask}
                className={cn(
                  "rounded-lg text-xs",
                  themeButton
                )}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>

            {/* Subtasks List */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {editingTask.subtasks?.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "rounded-xl border p-4",
                      themeBg,
                      themeBorder
                    )}
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleSubtaskStatus(subtask.id)}
                          className="mt-0.5 p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                        >
                          {getStatusIcon(subtask.status)}
                        </button>

                        <div className="flex-1 min-w-0">
                          {editingSubtask === subtask.id ? (
                            <div className="space-y-2">
                              <Input
                                value={subtask.title}
                                onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                                className={cn(
                                  "text-sm",
                                  themeInputBg,
                                  themeInputBorder,
                                  "text-white border focus:border-white/30"
                                )}
                                placeholder="Subtask title"
                              />
                              <Textarea
                                value={subtask.description}
                                onChange={(e) => updateSubtask(subtask.id, { description: e.target.value })}
                                className={cn(
                                  "text-sm min-h-[60px] resize-none",
                                  themeInputBg,
                                  themeInputBorder,
                                  "text-white border focus:border-white/30"
                                )}
                                placeholder="Description"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={subtask.estimatedTime || ""}
                                  onChange={(e) => updateSubtask(subtask.id, { estimatedTime: e.target.value })}
                                  className={cn(
                                    "text-sm flex-1",
                                    themeInputBg,
                                    themeInputBorder,
                                    "text-white border focus:border-white/30"
                                  )}
                                  placeholder="30min"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => setEditingSubtask(null)}
                                  className="bg-green-600 hover:bg-green-700 rounded-lg"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <h4 className={cn(
                                "font-medium text-sm",
                                subtask.status === "completed"
                                  ? "text-gray-500 line-through"
                                  : "text-white"
                              )}>
                                {subtask.title}
                              </h4>
                              {subtask.description && (
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  {subtask.description}
                                </p>
                              )}
                              {subtask.estimatedTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Timer className="w-3 h-3 mr-1" />
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
                            onClick={() => onStartFocusSession?.(editingTask.id, subtask.id)}
                            className={cn(
                              "h-8 w-8 p-0 rounded-lg",
                              themeText,
                              "hover:bg-white/10"
                            )}
                          >
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSubtask(subtask.id)}
                            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSubtask(subtask.id)}
                            className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                  <p className="text-gray-600 text-xs mt-1">Add subtasks to break down your work</p>
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
            >
              Cancel
            </Button>
            <Button
              onClick={saveChanges}
              className={cn(
                "flex-1 rounded-xl font-medium",
                themeButton
              )}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDetailModal;
