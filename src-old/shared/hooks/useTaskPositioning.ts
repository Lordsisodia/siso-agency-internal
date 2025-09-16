
import { Task } from '@/types/task.types';
import { useIsMobile } from './use-mobile';

interface TaskPosition {
  top: number;
  left: number;
  height: number;
  width: string;
}

export function useTaskPositioning() {
  const isMobile = useIsMobile();
  const HOUR_HEIGHT = isMobile ? 80 : 100; // Increased height
  const MINUTES_IN_HOUR = 60;
  const CARD_MIN_HEIGHT = isMobile ? 80 : 100; // Increased minimum height

  const calculateTaskPosition = (task: Task, overlappingTasks: Task[] = []): TaskPosition => {
    if (!task.start_time) {
      return { top: 0, left: 0, height: CARD_MIN_HEIGHT, width: '100%' };
    }

    const startTime = new Date(task.start_time);
    const minutes = startTime.getHours() * MINUTES_IN_HOUR + startTime.getMinutes();
    const duration = task.duration || 60;
    
    // Calculate vertical position and height
    const pixelsPerMinute = HOUR_HEIGHT / MINUTES_IN_HOUR;
    const topPosition = minutes * pixelsPerMinute;
    const heightInPixels = Math.max(duration * pixelsPerMinute, CARD_MIN_HEIGHT);

    // Handle overlapping tasks
    const offsetWidth = isMobile ? 92 : 85; // Adjusted width percentages
    let leftOffset = 0;
    
    if (overlappingTasks.length > 0) {
      const taskIndex = overlappingTasks.findIndex(t => t.id === task.id);
      leftOffset = (taskIndex * (isMobile ? 6 : 12)); // Adjusted offset
      const width = `${offsetWidth - (overlappingTasks.length - 1) * (isMobile ? 6 : 12)}%`;
      return {
        top: topPosition,
        left: leftOffset,
        height: heightInPixels,
        width
      };
    }

    return {
      top: topPosition,
      left: 0,
      height: heightInPixels,
      width: `${offsetWidth}%`
    };
  };

  const findOverlappingTasks = (tasks: Task[], currentTask: Task): Task[] => {
    if (!currentTask.start_time) return [];
    
    const currentStart = new Date(currentTask.start_time).getTime();
    const currentEnd = new Date(currentStart + (currentTask.duration || 60) * 60000).getTime();

    return tasks.filter(task => {
      if (!task.start_time || task.id === currentTask.id) return false;
      
      const taskStart = new Date(task.start_time).getTime();
      const taskEnd = new Date(taskStart + (task.duration || 60) * 60000).getTime();

      return (currentStart < taskEnd && currentEnd > taskStart);
    });
  };

  return {
    calculateTaskPosition,
    findOverlappingTasks
  };
}
