import React, { useState } from 'react';
import { Task } from '@/types/task.types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useToast } from '@/hooks/use-toast';
import { SubtaskList } from './SubtaskList';
import { Plus } from 'lucide-react';
import { TaskContent } from './task-detail/TaskContent';
import { TaskMetadata } from './task-detail/TaskMetadata';
import { TaskActions } from './task-detail/TaskActions';
import { format } from 'date-fns';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailDrawer({ task, isOpen, onClose }: TaskDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  
  const { useUpdateTask } = useTaskOperations();
  const { mutate: updateTask } = useUpdateTask();
  const { toast } = useToast();
  
  const [subtasks, setSubtasks] = useState([
    { id: '1', title: 'Research requirements', completed: true },
    { id: '2', title: 'Create mockups', completed: false },
    { id: '3', title: 'Implementation', completed: false },
    { id: '4', title: 'Testing', completed: false },
  ]);

  const handleSaveChanges = () => {
    if (!task) return;
    
    updateTask(
      { 
        id: task.id, 
        title: editedTitle,
        description: editedDescription 
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({
            title: "Task updated",
            description: "The task has been updated successfully.",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update task: " + error.message,
          });
        },
      }
    );
  };

  const handleScheduleTask = () => {
    if (!task) return;
    
    const now = new Date();
    const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(roundedMinutes, 0, 0);
    
    updateTask(
      { 
        id: task.id, 
        start_time: now.toISOString(),
        duration: 60 // Default to 1 hour
      },
      {
        onSuccess: () => {
          toast({
            title: "Task scheduled",
            description: `"${task.title}" scheduled for ${format(now, 'h:mm a')}.`,
          });
          onClose();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to schedule task.",
          });
        },
      }
    );
  };

  const handleMarkAsComplete = () => {
    if (!task) return;
    
    updateTask(
      { 
        id: task.id, 
        status: task.status === 'completed' ? 'pending' : 'completed'
      },
      {
        onSuccess: () => {
          toast({
            title: task.status === 'completed' ? "Task reopened" : "Task completed",
            description: task.status === 'completed' 
              ? `"${task.title}" has been reopened.` 
              : `"${task.title}" has been marked as complete.`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update task status.",
          });
        },
      }
    );
  };

  const handleSubtaskToggle = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleAddSubtask = () => {
    const newId = String(subtasks.length + 1);
    setSubtasks([...subtasks, { id: newId, title: 'New subtask', completed: false }]);
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  if (!task) return null;

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-md mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl">Task Details</DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 py-2 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Title and description section */}
            <TaskContent
              task={task}
              isEditing={isEditing}
              editedTitle={editedTitle}
              editedDescription={editedDescription}
              onEditStart={() => setIsEditing(true)}
              onTitleChange={setEditedTitle}
              onDescriptionChange={setEditedDescription}
            />
                
            <Separator />
            
            {/* Status and metadata section */}
            <TaskMetadata task={task} />
            
            <Separator />
            
            {/* Subtasks section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Subtasks ({completedSubtasks}/{subtasks.length})</h3>
                <button
                  onClick={handleAddSubtask}
                  className="p-1 hover:bg-accent rounded-full"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <SubtaskList 
                subtasks={subtasks}
                onToggle={handleSubtaskToggle}
                onDelete={handleDeleteSubtask}
              />
            </div>
          </div>
          
          <DrawerFooter className="pt-2">
            <TaskActions 
              task={task}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
              onSave={handleSaveChanges}
              onSchedule={handleScheduleTask}
              onComplete={handleMarkAsComplete}
            />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
