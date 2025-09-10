import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Plus } from 'lucide-react';
import type { TaskCreationModalProps } from '../types';

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onAddTask
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    onAddTask(newTaskTitle, newTaskDescription);
    setNewTaskTitle('');
    setNewTaskDescription('');
    onClose();
  };

  const handleCancel = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 animate-pulse hover:animate-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          ➕ Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-green-400">Add New Light Work Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddTask();
              }
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            autoFocus
          />
          <Textarea
            placeholder="Task description (optional)..."
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleAddTask();
              }
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleAddTask}
              className="bg-green-600 hover:bg-green-700"
              disabled={!newTaskTitle.trim()}
            >
              Add Task
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};