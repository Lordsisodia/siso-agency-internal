# ⏰ Timebox Section

> **Last updated:** 2025-10-16  
> **Status summary:** ✅ Timeboxing workflow is fully implemented with cross-section integrations.

## Overview

The Timebox section provides a visual timeline interface for scheduling and managing daily tasks. It enables users to allocate specific time blocks for different activities, ensuring balanced time management throughout the day.

## Purpose & Philosophy

Timeboxing is the practice of fixing a time period to work on a task. This section implements this concept by providing a drag-and-drop timeline where tasks can be scheduled, rescheduled, and tracked throughout the day.

## Feature Implementation Status

| Feature | Status | Component |
| --- | --- | --- |
| Visual Timeline Interface | ✅ Live | [`TimeboxSection.tsx`](/src/domains/lifelock/1-daily/6-timebox/TimeboxSection.tsx) |
| Task Scheduling | ✅ Live | [`TimeboxSection.tsx`](/src/domains/lifelock/1-daily/6-timebox/TimeboxSection.tsx) |
| Quick Task Scheduler | ✅ Live | [`QuickTaskScheduler.tsx`](/src/domains/tasks/components/QuickTaskScheduler.tsx) |
| Time Block Management | ✅ Live | [`TimeBlockFormModal.tsx`](/src/domains/tasks/components/TimeBlockFormModal.tsx) |
| Category-Based Organization | ✅ Live | [`categoryMapper.ts`](/src/domains/lifelock/1-daily/6-timebox/utils/categoryMapper.ts) |

## Core Features

### 1. Visual Timeline Interface
- **Purpose**: Display 24-hour timeline with scheduled tasks
- **Features**:
  - Full day view (12 AM - 11 PM)
  - Hourly time slots
  - Current time indicator
  - Smooth scrolling to current time
- **Implementation**: `TimeboxSection.tsx`

### 2. Task Scheduling
- **Purpose**: Schedule tasks at specific times
- **Features**:
  - Drag-and-drop task positioning
  - Time block creation
  - Task duration adjustment
  - Conflict detection
- **Implementation**: Integrated in main section

### 3. Quick Task Scheduler
- **Purpose**: Quickly add tasks from other sections
- **Features**:
  - Integration with Light Work tasks
  - Integration with Deep Work tasks
  - One-click scheduling
  - Smart time suggestions
- **Implementation**: `QuickTaskScheduler` (imported)

### 4. Time Block Management
- **Purpose**: Create and manage time blocks
- **Features**:
  - Time block creation modal
  - Category selection
  - Duration setting
  - Description and notes
- **Implementation**: `TimeBlockFormModal` (imported)

### 5. Category-Based Organization
- **Purpose**: Organize tasks by type
- **Features**:
  - Color-coded categories
  - Morning, Deep Work, Light Work, Wellness, Admin
  - Visual differentiation
  - Category-based filtering
- **Implementation**: Integrated styling system

## Component Architecture

### Main Component
- **File**: `TimeboxSection.tsx`
- **Lines**: 1,009
- **Responsibilities**: Timeline rendering, task scheduling, drag-and-drop functionality

### Supporting Components
- **categoryMapper.ts** (70 lines)
  - Database to UI category mapping
  - Color scheme management
  - Category validation

### External Components Used
- `TimeBlockFormModal` - Time block creation/editing
- `QuickTaskScheduler` - Task scheduling from other sections
- `AnimatedDateHeader` - Date navigation

## Data Management

### Supabase Integration
```typescript
const {
  timeBlocks,
  isLoading,
  isCreating,
  isUpdating,
  error,
  conflicts,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  toggleCompletion,
  checkConflicts,
  clearError
} = useTimeBlocks({
  userId: internalUserId,
  selectedDate,
  enableOptimisticUpdates: true
});
```

