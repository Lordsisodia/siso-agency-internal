/**
 * Supabase Client Configuration
 * Provides typed Supabase client for LifeLock application
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// LifeLock Database Types (matching Prisma schema)
export interface SupabaseLightWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseLightWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseDeepWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseDeepWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseMorningRoutineTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseDailyReflection {
  id: string;
  userId: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Table names (snake_case for Supabase)
export const TABLES = {
  LIGHT_WORK_TASKS: 'light_work_tasks',
  LIGHT_WORK_SUBTASKS: 'light_work_subtasks',
  DEEP_WORK_TASKS: 'deep_work_tasks',
  DEEP_WORK_SUBTASKS: 'deep_work_subtasks',
  MORNING_ROUTINE_TASKS: 'morning_routine_tasks',
  DAILY_REFLECTIONS: 'daily_reflections'
} as const;

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from(TABLES.LIGHT_WORK_TASKS).select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};