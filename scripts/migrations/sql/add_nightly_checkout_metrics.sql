-- ============================================
-- Migration: Add Nightly Checkout Metrics
-- ============================================
-- This migration adds 6 core metrics to the daily_reflections table
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT_ID/sql
--
-- Project: siso-internal (avdgyrepwrvsvwgxrccr)
-- Date: 2026-01-16
-- ============================================

-- Add Meditation metrics (JSONB for flexibility)
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS meditation JSONB DEFAULT '{"minutes": null, "quality": null}'::jsonb;

-- Add Workout metrics (JSONB for complex structure)
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS workout JSONB DEFAULT '{"completed": false, "type": null, "duration": null, "intensity": null}'::jsonb;

-- Add Nutrition metrics (JSONB for macros)
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS nutrition JSONB DEFAULT '{"calories": null, "protein": null, "carbs": null, "fats": null, "hit_goal": false}'::jsonb;

-- Add Deep Work metrics (JSONB for hours + quality)
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS deep_work JSONB DEFAULT '{"hours": null, "quality": null}'::jsonb;

-- Add Research metrics (JSONB for hours + topic + notes)
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS research JSONB DEFAULT '{"hours": null, "topic": null, "notes": null}'::jsonb;

-- Add Sleep metrics (JSONB for multiple fields)
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS sleep JSONB DEFAULT '{"hours": null, "bed_time": null, "wake_time": null, "quality": null}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN daily_reflections.meditation IS 'Meditation metrics: {minutes: number, quality: 1-100}';
COMMENT ON COLUMN daily_reflections.workout IS 'Workout metrics: {completed: boolean, type: string, duration: number, intensity: string}';
COMMENT ON COLUMN daily_reflections.nutrition IS 'Nutrition metrics: {calories: number, protein: number, carbs: number, fats: number, hit_goal: boolean}';
COMMENT ON COLUMN daily_reflections.deep_work IS 'Deep Work metrics: {hours: number, quality: 1-100}';
COMMENT ON COLUMN daily_reflections.research IS 'Research metrics: {hours: number, topic: string, notes: string}';
COMMENT ON COLUMN daily_reflections.sleep IS 'Sleep metrics: {hours: number, bed_time: string, wake_time: string, quality: 1-100}';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_daily_reflections_meditation ON daily_reflections USING GIN (meditation);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_workout ON daily_reflections USING GIN (workout);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_nutrition ON daily_reflections USING GIN (nutrition);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_deep_work ON daily_reflections USING GIN (deep_work);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_research ON daily_reflections USING GIN (research);
CREATE INDEX IF NOT EXISTS idx_daily_reflections_sleep ON daily_reflections USING GIN (sleep);

-- Add state and planning columns
ALTER TABLE daily_reflections
ADD COLUMN IF NOT EXISTS mood_start INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS mood_end INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS stress_level INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS non_negotiable TEXT,
ADD COLUMN IF NOT EXISTS top_tasks TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comments for new columns
COMMENT ON COLUMN daily_reflections.mood_start IS 'Mood at start of day (1-10)';
COMMENT ON COLUMN daily_reflections.mood_end IS 'Mood at end of day (1-10)';
COMMENT ON COLUMN daily_reflections.stress_level IS 'Stress level (1-10)';
COMMENT ON COLUMN daily_reflections.non_negotiable IS 'Non-negotiable task for tomorrow';
COMMENT ON COLUMN daily_reflections.top_tasks IS 'Top 3 tasks for tomorrow';

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the migration was successful:

-- SELECT
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'daily_reflections'
--   AND column_name IN ('meditation', 'workout', 'nutrition', 'deep_work', 'research', 'sleep')
-- ORDER BY column_name;
