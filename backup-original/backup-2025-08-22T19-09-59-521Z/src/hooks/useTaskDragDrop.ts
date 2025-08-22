import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/task.types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from './use-mobile';

export function useTaskDragDrop() {
  const { useUpdateTask } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const HOUR_HEIGHT = isMobile ? 60 : 100;
  const MINUTES_IN_HOUR = 60;
  
  const calculateTimeFromPosition = (y: number) => {
    const totalMinutes = Math.round((y / HOUR_HEIGHT) * MINUTES_IN_HOUR);
    const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
    const minutes = Math.round((totalMinutes % MINUTES_IN_HOUR) / 15) * 15;
    
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (!task.id) {
      console.error('Invalid task dragged:', task);
      return;
    }

    const taskElement = e.currentTarget as HTMLElement;
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create ghost element for better drag visualization
    const ghost = taskElement.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.7';
    ghost.style.position = 'absolute';
    ghost.style.left = '-9999px';
    ghost.style.top = '-9999px';
    ghost.style.width = `${taskElement.offsetWidth}px`;
    ghost.style.pointerEvents = 'none';
    
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 10, 10);
    
    requestAnimationFrame(() => {
      document.body.removeChild(ghost);
    });
    
    setIsDragging(true);

    let guideLine = document.getElementById('dragGuideLine');
    if (!guideLine) {
      guideLine = document.createElement('div');
      guideLine.id = 'dragGuideLine';
      guideLine.className = 'fixed left-0 right-0 h-0.5 bg-purple-500 pointer-events-none z-50';
      document.body.appendChild(guideLine);
    }
    guideLine.style.display = 'block';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const guideLine = document.getElementById('dragGuideLine');
    if (guideLine) {
      guideLine.remove();
    }
  };

  const handleDrop = async (e: React.DragEvent, dropZone: HTMLElement) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    if (!taskId) {
      console.error('No task ID found in drop event');
      toast({
        variant: "destructive",
        title: "Error rescheduling task",
        description: "Could not identify the task being moved"
      });
      handleDragEnd();
      return;
    }

    try {
      console.log('Attempting to reschedule task:', taskId);
      const rect = dropZone.getBoundingClientRect();
      const scrollOffset = dropZone.scrollTop || 0;
      const y = e.clientY - rect.top + scrollOffset;
      
      const newStartTime = calculateTimeFromPosition(y);
      console.log('New start time calculated:', newStartTime.toISOString());
      
      await updateTaskMutation.mutateAsync({
        id: taskId,
        start_time: newStartTime.toISOString()
      });

      toast({
        title: "Task rescheduled",
        description: `Task moved to ${newStartTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
      });
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast({
        variant: "destructive",
        title: "Error rescheduling task",
        description: error instanceof Error ? error.message : "Failed to update task"
      });
    } finally {
      handleDragEnd();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const guideLine = document.getElementById('dragGuideLine');
    if (guideLine && e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollOffset = e.currentTarget.scrollTop || 0;
      const y = e.clientY - rect.top + scrollOffset;
      
      // Snap to 15-minute intervals
      const snappedY = Math.round(y / (HOUR_HEIGHT / 4)) * (HOUR_HEIGHT / 4);
      
      guideLine.style.top = `${e.clientY}px`;
      guideLine.style.display = 'block';
    }
  };

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragOver,
    HOUR_HEIGHT
  };
}
