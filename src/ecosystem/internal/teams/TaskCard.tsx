
import React, { useState } from 'react';
import { Task } from '@/types/task.types';
import { Card } from '@/components/ui/card';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { PriorityBadge } from './PriorityBadge';
import { TaskDetailDrawer } from './task-detail/TaskDetailDrawer';
import { GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentHour?: number;
  allTasks?: Task[];
}

export function TaskCard({ task, currentHour, allTasks = [] }: TaskCardProps) {
  const { handleDragStart, handleDragEnd, isDragging } = useTaskDragDrop();
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const startTime = task.start_time ? new Date(task.start_time) : null;
  const duration = task.duration || 60;

  const baseTop = startTime ? startTime.getHours() * 100 + (startTime.getMinutes() / 60) * 100 : 0;

  const isCurrentTask = currentHour !== undefined && startTime && 
                       startTime.getHours() === currentHour;

  const handleTaskClick = (e: React.MouseEvent) => {
    // Only open drawer if not clicking the drag handle
    if (!e.target || !(e.target instanceof HTMLElement) || !e.target.closest('[data-drag-handle]')) {
      setShowDetailDrawer(true);
    }
  };

  const progress = task.status === 'completed' ? 100 : 
                  task.status === 'in_progress' ? 60 : 
                  0;

  const getPriorityBackground = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30';
      case 'high': return 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30';
      case 'medium': return 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30';
      default: return 'bg-gray-800/50 hover:bg-gray-800/70';
    }
  };

  return (
    <>
      <Card 
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        onClick={handleTaskClick}
        data-task-id={task.id}
        className={cn(
          "absolute p-2 sm:p-3 select-none pointer-events-auto",
          "hover:ring-2 hover:ring-purple-500/50 backdrop-blur-sm",
          "rounded-lg border shadow-lg cursor-pointer",
          "flex flex-col justify-between gap-2",
          isCurrentTask ? 'bg-purple-500/20 border-purple-500/50' : getPriorityBackground(),
          isDragging ? 'opacity-50 ring-2 ring-purple-500' : 'opacity-100',
          "z-20 w-[calc(100%-2rem)]"
        )}
        style={{
          top: `${baseTop}px`,
          height: `${Math.max((duration / 60) * 100, 100)}px`,
          transition: isDragging ? 'none' : 'all 0.2s ease',
        }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div 
              data-drag-handle 
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-sm sm:text-base line-clamp-2 flex-1">
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </div>
      </Card>

      <TaskDetailDrawer
        task={task}
        isOpen={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      />
    </>
  );
}
