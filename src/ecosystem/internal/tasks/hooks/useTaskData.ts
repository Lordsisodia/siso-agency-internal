/**
 * useTaskData Hook - Task Data Management
 * 
 * Extracted from useLifeLockData.ts (lines 48-137, ~90 lines)
 * Focused responsibility: Loading and managing task data
 * 
 * Benefits:
 * - Single responsibility: Only handles task data loading
 * - Better performance: Components using only task data won't re-render for voice/UI state changes
 * - Easier testing: Pure data loading logic can be tested independently
 * - Reusability: Other components can use just task data without other concerns
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { personalTaskService } from '@/services/workTypeApiClient';

export interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface UseTaskDataReturn {
  // Data
  todayCard: TaskCard | null;
  weekCards: TaskCard[];
  weekStart: Date;
  
  // Loading states  
  isLoadingToday: boolean;
  isLoadingWeek: boolean;
  
  // Actions
  refresh: () => void;
  
  // Errors
  todayError: string | null;
  weekError: string | null;
}

/**
 * Custom hook for task data management
 * Pure data loading and caching logic
 */
export const useTaskData = (selectedDate: Date): UseTaskDataReturn => {
  const { user } = useClerkUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Data state
  const [todayCard, setTodayCard] = useState<TaskCard | null>(null);
  const [weekCards, setWeekCards] = useState<TaskCard[]>([]);
  
  // Loading states
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  
  // Error states
  const [todayError, setTodayError] = useState<string | null>(null);
  const [weekError, setWeekError] = useState<string | null>(null);

  // Calculate week start for consistency - memoized to prevent infinite loops
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);

  // Load tasks for selected date
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    const loadDayTasks = async () => {
      setIsLoadingToday(true);
      setTodayError(null);
      
      try {
        // Only log once per date change, not on every refresh
        if (refreshTrigger === 0) {
          console.log(`📅 Loading tasks for ${format(selectedDate, 'yyyy-MM-dd')}`);
        }

        const dayTasks = await personalTaskService.getTasksForDate(user.id, selectedDate);
        
        if (isCancelled) return; // Exit early if component unmounted
        
        // Defensive programming: ensure dayTasks is always an array
        const safeTaskArray = Array.isArray(dayTasks) ? dayTasks : [];
        const taskCard: TaskCard = {
          id: format(selectedDate, 'yyyy-MM-dd'),
          date: selectedDate,
          title: format(selectedDate, 'EEEE, MMM d'),
          completed: safeTaskArray.length > 0 ? safeTaskArray.every(task => task.completed) : false,
          tasks: safeTaskArray.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed
          }))
        };

        if (!isCancelled) {
          setTodayCard(taskCard);
          setIsLoadingToday(false);
        }
      } catch (error) {
        console.error('Failed to load day tasks:', error);
        if (!isCancelled) {
          setTodayError(error instanceof Error ? error.message : 'Failed to load tasks');
          setTodayCard(null);
          setIsLoadingToday(false);
        }
      }
    };

    loadDayTasks();

    return () => {
      isCancelled = true;
    };
  }, [user, selectedDate, refreshTrigger]);

  // Load week context
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    const loadWeekTasks = async () => {
      setIsLoadingWeek(true);
      setWeekError(null);
      
      try {
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weekTaskCards: TaskCard[] = [];
        for (const day of weekDays) {
          if (isCancelled) return; // Exit early if component unmounted
          
          try {
            const weekDayTasks = await personalTaskService.getTasksForDate(user.id, day);
            // Defensive programming: ensure weekDayTasks is always an array
            const safeWeekTaskArray = Array.isArray(weekDayTasks) ? weekDayTasks : [];
            weekTaskCards.push({
              id: format(day, 'yyyy-MM-dd'),
              date: day,
              title: format(day, 'EEEE, MMM d'),
              completed: safeWeekTaskArray.length > 0 ? safeWeekTaskArray.every(task => task.completed) : false,
              tasks: safeWeekTaskArray.map(task => ({
                id: task.id,
                title: task.title,
                completed: task.completed
              }))
            });
          } catch (dayError) {
            console.error(`Failed to load tasks for ${format(day, 'yyyy-MM-dd')}:`, dayError);
            // Continue with empty task card to prevent hanging
            weekTaskCards.push({
              id: format(day, 'yyyy-MM-dd'),
              date: day,
              title: format(day, 'EEEE, MMM d'),
              completed: false,
              tasks: []
            });
          }
        }

        if (!isCancelled) {
          setWeekCards(weekTaskCards);
          setIsLoadingWeek(false);
        }
      } catch (error) {
        console.error('Failed to load week tasks:', error);
        if (!isCancelled) {
          setWeekError(error instanceof Error ? error.message : 'Failed to load week data');
          setWeekCards([]);
          setIsLoadingWeek(false);
        }
      }
    };

    loadWeekTasks();

    return () => {
      isCancelled = true;
    };
  }, [user, selectedDate, weekStart, refreshTrigger]);

  // Refresh function
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    // Data
    todayCard,
    weekCards,
    weekStart,
    
    // Loading states
    isLoadingToday,
    isLoadingWeek,
    
    // Actions
    refresh,
    
    // Errors
    todayError,
    weekError,
  };
};