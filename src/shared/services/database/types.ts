/**
 * Database Types for Hybrid Prisma/Supabase Implementation
 * Ensures type safety across both database systems
 */

// Core model interfaces matching Prisma schema
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LightWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  originalDate: string;
  currentDate: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: LightWorkSubtask[];
}

export interface LightWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeepWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  originalDate: string;
  currentDate: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: DeepWorkSubtask[];
}

export interface DeepWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MorningRoutineTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Database operation interfaces
export interface TaskFilters {
  userId: string;
  date?: string;
  showAllIncomplete?: boolean;
  completed?: boolean;
}

export interface CreateTaskData {
  userId: string;
  title: string;
  description?: string;
  priority?: Priority;
  originalDate: string;
  currentDate: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: Priority;
  completed?: boolean;
  currentDate?: string;
}

export interface CreateSubtaskData {
  taskId: string;
  title: string;
}

export interface UpdateSubtaskData {
  title?: string;
  completed?: boolean;
}

// Database adapter interface
export interface DatabaseAdapter {
  // Light Work Tasks
  getLightWorkTasks(filters: TaskFilters): Promise<LightWorkTask[]>;
  createLightWorkTask(data: CreateTaskData): Promise<LightWorkTask>;
  updateLightWorkTask(id: string, data: UpdateTaskData): Promise<LightWorkTask>;
  deleteLightWorkTask(id: string): Promise<void>;
  
  // Light Work Subtasks
  createLightWorkSubtask(data: CreateSubtaskData): Promise<LightWorkSubtask>;
  updateLightWorkSubtask(id: string, data: UpdateSubtaskData): Promise<LightWorkSubtask>;
  deleteLightWorkSubtask(id: string): Promise<void>;
  
  // Deep Work Tasks
  getDeepWorkTasks(filters: TaskFilters): Promise<DeepWorkTask[]>;
  createDeepWorkTask(data: CreateTaskData): Promise<DeepWorkTask>;
  updateDeepWorkTask(id: string, data: UpdateTaskData): Promise<DeepWorkTask>;
  deleteDeepWorkTask(id: string): Promise<void>;
  
  // Deep Work Subtasks
  createDeepWorkSubtask(data: CreateSubtaskData): Promise<DeepWorkSubtask>;
  updateDeepWorkSubtask(id: string, data: UpdateSubtaskData): Promise<DeepWorkSubtask>;
  deleteDeepWorkSubtask(id: string): Promise<void>;
  
  // Morning Routine
  getMorningRoutineTasks(userId: string, date: string): Promise<MorningRoutineTask[]>;
  createMorningRoutineTask(data: Omit<MorningRoutineTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MorningRoutineTask>;
  updateMorningRoutineTask(id: string, data: Partial<MorningRoutineTask>): Promise<MorningRoutineTask>;
  
  // Daily Reflections
  getDailyReflection(userId: string, date: string): Promise<DailyReflection | null>;
  createDailyReflection(data: Omit<DailyReflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyReflection>;
  updateDailyReflection(id: string, data: Partial<DailyReflection>): Promise<DailyReflection>;
  
  // Health check
  healthCheck(): Promise<boolean>;
}

// Configuration
export type DatabaseMode = 'prisma' | 'supabase' | 'hybrid';

export interface DatabaseConfig {
  mode: DatabaseMode;
  fallbackMode?: 'prisma' | 'supabase';
  enableLogging: boolean;
}