# Nightly Checkout Metric Cards

Reusable metric card components for the Nightly Checkout UI. Each card follows a consistent purple theme and supports auto-save functionality.

## Components

### 1. MeditationCard
Tracks meditation minutes and quality.

```typescript
interface MeditationValue {
  minutes: number;
  quality: number;
}

<MeditationCard
  value={{ minutes: 30, quality: 85 }}
  onChange={(value) => updateMetric('meditation', value)}
  saving={false}
/>
```

**Features:**
- Target: 30 minutes
- Progress bar with color change on completion
- Quality slider (1-100)
- Auto-save on change

### 2. WorkoutCard
Tracks workout completion with type, duration, and intensity.

```typescript
interface WorkoutValue {
  completed: boolean;
  type?: 'strength' | 'cardio' | 'yoga' | 'hiit' | 'other';
  duration?: number;
  intensity?: 'light' | 'moderate' | 'intense';
}

<WorkoutCard
  value={{ completed: true, type: 'strength', duration: 45, intensity: 'intense' }}
  onChange={(value) => updateMetric('workout', value)}
  saving={false}
/>
```

**Features:**
- Toggle button for workout completion
- Animated expand/collapse for details
- Type selector (5 workout types)
- Duration input (minutes)
- Intensity selector (3 levels)

### 3. NutritionCard
Tracks calories and macros with visual breakdown.

```typescript
interface NutritionValue {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  hitCalorieGoal: boolean;
}

<NutritionCard
  value={{ calories: 2800, protein: 180, carbs: 300, fats: 80, hitCalorieGoal: false }}
  onChange={(value) => updateMetric('nutrition', value)}
  saving={false}
/>
```

**Features:**
- Target: 3000 calories
- Progress bar with color change
- Macro inputs (protein, carbs, fats)
- Calorie goal checkbox
- Visual macro breakdown chart

### 4. DeepWorkCard
Tracks hours of deep work with quality rating.

```typescript
interface DeepWorkValue {
  hours: number;
  quality: number;
}

<DeepWorkCard
  value={{ hours: 6.5, quality: 90 }}
  onChange={(value) => updateMetric('deepWork', value)}
  saving={false}
/>
```

**Features:**
- Target: 8 hours
- Progress bar with decimals supported
- Quality slider (1-100)
- Quick stats (full hours + extra minutes)

### 5. ResearchCard
Tracks research hours, topic, and notes.

```typescript
interface ResearchValue {
  hours: number;
  topic: string;
  notes: string;
}

<ResearchCard
  value={{ hours: 2.5, topic: 'AI Architecture', notes: 'Key findings...' }}
  onChange={(value) => updateMetric('research', value)}
  saving={false}
/>
```

**Features:**
- Target: 2 hours
- Progress bar with decimals supported
- Topic text input
- Notes textarea with character count
- Research session stats

### 6. SleepCard
Tracks sleep duration, schedule, and quality.

```typescript
interface SleepValue {
  hours: number;
  bedTime: string;
  wakeTime: string;
  quality: number;
}

<SleepCard
  value={{ hours: 7.5, bedTime: '10:30 PM', wakeTime: '6:00 AM', quality: 85 }}
  onChange={(value) => updateMetric('sleep', value)}
  saving={false}
/>
```

**Features:**
- Target range: 7-9 hours
- Progress bar with optimal range indicator
- Color coding: green (optimal), yellow (under), purple (over)
- Bedtime/wake time dropdowns
- Quality slider (1-100)
- Sleep status insights

## Common Props

All components accept:

```typescript
interface MetricCardProps {
  value: any;           // Metric-specific value interface
  onChange: (value: any) => void;  // Update callback
  saving?: boolean;     // Show "Saving..." indicator
}
```

## Usage Pattern

```typescript
import {
  MeditationCard,
  WorkoutCard,
  NutritionCard,
  DeepWorkCard,
  ResearchCard,
  SleepCard
} from '@/domains/lifelock/1-daily/7-checkout/ui/components/metrics';

function NightlyCheckoutMetrics() {
  const [metrics, setMetrics] = useState({
    meditation: { minutes: 0, quality: 50 },
    workout: { completed: false },
    nutrition: { calories: 0, protein: 0, carbs: 0, fats: 0, hitCalorieGoal: false },
    deepWork: { hours: 0, quality: 50 },
    research: { hours: 0, topic: '', notes: '' },
    sleep: { hours: 0, bedTime: '', wakeTime: '', quality: 50 }
  });

  const [saving, setSaving] = useState(false);

  const handleMetricChange = async (key: string, value: any) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
    setSaving(true);

    // Debounced save
    await saveToDatabase(key, value);
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MeditationCard
        value={metrics.meditation}
        onChange={(value) => handleMetricChange('meditation', value)}
        saving={saving}
      />
      {/* ... other cards */}
    </div>
  );
}
```

## Styling

All cards use the purple theme:
- Background: `bg-purple-900/10`
- Border: `border-purple-700/30`
- Text: `text-purple-300`
- Progress: Gradient from `purple-400` to `purple-600`
- Success: `text-green-400` and `bg-green-500`

## Animations

Cards use Framer Motion for:
- Fade-in on mount
- Progress bar animations
- Expand/collapse transitions (WorkoutCard)
- Smooth state transitions

## Auto-Save Pattern

Parent component should handle debouncing:

```typescript
useEffect(() => {
  const timer = setTimeout(async () => {
    await saveMetrics(metrics);
  }, 1000);

  return () => clearTimeout(timer);
}, [metrics]);
```

## File Location

`/src/domains/lifelock/1-daily/7-checkout/ui/components/metrics/`

## Dependencies

- `@/components/ui/card`
- `@/components/ui/input`
- `@/components/ui/slider`
- `@/components/ui/button`
- `@/components/ui/textarea`
- `framer-motion`
- `lucide-react` (icons)
- `@/lib/utils` (cn utility)
