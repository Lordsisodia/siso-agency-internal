/**
 * Prisma Database Adapter
 * Implements DatabaseAdapter interface using Prisma client
 */

import type {
  DatabaseAdapter,
  LightWorkTask,
  LightWorkSubtask,
  DeepWorkTask,
  DeepWorkSubtask,
  MorningRoutineTask,
  DailyReflection,
  TaskFilters,
  CreateTaskData,
  UpdateTaskData,
  CreateSubtaskData,
  UpdateSubtaskData,
  Priority
} from './types';

// Prisma client - will be initialized by DatabaseManager
let prismaClient: any = null;

export class PrismaAdapter implements DatabaseAdapter {
  constructor(client: any) {
    prismaClient = client;
  }

  // Light Work Tasks
  async getLightWorkTasks(filters: TaskFilters): Promise<LightWorkTask[]> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const whereClause: any = {
      userId: filters.userId
    };

    if (filters.date && !filters.showAllIncomplete) {
      whereClause.currentDate = filters.date;
    }

    if (filters.showAllIncomplete) {
      whereClause.completed = false;
    }

    if (filters.completed !== undefined) {
      whereClause.completed = filters.completed;
    }

    const tasks = await prismaClient.lightWorkTask.findMany({
      where: whereClause,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(this.transformPrismaLightWorkTask);
  }

  async createLightWorkTask(data: CreateTaskData): Promise<LightWorkTask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const task = await prismaClient.lightWorkTask.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || Priority.MEDIUM,
        originalDate: data.originalDate,
        currentDate: data.currentDate,
        completed: false
      },
      include: {
        subtasks: true
      }
    });

    return this.transformPrismaLightWorkTask(task);
  }

  async updateLightWorkTask(id: string, data: UpdateTaskData): Promise<LightWorkTask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.currentDate !== undefined) updateData.currentDate = data.currentDate;

    const task = await prismaClient.lightWorkTask.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return this.transformPrismaLightWorkTask(task);
  }

  async deleteLightWorkTask(id: string): Promise<void> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    await prismaClient.lightWorkTask.delete({
      where: { id }
    });
  }

  // Light Work Subtasks
  async createLightWorkSubtask(data: CreateSubtaskData): Promise<LightWorkSubtask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const subtask = await prismaClient.lightWorkSubtask.create({
      data: {
        taskId: data.taskId,
        title: data.title,
        completed: false
      }
    });

    return this.transformPrismaLightWorkSubtask(subtask);
  }

  async updateLightWorkSubtask(id: string, data: UpdateSubtaskData): Promise<LightWorkSubtask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;

    const subtask = await prismaClient.lightWorkSubtask.update({
      where: { id },
      data: updateData
    });

    return this.transformPrismaLightWorkSubtask(subtask);
  }

  async deleteLightWorkSubtask(id: string): Promise<void> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    await prismaClient.lightWorkSubtask.delete({
      where: { id }
    });
  }

  // Deep Work Tasks
  async getDeepWorkTasks(filters: TaskFilters): Promise<DeepWorkTask[]> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const whereClause: any = {
      userId: filters.userId
    };

    if (filters.date && !filters.showAllIncomplete) {
      whereClause.currentDate = filters.date;
    }

    if (filters.showAllIncomplete) {
      whereClause.completed = false;
    }

    if (filters.completed !== undefined) {
      whereClause.completed = filters.completed;
    }

    const tasks = await prismaClient.deepWorkTask.findMany({
      where: whereClause,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(this.transformPrismaDeepWorkTask);
  }

  async createDeepWorkTask(data: CreateTaskData): Promise<DeepWorkTask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const task = await prismaClient.deepWorkTask.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || Priority.MEDIUM,
        originalDate: data.originalDate,
        currentDate: data.currentDate,
        completed: false
      },
      include: {
        subtasks: true
      }
    });

    return this.transformPrismaDeepWorkTask(task);
  }

  async updateDeepWorkTask(id: string, data: UpdateTaskData): Promise<DeepWorkTask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.currentDate !== undefined) updateData.currentDate = data.currentDate;

    const task = await prismaClient.deepWorkTask.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return this.transformPrismaDeepWorkTask(task);
  }

  async deleteDeepWorkTask(id: string): Promise<void> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    await prismaClient.deepWorkTask.delete({
      where: { id }
    });
  }

  // Deep Work Subtasks
  async createDeepWorkSubtask(data: CreateSubtaskData): Promise<DeepWorkSubtask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const subtask = await prismaClient.deepWorkSubtask.create({
      data: {
        taskId: data.taskId,
        title: data.title,
        completed: false
      }
    });

    return this.transformPrismaDeepWorkSubtask(subtask);
  }

  async updateDeepWorkSubtask(id: string, data: UpdateSubtaskData): Promise<DeepWorkSubtask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;

    const subtask = await prismaClient.deepWorkSubtask.update({
      where: { id },
      data: updateData
    });

    return this.transformPrismaDeepWorkSubtask(subtask);
  }

  async deleteDeepWorkSubtask(id: string): Promise<void> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    await prismaClient.deepWorkSubtask.delete({
      where: { id }
    });
  }

  // Morning Routine Tasks
  async getMorningRoutineTasks(userId: string, date: string): Promise<MorningRoutineTask[]> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const tasks = await prismaClient.morningRoutineTask.findMany({
      where: {
        userId,
        date
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(this.transformPrismaMorningRoutineTask);
  }

  async createMorningRoutineTask(data: Omit<MorningRoutineTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MorningRoutineTask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const task = await prismaClient.morningRoutineTask.create({
      data
    });

    return this.transformPrismaMorningRoutineTask(task);
  }

  async updateMorningRoutineTask(id: string, data: Partial<MorningRoutineTask>): Promise<MorningRoutineTask> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const task = await prismaClient.morningRoutineTask.update({
      where: { id },
      data
    });

    return this.transformPrismaMorningRoutineTask(task);
  }

  // Daily Reflections
  async getDailyReflection(userId: string, date: string): Promise<DailyReflection | null> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const reflection = await prismaClient.dailyReflection.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      }
    });

    return reflection ? this.transformPrismaDailyReflection(reflection) : null;
  }

  async createDailyReflection(data: Omit<DailyReflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyReflection> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const reflection = await prismaClient.dailyReflection.create({
      data
    });

    return this.transformPrismaDailyReflection(reflection);
  }

  async updateDailyReflection(id: string, data: Partial<DailyReflection>): Promise<DailyReflection> {
    if (!prismaClient) throw new Error('Prisma client not initialized');

    const reflection = await prismaClient.dailyReflection.update({
      where: { id },
      data
    });

    return this.transformPrismaDailyReflection(reflection);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!prismaClient) return false;

    try {
      await prismaClient.lightWorkTask.findFirst({
        take: 1
      });
      return true;
    } catch {
      return false;
    }
  }

  // Transform methods - Prisma returns data in the correct format already
  private transformPrismaLightWorkTask(data: any): LightWorkTask {
    return {
      ...data,
      subtasks: data.subtasks || []
    };
  }

  private transformPrismaLightWorkSubtask(data: any): LightWorkSubtask {
    return data;
  }

  private transformPrismaDeepWorkTask(data: any): DeepWorkTask {
    return {
      ...data,
      subtasks: data.subtasks || []
    };
  }

  private transformPrismaDeepWorkSubtask(data: any): DeepWorkSubtask {
    return data;
  }

  private transformPrismaMorningRoutineTask(data: any): MorningRoutineTask {
    return data;
  }

  private transformPrismaDailyReflection(data: any): DailyReflection {
    return data;
  }
}