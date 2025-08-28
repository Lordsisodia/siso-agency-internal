/**
 * 📊 Task Database Service - JavaScript ES Module Version
 * 
 * Handles all database operations with proper Prisma client initialization
 * Compatible with Vercel serverless functions using Prisma Accelerate
 */

import { PrismaClient } from '../../generated/prisma/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

// Initialize Prisma client with Accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

// Export a service object with all database operations
export const taskDatabaseService = {
  
  /**
   * Get all tasks for a user on a specific date with subtasks
   */
  async getTasksForDate(userId, date) {
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

      return tasks;
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  },

  /**
   * Create a new task with optional subtasks
   */
  async createTask(userId, input) {
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

      return task;
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      throw new Error('Failed to create task');
    }
  },

  /**
   * Update task completion status
   */
  async updateTaskCompletion(taskId, completed) {
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
  },

  /**
   * Update task title
   */
  async updateTaskTitle(taskId, title) {
    try {
      await prisma.personalTask.update({
        where: { id: taskId },
        data: { title: title.trim() }
      });
    } catch (error) {
      console.error('❌ Failed to update task title:', error);
      throw new Error('Failed to update task title');
    }
  },

  /**
   * Update subtask completion status
   */
  async updateSubtaskCompletion(subtaskId, completed) {
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
    }
  },

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    try {
      await prisma.personalTask.delete({
        where: { id: taskId }
      });
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
  }
};

export default taskDatabaseService;