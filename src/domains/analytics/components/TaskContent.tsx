
import React from 'react';
import { Task } from '@/types/task.types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, AlignLeft } from 'lucide-react';

interface TaskContentProps {
  task: Task;
  isEditing: boolean;
  editedTitle: string;
  editedDescription: string;
  onEditStart: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function TaskContent({
  task,
  isEditing,
  editedTitle,
  editedDescription,
  onEditStart,
  onTitleChange,
  onDescriptionChange,
}: TaskContentProps) {
  return (
    <div className="space-y-3">
      {isEditing ? (
        <>
          <div>
            <label htmlFor="task-title" className="text-sm font-medium mb-1 block">
              Title
            </label>
            <Input
              id="task-title"
              value={editedTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full"
              placeholder="Task title"
            />
          </div>
          
          <div>
            <label htmlFor="task-description" className="text-sm font-medium mb-1 block">
              Description
            </label>
            <Textarea
              id="task-description"
              value={editedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full"
              placeholder="Task description"
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold break-words pr-2">{task.title}</h2>
            <button
              onClick={onEditStart}
              className="p-1 hover:bg-accent rounded-full flex-shrink-0"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          
          {task.description && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlignLeft className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="break-words">{task.description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
