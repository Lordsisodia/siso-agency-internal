import { format } from 'date-fns';

// Interface for persisted task state
export interface PersistedTaskState {
  id: string;
  completed: boolean;
  logValue?: string;
  updatedAt: string;
}

// Interface for daily task state
export interface PersistedDayState {
  date: string;
  tasks: PersistedTaskState[];
  completionRate: number;
  updatedAt: string;
}

// Storage key prefix
const STORAGE_KEY_PREFIX = 'lifelock_tasks_';

// Get storage key for a specific date
const getStorageKey = (date: Date): string => {
  return `${STORAGE_KEY_PREFIX}${format(date, 'yyyy-MM-dd')}`;
};

// Save task states for a specific date
export const saveTaskStatesForDate = (date: Date, tasks: PersistedTaskState[]): void => {
  try {
    const storageKey = getStorageKey(date);
    const completionRate = tasks.length > 0 
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : 0;
    
    const dayState: PersistedDayState = {
      date: format(date, 'yyyy-MM-dd'),
      tasks,
      completionRate,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(dayState));
    console.log(`Saved task states for ${format(date, 'yyyy-MM-dd')}:`, dayState);
  } catch (error) {
    console.error('Failed to save task states:', error);
  }
};

// Load task states for a specific date
export const loadTaskStatesForDate = (date: Date): PersistedDayState | null => {
  try {
    const storageKey = getStorageKey(date);
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) {
      return null;
    }
    
    const dayState: PersistedDayState = JSON.parse(storedData);
    console.log(`Loaded task states for ${format(date, 'yyyy-MM-dd')}:`, dayState);
    return dayState;
  } catch (error) {
    console.error('Failed to load task states:', error);
    return null;
  }
};

// Update a specific task's state
export const updateTaskState = (date: Date, taskId: string, updates: Partial<PersistedTaskState>): void => {
  const existingState = loadTaskStatesForDate(date);
  
  if (existingState) {
    // Update existing task
    const updatedTasks = existingState.tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    saveTaskStatesForDate(date, updatedTasks);
  } else {
    // Create new state with this task
    const newTask: PersistedTaskState = {
      id: taskId,
      completed: false,
      updatedAt: new Date().toISOString(),
      ...updates
    };
    saveTaskStatesForDate(date, [newTask]);
  }
};

// Toggle task completion
export const toggleTaskCompletion = (date: Date, taskId: string): boolean => {
  const existingState = loadTaskStatesForDate(date);
  let newCompletedState = true; // Default to true if no existing state
  
  if (existingState) {
    const existingTask = existingState.tasks.find(t => t.id === taskId);
    newCompletedState = existingTask ? !existingTask.completed : true;
  }
  
  updateTaskState(date, taskId, { completed: newCompletedState });
  return newCompletedState;
};

// Get completion rate for a specific date
export const getCompletionRateForDate = (date: Date): number => {
  const dayState = loadTaskStatesForDate(date);
  return dayState ? dayState.completionRate : 0;
};

// Clear all task states (useful for development/testing)
export const clearAllTaskStates = (): void => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_KEY_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} task state entries`);
  } catch (error) {
    console.error('Failed to clear task states:', error);
  }
};

// Get all stored dates with task data
export const getStoredDates = (): string[] => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_KEY_PREFIX));
    return keys.map(key => key.replace(STORAGE_KEY_PREFIX, ''));
  } catch (error) {
    console.error('Failed to get stored dates:', error);
    return [];
  }
};

// Export all functions as default object
export default {
  saveTaskStatesForDate,
  loadTaskStatesForDate,
  updateTaskState,
  toggleTaskCompletion,
  getCompletionRateForDate,
  clearAllTaskStates,
  getStoredDates
};