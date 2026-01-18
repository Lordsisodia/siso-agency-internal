# Nightly Checkout Metrics Migration

## Overview

This migration adds 6 core metrics to the `daily_reflections` table to support the new Nightly Checkout feature.

## New Columns

### 1. Meditation (JSONB)
```json
{
  "minutes": number | null,
  "quality": 1-100 | null
}
```

### 2. Workout (JSONB)
```json
{
  "completed": boolean,
  "type": string | null,  // e.g., "strength", "cardio", "hiit", "yoga"
  "duration": number | null,  // minutes
  "intensity": string | null  // e.g., "low", "medium", "high"
}
```

### 3. Nutrition (JSONB)
```json
{
  "calories": number | null,
  "protein": number | null,  // grams
  "carbs": number | null,    // grams
  "fats": number | null,     // grams
  "hit_goal": boolean
}
```

### 4. Deep Work (JSONB)
```json
{
  "hours": number | null,
  "quality": 1-100 | null
}
```

### 5. Research (JSONB)
```json
{
  "hours": number | null,
  "topic": string | null,
  "notes": string | null
}
```

### 6. Sleep (JSONB)
```json
{
  "hours": number | null,
  "bed_time": string | null,  // ISO time string
  "wake_time": string | null, // ISO time string
  "quality": 1-100 | null
}
```

## How to Apply

### Option 1: Supabase SQL Editor (Recommended)

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/avdgyrepwrvsvwgxrccr/sql)
2. Copy the contents of `add_nightly_checkout_metrics.sql`
3. Paste into the SQL Editor
4. Click "Run"

### Option 2: Supabase CLI

```bash
# From project root
supabase db execute --file scripts/migrations/add_nightly_checkout_metrics.sql
```

### Option 3: TypeScript Runner

```bash
npx tsx scripts/migrations/apply-nightly-checkout-migration.ts
```

## Verification

After applying the migration, run this verification query:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'daily_reflections'
  AND column_name IN ('meditation', 'workout', 'nutrition', 'deep_work', 'research', 'sleep')
ORDER BY column_name;
```

Expected output:
```
column_name  | data_type | is_nullable | column_default
-------------|-----------|-------------|-------------------------------
deep_work    | jsonb     | YES         | '{"hours": null, "quality": null}'::jsonb
meditation   | jsonb     | YES         | '{"minutes": null, "quality": null}'::jsonb
nutrition    | jsonb     | YES         | '{"calories": null, "protein": null, "carbs": null, "fats": null, "hit_goal": false}'::jsonb
research     | jsonb     | YES         | '{"hours": null, "topic": null, "notes": null}'::jsonb
sleep        | jsonb     | YES         | '{"hours": null, "bed_time": null, "wake_time": null, "quality": null}'::jsonb
workout      | jsonb     | YES         | '{"completed": false, "type": null, "duration": null, "intensity": null}'::jsonb
```

## Rollback

If you need to rollback this migration:

```sql
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
```

## Usage Examples

### TypeScript Interface

```typescript
interface NightlyCheckoutMetrics {
  meditation?: {
    minutes?: number;
    quality?: number; // 1-100
  };
  workout?: {
    completed?: boolean;
    type?: string;
    duration?: number;
    intensity?: string;
  };
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    hit_goal?: boolean;
  };
  deep_work?: {
    hours?: number;
    quality?: number; // 1-100
  };
  research?: {
    hours?: number;
    topic?: string;
    notes?: string;
  };
  sleep?: {
    hours?: number;
    bed_time?: string;
    wake_time?: string;
    quality?: number; // 1-100
  };
}
```

### Query Example

```typescript
// Get today's metrics
const { data, error } = await supabase
  .from('daily_reflections')
  .select('meditation, workout, nutrition, deep_work, research, sleep')
  .eq('user_id', userId)
  .eq('date', today)
  .single();

// Update metrics
const { error } = await supabase
  .from('daily_reflections')
  .update({
    meditation: { minutes: 20, quality: 85 },
    workout: { completed: true, type: 'strength', duration: 45, intensity: 'high' },
    nutrition: { calories: 2200, protein: 150, carbs: 200, fats: 70, hit_goal: true },
    deep_work: { hours: 4.5, quality: 90 },
    research: { hours: 1, topic: 'AI agents', notes: 'Reviewed MCP integration patterns' },
    sleep: { hours: 7.5, bed_time: '23:00', wake_time: '06:30', quality: 80 }
  })
  .eq('user_id', userId)
  .eq('date', today);
```

## Important Notes

1. **Existing Data**: This migration uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
2. **Default Values**: All new columns have default empty JSONB objects
3. **Indexes**: GIN indexes are created for efficient JSONB querying
4. **Performance**: JSONB columns provide flexibility while maintaining good query performance
5. **Backward Compatible**: Existing `daily_reflections` data is not affected

## Next Steps

After applying this migration:

1. Update TypeScript interfaces in `useDailyReflections.ts`
2. Update the Nightly Checkout UI to capture these metrics
3. Update the unified data service to handle new fields
4. Add validation for metric ranges (e.g., quality 1-100)
5. Consider adding triggers for automatic calculations (e.g., daily score)

## Files Modified/Created

- `scripts/migrations/add_nightly_checkout_metrics.sql` - SQL migration
- `scripts/migrations/apply-nightly-checkout-migration.ts` - TypeScript runner
- `src/domains/lifelock/_shared/services/migrations/add_nightly_checkout_metrics.ts` - Migration module
- `src/domains/lifelock/_shared/services/migrations/run_nightly_checkout_migration.ts` - Migration runner

## Support

If you encounter issues:

1. Check Supabase logs for errors
2. Verify you have admin privileges
3. Ensure the project URL and credentials are correct
4. Check that RLS policies allow updates to `daily_reflections`
