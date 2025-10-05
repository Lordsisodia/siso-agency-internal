# 📌 Task Persistence System - Sticky Tasks Till Complete

**Priority**: 🟡 High  
**Status**: ✅ Root Cause Identified, Solution Ready  
**Impact**: Task continuity, user workflow, productivity tracking  
**Estimated Fix Time**: 3-4 hours  

## 🔍 **Issue Description**

Light work and deep work tasks should be "sticky" until complete - meaning incomplete tasks should automatically carry over to new days instead of disappearing. Users currently lose track of unfinished tasks when switching days.

## 📂 **Current State Analysis**

### **Existing Infrastructure** (Partially Implemented)

**Database Schema** ✅ **Ready**:
```prisma
model PersonalTask {
  currentDate   String  // Current day task appears on
  originalDate  String  // Original day task was created
  rollovers     Int     // How many times task has been rolled over
  completed     Boolean
}
```

**API Functionality** ✅ **Exists**:
```typescript
// In api-client.ts
async pushTaskToAnotherDay(taskId: string, pushedToDate?: string)

// In useTaskDatabase.ts  
const pushTaskToAnotherDay = useCallback(async (taskId: string, pushedToDate?: string) => {
  await apiClient.pushTaskToAnotherDay(taskId, pushedToDate);
  await loadTasks(); // Reload to show updated data
}, [loadTasks, user?.id]);
```

**UI Integration** ✅ **Working**:
```tsx
// In LightFocusWorkSection.tsx - Line 100
const tasks = allTasks.sort((a, b) => {
  if (a.isPushed && !b.isPushed) return 1;    // Pushed tasks at bottom  
  if (!a.isPushed && b.isPushed) return -1;   // Regular tasks at top
  return 0;
});

// Shows pushed tasks with visual indicator
isPushed: task.currentDate !== task.originalDate && task.rollovers > 0
```

### **The Gap**: No Automatic Rollover System

**Problem**: Tasks don't automatically roll over - users must manually push tasks to next day  
**Missing**: Daily rollover process that runs automatically

## 🎯 **User Experience Requirements**

### **Expected "Sticky" Behavior**:
1. **End of Day**: User goes to bed with 3 incomplete tasks
2. **Next Day**: Those 3 tasks automatically appear on new day
3. **Visual Distinction**: Carried-over tasks look different (marked as "rolled over")
4. **Task Tracking**: Tasks show original date + rollover count
5. **Completion**: Once completed, task stays completed and doesn't roll over again

### **Current Broken Experience**:
- ❌ Tasks disappear when switching days  
- ❌ Users lose track of unfinished work
- ❌ No continuity in daily workflow
- ❌ Manual task pushing only (not automatic)

## ✅ **Complete Solution Architecture**

### **Phase 1: Automatic Daily Rollover System** (2 hours)

#### **1.1 Create Daily Rollover API**
**File**: `api/tasks/rollover.ts` (new)

```typescript
// POST /api/tasks/rollover - Run daily rollover for user
export async function POST(request: Request) {
  const { date } = await request.json(); // Target date (today)
  const userId = await getCurrentUserId();
  
  if (!userId || !date) {
    return NextResponse.json({ error: 'Missing user or date' }, { status: 400 });
  }

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  try {
    // Find incomplete tasks from yesterday
    const incompleteTasks = await prisma.personalTask.findMany({
      where: {
        userId,
        currentDate: yesterdayStr,
        completed: false,
        // Only roll over LIGHT and DEEP work (not MORNING routines)
        workType: { in: ['LIGHT', 'DEEP'] }
      },
      include: { subtasks: true }
    });

    let rolledOverCount = 0;

    // Roll over each incomplete task
    for (const task of incompleteTasks) {
      // Check if already rolled over to avoid duplicates
      const existingRollover = await prisma.personalTask.findFirst({
        where: {
          userId,
          title: task.title,
          currentDate: date,
          originalDate: task.originalDate
        }
      });

      if (!existingRollover) {
        // Roll over main task
        await prisma.personalTask.update({
          where: { id: task.id },
          data: {
            currentDate: date,
            rollovers: task.rollovers + 1,
            updatedAt: new Date()
          }
        });

        // Roll over incomplete subtasks
        for (const subtask of task.subtasks) {
          if (!subtask.completed) {
            await prisma.personalSubtask.update({
              where: { id: subtask.id },
              data: {
                currentDate: date,
                rollovers: subtask.rollovers + 1,
                updatedAt: new Date()
              }
            });
          }
        }

        rolledOverCount++;
      }
    }

    return NextResponse.json({
      success: true,
      rolledOverCount,
      message: `Rolled over ${rolledOverCount} incomplete tasks to ${date}`
    });

  } catch (error) {
    console.error('Rollover failed:', error);
    return NextResponse.json({ error: 'Rollover failed' }, { status: 500 });
  }
}
```

