# 🏗️ SISO Internal Architecture Best Practices

*Preventing Complexity Drift and Maintaining Clean Architecture*

## 🎯 **Core Architectural Principles**

### **1. Feature Domain Boundaries**
```
✅ GOOD: Keep related functionality together
/ecosystem/internal/lifelock/
  ├── components/          # LifeLock-specific components
  ├── hooks/              # LifeLock-specific hooks  
  ├── services/           # LifeLock business logic
  └── types/              # LifeLock type definitions

❌ BAD: Scatter functionality across architecture layers
/shared/hooks/useLifeLockTasks.ts       # Feature in shared
/refactored/LifeLockService.ts         # Service in refactored
/components/lifelock/TaskCard.tsx      # Component in global
```

### **2. Import Distance Rule**
```typescript
✅ GOOD: Short, local imports
import { TaskCard } from './components/TaskCard';
import { useTaskData } from '../hooks/useTaskData';

❌ BAD: Deep directory traversal
import { TaskCard } from '../../../shared/components/tasks/TaskCard';
import { TaskService } from '../../../../services/database/tasks/TaskService';
```

### **3. Service Consolidation Pattern**
```typescript
✅ GOOD: Direct, simple operations
const { data, error } = await supabase
  .from('tasks')
  .insert({ title, description, user_id });

❌ BAD: Over-abstracted service layers
const taskRegistry = TaskServiceRegistry.getInstance();
const taskService = taskRegistry.getService('lifelock');
const result = await taskService.createTaskWithValidation(taskData);
```

### **4. Hook Composition Strategy**
```typescript
✅ GOOD: Comprehensive hooks per domain
const useLifeLockTasks = () => {
  // All LifeLock task operations in one place
  const fetchTasks = () => { /* ... */ };
  const createTask = () => { /* ... */ };
  const updateTask = () => { /* ... */ };
  return { fetchTasks, createTask, updateTask };
};

❌ BAD: Micro-hooks everywhere
const useTaskCRUD = () => { /* minimal functionality */ };
const useTaskState = () => { /* more minimal functionality */ };
const useTaskValidation = () => { /* even more minimal */ };
const useTaskMetadata = () => { /* why does this exist? */ };
```

## 🚫 **Forbidden Patterns - Never Do These**

### **1. Features in `/shared/`**
```typescript
❌ NEVER: Feature-specific code in shared
/shared/services/LifeLockService.ts    # This is a FEATURE, not shared utility
/shared/hooks/useAdminTasks.ts         # This is ADMIN-specific, not shared
/shared/components/TaskBoard.ts        # This is task-specific, not shared

✅ INSTEAD: True shared utilities only
/shared/utils/formatDate.ts           # Generic date formatting
/shared/constants/api.ts              # API configuration constants  
/shared/types/database.ts             # Database type definitions
```

### **2. Permanent `/refactored/` Directories**
```
❌ NEVER: "Refactored" as permanent structure
/refactored/components/               # This becomes technical debt
/refactored/services/                # Temporary directories become permanent
/refactored/v2/                      # Version directories indicate confusion

✅ INSTEAD: Proper domain placement
/ecosystem/internal/lifelock/components/  # Component belongs in its domain
/ecosystem/internal/admin/services/       # Service belongs in its domain
```

### **3. Service Registry Patterns**
```typescript
❌ NEVER: Service factories and registries
class TaskServiceRegistry {
  static getInstance() { /* singleton complexity */ }
  getService(type: string) { /* string-based lookup */ }
}

const taskService = ServiceFactory.createTaskService({
  type: 'lifelock',
  config: taskConfig
});

✅ INSTEAD: Direct, simple service calls
import { supabase } from '@/lib/supabase';

const createTask = async (taskData) => {
  return await supabase.from('tasks').insert(taskData);
};
```

### **4. Import Chain Hell**
```typescript
❌ NEVER: Cross-domain import chains
// In LifeLock component importing from Admin domain
import { AdminTaskCard } from '../../admin/components/TaskCard';
import { AdminTaskService } from '../../admin/services/TaskService';

✅ INSTEAD: Keep imports within domain or from true shared
import { TaskCard } from './components/TaskCard';        # Same domain
import { formatDate } from '@/shared/utils/formatDate';  # True shared utility
```

## ✅ **Recommended Patterns - Always Do These**

### **1. Domain-Driven File Organization**
```
/ecosystem/internal/[feature]/
  ├── components/                 # Feature-specific UI components
  │   ├── FeatureCard.tsx        # Main components
  │   └── __tests__/             # Component tests
  ├── hooks/                     # Feature-specific React hooks
  │   ├── useFeatureData.ts      # Comprehensive hook per domain
  │   └── __tests__/             # Hook tests
  ├── services/                  # Feature business logic
  │   ├── FeatureService.ts      # Direct Supabase operations
  │   └── __tests__/             # Service tests
  ├── types/                     # Feature type definitions
  │   └── index.ts               # TypeScript interfaces
  └── index.ts                   # Barrel exports for external use
```

