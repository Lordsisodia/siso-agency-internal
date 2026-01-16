/**
 * Migration Runner: Add Nightly Checkout Metrics
 *
 * This script applies the migration to add 6 core metrics to daily_reflections table.
 * Run with: npx tsx scripts/migrations/apply-nightly-checkout-migration.ts
 *
 * Prerequisites:
 * - Supabase credentials in .env file
 * - Database access permissions
 */

import { createClient } from '@supabase/supabase-js';

// Migration SQL
const MIGRATION_SQL = `
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
`;

const VERIFICATION_SQL = `
  SELECT
    column_name,
    data_type,
    column_default
  FROM information_schema.columns
  WHERE table_name = 'daily_reflections'
    AND column_name IN ('meditation', 'workout', 'nutrition', 'deep_work', 'research', 'sleep')
  ORDER BY column_name;
`;

async function main() {
  console.log('🚀 Starting migration: add_nightly_checkout_metrics');
  console.log('');

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment');
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Apply migration
    console.log('📝 Applying migration...');
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql_query: MIGRATION_SQL
    });

    if (migrationError) {
      // Try alternative method using direct SQL execution
      console.log('⚠️  RPC method failed, trying direct SQL execution...');
      console.log('   Note: This migration requires admin privileges.');
      console.log('   Please run the SQL manually in Supabase SQL Editor:');
      console.log('');
      console.log('─── COPY FROM HERE ───');
      console.log(MIGRATION_SQL);
      console.log('─── COPY TO HERE ───');
      console.log('');
      console.log('Or use the Supabase CLI:');
      console.log(`  supabase db execute --project-url="${supabaseUrl}"`);
      console.log('');
      return;
    }

    console.log('✅ Migration applied successfully!');
    console.log('');

    // Verify the migration
    console.log('🔍 Verifying migration...');
    const { data: columns, error: verificationError } = await supabase
      .rpc('exec_sql', {
        sql_query: VERIFICATION_SQL
      });

    if (verificationError) {
      console.log('⚠️  Could not verify automatically');
      console.log('   Please verify in Supabase SQL Editor that the following columns exist:');
      console.log('   - meditation');
      console.log('   - workout');
      console.log('   - nutrition');
      console.log('   - deep_work');
      console.log('   - research');
      console.log('   - sleep');
    } else {
      console.log('✅ Verification successful!');
      console.log('Added columns:', columns?.map((c: any) => c.column_name).join(', '));
    }

    console.log('');
    console.log('📊 New schema structure:');
    console.log('  meditation: {minutes: number, quality: 1-100}');
    console.log('  workout: {completed: boolean, type: string, duration: number, intensity: string}');
    console.log('  nutrition: {calories: number, protein: number, carbs: number, fats: number, hit_goal: boolean}');
    console.log('  deep_work: {hours: number, quality: 1-100}');
    console.log('  research: {hours: number, topic: string, notes: string}');
    console.log('  sleep: {hours: number, bed_time: string, wake_time: string, quality: 1-100}');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
