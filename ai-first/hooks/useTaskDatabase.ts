/**
 * 🗄️ Task Database Hook
 * 
 * React hook for managing tasks with real database persistence
 * Handles CRUD operations, AI analysis, and personal context
 */

import { useState, useEffect, useCallback } from 'react';
import { useClerkUser } from '@/components/ClerkProvider';
// Use real HTTP API client for database operations
import { apiClient, CreateTaskInput, PersonalContextData } from '@/services/api-client';
import { aiXPService, TaskAnalysis } from '../services/ai-xp-service';
import { seedSampleTasks, seedPersonalContext } from '../services/seed-data';
import { timeTrackingService } from '../services/time-tracking-service';

// Define TaskWithSubtasks interface locally since it's not exported from API
export interface TaskWithSubtasks {
  id: string;
  title: string;
  description?: string;
  workType: 'DEEP' | 'LIGHT' | 'MORNING';
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
  currentDate: string;
  originalDate: string;
  estimatedDuration?: number;
  timeEstimate?: string;
  rollovers: number;
  tags: string[];
  category?: string;
  completedAt?: Date | null;
  startedAt?: Date | null;
  actualDurationMin?: number | null;
  aiTimeEstimateMin?: number | null;
  aiTimeEstimateMax?: number | null;
  aiTimeEstimateML?: number | null;
  timeAccuracy?: number | null;
  createdAt: Date;
  updatedAt: Date;
  // AI XP fields
  xpReward?: number;
  difficulty?: 'TRIVIAL' | 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
  aiAnalyzed: boolean;
  aiReasoning?: string;
  priorityRank?: number;
  contextualBonus?: number;
  complexity?: number;
  learningValue?: number;
  strategicImportance?: number;
  confidence?: number;
  analyzedAt?: Date;
  aiTimeEstimate?: {
    min: number;
    max: number;
    most_likely: number;
    confidence: number;
    factors: string[];
  };
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    workType: 'DEEP' | 'LIGHT' | 'MORNING';
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date | null;
    startedAt?: Date | null;
    actualDurationMin?: number | null;
    aiTimeEstimateMin?: number | null;
    aiTimeEstimateMax?: number | null;
    aiTimeEstimateML?: number | null;
    timeAccuracy?: number | null;
    // AI XP fields for subtasks
    xpReward?: number;
    difficulty?: 'TRIVIAL' | 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
    aiAnalyzed: boolean;
    aiReasoning?: string;
    priorityRank?: number;
    contextualBonus?: number;
    complexity?: number;
    learningValue?: number;
    strategicImportance?: number;
    confidence?: number;
    analyzedAt?: Date;
    aiTimeEstimate?: {
      min: number;
      max: number;
      most_likely: number;
      confidence: number;
      factors: string[];
    };
  }>;
}

export interface UseTaskDatabaseProps {
  selectedDate: Date;
}

