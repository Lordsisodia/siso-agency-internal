/**
 * Migration: Add Nightly Checkout Metrics
 *
 * This migration adds structured columns for tracking 6 core metrics daily:
 * 1. Meditation: minutes, quality (1-100)
 * 2. Workout: completed, type, duration, intensity
 * 3. Nutrition: calories, protein, carbs, fats, hit_goal
 * 4. Deep Work: hours, quality (1-100)
 * 5. Research: hours, topic, notes
 * 6. Sleep: hours, bed_time, wake_time, quality (1-100)
 *
 * Uses JSONB columns for complex data structures to keep schema clean.
 */

import { apply_migration } from '@mcp/siso-internal-supabase';

export async function up() {
  await apply_migration({
    name: 'add_nightly_checkout_metrics',
    query: `
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

      -- Add comment to document the new structure
      COMMENT ON COLUMN daily_reflections.meditation IS 'Meditation metrics: {minutes: number, quality: 1-100}';
      COMMENT ON COLUMN daily_reflections.workout IS 'Workout metrics: {completed: boolean, type: string, duration: number, intensity: string}';
      COMMENT ON COLUMN daily_reflections.nutrition IS 'Nutrition metrics: {calories: number, protein: number, carbs: number, fats: number, hit_goal: boolean}';
      COMMENT ON COLUMN daily_reflections.deep_work IS 'Deep Work metrics: {hours: number, quality: 1-100}';
      COMMENT ON COLUMN daily_reflections.research IS 'Research metrics: {hours: number, topic: string, notes: string}';
      COMMENT ON COLUMN daily_reflections.sleep IS 'Sleep metrics: {hours: number, bed_time: string, wake_time: string, quality: 1-100}';

      -- Create indexes for efficient querying of completed metrics
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_meditation ON daily_reflections USING GIN (meditation);
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_workout ON daily_reflections USING GIN (workout);
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_nutrition ON daily_reflections USING GIN (nutrition);
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_deep_work ON daily_reflections USING GIN (deep_work);
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_research ON daily_reflections USING GIN (research);
      CREATE INDEX IF NOT EXISTS idx_daily_reflections_sleep ON daily_reflections USING GIN (sleep);
    `
  });
}

export async function down() {
  await apply_migration({
    name: 'remove_nightly_checkout_metrics',
    query: `
      -- Drop indexes
      DROP INDEX IF EXISTS idx_daily_reflections_meditation;
      DROP INDEX IF EXISTS idx_daily_reflections_workout;
      DROP INDEX IF EXISTS idx_daily_reflections_nutrition;
      DROP INDEX IF EXISTS idx_daily_reflections_deep_work;
      DROP INDEX IF EXISTS idx_daily_reflections_research;
      DROP INDEX IF EXISTS idx_daily_reflections_sleep;

      -- Remove columns
      ALTER TABLE daily_reflections DROP COLUMN IF EXISTS meditation;
      ALTER TABLE daily_reflections DROP COLUMN IF EXISTS workout;
      ALTER TABLE daily_reflections DROP COLUMN IF EXISTS nutrition;
      ALTER TABLE daily_reflections DROP COLUMN IF EXISTS deep_work;
      ALTER TABLE daily_reflections DROP COLUMN IF EXISTS research;
      ALTER TABLE daily_reflections DROP COLUMN IF EXISTS sleep;
    `
  });
}
