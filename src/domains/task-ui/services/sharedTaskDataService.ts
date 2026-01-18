import { format, isSameDay } from 'date-fns';
import { loadTaskStatesForDate, saveTaskStatesForDate, PersistedTaskState } from './taskPersistenceService';

// Shared interface that matches both overview and detail page expectations
export interface SharedTaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    logField?: string;
    logValue?: string;
  }[];
}

// Generate consistent, realistic task data for any date with persistence
export const generateRealisticTasksForDate = (date: Date): SharedTaskCard => {
  // First, try to load persisted task states for this date
  const persistedState = loadTaskStatesForDate(date);
  const isToday = isSameDay(date, new Date());
  const isPast = date < new Date() && !isToday;
  const isFuture = date > new Date();
  const dayOfWeek = date.getDay();
  
  // More detailed tasks that match the day view structure
  const baseTasksForToday = [
    { 
      id: '1', 
      title: 'Morning Routine (60 min)', 
      completed: isToday ? false : isPast,
      description: 'Complete the full morning routine to start the day right.',
      logField: 'Time started: ____'
    },
    { 
      id: '2', 
      title: 'Deep Work Session', 
      completed: isToday ? false : isPast,
      description: 'Focus on the most important tasks without distractions.',
      logField: 'Hours worked: ____'
    },
    { 
      id: '3', 
      title: 'Exercise & Movement', 
      completed: isToday ? false : isPast && dayOfWeek !== 0,
      description: 'Physical activity to maintain health and energy.',
      logField: 'Workout type: ____'
    },
    { 
      id: '4', 
      title: 'Healthy Meals', 
      completed: isToday ? false : isPast,
      description: 'Maintain proper nutrition throughout the day.',
      logField: 'Meals: ____'
    },
    { 
      id: '5', 
      title: 'Review & Planning', 
      completed: isToday ? false : isPast,
      description: 'Reflect on progress and plan for tomorrow.',
      logField: 'Key insights: ____'
    }
  ];

  const baseTasks = [
    { 
      id: '1', 
      title: 'Morning Routine', 
      completed: isPast,
      description: 'Start the day with good habits.'
    },
    { 
      id: '2', 
      title: 'Focus Work', 
      completed: isPast && dayOfWeek >= 1 && dayOfWeek <= 5,
      description: 'Productive work session.'
    },
    { 
      id: '3', 
      title: 'Physical Activity', 
      completed: isPast && dayOfWeek !== 0,
      description: 'Stay active and healthy.'
    },
    { 
      id: '4', 
      title: 'Daily Review', 
      completed: isPast,
      description: 'Reflect and plan ahead.'
    }
  ];

  // Use detailed tasks for today, simplified for other days
  const tasks = isToday ? baseTasksForToday : baseTasks.filter(task => {
    // Filter out work tasks on weekends for past/future dates
    if (task.title.includes('Focus Work') && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return false;
    }
    return true;
  });

  // Apply persisted task states if available
  const tasksWithPersistence = tasks.map(task => {
    const persistedTask = persistedState?.tasks.find(p => p.id === task.id);
    if (persistedTask) {
      return {
        ...task,
        completed: persistedTask.completed,
        logValue: persistedTask.logValue
      };
    }
    return task;
  });

  const completedTasks = tasksWithPersistence.filter(task => task.completed).length;
  
  return {
    id: format(date, 'yyyy-MM-dd'),
    date,
    title: format(date, 'EEEE, MMM d'),
    completed: completedTasks === tasksWithPersistence.length && isPast,
    tasks: tasksWithPersistence
  };
};

// Convert shared task data to LifeLock service format for compatibility
export const convertToLifeLockRoutine = (taskCard: SharedTaskCard) => {
  return {
    date: format(taskCard.date, 'yyyy-MM-dd'),
    routine_type: 'morning' as const,
    items: taskCard.tasks.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      description: task.description,
      logField: task.logField,
      logValue: task.logValue
    })),
    completed_count: taskCard.tasks.filter(t => t.completed).length,
    total_count: taskCard.tasks.length,
    completion_percentage: taskCard.tasks.length > 0 
      ? Math.round((taskCard.tasks.filter(t => t.completed).length / taskCard.tasks.length) * 100)
      : 0
  };
};

// Get consistent task data for a specific date - this will be used by both pages
export const getTaskDataForDate = async (date: Date): Promise<SharedTaskCard> => {
  // For now, we'll always return generated data
  // In the future, this could check for real data first, then fallback to generated
  return generateRealisticTasksForDate(date);
};

// Batch get task data for multiple dates (useful for week/month views)
export const getTaskDataForDates = async (dates: Date[]): Promise<SharedTaskCard[]> => {
  return dates.map(date => generateRealisticTasksForDate(date));
};

// Toggle a task's completion status and persist the change
export const toggleTaskForDate = (date: Date, taskId: string): SharedTaskCard => {
  // Get current task data
  const currentCard = generateRealisticTasksForDate(date);
  const updatedTasks = currentCard.tasks.map(task => 
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  
  // Save the updated states to persistence
  const persistedTasks: PersistedTaskState[] = updatedTasks.map(task => ({
    id: task.id,
    completed: task.completed,
    logValue: task.logValue,
    updatedAt: new Date().toISOString()
  }));
  
  saveTaskStatesForDate(date, persistedTasks);
  
  // Return updated card
  const completedCount = updatedTasks.filter(t => t.completed).length;
  return {
    ...currentCard,
    tasks: updatedTasks,
    completed: completedCount === updatedTasks.length
  };
};

// Update a task's log value and persist the change
export const updateTaskLogForDate = (date: Date, taskId: string, logValue: string): SharedTaskCard => {
  // Get current task data
  const currentCard = generateRealisticTasksForDate(date);
  const updatedTasks = currentCard.tasks.map(task => 
    task.id === taskId ? { ...task, logValue } : task
  );
  
  // Save the updated states to persistence
  const persistedTasks: PersistedTaskState[] = updatedTasks.map(task => ({
    id: task.id,
    completed: task.completed,
    logValue: task.logValue,
    updatedAt: new Date().toISOString()
  }));
  
  saveTaskStatesForDate(date, persistedTasks);
  
  // Return updated card
  return {
    ...currentCard,
    tasks: updatedTasks
  };
};

export default {
  generateRealisticTasksForDate,
  convertToLifeLockRoutine,
  getTaskDataForDate,
  getTaskDataForDates,
  toggleTaskForDate,
  updateTaskLogForDate
};