import { useCallback, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { TimeBlockCategory } from '@/services/api/timeblocksApi.offline';
import { TimeboxTask, DragPreviewState, GapFillerState, FocusSprintType, TIMEBOX_HOUR_HEIGHT } from './types';
import { mapUIToCategory, formatTime, parseTimeToMinutes } from './utils';
import { unifiedDataService } from '@/services/shared/unified-data.service';

interface UseTimeboxHandlersProps {
  validTasks: TimeboxTask[];
  tasks: TimeboxTask[];
  updateTimeBlock: (id: string, data: any) => Promise<boolean>;
  toggleCompletion: (id: string) => Promise<void>;
  deleteTimeBlock: (id: string) => Promise<boolean>;
  createTimeBlock: (data: any) => Promise<boolean>;
  checkConflicts: (startTime: string, endTime: string, excludeId?: string) => Promise<any>;
  setDraggingTaskId: Dispatch<SetStateAction<string | null>>;
  setDragPreview: Dispatch<SetStateAction<DragPreviewState | null>>;
  setEditingBlock: Dispatch<SetStateAction<any>>;
  setIsFormModalOpen: Dispatch<SetStateAction<boolean>>;
  setSwipingTaskId: Dispatch<SetStateAction<string | null>>;
  setSwipeDirection: Dispatch<SetStateAction<'left' | 'right' | null>>;
  setGapFiller: Dispatch<SetStateAction<GapFillerState | null>>;
  setGapSuggestions: Dispatch<SetStateAction<any[]>>;
  setShowSprintMenu: Dispatch<SetStateAction<boolean>>;
  userId?: string | null;
  dateKey: string;
}

export const useTimeboxHandlers = ({
  validTasks,
  tasks,
  updateTimeBlock,
  toggleCompletion,
  deleteTimeBlock,
  createTimeBlock,
  checkConflicts,
  setDraggingTaskId,
  setDragPreview,
  setEditingBlock,
  setIsFormModalOpen,
  setSwipingTaskId,
  setSwipeDirection,
  setGapFiller,
  setGapSuggestions,
  setShowSprintMenu,
  userId,
  dateKey
}: UseTimeboxHandlersProps) => {
  const SMART_SUGGESTIONS_ENABLED = false;
  // Micro-celebrations - triggered on completion
  const celebrate = useCallback((task: TimeboxTask) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50]);
    }

    // Different celebrations based on task type/duration
    if (task.duration >= 120 && task.category === 'deep-work') {
      // Big win - completed 2hr+ deep work
      toast.success('🎊 Amazing! 2+ hours of deep work completed!', {
        duration: 4000,
        className: 'bg-gradient-to-r from-purple-600 to-pink-600'
      });
    } else if (task.duration >= 90) {
      toast.success('⚡ Great focus session!', { duration: 3000 });
    } else if (task.category === 'deep-work') {
      toast.success('🎯 Deep work completed!', { duration: 2000 });
    } else {
      toast.success('✅ Task completed!', { duration: 2000 });
    }

    // Check for streak achievements
    const completedToday = validTasks.filter(t => t.completed).length + 1;
    if (completedToday === 5) {
      toast.success('🔥 On fire! 5 tasks completed today!', {
        duration: 5000,
        className: 'bg-gradient-to-r from-orange-500 to-red-600'
      });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    } else if (completedToday === validTasks.length && validTasks.length > 0) {
      toast.success('💎 Perfect day! All blocks completed!', {
        duration: 6000,
        className: 'bg-gradient-to-r from-emerald-500 to-teal-600'
      });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
    }
  }, [validTasks]);

  // Handle task completion toggle with database persistence
  const handleToggleComplete = useCallback(async (taskId: string) => {
    try {
      const task = validTasks.find(t => t.id === taskId);
      const wasCompleted = task?.completed;

      await toggleCompletion(taskId);

      // Only celebrate when marking as complete (not when unchecking)
      if (!wasCompleted && task) {
        celebrate(task);
      } else {
        toast.success('Time block updated');
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update time block');
    }
  }, [toggleCompletion, validTasks, celebrate]);

  // Handle editing a time block
  const handleEditBlock = useCallback((task: TimeboxTask) => {
    setEditingBlock({
      id: task.id,
      title: task.title,
      description: task.description || '',
      startTime: task.startTime,
      endTime: task.endTime,
      category: mapUIToCategory(task.category),
      notes: ''
    });
    setIsFormModalOpen(true);
  }, [setEditingBlock, setIsFormModalOpen]);

  // Handle creating a new time block
  const handleCreateBlock = useCallback(async (data: any) => {
    const success = await createTimeBlock({
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      category: data.category,
      notes: data.notes
    });

    if (success) {
      setIsFormModalOpen(false);
      toast.success('Time block created');
    } else {
      toast.error('Failed to create time block');
    }
    return success;
  }, [createTimeBlock, setIsFormModalOpen]);

  // Handle updating an existing time block
  const handleUpdateBlock = useCallback(async (id: string, data: any) => {
    const success = await updateTimeBlock(id, data);
    if (success) {
      setIsFormModalOpen(false);
      setEditingBlock(null);
      toast.success('Time block updated');
    } else {
      toast.error('Failed to update time block');
    }
    return success;
  }, [updateTimeBlock, setIsFormModalOpen, setEditingBlock]);

  // Handle deleting a time block with toast notification
  const handleDeleteBlock = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteTimeBlock(id);
    if (success) {
      toast.success('Time block deleted');
    } else {
      toast.error('Failed to delete time block');
    }
    return success;
  }, [deleteTimeBlock]);

  // Handle checking conflicts
  const handleCheckConflicts = useCallback(async (startTime: string, endTime: string, excludeId?: string) => {
    return await checkConflicts(startTime, endTime, excludeId);
  }, [checkConflicts]);

  // Handle live drag preview with 15-minute snapping
  const handleDrag = useCallback((taskId: string, info: any) => {
    const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60;
    const minutesMoved = Math.round(info.offset.y / PIXELS_PER_MINUTE);

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const [startHour, startMin] = task.startTime.split(':').map(Number);
    const [endHour, endMin] = task.endTime.split(':').map(Number);

    const newStartMinutes = startHour * 60 + startMin + minutesMoved;
    const newEndMinutes = endHour * 60 + endMin + minutesMoved;

    // Snap to 15-minute increments
    const snapTo15 = (minutes: number) => Math.round(minutes / 15) * 15;
    const snappedStart = snapTo15(newStartMinutes);
    const snappedEnd = snappedStart + task.duration;

    // Validate bounds
    if (snappedStart < 0 || snappedEnd > 24 * 60) {
      setDragPreview(null);
      return;
    }

    setDragPreview({
      startTime: formatTime(snappedStart),
      endTime: formatTime(snappedEnd),
      top: info.point.y
    });
  }, [tasks, setDragPreview]);

  // Handle drag-and-drop repositioning
  const handleDragEnd = useCallback(async (taskId: string, info: any) => {
    const dragDistance = info.offset.y;
    const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60;
    const minutesMoved = Math.round(dragDistance / PIXELS_PER_MINUTE);

    // Find the task from tasks array
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Calculate new times
    const [startHour, startMin] = task.startTime.split(':').map(Number);
    const [endHour, endMin] = task.endTime.split(':').map(Number);

    const newStartMinutes = startHour * 60 + startMin + minutesMoved;
    const newEndMinutes = endHour * 60 + endMin + minutesMoved;

    // Snap to 15-minute increments
    const snapTo15 = (minutes: number) => Math.round(minutes / 15) * 15;
    const snappedStart = snapTo15(newStartMinutes);
    const snappedEnd = snappedStart + task.duration;

    // Validate bounds (0-24 hours)
    if (snappedStart < 0 || snappedEnd > 24 * 60) {
      toast.error('Cannot move task outside timeline');
      setDraggingTaskId(null);
      setDragPreview(null);
      return;
    }

    // Convert back to time strings
    const newStartTime = formatTime(snappedStart);
    const newEndTime = formatTime(snappedEnd);

    // Update the time block
    const success = await updateTimeBlock(taskId, {
      startTime: newStartTime,
      endTime: newEndTime
    });

    if (success) {
      toast.success('Time block moved');
    } else {
      toast.error('Failed to move time block');
    }

    setDraggingTaskId(null);
    setDragPreview(null);
  }, [tasks, updateTimeBlock, setDraggingTaskId, setDragPreview]);

  // Handle scheduling task from selection modal
  const handleScheduleTask = useCallback(async (task: any, timeSlot: any, taskType: 'light' | 'deep') => {
    const category: TimeBlockCategory = taskType === 'deep' ? 'DEEP_WORK' : 'LIGHT_WORK';

    const timeBlockData = {
      title: task.title,
      description: task.description || `Scheduled ${taskType} work task`,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      category: category,
      taskId: task.id, // Link to original task for subtask display
      notes: `Linked to ${taskType} work task: ${task.id}`
    };

    const success = await createTimeBlock(timeBlockData);

    if (success) {
      toast.success(`Added "${task.title}" to timeline`);
    } else {
      toast.error('Failed to add task to timeline');
    }
    return success;
  }, [createTimeBlock]);

  // Handle adding a follow-up block after an existing block
  const handleAddAfter = useCallback(async (task: TimeboxTask, minutes = 60, bufferMinutes = 10) => {
    const [endHour, endMin] = task.endTime.split(':').map(Number);
    const startMinutes = endHour * 60 + endMin + bufferMinutes; // Add 10min buffer
    const endMinutes = Math.min(24 * 60 - 1, startMinutes + minutes);

    // Check if we can fit the block
    if (startMinutes >= 24 * 60 - 15) {
      toast.error('Cannot add block - too close to midnight');
      return;
    }

    const success = await createTimeBlock({
      title: task.title + ' — follow-up',
      description: task.description || '',
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
      category: mapUIToCategory(task.category),
      notes: `Auto-created after: ${task.id}`
    });

    if (success) {
      toast.success(`Added follow-up block (+${bufferMinutes}min buffer)`);
    } else {
      toast.error('Failed to add follow-up');
    }
  }, [createTimeBlock]);

  // Handle snooze (move +1 hour)
  const handleSnooze = useCallback(async (taskId: string) => {
    const task = validTasks.find(t => t.id === taskId);
    if (!task) return;

    const [startHour, startMin] = task.startTime.split(':').map(Number);
    const [endHour, endMin] = task.endTime.split(':').map(Number);

    const newStartMinutes = startHour * 60 + startMin + 60; // +1 hour
    const newEndMinutes = endHour * 60 + endMin + 60;

    // Check bounds
    if (newEndMinutes >= 24 * 60) {
      toast.error('Cannot snooze - would exceed midnight');
      return;
    }

    const success = await updateTimeBlock(taskId, {
      startTime: formatTime(newStartMinutes),
      endTime: formatTime(newEndMinutes)
    });

    if (success) {
      toast.success('Snoozed +1 hour 📅');
      if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
    }
  }, [validTasks, updateTimeBlock]);

  // Handle swipe gestures on tasks
  const handlePan = useCallback((taskId: string, info: any) => {
    const swipeThreshold = 50;

    if (Math.abs(info.offset.x) < swipeThreshold) {
      setSwipingTaskId(null);
      setSwipeDirection(null);
      return;
    }

    setSwipingTaskId(taskId);

    if (info.offset.x < -swipeThreshold) {
      setSwipeDirection('left');
    } else if (info.offset.x > swipeThreshold) {
      setSwipeDirection('right');
    }
  }, [setSwipingTaskId, setSwipeDirection]);

  const handlePanEnd = useCallback(async (taskId: string, info: any) => {
    const swipeThreshold = 50;

    if (info.offset.x < -swipeThreshold) {
      // Swipe left - complete
      await handleToggleComplete(taskId);
      if (navigator.vibrate) navigator.vibrate([50]);
    } else if (info.offset.x > swipeThreshold) {
      // Swipe right - snooze
      await handleSnooze(taskId);
    }

    setSwipingTaskId(null);
    setSwipeDirection(null);
  }, [handleToggleComplete, handleSnooze, setSwipingTaskId, setSwipeDirection]);

  // Smart Gap Filler - Calculate gap and suggest tasks
  const handleTimelineClick = useCallback(async (e: React.MouseEvent) => {
    if (!SMART_SUGGESTIONS_ENABLED) {
      return;
    }

    // Only respond to clicks on the container itself (not on tasks)
    if ((e.target as HTMLElement).closest('.group')) return;

    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const PIXELS_PER_MINUTE = TIMEBOX_HOUR_HEIGHT / 60;
    const clickedMinute = Math.round(clickY / PIXELS_PER_MINUTE);

    // Find next task after this time
    const clickedTime = formatTime(clickedMinute);

    const nextTask = validTasks
      .filter(t => t.startTime > clickedTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

    // Calculate gap duration
    const gapEnd = nextTask ? nextTask.startTime : '23:59';
    const [gapEndHour, gapEndMin] = gapEnd.split(':').map(Number);
    const gapEndMinutes = gapEndHour * 60 + gapEndMin;
    const gapDuration = gapEndMinutes - clickedMinute;

    if (gapDuration < 15) {
      toast.info('Gap too small - minimum 15 minutes');
      return;
    }

    // Fetch and score tasks
    try {
      if (!userId) {
        toast.info('Sign in to fetch task suggestions');
        return;
      }
      const [deepTasks, lightTasks] = await Promise.all([
        unifiedDataService.getDeepWorkTasks(userId, dateKey),
        unifiedDataService.getLightWorkTasks(userId, dateKey)
      ]);

      const allTasks = [...deepTasks, ...lightTasks].filter(t => !t.completed);

      // Score tasks for this gap
      const scored = allTasks.map(t => {
        const estimatedDuration = t.estimatedDuration || 60;

        // Duration fit score (0-40)
        const durationDiff = Math.abs(estimatedDuration - gapDuration);
        const durationScore = Math.max(0, 40 - durationDiff);

        // Priority score (0-30)
        const priorityScores = { HIGH: 30, MEDIUM: 15, LOW: 5 };
        const priorityScore = priorityScores[t.priority as keyof typeof priorityScores] || 10;

        // Total score
        const totalScore = durationScore + priorityScore;

        return { task: t, score: totalScore, estimatedDuration };
      });

      // Top 3 suggestions
      const suggestions = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(s => s.task);

      setGapFiller({ startTime: clickedTime, duration: gapDuration, top: clickY });
      setGapSuggestions(suggestions);

    } catch (error) {
      console.error('Failed to fetch tasks for gap:', error);
      toast.error('Failed to load task suggestions');
    }
  }, [validTasks, setGapFiller, setGapSuggestions, userId, dateKey, SMART_SUGGESTIONS_ENABLED]);

  // Schedule task from gap filler
  const handleGapSchedule = useCallback(async (task: any, gapFiller: GapFillerState | null) => {
    if (!gapFiller) return;

    const estimatedDuration = Math.min(task.estimatedDuration || 60, gapFiller.duration);
    const startMinutes = parseTimeToMinutes(gapFiller.startTime);
    const endMinutes = startMinutes + estimatedDuration;

    const success = await createTimeBlock({
      title: task.title,
      description: task.description || '',
      startTime: gapFiller.startTime,
      endTime: formatTime(endMinutes),
      category: task.category === 'deep-work' ? 'DEEP_WORK' : 'LIGHT_WORK',
      taskId: task.id,
      notes: `Gap-filled: ${task.id}`
    });

    if (success) {
      toast.success(`Added "${task.title}" to gap 🧩`);
      setGapFiller(null);
      setGapSuggestions([]);
    }
  }, [createTimeBlock, setGapFiller, setGapSuggestions]);

  // Focus Sprint Generator - Create Pomodoro-style work/break chains
  const createFocusSprint = useCallback(async (startTime: string, templateType: FocusSprintType) => {
    const templates = {
      pomodoro: [
        { type: 'DEEP_WORK', duration: 25, title: '🎯 Pomodoro Focus' },
        { type: 'BREAK', duration: 5, title: '☕ Short Break' },
        { type: 'DEEP_WORK', duration: 25, title: '🎯 Pomodoro Focus' },
        { type: 'BREAK', duration: 5, title: '☕ Short Break' },
        { type: 'DEEP_WORK', duration: 25, title: '🎯 Pomodoro Focus' },
        { type: 'BREAK', duration: 5, title: '☕ Short Break' },
        { type: 'DEEP_WORK', duration: 25, title: '🎯 Pomodoro Focus' },
        { type: 'BREAK', duration: 15, title: '☕ Long Break' }
      ],
      extended: [
        { type: 'DEEP_WORK', duration: 50, title: '🎯 Extended Focus' },
        { type: 'BREAK', duration: 10, title: '☕ Break' },
        { type: 'DEEP_WORK', duration: 50, title: '🎯 Extended Focus' },
        { type: 'BREAK', duration: 10, title: '☕ Break' }
      ],
      deep: [
        { type: 'DEEP_WORK', duration: 90, title: '🎯 Deep Immersion' },
        { type: 'BREAK', duration: 20, title: '☕ Recovery Break' },
        { type: 'DEEP_WORK', duration: 90, title: '🎯 Deep Immersion' },
        { type: 'BREAK', duration: 20, title: '☕ Recovery Break' }
      ]
    };

    const template = templates[templateType];
    const [startHour, startMin] = startTime.split(':').map(Number);
    let currentMinute = startHour * 60 + startMin;

    let successCount = 0;
    const totalBlocks = template.length;

    for (const block of template) {
      const endMinute = currentMinute + block.duration;

      // Don't go past midnight
      if (endMinute >= 24 * 60) {
        toast.warning(`Sprint truncated at block ${successCount}/${totalBlocks} - would exceed midnight`);
        break;
      }

      const success = await createTimeBlock({
        title: block.title,
        description: `Part of ${templateType} focus sprint`,
        startTime: formatTime(currentMinute),
        endTime: formatTime(endMinute),
        category: block.type as TimeBlockCategory,
        notes: `Focus sprint: ${templateType}`
      });

      if (success) {
        successCount++;
        currentMinute = endMinute;
      } else {
        toast.error(`Failed to create block ${successCount + 1}/${totalBlocks}`);
        break;
      }
    }

    if (successCount > 0) {
      const sprintNames = { pomodoro: 'Classic Pomodoro', extended: 'Extended Focus', deep: 'Deep Immersion' };
      toast.success(`🎯 Created ${successCount}/${totalBlocks} blocks for ${sprintNames[templateType]} sprint!`);
      setShowSprintMenu(false);
    }
  }, [createTimeBlock, setShowSprintMenu]);

  return {
    celebrate,
    handleToggleComplete,
    handleEditBlock,
    handleCreateBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handleCheckConflicts,
    handleDrag,
    handleDragEnd,
    handleScheduleTask,
    handleAddAfter,
    handleSnooze,
    handlePan,
    handlePanEnd,
    handleTimelineClick,
    handleGapSchedule,
    createFocusSprint
  };
};
