/**
 * Migration Runner: Add Nightly Checkout Metrics
 *
 * This script runs the migration to add the 6 core metrics to the daily_reflections table.
 * Run this with: npx tsx src/domains/lifelock/_shared/services/migrations/run_nightly_checkout_migration.ts
 */

import { add_nightly_checkout_metrics } from './add_nightly_checkout_metrics';

async function main() {
  console.log('🚀 Starting migration: add_nightly_checkout_metrics');
  console.log('');

  try {
    await add_nightly_checkout_metrics.up();
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Added columns to daily_reflections:');
    console.log('  - meditation: {minutes, quality}');
    console.log('  - workout: {completed, type, duration, intensity}');
    console.log('  - nutrition: {calories, protein, carbs, fats, hit_goal}');
    console.log('  - deep_work: {hours, quality}');
    console.log('  - research: {hours, topic, notes}');
    console.log('  - sleep: {hours, bed_time, wake_time, quality}');
    console.log('');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
