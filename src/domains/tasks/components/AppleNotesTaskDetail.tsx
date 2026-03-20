"use client";

import React, { useState, useCallback, memo } from "react";
import {
  CheckSquare,
  Square,
  Calendar,
  Flag,
  ChevronRight,
  Trash2,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Pin,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// =============================================================================
// TYPES
// =============================================================================

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  notes?: string;
  pinned?: boolean;
}

interface AppleNotesTaskDetailProps {
  task: Task | null;
  onClose?: () => void;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  className?: string;
}

// =============================================================================
// STATIC CONFIG
// =============================================================================

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// =============================================================================
// SUBTASK ITEM COMPONENT
// =============================================================================

const SubtaskItem = memo(
  ({
    subtask,
    onToggle,
    onDelete,
    onTitleChange,
  }: {
    subtask: Subtask;
    onToggle: () => void;
    onDelete: () => void;
    onTitleChange: (title: string) => void;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(subtask.title);

    const handleSave = () => {
      onTitleChange(editTitle);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setEditTitle(subtask.title);
        setIsEditing(false);
      }
    };

    return (
      <div
        className={cn(
          "group flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors",
          subtask.completed && "opacity-60"
        )}
      >
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0 text-gray-400 hover:text-green-600 transition-colors"
          aria-label={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {subtask.completed ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm border-0 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-gray-200"
              autoFocus
            />
          ) : (
            <span
              className={cn(
                "text-sm cursor-pointer hover:text-gray-600",
                subtask.completed && "line-through text-gray-400"
              )}
              onClick={() => setIsEditing(true)}
            >
              {subtask.title}
            </span>
          )}
        </div>

        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
          aria-label="Delete subtask"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

SubtaskItem.displayName = "SubtaskItem";

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AppleNotesTaskDetail: React.FC<AppleNotesTaskDetailProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  onToggleSubtask,
  className,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Update local state when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || "");
    }
  }, [task]);

  const handleTitleSave = useCallback(() => {
    if (task && title !== task.title) {
      onUpdate?.({ ...task, title, updatedAt: new Date().toISOString() });
    }
    setIsEditingTitle(false);
  }, [task, title, onUpdate]);

  const handleNotesSave = useCallback(() => {
    if (task && notes !== task.notes) {
      onUpdate?.({ ...task, notes, updatedAt: new Date().toISOString() });
    }
    setIsEditingNotes(false);
  }, [task, notes, onUpdate]);

  const handleAddSubtask = useCallback(() => {
    if (!task || !newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    onUpdate?.({
      ...task,
      subtasks: [...task.subtasks, newSubtask],
      updatedAt: new Date().toISOString(),
    });

    setNewSubtaskTitle("");
  }, [task, newSubtaskTitle, onUpdate]);

  const handleToggleSubtask = useCallback(
    (subtaskId: string) => {
      if (!task) return;
      onToggleSubtask?.(task.id, subtaskId);
    },
    [task, onToggleSubtask]
  );

  const handleDeleteSubtask = useCallback(
    (subtaskId: string) => {
      if (!task) return;
      onUpdate?.({
        ...task,
        subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
        updatedAt: new Date().toISOString(),
      });
    },
    [task, onUpdate]
  );

  const handleUpdateSubtaskTitle = useCallback(
    (subtaskId: string, newTitle: string) => {
      if (!task) return;
      onUpdate?.({
        ...task,
        subtasks: task.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, title: newTitle } : s
        ),
        updatedAt: new Date().toISOString(),
      });
    },
    [task, onUpdate]
  );

  const handleTogglePin = useCallback(() => {
    if (!task) return;
    onUpdate?.({
      ...task,
      pinned: !task.pinned,
      updatedAt: new Date().toISOString(),
    });
  }, [task, onUpdate]);

  const handleDelete = useCallback(() => {
    if (!task) return;
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete?.(task.id);
    }
  }, [task, onDelete]);

  const completedCount = task?.subtasks.filter((s) => s.completed).length || 0;
  const totalCount = task?.subtasks.length || 0;

  if (!task) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full bg-[#FEFBF6]",
          className
        )}
      >
        <div className="text-center text-gray-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a task to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#FEFBF6]",
        "font-sans text-gray-800",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white/50">
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setTitle(task.title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-lg font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:outline-none"
              autoFocus
            />
          ) : (
            <h1
              className={cn(
                "text-lg font-semibold truncate cursor-pointer hover:text-gray-600",
                task.pinned && "flex items-center gap-2"
              )}
              onClick={() => setIsEditingTitle(true)}
            >
              {task.pinned && <Pin className="w-4 h-4 text-amber-500" />}
              {task.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            className={cn(
              "p-2 rounded-lg transition-colors",
              task.pinned
                ? "text-amber-500 bg-amber-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            )}
            aria-label={task.pinned ? "Unpin task" : "Pin task"}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete task"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <Flag
              className={cn(
                "w-3.5 h-3.5",
                task.priority === "urgent"
                  ? "text-red-500"
                  : task.priority === "high"
                  ? "text-orange-500"
                  : task.priority === "medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              )}
            />
            <Badge
              className={cn(
                "text-xs font-medium border-0 rounded-full",
                PRIORITY_COLORS[task.priority]
              )}
            >
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Updated */}
          <div className="text-xs text-gray-400">
            Edited{" "}
            {new Date(task.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
              Checklist
              {totalCount > 0 && (
                <span className="text-xs text-gray-400 font-normal">
                  {completedCount}/{totalCount}
                </span>
              )}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {task.subtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggle={() => handleToggleSubtask(subtask.id)}
                onDelete={() => handleDeleteSubtask(subtask.id)}
                onTitleChange={(newTitle) =>
                  handleUpdateSubtaskTitle(subtask.id, newTitle)
                }
              />
            ))}

            {/* Add Subtask */}
            <div className="flex items-center gap-2 py-2 px-2 border-t border-gray-50">
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                aria-label="Add subtask"
              >
                <Plus className="w-5 h-5" />
              </button>
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubtask();
                }}
                placeholder="Add item..."
                className="border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:outline-none px-0"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Notes
          </h2>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm min-h-[120px]">
            {isEditingNotes ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesSave}
                placeholder="Add notes..."
                className="min-h-[120px] border-0 rounded-xl resize-none focus-visible:ring-0 focus-visible:outline-none text-sm p-4"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className={cn(
                  "p-4 text-sm cursor-text min-h-[120px]",
                  notes ? "text-gray-700 whitespace-pre-wrap" : "text-gray-400"
                )}
              >
                {notes || "Click to add notes..."}
              </div>
            )}
          </div>
        </div>

        {/* Description Section (if exists) */}
        {task.description && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Description
            </h2>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-white/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
          <span>{totalCount > 0 ? `${completedCount} of ${totalCount} complete` : "No subtasks"}</span>
        </div>
      </div>
    </div>
  );
};

AppleNotesTaskDetail.displayName = "AppleNotesTaskDetail";

export default AppleNotesTaskDetail;
