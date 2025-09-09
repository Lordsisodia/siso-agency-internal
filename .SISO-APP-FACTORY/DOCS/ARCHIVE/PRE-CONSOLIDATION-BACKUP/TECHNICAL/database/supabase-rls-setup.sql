-- 🔐 Row Level Security Setup for SISO Internal
-- Run this script in your Supabase SQL Editor to set up RLS policies

-- Enable Row Level Security on all task tables
ALTER TABLE light_work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE light_work_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_work_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_routine_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

-- Light Work Tasks Policies
-- Users can only access their own tasks
CREATE POLICY "Users can view own light work tasks" ON light_work_tasks
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own light work tasks" ON light_work_tasks
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own light work tasks" ON light_work_tasks
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own light work tasks" ON light_work_tasks
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);

-- Light Work Subtasks Policies
-- Users can only access subtasks of their own tasks
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

-- Deep Work Tasks Policies
-- Users can only access their own tasks
CREATE POLICY "Users can view own deep work tasks" ON deep_work_tasks
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own deep work tasks" ON deep_work_tasks
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own deep work tasks" ON deep_work_tasks
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own deep work tasks" ON deep_work_tasks
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);

-- Deep Work Subtasks Policies
-- Users can only access subtasks of their own tasks
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

-- Morning Routine Tasks Policies
-- Users can only access their own tasks
CREATE POLICY "Users can view own morning routine tasks" ON morning_routine_tasks
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own morning routine tasks" ON morning_routine_tasks
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own morning routine tasks" ON morning_routine_tasks
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own morning routine tasks" ON morning_routine_tasks
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);

-- Daily Reflections Policies
-- Users can only access their own reflections
CREATE POLICY "Users can view own daily reflections" ON daily_reflections
  FOR SELECT USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can insert own daily reflections" ON daily_reflections
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can update own daily reflections" ON daily_reflections
  FOR UPDATE USING (auth.jwt() ->> 'sub' = "userId"::text);

CREATE POLICY "Users can delete own daily reflections" ON daily_reflections
  FOR DELETE USING (auth.jwt() ->> 'sub' = "userId"::text);

-- ✅ Row Level Security setup complete!
-- Your Supabase database is now secured with Clerk authentication.