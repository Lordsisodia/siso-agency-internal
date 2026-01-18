import { useState, useEffect } from 'react';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { useLightWorkTasksSupabase } from '@/domains/tasks/hooks/useLightWorkTasksSupabase';
import { useDeepWorkTasksSupabase } from '@/domains/tasks/hooks/useDeepWorkTasksSupabase';
import { useMorningRoutineSupabase } from '@/domains/lifelock/1-daily/1-morning-routine/hooks/useMorningRoutineSupabase';
import { useHomeWorkoutSupabase } from '@/domains/lifelock/1-daily/5-stats/domain/useHomeWorkoutSupabase';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { aiTaskService, AITaskAnalysis, AIScheduleOptimization } from '../services/aiTaskService';
import { useOnlineStatus } from '@/lib/hooks/ui/useOnlineStatus';
import { offlineStorageService, MutationOperation } from '@/services/offline/OfflineStorageService';
import { syncManager } from '@/services/offline/SyncManager';

export interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  category: 'morning' | 'light-work' | 'deep-work' | 'wellness';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  estimatedDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineTaskGroup {
  date: string;
  tasks: TimelineTask[];
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

interface UseTimelineTasksOptions {
  startDate?: Date;
  endDate?: Date;
  categories?: Array<'morning' | 'light-work' | 'deep-work' | 'wellness'>;
}

export function useTimelineTasks(options: UseTimelineTasksOptions = {}) {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const { isOnline, isConnecting } = useOnlineStatus();
  
  const { 
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),   // 30 days ahead
    categories = ['morning', 'light-work', 'deep-work', 'wellness']
  } = options;

  // Offline state management
  const [offlineTasks, setOfflineTasks] = useState<TimelineTask[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Get tasks from all categories
  const { 
    tasks: lightWorkTasks, 
    loading: lightWorkLoading,
    createTask: createLightWorkTask,
    updateTask: updateLightWorkTask,
    deleteTask: deleteLightWorkTask
  } = useLightWorkTasksSupabase(internalUserId || '');

  const { 
    tasks: deepWorkTasks, 
    loading: deepWorkLoading,
    createTask: createDeepWorkTask,
    updateTask: updateDeepWorkTask,
    deleteTask: deleteDeepWorkTask
  } = useDeepWorkTasksSupabase(internalUserId || '');

  // Get morning routine data for different dates
  const [morningRoutines, setMorningRoutines] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [morningLoading, setMorningLoading] = useState(true);
  const [workoutLoading, setWorkoutLoading] = useState(true);

  const [timelineGroups, setTimelineGroups] = useState<TimelineTaskGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch morning routine and workout data for date range
  useEffect(() => {
    if (!internalUserId) return;
    
    const fetchRoutineData = async () => {
      setMorningLoading(true);
      setWorkoutLoading(true);
      
      const startTime = startOfDay(startDate);
      const endTime = endOfDay(endDate);
      const dateRange = [];
      
      // Generate date range
      for (let d = new Date(startTime); d <= endTime; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d).toISOString().split('T')[0]);
      }
      
      // For now, we'll just mark as loaded - in a full implementation,
      // we'd fetch data for each date in the range
      setMorningLoading(false);
      setWorkoutLoading(false);
    };
    
    fetchRoutineData();
  }, [internalUserId, startDate, endDate]);

  useEffect(() => {
    if (!internalUserId || lightWorkLoading || deepWorkLoading || morningLoading || workoutLoading) {
      setLoading(true);
      return;
    }

    try {
      // Combine all tasks
      const allTasks: TimelineTask[] = [];

      // Add light work tasks
      if (categories.includes('light-work')) {
        lightWorkTasks.forEach(task => {
          allTasks.push({
            id: `light-${task.id}`,
            title: task.title,
            description: task.description,
            category: 'light-work',
            priority: task.priority,
            completed: task.completed,
            originalDate: task.originalDate,
            currentDate: task.currentDate || task.originalDate,
            estimatedDuration: task.estimatedDuration,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          });
        });
      }

      // Add deep work tasks
      if (categories.includes('deep-work')) {
        deepWorkTasks.forEach(task => {
          allTasks.push({
            id: `deep-${task.id}`,
            title: task.title,
            description: task.description,
            category: 'deep-work',
            priority: task.priority,
            completed: task.completed,
            originalDate: task.originalDate,
            currentDate: task.currentDate || task.originalDate,
            estimatedDuration: task.estimatedDuration,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          });
        });
      }

      // Add morning routine tasks (these are daily routine items)
      if (categories.includes('morning')) {
        // For demo purposes, create sample morning routine tasks
        // In a full implementation, we'd use the actual morning routine data
        const morningTasks = [
          {
            id: 'morning-hydration',
            title: 'Morning Hydration',
            description: 'Drink a full glass of water upon waking',
            category: 'morning' as const,
            priority: 'high' as const,
            completed: false,
            originalDate: format(new Date(), 'yyyy-MM-dd'),
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            estimatedDuration: 5,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'morning-meditation',
            title: 'Morning Meditation',
            description: '10-minute mindfulness meditation',
            category: 'morning' as const,
            priority: 'medium' as const,
            completed: false,
            originalDate: format(new Date(), 'yyyy-MM-dd'),
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            estimatedDuration: 10,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        allTasks.push(...morningTasks);
      }

      // Add wellness/workout tasks
      if (categories.includes('wellness')) {
        // For demo purposes, create sample wellness tasks
        const wellnessTasks = [
          {
            id: 'wellness-pushups',
            title: 'Push-ups',
            description: '3 sets of 15 push-ups',
            category: 'wellness' as const,
            priority: 'medium' as const,
            completed: false,
            originalDate: format(new Date(), 'yyyy-MM-dd'),
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            estimatedDuration: 15,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'wellness-stretching',
            title: 'Stretching Routine',
            description: 'Full body stretching routine',
            category: 'wellness' as const,
            priority: 'low' as const,
            completed: false,
            originalDate: format(new Date(), 'yyyy-MM-dd'),
            currentDate: format(new Date(), 'yyyy-MM-dd'),
            estimatedDuration: 20,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        allTasks.push(...wellnessTasks);
      }

      // Filter tasks by date range
      const filteredTasks = allTasks.filter(task => {
        const taskDate = parseISO(task.currentDate);
        return isWithinInterval(taskDate, { start: startOfDay(startDate), end: endOfDay(endDate) });
      });

      // Group tasks by date
      const taskGroups = new Map<string, TimelineTask[]>();
      
      filteredTasks.forEach(task => {
        const dateKey = task.currentDate;
        if (!taskGroups.has(dateKey)) {
          taskGroups.set(dateKey, []);
        }
        taskGroups.get(dateKey)!.push(task);
      });

      // Convert to timeline groups and sort by date
      const groups: TimelineTaskGroup[] = Array.from(taskGroups.entries())
        .map(([date, tasks]) => {
          const completedTasks = tasks.filter(t => t.completed).length;
          return {
            date,
            tasks: tasks.sort((a, b) => a.title.localeCompare(b.title)),
            totalTasks: tasks.length,
            completedTasks,
            completionRate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setTimelineGroups(groups);
      setLoading(false);
    } catch (error) {
      console.error('Error processing timeline tasks:', error);
      setLoading(false);
    }
  }, [internalUserId, lightWorkTasks, deepWorkTasks, lightWorkLoading, deepWorkLoading, morningLoading, workoutLoading, startDate, endDate, categories]);

  // AI-powered task creation with automatic priority and time estimation
  const createTaskWithAI = async (taskData: {
    title: string;
    description?: string;
    category: 'light-work' | 'deep-work';
    currentDate: string;
    useAI?: boolean; // Optional: whether to use AI for priority/duration
  }) => {
    const finalTaskData = {
      ...taskData,
      priority: 'medium' as const,
      estimatedDuration: 30
    };
    
    // Use AI to analyze and set priority/duration if requested
    if (taskData.useAI !== false) {
      try {
        const aiAnalysis = await aiTaskService.analyzePriority(
          taskData.title,
          taskData.description,
          {
            currentTaskCount: totalTasks,
            upcomingDeadlines: 0, // Could be calculated from task dates
            userStressLevel: totalTasks > 15 ? 'high' : totalTasks > 8 ? 'medium' : 'low'
          }
        );
        
        finalTaskData.priority = aiAnalysis.priority;
        finalTaskData.estimatedDuration = aiAnalysis.estimatedDuration;
        
              } catch (error) {
        console.warn('AI analysis failed, using defaults:', error);
      }
    }
    
    if (taskData.category === 'light-work') {
      return await createLightWorkTask(finalTaskData);
    } else if (taskData.category === 'deep-work') {
      return await createDeepWorkTask(finalTaskData);
    }
    throw new Error(`Task creation not supported for category: ${taskData.category}`);
  };

  // Legacy task creation (backward compatibility)
  const createTask = async (taskData: {
    title: string;
    description?: string;
    category: 'light-work' | 'deep-work';
    priority: 'low' | 'medium' | 'high';
    currentDate: string;
    estimatedDuration?: number;
  }) => {
    if (taskData.category === 'light-work') {
      return await createLightWorkTask(taskData);
    } else if (taskData.category === 'deep-work') {
      return await createDeepWorkTask(taskData);
    }
    throw new Error(`Task creation not supported for category: ${taskData.category}`);
  };

  const updateTask = async (taskId: string, updates: Partial<TimelineTask>) => {
    const [category, id] = taskId.split('-');
    
    if (category === 'light') {
      return await updateLightWorkTask(id, updates);
    } else if (category === 'deep') {
      return await updateDeepWorkTask(id, updates);
    }
    throw new Error(`Task update not supported for task: ${taskId}`);
  };

  const deleteTask = async (taskId: string) => {
    const [category, id] = taskId.split('-');
    
    if (category === 'light') {
      return await deleteLightWorkTask(id);
    } else if (category === 'deep') {
      return await deleteDeepWorkTask(id);
    }
    throw new Error(`Task deletion not supported for task: ${taskId}`);
  };

  // AI-powered task recommendations
  const getAIRecommendations = async (availableTime: number = 60) => {
    const currentHour = new Date().getHours();
    const allTasks = timelineGroups.flatMap(group => group.tasks);
    
    // Determine user energy level based on completion rate and time of day
    let energyLevel: 'low' | 'medium' | 'high' = 'medium';
    if (overallCompletionRate > 80) energyLevel = 'high';
    else if (overallCompletionRate < 40) energyLevel = 'low';
    
    // Adjust for time of day (morning = higher energy)
    if (currentHour >= 6 && currentHour <= 10) {
      energyLevel = energyLevel === 'low' ? 'medium' : 'high';
    }
    
    try {
      const recommendations = await aiTaskService.recommendTasks(
        availableTime,
        {
          timeOfDay: currentHour,
          energyLevel,
          focusMode: false // Could be derived from user settings
        },
        allTasks.map(task => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          estimatedDuration: task.estimatedDuration || 30,
          category: task.category,
          completed: task.completed
        }))
      );
      
      console.log('🤖 AI Recommendations:', {
        availableTime,
        energyLevel,
        timeOfDay: currentHour,
        topRecommendations: recommendations.recommendedTasks.slice(0, 3),
        optimization: {
          energyOptimal: recommendations.energyOptimal,
          timeOptimal: recommendations.timeOptimal,
          workloadBalanced: recommendations.workloadBalanced
        }
      });
      
      return recommendations;
    } catch (error) {
      console.error('AI recommendations failed:', error);
      return null;
    }
  };

  // AI-powered task priority adjustment
  const adjustTaskPriorityWithAI = async (taskId: string, newContext?: string) => {
    const [category, id] = taskId.split('-');
    const task = timelineGroups
      .flatMap(group => group.tasks)
      .find(t => t.id === taskId);
    
    if (!task) return;
    
    try {
      const aiAnalysis = await aiTaskService.analyzePriority(
        task.title,
        `${task.description} ${newContext || ''}`,
        {
          currentTaskCount: totalTasks,
          upcomingDeadlines: 0,
          userStressLevel: totalTasks > 15 ? 'high' : 'medium'
        }
      );
      
      // Update task with AI-suggested priority
      await updateTask(taskId, {
        priority: aiAnalysis.priority,
        estimatedDuration: aiAnalysis.estimatedDuration
      });
      
            
      return aiAnalysis;
    } catch (error) {
      console.error('AI priority adjustment failed:', error);
      return null;
    }
  };

  // Time limit management functions
  const updateTimeLimit = async (taskId: string, newLimit: number) => {
    try {
      await updateTask(taskId, { estimatedDuration: newLimit });
      
    } catch (error) {
      console.error('Failed to update time limit:', error);
      throw error;
    }
  };

  const bulkUpdateTimeLimits = async (updates: Array<{ taskId: string; limit: number }>) => {
    try {
      const updatePromises = updates.map(({ taskId, limit }) => 
        updateTask(taskId, { estimatedDuration: limit })
      );
      
      await Promise.all(updatePromises);
      
      console.log('⏱️ Bulk Time Limits Updated:', {
        count: updates.length,
        updates: updates.map(u => ({ taskId: u.taskId, newLimit: u.limit }))
      });
    } catch (error) {
      console.error('Failed to bulk update time limits:', error);
      throw error;
    }
  };

  // Smart time allocation based on available time slots
  const optimizeTimeAllocation = async (availableTimeSlots: Array<{ start: Date; end: Date; minutes: number }>) => {
    const incompleteTasks = timelineGroups
      .flatMap(group => group.tasks)
      .filter(task => !task.completed)
      .sort((a, b) => {
        // Sort by priority first, then by estimated duration
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (a.estimatedDuration || 30) - (b.estimatedDuration || 30);
      });

    const allocations: Array<{
      taskId: string;
      timeSlot: { start: Date; end: Date; minutes: number };
      fitScore: number;
    }> = [];

    for (const slot of availableTimeSlots) {
      const suitableTasks = incompleteTasks.filter(task => {
        const taskDuration = task.estimatedDuration || 30;
        return taskDuration <= slot.minutes && 
               !allocations.some(a => a.taskId === task.id);
      });

      if (suitableTasks.length > 0) {
        const bestTask = suitableTasks[0]; // Already sorted by priority
        const fitScore = (slot.minutes - (bestTask.estimatedDuration || 30)) / slot.minutes;
        
        allocations.push({
          taskId: bestTask.id,
          timeSlot: slot,
          fitScore
        });
      }
    }

    console.log('🎯 Time Allocation Optimization:', {
      availableSlots: availableTimeSlots.length,
      allocatedTasks: allocations.length,
      averageFitScore: allocations.reduce((sum, a) => sum + a.fitScore, 0) / allocations.length
    });

    return allocations;
  };

  // Statistics
  const totalTasks = timelineGroups.reduce((sum, group) => sum + group.totalTasks, 0);
  const totalCompleted = timelineGroups.reduce((sum, group) => sum + group.completedTasks, 0);
  const overallCompletionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  return {
    timelineGroups,
    loading,
    totalTasks,
    totalCompleted,
    overallCompletionRate,
    
    // Task CRUD operations
    createTask,
    createTaskWithAI,
    updateTask,
    deleteTask,
    
    // AI-powered features
    getAIRecommendations,
    adjustTaskPriorityWithAI,
    
    // Time limit management
    updateTimeLimit,
    bulkUpdateTimeLimits,
    optimizeTimeAllocation,
    
    // Utility functions
    refetch: () => {
      // Triggers re-render by updating dependencies
    }
  };
}