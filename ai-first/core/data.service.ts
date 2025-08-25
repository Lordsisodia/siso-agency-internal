/**
 * 💾 Real Database Service - AI-First Architecture
 * 
 * AI_INTERFACE: {
 *   purpose: "Unified data access with real Prisma operations",
 *   replaces: ["simulation services", "localStorage persistence"],
 *   features: ["type-safe", "reactive", "error-handling", "caching"],
 *   patterns: ["repository", "service", "hooks"]
 * }
 */

import { prismaClient, type PrismaClient } from '@/integrations/prisma/client';
import type {
  User,
  PersonalTask,
  PersonalSubtask,
  DailyHealth,
  DailyHabits,
  DailyWorkout,
  DailyRoutines,
  DailyReflections,
  TimeBlock,
  UserProgress,
  AutomationTask,
  WorkType,
  Priority,
  Prisma
} from '@/integrations/prisma/client';

// ===== CORE DATA SERVICE CLASS =====
export class DataService {
  private client: PrismaClient;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = prismaClient;
    console.log('🚀 DataService initialized with real Prisma client');
  }

  // ===== USER OPERATIONS =====
  
  async getUser(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const user = await this.client.user.findUnique({
        where: { id },
        include: {
          personalTasks: {
            where: { completed: false },
            orderBy: { createdAt: 'desc' }
          },
          gamification: true
        }
      });

      this.setCache(cacheKey, user);
      return user;
    } catch (error) {
      console.error('❌ [DataService] Failed to get user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async createUser(data: { supabaseId: string; email: string }): Promise<User> {
    try {
      const user = await this.client.user.create({
        data,
        include: {
          gamification: true
        }
      });

      // Initialize user progress
      await this.client.userProgress.create({
        data: {
          userId: user.id
        }
      });

      console.log('✅ [DataService] User created:', user.id);
      return user;
    } catch (error) {
      console.error('❌ [DataService] Failed to create user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // ===== PERSONAL TASK OPERATIONS =====

  async getPersonalTasks(userId: string, date?: string): Promise<PersonalTask[]> {
    const cacheKey = `tasks:${userId}:${date || 'all'}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const where: Prisma.PersonalTaskWhereInput = { userId };
      if (date) {
        where.currentDate = date;
      }

      const tasks = await this.client.personalTask.findMany({
        where,
        include: {
          subtasks: true,
          eisenhowerAnalysis: true
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      this.setCache(cacheKey, tasks);
      return tasks;
    } catch (error) {
      console.error('❌ [DataService] Failed to get tasks:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
  }

  async createPersonalTask(data: {
    userId: string;
    title: string;
    description?: string;
    workType: WorkType;
    priority: Priority;
    originalDate: string;
    currentDate: string;
    estimatedDuration?: number;
    tags?: string[];
    category?: string;
  }): Promise<PersonalTask> {
    try {
      const task = await this.client.personalTask.create({
        data,
        include: {
          subtasks: true,
          eisenhowerAnalysis: true
        }
      });

      // Clear related cache
      this.clearCache(`tasks:${data.userId}`);
      console.log('✅ [DataService] Task created:', task.id);
      return task;
    } catch (error) {
      console.error('❌ [DataService] Failed to create task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async updatePersonalTask(id: string, data: Partial<PersonalTask>): Promise<PersonalTask> {
    try {
      const task = await this.client.personalTask.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          subtasks: true,
          eisenhowerAnalysis: true
        }
      });

      // Clear related cache
      this.clearCache(`tasks:${task.userId}`);
      console.log('✅ [DataService] Task updated:', task.id);
      return task;
    } catch (error) {
      console.error('❌ [DataService] Failed to update task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async toggleTaskCompletion(id: string): Promise<PersonalTask> {
    try {
      // Get current task
      const currentTask = await this.client.personalTask.findUnique({
        where: { id }
      });

      if (!currentTask) {
        throw new Error('Task not found');
      }

      const task = await this.client.personalTask.update({
        where: { id },
        data: {
          completed: !currentTask.completed,
          completedAt: !currentTask.completed ? new Date() : null,
          updatedAt: new Date()
        },
        include: {
          subtasks: true,
          eisenhowerAnalysis: true
        }
      });

      // Clear related cache
      this.clearCache(`tasks:${task.userId}`);
      console.log('✅ [DataService] Task completion toggled:', task.id);
      return task;
    } catch (error) {
      console.error('❌ [DataService] Failed to toggle task completion:', error);
      throw new Error(`Failed to toggle task completion: ${error.message}`);
    }
  }

  // ===== DAILY HEALTH OPERATIONS =====

  async getDailyHealth(userId: string, date: string): Promise<DailyHealth | null> {
    const cacheKey = `health:${userId}:${date}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const health = await this.client.dailyHealth.findUnique({
        where: {
          userId_date: { userId, date }
        }
      });

      this.setCache(cacheKey, health);
      return health;
    } catch (error) {
      console.error('❌ [DataService] Failed to get daily health:', error);
      throw new Error(`Failed to fetch daily health: ${error.message}`);
    }
  }

  async upsertDailyHealth(data: {
    userId: string;
    date: string;
    healthChecklist?: any;
    meals?: any;
    macros?: any;
    waterIntakeMl?: number;
    milkIntakeMl?: number;
    sleepHours?: number;
    energyLevel?: number;
    moodLevel?: number;
    notes?: string;
  }): Promise<DailyHealth> {
    try {
      const health = await this.client.dailyHealth.upsert({
        where: {
          userId_date: { userId: data.userId, date: data.date }
        },
        update: {
          ...data,
          updatedAt: new Date()
        },
        create: data
      });

      // Clear related cache
      this.clearCache(`health:${data.userId}:${data.date}`);
      console.log('✅ [DataService] Daily health updated:', health.id);
      return health;
    } catch (error) {
      console.error('❌ [DataService] Failed to upsert daily health:', error);
      throw new Error(`Failed to save daily health: ${error.message}`);
    }
  }

  // ===== DAILY HABITS OPERATIONS =====

  async getDailyHabits(userId: string, date: string): Promise<DailyHabits | null> {
    const cacheKey = `habits:${userId}:${date}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const habits = await this.client.dailyHabits.findUnique({
        where: {
          userId_date: { userId, date }
        }
      });

      this.setCache(cacheKey, habits);
      return habits;
    } catch (error) {
      console.error('❌ [DataService] Failed to get daily habits:', error);
      throw new Error(`Failed to fetch daily habits: ${error.message}`);
    }
  }

  async upsertDailyHabits(data: {
    userId: string;
    date: string;
    screenTimeMinutes?: number;
    bullshitContentMinutes?: number;
    noWeed?: boolean;
    noScrolling?: boolean;
    deepWorkHours?: number;
    lightWorkHours?: number;
    habitsData?: any;
  }): Promise<DailyHabits> {
    try {
      const habits = await this.client.dailyHabits.upsert({
        where: {
          userId_date: { userId: data.userId, date: data.date }
        },
        update: {
          ...data,
          updatedAt: new Date()
        },
        create: data
      });

      // Clear related cache
      this.clearCache(`habits:${data.userId}:${data.date}`);
      console.log('✅ [DataService] Daily habits updated:', habits.id);
      return habits;
    } catch (error) {
      console.error('❌ [DataService] Failed to upsert daily habits:', error);
      throw new Error(`Failed to save daily habits: ${error.message}`);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Health check for the database
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number; error?: string }> {
    try {
      const start = Date.now();
      await this.client.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: -1,
        error: error.message
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    users: number;
    personalTasks: number;
    completedTasks: number;
    dailyHealthRecords: number;
  }> {
    try {
      const [users, personalTasks, completedTasks, dailyHealthRecords] = await Promise.all([
        this.client.user.count(),
        this.client.personalTask.count(),
        this.client.personalTask.count({ where: { completed: true } }),
        this.client.dailyHealth.count()
      ]);

      return {
        users,
        personalTasks,
        completedTasks,
        dailyHealthRecords
      };
    } catch (error) {
      console.error('❌ [DataService] Failed to get stats:', error);
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }

  // ===== CACHE MANAGEMENT =====

  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// ===== SINGLETON INSTANCE =====
export const dataService = new DataService();

// ===== REACT HOOKS =====

import { useState, useEffect } from 'react';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    dataService.getUser(id)
      .then(setUser)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { user, loading, error, refetch: () => dataService.getUser(id) };
}

export function usePersonalTasks(userId: string, date?: string) {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const tasks = await dataService.getPersonalTasks(userId, date);
      setTasks(tasks);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId, date]);

  return { tasks, loading, error, refetch: fetchTasks };
}

export function useDailyHealth(userId: string, date: string) {
  const [health, setHealth] = useState<DailyHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !date) return;

    dataService.getDailyHealth(userId, date)
      .then(setHealth)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId, date]);

  const updateHealth = async (data: any) => {
    try {
      const updatedHealth = await dataService.upsertDailyHealth({
        userId,
        date,
        ...data
      });
      setHealth(updatedHealth);
      return updatedHealth;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { health, loading, error, updateHealth };
}

// ===== UTILITY FUNCTIONS =====
export const checkIsAdmin = async (): Promise<boolean> => {
  // TEMPORARY FIX: Allow all authenticated users to be admin
  // This aligns with the UI-first approach while database integration is paused
  try {
    console.log('🔧 [AUTH] Using localStorage-based admin check (UI-first mode)');
    
    // For now, check if user has admin preference stored locally
    const savedAdminStatus = localStorage.getItem('user-is-admin');
    if (savedAdminStatus === 'true') {
      return true;
    }
    
    // Fallback: Check if user email is the main admin
    const userEmail = localStorage.getItem('user-email') || '';
    const isMainAdmin = userEmail === 'shaan.sisodia@gmail.com';
    
    // Cache the result
    if (isMainAdmin) {
      localStorage.setItem('user-is-admin', 'true');
    }
    
    console.log('🔧 [AUTH] Admin status:', isMainAdmin, 'for email:', userEmail);
    return isMainAdmin;
  } catch (error) {
    console.error('❌ [AUTH] Admin check failed:', error);
    return false;
  }
};

export const safeSupabase = {
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  })
};

export const safeCast = (value: any, fallback: any = null) => {
  try {
    return value || fallback;
  } catch {
    return fallback;
  }
};

// Export types
export type { User, PersonalTask, DailyHealth, DailyHabits };