### **2. Progressive Enhancement Pattern**
```typescript
✅ GOOD: Start simple, add complexity only when needed
// Step 1: Direct implementation
const createTask = async (title: string) => {
  return await supabase.from('tasks').insert({ title });
};

// Step 2: Add validation only if needed
const createTask = async (taskData: CreateTaskData) => {
  const validatedData = validateTaskData(taskData);
  return await supabase.from('tasks').insert(validatedData);
};

// Step 3: Add error handling only if needed
const createTask = async (taskData: CreateTaskData) => {
  try {
    const validatedData = validateTaskData(taskData);
    return await supabase.from('tasks').insert(validatedData);
  } catch (error) {
    handleTaskCreationError(error);
    throw error;
  }
};
```

### **3. Component Composition Over Inheritance**
```typescript
✅ GOOD: Flexible component with variants
interface TaskCardProps {
  task: Task;
  variant: 'lifelock' | 'admin' | 'deep' | 'light';
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, variant, onComplete, onEdit }) => {
  const variantStyles = getTaskCardVariantStyles(variant);
  // Single component handles all use cases
};

❌ BAD: Multiple specialized components
const LifeLockTaskCard = () => { /* duplicated logic */ };
const AdminTaskCard = () => { /* slightly different duplicated logic */ };
const DeepWorkTaskCard = () => { /* more duplicated logic */ };
```

### **4. Barrel Export Strategy**
```typescript
✅ GOOD: Clean barrel exports for external usage
// /ecosystem/internal/lifelock/index.ts
export { LifeLockDashboard } from './components/LifeLockDashboard';
export { useLifeLockTasks } from './hooks/useLifeLockTasks';
export { LifeLockService } from './services/LifeLockService';
export type { LifeLockTask, LifeLockConfig } from './types';

// External usage
import { LifeLockDashboard, useLifeLockTasks } from '@/ecosystem/internal/lifelock';
```

## 🔍 **Code Review Checklist**

Before merging any code, verify:

### **Architecture Compliance**
- [ ] New code is in the correct domain directory
- [ ] No feature-specific code added to `/shared/` or `/refactored/`
- [ ] Import statements are local or from true shared utilities
- [ ] No new service registries or factories created

### **Complexity Prevention**  
- [ ] New functionality uses existing patterns rather than creating new ones
- [ ] Hook count per feature remains reasonable (1-3 comprehensive hooks)
- [ ] Component count per feature stays focused
- [ ] No unnecessary abstractions introduced

### **Future Maintainability**
- [ ] Code follows established naming conventions
- [ ] TypeScript types are properly defined and exported
- [ ] Tests cover new functionality
- [ ] Documentation updated if architectural decisions made

## 🚀 **Migration Strategy for Existing Anti-Patterns**

When you encounter existing bad patterns during development:

### **1. Don't Make It Worse**
```typescript
❌ DON'T: Copy existing bad patterns
// Seeing this existing pattern
import { useTaskCRUD } from '@/shared/hooks/useTaskCRUD';

// And copying it for new feature
import { useProjectCRUD } from '@/shared/hooks/useProjectCRUD';  # Making it worse

✅ DO: Use simple direct approach for new code
const createProject = async (projectData) => {
  return await supabase.from('projects').insert(projectData);
};
```

### **2. Gradual Improvement**
When fixing bugs in areas with bad architecture:
1. **Fix the bug** using existing patterns (don't break things)
2. **Note the technical debt** for future simplification
3. **Don't add new complexity** while fixing

### **3. Reference Implementation**
Look for examples of clean patterns in the codebase before adding new functionality:
- Find similar working functionality
- Copy the simplest successful pattern
- Avoid copying complex or problematic patterns

## 📊 **Architecture Health Metrics**

Track these metrics to prevent architectural drift:

### **Complexity Indicators**
- **Directory Count**: Aim for <15 total directories in src/
- **Import Depth**: No imports >2 directory levels deep
- **File per Feature**: <10 files per feature domain
- **Hook Count**: <3 hooks per feature domain

### **Quality Indicators**
- **Direct Dependencies**: Prefer direct Supabase calls over service layers
- **Code Duplication**: <10% duplication across similar functionality
- **Component Reuse**: Single components with variants > multiple specialized components

---

*These practices prevent the architectural complexity that creates maintenance burden and slows development.*