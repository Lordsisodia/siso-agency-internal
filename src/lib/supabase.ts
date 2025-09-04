/**
 * Supabase Client Configuration
 * Provides typed Supabase client for LifeLock application
 */

import { createClient } from '@supabase/supabase-js';

// Robust environment variable handling
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl && envUrl.trim() && envUrl !== 'undefined') 
  ? envUrl.trim() 
  : 'https://avdgyrepwrvsvwgxrccr.supabase.co';

const supabaseKey = (envKey && envKey.trim() && envKey !== 'undefined') 
  ? envKey.trim() 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGd5cmVwd3J2c3Z3Z3hyY2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MzgwODIsImV4cCI6MjA1OTIxNDA4Mn0.8MZ2etAhQ1pTJnK84uoqAFfUirv_kaoYcmKHhKgLAWU';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. App will run in demo mode with fallback credentials.');
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