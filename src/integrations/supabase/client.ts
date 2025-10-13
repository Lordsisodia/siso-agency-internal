/**
 * Supabase Client - Consolidated Export
 *
 * This file re-exports the consolidated Supabase client from @/shared/lib/supabase
 * to avoid duplicate client instances and maintain backward compatibility.
 *
 * ✅ FIX: Phase 1 - Consolidate Supabase client to prevent "Multiple GoTrueClient instances" warning
 */

// Re-export everything from the consolidated client
export { supabase, TABLES, checkSupabaseConnection } from '@/shared/lib/supabase';
export type {
  SupabaseLightWorkTask,
  SupabaseLightWorkSubtask,
  SupabaseDeepWorkTask,
  SupabaseDeepWorkSubtask,
  SupabaseMorningRoutineTask,
  SupabaseDailyReflection,
  SupabaseUserFeedback
} from '@/shared/lib/supabase';
