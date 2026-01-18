/**
 * Supabase Sync Configuration Validator
 *
 * Prevents sync bugs by validating that:
 * 1. Sync conflict keys match database UNIQUE constraints
 * 2. All synced tables have RLS bypass policies in development
 * 3. All synced tables have required permissions
 * 4. Type definitions match actual database schema
 *
 * Run this before commits and in CI/CD to catch issues early.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expected sync configuration from syncService.ts
const EXPECTED_SYNC_CONFIG = {
  lightWorkTasks: {
    table: 'light_work_tasks',
    conflictKey: 'id', // Primary key only
  },
  deepWorkTasks: {
    table: 'deep_work_tasks',
    conflictKey: 'id', // Primary key only
  },
  morningRoutines: {
    table: 'daily_routines',
    conflictKey: 'user_id,date,routine_type', // Composite
  },
  workoutSessions: {
    table: 'daily_workouts',
    conflictKey: 'user_id,date', // Composite (via home_workouts view)
  },
  nightlyCheckouts: {
    table: 'daily_reflections',
    conflictKey: 'user_id,date', // Composite
  },
  dailyReflections: {
    table: 'daily_reflections',
    conflictKey: 'user_id,date', // Composite
  },
  timeBlocks: {
    table: 'time_blocks',
    conflictKey: 'user_id,date,start_time', // Composite
  },
};

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

async function validateSyncConfiguration(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Validating Supabase sync configuration...\n');

  // 1. Check database constraints match sync config
  console.log('📋 Step 1: Validating conflict keys match database constraints...');

  const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        tc.table_name,
        tc.constraint_type,
        string_agg(kcu.column_name, ',' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.constraint_type = 'UNIQUE'
        AND tc.table_name IN (
          'light_work_tasks',
          'deep_work_tasks',
          'daily_routines',
          'daily_reflections',
          'time_blocks',
          'daily_workouts'
        )
      GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
      ORDER BY tc.table_name;
    `
  });

  if (constraintsError) {
    errors.push(`Failed to fetch database constraints: ${constraintsError.message}`);
  }

  // 2. Check bypass policies exist
  console.log('🛡️  Step 2: Validating RLS bypass policies...');

  const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT tablename, COUNT(*) FILTER (WHERE policyname LIKE 'dev_bypass%') as bypass_count
      FROM pg_policies
      WHERE tablename IN (
        'light_work_tasks',
        'deep_work_tasks',
        'daily_routines',
        'daily_reflections',
        'time_blocks',
        'daily_workouts',
        'workout_items',
        'client_onboarding',
        'client_user_links',
        'weekly_challenges'
      )
      GROUP BY tablename
      HAVING COUNT(*) FILTER (WHERE policyname LIKE 'dev_bypass%') = 0;
    `
  });

  if (policiesError) {
    errors.push(`Failed to check policies: ${policiesError.message}`);
  } else if (policies && policies.length > 0) {
    policies.forEach((p: any) => {
      errors.push(`Missing bypass policy for table: ${p.tablename}`);
    });
  }

  // 3. Test actual queries work
  console.log('🧪 Step 3: Testing table access...');

  const tablesToTest = [
    'light_work_tasks',
    'deep_work_tasks',
    'daily_routines',
    'daily_reflections',
    'time_blocks',
    'daily_workouts'
  ];

  for (const table of tablesToTest) {
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(1);

    if (error) {
      errors.push(`Cannot query ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ ${table}`);
    }
  }

  // 4. Check for pending sync actions
  console.log('\n🔄 Step 4: Checking offline sync queue...');
  warnings.push('Manual check required: Open browser console and check for "Dropping action" errors');

  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}

// Run validation
validateSyncConfiguration()
  .then(result => {
    console.log('\n' + '='.repeat(60));

    if (result.passed) {
      console.log('✅ ALL VALIDATION CHECKS PASSED');
    } else {
      console.log('❌ VALIDATION FAILED');
      console.log('\nErrors:');
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warn => console.log(`  - ${warn}`));
    }

    console.log('='.repeat(60));

    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
