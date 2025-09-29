# BMAD Implementation Plan: Task Reordering & Priority System

## 🎯 Executive Summary

**Feature**: Drag-and-drop task reordering with enhanced priority system for Light Work and Deep Work sections.

**Goal**: Allow users to manually reorder tasks and subtasks via drag-and-drop, plus add a priority dropdown (High, Medium, Low, None) alongside the existing due date system.

**Approach**: Use BMAD method to plan implementation without actually building yet, ensuring proper architecture and avoiding technical debt.

---

## 📋 Current State Analysis

### Existing Components
1. **LightFocusWorkSection** (`src/ecosystem/internal/lifelock/sections/LightFocusWorkSection.tsx`)
   - ✅ Has tasks with subtasks
   - ❌ Uses AI priority ranking (1-5) - **REMOVE THIS**
   - ✅ Uses local state management
   - ❌ No drag-and-drop reordering
   - ❌ No priority dropdown UI

2. **DeepFocusWorkSection** (`src/ecosystem/internal/lifelock/sections/DeepFocusWorkSection.tsx`)
   - ✅ Has SharedTaskCard component
   - ✅ Uses priority system (high/medium/low) - **NEEDS STANDARDIZATION**
   - ✅ Connected to real tasks via hooks
   - ❌ No drag-and-drop reordering
   - ❌ No manual priority editing

3. **SharedTaskCard** (`src/components/ui/SharedTaskCard.tsx`)
   - ✅ Unified task rendering
   - ✅ Priority badges
   - ✅ Theme support (deep-work/light-work)
   - ❌ No drag-and-drop support
   - ❌ No inline priority editing

### Current Priority System **[UPDATED]**
- **Current System**: `CRITICAL | HIGH | MEDIUM | LOW | BACKLOG` (from taskConstants.ts)
- **New Standard**: `ULTRA | HIGH | MEDIUM | LOW | NONE` (renamed to be user-friendly)
- **AI Ranking**: **REMOVE** - use manual priority selection only
- **Display**: Badge components with color coding (reuse existing patterns)
- **Storage**: Database field `priority: TaskPriority`

### Existing UI Components **[LEVERAGE THESE]**
- **Select Component**: `src/shared/ui/select.tsx` (Radix-based)
- **Badge Component**: Used throughout for priority display  
- **TASK_PRIORITY_CONFIG**: Complete configuration with colors, icons, weights
- **AdminTaskDetailModal**: Already has working priority dropdown pattern

### Current Drag-and-Drop Infrastructure **[REUSE PATTERNS]**
- **Hook**: `useTaskDragDrop.ts` exists but focused on time-based calendar drops
- **Framer Motion**: Used extensively (`motion.div` with drag="x" in MobileSwipeCard)
- **Pattern**: HTML5 drag events with custom ghost elements
- **Mobile Support**: Touch gestures already implemented (MobileSwipeCard.tsx)
- **Visual Feedback**: Existing drag guidelines and animations

---

## 🏗️ Implementation Architecture

### Phase 1: Data Model Extensions **[MINIMAL CHANGES]**
```typescript
// Update priority type to new 5-level system
type TaskPriority = 'ultra' | 'high' | 'medium' | 'low' | 'none';

// Task interface already exists - just add optional ordering field
interface Task {
  priority: TaskPriority;  // Update existing field
  sort_order?: number;     // NEW: For manual ordering within lists
}

// Light Work local state extension:
interface Task {
  priority: 'ultra' | 'high' | 'medium' | 'low' | 'none';  
  sortOrder?: number;                             
}

interface Subtask {
  priority?: 'ultra' | 'high' | 'medium' | 'low' | 'none'; // NEW
  sortOrder?: number;                                       // NEW
}
```typescript
// No schema changes needed - existing priority field sufficient
// Task interface already has:
interface Task {
  priority: TaskPriority;  // 'low' | 'medium' | 'high' | 'urgent'
  // Add optional ordering field
  sort_order?: number;     // For manual ordering within lists
}

// Light Work local state extension:
interface Task {
  priority: 'high' | 'medium' | 'low' | 'none';  // Normalize to 4 values
  sortOrder?: number;                             // Manual ordering
}

interface Subtask {
  priority?: 'high' | 'medium' | 'low' | 'none'; // Add to subtasks
  sortOrder?: number;                             // Manual ordering
}
```

### Phase 2: Drag-and-Drop Architecture

#### Core Hook: `useTaskReordering`
```typescript
interface UseTaskReorderingProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onReorder?: (taskId: string, newIndex: number) => void;
  onSubtaskReorder?: (taskId: string, subtaskId: string, newIndex: number) => void;
}