#### **1.2 Add Auto-Rollover Hook**
**File**: `hooks/useAutoRollover.ts` (new)

```typescript
export const useAutoRollover = () => {
  const { user } = useClerkUser();
  const [lastRolloverDate, setLastRolloverDate] = useState<string | null>(null);

  useEffect(() => {
    const performAutoRollover = async () => {
      if (!user?.id) return;

      const today = new Date().toISOString().split('T')[0];
      const storedDate = localStorage.getItem('lastRolloverDate');
      
      // Check if rollover already happened today
      if (storedDate === today) return;

      try {
        console.log('🔄 Performing daily task rollover...');
        
        const response = await fetch('/api/tasks/rollover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today })
        });

        const result = await response.json();
        
        if (result.success) {
          localStorage.setItem('lastRolloverDate', today);
          setLastRolloverDate(today);
          
          if (result.rolledOverCount > 0) {
            console.log(`✅ Rolled over ${result.rolledOverCount} tasks to today`);
            
            // Optional: Show user notification
            // toast.success(`${result.rolledOverCount} incomplete tasks carried over from yesterday`);
          }
        }
      } catch (error) {
        console.error('❌ Auto-rollover failed:', error);
      }
    };

    // Run rollover check when hook mounts and user is available
    performAutoRollover();
    
    // Also check every hour in case user keeps app open across midnight
    const interval = setInterval(performAutoRollover, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  return { lastRolloverDate };
};
```

### **Phase 2: Enhanced UI for Rolled-Over Tasks** (1 hour)

#### **2.1 Update Task Display Components**
**File**: `LightFocusWorkSection.tsx` + `DeepFocusWorkSection.tsx`

```tsx
// Add useAutoRollover to both components
export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  // Trigger auto-rollover
  useAutoRollover();
  
  // Rest of existing code...
  
  // Enhanced visual indicators for rolled-over tasks
  const TaskCard = ({ task }) => (
    <div className={`
      p-4 rounded-lg border transition-all duration-200
      ${task.completed 
        ? 'bg-green-900/20 border-green-700/50 text-green-100' 
        : task.isPushed
          ? 'bg-amber-900/20 border-amber-700/50 text-amber-100 hover:border-amber-600/50'
          : 'bg-gray-800/50 border-gray-700/50 text-gray-100'
      }
    `}>
      
      {/* Rollover indicator */}
      {task.isPushed && (
        <div className="flex items-center gap-2 mb-2 text-xs text-amber-400">
          <ArrowRight className="h-3 w-3" />
          <span>
            Carried over from {format(new Date(task.originalDate), 'MMM dd')}
            {task.rollovers > 1 && ` (${task.rollovers}x)`}
          </span>
        </div>
      )}
      
      {/* Rest of task UI */}
    </div>
  );
};
```

#### **2.2 Add Rollover Statistics**
```tsx
// In session stats section
const getRolloverStats = () => {
  const rolledOverTasks = tasks.filter(t => t.isPushed);
  return {
    count: rolledOverTasks.length,
    totalRollovers: rolledOverTasks.reduce((sum, t) => sum + (t.rollovers || 0), 0)
  };
};

// Display in UI
const { count: rolledOverCount, totalRollovers } = getRolloverStats();

{rolledOverCount > 0 && (
  <div className="text-sm text-amber-400 mb-4">
    📅 {rolledOverCount} task{rolledOverCount !== 1 ? 's' : ''} carried over from previous days
    {totalRollovers > rolledOverCount && ` (${totalRollovers} total rollovers)`}
  </div>
)}
```

### **Phase 3: Advanced Rollover Features** (1 hour)

