
import React, { useState } from 'react';
import { Check, Trash2, Edit2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function SubtaskList({ subtasks, onToggle, onDelete, className }: SubtaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditValue(subtask.title);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleEditSave = (id: string) => {
    // Here you would typically save the edit to your data store
    // For now we'll just update the UI
    const updatedSubtasks = subtasks.map(st => 
      st.id === id ? { ...st, title: editValue } : st
    );
    
    // Assuming there's a parent component managing subtasks state
    // that would listen to changes
    setEditingId(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {subtasks.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-2">
          No subtasks yet
        </p>
      ) : (
        subtasks.map((subtask) => (
          <div 
            key={subtask.id} 
            className="flex items-center group gap-2 p-2 rounded-md bg-background hover:bg-accent/20"
          >
            <button
              onClick={() => onToggle(subtask.id)}
              className={cn(
                "h-5 w-5 rounded-sm border flex items-center justify-center flex-shrink-0",
                subtask.completed 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-input"
              )}
            >
              {subtask.completed && <Check className="h-3 w-3" />}
            </button>
            
            {editingId === subtask.id ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-7 py-1"
                  autoFocus
                />
                <button
                  onClick={() => handleEditSave(subtask.id)}
                  className="p-1 hover:bg-background rounded-full"
                >
                  <Check className="h-4 w-4 text-green-500" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-1 hover:bg-background rounded-full"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <span className={cn(
                  "flex-1 text-sm",
                  subtask.completed && "line-through text-muted-foreground"
                )}>
                  {subtask.title}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditStart(subtask)}
                    className="p-1 hover:bg-background rounded-full"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onDelete(subtask.id)}
                    className="p-1 hover:bg-background rounded-full"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
