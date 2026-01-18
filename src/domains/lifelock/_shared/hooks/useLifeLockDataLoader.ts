import { useState, useEffect, useMemo } from 'react';
import { LifeLockService, DailyRoutine, DailyWorkout, DailyHealth, DailyHabits, DailyReflections } from '@/services/shared/task.service';
import { EnhancedTaskService, EnhancedTask } from '@/services/shared/task.service';

interface RealLifeLockData {
  routine: DailyRoutine | null;
  workout: DailyWorkout | null;
  health: DailyHealth | null;
  habits: DailyHabits | null;
  reflections: DailyReflections | null;
  deepFocusTasks: EnhancedTask[];
}

interface TaskSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  progress: number;
  completedCount: number;
  totalCount: number;
  metrics?: {
    hoursLogged?: number;
    targetHours?: number;
    streak?: number;
    efficiency?: number;
    completionTime?: string;
  };
}

/**
 * useLifeLockDataLoader - Data loading and transformation hook
 * 
 * Extracted from InteractiveTodayCard.tsx (1,232 lines → focused hook)
 * Handles all LifeLock data fetching, transformation, and task section generation
 */
export const useLifeLockDataLoader = (date: Date) => {
  const [lifeLockData, setLifeLockData] = useState<RealLifeLockData>({
    routine: null,
    workout: null,
    health: null,
    habits: null,
    reflections: null,
    deepFocusTasks: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real LifeLock data
  useEffect(() => {
    const loadRealData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [allDailyData, deepFocusTasks] = await Promise.all([
          LifeLockService.getAllDailyData(date),
          EnhancedTaskService.getDeepFocusTasksForDate(date)
        ]);
        
        setLifeLockData({
          routine: allDailyData.routine,
          workout: allDailyData.workout,
          health: allDailyData.health,
          habits: allDailyData.habits,
          reflections: allDailyData.reflections,
          deepFocusTasks: deepFocusTasks
        });
      } catch (error) {
        console.error('Failed to load LifeLock data:', error);
        setError('Failed to load LifeLock data');
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, [date]);

  // Generate task sections from real LifeLock data
  const taskSections: TaskSection[] = useMemo(() => {
    if (isLoading) return [];
    
    const sections: TaskSection[] = [];
    
    // Morning Routine Section - Enhanced
    if (lifeLockData.routine?.items) {
      const routineItems = lifeLockData.routine.items;
      const completedCount = routineItems.filter(item => item.completed).length;
      const totalCount = routineItems.length;
      const isFullyCompleted = completedCount === totalCount && totalCount > 0;
      sections.push({
        id: 'morning',
        title: isFullyCompleted ? '🌅 Morning Routine Complete!' : 'Morning Routine',
        icon: isFullyCompleted ? CheckCircle : Sun,
        color: isFullyCompleted ? 'green' : 'yellow',
        tasks: routineItems.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          streak: 5, // Could be calculated from historical data
          completionTime: isFullyCompleted ? '7:30 AM' : undefined,
          efficiency: isFullyCompleted ? 95 : Math.round((completedCount / totalCount) * 100)
        }
      });
    }
    
    // Deep Focus Work Section
    if (lifeLockData.deepFocusTasks.length > 0) {
      const deepTasks = lifeLockData.deepFocusTasks;
      const completedCount = deepTasks.filter(task => task.status === 'done').length;
      const totalCount = deepTasks.length;
      sections.push({
        id: 'deep-focus',
        title: 'Deep Focus Work',
        icon: Brain,
        color: 'orange',
        tasks: deepTasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.status === 'done'
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          hoursLogged: lifeLockData.habits?.deep_work_hours || 0,
          targetHours: 8,
          efficiency: 85
        }
      });
    }
    
    // Workout Section
    if (lifeLockData.workout?.exercises) {
      const workoutItems = lifeLockData.workout.exercises;
      const completedCount = workoutItems.filter(item => item.completed).length;
      const totalCount = workoutItems.length;
      sections.push({
        id: 'workout',
        title: 'Workout',
        icon: Dumbbell,
        color: 'red',
        tasks: workoutItems.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          streak: 3
        }
      });
    }
    
    // Health Section
    if (lifeLockData.health?.health_checklist) {
      const healthItems = lifeLockData.health.health_checklist;
      const completedCount = healthItems.filter(item => item.completed).length;
      const totalCount = healthItems.length;
      sections.push({
        id: 'health',
        title: 'Health',
        icon: Heart,
        color: 'pink',
        tasks: healthItems.map(item => ({
          id: item.id,
          title: item.title,
          completed: item.completed
        })),
        progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        completedCount,
        totalCount,
        metrics: {
          streak: 7
        }
      });
    }
    
    // Light Focus Section
    if (lifeLockData.habits?.habits_data?.lightFocusTasks) {
      const lightTasks = lifeLockData.habits.habits_data.lightFocusTasks.filter(task => task.title);
      const completedCount = lightTasks.filter(task => task.completed).length;
      const totalCount = lightTasks.length;
      if (totalCount > 0) {
        sections.push({
          id: 'light-focus',
          title: 'Light Focus',
          icon: Coffee,
          color: 'green',
          tasks: lightTasks.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed
          })),
          progress: (completedCount / totalCount) * 100,
          completedCount,
          totalCount,
          metrics: {
            hoursLogged: lifeLockData.habits?.light_work_hours || 0,
            targetHours: 4
          }
        });
      }
    }
    
    return sections;
  }, [lifeLockData, isLoading]);

  // Calculate overall progress from all sections
  const overallProgress = useMemo(() => {
    if (taskSections.length === 0) return 0;
    
    const totalTasks = taskSections.reduce((sum, section) => sum + section.totalCount, 0);
    const completedTasks = taskSections.reduce((sum, section) => sum + section.completedCount, 0);
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }, [taskSections]);

  // Update milk intake handler
  const updateMilkIntake = (newIntake: number) => {
    if (lifeLockData.health) {
      setLifeLockData(prev => ({
        ...prev,
        health: prev.health ? {
          ...prev.health,
          milk_intake_ml: newIntake
        } : null
      }));
    }
  };

  return {
    lifeLockData,
    taskSections,
    overallProgress,
    isLoading,
    error,
    updateMilkIntake
  };
};

// Import the required icons (needed for the hook but imports should be at component level)
import { 
  Sun, 
  Brain, 
  Dumbbell, 
  Heart, 
  Coffee, 
  CheckCircle 
} from 'lucide-react';