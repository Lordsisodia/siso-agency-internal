/**
 * 📊 Fixed Task Database Service
 * 
 * Handles all database operations with proper Prisma client initialization
 */

import { TaskAnalysis } from './ai-xp-service';

// Universal Prisma client - works locally and on Vercel
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Import real Prisma client
async function getPrismaClient() {
  try {
    if (typeof window === 'undefined') {
      // Server-side: use universal Prisma client
      return prisma;
    } else {
      // Browser: use the updated browser client that calls real APIs
      const { prismaClient } = await import('@/integrations/prisma/client');
      return prismaClient;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Prisma client:', error);
    throw new Error('Database initialization failed');
  }
}

// Define types
type WorkType = 'DEEP' | 'LIGHT' | 'MORNING';
type Priority = 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
type TaskDifficulty = 'TRIVIAL' | 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';

export interface TaskWithSubtasks {
  id: string;
  title: string;
  description?: string;
  workType: WorkType;
  priority: Priority;
  completed: boolean;
  currentDate: string;
  originalDate: string;
  estimatedDuration?: number;
  timeEstimate?: string;
  rollovers: number;
  tags: string[];
  category?: string;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // AI XP fields
  xpReward?: number;
  difficulty?: TaskDifficulty;
  aiAnalyzed: boolean;
  aiReasoning?: string;
  priorityRank?: number;
  contextualBonus?: number;
  complexity?: number;
  learningValue?: number;
  strategicImportance?: number;
  confidence?: number;
  analyzedAt?: Date;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    workType: WorkType;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date | null;
    // AI XP fields for subtasks
    xpReward?: number;
    difficulty?: TaskDifficulty;
    aiAnalyzed: boolean;
    aiReasoning?: string;
    priorityRank?: number;
    contextualBonus?: number;
    complexity?: number;
    learningValue?: number;
    strategicImportance?: number;
    confidence?: number;
    analyzedAt?: Date;
  }>;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  workType: WorkType;
  priority: Priority;
  currentDate: string;
  originalDate?: string;
  timeEstimate?: string;
  estimatedDuration?: number;
  subtasks?: Array<{
    title: string;
    workType: WorkType;
  }>;
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

class FixedTaskDatabaseService {
  
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
   * Get Deep Work tasks for a user on a specific date with subtasks
   */
  async getDeepWorkTasksForDate(userId: string, date: string): Promise<TaskWithSubtasks[]> {
    const prisma = await getPrismaClient();
    
    try {
      console.log(`🔍 getDeepWorkTasksForDate called with userId: ${userId}, date: ${date}`);
      
      const tasks = await prisma.personalTask.findMany({
        where: {
          userId,
          currentDate: date,
          workType: 'DEEP'
        },
        include: {
          subtasks: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`🧠 Found ${tasks.length} Deep Work tasks for date ${date}:`);
      tasks.forEach((task, index) => {
        console.log(`  📋 Task ${index + 1}: "${task.title}" - ${task.subtasks?.length || 0} subtasks`);
      });
      
      return tasks as TaskWithSubtasks[];
    } catch (error) {
      console.error('❌ Failed to fetch Deep Work tasks:', error);
      throw new Error('Failed to fetch Deep Work tasks');
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
          originalDate: input.originalDate || input.currentDate,
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
    const prisma = await getPrismaClient();
    
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
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Update task title
   */
  async updateTaskTitle(taskId: string, title: string): Promise<void> {
    const prisma = await getPrismaClient();
    
    try {
      await prisma.personalTask.update({
        where: { id: taskId },
        data: { title: title.trim() }
      });
    } catch (error) {
      console.error('❌ Failed to update task title:', error);
      throw new Error('Failed to update task title');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Update subtask completion status
   */
  async updateSubtaskCompletion(subtaskId: string, completed: boolean): Promise<void> {
    const prisma = await getPrismaClient();
    
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
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Update subtask due date
   */
  async updateSubtaskDueDate(subtaskId: string, dueDate: string | null): Promise<void> {
    const prisma = await getPrismaClient();
    
    try {
      await prisma.personalSubtask.update({
        where: { id: subtaskId },
        data: { 
          dueDate: dueDate
        }
      });
      console.log(`📅 Updated subtask due date: ${subtaskId} -> ${dueDate}`);
    } catch (error) {
      console.error('❌ Failed to update subtask due date:', error);
      throw new Error('Failed to update subtask due date');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Get personal context for user
   */
  async getPersonalContext(userId: string): Promise<PersonalContextData | null> {
    const prisma = await getPrismaClient();
    
    try {
      const context = await prisma.personalContext.findUnique({
        where: { userId }
      });
      return context;
    } catch (error) {
      console.error('❌ Failed to get personal context:', error);
      return null;
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  /**
   * Update personal context for user
   */
  async updatePersonalContext(userId: string, contextData: PersonalContextData): Promise<void> {
    const prisma = await getPrismaClient();
    
    try {
      await prisma.personalContext.upsert({
        where: { userId },
        create: {
          userId,
          ...contextData
        },
        update: contextData
      });
    } catch (error) {
      console.error('❌ Failed to update personal context:', error);
      throw new Error('Failed to update personal context');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  // Add other methods as needed...
  async addSubtask(taskId: string, subtaskData: { title: string; workType: WorkType }) {
    const prisma = await getPrismaClient();
    
    try {
      return await prisma.personalSubtask.create({
        data: {
          taskId,
          title: subtaskData.title,
          workType: subtaskData.workType
        }
      });
    } catch (error) {
      console.error('❌ Failed to add subtask:', error);
      throw new Error('Failed to add subtask');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const prisma = await getPrismaClient();
    
    try {
      await prisma.personalTask.delete({
        where: { id: taskId }
      });
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw new Error('Failed to delete task');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  async updateTaskAIAnalysis(taskId: string, analysis: any): Promise<void> {
    const prisma = await getPrismaClient();
    
    try {
      await prisma.personalTask.update({
        where: { id: taskId },
        data: {
          xpReward: analysis.xpReward,
          difficulty: analysis.difficulty?.toUpperCase(),
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
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  async updateSubtaskAIAnalysis(subtaskId: string, analysis: any): Promise<void> {
    const prisma = await getPrismaClient();
    
    try {
      await prisma.personalSubtask.update({
        where: { id: subtaskId },
        data: {
          xpReward: analysis.xpReward,
          difficulty: analysis.difficulty?.toUpperCase(),
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
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  async getMorningRoutineForDate(userId: string, date: string): Promise<any> {
    const prisma = await getPrismaClient();
    
    try {
      // Try to find existing morning routine tracking for this date
      let routine = await prisma.morningRoutineTracking.findUnique({
        where: { 
          userId_date: {
            userId: userId,
            date: date
          }
        }
      });

      // If no routine exists, create default one
      if (!routine) {
        routine = await prisma.morningRoutineTracking.create({
          data: {
            userId: userId,
            date: date,
            // Default habits - all false initially
            wakeUpEarly: false,
            hydration: false,
            meditation: false,
            exercise: false,
            journaling: false,
            planning: false,
            reading: false,
            gratitude: false
          }
        });
      }

      return routine;
    } catch (error) {
      console.error('❌ Failed to get morning routine:', error);
      throw new Error('Failed to get morning routine');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  async updateMorningRoutineHabit(userId: string, date: string, habitName: string, completed: boolean): Promise<any> {
    const prisma = await getPrismaClient();
    
    try {
      // Ensure user exists first
      await this.ensureUserExists(userId);

      // Update the specific habit
      const updateData = { [habitName]: completed };
      
      const routine = await prisma.morningRoutineTracking.upsert({
        where: {
          userId_date: {
            userId: userId,
            date: date
          }
        },
        update: updateData,
        create: {
          userId: userId,
          date: date,
          wakeUpEarly: habitName === 'wakeUpEarly' ? completed : false,
          hydration: habitName === 'hydration' ? completed : false,
          meditation: habitName === 'meditation' ? completed : false,
          exercise: habitName === 'exercise' ? completed : false,
          journaling: habitName === 'journaling' ? completed : false,
          planning: habitName === 'planning' ? completed : false,
          reading: habitName === 'reading' ? completed : false,
          gratitude: habitName === 'gratitude' ? completed : false,
          ...updateData
        }
      });

      return routine;
    } catch (error) {
      console.error('❌ Failed to update morning routine habit:', error);
      throw new Error('Failed to update morning routine habit');
    } finally {
      if (typeof window === 'undefined' && prisma.$disconnect) {
        await prisma.$disconnect();
      }
    }
  }

  private async ensureUserExists(userId: string): Promise<any> {
    const prisma = await getPrismaClient();
    
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (existingUser) {
        return existingUser;
      }
      
      // Create user with default email if not exists
      console.log(`🔧 Auto-creating user: ${userId}`);
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@clerk.generated`,
          supabaseId: userId
        }
      });
      
      console.log(`✅ Auto-created user: ${userId}`);
      return newUser;
    } catch (error) {
      console.error('Failed to ensure user exists:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskDatabaseService = new FixedTaskDatabaseService();
export default taskDatabaseService;