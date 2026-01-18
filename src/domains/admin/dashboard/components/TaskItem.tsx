
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, User, AlertTriangle, AlertCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD';

interface TaskItemProps {
  task: Task;
}

const priorityConfig = {
  low: { color: 'text-blue-500', icon: <Circle className="h-3 w-3" /> },
  medium: { color: 'text-yellow-500', icon: <Clock className="h-3 w-3" /> },
  high: { color: 'text-orange-500', icon: <AlertCircle className="h-3 w-3" /> },
  urgent: { color: 'text-red-500', icon: <AlertTriangle className="h-3 w-3" /> }
};

export function TaskItem({ task }: TaskItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Checkbox checked={task.status === 'completed'} />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{task.title}</h3>
            <div className={`flex items-center ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].icon}
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {task.assigned_to && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Assigned to {task.assigned_to}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </div>
    </Card>
  );
}