interface UseTaskReorderingReturn {
  isDragging: boolean;
  draggedItem: { type: 'task' | 'subtask'; id: string } | null;
  
  // Task reordering
  handleTaskDragStart: (e: DragEvent, taskId: string) => void;
  handleTaskDragOver: (e: DragEvent, targetIndex: number) => void;
  handleTaskDrop: (e: DragEvent, targetIndex: number) => void;
  
  // Subtask reordering
  handleSubtaskDragStart: (e: DragEvent, taskId: string, subtaskId: string) => void;
  handleSubtaskDragOver: (e: DragEvent, taskId: string, targetIndex: number) => void;
  handleSubtaskDrop: (e: DragEvent, taskId: string, targetIndex: number) => void;
  
  // Visual feedback
  getTaskDropZoneProps: (index: number) => object;
  getSubtaskDropZoneProps: (taskId: string, index: number) => object;
}
```

#### Drag Visual Feedback
- **Drag Ghost**: Semi-transparent version of task card
- **Drop Zones**: Highlighted areas between tasks/subtasks
- **Visual Indicator**: Blue line showing drop position
- **Smooth Animations**: Framer Motion for reordering transitions

### Phase 3: Priority Dropdown Component

#### Component: `PrioritySelector` **[COPY EXISTING PATTERN]**
```typescript
interface PrioritySelectorProps {
  value: 'ultra' | 'high' | 'medium' | 'low' | 'none';
  onChange: (priority: 'ultra' | 'high' | 'medium' | 'low' | 'none') => void;
  size?: 'sm' | 'md';
  theme?: 'light-work' | 'deep-work';
  showNone?: boolean;
}

// COPY from AdminTaskDetailModal.tsx pattern:
<Select value={priority} onValueChange={onChange}>
  <SelectTrigger className="bg-gray-800/80 border border-gray-500/50">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="ultra">Ultra</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="none">None</SelectItem>
  </SelectContent>
</Select>

// Visual design:
// [Due Date ↓] [Priority: Ultra ↓]
//              ├─ Ultra (red) 🔥
//              ├─ High (orange) 🔴  
//              ├─ Medium (yellow) 🟡
//              ├─ Low (blue) 🟢
//              └─ None (gray) ⚪
```

#### Integration Pattern **[REUSE TASK_PRIORITY_CONFIG]**
- **Light Work**: Add next to time estimate (replace AI ranking display)
- **Deep Work**: Add to SharedTaskCard metadata row
- **Consistent Styling**: Use existing TASK_PRIORITY_CONFIG colors and icons
- **Color Coding**: Reuse existing priority configuration system

### Phase 4: Component Integration Strategy

#### Light Work Integration
```typescript
// Update LightFocusWorkSection.tsx
const [tasks, setTasks] = useState<Task[]>([...]);

const reorderingHook = useTaskReordering({
  tasks,
  setTasks,
  onReorder: (taskId, newIndex) => {
    // Reorder tasks array
    // Update sortOrder values
    // Persist to localStorage/API
  },
  onSubtaskReorder: (taskId, subtaskId, newIndex) => {
    // Reorder subtasks within task
    // Update sortOrder values
    // Persist changes
  }
});

// Add drag handles to task cards
// Add priority dropdowns
// Add drop zones between items
```

#### Deep Work Integration
```typescript
// Update SharedTaskCard.tsx
interface SharedTaskCardProps {
  // ... existing props
  isDraggable?: boolean;
  onDragStart?: (taskId: string) => void;
  onPriorityChange?: (taskId: string, priority: string) => void;
  showPriorityEditor?: boolean;
}

