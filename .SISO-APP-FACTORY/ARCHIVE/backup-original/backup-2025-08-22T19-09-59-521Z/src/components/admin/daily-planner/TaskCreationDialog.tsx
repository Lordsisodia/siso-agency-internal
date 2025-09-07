
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCategory, TaskPriority } from '@/hooks/useTasks';

interface TaskCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
}

export function TaskCreationDialog({ open, onOpenChange, onSubmit }: TaskCreationDialogProps) {
  const categories: TaskCategory[] = [
    'main',
    'weekly',
    'daily',
    'siso_app_dev',
    'onboarding_app',
    'instagram'
  ];

  const priorities: TaskPriority[] = ['low', 'medium', 'high'];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="title" placeholder="Task Title" required />
          <Input name="description" placeholder="Description (optional)" />
          
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="priority" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="datetime-local"
            name="due_date"
            className="w-full"
          />

          <Button type="submit">Create Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
