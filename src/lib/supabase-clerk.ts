/**
 * 🔗 Clerk-Supabase Integration
 * 
 * Connects Clerk authentication with Supabase Row Level Security
 * Provides authenticated Supabase client using Clerk JWT tokens
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create base Supabase client
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Hook to get the internal database user ID from Clerk user ID
 */
export function useSupabaseUserId(clerkUserId: string | null): string | null {
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchInternalUserId = async () => {
      if (!clerkUserId) {
        setInternalUserId(null);
        setIsLoaded(true);
        return;
      }

      try {
        const { data, error } = await supabaseAnon
          .from('users')
          .select('id')
          .eq('supabase_id', `prisma-user-${clerkUserId}`)
          .single();

        if (error) {
          console.error('❌ Error fetching internal user ID:', error);
          setInternalUserId(null);
        } else {
          setInternalUserId(data?.id || null);
          console.log(`🔗 Mapped Clerk user ${clerkUserId} to internal ID ${data?.id}`);
        }
      } catch (error) {
        console.error('❌ Error mapping user IDs:', error);
        setInternalUserId(null);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchInternalUserId();
  }, [clerkUserId]);

  return isLoaded ? internalUserId : null;
}

/**
 * Simple hook to return the anonymous Supabase client
 * For now, we'll use the existing user management system in the database
 * until we can properly configure Clerk JWT templates
 */
export function useSupabaseClient(): SupabaseClient {
  return supabaseAnon;
}

/**
 * Row Level Security SQL Policies for Supabase
 * These need to be executed in Supabase SQL Editor
 */
export const RLS_POLICIES = {
  // Enable RLS on all tables
  ENABLE_RLS: `
-- Enable Row Level Security on all task tables
ALTER TABLE light_work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE light_work_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_work_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
  `,

  // Create policies for light work tasks
  LIGHT_WORK_TASKS_POLICIES: `
-- Light Work Tasks - Users can only access their own tasks
CREATE POLICY "Users can view own light work tasks" ON light_work_tasks
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own light work tasks" ON light_work_tasks
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own light work tasks" ON light_work_tasks
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own light work tasks" ON light_work_tasks
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);
  `,

  // Create policies for light work subtasks
  LIGHT_WORK_SUBTASKS_POLICIES: `
-- Light Work Subtasks - Users can only access subtasks of their own tasks
CREATE POLICY "Users can view own light work subtasks" ON light_work_subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM light_work_tasks 
      WHERE light_work_tasks.id = light_work_subtasks."taskId" 
      AND light_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own light work subtasks" ON light_work_subtasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM light_work_tasks 
      WHERE light_work_tasks.id = light_work_subtasks."taskId" 
      AND light_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own light work subtasks" ON light_work_subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM light_work_tasks 
      WHERE light_work_tasks.id = light_work_subtasks."taskId" 
      AND light_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own light work subtasks" ON light_work_subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM light_work_tasks 
      WHERE light_work_tasks.id = light_work_subtasks."taskId" 
      AND light_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );
  `,

  // Create policies for deep work tasks
  DEEP_WORK_TASKS_POLICIES: `
-- Deep Work Tasks - Users can only access their own tasks
CREATE POLICY "Users can view own deep work tasks" ON deep_work_tasks
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own deep work tasks" ON deep_work_tasks
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own deep work tasks" ON deep_work_tasks
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own deep work tasks" ON deep_work_tasks
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);
  `,

  // Create policies for deep work subtasks
  DEEP_WORK_SUBTASKS_POLICIES: `
-- Deep Work Subtasks - Users can only access subtasks of their own tasks
CREATE POLICY "Users can view own deep work subtasks" ON deep_work_subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deep_work_tasks 
      WHERE deep_work_tasks.id = deep_work_subtasks."taskId" 
      AND deep_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own deep work subtasks" ON deep_work_subtasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deep_work_tasks 
      WHERE deep_work_tasks.id = deep_work_subtasks."taskId" 
      AND deep_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own deep work subtasks" ON deep_work_subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deep_work_tasks 
      WHERE deep_work_tasks.id = deep_work_subtasks."taskId" 
      AND deep_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own deep work subtasks" ON deep_work_subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deep_work_tasks 
      WHERE deep_work_tasks.id = deep_work_subtasks."taskId" 
      AND deep_work_tasks."userId" = auth.jwt() ->> 'sub'
    )
  );
  `,

  // Create policies for morning routine tasks
  MORNING_ROUTINE_POLICIES: `
-- Morning Routine Tasks - Users can only access their own tasks
CREATE POLICY "Users can view own morning routine tasks" ON morning_routine_tasks
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own morning routine tasks" ON morning_routine_tasks
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own morning routine tasks" ON morning_routine_tasks
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own morning routine tasks" ON morning_routine_tasks
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);
  `,

  // Create policies for daily reflections
  DAILY_REFLECTIONS_POLICIES: `
-- Daily Reflections - Users can only access their own reflections
CREATE POLICY "Users can view own daily reflections" ON daily_reflections
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own daily reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own daily reflections" ON daily_reflections
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own daily reflections" ON daily_reflections
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);
  `
};

/**
 * Complete RLS setup script for Supabase SQL Editor
 */
export const COMPLETE_RLS_SETUP = `
${RLS_POLICIES.ENABLE_RLS}

${RLS_POLICIES.LIGHT_WORK_TASKS_POLICIES}

${RLS_POLICIES.LIGHT_WORK_SUBTASKS_POLICIES}

${RLS_POLICIES.DEEP_WORK_TASKS_POLICIES}

${RLS_POLICIES.DEEP_WORK_SUBTASKS_POLICIES}

${RLS_POLICIES.MORNING_ROUTINE_POLICIES}

${RLS_POLICIES.DAILY_REFLECTIONS_POLICIES}
`;