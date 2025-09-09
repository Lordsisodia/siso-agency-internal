/**
 * 📊 Task Database Service
 * 
 * Handles all database operations for PersonalTasks and PersonalSubtasks
 * with AI XP analysis integration.
 */

import { TaskAnalysis } from './ai-xp-service';

// Import real Prisma client for server-side operations
async function getPrismaClient() {
  if (typeof window === 'undefined') {
    // Server-side: use real Prisma client
    const { PrismaClient } = await import('../../generated/prisma/index.js');
    return new PrismaClient();
  } else {
    // Browser: this shouldn't be called directly, but fallback gracefully
    console.warn('[PRISMA] Task database service called from browser - operations may not persist');
    const { prismaClient } = await import('@/integrations/prisma/client');
    return prismaClient;
  }
}

// Define types inline for browser compatibility
type WorkType = 'DEEP' | 'LIGHT' | 'MORNING';
type Priority = 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
type TaskDifficulty = 'TRIVIAL' | 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';

export interface TaskWithSubtasks {
  id: string;
  title: string;
  description?: string | null;
  workType: WorkType;
  priority: Priority;
  completed: boolean;
  currentDate: string;
  timeEstimate?: string | null;
  estimatedDuration?: number | null;
  
  // AI XP Analysis
  xpReward?: number | null;
  difficulty?: TaskDifficulty | null;
  aiAnalyzed: boolean;
  aiReasoning?: string | null;
  priorityRank?: number | null;
  contextualBonus?: number | null;
  complexity?: number | null;
  learningValue?: number | null;
  strategicImportance?: number | null;
  confidence?: number | null;
  analyzedAt?: Date | null;
  
