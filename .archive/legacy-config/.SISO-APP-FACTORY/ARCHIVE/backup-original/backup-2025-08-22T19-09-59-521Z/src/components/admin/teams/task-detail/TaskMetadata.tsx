
import React from 'react';
import { Task } from '@/types/task.types';
import { PriorityBadge } from '../PriorityBadge';
import { Badge } from '@/components/ui/badge';
import { format, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Check, Clock, Tag, ArrowRight, CalendarIcon,
  RefreshCcw
} from 'lucide-react';

interface TaskMetadataProps {
  task: Task;
}

export function TaskMetadata({ task }: TaskMetadataProps) {
  const startTime = task?.start_time ? new Date(task.start_time) : null;
  const dueDate = task?.due_date ? new Date(task.due_date) : null;
  const isRolledOver = !!task?.rolled_over_from;
  const isOverdue = dueDate ? !isFuture(dueDate) && task?.status !== 'completed' : false;
  
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        
        <Badge 
          variant={task.status === 'completed' ? 'success' : 
                  task.status === 'in_progress' ? 'warning' : 'outline'}
          className="flex items-center gap-1"
        >
          {task.status === 'completed' ? 
            <Check className="h-3 w-3" /> : 
            <Clock className="h-3 w-3" />
          }
          {task.status === 'completed' ? 'Completed' : 
           task.status === 'in_progress' ? 'In Progress' : 'Pending'}
        </Badge>
        
        {task.category && (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-500 border-blue-200">
            <Tag className="h-3 w-3" />
            {task.category.replace(/_/g, ' ')}
          </Badge>
        )}
        
        {isRolledOver && (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-500 border-amber-200">
            <ArrowRight className="h-3 w-3" />
            Rolled Over
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        {startTime && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Start Time</p>
              <p className="font-medium">{format(startTime, 'h:mm a')}</p>
            </div>
          </div>
        )}
        
        {dueDate && (
          <div className="flex items-start gap-2">
            <CalendarIcon className={cn(
              "h-4 w-4 mt-0.5",
              isOverdue ? "text-red-500" : "text-muted-foreground"
            )} />
            <div>
              <p className={cn(
                "text-muted-foreground",
                isOverdue && "text-red-500"
              )}>
                {isOverdue ? "Overdue" : "Due Date"}
              </p>
              <p className={cn(
                "font-medium",
                isOverdue && "text-red-500"
              )}>
                {format(dueDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
        
        {task.duration && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">
                {task.duration >= 60 
                  ? `${task.duration / 60} hour${task.duration > 60 ? 's' : ''}` 
                  : `${task.duration} min`}
              </p>
            </div>
          </div>
        )}
        
        {task.recurring_type && task.recurring_type !== 'none' && (
          <div className="flex items-start gap-2">
            <RefreshCcw className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Recurrence</p>
              <p className="font-medium capitalize">{task.recurring_type}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