// Add drag handle (⋮⋮ icon)
// Add priority dropdown
// Add drag/drop event handlers
```

---

## 🎨 User Experience Design

### Drag-and-Drop Behavior
1. **Drag Handle**: Six-dot icon (⋮⋮) on hover/touch
2. **Visual Feedback**: 
   - Dragged item becomes 70% opacity
   - Drop zones show blue highlight
   - Smooth animations for reordering
3. **Mobile Support**: Touch events for mobile drag-and-drop
4. **Accessibility**: Keyboard navigation for reordering

### Priority Dropdown UX
1. **Location**: Next to due date callout
2. **Visual**: `[Priority: High ↓]` button style
3. **States**: 
   - High: Red background, white text
   - Medium: Yellow background, black text  
   - Low: Blue background, white text
   - None: Gray background, white text
4. **Integration**: Updates immediately, auto-saves

### Mobile Considerations
- **Touch Targets**: Minimum 44px touch targets
- **Gesture Support**: Long press to initiate drag
- **Visual Feedback**: Enhanced for touch interactions
- **Performance**: Smooth 60fps animations

---

## 🔧 Rapid Implementation Code Details

### **1. Update Priority Constants (15 mins)**
```typescript
// src/ecosystem/internal/tasks/constants/taskConstants.ts
export const TASK_PRIORITY_CONFIG = {
  ultra: {
    label: 'Ultra',
    bgColor: 'bg-red-600',
    textColor: 'text-white', 
    icon: '🔥',
    order: 1,
    weight: 5
  },
  high: {
    label: 'High', 
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    icon: '🔴',
    order: 2,
    weight: 4
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-yellow-500', 
    textColor: 'text-white',
    icon: '🟡',
    order: 3,
    weight: 3
  },
  low: {
    label: 'Low',
    bgColor: 'bg-blue-500',
    textColor: 'text-white', 
    icon: '🟢',
    order: 4,
    weight: 2
  },
  none: {
    label: 'None',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    icon: '⚪',
    order: 5,
    weight: 1
  }
} as const;
```

### **2. PrioritySelector Component (30 mins)**
```typescript
// src/ecosystem/internal/tasks/components/PrioritySelector.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { TASK_PRIORITY_CONFIG } from '../constants/taskConstants';

interface PrioritySelectorProps {
  value: keyof typeof TASK_PRIORITY_CONFIG;
  onChange: (priority: keyof typeof TASK_PRIORITY_CONFIG) => void;
  size?: 'sm' | 'md';
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ 
  value, 
  onChange, 
  size = 'sm' 
}) => {
  const config = TASK_PRIORITY_CONFIG[value];
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${
        size === 'sm' ? 'h-6 text-xs px-2' : 'h-8 text-sm px-3'
      } ${config.bgColor} ${config.textColor} border-0 font-medium rounded-full`}>
        <SelectValue>
          <span className="flex items-center gap-1">
            {config.icon} {config.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
          <SelectItem key={key} value={key}>
            <span className="flex items-center gap-2">
              {cfg.icon} {cfg.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### **3. Simple Drag-and-Drop Hook (45 mins)**
```typescript
// src/ecosystem/internal/tasks/hooks/useTaskReordering.ts
import { useState } from 'react';

export function useTaskReordering<T extends { id: string; sortOrder?: number }>(
  items: T[],
  setItems: (items: T[]) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: T) => {
    setIsDragging(true);
    setDraggedId(item.id);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    
    const draggedIndex = items.findIndex(item => item.id === draggedId);
    if (draggedIndex === -1) return;

    const reorderedItems = [...items];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);
    
    // Update sort order
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      sortOrder: index
    }));
    
    setItems(updatedItems);
    setIsDragging(false);
    setDraggedId(null);
  };

  return {
    isDragging,
    draggedId,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
}
```

### **4. Integration Examples (30 mins each)**

**Light Work Section:**
```typescript
// Add to LightFocusWorkSection.tsx
import { PrioritySelector } from '../components/PrioritySelector';
import { useTaskReordering } from '../hooks/useTaskReordering';

// Replace AI ranking with manual priority
const reordering = useTaskReordering(tasks, setTasks);

// Add drag handle and priority selector to task cards
<div className="flex items-center gap-3">
  <button
    draggable
    onDragStart={(e) => reordering.handleDragStart(e, task)}
    className="cursor-move text-gray-400 hover:text-gray-300"
  >
    ⋮⋮
  </button>
  
  <PrioritySelector 
    value={task.priority || 'medium'}
    onChange={(priority) => updateTaskPriority(task.id, priority)}
    size="sm"
  />
</div>
```

**Deep Work Section:**
```typescript
// Update SharedTaskCard.tsx
<div className="flex items-center space-x-3 mt-1">
  <PrioritySelector 
    value={task.priority}
    onChange={(priority) => onPriorityChange?.(task.id, priority)}
    size="sm"
  />
  <span className="text-xs text-gray-400">
    {task.estimatedTime}
  </span>
