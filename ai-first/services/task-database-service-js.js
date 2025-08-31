/**
 * 📊 Task Database Service - JavaScript ES Module Version
 * 
 * Handles all database operations with proper Prisma client initialization
 * Compatible with Vercel serverless functions using Prisma Accelerate
 */

// Try the most likely import path for current environment
import { PrismaClient } from '../../generated/prisma/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

// Universal Prisma client - works locally and on Vercel
const globalForPrisma = globalThis;
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient().$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma;

// Export a service object with all database operations
export const taskDatabaseService = {
  
  /**
   * Get all tasks for a user on a specific date with subtasks
   */
  async getTasksForDate(userId, date, workType) {
    try {
      const whereClause = {
        userId,
        currentDate: date
      };
      
      let tasks = [];
      
      // Query the correct table based on workType
      if (workType === 'LIGHT') {
        tasks = await prisma.lightWorkTask.findMany({
          where: whereClause,
          include: {
            subtasks: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
      } else if (workType === 'DEEP') {
        tasks = await prisma.deepWorkTask.findMany({
          where: whereClause,
          include: {
            subtasks: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
      } else {
        // If no workType specified, get both
        const lightTasks = await prisma.lightWorkTask.findMany({
          where: whereClause,
          include: {
            subtasks: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
        
        const deepTasks = await prisma.deepWorkTask.findMany({
          where: whereClause,
          include: {
            subtasks: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        });
        
        tasks = [...lightTasks, ...deepTasks];
      }

      return tasks;
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  },

  /**
   * Create a new task with optional subtasks
   */
  async createTask(input) {
    try {
      let task;
      
      // Route to correct table based on workType
      if (input.workType === 'LIGHT') {
        task = await prisma.lightWorkTask.create({
          data: {
            userId: input.userId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            currentDate: input.date,
            originalDate: input.originalDate || input.date,
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
      } else if (input.workType === 'DEEP') {
        task = await prisma.deepWorkTask.create({
          data: {
            userId: input.userId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            currentDate: input.date,
            originalDate: input.originalDate || input.date,
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
      } else {
        throw new Error(`Invalid workType: ${input.workType}. Must be 'LIGHT' or 'DEEP'`);
      }

      return task;
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      throw new Error('Failed to create task');
    }
  },

  /**
   * Update task completion status
   */
  async updateTaskCompletion(taskId, completed, workType) {
    try {
      const updateData = { 
        completed,
        completedAt: completed ? new Date() : null
      };

      if (workType === 'LIGHT') {
        await prisma.lightWorkTask.update({
          where: { id: taskId },
          data: updateData
        });
      } else if (workType === 'DEEP') {
        await prisma.deepWorkTask.update({
          where: { id: taskId },
          data: updateData
        });
      } else {
        throw new Error(`Invalid workType: ${workType}. Must be 'LIGHT' or 'DEEP'`);
      }
    } catch (error) {
      console.error('❌ Failed to update task completion:', error);
      throw new Error('Failed to update task completion');
    }
  },

  /**
   * Update task title
   */
  async updateTaskTitle(taskId, title, workType) {
    try {
      const updateData = { title: title.trim() };

      if (workType === 'LIGHT') {
        await prisma.lightWorkTask.update({
          where: { id: taskId },
          data: updateData
        });
      } else if (workType === 'DEEP') {
        await prisma.deepWorkTask.update({
          where: { id: taskId },
          data: updateData
        });
      } else {
        throw new Error(`Invalid workType: ${workType}. Must be 'LIGHT' or 'DEEP'`);
      }
    } catch (error) {
      console.error('❌ Failed to update task title:', error);
      throw new Error('Failed to update task title');
    }
  },

  /**
   * Update subtask completion status
   */
  async updateSubtaskCompletion(subtaskId, completed, workType) {
    try {
      const updateData = { 
        completed,
        completedAt: completed ? new Date() : null
      };

      if (workType === 'LIGHT') {
        await prisma.lightWorkSubtask.update({
          where: { id: subtaskId },
          data: updateData
        });
      } else if (workType === 'DEEP') {
        await prisma.deepWorkSubtask.update({
          where: { id: subtaskId },
          data: updateData
        });
      } else {
        throw new Error(`Invalid workType: ${workType}. Must be 'LIGHT' or 'DEEP'`);
      }
    } catch (error) {
      console.error('❌ Failed to update subtask completion:', error);
      throw new Error('Failed to update subtask completion');
    }
  },

  /**
   * Get personal context for user
   */
  async getPersonalContext(userId) {
    try {
      const context = await prisma.personalContext.findUnique({
        where: { userId }
      });
      return context;
    } catch (error) {
      console.error('❌ Failed to get personal context:', error);
      return null;
    }
  },

  /**
   * Update personal context for user
   */
  async updatePersonalContext(userId, contextData) {
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
    }
  },

  /**
   * Add subtask to task
   */
  async addSubtask(taskId, subtaskData) {
    try {
      if (subtaskData.workType === 'LIGHT') {
        return await prisma.lightWorkSubtask.create({
          data: {
            taskId,
            title: subtaskData.title,
            workType: subtaskData.workType
          }
        });
      } else if (subtaskData.workType === 'DEEP') {
        return await prisma.deepWorkSubtask.create({
          data: {
            taskId,
            title: subtaskData.title,
            workType: subtaskData.workType
          }
        });
      } else {
        throw new Error(`Invalid workType: ${subtaskData.workType}. Must be 'LIGHT' or 'DEEP'`);
      }
    } catch (error) {
      console.error('❌ Failed to add subtask:', error);
      throw new Error('Failed to add subtask');
    }
  },

  /**
   * Delete task
   */
  async deleteTask(taskId, workType) {
    try {
      if (workType === 'LIGHT') {
        await prisma.lightWorkTask.delete({
          where: { id: taskId }
        });
      } else if (workType === 'DEEP') {
        await prisma.deepWorkTask.delete({
          where: { id: taskId }
        });
      } else {
        throw new Error(`Invalid workType: ${workType}. Must be 'LIGHT' or 'DEEP'`);
      }
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      throw new Error('Failed to delete task');
    }
  },

  /**
   * Get morning routine for a specific date
   */
  async getMorningRoutineForDate(userId, date) {
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
            wakeUp: false,
            getBloodFlowing: false,
            freshenUp: false,
            powerUpBrain: false,
            planDay: false,
            meditation: false,
            pushups: false,
            situps: false,
            pullups: false,
            bathroom: false,
            brushTeeth: false,
            coldShower: false,
            water: false,
            supplements: false,
            preworkout: false,
            thoughtDump: false,
            planDeepWork: false,
            planLightWork: false,
            setTimebox: false
          }
        });
      }

      return routine;
    } catch (error) {
      console.error('❌ Failed to get morning routine:', error);
      throw new Error('Failed to get morning routine');
    }
  },

  /**
   * Update morning routine habit
   */
  async updateMorningRoutineHabit(userId, date, habitName, completed) {
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
          wakeUp: habitName === 'wakeUp' ? completed : false,
          getBloodFlowing: habitName === 'getBloodFlowing' ? completed : false,
          freshenUp: habitName === 'freshenUp' ? completed : false,
          powerUpBrain: habitName === 'powerUpBrain' ? completed : false,
          planDay: habitName === 'planDay' ? completed : false,
          meditation: habitName === 'meditation' ? completed : false,
          pushups: habitName === 'pushups' ? completed : false,
          situps: habitName === 'situps' ? completed : false,
          pullups: habitName === 'pullups' ? completed : false,
          bathroom: habitName === 'bathroom' ? completed : false,
          brushTeeth: habitName === 'brushTeeth' ? completed : false,
          coldShower: habitName === 'coldShower' ? completed : false,
          water: habitName === 'water' ? completed : false,
          supplements: habitName === 'supplements' ? completed : false,
          preworkout: habitName === 'preworkout' ? completed : false,
          thoughtDump: habitName === 'thoughtDump' ? completed : false,
          planDeepWork: habitName === 'planDeepWork' ? completed : false,
          planLightWork: habitName === 'planLightWork' ? completed : false,
          setTimebox: habitName === 'setTimebox' ? completed : false,
          ...updateData
        }
      });

      return routine;
    } catch (error) {
      console.error('❌ Failed to update morning routine habit:', error);
      throw new Error('Failed to update morning routine habit');
    }
  },

  /**
   * Ensure user exists (helper method)
   */
  async ensureUserExists(userId) {
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
  },

  /**
   * Get daily reflections for a specific date
   */
  async getDailyReflectionsForDate(userId, date) {
    try {
      const reflections = await prisma.dailyReflection.findUnique({
        where: {
          userId_date: {
            userId: userId,
            date: date
          }
        }
      });

      return reflections;
    } catch (error) {
      console.error('❌ Failed to get daily reflections:', error);
      return null;
    }
  },

  /**
   * Save daily reflections for a specific date
   */
  async saveDailyReflections(userId, reflectionData) {
    try {
      // Ensure user exists first
      await this.ensureUserExists(userId);

      const reflections = await prisma.dailyReflection.upsert({
        where: {
          userId_date: {
            userId: userId,
            date: reflectionData.date
          }
        },
        update: {
          wentWell: reflectionData.wentWell,
          evenBetterIf: reflectionData.evenBetterIf,
          analysis: reflectionData.analysis,
          patterns: reflectionData.patterns,
          changes: reflectionData.changes,
          overallRating: reflectionData.overallRating,
          keyLearnings: reflectionData.keyLearnings,
          tomorrowFocus: reflectionData.tomorrowFocus,
          updatedAt: new Date()
        },
        create: {
          userId: userId,
          date: reflectionData.date,
          wentWell: reflectionData.wentWell || [],
          evenBetterIf: reflectionData.evenBetterIf || [],
          analysis: reflectionData.analysis || [],
          patterns: reflectionData.patterns || [],
          changes: reflectionData.changes || [],
          overallRating: reflectionData.overallRating,
          keyLearnings: reflectionData.keyLearnings,
          tomorrowFocus: reflectionData.tomorrowFocus
        }
      });

      return reflections;
    } catch (error) {
      console.error('❌ Failed to save daily reflections:', error);
      throw new Error('Failed to save daily reflections');
    }
  }
};

export default taskDatabaseService;