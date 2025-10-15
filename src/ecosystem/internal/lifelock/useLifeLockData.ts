import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { personalTaskService } from '@/shared/services/task.service';
import { ClerkHybridTaskService } from '@/shared/services/auth.service';
import { lifeLockVoiceTaskProcessor, ThoughtDumpResult } from '@/services/lifeLockVoiceTaskProcessor';
import { eisenhowerMatrixOrganizer, EisenhowerMatrixResult } from '@/shared/services/task.service';

export interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    workType: 'LIGHT' | 'DEEP';
    priority?: string;
  }[];
}

export const useLifeLockData = (selectedDate: Date) => {
  const { user } = useClerkUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Task management state
  const [todayCard, setTodayCard] = useState<TaskCard | null>(null);
  const [weekCards, setWeekCards] = useState<TaskCard[]>([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isAnalyzingTasks, setIsAnalyzingTasks] = useState(false);
  const [lastThoughtDumpResult, setLastThoughtDumpResult] = useState<ThoughtDumpResult | null>(null);
  const [eisenhowerResult, setEisenhowerResult] = useState<EisenhowerMatrixResult | null>(null);
  const [showEisenhowerModal, setShowEisenhowerModal] = useState(false);

  // Initialize hybrid service
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await ClerkHybridTaskService.initialize();
        console.log('✅ [APP] Hybrid service initialized');
      } catch (error) {
        console.error('❌ [APP] Hybrid service initialization failed:', error);
      }
    };

    initializeApp();
  }, []);

  // Load tasks for selected date
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    const loadDayTasks = async () => {
      try {
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
            completed: task.completed,
            workType: task.workType ?? 'LIGHT',
            priority: task.priority
          }))
        };

        if (!isCancelled) {
          setTodayCard(taskCard);
        }

        // Load week context only if needed (not on every refresh)
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weekTaskCards: TaskCard[] = await Promise.all(
          weekDays.map(async (day) => {
            try {
              const weekDayTasks = await personalTaskService.getTasksForDate(user.id, day);
              const safeWeekTaskArray = Array.isArray(weekDayTasks) ? weekDayTasks : [];
              return {
                id: format(day, 'yyyy-MM-dd'),
                date: day,
                title: format(day, 'EEEE, MMM d'),
                completed: safeWeekTaskArray.length > 0 ? safeWeekTaskArray.every(task => task.completed) : false,
                tasks: safeWeekTaskArray.map(task => ({
                  id: task.id,
                  title: task.title,
                  completed: task.completed,
                  workType: task.workType ?? 'LIGHT',
                  priority: task.priority
                }))
              };
            } catch (dayError) {
              console.error(`Failed to load tasks for ${format(day, 'yyyy-MM-dd')}:`, dayError);
              return {
                id: format(day, 'yyyy-MM-dd'),
                date: day,
                title: format(day, 'EEEE, MMM d'),
                completed: false,
                tasks: []
              };
            }
          })
        );

        if (!isCancelled) {
          setWeekCards(weekTaskCards);
        }
      } catch (error) {
        console.error('Failed to load day tasks:', error);
        if (!isCancelled) {
          setTodayCard(null);
          setWeekCards([]);
        }
      }
    };

    loadDayTasks();

    return () => {
      isCancelled = true;
    };
  }, [user, selectedDate, refreshTrigger]);

  // Action handlers
  const handleTaskToggle = async (taskId: string) => {
    try {
      const allTasks = [
        ...(todayCard?.tasks ?? []),
        ...weekCards.flatMap(card => card.tasks)
      ];
      const targetTask = allTasks.find(task => task.id === taskId);
      const workType = targetTask?.workType ?? 'LIGHT';
      await personalTaskService.toggleTask(taskId, workType, targetTask?.completed);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleCustomTaskAdd = async (task: { title: string; priority: 'low' | 'medium' | 'high' }) => {
    try {
      await personalTaskService.addTask(task.title, selectedDate, task.priority, 'LIGHT', user?.id);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessingVoice(true);
    try {
      const result = await lifeLockVoiceTaskProcessor.processVoiceInput(command, selectedDate);
      setLastThoughtDumpResult(result);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Voice processing failed:', error);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleOrganizeTasks = async () => {
    if (!todayCard || todayCard.tasks.length === 0) return;
    
    setIsAnalyzingTasks(true);
    try {
      const result = await eisenhowerMatrixOrganizer.organizeTasks(todayCard.tasks);
      setEisenhowerResult(result);
      setShowEisenhowerModal(true);
    } catch (error) {
      console.error('Task organization failed:', error);
    } finally {
      setIsAnalyzingTasks(false);
    }
  };

  const handleApplyOrganization = async () => {
    setShowEisenhowerModal(false);
    setEisenhowerResult(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleReanalyze = () => {
    setShowEisenhowerModal(false);
    setEisenhowerResult(null);
    handleOrganizeTasks();
  };

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  return {
    // Data
    todayCard,
    weekCards,
    weekStart: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    
    // State
    isProcessingVoice,
    isAnalyzingTasks,
    lastThoughtDumpResult,
    eisenhowerResult,
    showEisenhowerModal,
    
    // Actions
    handleTaskToggle,
    handleCustomTaskAdd,
    handleVoiceCommand,
    handleOrganizeTasks,
    handleApplyOrganization,
    handleReanalyze,
    refresh,
    
    // State setters for modals
    setLastThoughtDumpResult,
    setShowEisenhowerModal,
    setEisenhowerResult
  };
};
