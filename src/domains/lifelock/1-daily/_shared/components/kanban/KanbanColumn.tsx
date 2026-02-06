"use client";

/**
 * KanbanColumn - Droppable column component for Kanban board
 * Supports both desktop (visible) and mobile (swipeable) views
 */

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { WorkTask } from "../WorkTaskList";
import { KanbanCard } from "./KanbanCard";

export type ColumnStatus = 'todo' | 'in-progress' | 'done';

export interface KanbanColumnProps {
  id: ColumnStatus;
  title: string;
  tasks: WorkTask[];
  themeName: 'LIGHT' | 'DEEP';
  isMobile?: boolean;
  isActive?: boolean;
  onToggleTaskStatus: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onTaskClick?: (task: WorkTask) => void;
  expandedTasks: string[];
}

const columnConfig: Record<ColumnStatus, { color: string; bg: string; border: string; icon: string }> = {
  'todo': {
    color: 'text-gray-300',
    bg: 'bg-gray-800/30',
    border: 'border-gray-700/40',
    icon: '○',
  },
  'in-progress': {
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/40',
    icon: '◐',
  },
  'done': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/40',
    icon: '●',
  },
};

export function KanbanColumn({
  id,
  title,
  tasks,
  themeName,
  isMobile = false,
  isActive = true,
  onToggleTaskStatus,
  onToggleExpansion,
  onTaskClick,
  expandedTasks,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const config = columnConfig[id];

  // Theme colors
  const themeColors = themeName === 'LIGHT'
    ? {
        columnBg: 'bg-green-950/10',
        columnBorder: 'border-green-800/20',
        columnHover: 'hover:border-green-700/40',
        headerBg: 'bg-green-900/20',
      }
    : {
        columnBg: 'bg-blue-950/10',
        columnBorder: 'border-blue-800/20',
        columnHover: 'hover:border-blue-700/40',
        headerBg: 'bg-blue-900/20',
      };

  // Count completed vs total
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col rounded-xl border transition-all",
        themeColors.columnBg,
        themeColors.columnBorder,
        themeColors.columnHover,
        isOver && "ring-2 ring-primary/50 bg-primary/5",
        isMobile ? "h-full w-full" : "h-full min-h-[400px] min-w-[280px] flex-1",
        !isActive && isMobile && "hidden"
      )}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b rounded-t-xl",
        config.border,
        themeColors.headerBg
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm", config.color)}>{config.icon}</span>
          <h3 className={cn("font-semibold text-sm", config.color)}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            config.bg,
            config.color
          )}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content - Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-2 overflow-y-auto min-h-0",
          isOver && "bg-primary/5"
        )}
      >
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col items-center justify-center h-32 text-center rounded-lg border-2 border-dashed",
              "border-gray-700/30 text-gray-500"
            )}
          >
            <span className="text-2xl mb-1 opacity-50">{config.icon}</span>
            <span className="text-xs">Drop tasks here</span>
          </motion.div>
        ) : (
          tasks.map((task, index) => (
            <KanbanCard
              key={task.id}
              task={task}
              index={index}
              columnId={id}
              themeName={themeName}
              onToggleTaskStatus={onToggleTaskStatus}
              onToggleExpansion={onToggleExpansion}
              onTaskClick={onTaskClick}
              isExpanded={expandedTasks.includes(task.id)}
            />
          ))
        )}
      </div>

      {/* Column Footer - Progress indicator */}
      {tasks.length > 0 && completedCount > 0 && (
        <div className={cn(
          "px-3 py-2 border-t text-xs flex items-center justify-between",
          config.border,
          themeColors.headerBg
        )}>
          <span className="text-gray-400">Progress</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", config.color.replace('text-', 'bg-'))}
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className={cn("text-xs", config.color)}>
              {Math.round((completedCount / tasks.length) * 100)}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default KanbanColumn;
