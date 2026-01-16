# Nightly Checkout Metrics - Quick Reference

## TypeScript Types

```typescript
// Import types
import type {
  MeditationMetrics,
  WorkoutMetrics,
  NutritionMetrics,
  DeepWorkMetrics,
  ResearchMetrics,
  SleepMetrics,
  NightlyCheckoutMetrics
} from '@/lib/hooks/useDailyReflections';

// Or from service layer
import type {
  MeditationMetrics,
  WorkoutMetrics,
  NutritionMetrics,
  DeepWorkMetrics,
  ResearchMetrics,
  SleepMetrics,
  NightlyCheckoutMetrics
} from '@/services/shared/unified-data.service';
```

## Metric Structures

### Meditation
```typescript
{
  minutes?: number;      // Duration in minutes
  quality?: number;      // 1-100 rating
}
```

### Workout
```typescript
{
  completed?: boolean;   // Did you workout?
  type?: string;         // "strength" | "cardio" | "hiit" | "yoga" | "other"
  duration?: number;     // Minutes
  intensity?: string;    // "low" | "medium" | "high"
}
```

### Nutrition
```typescript
{
  calories?: number;     // Daily calories
  protein?: number;      // Grams
  carbs?: number;        // Grams
  fats?: number;         // Grams
  hit_goal?: boolean;    // Did you hit your targets?
}
```

### Deep Work
```typescript
{
  hours?: number;        // Hours of deep work
  quality?: number;      // 1-100 rating
}
```

### Research
```typescript
{
  hours?: number;        // Hours spent researching
  topic?: string;        // What did you research?
  notes?: string;        // Key findings
}
```

### Sleep
```typescript
{
  hours?: number;        // Total hours slept
  bed_time?: string;     // "23:00" format
  wake_time?: string;    // "06:30" format
  quality?: number;      // 1-100 rating
}
```

## Usage Examples

### Reading Metrics
```typescript
const { reflection } = useDailyReflections({ selectedDate: new Date() });

console.log(reflection?.meditation?.minutes);
console.log(reflection?.workout?.completed);
console.log(reflection?.nutrition?.calories);
```

### Saving Metrics
```typescript
const { saveReflection } = useDailyReflections({ selectedDate: new Date() });

await saveReflection({
  meditation: { minutes: 20, quality: 85 },
  workout: { completed: true, type: 'strength', duration: 45, intensity: 'high' },
  nutrition: { calories: 2200, protein: 150, carbs: 200, fats: 70, hit_goal: true },
  deep_work: { hours: 4.5, quality: 90 },
  research: { hours: 1, topic: 'AI', notes: 'Studied MCP patterns' },
  sleep: { hours: 7.5, bed_time: '23:00', wake_time: '06:30', quality: 80 }
});
```

### Direct Supabase Query
```typescript
const { data, error } = await supabase
  .from('daily_reflections')
  .select('meditation, workout, nutrition, deep_work, research, sleep')
  .eq('user_id', userId)
  .eq('date', today)
  .single();
```

### Updating Individual Metric
```typescript
const { error } = await supabase
  .from('daily_reflections')
  .update({
    meditation: { minutes: 30, quality: 90 }
  })
  .eq('user_id', userId)
  .eq('date', today);
```

### Querying with JSONB Operators
```sql
-- Get days with meditation > 20 minutes
SELECT * FROM daily_reflections
WHERE (meditation->>'minutes')::numeric > 20;

-- Get completed workouts
SELECT * FROM daily_reflections
WHERE (workout->>'completed')::boolean = true;

-- Get high quality deep work days
SELECT * FROM daily_reflections
WHERE (deep_work->>'quality')::numeric >= 80;
```

## Validation Helpers

```typescript
// Validate quality ratings (1-100)
const isValidQuality = (value?: number): boolean => {
  return value !== undefined && value >= 1 && value <= 100;
};

// Validate positive numbers
const isValidPositiveNumber = (value?: number): boolean => {
  return value !== undefined && value > 0;
};

// Validate time format (HH:MM)
const isValidTime = (time?: string): boolean => {
  if (!time) return false;
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// Workout types
const workoutTypes = ['strength', 'cardio', 'hiit', 'yoga', 'other'] as const;
const isValidWorkoutType = (type?: string): boolean => {
  return type !== undefined && workoutTypes.includes(type as any);
};

// Intensity levels
const intensityLevels = ['low', 'medium', 'high'] as const;
const isValidIntensity = (intensity?: string): boolean => {
  return intensity !== undefined && intensityLevels.includes(intensity as any);
};
```

## Common Patterns

### Calculate Daily Score
```typescript
const calculateDailyScore = (metrics: NightlyCheckoutMetrics): number => {
  let score = 0;
  let maxScore = 0;

  // Meditation (20% weight)
  if (metrics.meditation?.quality) {
    score += metrics.meditation.quality * 0.2;
    maxScore += 100 * 0.2;
  }

  // Workout (20% weight)
  if (metrics.workout?.completed) {
    score += 100 * 0.2;
    maxScore += 100 * 0.2;
  }

  // Nutrition (20% weight)
  if (metrics.nutrition?.hit_goal) {
    score += 100 * 0.2;
    maxScore += 100 * 0.2;
  }

  // Deep Work (20% weight)
  if (metrics.deep_work?.quality) {
    score += metrics.deep_work.quality * 0.2;
    maxScore += 100 * 0.2;
  }

  // Sleep (20% weight)
  if (metrics.sleep?.quality) {
    score += metrics.sleep.quality * 0.2;
    maxScore += 100 * 0.2;
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};
```

### Get Empty Metrics Template
```typescript
const getEmptyMetrics = (): NightlyCheckoutMetrics => ({
  meditation: { minutes: undefined, quality: undefined },
  workout: { completed: false, type: undefined, duration: undefined, intensity: undefined },
  nutrition: { calories: undefined, protein: undefined, carbs: undefined, fats: undefined, hit_goal: false },
  deep_work: { hours: undefined, quality: undefined },
  research: { hours: undefined, topic: undefined, notes: undefined },
  sleep: { hours: undefined, bed_time: undefined, wake_time: undefined, quality: undefined }
});
```

### Merge Metrics with Defaults
```typescript
const mergeMetrics = (
  existing?: NightlyCheckoutMetrics,
  updates?: Partial<NightlyCheckoutMetrics>
): NightlyCheckoutMetrics => ({
  meditation: { ...existing?.meditation, ...updates?.meditation },
  workout: { ...existing?.workout, ...updates?.workout },
  nutrition: { ...existing?.nutrition, ...updates?.nutrition },
  deep_work: { ...existing?.deep_work, ...updates?.deep_work },
  research: { ...existing?.research, ...updates?.research },
  sleep: { ...existing?.sleep, ...updates?.sleep }
});
```

## Migration Status

- ✅ Migration files created
- ✅ TypeScript interfaces updated
- ✅ Documentation complete
- ⏳ Awaiting database application

## Apply Migration

1. Go to: https://app.supabase.com/project/avdgyrepwrvsvwgxrccr/sql
2. Run: `/scripts/migrations/add_nightly_checkout_metrics.sql`
3. Verify with query in file comments

For complete details, see: `/scripts/migrations/README-NIGHTLY-CHECKOUT-MIGRATION.md`