### Data Structure
```typescript
interface TimeBlock {
  id: string;
  userId: string;
  date: string;
  startTime: string; // "09:30" format
  endTime: string;   // "11:00" format
  title: string;
  description?: string;
  category: TimeBlockCategory;
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Mapping
```typescript
enum TimeBlockCategory {
  DEEP_WORK = 'DEEP_WORK',
  LIGHT_WORK = 'LIGHT_WORK',
  MEETING = 'MEETING',
  BREAK = 'BREAK',
  PERSONAL = 'PERSONAL',
  HEALTH = 'HEALTH',
  LEARNING = 'LEARNING',
  ADMIN = 'ADMIN'
}

// UI Categories
type UICategory = 'morning' | 'deep-work' | 'light-work' | 'wellness' | 'admin';
```

## Timeline Interface

### Visual Design
- **24-hour timeline**: Full day coverage
- **80px per hour**: Optimized spacing
- **Current time indicator**: Animated blue line
- **Time sidebar**: Hour labels with current hour highlight

### Task Blocks
- **Dynamic sizing**: Proportional to duration
- **Color coding**: Category-specific gradients
- **Drag-and-drop**: Reposition with constraints
- **Visual feedback**: Hover and selection states

### Category Styling
```typescript
const getCategoryStyles = (category: UICategory, completed: boolean) => {
  const styles = {
    morning: {
      border: "border-amber-400/80",
      gradient: "from-amber-400/90 via-orange-500/80 to-yellow-500/70"
    },
    'deep-work': {
      border: "border-blue-500/80",
      gradient: "from-blue-600/90 via-indigo-600/80 to-purple-600/80"
    },
    'light-work': {
      border: "border-emerald-400/80",
      gradient: "from-emerald-500/90 via-green-500/80 to-teal-500/70"
    },
    wellness: {
      border: "border-teal-500/80",
      gradient: "from-teal-600/90 via-cyan-500/80 to-blue-500/70"
    },
    admin: {
      border: "border-indigo-500/80",
      gradient: "from-indigo-700/90 via-purple-700/80 to-violet-700/70"
    }
  };
  return styles[category] || styles.admin;
};
```

## User Interactions

### Drag-and-Drop
```typescript
const handleDragEnd = useCallback(async (taskId: string, info: any) => {
  const dragDistance = info.offset.y;
  const PIXELS_PER_MINUTE = 80 / 60;
  const minutesMoved = Math.round(dragDistance / PIXELS_PER_MINUTE);

  // Calculate new times
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const [startHour, startMin] = task.startTime.split(':').map(Number);
  const [endHour, endMin] = task.endTime.split(':').map(Number);

  const newStartMinutes = startHour * 60 + startMin + minutesMoved;
  const newEndMinutes = endHour * 60 + endMin + minutesMoved;

  // Validate bounds and update
  if (newStartMinutes >= 0 && newEndMinutes <= 24 * 60) {
    const newStartTime = formatTime(newStartMinutes);
    const newEndTime = formatTime(newEndMinutes);
    await updateTimeBlock(taskId, {
      startTime: newStartTime,
      endTime: newEndTime
    });
  }
}, [tasks, updateTimeBlock]);
```

### Task Completion
- Checkbox on each task block
- Visual completion overlay
- Progress tracking
- Statistics update

### Time Block Creation
- Modal-based creation flow
- Category selection
- Time duration setting
- Conflict checking

## Integration Points

### Task Management
- Pull tasks from Light Work section
- Pull tasks from Deep Work section
- Schedule unscheduled tasks
- Push tasks to different days

### Calendar Integration
- Date navigation
- Multi-day view
- Recurring events
- Export functionality

### AI Features
- Smart scheduling suggestions
- Conflict resolution
- Time optimization
- Category recommendations

## Performance Optimizations

### Rendering Optimizations
```typescript
// Memoized filtered tasks
const validTasks = useMemo(() => {
  return tasks.filter(task => {
    // Validation and filtering logic
    if (!task || !task.id || !task.startTime || !task.endTime) {
      return false;
    }
    // Time format validation
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(task.startTime) && timePattern.test(task.endTime);
  });
}, [tasks]);
```

### Auto-scroll to Current Time
```typescript
useEffect(() => {
  const timelineContainer = document.querySelector('[data-timeline-container]');
  if (timelineContainer && currentTimePosition >= 0) {
    const scrollToPosition = Math.max(0, currentTimePosition - 200);
    setTimeout(() => {
      timelineContainer.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
    }, 800);
  }
}, [currentTimePosition, tasks]);
```

### Optimistic Updates
- Immediate UI feedback
- Background synchronization
- Error recovery
- Rollback on failure

## Best Practices

### For Developers
1. **Performance**: Optimize for large numbers of tasks
2. **Accessibility**: Keyboard navigation support
3. **Responsive**: Mobile-friendly drag-and-drop
4. **Error Handling**: Graceful degradation

### For Users
1. **Time Management**: Be realistic about task duration
2. **Balance**: Include breaks and buffer time
3. **Flexibility**: Adjust schedule as needed
4. **Consistency**: Regular review and adjustment

## Timeboxing Principles

### Core Concepts
1. **Fixed Time Periods**: Set specific time limits
2. **Single Task Focus**: One task per time block
3. **Buffer Time**: Include transition periods
4. **Energy Management**: Match tasks to energy levels

### Best Practices
- **Morning**: High-focus, important tasks
- **Afternoon**: Collaborative, lighter tasks
- **Evening**: Planning, reflection, learning
- **Breaks**: Essential for productivity

### Common Pitfalls
- Over-scheduling
- Underestimating task duration
- No buffer time
- Ignoring energy levels

## Future Enhancements

### Planned Features
- **Week View**: Extended timeline view
- **Multiple Calendars**: Separate work/personal
- **Recurring Blocks**: Automatic scheduling
- **Time Analytics**: Productivity insights

### Technical Improvements
- **Touch Gestures**: Mobile drag-and-drop
- **Keyboard Shortcuts**: Power user features
- **Offline Mode**: Enhanced offline support
- **Real-time Sync**: Multi-device synchronization

## Troubleshooting

### Common Issues
1. **Drag-and-Drop Not Working**: Check touch events
2. **Time Conflicts**: Manual resolution needed
3. **Tasks Not Saving**: Network connection
4. **Timeline Not Loading**: Clear cache

### Debug Information
- Console logs for drag events
- Network tab for API requests
- Performance metrics for rendering
- Touch event debugging

## Related Components

- `LightWorkSection` - Task source
- `DeepWorkSection` - Task source
- `MorningRoutineSection` - Morning blocks
- `NightlyCheckoutSection` - Evening review

## Dependencies

```typescript
// External dependencies
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Internal dependencies
import { useTimeBlocks } from '@/lib/hooks/useTimeBlocks';
import { TimeBlockFormModal } from '@/domains/lifelock/1-daily/6-timebox/ui/components/TimeBlockFormModal';
import { QuickTaskScheduler } from '@/domains/lifelock/1-daily/6-timebox/ui/components/QuickTaskScheduler';
```

## Time Management Tips

### Scheduling Best Practices
1. **Energy Matching**: Schedule high-focus tasks during peak energy
2. **Buffer Time**: Add 15-minute buffers between tasks
3. **Break Scheduling**: Plan breaks, don't let them happen accidentally
4. **Realistic Timing**: Add 25% to initial time estimates

### Daily Rhythm
- **Morning (6-9 AM)**: Routine, planning, high-focus work
- **Mid-Morning (9-12 PM)**: Deep work, important tasks
- **Afternoon (12-6 PM)**: Light work, meetings, collaboration
- **Evening (6-9 PM)**: Review, planning, learning
- **Night (9 PM-6 AM)**: Rest, recovery, preparation

---

**Last Updated**: 2025-10-13  
**Version**: 1.0  
**Maintainer**: SISO Development Team
