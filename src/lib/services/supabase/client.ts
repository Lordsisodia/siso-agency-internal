/**
 * Supabase Client Configuration
 * Provides typed Supabase client for LifeLock application
 */

import { getSupabaseBrowserClient } from '@/lib/services/supabase/browser-client';

export const supabase = getSupabaseBrowserClient();

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

export interface SupabaseUserFeedback {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'UI_UX' | 'PERFORMANCE' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL' | 'MOBILE' | 'ACCESSIBILITY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  feedback_type: 'BUG' | 'SUGGESTION' | 'IMPROVEMENT' | 'COMPLAINT' | 'PRAISE';
  page?: string;
  browser_info?: string;
  device_info?: string;
  screenshots: string[];
  status: 'OPEN' | 'REVIEWING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  admin_response?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// Table names (snake_case for Supabase)
export const TABLES = {
  LIGHT_WORK_TASKS: 'light_work_tasks',
  LIGHT_WORK_SUBTASKS: 'light_work_subtasks',
  DEEP_WORK_TASKS: 'deep_work_tasks',
  DEEP_WORK_SUBTASKS: 'deep_work_subtasks',
  MORNING_ROUTINE_TASKS: 'morning_routine_tasks',
  DAILY_ROUTINES: 'daily_routines',
  DAILY_REFLECTIONS: 'daily_reflections',
  HOME_WORKOUTS: 'home_workouts',
  TIME_BLOCKS: 'time_blocks',
  USER_FEEDBACK: 'user_feedback'
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
