/**
 * 🗄️ Personal Tasks API
 * 
 * Real Prisma-based API for personal task management
 * Handles CRUD operations with real database persistence
 */

// Import real Prisma client for server-side operations ONLY
// Browser should never reach this code - this is server-only
let prisma: any = null;

async function getPrismaClient() {
  if (typeof window !== 'undefined') {
    throw new Error('PersonalTasksAPI should not be called from browser! Use HTTP endpoints instead.');
  }
  
  if (!prisma) {
    const { PrismaClient } = await import('../../generated/prisma/index.js');
    prisma = new PrismaClient();
  }
  return prisma;
}

// Types
export interface CreateTaskInput {
  title: string;
  description?: string;
  workType: 'DEEP' | 'LIGHT' | 'MORNING';
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  currentDate: string;
  originalDate?: string;
  timeEstimate?: string;
  estimatedDuration?: number;
  subtasks?: Array<{
    title: string;
    workType: 'DEEP' | 'LIGHT' | 'MORNING';
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

/**
 * Personal Tasks API Service
 */
export class PersonalTasksAPI {
  
  /**
   * Get all tasks for a user on a specific date
   */
  static async getTasksForDate(userId: string, date: string) {
    try {
      console.log(`📊 [API] Fetching tasks for user ${userId} on ${date}`);
      const prisma = await getPrismaClient();
      
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

      console.log(`✅ [API] Found ${tasks.length} tasks`);
      return { success: true, data: tasks };
      
    } catch (error) {
      console.error('❌ [API] Failed to fetch tasks:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Create a new task with optional subtasks
   */
  static async createTask(userId: string, taskData: CreateTaskInput) {
    try {
      console.log(`➕ [API] Creating task for user ${userId}:`, taskData.title);
      const prisma = await getPrismaClient();
      
      const task = await prisma.personalTask.create({
        data: {
          userId,
          title: taskData.title,
          description: taskData.description,
          workType: taskData.workType,
          priority: taskData.priority,
          currentDate: taskData.currentDate,
          originalDate: taskData.originalDate || taskData.currentDate,
          timeEstimate: taskData.timeEstimate,
          estimatedDuration: taskData.estimatedDuration,
          subtasks: taskData.subtasks ? {
            create: taskData.subtasks.map(subtask => ({
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

      console.log(`✅ [API] Created task with ID: ${task.id}`);
      return { success: true, data: task };
      
    } catch (error) {
      console.error('❌ [API] Failed to create task:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Update task completion status
   */
  static async updateTaskCompletion(taskId: string, completed: boolean) {
    try {
      console.log(`🔄 [API] Updating task ${taskId} completion to ${completed}`);
      const prisma = await getPrismaClient();
      
      await prisma.personalTask.update({
        where: { id: taskId },
        data: { 
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      console.log(`✅ [API] Task completion updated`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [API] Failed to update task completion:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Update subtask completion status
   */
  static async updateSubtaskCompletion(subtaskId: string, completed: boolean) {
    try {
      console.log(`🔄 [API] Updating subtask ${subtaskId} completion to ${completed}`);
      const prisma = await getPrismaClient();
      
      await prisma.personalSubtask.update({
        where: { id: subtaskId },
        data: { 
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      console.log(`✅ [API] Subtask completion updated`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [API] Failed to update subtask completion:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Add subtask to existing task
   */
  static async addSubtask(taskId: string, subtaskData: { title: string; workType: 'DEEP' | 'LIGHT' | 'MORNING' }) {
    try {
      console.log(`➕ [API] Adding subtask to task ${taskId}:`, subtaskData.title);
      const prisma = await getPrismaClient();
      
      const subtask = await prisma.personalSubtask.create({
        data: {
          taskId,
          title: subtaskData.title,
          workType: subtaskData.workType
        }
      });

      console.log(`✅ [API] Created subtask with ID: ${subtask.id}`);
      return { success: true, data: subtask };
      
    } catch (error) {
      console.error('❌ [API] Failed to add subtask:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Delete task and all subtasks
   */
  static async deleteTask(taskId: string) {
    try {
      console.log(`🗑️ [API] Deleting task ${taskId}`);
      const prisma = await getPrismaClient();
      
      await prisma.personalTask.delete({
        where: { id: taskId }
      });

      console.log(`✅ [API] Task deleted`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [API] Failed to delete task:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Update task with AI analysis results
   */
  static async updateTaskAIAnalysis(taskId: string, analysis: any) {
    try {
      console.log(`🤖 [API] Updating task ${taskId} with AI analysis`);
      const prisma = await getPrismaClient();
      
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

      console.log(`✅ [API] Task AI analysis updated`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [API] Failed to update task AI analysis:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Update subtask with AI analysis results
   */
  static async updateSubtaskAIAnalysis(subtaskId: string, analysis: any) {
    try {
      console.log(`🤖 [API] Updating subtask ${subtaskId} with AI analysis`);
      const prisma = await getPrismaClient();
      
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

      console.log(`✅ [API] Subtask AI analysis updated`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [API] Failed to update subtask AI analysis:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Get personal context for user
   */
  static async getPersonalContext(userId: string) {
    try {
      console.log(`👤 [API] Fetching personal context for user ${userId}`);
      const prisma = await getPrismaClient();
      
      const context = await prisma.personalContext.findUnique({
        where: { userId }
      });

      console.log(`✅ [API] Personal context retrieved`);
      return { success: true, data: context };
      
    } catch (error) {
      console.error('❌ [API] Failed to get personal context:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Update personal context for user
   */
  static async updatePersonalContext(userId: string, contextData: PersonalContextData) {
    try {
      console.log(`👤 [API] Updating personal context for user ${userId}`);
      const prisma = await getPrismaClient();
      
      await prisma.personalContext.upsert({
        where: { userId },
        create: {
          userId,
          ...contextData
        },
        update: contextData
      });

      console.log(`✅ [API] Personal context updated`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ [API] Failed to update personal context:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }

  /**
   * Get user XP statistics
   */
  static async getUserXPStats(userId: string, dateFilter?: { start: string; end: string }) {
    try {
      console.log(`📊 [API] Fetching XP stats for user ${userId}`);
      const prisma = await getPrismaClient();
      
      const whereClause = {
        userId,
        ...(dateFilter && {
          currentDate: {
            gte: dateFilter.start,
            lte: dateFilter.end
          }
        })
      };

      const [tasks, subtasks] = await Promise.all([
        prisma.personalTask.findMany({
          where: whereClause,
          select: {
            id: true,
            completed: true,
            aiAnalyzed: true,
            xpReward: true
          }
        }),
        prisma.personalSubtask.findMany({
          where: {
            task: { userId },
            ...(dateFilter && {
              task: {
                userId,
                currentDate: {
                  gte: dateFilter.start,
                  lte: dateFilter.end
                }
              }
            })
          },
          select: {
            id: true,
            completed: true,
            aiAnalyzed: true,
            xpReward: true
          }
        })
      ]);

      const stats = {
        totalXP: 0,
        taskXP: 0,
        subtaskXP: 0,
        completedTasks: 0,
        completedSubtasks: 0,
        analyzedTasks: 0,
        analyzedSubtasks: 0,
        totalTasks: tasks.length,
        totalSubtasks: subtasks.length
      };

      tasks.forEach(task => {
        if (task.completed && task.xpReward) {
          stats.taskXP += task.xpReward;
          stats.totalXP += task.xpReward;
        }
        if (task.completed) stats.completedTasks++;
        if (task.aiAnalyzed) stats.analyzedTasks++;
      });

      subtasks.forEach(subtask => {
        if (subtask.completed && subtask.xpReward) {
          stats.subtaskXP += subtask.xpReward;
          stats.totalXP += subtask.xpReward;
        }
        if (subtask.completed) stats.completedSubtasks++;
        if (subtask.aiAnalyzed) stats.analyzedSubtasks++;
      });

      console.log(`✅ [API] XP stats calculated: ${stats.totalXP} total XP`);
      return { success: true, data: stats };
      
    } catch (error) {
      console.error('❌ [API] Failed to get XP stats:', error);
      return { success: false, error: error.message };
    } finally {
      if (prisma?.$disconnect) await prisma.$disconnect();
    }
  }
}

// For development/testing purposes
if (import.meta.env.DEV) {
  (window as any).PersonalTasksAPI = PersonalTasksAPI;
  console.log('🧪 [DEV] PersonalTasksAPI available on window.PersonalTasksAPI');
}