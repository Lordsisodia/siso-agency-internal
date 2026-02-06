"use client";

/**
 * KanbanCard - Draggable card component for Kanban board
 * Compact design optimized for mobile and desktop
 */

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { GripVertical, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkTask } from "../WorkTaskList";

export interface KanbanCardProps {
  task: WorkTask;
  index: number;
  columnId: string;
  themeName: 'LIGHT' | 'DEEP';
  onToggleTaskStatus: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  isExpanded?: boolean;
}

export function KanbanCard({
  task,
  index,
  columnId,
  themeName,
  onToggleTaskStatus,
  onToggleExpansion,
  isExpanded = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      type: 'Task',
      task,
      index,
      columnId,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Priority colors
  const priorityConfig = {
    URGENT: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
    HIGH: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    LOW: { color: themeName === 'LIGHT' ? 'text-green-400' : 'text-blue-400', bg: themeName === 'LIGHT' ? 'bg-green-400/10' : 'bg-blue-400/10', border: themeName === 'LIGHT' ? 'border-green-400/30' : 'border-blue-400/30' },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;

  // Completed subtasks count
  const completedSubtasks = task.subtasks.filter(s => s.status === 'completed' || s.completed).length;
  const totalSubtasks = task.subtasks.length;

  // Theme colors
  const themeColors = themeName === 'LIGHT'
    ? {
        cardBg: 'bg-green-900/20',
        cardBorder: 'border-green-700/30',
        cardHover: 'hover:border-green-600/50',
        textPrimary: 'text-green-100',
        textSecondary: 'text-green-300/70',
        dragHandle: 'text-green-400/50 hover:text-green-400',
      }
    : {
        cardBg: 'bg-blue-900/20',
        cardBorder: 'border-blue-700/30',
        cardHover: 'hover:border-blue-600/50',
        textPrimary: 'text-blue-100',
        textSecondary: 'text-blue-300/70',
        dragHandle: 'text-blue-400/50 hover:text-blue-400',
      };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        "group relative rounded-lg border p-3 transition-all",
        themeColors.cardBg,
        themeColors.cardBorder,
        themeColors.cardHover,
        isDragging && "z-50 opacity-90 rotate-2 scale-105 shadow-xl cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-grab active:cursor-grabbing",
          themeColors.dragHandle
        )}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Card Content */}
      <div className="pl-6 space-y-2">
        {/* Header: Checkbox + Title */}
        <div className="flex items-start gap-2">
          <button
            onClick={() => onToggleTaskStatus(task.id)}
            className="mt-0.5 flex-shrink-0 transition-transform active:scale-90"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className={cn("h-4 w-4", themeName === 'LIGHT' ? 'text-green-400' : 'text-blue-400')} />
            ) : (
              <Circle className={cn("h-4 w-4", themeColors.textSecondary)} />
            )}
          </button>

          <h4
            onClick={() => onToggleExpansion(task.id)}
            className={cn(
              "flex-1 text-sm font-medium leading-tight cursor-pointer",
              themeColors.textPrimary,
              task.status === 'completed' && "line-through opacity-60"
            )}
          >
            {task.title}
          </h4>
        </div>

        {/* Meta Row: Priority + Time + Subtasks */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Badge */}
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full border font-medium uppercase tracking-wide",
            priority.color,
            priority.bg,
            priority.border
          )}>
            {task.priority === 'URGENT' ? '!' : task.priority.charAt(0)}
          </span>

          {/* Time Estimate */}
          {task.timeEstimate && (
            <span className={cn("flex items-center gap-1 text-[10px]", themeColors.textSecondary)}>
              <Clock className="h-3 w-3" />
              {task.timeEstimate}
            </span>
          )}

          {/* Subtasks Count */}
          {totalSubtasks > 0 && (
            <span className={cn("text-[10px]", themeColors.textSecondary)}>
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && task.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn("text-xs pt-2 border-t", themeColors.cardBorder, themeColors.textSecondary)}
          >
            {task.description}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default KanbanCard;