</div>
```

### **Performance Strategy**
- **Leverage Existing**: Reuse all existing UI patterns and configurations
- **Minimal Changes**: No database schema changes needed
- **Copy Patterns**: Don't reinvent - copy working code from AdminTaskDetailModal
- **Local State**: Light Work uses local state, Deep Work uses existing hooks

---

## 🧪 Testing Strategy

### Unit Tests
- `useTaskReordering` hook logic
- Priority dropdown component
- Reordering utility functions
- Edge cases (empty lists, single items)

### Integration Tests
- Drag-and-drop in Light Work section
- Priority changes in Deep Work section
- Cross-component consistency
- Mobile touch interactions

### Manual Testing Checklist
- [ ] Drag tasks up/down in Light Work
- [ ] Drag subtasks within tasks
- [ ] Priority dropdown functionality
- [ ] Mobile drag-and-drop
- [ ] Keyboard accessibility
- [ ] Error scenarios (network failures)
- [ ] Performance with 50+ tasks

---

## 📊 Data Migration & Compatibility

### Existing Data
- ✅ No breaking changes to database schema
- ✅ `priority` field already exists in Task interface
- ✅ Backward compatibility maintained

### Migration Strategy
1. **Phase 1**: Add `sort_order` field (optional)
2. **Phase 2**: Populate sort_order from creation timestamp
3. **Phase 3**: Enable manual reordering
4. **Phase 4**: Add subtask priorities

### Fallback Behavior
- **No sort_order**: Fall back to creation timestamp ordering
- **Invalid priorities**: Default to 'medium' priority
- **Drag failure**: Show error toast, revert to original order

---

## 🚀 Rapid Implementation Plan **[REALISTIC TIMELINE]**

Based on code analysis, this can be implemented much faster by leveraging existing patterns:

### **Phase 1: Priority System Update (1-2 hours)**
- [ ] Update `taskConstants.ts` to add ULTRA and NONE priorities
- [ ] Create `PrioritySelector.tsx` by copying AdminTaskDetailModal pattern
- [ ] Remove AI priority ranking from LightFocusWorkSection
- [ ] Add manual priority dropdowns to both sections

### **Phase 2: Drag-and-Drop Core (2-3 hours)**  
- [ ] Create `useTaskReordering.ts` by adapting existing useTaskDragDrop
- [ ] Build simple `DragHandle.tsx` component (⋮⋮ icon)
- [ ] Add drop zone styling and visual feedback
- [ ] Copy Framer Motion patterns from MobileSwipeCard

### **Phase 3: Light Work Integration (1-2 hours)**
- [ ] Add drag handles to LightFocusWorkSection task cards
- [ ] Implement task and subtask reordering with local state
- [ ] Add priority selectors next to time estimates
- [ ] Test basic functionality

### **Phase 4: Deep Work Integration (1 hour)**
- [ ] Update SharedTaskCard to support drag-and-drop
- [ ] Add priority selector to task metadata
- [ ] Connect to existing Supabase hooks
- [ ] Ensure theme consistency

### **Phase 5: Polish & Testing (1-2 hours)**
- [ ] Mobile touch event testing
- [ ] Visual feedback improvements  
- [ ] Error handling
- [ ] Performance check

**Total Realistic Timeline: 6-10 hours (1-2 days max)**

---

## 🔍 Risk Assessment

### Technical Risks
- **Performance**: Large lists (100+ items) may lag during drag operations
- **Mobile**: Touch events can conflict with scroll gestures
- **State Sync**: Race conditions between local and remote state

### Mitigation Strategies
- **Performance**: Virtual scrolling, debounced updates
- **Mobile**: Custom touch gesture detection
- **State Sync**: Optimistic updates with rollback

### Success Metrics
- ✅ Drag-and-drop works smoothly (< 100ms response)
- ✅ Priority changes persist correctly (100% accuracy)
- ✅ Mobile experience matches desktop (feature parity)
- ✅ No performance regression (current speeds maintained)

---

## 🎯 Future Enhancements

### Potential Additions
1. **Smart Reordering**: AI-suggested task ordering
2. **Batch Operations**: Multi-select and bulk priority changes
3. **Custom Priorities**: User-defined priority levels
4. **Priority Automation**: Auto-priority based on due dates
5. **Dependency Ordering**: Task dependencies affect ordering

### Integration Opportunities
- **Calendar Integration**: Priority affects time block allocation
- **Team Features**: Shared priority standards
- **Analytics**: Priority completion patterns
- **Notifications**: Priority-based alerting

---

## 📝 Documentation Requirements

### Developer Documentation
- API reference for new hooks
- Component integration examples
- Migration guide for existing code
- Performance best practices

### User Documentation
- Feature announcement
- How-to guides for reordering
- Priority system explanation
- Mobile usage tips

---

*This BMAD implementation plan provides a complete roadmap for implementing task reordering and priority management without requiring immediate development. All architectural decisions are documented and ready for future implementation.*