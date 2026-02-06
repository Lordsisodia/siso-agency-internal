"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  Flag,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// Types
// ============================================================================

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  timeEstimate?: number; // in minutes
  subtasks: Subtask[];
  completed: boolean;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

// ============================================================================
// Priority Config
// ============================================================================

const priorityConfig = {
  low: { label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  urgent: { label: "Urgent", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

// ============================================================================
// Format Helpers
// ============================================================================

function formatDate(date: Date | undefined): string {
  if (!date) return "";
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function formatTimeEstimate(minutes: number | undefined): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function parseTimeEstimate(input: string): number {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return 0;

  // Try to parse "2h 30m" or "2h" or "30m" or "2.5h"
  const hourMatch = trimmed.match(/(\d+\.?\d*)\s*h/);
  const minMatch = trimmed.match(/(\d+)\s*m/);

  let totalMinutes = 0;
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10);
  }

  // If no matches, try parsing as plain number (assume minutes)
  if (!hourMatch && !minMatch) {
    const num = parseInt(trimmed, 10);
    if (!isNaN(num)) totalMinutes = num;
  }

  return Math.round(totalMinutes);
}

// ============================================================================
// Components
// ============================================================================

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}: TaskDetailModalProps) {
  // Local state for editing
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const newSubtaskInputRef = useRef<HTMLInputElement>(null);

  // Motion values for swipe gesture
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);
  const scale = useTransform(y, [0, 300], [1, 0.95]);

  // Initialize edited task when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setEditedTask({ ...task });
      setHasChanges(false);
      setNewSubtaskTitle("");
      setEditingSubtaskId(null);
    }
  }, [isOpen, task]);

  // Auto-save on close if there are changes
  const handleClose = useCallback(() => {
    if (hasChanges && editedTask) {
      onSave(editedTask);
    }
    onClose();
  }, [hasChanges, editedTask, onSave, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle swipe down to close
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      handleClose();
    }
  };

  // Update task field
  const updateTask = useCallback(<K extends keyof Task>(field: K, value: Task[K]) => {
    setEditedTask((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  }, []);

  // Add subtask
  const addSubtask = useCallback(() => {
    if (!newSubtaskTitle.trim() || !editedTask) return;

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    updateTask("subtasks", [...editedTask.subtasks, newSubtask]);
    setNewSubtaskTitle("");
  }, [newSubtaskTitle, editedTask, updateTask]);

  // Toggle subtask completion
  const toggleSubtask = useCallback((subtaskId: string) => {
    if (!editedTask) return;

    const updatedSubtasks = editedTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask("subtasks", updatedSubtasks);
  }, [editedTask, updateTask]);

  // Delete subtask
  const deleteSubtask = useCallback((subtaskId: string) => {
    if (!editedTask) return;

    const updatedSubtasks = editedTask.subtasks.filter((st) => st.id !== subtaskId);
    updateTask("subtasks", updatedSubtasks);
  }, [editedTask, updateTask]);

  // Start editing subtask
  const startEditingSubtask = useCallback((subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  }, []);

  // Save subtask edit
  const saveSubtaskEdit = useCallback(() => {
    if (!editedTask || !editingSubtaskId) return;

    const updatedSubtasks = editedTask.subtasks.map((st) =>
      st.id === editingSubtaskId ? { ...st, title: editingSubtaskTitle.trim() } : st
    );
    updateTask("subtasks", updatedSubtasks);
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  }, [editedTask, editingSubtaskId, editingSubtaskTitle, updateTask]);

  // Handle subtask keydown
  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  };

  // Handle edit subtask keydown
  const handleEditSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSubtaskEdit();
    } else if (e.key === "Escape") {
      setEditingSubtaskId(null);
      setEditingSubtaskTitle("");
    }
  };

  if (!editedTask) return null;

  const completedSubtasks = editedTask.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = editedTask.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-[#1E1E1E] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ y, opacity, scale }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Drag Handle (Mobile) */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50">
                  {completedSubtasks}/{totalSubtasks} completed
                </span>
                {hasChanges && (
                  <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                    Unsaved
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(editedTask.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Input
                  value={editedTask.title}
                  onChange={(e) => updateTask("title", e.target.value)}
                  placeholder="Task title"
                  className="text-xl font-semibold bg-transparent border-0 border-b border-transparent focus:border-white/20 focus-visible:ring-0 px-0 py-2 h-auto placeholder:text-white/30 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                  Description
                </label>
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) => updateTask("description", e.target.value)}
                  placeholder="Add a description..."
                  className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/20 resize-none"
                />
              </div>

              {/* Task Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Priority
                  </label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value: Task["priority"]) => updateTask("priority", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2A2A2A] border-white/10">
                      {(Object.keys(priorityConfig) as Task["priority"][]).map((p) => (
                        <SelectItem
                          key={p}
                          value={p}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", priorityConfig[p].color.split(" ")[0].replace("/20", ""))} />
                            {priorityConfig[p].label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={editedTask.dueDate ? editedTask.dueDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      updateTask("dueDate", date);
                    }}
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-white/20 [color-scheme:dark]"
                  />
                </div>

                {/* Time Estimate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimate
                  </label>
                  <Input
                    value={formatTimeEstimate(editedTask.timeEstimate)}
                    onChange={(e) => {
                      const minutes = parseTimeEstimate(e.target.value);
                      updateTask("timeEstimate", minutes || undefined);
                    }}
                    onBlur={(e) => {
                      // Re-format on blur to show clean value
                      const minutes = parseTimeEstimate(e.target.value);
                      e.target.value = formatTimeEstimate(minutes) || "";
                    }}
                    placeholder="e.g., 2h 30m"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                    Subtasks
                    {totalSubtasks > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {completedSubtasks}/{totalSubtasks}
                      </Badge>
                    )}
                  </label>
                </div>

                {/* Progress Bar */}
                {totalSubtasks > 0 && (
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Subtask List */}
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {editedTask.subtasks.map((subtask, index) => (
                      <motion.div
                        key={subtask.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-transparent hover:border-white/10 transition-all",
                          subtask.completed && "opacity-60"
                        )}
                      >
                        <GripVertical className="h-4 w-4 text-white/20 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtask(subtask.id)}
                          className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />

                        {editingSubtaskId === subtask.id ? (
                          <Input
                            value={editingSubtaskTitle}
                            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                            onKeyDown={handleEditSubtaskKeyDown}
                            onBlur={saveSubtaskEdit}
                            autoFocus
                            className="flex-1 bg-white/10 border-white/20 text-white text-sm h-8 focus-visible:ring-white/20"
                          />
                        ) : (
                          <span
                            onClick={() => startEditingSubtask(subtask)}
                            className={cn(
                              "flex-1 text-sm cursor-text select-none",
                              subtask.completed
                                ? "text-white/40 line-through"
                                : "text-white/80"
                            )}
                          >
                            {subtask.title}
                          </span>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubtask(subtask.id)}
                          className="h-7 w-7 text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Subtask Input */}
                  <motion.div
                    layout
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-dashed border-white/20 hover:border-white/30 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-white/40" />
                    <Input
                      ref={newSubtaskInputRef}
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={handleSubtaskKeyDown}
                      placeholder="Add a subtask..."
                      className="flex-1 bg-transparent border-0 px-0 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 h-8"
                    />
                    {newSubtaskTitle.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addSubtask}
                        className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Add
                      </Button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
              <div className="text-xs text-white/40">
                Created {formatDate(new Date())}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSave(editedTask);
                    setHasChanges(false);
                    onClose();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskDetailModal;
