import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Target,
  Zap,
  Lightbulb,
  X
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { TimeBlockFormModal } from '@/ecosystem/internal/tasks/components/TimeBlockFormModal';
import QuickTaskScheduler from '@/ecosystem/internal/tasks/components/QuickTaskScheduler';
import { useTimeBlocks } from '@/shared/hooks/useTimeBlocks';
import { TimeBlockCategory } from '@/api/timeblocksApi.offline';
import { theme } from '@/styles/theme';
import { useImplementation } from '@/migration/feature-flags';
import { toast } from 'sonner';
import { CleanDateNav } from '@/ecosystem/internal/lifelock/views/daily/_shared/components';
// Add Clerk authentication hooks - same pattern as working sections
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';

// Map database categories to UI categories
const mapCategoryToUI = (dbCategory: TimeBlockCategory): string => {
  const categoryMap: Record<TimeBlockCategory, string> = {
    DEEP_WORK: 'deep-work',
    LIGHT_WORK: 'light-work', 
    MEETING: 'admin',
    BREAK: 'wellness',
    PERSONAL: 'wellness',
    HEALTH: 'wellness',
    LEARNING: 'light-work',
    ADMIN: 'admin'
  };
  return categoryMap[dbCategory] || 'admin';
};

const mapUIToCategory = (uiCategory: string): TimeBlockCategory => {
  const uiMap: Record<string, TimeBlockCategory> = {
    'deep-work': 'DEEP_WORK',
    'light-work': 'LIGHT_WORK',
    'admin': 'ADMIN',
    'wellness': 'PERSONAL',
    'morning': 'PERSONAL'
  };
  return uiMap[uiCategory] || 'ADMIN';
};

// Enhanced task data structure for timeline
interface TimeboxTask {
  id: string;
  title: string;
  startTime: string; // "09:30"
  endTime: string;   // "11:00"
  duration: number;  // minutes
  category: 'morning' | 'deep-work' | 'light-work' | 'wellness' | 'admin';
  description?: string;
  completed: boolean;
  color: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  intensity?: 'light' | 'moderate' | 'intense' | 'maximum';
}

// Enhanced category-specific styling helper with vibrant colors
const getCategoryStyles = (category: TimeboxTask['category'], completed: boolean) => {
  const baseStyles = {
    morning: {
      border: completed ? "border-green-400/70" : "border-amber-400/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-amber-500/50",
      glow: "hover:shadow-amber-400/60 hover:shadow-lg",
      accent: "bg-gradient-to-r from-amber-400/20 to-orange-400/20"
    },
    'deep-work': {
      border: completed ? "border-green-400/70" : "border-blue-500/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-blue-500/60",
      glow: "hover:shadow-blue-400/70 hover:shadow-xl",
      accent: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
    },
    'light-work': {
      border: completed ? "border-green-400/70" : "border-emerald-400/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-emerald-500/50",
      glow: "hover:shadow-emerald-400/60 hover:shadow-lg",
      accent: "bg-gradient-to-r from-emerald-400/20 to-teal-400/20"
    },
    wellness: {
      border: completed ? "border-green-400/70" : "border-teal-500/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-teal-500/60",
      glow: "hover:shadow-teal-400/70 hover:shadow-xl",
      accent: "bg-gradient-to-r from-teal-500/20 to-cyan-500/20"
    },
    admin: {
      border: completed ? "border-green-400/70" : "border-indigo-500/80",
      shadow: completed ? "shadow-green-500/40" : "shadow-indigo-500/50",
      glow: "hover:shadow-indigo-400/60 hover:shadow-lg",
      accent: "bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
    }
  };
  return baseStyles[category] || baseStyles.admin;
};

interface TimeboxSectionProps {
  selectedDate: Date;
  // userId removed - we get it internally like working sections
}