export function useTaskDatabase({ selectedDate }: UseTaskDatabaseProps) {
  const { user, isSignedIn } = useClerkUser();
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalContext, setPersonalContext] = useState<PersonalContextData | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load tasks and personal context
  const loadTasks = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
      console.log('🔐 User not authenticated:', { isSignedIn, userId: user?.id });
      return;
    }
    
    console.log('📊 Loading tasks for user:', user.id);
    
    try {
      setLoading(true);
      setError(null);
      
      const [tasksData, contextData] = await Promise.all([
        apiClient.getTasksForDate(user.id, dateString),
        apiClient.getPersonalContext(user.id)
      ]);
      
      // If no tasks exist and we're in development, seed some sample data
      if (tasksData.length === 0 && import.meta.env.DEV) {
        console.log('🌱 No tasks found, seeding sample data for development...');
        const seededTasks = await seedSampleTasks(user.id, dateString);
        setTasks(seededTasks);
      } else {
        setTasks(tasksData);
      }
      
      // If no personal context exists, seed default context
      if (!contextData && import.meta.env.DEV) {
        console.log('🌱 No personal context found, seeding default context...');
        const seededContext = await seedPersonalContext(user.id);
        setPersonalContext(seededContext);
      } else {
        setPersonalContext(contextData);
      }
      
      console.log(`📊 Loaded ${tasksData.length} tasks for ${dateString}`);
    } catch (err) {
      console.error('❌ Failed to load tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSignedIn, dateString]);

  // Load tasks when date or user changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Create new task
  const createTask = useCallback(async (input: CreateTaskInput) => {
    if (!user?.id) {
      console.error('❌ Cannot create task: User not authenticated');
      setError('Cannot create task: User not authenticated');
      return;
    }
    
    console.log('➕ Creating task:', { title: input.title, userId: user.id });
    
    try {
      const newTask = await apiClient.createTask(user.id, {
        ...input,
        originalDate: input.originalDate || input.currentDate
      });
      setTasks(prev => [...prev, newTask]);
      console.log(`✅ Created task: ${newTask.title}`);
      return newTask;
    } catch (err) {
      console.error('❌ Failed to create task:', err);
      setError(`Failed to create task: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [user?.id]);

  // Toggle task completion with time tracking
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('❌ Task not found for completion toggle:', taskId);
      return;
    }

    const newCompleted = !task.completed;
    
    console.log('🔄 Toggling task completion:', { taskId, newCompleted, taskTitle: task.title });
    
    try {
      if (newCompleted) {
        // Task is being completed - calculate time accuracy
        const aiTimeEstimate = (task as any).aiTimeEstimate;
        const metrics = await timeTrackingService.completeTask(taskId, aiTimeEstimate);
        
        if (metrics) {
          console.log(`📊 Time accuracy: ${Math.round(metrics.accuracy * 100)}% (${metrics.deviationPercent > 0 ? '+' : ''}${Math.round(metrics.deviationPercent)}%)`);
        }
      } else {
        // Task is being started - record start time
        await timeTrackingService.startTask(taskId);
        console.log(`⏱️ Started timing: ${task.title}`);
      }
      
      await apiClient.updateTaskCompletion(taskId, newCompleted);
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : null }
          : t
      ));
      
      console.log(`✅ Task ${newCompleted ? 'completed' : 'started'}: ${task.title}`);
    } catch (err) {
      console.error('❌ Failed to toggle task completion:', err);
      setError(`Failed to ${newCompleted ? 'complete' : 'start'} task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [tasks]);

  // Toggle subtask completion with time tracking
  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(s => s.id === subtaskId);
    if (!task || !subtask) return;

    const newCompleted = !subtask.completed;
    
    try {
      if (newCompleted) {
        // Subtask is being completed - calculate time accuracy
        const aiTimeEstimate = (subtask as any).aiTimeEstimate;
        const metrics = await timeTrackingService.completeSubtask(subtaskId, aiTimeEstimate);
        
        if (metrics) {
          console.log(`📊 Subtask accuracy: ${Math.round(metrics.accuracy * 100)}% (${metrics.deviationPercent > 0 ? '+' : ''}${Math.round(metrics.deviationPercent)}%)`);
        }
      } else {
        // Subtask is being started - record start time
        await timeTrackingService.startSubtask(subtaskId);
        console.log(`⏱️ Started timing subtask: ${subtask.title}`);
      }
      
      await apiClient.updateSubtaskCompletion(subtaskId, newCompleted);
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? {
              ...t,
              subtasks: t.subtasks.map(s => 
                s.id === subtaskId 
                  ? { ...s, completed: newCompleted, completedAt: newCompleted ? new Date() : null }
                  : s
              )
            }
          : t
      ));
      
      console.log(`✅ Subtask ${newCompleted ? 'completed' : 'started'}: ${subtask.title}`);
    } catch (err) {
      console.error('❌ Failed to toggle subtask completion:', err);
    }
  }, [tasks]);

  // Analyze task with AI
  const analyzeTaskWithAI = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user?.id) return;

    try {
      console.log(`🤖 Analyzing task: ${task.title}`);
      
      const analysis = await aiXPService.analyzeTaskForXP(
        task.title,
        task.description || undefined,
        task.timeEstimate || undefined,
        {
          subtasks: task.subtasks.map(s => ({
            title: s.title,
            completed: s.completed,
            workType: s.workType
          })),
          allTasks: tasks.map(t => ({
            title: t.title,
            completed: t.completed,
            timeEstimate: t.timeEstimate || 'Unknown'
          })),
          completedTasksToday: tasks.filter(t => t.completed).length,
          sessionType: 'light-work',
          personalContext: personalContext,
          userId: user.id // Add user ID for historical data
        }
      );

      // Update database with analysis - using direct service call for AI data
      const { taskDatabaseService } = await import('../services/task-database-service-fixed');
      await taskDatabaseService.updateTaskAIAnalysis(taskId, analysis);
      
      // If task has subtasks, also analyze each subtask individually
      if (task.subtasks.length > 0) {
        console.log(`🔍 Analyzing ${task.subtasks.length} subtasks individually...`);
        for (const subtask of task.subtasks) {
          if (!subtask.aiAnalyzed) {
            const subtaskAnalysis = await aiXPService.analyzeTaskForXP(
              subtask.title,
              undefined,
              '15 min', // Default subtask time
              {
                parentTask: task.title,
                allTasks: tasks.map(t => ({
                  title: t.title,
                  completed: t.completed,
                  timeEstimate: t.timeEstimate || 'Unknown'
                })),
                completedTasksToday: tasks.filter(t => t.completed).length,
                sessionType: 'light-work',
                personalContext: personalContext,
                userId: user.id // Add user ID for historical data
              }
            );

            // Update subtask analysis in database
            await taskDatabaseService.updateSubtaskAIAnalysis(subtask.id, subtaskAnalysis);
          }
        }
        
        // Reload tasks to get updated subtasks
        await loadTasks();
      }

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? {
              ...t,
              xpReward: analysis.xpReward,
              difficulty: analysis.difficulty as any,
              aiAnalyzed: true,
              aiReasoning: analysis.reasoning,
              priorityRank: analysis.priorityRank,
              contextualBonus: analysis.contextualBonus,
              complexity: analysis.complexity,
              learningValue: analysis.learningValue,
              strategicImportance: analysis.strategicImportance,
              confidence: analysis.confidence,
              analyzedAt: new Date(),
              aiTimeEstimate: analysis.timeEstimate
            }
          : t
      ));

      console.log(`✅ Task analyzed: ${analysis.xpReward} XP (${analysis.difficulty})`);
      console.log(`🧠 AI Reasoning: ${analysis.reasoning}`);
      if (analysis.timeEstimate) {
        console.log(`⏰ AI Time Estimate: ${analysis.timeEstimate.min}-${analysis.timeEstimate.max} min (most likely: ${analysis.timeEstimate.most_likely}, confidence: ${Math.round(analysis.timeEstimate.confidence * 100)}%)`);
      }
      
      return analysis;
    } catch (err) {
      console.error('❌ Failed to analyze task:', err);
    }
  }, [tasks, personalContext, user?.id]);

  // Analyze subtask with AI
  const analyzeSubtaskWithAI = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(s => s.id === subtaskId);
    if (!task || !subtask || !user?.id) return;

    try {
      console.log(`🤖 Analyzing subtask: ${subtask.title}`);
      
      const analysis = await aiXPService.analyzeTaskForXP(
        subtask.title,
        undefined,
        '15 min', // Default subtask time
        {
          parentTask: task.title,
          allTasks: tasks.map(t => ({
            title: t.title,
            completed: t.completed,
            timeEstimate: t.timeEstimate || 'Unknown'
          })),
          completedTasksToday: tasks.filter(t => t.completed).length,
          sessionType: 'light-work',
          personalContext: personalContext,
          userId: user?.id // Add user ID for historical data
        }
      );

      // Update database with analysis - using direct service call for AI data  
      const { taskDatabaseService } = await import('../services/task-database-service-fixed');
      await taskDatabaseService.updateSubtaskAIAnalysis(subtaskId, analysis);
      
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? {
              ...t,
              subtasks: t.subtasks.map(s => 
                s.id === subtaskId 
                  ? {
                      ...s,
                      xpReward: analysis.xpReward,
                      difficulty: analysis.difficulty as any,
                      aiAnalyzed: true,
                      aiReasoning: analysis.reasoning,
                      priorityRank: analysis.priorityRank,
                      contextualBonus: analysis.contextualBonus,
                      complexity: analysis.complexity,
                      learningValue: analysis.learningValue,
                      strategicImportance: analysis.strategicImportance,
                      confidence: analysis.confidence,
                      analyzedAt: new Date()
                    }
                  : s
              )
            }
          : t
      ));

      console.log(`✅ Subtask analyzed: ${analysis.xpReward} XP (${analysis.difficulty})`);
      console.log(`🧠 AI Reasoning: ${analysis.reasoning}`);
      
      return analysis;
    } catch (err) {
      console.error('❌ Failed to analyze subtask:', err);
    }
  }, [tasks, personalContext, user?.id]);

  // Update personal context
  const updatePersonalContext = useCallback(async (context: PersonalContextData) => {
    if (!user?.id) return;
    
    try {
      await apiClient.updatePersonalContext(user.id, context);
      setPersonalContext(context);
      console.log('✅ Personal context updated');
    } catch (err) {
      console.error('❌ Failed to update personal context:', err);
    }
  }, [user?.id]);

  // Add subtask to existing task
  const addSubtask = useCallback(async (taskId: string, title: string) => {
    if (!user?.id) return;
    
    try {
      const newSubtask = await apiClient.addSubtask(taskId, {
        title,
        workType: 'LIGHT'
      });
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, subtasks: [...t.subtasks, newSubtask] }
          : t
      ));
      
      console.log(`✅ Added subtask: ${title}`);
      return newSubtask;
    } catch (err) {
      console.error('❌ Failed to add subtask:', err);
    }
  }, [user?.id]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      console.log('✅ Task deleted');
    } catch (err) {
      console.error('❌ Failed to delete task:', err);
    }
  }, []);

  const updateTaskTitle = useCallback(async (taskId: string, title: string) => {
    if (!user?.id) return;
    
    try {
      await apiClient.updateTaskTitle(taskId, title);
      // Reload tasks to get updated data
      await loadTasks();
    } catch (err) {
      console.error('❌ Failed to update task title:', err);
    }
  }, [loadTasks, user?.id]);

  const pushTaskToAnotherDay = useCallback(async (taskId: string, pushedToDate?: string) => {
    if (!user?.id) return;
    
    try {
      await apiClient.pushTaskToAnotherDay(taskId, pushedToDate);
      // Reload tasks to get updated data
      await loadTasks();
    } catch (err) {
      console.error('❌ Failed to push task to another day:', err);
    }
  }, [loadTasks, user?.id]);

  const deleteSubtask = useCallback(async (subtaskId: string) => {
    if (!user?.id) return;
    
    try {
      // Delete from database using database service directly
      const { taskDatabaseService } = await import('@/ai-first/services/task-database-service-fixed');
      await taskDatabaseService.deleteSubtask(subtaskId);
      // Reload tasks to get updated data
      await loadTasks();
    } catch (err) {
      console.error('❌ Failed to delete subtask:', err);
    }
  }, [loadTasks, user?.id]);

  return {
    tasks,
    loading,
    error,
    personalContext,
    
    // Actions
    createTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    analyzeTaskWithAI,
    analyzeSubtaskWithAI,
    updatePersonalContext,
    addSubtask,
    deleteTask,
    deleteSubtask,
    updateTaskTitle,
    pushTaskToAnotherDay,
    
    // Utils
    reload: loadTasks
  };
}