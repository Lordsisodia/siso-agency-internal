"use client";

/**
 * KanbanBoard - Mobile-optimized Kanban board with drag-and-drop
 * Desktop: Show all columns side by side
 * Mobile: Swipe between columns, one column visible at a time
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkTask } from "../WorkTaskList";
import { KanbanColumn, ColumnStatus } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";

export interface KanbanBoardProps {
  tasks: WorkTask[];
  themeName: 'LIGHT' | 'DEEP';
  workType: 'light' | 'deep';
  onToggleTaskStatus: (taskId: string) => void;
  onToggleExpansion: (taskId: string) => void;
  onUpdateTaskStatus?: (taskId: string, status: string) => Promise<void>;
  expandedTasks: string[];
}

// Map task status to column
const statusToColumn: Record<string, ColumnStatus> = {
  'pending': 'todo',
  'todo': 'todo',
  'in_progress': 'in-progress',
  'in-progress': 'in-progress',
  'completed': 'done',
  'done': 'done',
};

// Map column to task status
const columnToStatus: Record<ColumnStatus, string> = {
  'todo': 'pending',
  'in-progress': 'in_progress',
  'done': 'completed',
};

// Column definitions
const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard({
  tasks,
  themeName,
  workType,
  onToggleTaskStatus,
  onToggleExpansion,
  onUpdateTaskStatus,
  expandedTasks,
}: KanbanBoardProps) {
  // Mobile column index (0 = todo, 1 = in-progress, 2 = done)
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeDragTask, setActiveDragTask] = useState<WorkTask | null>(null);
  const [localTasks, setLocalTasks] = useState<WorkTask[]>(tasks);

  // Sync local tasks with props
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group tasks by column
  const getTasksForColumn = useCallback((columnId: ColumnStatus): WorkTask[] => {
    return localTasks.filter(task => {
      const taskColumn = statusToColumn[task.status.toLowerCase()] || 'todo';
      return taskColumn === columnId;
    });
  }, [localTasks]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find(t => t.id === active.id);
    if (task) {
      setActiveDragTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active task
    const activeTask = localTasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if dragging over a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);

    if (isOverColumn && overId !== statusToColumn[activeTask.status.toLowerCase()]) {
      // Optimistically update the task status
      const newStatus = columnToStatus[overId as ColumnStatus];
      setLocalTasks(prev =>
        prev.map(t =>
          t.id === activeId ? { ...t, status: newStatus } : t
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);

    if (isOverColumn) {
      const newStatus = columnToStatus[overId as ColumnStatus];
      const currentStatus = activeTask.status.toLowerCase();
      const currentColumn = statusToColumn[currentStatus];

      if (currentColumn !== overId && onUpdateTaskStatus) {
        try {
          await onUpdateTaskStatus(activeId, newStatus);
        } catch (error) {
          // Revert on error
          setLocalTasks(tasks);
          console.error('Failed to update task status:', error);
        }
      }
    }
  };

  // Drop animation
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Mobile swipe handlers
  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = 0.5;

    if (info.offset.x > threshold && info.velocity.x > velocity) {
      // Swipe right - go to previous column
      setActiveColumnIndex(prev => Math.max(0, prev - 1));
    } else if (info.offset.x < -threshold && info.velocity.x < -velocity) {
      // Swipe left - go to next column
      setActiveColumnIndex(prev => Math.min(COLUMNS.length - 1, prev + 1));
    }
  };

  // Navigate columns
  const goToColumn = (index: number) => {
    setActiveColumnIndex(Math.max(0, Math.min(COLUMNS.length - 1, index)));
  };

  // Theme colors
  const themeColors = themeName === 'LIGHT'
    ? {
        indicatorActive: 'bg-green-400',
        indicatorInactive: 'bg-green-400/30',
        navButton: 'text-green-400 hover:bg-green-900/30',
        navButtonDisabled: 'text-green-400/30',
      }
    : {
        indicatorActive: 'bg-blue-400',
        indicatorInactive: 'bg-blue-400/30',
        navButton: 'text-blue-400 hover:bg-blue-900/30',
        navButtonDisabled: 'text-blue-400/30',
      };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Mobile Column Navigation */}
        {isMobile && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <button
              onClick={() => goToColumn(activeColumnIndex - 1)}
              disabled={activeColumnIndex === 0}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeColumnIndex === 0 ? themeColors.navButtonDisabled : themeColors.navButton
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <LayoutGrid className={cn("h-4 w-4", themeColors.indicatorActive)} />
              <span className="text-sm font-medium text-white">
                {COLUMNS[activeColumnIndex].title}
              </span>
            </div>

            <button
              onClick={() => goToColumn(activeColumnIndex + 1)}
              disabled={activeColumnIndex === COLUMNS.length - 1}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeColumnIndex === COLUMNS.length - 1 ? themeColors.navButtonDisabled : themeColors.navButton
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Board Content */}
        <div className="flex-1 overflow-hidden">
          {isMobile ? (
            // Mobile: Swipeable single column view
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleSwipe}
              className="h-full"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeColumnIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full p-4"
                >
                  <KanbanColumn
                    id={COLUMNS[activeColumnIndex].id}
                    title={COLUMNS[activeColumnIndex].title}
                    tasks={getTasksForColumn(COLUMNS[activeColumnIndex].id)}
                    themeName={themeName}
                    isMobile={true}
                    isActive={true}
                    onToggleTaskStatus={onToggleTaskStatus}
                    onToggleExpansion={onToggleExpansion}
                    expandedTasks={expandedTasks}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            // Desktop: All columns side by side
            <div className="flex gap-4 h-full p-4 overflow-x-auto">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={getTasksForColumn(column.id)}
                  themeName={themeName}
                  isMobile={false}
                  isActive={true}
                  onToggleTaskStatus={onToggleTaskStatus}
                  onToggleExpansion={onToggleExpansion}
                  expandedTasks={expandedTasks}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Column Indicators */}
        {isMobile && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-white/10">
            {COLUMNS.map((column, index) => (
              <button
                key={column.id}
                onClick={() => goToColumn(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === activeColumnIndex
                    ? `w-6 ${themeColors.indicatorActive}`
                    : themeColors.indicatorInactive
                )}
                aria-label={`Go to ${column.title}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeDragTask ? (
          <div className="opacity-90 rotate-2 scale-105">
            <KanbanCard
              task={activeDragTask}
              index={0}
              columnId={statusToColumn[activeDragTask.status.toLowerCase()] || 'todo'}
              themeName={themeName}
              onToggleTaskStatus={onToggleTaskStatus}
              onToggleExpansion={onToggleExpansion}
              isExpanded={expandedTasks.includes(activeDragTask.id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