  subtasks: SubtaskData[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface SubtaskData {
  id: string;
  title: string;
  completed: boolean;
  workType: WorkType;
  
  // AI XP Analysis
  xpReward?: number | null;
  difficulty?: TaskDifficulty | null;
  aiAnalyzed: boolean;
  aiReasoning?: string | null;
  priorityRank?: number | null;
  contextualBonus?: number | null;
  complexity?: number | null;
  learningValue?: number | null;
  strategicImportance?: number | null;
  confidence?: number | null;
  analyzedAt?: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  workType: WorkType;
  priority: Priority;
  currentDate: string;
  timeEstimate?: string;
  estimatedDuration?: number;
  subtasks?: CreateSubtaskInput[];
}

export interface CreateSubtaskInput {
  title: string;
  workType: WorkType;
}

export interface PersonalContextData {
  currentGoals?: string;
  skillPriorities?: string;
  revenueTargets?: string;
  timeConstraints?: string;
  currentProjects?: string;
  hatedTasks?: string;
  valuedTasks?: string;
  learningObjectives?: string;
}

class TaskDatabaseService {
  
  /**
   * Get all tasks for a user on a specific date with subtasks
   */
  async getTasksForDate(userId: string, date: string): Promise<TaskWithSubtasks[]> {
    const prisma = await getPrismaClient();
    
    try {
      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          currentDate: date
        },
        include: {
          subtasks: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return tasks as TaskWithSubtasks[];
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      throw new Error('Failed to fetch tasks');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Create a new task with optional subtasks
   */
  async createTask(userId: string, input: CreateTaskInput): Promise<TaskWithSubtasks> {
    const prisma = await getPrismaClient();
    
    try {
      const task = await prisma.personalTask.create({
        data: {
          userId,
          title: input.title,
          description: input.description,
          workType: input.workType,
          priority: input.priority,
          currentDate: input.currentDate,
          originalDate: input.currentDate,
          timeEstimate: input.timeEstimate,
          estimatedDuration: input.estimatedDuration,
          subtasks: input.subtasks ? {
            create: input.subtasks.map(subtask => ({
              title: subtask.title,
              workType: subtask.workType
            }))
          } : undefined
        },
        include: {
          subtasks: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      return task as TaskWithSubtasks;
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      throw new Error('Failed to create task');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Update task completion status
   */
  async updateTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    try {
      await prisma.personalTask.update({
        where: { id: taskId },
        data: { 
          completed,
          completedAt: completed ? new Date() : null
        }
      });
    } catch (error) {
      console.error('❌ Failed to update task completion:', error);
      throw new Error('Failed to update task completion');
    }
  }

  /**
   * Update subtask completion status
   */
  async updateSubtaskCompletion(subtaskId: string, completed: boolean): Promise<void> {
    try {
      await prisma.personalSubtask.update({
        where: { id: subtaskId },
        data: { 
          completed,
          completedAt: completed ? new Date() : null
        }
      });
    } catch (error) {
      console.error('❌ Failed to update subtask completion:', error);
      throw new Error('Failed to update subtask completion');
    }
  }

  /**
   * Update task with AI analysis results
   */
  async updateTaskAIAnalysis(taskId: string, analysis: TaskAnalysis): Promise<void> {
    try {
      await prisma.personalTask.update({
        where: { id: taskId },
        data: {
          xpReward: analysis.xpReward,
          difficulty: this.mapDifficultyToEnum(analysis.difficulty),
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
      });
    } catch (error) {
      console.error('❌ Failed to update task AI analysis:', error);
      throw new Error('Failed to update task AI analysis');
    }
  }

  /**
   * Update subtask with AI analysis results
   */
  async updateSubtaskAIAnalysis(subtaskId: string, analysis: TaskAnalysis): Promise<void> {
    try {
      await prisma.personalSubtask.update({
        where: { id: subtaskId },
        data: {
          xpReward: analysis.xpReward,
          difficulty: this.mapDifficultyToEnum(analysis.difficulty),
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
      });
    } catch (error) {
      console.error('❌ Failed to update subtask AI analysis:', error);
      throw new Error('Failed to update subtask AI analysis');
    }
  }

  /**
   * Add subtask to existing task
   */
  async addSubtask(taskId: string, input: CreateSubtaskInput): Promise<SubtaskData> {
    try {
      const subtask = await prisma.personalSubtask.create({
        data: {
          taskId,
          title: input.title,
          workType: input.workType
        }
      });

      return subtask as SubtaskData;
    } catch (error) {
      console.error('❌ Failed to add subtask:', error);
      throw new Error('Failed to add subtask');
    }
  }

  /**
   * Delete task and all subtasks
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await prisma.personalTask.delete({
        where: { id: taskId }
      });
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Delete subtask
   */
  async deleteSubtask(subtaskId: string): Promise<void> {
    try {
      await prisma.personalSubtask.delete({
        where: { id: subtaskId }
      });
    } catch (error) {
      console.error('❌ Failed to delete subtask:', error);
      throw new Error('Failed to delete subtask');
    }
  }

  /**
   * Get or create personal context for user
   */
  async getPersonalContext(userId: string): Promise<PersonalContextData | null> {
    try {
      const context = await prisma.personalContext.findUnique({
        where: { userId }
      });

      return context ? {
        currentGoals: context.currentGoals,
        skillPriorities: context.skillPriorities,
        revenueTargets: context.revenueTargets,
        timeConstraints: context.timeConstraints,
        currentProjects: context.currentProjects,
        hatedTasks: context.hatedTasks,
        valuedTasks: context.valuedTasks,
        learningObjectives: context.learningObjectives
      } : null;
    } catch (error) {
      console.error('❌ Failed to get personal context:', error);
      return null;
    }
  }

  /**
   * Update personal context for user
   */
  async updatePersonalContext(userId: string, context: PersonalContextData): Promise<void> {
    try {
      await prisma.personalContext.upsert({
        where: { userId },
        create: {
          userId,
          ...context
        },
        update: context
      });
    } catch (error) {
      console.error('❌ Failed to update personal context:', error);
      throw new Error('Failed to update personal context');
    }
  }

  /**
   * Get tasks that need AI analysis (not analyzed yet)
   */
  async getTasksNeedingAnalysis(userId: string, limit = 10): Promise<TaskWithSubtasks[]> {
    try {
      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          aiAnalyzed: false,
          completed: false
        },
        include: {
          subtasks: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return tasks as TaskWithSubtasks[];
    } catch (error) {
      console.error('❌ Failed to get tasks needing analysis:', error);
      return [];
    }
  }

  /**
   * Get XP statistics for user
   */
  async getUserXPStats(userId: string, dateRange?: { start: string; end: string }) {
    try {
      const whereClause: any = { userId, completed: true };
      
      if (dateRange) {
        whereClause.currentDate = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      const [tasks, subtasks] = await Promise.all([
        prisma.personalTask.findMany({
          where: whereClause,
          select: { 
            xpReward: true, 
            difficulty: true, 
            currentDate: true,
            aiAnalyzed: true 
          }
        }),
        prisma.personalSubtask.findMany({
          where: {
            task: { ...whereClause },
            completed: true
          },
          select: { 
            xpReward: true, 
            difficulty: true,
            aiAnalyzed: true 
          }
        })
      ]);

      const totalTaskXP = tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
      const totalSubtaskXP = subtasks.reduce((sum, subtask) => sum + (subtask.xpReward || 0), 0);
      const totalXP = totalTaskXP + totalSubtaskXP;

      return {
        totalXP,
        taskXP: totalTaskXP,
        subtaskXP: totalSubtaskXP,
        completedTasks: tasks.length,
        completedSubtasks: subtasks.length,
        analyzedTasks: tasks.filter(t => t.aiAnalyzed).length,
        analyzedSubtasks: subtasks.filter(s => s.aiAnalyzed).length
      };
    } catch (error) {
      console.error('❌ Failed to get user XP stats:', error);
      return {
        totalXP: 0,
        taskXP: 0,
        subtaskXP: 0,
        completedTasks: 0,
        completedSubtasks: 0,
        analyzedTasks: 0,
        analyzedSubtasks: 0
      };
    }
  }

  /**
   * Map AI difficulty string to Prisma enum
   */
  private mapDifficultyToEnum(difficulty: string): TaskDifficulty {
    switch (difficulty.toLowerCase()) {
      case 'trivial': return 'TRIVIAL';
      case 'easy': return 'EASY';
      case 'moderate': return 'MODERATE';
      case 'hard': return 'HARD';
      case 'expert': return 'EXPERT';
      default: return 'MODERATE';
    }
  }
}

export const taskDatabaseService = new TaskDatabaseService();
export default taskDatabaseService;