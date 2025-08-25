import React, { useState } from 'react';
import { Task } from '@/types/task.types';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useToast } from '@/hooks/use-toast';
import { TaskContent } from './TaskContent';
import { TaskMetadata } from './TaskMetadata';
import { TaskActions } from './TaskActions';
import { TaskDetailHeader } from './TaskDetailHeader';
import { SubtasksSection } from './SubtasksSection';
import { useSubtasks } from '@/hooks/useSubtasks';
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

  const initialSubtasks = [
    { id: '1', title: 'Research requirements', completed: true },
    { id: '2', title: 'Create mockups', completed: false },
    { id: '3', title: 'Implementation', completed: false },
    { id: '4', title: 'Testing', completed: false },
  ];

  const { 
    subtasks, 
    handleSubtaskToggle, 
    handleAddSubtask, 
    handleDeleteSubtask 
  } = useSubtasks(initialSubtasks);

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

  if (!task) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="max-w-md mx-auto w-full">
          <TaskDetailHeader />
          
          <div className="px-4 py-2 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            <TaskContent
              task={task}
              isEditing={isEditing}
              editedTitle={editedTitle}
              editedDescription={editedDescription}
              onEditStart={() => setIsEditing(true)}
              onTitleChange={setEditedTitle}
              onDescriptionChange={setEditedDescription}
            />
                
            <TaskMetadata task={task} />
            
            <SubtasksSection 
              subtasks={subtasks}
              onToggle={handleSubtaskToggle}
              onDelete={handleDeleteSubtask}
              onAdd={handleAddSubtask}
            />
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
