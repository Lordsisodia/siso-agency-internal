/**
 * 🗄️ Task Database Hook
 * 
 * React hook for managing tasks with real database persistence
 * Handles CRUD operations, AI analysis, and personal context
 */

import { useState, useEffect, useCallback } from 'react';
import { useClerkUser } from '@/components/ClerkProvider';
import { taskDatabaseService, TaskWithSubtasks, CreateTaskInput, PersonalContextData } from '../services/task-database-service';
import { aiXPService, TaskAnalysis } from '../services/ai-xp-service';
import { seedSampleTasks, seedPersonalContext } from '../services/seed-data';

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
    if (!isSignedIn || !user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [tasksData, contextData] = await Promise.all([
        taskDatabaseService.getTasksForDate(user.id, dateString),
        taskDatabaseService.getPersonalContext(user.id)
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
    if (!user?.id) return;
    
    try {
      const newTask = await taskDatabaseService.createTask(user.id, input);
      setTasks(prev => [...prev, newTask]);
      console.log(`✅ Created task: ${newTask.title}`);
      return newTask;
    } catch (err) {
      console.error('❌ Failed to create task:', err);
      throw err;
    }
  }, [user?.id]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    
    try {
      await taskDatabaseService.updateTaskCompletion(taskId, newCompleted);
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : null }
          : t
      ));
      
      console.log(`✅ Task ${newCompleted ? 'completed' : 'uncompleted'}: ${task.title}`);
    } catch (err) {
      console.error('❌ Failed to toggle task completion:', err);
    }
  }, [tasks]);

  // Toggle subtask completion
  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(s => s.id === subtaskId);
    if (!task || !subtask) return;

    const newCompleted = !subtask.completed;
    
    try {
      await taskDatabaseService.updateSubtaskCompletion(subtaskId, newCompleted);
      
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
      
      console.log(`✅ Subtask ${newCompleted ? 'completed' : 'uncompleted'}: ${subtask.title}`);
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
          allTasks: tasks.map(t => ({
            title: t.title,
            completed: t.completed,
            timeEstimate: t.timeEstimate || 'Unknown'
          })),
          completedTasksToday: tasks.filter(t => t.completed).length,
          sessionType: 'light-work',
          personalContext: personalContext
        }
      );

      // Update database with analysis
      await taskDatabaseService.updateTaskAIAnalysis(taskId, analysis);
      
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
              analyzedAt: new Date()
            }
          : t
      ));

      console.log(`✅ Task analyzed: ${analysis.xpReward} XP (${analysis.difficulty})`);
      console.log(`🧠 AI Reasoning: ${analysis.reasoning}`);
      
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
          personalContext: personalContext
        }
      );

      // Update database with analysis
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
      await taskDatabaseService.updatePersonalContext(user.id, context);
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
      const newSubtask = await taskDatabaseService.addSubtask(taskId, {
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
      await taskDatabaseService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      console.log('✅ Task deleted');
    } catch (err) {
      console.error('❌ Failed to delete task:', err);
    }
  }, []);

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
    
    // Utils
    reload: loadTasks
  };
}