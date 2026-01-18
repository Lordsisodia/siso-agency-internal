
import React from 'react';
import { Plus } from 'lucide-react';
import { SubtaskList } from '../subtasks/SubtaskList';
import { Separator } from '@/components/ui/separator';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface SubtasksSectionProps {
  subtasks: Subtask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function SubtasksSection({ subtasks, onToggle, onDelete, onAdd }: SubtasksSectionProps) {
  const completedSubtasks = subtasks.filter(st => st.completed).length;

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Subtasks ({completedSubtasks}/{subtasks.length})</h3>
          <button
            onClick={onAdd}
            className="p-1 hover:bg-accent rounded-full"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        
        <SubtaskList 
          subtasks={subtasks}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}
