
import React, { useState } from 'react';
import { SubtaskItem } from './SubtaskItem';
import { EmptySubtasks } from './EmptySubtasks';
import { cn } from '@/lib/utils';

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

  if (subtasks.length === 0) {
    return <EmptySubtasks />;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {subtasks.map((subtask) => (
        <SubtaskItem
          key={subtask.id}
          subtask={subtask}
          isEditing={editingId === subtask.id}
          editValue={editValue}
          onToggle={onToggle}
          onDelete={onDelete}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onEditSave={handleEditSave}
          onEditChange={setEditValue}
        />
      ))}
    </div>
  );
}
