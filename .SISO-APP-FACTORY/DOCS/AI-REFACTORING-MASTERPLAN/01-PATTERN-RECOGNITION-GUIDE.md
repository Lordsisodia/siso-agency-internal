# 🔍 Pattern Recognition Guide - Points 1-15

## AI Pattern Detection System

This guide teaches AI to automatically identify refactoring opportunities using proven pattern recognition techniques.

## 🎯 Points 1-5: Component Complexity Detection

### Point 1: Line Count Analysis
**Trigger**: Component >500 lines
**Pattern**: 
```typescript
// BAD: AdminLifeLockDay-backup.tsx (1,129 lines)
export function AdminLifeLockDay() {
  // 1,129 lines of mixed concerns
}

// GOOD: UnifiedTaskCard.tsx (200 lines)
export function UnifiedTaskCard() {
  // Single responsibility, reusable
}
```
**AI Detection**: `wc -l *.tsx | awk '$1 > 500 {print $2 ": " $1 " lines"}'`

### Point 2: Duplicate Code Detection
**Trigger**: Similar JSX patterns repeated 3+ times
**Pattern**:
```typescript
// BAD: Repeated task rendering
<div className="task-card">
  <h3>{task.title}</h3>
  <p>{task.description}</p>
  {/* Repeated 20+ times across components */}
</div>

// GOOD: Unified component
<UnifiedTaskCard task={task} variant={workType} />
```
**AI Detection**: Use AST parsing to find similar JSX structures

### Point 3: Prop Drilling Detection
**Trigger**: Props passed through 3+ component levels
**Pattern**:
```typescript
// BAD: Props drilling 5 levels deep
<Parent data={data} onUpdate={onUpdate}>
  <Child data={data} onUpdate={onUpdate}>
    <GrandChild data={data} onUpdate={onUpdate}>
      <GreatGrandChild data={data} onUpdate={onUpdate} />
```
**AI Detection**: Trace prop usage through component tree

### Point 4: Mixed Concerns Detection
**Trigger**: Component handling >3 different responsibilities
**Pattern**:
```typescript
// BAD: Data fetching + UI + Business logic + Styling
function MegaComponent() {
  const [data, setData] = useState(); // Data concern
  const calculateTotal = () => {}; // Business logic
  const handleSubmit = () => {}; // Event handling
  return <div style={{...}}>; // UI + Styling
}

// GOOD: Separated concerns
const data = useTaskData(); // Custom hook
const { total } = useCalculations(data); // Business logic hook
return <TaskDisplay data={data} total={total} />; // Pure UI
```

### Point 5: Configuration Hardcoding Detection
**Trigger**: Magic numbers/strings repeated >5 times
**Pattern**:
```typescript
// BAD: Hardcoded values everywhere
const MORNING_TASKS = ["Wake up", "Exercise", "Breakfast"];
const EVENING_TASKS = ["Dinner", "Review", "Sleep"];

// GOOD: Configuration-driven
const ROUTINE_CONFIG = {
  morning: ["Wake up", "Exercise", "Breakfast"],
  evening: ["Dinner", "Review", "Sleep"]
};
```

## 🎯 Points 6-10: Logic Extraction Opportunities

### Point 6: Business Logic in Components
**Trigger**: Complex calculations/validations in JSX
**Pattern**:
```typescript
// BAD: Logic mixed with UI
function TaskCard({ task }) {
  return (
    <div>
      {task.subtasks.filter(st => !st.completed).length > 0 && (
        <Progress value={
          (task.subtasks.filter(st => st.completed).length / 
           task.subtasks.length) * 100
        } />
      )}
    </div>
  );
}

// GOOD: Logic extracted to hooks
function TaskCard({ task }) {
  const { progress, hasIncomplete } = useTaskProgress(task);
  return (
    <div>
      {hasIncomplete && <Progress value={progress} />}
    </div>
  );
}
```

### Point 7: State Management Complexity
**Trigger**: >5 useState hooks or complex state logic
**Pattern**:
```typescript
// BAD: Multiple related state variables
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [filter, setFilter] = useState('all');
const [sort, setSort] = useState('date');

// GOOD: Unified state management
const {
  tasks, loading, error, filter, sort,
  updateFilter, updateSort, refreshTasks
} = useTaskState();
```

### Point 8: Effect Complexity Detection
**Trigger**: useEffect with >10 lines or multiple concerns
**Pattern**:
```typescript
// BAD: Complex effect with multiple concerns
useEffect(() => {
  // Data fetching
  fetch('/api/tasks').then(setTasks);
  // Event listeners
  window.addEventListener('resize', handleResize);
  // Timers
  const interval = setInterval(refreshData, 5000);
  return () => {
    window.removeEventListener('resize', handleResize);
    clearInterval(interval);
  };
}, []);

// GOOD: Separated into focused hooks
useDataFetching(); // Handles API calls
useWindowSize(); // Handles resize
useAutoRefresh(); // Handles intervals
```

