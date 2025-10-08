import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Target,
  Zap
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
import { AnimatedDateHeader } from '@/shared/ui/animated-date-header-v2';

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
  userId?: string; // Add userId for database operations
}

const TimeboxSectionComponent: React.FC<TimeboxSectionProps> = ({
  selectedDate,
  userId
}) => {
  // Debug: Log every render
  console.log('🔍 [TIMEBOX] RENDER with userId:', userId, 'date:', format(selectedDate, 'yyyy-MM-dd'));
  
  // Move useImplementation calls to top of component
  const containerClassName = useImplementation(
    'useUnifiedThemeSystem',
    // NEW: Unified theme system
    `min-h-screen w-full mb-24 ${theme.gradients.diagonal.grayToBlack}`,
    // OLD: Original classes (fallback for safety)
    'min-h-screen w-full mb-24 bg-gradient-to-br from-black via-gray-900 to-black'
  );
  
  const loadingClassName = useImplementation(
    'useUnifiedThemeSystem',
    // NEW: Unified theme system
    `h-full w-full flex items-center justify-center ${theme.gradients.diagonal.grayToBlack}`,
    // OLD: Original classes (fallback for safety)
    'h-full w-full bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center'
  );

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TimeboxTask | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isQuickSchedulerOpen, setIsQuickSchedulerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 [TIMEBOX] userId:', userId, 'selectedDate:', format(selectedDate, 'yyyy-MM-dd'));
  }, [userId, selectedDate]);

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
    userId,
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

  // Handle task completion toggle with database persistence
  const handleToggleComplete = useCallback(async (taskId: string) => {
    try {
      await toggleCompletion(taskId);
      toast.success('Time block updated');
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update time block');
    }
  }, [toggleCompletion]);
  
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

    // Validate bounds (0-24 hours)
    if (newStartMinutes < 0 || newEndMinutes > 24 * 60) {
      toast.error('Cannot move task outside timeline');
      setDraggingTaskId(null);
      return;
    }

    // Convert back to time strings
    const newStartTime = `${Math.floor(newStartMinutes / 60).toString().padStart(2, '0')}:${(newStartMinutes % 60).toString().padStart(2, '0')}`;
    const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;

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
        {/* Progress Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50"></div>

        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-6">
          {/* Animated Date Header */}
          <AnimatedDateHeader
            selectedDate={selectedDate}
            earnedXP={0}
            potentialXP={0}
            currentLevel={1}
            streakDays={0}
            badgeCount={0}
            colorScheme="blue"
          />

          {/* Compact Header Section */}


          {/* Today's Focus Stats Card */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-4 mb-2"
        >
          <Card className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-indigo-900/40 border-blue-700/50 shadow-2xl shadow-blue-500/20 rounded-2xl backdrop-blur-sm">
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
        
        {/* Prominent Add Tasks Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mx-4 mb-3"
        >
          <Button
            onClick={() => setIsQuickSchedulerOpen(true)}
            disabled={isCreating || isUpdating}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3 text-base font-semibold shadow-xl hover:shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            title="Add tasks to timebox"
          >
            {isCreating || isUpdating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                />
                {isCreating ? 'Adding...' : 'Updating...'}
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 mr-3" />
                Add Tasks to Timeline
              </>
            )}
          </Button>
        </motion.div>

        {/* TimeBox Card Wrapper */}
        <Card className="w-full bg-blue-900/20 border-blue-700/50 shadow-2xl shadow-blue-900/20 rounded-2xl backdrop-blur-sm mb-32">
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
                <div className="absolute left-0 top-0 w-16 h-full bg-gray-900/50 border-r border-gray-600/30 rounded-l-2xl shadow-inner">
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
                          "bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 rounded-md px-2 py-1 shadow-sm",
                          slot.isCurrentHour 
                            ? "border-blue-400/50 bg-blue-900/30 shadow-blue-500/20" 
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
                <div className="absolute left-16 right-4 top-0 bottom-0 bg-gradient-to-r from-transparent via-black/5 to-transparent rounded-2xl shadow-inner" style={{ width: 'calc(100% - 80px)' }}>
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
                        drag="y"
                        dragConstraints={{ top: -position.top, bottom: (23 * 80) - position.top - position.height }}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragStart={() => setDraggingTaskId(task.id)}
                        onDragEnd={(e, info) => handleDragEnd(task.id, info)}
                        className={cn(
                          "absolute rounded-xl cursor-move z-10 group touch-pan-y active:cursor-grabbing",
                          "bg-gradient-to-br backdrop-blur-md shadow-xl border-2",
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
                          {/* Enhanced background pattern with depth */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)] opacity-60" />
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)]" />
                          
                          {/* Enhanced completion overlay effect */}
                          {task.completed && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-400/15 to-green-500/20 backdrop-blur-[1px] border-l-2 border-green-400/40"
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
                              <div className="bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 backdrop-blur-sm mt-1">
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
  // Re-render if selectedDate OR userId changes
  const dateEqual = format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
  const userIdEqual = prevProps.userId === nextProps.userId;
  return dateEqual && userIdEqual;
});