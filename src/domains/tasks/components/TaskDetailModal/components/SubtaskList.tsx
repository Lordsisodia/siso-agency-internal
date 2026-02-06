"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubtaskItem } from "./SubtaskItem";
import type { SubtaskListProps } from "../types";

export const SubtaskList: React.FC<SubtaskListProps> = React.memo(({
  subtasks,
  taskId,
  workType,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onStartFocusSession
}) => {
  const isDeepWork = workType === 'deep';

  // Theme classes based on work type
  const theme = {
    textSecondary: isDeepWork ? 'text-blue-200' : 'text-green-200',
    button: isDeepWork
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={cn("text-sm font-semibold", theme.textSecondary)}>
          Subtasks ({subtasks?.length || 0})
        </h3>
        <Button
          size="sm"
          onClick={onAddSubtask}
          className={cn(
            "rounded-lg text-xs",
            theme.button
          )}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Subtasks List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {subtasks?.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              taskId={taskId}
              workType={workType}
              isEditing={false}
              onToggleStatus={() => onToggleSubtask(subtask.id)}
              onUpdate={(updates) => onUpdateSubtask(subtask.id, updates)}
              onDelete={() => onDeleteSubtask(subtask.id)}
              onStartEdit={() => {}}
              onCancelEdit={() => {}}
              onStartFocus={() => onStartFocusSession(taskId, subtask.id)}
            />
          ))}
        </AnimatePresence>

        {(!subtasks || subtasks.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No subtasks yet</p>
            <p className="text-gray-600 text-xs mt-1">Add subtasks to break down your work</p>
          </div>
        )}
      </div>
    </div>
  );
});

SubtaskList.displayName = 'SubtaskList';

export default SubtaskList;
