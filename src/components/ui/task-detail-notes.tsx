"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Flag,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
  timeEstimate?: number;
  subtasks: Subtask[];
  completed: boolean;
  notes?: string;
}

interface TaskDetailNotesProps {
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
  low: { label: "Low", color: "#3B82F6" },
  medium: { label: "Medium", color: "#EAB308" },
  high: { label: "High", color: "#F97316" },
  urgent: { label: "Urgent", color: "#EF4444" },
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

// ============================================================================
// Apple Notes-style Section Component
// ============================================================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E5E5E5] dark:border-[#2C2C2E]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1E] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#007AFF]">{icon}</span>
          <span className="font-medium text-[#000] dark:text-[#FFF]">{title}</span>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-[#8E8E93] transition-transform",
            isOpen && "rotate-90"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TaskDetailNotes({
  isOpen,
  onClose,
  task,
  onSave,
  onDelete,
}: TaskDetailNotesProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (isOpen && task) {
      setEditedTask({ ...task });
      setHasChanges(false);
      setNewSubtaskTitle("");
    }
  }, [isOpen, task]);

  const handleClose = useCallback(() => {
    if (hasChanges && editedTask) {
      onSave(editedTask);
    }
    onClose();
  }, [hasChanges, editedTask, onSave, onClose]);

  const updateTask = useCallback(<K extends keyof Task>(field: K, value: Task[K]) => {
    setEditedTask((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  }, []);

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

  const toggleSubtask = useCallback((subtaskId: string) => {
    if (!editedTask) return;

    const updatedSubtasks = editedTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask("subtasks", updatedSubtasks);
  }, [editedTask, updateTask]);

  const deleteSubtask = useCallback((subtaskId: string) => {
    if (!editedTask) return;

    const updatedSubtasks = editedTask.subtasks.filter((st) => st.id !== subtaskId);
    updateTask("subtasks", updatedSubtasks);
  }, [editedTask, updateTask]);

  if (!editedTask) return null;

  const completedSubtasks = editedTask.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = editedTask.subtasks.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Apple Notes-style Container */}
          <motion.div
            className="relative w-full max-w-md bg-[#FFF] dark:bg-[#1C1C1E] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-[#2C2C2E] bg-[#F9F9F9] dark:bg-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#8E8E93]">
                  {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : "No items"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(editedTask.id)}
                    className="h-8 w-8 text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 text-[#007AFF]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Title */}
              <div className="px-4 pt-4 pb-2">
                <input
                  value={editedTask.title}
                  onChange={(e) => updateTask("title", e.target.value)}
                  placeholder="New Note"
                  className="w-full text-xl font-semibold bg-transparent border-0 focus:outline-none text-[#000] dark:text-[#FFF] placeholder:text-[#C7C7CC]"
                />
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-3 px-4 pb-3 text-sm">
                {/* Priority */}
                <button
                  onClick={() => {
                    const priorities: Task["priority"][] = ["low", "medium", "high", "urgent"];
                    const currentIndex = priorities.indexOf(editedTask.priority);
                    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                    updateTask("priority", nextPriority);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2E] transition-colors"
                >
                  <Flag
                    className="h-3.5 w-3.5"
                    style={{ color: priorityConfig[editedTask.priority].color }}
                    fill={priorityConfig[editedTask.priority].color}
                  />
                  <span style={{ color: priorityConfig[editedTask.priority].color }}>
                    {priorityConfig[editedTask.priority].label}
                  </span>
                </button>

                {/* Due Date */}
                <button
                  onClick={() => {
                    if (!editedTask.dueDate) {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      updateTask("dueDate", tomorrow);
                    } else {
                      updateTask("dueDate", undefined);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2E] transition-colors",
                    editedTask.dueDate && "text-[#007AFF]"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(editedTask.dueDate) || "Add date"}</span>
                </button>

                {/* Time Estimate */}
                <button
                  onClick={() => {
                    if (!editedTask.timeEstimate) {
                      updateTask("timeEstimate", 30);
                    } else {
                      updateTask("timeEstimate", undefined);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2E] transition-colors",
                    editedTask.timeEstimate && "text-[#007AFF]"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTimeEstimate(editedTask.timeEstimate) || "Add time"}</span>
                </button>
              </div>

              {/* Checklists Section */}
              <Section
                title="Checklist"
                icon={<Check className="h-4 w-4" />}
                defaultOpen={totalSubtasks > 0}
              >
                <div className="space-y-1">
                  {/* Existing subtasks */}
                  {editedTask.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className={cn(
                        "group flex items-center gap-2 py-1.5 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2E] transition-colors px-2 -mx-2",
                        subtask.completed && "opacity-50"
                      )}
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(subtask.id)}
                        className="border-[#C7C7CC] data-[state=checked]:bg-[#007AFF] data-[state=checked]:border-[#007AFF]"
                      />
                      <span
                        className={cn(
                          "flex-1 text-[#000] dark:text-[#FFF] text-sm",
                          subtask.completed && "line-through text-[#8E8E93]"
                        )}
                      >
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => deleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#FF3B30] hover:bg-[#FF3B30]/10 p-1 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add new subtask */}
                  <div className="flex items-center gap-2 py-1.5 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2E] transition-colors px-2 -mx-2">
                    <Plus className="h-4 w-4 text-[#C7C7CC]" />
                    <input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubtask();
                        }
                      }}
                      placeholder="New item"
                      className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-[#000] dark:text-[#FFF] placeholder:text-[#C7C7CC]"
                    />
                    {newSubtaskTitle.trim() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addSubtask}
                        className="h-6 text-[#007AFF] hover:bg-[#007AFF]/10"
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </Section>

              {/* Notes Section */}
              <Section
                title="Notes"
                icon={<span className="text-lg leading-none">📝</span>}
                defaultOpen={true}
              >
                <Textarea
                  value={editedTask.notes || editedTask.description || ""}
                  onChange={(e) => {
                    updateTask("notes", e.target.value);
                    updateTask("description", e.target.value);
                  }}
                  placeholder="Add notes..."
                  className="min-h-[120px] bg-[#F5F5F5] dark:bg-[#2C2C2E] border-0 text-[#000] dark:text-[#FFF] placeholder:text-[#8E8E93] resize-none focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                />
              </Section>

              {/* Description Section */}
              <Section
                title="Description"
                icon={<span className="text-lg leading-none">📄</span>}
                defaultOpen={false}
              >
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) => updateTask("description", e.target.value)}
                  placeholder="Add description..."
                  className="min-h-[80px] bg-[#F5F5F5] dark:bg-[#2C2C2E] border-0 text-[#000] dark:text-[#FFF] placeholder:text-[#8E8E93] resize-none focus-visible:ring-1 focus-visible:ring-[#007AFF]"
                />
              </Section>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#E5E5E5] dark:border-[#2C2C2E] bg-[#F9F9F9] dark:bg-[#2C2C2E] flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-[#007AFF]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSave(editedTask);
                  setHasChanges(false);
                  onClose();
                }}
                className="bg-[#007AFF] hover:bg-[#0056CC] text-white"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskDetailNotes;
