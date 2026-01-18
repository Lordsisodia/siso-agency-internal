# Nightly Checkout Migration Summary

## Status: Ready to Apply

This migration adds 6 core metrics to the `daily_reflections` table to support the new Nightly Checkout feature.

## What Was Created

### 1. Migration Files
- `/scripts/migrations/add_nightly_checkout_metrics.sql` - SQL migration script
- `/scripts/migrations/apply-nightly-checkout-migration.ts` - TypeScript runner
- `/src/domains/lifelock/_shared/services/migrations/add_nightly_checkout_metrics.ts` - Migration module
- `/src/domains/lifelock/_shared/services/migrations/run_nightly_checkout_migration.ts` - Migration runner

### 2. Documentation
- `/scripts/migrations/README-NIGHTLY-CHECKOUT-MIGRATION.md` - Complete migration guide

### 3. Updated TypeScript Interfaces
- `/src/lib/hooks/useDailyReflections.ts` - Added metric types to DailyReflection interface
- `/src/services/shared/unified-data.service.ts` - Added metric types to service layer

## New Schema

### Columns Added to `daily_reflections` Table

| Column | Type | Description |
|--------|------|-------------|
| `meditation` | JSONB | `{minutes: number, quality: 1-100}` |
| `workout` | JSONB | `{completed: boolean, type: string, duration: number, intensity: string}` |
| `nutrition` | JSONB | `{calories: number, protein: number, carbs: number, fats: number, hit_goal: boolean}` |
| `deep_work` | JSONB | `{hours: number, quality: 1-100}` |
| `research` | JSONB | `{hours: number, topic: string, notes: string}` |
| `sleep` | JSONB | `{hours: number, bed_time: string, wake_time: string, quality: 1-100}` |

### Indexes Created
- `idx_daily_reflections_meditation` (GIN)
- `idx_daily_reflections_workout` (GIN)
- `idx_daily_reflections_nutrition` (GIN)
- `idx_daily_reflections_deep_work` (GIN)
- `idx_daily_reflections_research` (GIN)
- `idx_daily_reflections_sleep` (GIN)

## How to Apply

### Recommended Method: Supabase SQL Editor

1. Navigate to: https://app.supabase.com/project/avdgyrepwrvsvwgxrccr/sql
2. Copy the contents of: `/scripts/migrations/add_nightly_checkout_metrics.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify with the query in the SQL file comments

### Alternative Method: CLI

```bash
npx tsx scripts/migrations/apply-nightly-checkout-migration.ts
```

## TypeScript Usage

After applying the migration, you can use the new metrics:

```typescript
import { useDailyReflections } from '@/lib/hooks/useDailyReflections';
import type { MeditationMetrics, WorkoutMetrics, NutritionMetrics } from '@/lib/hooks/useDailyReflections';

const { reflection, saveReflection } = useDailyReflections({
  selectedDate: new Date()
});

// Save metrics
await saveReflection({
  meditation: {
    minutes: 20,
    quality: 85
  },
  workout: {
    completed: true,
    type: 'strength',
    duration: 45,
    intensity: 'high'
  },
  nutrition: {
    calories: 2200,
    protein: 150,
    carbs: 200,
    fats: 70,
    hit_goal: true
  },
  deep_work: {
    hours: 4.5,
    quality: 90
  },
  research: {
    hours: 1,
    topic: 'AI agents',
    notes: 'Reviewed MCP integration patterns'
  },
  sleep: {
    hours: 7.5,
    bed_time: '23:00',
    wake_time: '06:30',
    quality: 80
  }
});
```

## Important Notes

### Safety Features
- Uses `IF NOT EXISTS` clauses - safe to run multiple times
- Does NOT drop existing columns
- Only ADDS new columns
- Default values prevent null errors

### Performance
- JSONB columns provide flexibility while maintaining good query performance
- GIN indexes enable efficient JSONB querying
- Comments document the schema for future developers

### Backward Compatibility
- Existing `daily_reflections` data is completely unaffected
- Old code continues to work without modifications
- New fields are optional (can be null)

## Next Steps

### 1. Apply the Migration
Run the SQL in Supabase SQL Editor

### 2. Update the UI
Modify `/src/domains/lifelock/1-daily/7-checkout/ui/pages/NightlyCheckoutSection.tsx` to capture these metrics

### 3. Add Validation
Consider adding validation for:
- Quality ratings (1-100)
- Duration/minutes (positive numbers)
- Required fields

### 4. Update RLS Policies
Ensure Row Level Security policies allow updates to these new fields

### 5. Add Analytics
Create views or functions to calculate:
- Daily score based on metrics
- Weekly averages
- Trends over time

## Rollback Plan

If needed, rollback is safe and simple:

```sql
-- Drop indexes
DROP INDEX IF EXISTS idx_daily_reflections_meditation;
DROP INDEX IF EXISTS idx_daily_reflections_workout;
DROP INDEX IF EXISTS idx_daily_reflections_nutrition;
DROP INDEX IF EXISTS idx_daily_reflections_deep_work;
DROP INDEX IF EXISTS idx_daily_reflections_research;
DROP INDEX IF EXISTS idx_daily_reflections_sleep;

-- Drop columns
ALTER TABLE daily_reflections DROP COLUMN IF EXISTS meditation;
ALTER TABLE daily_reflections DROP COLUMN IF EXISTS workout;
ALTER TABLE daily_reflections DROP COLUMN IF EXISTS nutrition;
ALTER TABLE daily_reflections DROP COLUMN IF EXISTS deep_work;
ALTER TABLE daily_reflections DROP COLUMN IF EXISTS research;
ALTER TABLE daily_reflections DROP COLUMN IF EXISTS sleep;
```

## Verification

After applying, run this query to verify:

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

Expected output should show 6 rows with JSONB data types.

## Files Changed

### Created
- `/scripts/migrations/add_nightly_checkout_metrics.sql`
- `/scripts/migrations/apply-nightly-checkout-migration.ts`
- `/scripts/migrations/README-NIGHTLY-CHECKOUT-MIGRATION.md`
- `/src/domains/lifelock/_shared/services/migrations/add_nightly_checkout_metrics.ts`
- `/src/domains/lifelock/_shared/services/migrations/run_nightly_checkout_migration.ts`

### Modified
- `/src/lib/hooks/useDailyReflections.ts` - Added metric types
- `/src/services/shared/unified-data.service.ts` - Added metric types

## Support

For issues or questions:
1. Check the complete guide: `/scripts/migrations/README-NIGHTLY-CHECKOUT-MIGRATION.md`
2. Review Supabase logs in the dashboard
3. Verify admin privileges
4. Check RLS policies allow updates

---

**Status**: Migration ready to apply
**Database**: siso-internal (avdgyrepwrvsvwgxrccr)
**Date**: 2026-01-16
**Migration**: add_nightly_checkout_metrics