#### **3.1 Smart Rollover Rules**
```typescript
// In rollover API - add intelligent rules
const shouldRollOverTask = (task: any): boolean => {
  // Don't roll over tasks older than 7 days (prevent endless accumulation)
  const originalDate = new Date(task.originalDate);
  const daysSinceOriginal = Math.floor((Date.now() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceOriginal > 7) {
    console.log(`🚫 Not rolling over task "${task.title}" - too old (${daysSinceOriginal} days)`);
    return false;
  }
  
  // Don't roll over tasks that have been rolled over too many times
  if (task.rollovers >= 5) {
    console.log(`🚫 Not rolling over task "${task.title}" - too many rollovers (${task.rollovers})`);
    return false;
  }
  
  return true;
};
```

#### **3.2 Manual Rollover Control**
```tsx
// Add user controls for rollover behavior
const RolloverControls = ({ task }) => (
  <div className="flex gap-2 text-xs">
    {task.isPushed && (
      <>
        <button 
          onClick={() => markTaskAsStale(task.id)}
          className="text-gray-400 hover:text-red-400"
          title="Mark as no longer relevant"
        >
          ❌ Archive
        </button>
        <button
          onClick={() => resetTaskToOriginalDate(task.id)}
          className="text-gray-400 hover:text-blue-400"
          title="Move back to original date"
        >
          ↩️ Reset Date
        </button>
      </>
    )}
  </div>
);
```

## 📊 **User Experience Flow**

### **Day 1 (Tuesday)**:
```
User creates 3 tasks:
- ✅ "Review email" (completed)
- ❌ "Write report" (incomplete)  
- ❌ "Call client" (incomplete)
```

### **Day 2 (Wednesday) - Auto-Rollover**:
```
🔄 System automatically rolls over incomplete tasks:
- ✅ "Review email" (stays on Tuesday - completed)
- 📅 "Write report" (appears on Wednesday, marked as rolled over)
- 📅 "Call client" (appears on Wednesday, marked as rolled over)

User sees: "2 tasks carried over from previous days"
```

### **Day 3 (Thursday)**:
```
- ✅ "Write report" (completed on Wednesday)
- 📅 "Call client" (rolls over again to Thursday, shows "2x rollovers")
```

## 🔧 **Implementation Files**

### **New Files**:
1. `api/tasks/rollover.ts` - Daily rollover API endpoint
2. `hooks/useAutoRollover.ts` - Automatic rollover trigger
3. `components/RolloverIndicator.tsx` - Visual indicators for rolled tasks

### **Modified Files**:
1. `LightFocusWorkSection.tsx` - Add auto-rollover hook and UI enhancements
2. `DeepFocusWorkSection.tsx` - Same rollover integration
3. Database schema (if needed) - Already supports rollovers

## 📊 **Success Metrics**

- [ ] ✅ **Zero Task Loss**: Incomplete tasks never disappear between days
- [ ] ✅ **Automatic Rollover**: No manual intervention required  
- [ ] ✅ **Visual Continuity**: Users clearly see carried-over tasks
- [ ] ✅ **Progress Tracking**: Rollover count shows task age/urgency
- [ ] ✅ **Smart Rules**: Old/excessive rollovers handled intelligently
- [ ] ✅ **User Control**: Manual archive/reset options available
- [ ] ✅ **Performance**: Rollover completes under 2 seconds
- [ ] ✅ **Cross-Platform**: Works on mobile and desktop

## 🔗 **Related Issues**

**Fixes Directly**:
- **Issue #12**: Task Persistence System (this issue)
- **Issue #10**: Daily Reset Bug (rollover logic prevents loss)

**Connects To**:
- **Issue #0**: Database Mock Client (must be fixed first)
- **Issue #4**: Checkout Data Persistence (same persistence patterns)
- **Issue #13**: Time Boxing Integration (rolled tasks need scheduling)

## ⚡ **Ready for Implementation**

This solution provides:
- ✅ **Complete technical specification** with code examples
- ✅ **Automatic daily rollover** system  
- ✅ **Enhanced UI** for task continuity
- ✅ **Smart rollover rules** to prevent chaos
- ✅ **User control** over rollover behavior
- ✅ **Cross-component integration** (light + deep work)

**Dependency**: Requires Database Mock Client fix (Issue #0) first.

**User Impact**: Transforms task management from "losing work daily" to "seamless task continuity across days" - a major productivity improvement! 🚀