### Point 9: Conditional Rendering Complexity
**Trigger**: >3 nested ternary operators or complex conditionals
**Pattern**:
```typescript
// BAD: Complex conditional rendering
{isLoading ? (
  <Spinner />
) : error ? (
  <Error message={error} />
) : tasks.length === 0 ? (
  <EmptyState />
) : filter === 'completed' ? (
  <CompletedTasks tasks={tasks} />
) : (
  <ActiveTasks tasks={tasks} />
)}

// GOOD: Component factory pattern
<TaskRenderer 
  state={{ isLoading, error, tasks, filter }}
  components={{ Spinner, Error, EmptyState, CompletedTasks, ActiveTasks }}
/>
```

### Point 10: API Integration Patterns
**Trigger**: Fetch logic repeated across components
**Pattern**:
```typescript
// BAD: Repeated API patterns
useEffect(() => {
  setLoading(true);
  fetch('/api/tasks')
    .then(response => response.json())
    .then(setTasks)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

// GOOD: Reusable API hook
const { data: tasks, loading, error } = useApiData('/api/tasks');
```

## 🎯 Points 11-15: Architecture Pattern Detection

### Point 11: Component Factory Opportunities
**Trigger**: Similar components with different configurations
**Pattern**:
```typescript
// BAD: Multiple similar components
function LightWorkCard() { /* 200 lines */ }
function DeepWorkCard() { /* 200 lines */ }
function CreativeWorkCard() { /* 200 lines */ }

// GOOD: Factory pattern
const WorkCard = createWorkCardFactory({
  light: LightWorkConfig,
  deep: DeepWorkConfig,
  creative: CreativeWorkConfig
});
```

### Point 12: Hook Decomposition Opportunities
**Trigger**: Custom hooks >100 lines or multiple concerns
**Pattern**:
```typescript
// BAD: Monolithic hook (300+ lines)
function useLifeLockData() {
  // Morning routine logic (100 lines)
  // Task management logic (100 lines)
  // Evening checkout logic (100 lines)
  // Return everything
}

// GOOD: Decomposed hooks
function useLifeLockData() {
  const morning = useMorningRoutine();
  const tasks = useTaskManagement();
  const evening = useEveningCheckout();
  return { morning, tasks, evening };
}
```

### Point 13: Configuration Extraction Opportunities
**Trigger**: Hardcoded configurations scattered across files
**Pattern**:
```typescript
// BAD: Scattered configurations
// In MorningRoutine.tsx
const steps = ["Wake up", "Exercise"];
// In EveningCheckout.tsx  
const steps = ["Review", "Plan tomorrow"];
// In TaskCard.tsx
const priorities = ["Low", "Medium", "High"];

// GOOD: Centralized configuration
// morning-routine-defaults.ts
export const MORNING_ROUTINE_CONFIG = {
  steps: ["Wake up", "Exercise"],
  defaultDuration: 30
};
```

### Point 14: Performance Optimization Patterns
**Trigger**: Unnecessary re-renders or expensive calculations
**Pattern**:
```typescript
// BAD: Expensive calculations on every render
function TaskList({ tasks }) {
  const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);
  const filteredTasks = sortedTasks.filter(task => !task.completed);
  return <>{filteredTasks.map(task => <TaskCard key={task.id} task={task} />)}</>;
}

// GOOD: Memoized calculations
function TaskList({ tasks }) {
  const processedTasks = useMemo(() => 
    tasks
      .sort((a, b) => a.priority - b.priority)
      .filter(task => !task.completed),
    [tasks]
  );
  return <>{processedTasks.map(task => <TaskCard key={task.id} task={task} />)}</>;
}
```

### Point 15: Bundle Size Optimization
**Trigger**: Large components affecting bundle size
**Pattern**:
```typescript
// BAD: Everything in one component
import { HugeLibrary } from 'huge-library';
import { AnotherBigDependency } from 'another-big-dep';

function MegaComponent() {
  // Uses everything immediately
}

// GOOD: Lazy loading and code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const OptionalFeature = lazy(() => import('./OptionalFeature'));

function OptimizedComponent() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 🤖 AI Detection Scripts

### Automated Pattern Detection
```bash
#!/bin/bash
# Find components >500 lines
find src -name "*.tsx" -exec wc -l {} + | awk '$1 > 500 {print $2 ": " $1 " lines"}'

# Find duplicate JSX patterns
grep -r "className=\"task-card\"" src/ | wc -l

# Find useState hooks >5 per file
grep -c "useState" src/**/*.tsx | awk -F: '$2 > 5 {print $1 ": " $2 " useState hooks"}'
```

### Pattern Recognition Checklist
- [ ] Components >500 lines identified
- [ ] Duplicate JSX patterns found
- [ ] Prop drilling detected
- [ ] Mixed concerns identified  
- [ ] Hardcoded configurations found
- [ ] Business logic in JSX detected
- [ ] Complex state management found
- [ ] Heavy useEffects identified
- [ ] Complex conditional rendering found
- [ ] Repeated API patterns detected
- [ ] Component factory opportunities found
- [ ] Hook decomposition needs identified
- [ ] Configuration extraction opportunities found
- [ ] Performance optimization needs detected
- [ ] Bundle size optimization opportunities found

---
*Pattern Recognition v1.0 | Automated Refactoring Detection*