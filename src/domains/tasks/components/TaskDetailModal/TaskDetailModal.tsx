"use client";

import React, { useCallback } from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { TaskHeader, TaskForm, SubtaskList, ActionBar } from "./components";
import { useTaskForm } from "./hooks";
import type { TaskDetailModalProps } from "./types";

export const TaskDetailModal: React.FC<TaskDetailModalProps> = React.memo(({
  task,
  isOpen,
  onClose,
  onToggleComplete,
  onTaskUpdate,
  onStartFocusSession,
  workType = 'light'
}) => {
  const {
    editingTask,
    setEditingSubtaskId,
    toggleSubtaskStatus,
    deleteSubtask,
    updateSubtask,
    addSubtask,
    updateTaskField,
    toggleTaskCompletion,
    getTaskForSave
  } = useTaskForm({ task, isOpen });

  if (!task || !editingTask) return null;

  const handleToggleComplete = useCallback(() => {
    onToggleComplete?.(task.id);
    toggleTaskCompletion();
  }, [task.id, onToggleComplete, toggleTaskCompletion]);

  const handleSaveChanges = useCallback(() => {
    const taskToSave = getTaskForSave();
    if (taskToSave) {
      onTaskUpdate?.(taskToSave);
    }
    onClose();
  }, [getTaskForSave, onTaskUpdate, onClose]);

  const handleStartFocus = useCallback(() => {
    onStartFocusSession?.(editingTask.id);
  }, [editingTask.id, onStartFocusSession]);

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
        <TaskHeader
          title={editingTask.title}
          category={editingTask.category}
          focusIntensity={editingTask.focusIntensity}
          priority={editingTask.priority}
          workType={workType}
          onClose={onClose}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Task Form */}
          <TaskForm
            description={editingTask.description || ''}
            startTime={editingTask.startTime}
            endTime={editingTask.endTime}
            duration={editingTask.duration}
            workType={workType}
            completed={editingTask.completed}
            onDescriptionChange={(description) => updateTaskField('description', description)}
            onToggleComplete={handleToggleComplete}
            onStartFocus={handleStartFocus}
          />

          {/* Subtasks Section */}
          <SubtaskList
            subtasks={editingTask.subtasks || []}
            taskId={editingTask.id}
            workType={workType}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtaskStatus}
            onUpdateSubtask={updateSubtask}
            onDeleteSubtask={deleteSubtask}
            onStartFocusSession={onStartFocusSession || (() => {})}
          />
        </div>

        {/* Footer Actions */}
        <ActionBar
          onCancel={onClose}
          onSave={handleSaveChanges}
          workType={workType}
        />
      </DrawerContent>
    </Drawer>
  );
});

TaskDetailModal.displayName = 'TaskDetailModal';

export default TaskDetailModal;
