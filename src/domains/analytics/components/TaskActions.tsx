
import React from 'react';
import { Task } from '@/types/task.types';
import { Button } from '@/components/ui/button';
import { Calendar, Check } from 'lucide-react';

interface TaskActionsProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onSchedule: () => void;
  onComplete: () => void;
}

export function TaskActions({ 
  task, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  onSchedule, 
  onComplete 
}: TaskActionsProps) {
  const startTime = task?.start_time ? new Date(task.start_time) : null;

  return isEditing ? (
    <div className="flex gap-2">
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave}>Save Changes</Button>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-2">
      {!startTime && (
        <Button 
          variant="secondary"
          onClick={onSchedule}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Schedule
        </Button>
      )}
      
      <Button 
        variant={task.status === 'completed' ? "outline" : "default"}
        onClick={onComplete}
        className={task.status === 'completed' ? "col-span-2" : startTime ? "col-span-2" : ""}
      >
        <Check className="h-4 w-4 mr-2" />
        {task.status === 'completed' ? "Reopen Task" : "Mark Complete"}
      </Button>
    </div>
  );
}