const TimeboxSectionComponent: React.FC<TimeboxSectionProps> = ({
  selectedDate
}) => {
  // Get user authentication internally - same pattern as DeepWorkSection/LightWorkSection
  const { user, isSignedIn } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  // Debug: Log every render
  console.log('🔍 [TIMEBOX] RENDER with internalUserId:', internalUserId, 'isSignedIn:', isSignedIn, 'date:', format(selectedDate, 'yyyy-MM-dd'));
  
  // Clean black background
  const containerClassName = 'min-h-screen w-full mb-24 bg-black';
  
  const loadingClassName = 'h-full w-full bg-black flex items-center justify-center';

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TimeboxTask | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isQuickSchedulerOpen, setIsQuickSchedulerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ startTime: string; endTime: string; top: number } | null>(null);
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [swipingTaskId, setSwipingTaskId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [gapFiller, setGapFiller] = useState<{ startTime: string; duration: number; top: number } | null>(null);
  const [gapSuggestions, setGapSuggestions] = useState<any[]>([]);
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 [TIMEBOX] internalUserId:', internalUserId, 'selectedDate:', format(selectedDate, 'yyyy-MM-dd'));
  }, [internalUserId, selectedDate]);

  // Use the database-backed hook instead of localStorage
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

  // Debug logging for hook state
  useEffect(() => {
    console.log('🔍 [TIMEBOX] isLoading:', isLoading, 'timeBlocks:', timeBlocks?.length, 'error:', error);
  }, [isLoading, timeBlocks, error]);
  
  // Generate hour slots from 12am to 11pm (full 24 hours) with enhanced formatting
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      slots.push({
        hour,
        label: hour === 0 ? '12 AM' : hour <= 12 ? `${hour === 12 ? 12 : hour} ${hour < 12 ? 'AM' : 'PM'}` : `${hour - 12} PM`,
        time24: `${hour.toString().padStart(2, '0')}:00`,
        isCurrentHour: hour === new Date().getHours()
      });
    }
    return slots;
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Enhanced calculation for current time position with improved accuracy
  const getCurrentTimePosition = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Always show for full 24-hour timeline (12am-11pm)
    // Removed range restriction for full day coverage
    
    const PIXELS_PER_MINUTE = 80 / 60; // 1.333px per minute (80px per hour)
    const totalMinutesFromStart = hours * 60 + minutes;
    return totalMinutesFromStart * PIXELS_PER_MINUTE;
  }, []);

  // Enhanced task position calculation with improved time proportioning
  const getTaskPosition = useCallback((startTime: string, duration: number) => {
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      
      // Validate time values
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.warn(`Invalid time format: ${startTime}`);
        return { top: 0, height: 60 }; // Fallback position
      }
      
      // Enhanced pixel-per-minute calculation for more accurate sizing
      const PIXELS_PER_HOUR = 80; // Increased from 60 for better spacing
      const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60; // 1.333px per minute
      const MIN_HEIGHT = 35; // Increased minimum height for readability
      const MAX_HEIGHT = 240; // Maximum height to prevent overly large blocks
      
      const totalMinutesFromStart = hours * 60 + minutes;
      const topPosition = Math.max(0, totalMinutesFromStart * PIXELS_PER_MINUTE);
      
      // Calculate height based on duration with improved scaling
      let calculatedHeight = duration * PIXELS_PER_MINUTE;
      
      // Apply smart scaling for different duration ranges
      if (duration <= 30) {
        // Short tasks: Slightly larger than proportional for visibility
        calculatedHeight = Math.max(MIN_HEIGHT, calculatedHeight * 1.2);
      } else if (duration <= 60) {
        // Medium tasks: Standard proportional sizing
        calculatedHeight = Math.max(MIN_HEIGHT, calculatedHeight);
      } else if (duration <= 180) {
        // Long tasks: Slightly compressed to fit better
        calculatedHeight = Math.max(MIN_HEIGHT, calculatedHeight * 0.95);
      } else {
        // Very long tasks: More compressed but still proportional
        calculatedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, calculatedHeight * 0.85));
      }
      
      return { 
        top: topPosition, 
        height: calculatedHeight,
        duration: duration // Pass duration for additional styling
      };
    } catch (error) {
      console.error(`Error calculating task position for ${startTime}:`, error);
      return { top: 0, height: 60, duration: 0 }; // Fallback position
    }
  }, []);

  const currentTimePosition = useMemo(() => getCurrentTimePosition(), [getCurrentTimePosition]);

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
  }, []);

  // Handle creating a new time block
  const handleCreateBlock = async (data: any) => {
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
  };
  
  // Handle updating an existing time block
  const handleUpdateBlock = async (id: string, data: any) => {
    const success = await updateTimeBlock(id, data);
    if (success) {
      setIsFormModalOpen(false);
      setEditingBlock(null);
      toast.success('Time block updated');
    } else {
      toast.error('Failed to update time block');
    }
    return success;
  };
  
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
  const handleCheckConflicts = async (startTime: string, endTime: string, excludeId?: string) => {
    return await checkConflicts(startTime, endTime, excludeId);
  };

  // Convert database time blocks to UI format (moved before handleDragEnd to fix initialization order)
  const tasks = useMemo(() => {
    if (!Array.isArray(timeBlocks)) return [];
    return timeBlocks
      .filter(block => {
        // Defensive check: ensure block has required fields
        if (!block.startTime || !block.endTime) {
          console.warn('⚠️ Skipping invalid time block:', block);
          return false;
        }
        return true;
      })
      .map(block => {
      // Calculate duration from start and end times
      const [startHour, startMin] = block.startTime.split(':').map(Number);
      const [endHour, endMin] = block.endTime.split(':').map(Number);
      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      
      const uiCategory = mapCategoryToUI(block.category);
      
      // Get color based on category and completion
      const getColor = (category: string, completed: boolean) => {
        if (completed) return 'from-green-900/40 via-emerald-900/30 to-green-800/40';
        
        const colors: Record<string, string> = {
          'morning': 'from-amber-400/90 via-orange-500/80 to-yellow-500/70',
          'deep-work': 'from-blue-600/90 via-indigo-600/80 to-purple-600/80',
          'light-work': 'from-emerald-500/90 via-green-500/80 to-teal-500/70',
          'wellness': 'from-teal-600/90 via-cyan-500/80 to-blue-500/70',
          'admin': 'from-indigo-700/90 via-purple-700/80 to-violet-700/70'
        };
        return colors[category] || colors.admin;
      };
      
      return {
        id: block.id,
        title: block.title,
        startTime: block.startTime,
        endTime: block.endTime,
        duration,
        category: uiCategory,
        description: block.description || '',
        completed: block.completed,
        color: getColor(uiCategory, block.completed)
      } as TimeboxTask;
    });
  }, [timeBlocks]);

  // Handle live drag preview with 15-minute snapping
  const handleDrag = useCallback((taskId: string, info: any) => {
    const PIXELS_PER_MINUTE = 80 / 60;
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
    
    const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
    
    setDragPreview({
      startTime: formatTime(snappedStart),
      endTime: formatTime(snappedEnd),
      top: info.point.y
    });
  }, [tasks]);

  // Handle drag-and-drop repositioning
  const handleDragEnd = useCallback(async (taskId: string, info: any) => {
    const dragDistance = info.offset.y;
    const PIXELS_PER_MINUTE = 80 / 60;
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
    const newStartTime = `${Math.floor(snappedStart / 60).toString().padStart(2, '0')}:${(snappedStart % 60).toString().padStart(2, '0')}`;
    const newEndTime = `${Math.floor(snappedEnd / 60).toString().padStart(2, '0')}:${(snappedEnd % 60).toString().padStart(2, '0')}`;

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
  }, [tasks, updateTimeBlock]);

  // Handle scheduling task from selection modal
  const handleScheduleTask = async (task: any, timeSlot: any, taskType: 'light' | 'deep') => {
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
      setIsQuickSchedulerOpen(false);
      toast.success(`Added "${task.title}" to timeline`);
    } else {
      toast.error('Failed to add task to timeline');
    }
    return success;
  };

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
    
    const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
    
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
    
    const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
    
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
  }, []);

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
  }, [handleToggleComplete, handleSnooze]);


  // Smart Gap Filler - Calculate gap and suggest tasks
  const handleTimelineClick = useCallback(async (e: React.MouseEvent) => {
    // Only respond to clicks on the container itself (not on tasks)
    if ((e.target as HTMLElement).closest('.group')) return;
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    const PIXELS_PER_MINUTE = 80 / 60;
    const clickedMinute = Math.round(clickY / PIXELS_PER_MINUTE);
    const clickedHour = Math.floor(clickedMinute / 60);
    const clickedMin = clickedMinute % 60;
    
    // Find next task after this time
    const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
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
      const { unifiedDataService } = await import('@/shared/services/unified-data.service');
      const [deepTasks, lightTasks] = await Promise.all([
        unifiedDataService.getDeepWorkTasks(),
        unifiedDataService.getLightWorkTasks()
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
  }, [validTasks]);

  // Schedule task from gap filler
  const handleGapSchedule = useCallback(async (task: any) => {
    if (!gapFiller) return;
    
    const estimatedDuration = Math.min(task.estimatedDuration || 60, gapFiller.duration);
    const [startHour, startMin] = gapFiller.startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = startMinutes + estimatedDuration;
    
    const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
    
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
  }, [gapFiller, createTimeBlock]);

  // Focus Sprint Generator - Create Pomodoro-style work/break chains
  const createFocusSprint = useCallback(async (startTime: string, templateType: 'pomodoro' | 'extended' | 'deep') => {
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

    const formatTime = (m: number) => `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;

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
  }, [createTimeBlock]);

  // Auto-scroll to current time on page load
  useEffect(() => {
    const timelineContainer = document.querySelector('[data-timeline-container]');
    if (timelineContainer && currentTimePosition >= 0) {
      const scrollToPosition = Math.max(0, currentTimePosition - 200); // Offset to center current time
      
      // Smooth scroll to current time with delay to allow animations to complete
      setTimeout(() => {
        timelineContainer.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      }, 800); // Wait for stagger animations to complete
    }
  }, [currentTimePosition, tasks]); // Trigger when current time or tasks change

  // Memoized filtered tasks for performance
  const validTasks = useMemo(() => {
    return tasks.filter(task => {
      // Basic validation
      if (!task || !task.id || !task.startTime || !task.endTime) {
        console.warn('Invalid task found:', task);
        return false;
      }
      
      // Time format validation
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(task.startTime) || !timePattern.test(task.endTime)) {
        console.warn(`Invalid time format for task ${task.id}:`, task.startTime, task.endTime);
        return false;
      }
      
      return true;
    });
  }, [tasks]);

  // Calculate hourly density for heatmap
  const hourlyDensity = useMemo(() => {
    const density = Array(24).fill(0);
    
    validTasks.forEach(task => {
      const [startHour, startMin] = task.startTime.split(':').map(Number);
      const [endHour, endMin] = task.endTime.split(':').map(Number);
      
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      
      // Mark each hour this task touches
      for (let h = startHour; h <= endHour; h++) {
        const hourStart = h * 60;
        const hourEnd = (h + 1) * 60;
        
        // Check if task overlaps with this hour
        if (startTotalMin < hourEnd && endTotalMin > hourStart) {
          density[h] = Math.min(3, density[h] + 1); // Cap at 3 for color scaling
        }
      }
    });
    
    return density;
  }, [validTasks]);


  // Calculate today's stats for comparison
  const todayStats = useMemo(() => {
    const deepWork = validTasks.filter(t => t.category === 'deep-work').reduce((acc, t) => acc + t.duration, 0);
    const lightWork = validTasks.filter(t => t.category === 'light-work').reduce((acc, t) => acc + t.duration, 0);
    const completed = validTasks.filter(t => t.completed).length;
    const total = validTasks.length;
    
    return {
      deepWorkHours: (deepWork / 60).toFixed(1),
      lightWorkHours: (lightWork / 60).toFixed(1),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalBlocks: total
    };
  }, [validTasks]);

  // Get yesterday's stats from localStorage
  const yesterdayStats = useMemo(() => {
    try {
      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = format(yesterday, 'yyyy-MM-dd');
      const cached = localStorage.getItem(`timebox-stats-${yesterdayKey}`);
      
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load yesterday stats:', error);
    }
    
    return { deepWorkHours: '0', lightWorkHours: '0', completionRate: 0, totalBlocks: 0 };
  }, [selectedDate]);

  // Cache today's stats for future comparison
  useEffect(() => {
    const todayKey = format(selectedDate, 'yyyy-MM-dd');
    try {
      localStorage.setItem(`timebox-stats-${todayKey}`, JSON.stringify(todayStats));
    } catch (error) {
      console.warn('Failed to cache today stats:', error);
    }
  }, [todayStats, selectedDate]);


  // Learn and cache average durations per category
  useEffect(() => {
    if (validTasks.length === 0) return;
    
    const categoryDurations: Record<string, number[]> = {};
    
    validTasks.forEach(task => {
      const category = mapUIToCategory(task.category);
      if (!categoryDurations[category]) {
        categoryDurations[category] = [];
      }
      categoryDurations[category].push(task.duration);
    });
    
    const avgDurations: Record<string, number> = {};
    Object.entries(categoryDurations).forEach(([category, durations]) => {
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      avgDurations[category] = avg;
    });
    
    // Cache for smart defaults
    try {
      localStorage.setItem('timebox-avg-durations', JSON.stringify(avgDurations));
    } catch (error) {
      console.warn('Failed to cache avg durations:', error);
    }
  }, [validTasks]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={loadingClassName}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-purple-300 text-lg">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className="w-full relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 space-y-6">

          {/* Compact Header Section */}


          {/* Today's Focus Stats Card */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-2 mb-2"
        >
          <Card className="bg-transparent border-gray-800/30 rounded-2xl">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Today's Focus</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-300">
                    <span className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-blue-400" />
                      <span>{validTasks.length} tasks</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span>{Math.round(validTasks.reduce((acc, task) => acc + task.duration, 0) / 60)}h planned</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Zap className="h-3 w-3 text-orange-400" />
                      <span>{validTasks.filter(task => task.category === 'deep-work').length} deep</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today vs Yesterday Comparison Card */}
        {yesterdayStats.totalBlocks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mx-2 mb-2"
          >
            <Card className="bg-transparent border-gray-800/30 rounded-2xl overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center">
                        Progress vs Yesterday
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className="ml-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showComparison ? '▼' : '▶'}
                        </button>
                      </h3>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showComparison && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 grid grid-cols-3 gap-2 text-center overflow-hidden"
                    >
                      {/* Deep Work Comparison */}
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
                        <div className="text-[10px] text-gray-400 mb-1">Deep Work</div>
                        <div className="text-sm font-bold text-blue-300">{todayStats.deepWorkHours}h</div>
                        {parseFloat(yesterdayStats.deepWorkHours) > 0 && (
                          <div className={cn(
                            "text-[9px] font-medium mt-1",
                            parseFloat(todayStats.deepWorkHours) > parseFloat(yesterdayStats.deepWorkHours)
                              ? "text-green-400"
                              : parseFloat(todayStats.deepWorkHours) < parseFloat(yesterdayStats.deepWorkHours)
                              ? "text-red-400"
                              : "text-gray-400"
                          )}>
                            {parseFloat(todayStats.deepWorkHours) > parseFloat(yesterdayStats.deepWorkHours) ? '↑' : 
                             parseFloat(todayStats.deepWorkHours) < parseFloat(yesterdayStats.deepWorkHours) ? '↓' : '→'} 
                            {Math.abs(parseFloat(todayStats.deepWorkHours) - parseFloat(yesterdayStats.deepWorkHours)).toFixed(1)}h
                          </div>
                        )}
                      </div>

                      {/* Light Work Comparison */}
                      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-2">
                        <div className="text-[10px] text-gray-400 mb-1">Light Work</div>
                        <div className="text-sm font-bold text-emerald-300">{todayStats.lightWorkHours}h</div>
                        {parseFloat(yesterdayStats.lightWorkHours) > 0 && (
                          <div className={cn(
                            "text-[9px] font-medium mt-1",
                            parseFloat(todayStats.lightWorkHours) > parseFloat(yesterdayStats.lightWorkHours)
                              ? "text-green-400"
                              : parseFloat(todayStats.lightWorkHours) < parseFloat(yesterdayStats.lightWorkHours)
                              ? "text-red-400"
                              : "text-gray-400"
                          )}>
                            {parseFloat(todayStats.lightWorkHours) > parseFloat(yesterdayStats.lightWorkHours) ? '↑' : 
                             parseFloat(todayStats.lightWorkHours) < parseFloat(yesterdayStats.lightWorkHours) ? '↓' : '→'} 
                            {Math.abs(parseFloat(todayStats.lightWorkHours) - parseFloat(yesterdayStats.lightWorkHours)).toFixed(1)}h
                          </div>
                        )}
                      </div>

                      {/* Completion Rate Comparison */}
                      <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-2">
                        <div className="text-[10px] text-gray-400 mb-1">Completed</div>
                        <div className="text-sm font-bold text-purple-300">{todayStats.completionRate}%</div>
                        {yesterdayStats.completionRate > 0 && (
                          <div className={cn(
                            "text-[9px] font-medium mt-1",
                            todayStats.completionRate > yesterdayStats.completionRate
                              ? "text-green-400"
                              : todayStats.completionRate < yesterdayStats.completionRate
                              ? "text-red-400"
                              : "text-gray-400"
                          )}>
                            {todayStats.completionRate > yesterdayStats.completionRate ? '↑' : 
                             todayStats.completionRate < yesterdayStats.completionRate ? '↓' : '→'} 
                            {Math.abs(todayStats.completionRate - yesterdayStats.completionRate)}%
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Prominent Add Tasks Button + Sprint Menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mx-4 mb-3 space-y-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setIsQuickSchedulerOpen(true)}
              disabled={isCreating || isUpdating}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3 text-sm font-semibold shadow-xl hover:shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl disabled:opacity-50"
              size="lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Tasks
            </Button>
            
            <Button
              onClick={() => setShowSprintMenu(!showSprintMenu)}
              disabled={isCreating || isUpdating}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 text-sm font-semibold shadow-xl hover:shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl disabled:opacity-50"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Focus Sprint
            </Button>
          </div>
          
          {/* Sprint Selection Menu */}
          <AnimatePresence>
            {showSprintMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-900/95 border border-purple-500/30 rounded-xl p-4 space-y-3">
                  <h4 className="text-white font-semibold text-sm flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-purple-400" />
                    Choose Sprint Type
                  </h4>
                  
                  <div className="space-y-2">
                    {/* Pomodoro Sprint */}
                    <Button
                      onClick={() => {
                        const now = new Date();
                        const startTime = `${now.getHours().toString().padStart(2, '0')}:${Math.ceil(now.getMinutes() / 15) * 15}`;
                        createFocusSprint(startTime, 'pomodoro');
                      }}
                      className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-white justify-start"
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="font-semibold">🍅 Classic Pomodoro</span>
                        <span className="text-xs text-gray-300">4x (25min work + 5min break) = 2 hours</span>
                      </div>
                    </Button>
                    
                    {/* Extended Sprint */}
                    <Button
                      onClick={() => {
                        const now = new Date();
                        const startTime = `${now.getHours().toString().padStart(2, '0')}:${Math.ceil(now.getMinutes() / 15) * 15}`;
                        createFocusSprint(startTime, 'extended');
                      }}
                      className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-white justify-start"
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="font-semibold">⚡ Extended Focus</span>
                        <span className="text-xs text-gray-300">2x (50min work + 10min break) = 2 hours</span>
                      </div>
                    </Button>
                    
                    {/* Deep Immersion Sprint */}
                    <Button
                      onClick={() => {
                        const now = new Date();
                        const startTime = `${now.getHours().toString().padStart(2, '0')}:${Math.ceil(now.getMinutes() / 15) * 15}`;
                        createFocusSprint(startTime, 'deep');
                      }}
                      className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-white justify-start"
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="font-semibold">🧠 Deep Immersion</span>
                        <span className="text-xs text-gray-300">2x (90min work + 20min break) = 3.5 hours</span>
                      </div>
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => setShowSprintMenu(false)}
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-400 border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* TimeBox Card Wrapper */}
        <Card className="w-full bg-transparent border-gray-800/30 rounded-2xl mb-32">
          <CardContent className="p-0">
            {/* Full Width Timeline */}
            <div className="w-full">
            {/* Clean Timeline Container - Full Width */}
            <div className="relative w-full">
              
              <div 
                className="relative w-full" 
                data-timeline-container
              >
              
              {/* Enhanced Timeline Grid with improved proportions */}
              <div className="relative" style={{ height: `${(23 - 0 + 1) * 80}px` }}>
                
                {/* Clean Time Sidebar */}
                <div className="absolute left-0 top-0 w-16 h-full bg-gray-950/80 border-r border-gray-700/30 rounded-l-2xl">
                  {timeSlots.map((slot, index) => (
                    <motion.div
                      key={slot.hour}
                      className={cn(
                        "absolute w-full flex items-center justify-center group/hour transition-all duration-300",
                        slot.isCurrentHour && "bg-blue-500/10"
                      )}
                      style={{ top: `${slot.hour * 80}px`, height: '80px' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.02,
                        ease: "easeOut"
                      }}
                    >
                      {/* Compact Time Label */}
                      <motion.div 
                        className={cn(
                          "bg-gray-950/90 border border-gray-700/40 rounded-md px-2 py-1",
                          slot.isCurrentHour 
                            ? "border-blue-400/50 bg-blue-950/80" 
                            : "group-hover/hour:border-gray-500/60"
                        )}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className={cn(
                          "text-xs font-medium tracking-wide",
                          slot.isCurrentHour 
                            ? "text-blue-200" 
                            : "text-gray-300 group-hover/hour:text-gray-200"
                        )}>
                          {slot.label}
                        </span>
                        {slot.hour === new Date().getHours() && (
                          <motion.div
                            className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Timeline Density Heatmap - Background layer */}
                <div className="absolute left-16 right-0 top-0 bottom-0 pointer-events-none">
                  {timeSlots.map((slot, index) => (
                    <motion.div
                      key={`heatmap-${slot.hour}`}
                      className={cn(
                        "absolute w-full transition-all duration-700",
                        hourlyDensity[slot.hour] === 0 && "bg-transparent",
                        hourlyDensity[slot.hour] === 1 && "bg-green-500/8",
                        hourlyDensity[slot.hour] === 2 && "bg-yellow-500/15",
                        hourlyDensity[slot.hour] >= 3 && "bg-red-500/25"
                      )}
                      style={{ top: `${slot.hour * 80}px`, height: '80px' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.03,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>

                {/* Subtle Hour Dividers */}
                {timeSlots.map((slot, index) => (
                  <motion.div
                    key={`divider-${slot.hour}`}
                    className="absolute left-16 right-0 border-t border-gray-700/40"
                    style={{ top: `${slot.hour * 80}px` }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.02,
                      ease: "easeOut"
                    }}
                  />
                ))}

                {/* Current Time Indicator */}
                {currentTimePosition >= 0 && (
                  <motion.div
                    className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                    style={{ top: `${currentTimePosition}px` }}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.8,
                      type: "spring",
                      stiffness: 100,
                      damping: 20
                    }}
                  >
                    {/* Subtle blue line with reduced opacity */}
                    <motion.div 
                      className="flex-1 relative"
                      animate={{ 
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                      {/* Glowing effect - more subtle */}
                      <motion.div 
                        className="absolute inset-0 h-[2px] bg-blue-400/40 blur-md"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                    
                    {/* Animated time bubble with pointer events - MOVED TO LEFT */}
                    <motion.div 
                      className="absolute left-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-xl border border-blue-400/30 pointer-events-auto cursor-default"
                      whileHover={{ scale: 1.1 }}
                      animate={{ 
                        boxShadow: [
                          "0 4px 15px rgba(59, 130, 246, 0.3)",
                          "0 6px 20px rgba(59, 130, 246, 0.5)",
                          "0 4px 15px rgba(59, 130, 246, 0.3)"
                        ]
                      }}
                      transition={{
                        boxShadow: { duration: 2, repeat: Infinity },
                        scale: { duration: 0.2 }
                      }}
                    >
                      {format(currentTime, 'HH:mm')}
                      {/* Pulse dot indicator */}
                      <motion.div
                        className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-300 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Enhanced Task Blocks Container - Adjusted for sidebar */}
                <div 
                  className="absolute left-16 right-4 top-0 bottom-0" 
                  style={{ width: 'calc(100% - 80px)' }}
                  onClick={handleTimelineClick}
                >
                  
                  {/* Drag Time Preview */}
                  {dragPreview && (
                    <motion.div
                      className="absolute left-6 z-50 pointer-events-none"
                      style={{ top: `${dragPreview.top}px`, transform: 'translateY(-50%)' }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold shadow-xl border-2 border-white/40">
                        {dragPreview.startTime} → {dragPreview.endTime}
                      </div>
                    </motion.div>
                  )}

                  {/* Smart Gap Filler Suggestions */}
                  {gapFiller && gapSuggestions.length > 0 && (
                    <motion.div
                      className="absolute right-6 z-50"
                      style={{ top: `${gapFiller.top}px`, transform: 'translateY(-50%)' }}
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    >
                      <div className="bg-gray-900/95 border border-emerald-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[280px]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-semibold text-sm flex items-center">
                              <Lightbulb className="h-4 w-4 mr-2 text-emerald-400" />
                              Smart Suggestions
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {gapFiller.duration}min gap at {gapFiller.startTime}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setGapFiller(null);
                              setGapSuggestions([]);
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {gapSuggestions.map((task, idx) => (
                            <motion.button
                              key={task.id}
                              onClick={() => handleGapSchedule(task)}
                              className="w-full bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600/40 hover:border-emerald-500/60 rounded-lg p-3 text-left transition-all"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-sm">{task.title}</p>
                                  {task.description && (
                                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">{task.description}</p>
                                  )}
                                </div>
                                <Badge className={cn(
                                  "text-[10px] flex-shrink-0",
                                  task.priority === 'HIGH' ? "bg-red-500/20 text-red-300" :
                                  task.priority === 'MEDIUM' ? "bg-yellow-500/20 text-yellow-300" :
                                  "bg-gray-500/20 text-gray-300"
                                )}>
                                  {task.estimatedDuration || 60}m
                                </Badge>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-700/30">
                          <p className="text-xs text-gray-500 text-center">
                            💡 Tap a task to schedule it in this gap
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {validTasks.length === 0 ? (
                    /* Enhanced Empty State */
                    <div className="flex items-center justify-center h-full">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-8 max-w-md"
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                          className="mb-6"
                        >
                          <Calendar className="h-20 w-20 mx-auto text-blue-500/30" />
                        </motion.div>
                        <h3 className="text-white text-xl font-semibold mb-3">Your Timeline is Empty</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                          Start planning your day by adding tasks from Deep Work or Light Work sections
                        </p>
                        <Button
                          onClick={() => setIsQuickSchedulerOpen(true)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl px-6 py-3"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Your First Task
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    validTasks.map((task, index) => {
                    const position = getTaskPosition(task.startTime, task.duration);
                    const categoryStyles = getCategoryStyles(task.category, task.completed);
                    return (
                      <motion.div
                        key={task.id}
                        drag={draggingTaskId === task.id ? "y" : false}
                        dragConstraints={{ top: -position.top, bottom: (23 * 80) - position.top - position.height }}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragStart={() => setDraggingTaskId(task.id)}
                        onDrag={(e, info) => handleDrag(task.id, info)}
                        onDragEnd={(e, info) => handleDragEnd(task.id, info)}
                        onPan={(e, info) => handlePan(task.id, info)}
                        onPanEnd={(e, info) => handlePanEnd(task.id, info)}
                        className={cn(
                          "absolute rounded-xl cursor-move z-10 group touch-pan-y active:cursor-grabbing",
                          "bg-gradient-to-br shadow-xl border-2",
                          "transition-all duration-500 hover:shadow-2xl overflow-hidden",
                          "ring-0 ring-transparent hover:ring-2 hover:ring-white/20",
                          draggingTaskId === task.id && "scale-105 shadow-2xl ring-2 ring-blue-400/50 z-50",
                          task.completed
                            ? "bg-gradient-to-br from-green-900/40 via-emerald-900/30 to-green-800/40"
                            : task.color,
                          categoryStyles.border,
                          categoryStyles.shadow,
                          categoryStyles.glow,
                          !task.completed && categoryStyles.accent
                        )}
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height - 4}px`,
                          marginTop: '2px',
                          left: '4px',
                          right: '4px',
                          width: 'calc(100% - 8px)'
                        }}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                          y: 20
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          // Add subtle pulse for tasks near current time
                          ...(Math.abs(position.top - (currentTimePosition || -1000)) < 60 && currentTimePosition >= 0 && !task.completed ? {
                            boxShadow: [
                              "0 0 20px rgba(168, 85, 247, 0.3)",
                              "0 0 30px rgba(168, 85, 247, 0.5)",
                              "0 0 20px rgba(168, 85, 247, 0.3)"
                            ]
                          } : {})
                        }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        whileHover={{
                          scale: 1.03,
                          y: -3,
                          rotateX: 5,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                          transition: {
                            duration: 0.2,
                            type: "spring",
                            stiffness: 400
                          }
                        }}
                        whileTap={{
                          scale: 0.97,
                          transition: { duration: 0.1 }
                        }}
                        onClick={(e) => {
                          if (draggingTaskId) return; // Don't open modal while dragging
                          setSelectedTask(task);
                        }}
                        onDoubleClick={() => handleEditBlock(task)}
                        layout
                      >
                        <div className="p-3 h-full flex flex-col justify-between relative overflow-hidden">
                          {/* Swipe Action Visual Feedback */}
                          {swipingTaskId === task.id && swipeDirection && (
                            <motion.div
                              className={cn(
                                "absolute inset-0 flex items-center justify-center z-20",
                                swipeDirection === 'left' && "bg-green-500/30",
                                swipeDirection === 'right' && "bg-blue-500/30"
                              )}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {swipeDirection === 'left' && <CheckCircle2 className="h-12 w-12 text-green-400" />}
                              {swipeDirection === 'right' && <Calendar className="h-12 w-12 text-blue-400" />}
                            </motion.div>
                          )}

                          {/* Enhanced background pattern with depth */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)] opacity-60" />
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)]" />
                          
                          {/* Enhanced completion overlay effect */}
                          {task.completed && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-400/15 to-green-500/20 border-l-2 border-green-400/40"
                              initial={{ opacity: 0, scale: 0.95, x: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          )}
                          
                          {/* Enhanced shimmer effect on hover */}
                          {!task.completed && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent transform -translate-x-full group-hover:translate-x-full"
                              transition={{ duration: 1, ease: "easeInOut" }}
                            />
                          )}
                          
                          {/* Task header section - Compact & Clean */}
                          <div className="relative z-10 mb-auto space-y-2">
                            {/* Compact Top Row: Title + Checkbox + Duration Badge */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                  "font-semibold text-sm leading-snug transition-all duration-300 group-hover:text-white",
                                  task.completed ? "text-green-100 line-through decoration-2 decoration-green-400/60" : "text-white"
                                )}>
                                  {task.title}
                                </h4>
                                {/* Time slot in tiny text */}
                                <p className="text-[10px] text-white/50 mt-0.5 font-medium">
                                  {task.startTime} - {task.endTime}
                                </p>
                              </div>
                              
                              {/* Duration bubble - Small & Compact */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0",
                                  task.completed 
                                    ? "bg-green-500/30 text-green-200 border border-green-400/50" 
                                    : "bg-white/25 text-white border border-white/40"
                                )}
                              >
                                {task.duration}m
                              </motion.div>
                              
                              {/* Add After button */}
                              <motion.button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddAfter(task, 60);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 transition-colors flex-shrink-0"
                                title="Add follow-up block"
                              >
                                <Plus className="h-3 w-3 text-white" />
                              </motion.button>
                              
                              {/* Completion Checkbox */}
                              <motion.div
                                className="flex-shrink-0 cursor-pointer"
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleComplete(task.id);
                                }}
                                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {task.completed ? (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                  >
                                    <CheckCircle2 className="h-5 w-5 text-green-400 drop-shadow-sm" />
                                  </motion.div>
                                ) : (
                                  <Circle className="h-5 w-5 text-white/60 group-hover:text-white/90 transition-colors duration-300 drop-shadow-sm" />
                                )}
                              </motion.div>
                            </div>

                            {/* Description in Subtle Box - Only if exists and card is tall enough */}
                            {task.description && task.duration >= 45 && (
                              <div className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 mt-1">
                                <p className={cn(
                                  "text-[10px] leading-relaxed transition-all duration-300 line-clamp-2",
                                  task.completed ? "text-green-200/70" : "text-white/60 group-hover:text-white/75"
                                )}>
                                  {task.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                </div>
              </div>
            </div>
            </div>
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Time Block Detail Modal - Opens edit modal instead of TaskDetailModal */}
      {selectedTask && (
        <TimeBlockFormModal
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleCreateBlock}
          onUpdate={(id, data) => handleUpdateBlock(id, data)}
          onDelete={handleDeleteBlock}
          existingBlock={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description || '',
            startTime: selectedTask.startTime,
            endTime: selectedTask.endTime,
            category: mapUIToCategory(selectedTask.category),
            notes: ''
          }}
          conflicts={conflicts}
          onCheckConflicts={handleCheckConflicts}
        />
      )}
      
      {/* Time Block Form Modal */}
      <TimeBlockFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingBlock(null);
        }}
        onSubmit={handleCreateBlock}
        onUpdate={handleUpdateBlock}
        onDelete={handleDeleteBlock}
        existingBlock={editingBlock}
        conflicts={conflicts}
        onCheckConflicts={handleCheckConflicts}
      />
      
      {/* Quick Task Scheduler */}
      {isQuickSchedulerOpen && (
        <div className="fixed inset-4 z-50 md:top-4 md:right-4 md:left-auto md:bottom-auto md:w-[480px] md:max-w-[90vw]">
          <QuickTaskScheduler
            isOpen={isQuickSchedulerOpen}
            onClose={() => setIsQuickSchedulerOpen(false)}
            selectedDate={selectedDate}
            onScheduleTask={handleScheduleTask}
          />
        </div>
      )}
      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const TimeboxSection = memo(TimeboxSectionComponent, (prevProps, nextProps) => {
  // Re-render only if selectedDate changes (userId is now internal)
  const dateEqual = format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
  return dateEqual;
});