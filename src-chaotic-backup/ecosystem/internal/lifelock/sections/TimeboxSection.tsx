import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Edit3
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { TaskDetailModal } from '@/ecosystem/internal/tasks/ui/task-detail-modal';
import { TimeBlockFormModal } from '@/ecosystem/internal/tasks/components/TimeBlockFormModal';
import QuickTaskScheduler from '@/ecosystem/internal/tasks/components/QuickTaskScheduler';
import { useTimeBlocks } from '@/shared/hooks/useTimeBlocks';
import { TimeBlockCategory } from '../../../../generated/prisma/index.js';
import { theme } from '@/styles/theme';
import { useImplementation } from '@/migration/feature-flags';

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
  userId = 'demo-user' // Default for demo
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TimeboxTask | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isQuickSchedulerOpen, setIsQuickSchedulerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  
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
      // Close modal after toggling for smoother UX
      setSelectedTask(null);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Keep modal open on error so user can retry
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
    }
    return success;
  };
  
  // Handle updating an existing time block
  const handleUpdateBlock = async (id: string, data: any) => {
    const success = await updateTimeBlock(id, data);
    if (success) {
      setIsFormModalOpen(false);
      setEditingBlock(null);
    }
    return success;
  };
  
  // Handle checking conflicts
  const handleCheckConflicts = async (startTime: string, endTime: string, excludeId?: string) => {
    return await checkConflicts(startTime, endTime, excludeId);
  };

  // Handle scheduling task from selection modal
  const handleScheduleTask = async (task: any, timeSlot: any, taskType: 'light' | 'deep') => {
    const category = taskType === 'deep' ? 'DEEP_WORK' : 'LIGHT_WORK';
    
    const success = await createTimeBlock({
      title: task.title,
      description: task.description || `Scheduled ${taskType} work task`,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      category: mapUIToCategory(category),
      notes: `Linked to ${taskType} work task: ${task.id}`
    });
    
    if (success) {
      setIsQuickSchedulerOpen(false);
    }
    return success;
  };
  
  // Convert database time blocks to UI format
  const tasks = useMemo(() => {
    if (!Array.isArray(timeBlocks)) return [];
    return timeBlocks.map(block => {
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
      <div className={useImplementation(
        'useUnifiedThemeSystem',
        // NEW: Unified theme system
        `min-h-screen w-full flex items-center justify-center ${theme.gradients.diagonal.grayToBlack}`,
        // OLD: Original classes (fallback for safety)
        'min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center'
      )}>
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
    <div className={useImplementation(
      'useUnifiedThemeSystem',
      // NEW: Unified theme system
      `min-h-screen w-full ${theme.gradients.diagonal.grayToBlack}`,
      // OLD: Original classes (fallback for safety)
      'min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black'
    )}>
      <div className="w-full">
        
        {/* Simple Header - Full Width */}
        <div className="w-full px-4 py-6 border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-white text-2xl font-bold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsQuickSchedulerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                size="sm"
                title="Add tasks to timebox"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add Tasks
              </Button>
            </div>
          </div>
        </div>
        
        {/* Full Width Timeline */}
        <div className="w-full">
            {/* Clean Timeline Container - Full Width */}
            <div className="relative w-full">
              
              <div 
                className="relative w-full bg-gray-900 overflow-auto max-h-[700px]" 
                data-timeline-container
              >
              
              {/* Enhanced Timeline Grid with improved proportions */}
              <div className="relative" style={{ height: `${(23 - 0 + 1) * 80}px` }}>
                
                {/* Enhanced Hour Markers and Labels */}
                {timeSlots.map((slot, index) => (
                  <motion.div
                    key={slot.hour}
                    className={cn(
                      "absolute w-full group/hour hover:bg-purple-500/5 transition-all duration-300 cursor-pointer",
                      slot.isCurrentHour && "bg-purple-500/10 border-l-4 border-purple-400/50"
                    )}
                    style={{ top: `${slot.hour * 80}px`, height: '80px' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      backgroundColor: "rgba(168, 85, 247, 0.05)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    {/* Enhanced hour line with gradient effect */}
                    <motion.div 
                      className="absolute w-full border-t border-gradient-to-r from-purple-500/40 via-gray-500/50 to-purple-500/40 shadow-sm"
                      whileHover={{
                        borderColor: "rgba(168, 85, 247, 0.7)",
                        boxShadow: "0 1px 3px rgba(168, 85, 247, 0.2)",
                        transition: { duration: 0.3 }
                      }}
                    />
                    
                    {/* Enhanced Hour Label with interactive background */}
                    <motion.div 
                      className="absolute left-4 top-1"
                      whileHover={{ scale: 1.05, x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div 
                        className="bg-gradient-to-r from-purple-900/70 to-purple-800/50 backdrop-blur-md border border-purple-500/30 rounded-lg px-3 py-1.5 shadow-lg group-hover/hour:border-purple-400/50 group-hover/hour:shadow-purple-500/30 transition-all duration-300"
                        whileHover={{
                          backgroundColor: "rgba(147, 51, 234, 0.2)",
                          boxShadow: "0 6px 25px rgba(168, 85, 247, 0.4)",
                          scale: 1.02
                        }}
                      >
                        <span className="text-sm font-extrabold text-purple-100 tracking-wide group-hover/hour:text-white transition-colors duration-200 drop-shadow-sm">
                          {slot.label}
                        </span>
                        {slot.hour === new Date().getHours() && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.3, 1],
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
                    
                    {/* Interactive Half-hour marker */}
                    <motion.div 
                      className="absolute left-16 right-4 border-t border-dashed border-gray-600/30 group-hover/hour:border-purple-400/50 transition-all duration-300"
                      style={{ top: '40px' }}
                      whileHover={{ 
                        borderColor: "rgba(168, 85, 247, 0.4)",
                        x: 4
                      }}
                    />
                    
                    {/* Ripple effect on click */}
                    <motion.div
                      className="absolute inset-0 bg-purple-400/10 rounded-lg opacity-0 pointer-events-none"
                      whileTap={{ 
                        opacity: [0, 0.3, 0],
                        scale: [0.8, 1, 1.1],
                        transition: { duration: 0.4 }
                      }}
                    />
                  </motion.div>
                ))}

                {/* Current Time Indicator */}
                {currentTimePosition >= 0 && (
                  <motion.div
                    className="absolute left-0 right-0 z-20 flex items-center"
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
                    {/* Animated blue line with pulse effect */}
                    <motion.div 
                      className="flex-1 relative"
                      animate={{ 
                        boxShadow: [
                          "0 0 10px rgba(59, 130, 246, 0.5)",
                          "0 0 20px rgba(59, 130, 246, 0.8)",
                          "0 0 10px rgba(59, 130, 246, 0.5)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-500" />
                      {/* Glowing effect */}
                      <motion.div 
                        className="absolute inset-0 h-0.5 bg-blue-400 blur-sm opacity-60"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                    
                    {/* Animated time bubble */}
                    <motion.div 
                      className="absolute right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl border border-blue-400/30"
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
                        className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full"
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

                {/* Enhanced Task Blocks Container with consistent width */}
                <div className="absolute left-20 right-4 top-0 bottom-0 bg-gradient-to-r from-transparent via-black/5 to-transparent rounded-lg" style={{ width: 'calc(100% - 96px)' }}>
                  {validTasks.length === 0 ? (
                    /* Empty state */
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8">
                        <div className="text-gray-500 text-sm mb-2">No valid tasks for today</div>
                        <div className="text-gray-600 text-xs">Tasks will appear here when you add them</div>
                      </div>
                    </div>
                  ) : (
                    validTasks.map((task, index) => {
                    const position = getTaskPosition(task.startTime, task.duration);
                    const categoryStyles = getCategoryStyles(task.category, task.completed);
                    return (
                      <motion.div
                        key={task.id}
                        className={cn(
                          "absolute rounded-xl cursor-pointer z-10 group",
                          "bg-gradient-to-br backdrop-blur-md shadow-xl border-2",
                          "transition-all duration-500 hover:shadow-2xl overflow-hidden",
                          "ring-0 ring-transparent hover:ring-2 hover:ring-white/20",
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
                          y: -1,
                          transition: { duration: 0.1 }
                        }}
                        onClick={() => setSelectedTask(task)}
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
                          
                          {/* Task header section */}
                          <div className="relative z-10 mb-auto">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 pr-2">
                                <h4 className={cn(
                                  "font-bold text-sm leading-tight transition-all duration-300 group-hover:text-white",
                                  task.completed ? "text-green-100 line-through decoration-2 decoration-green-400/60" : "text-white",
                                  task.duration >= 120 && "text-base" // Larger text for longer tasks
                                )}>
                                  {task.title}
                                </h4>
                                {task.description && task.duration >= 60 && (
                                  <p className={cn(
                                    "text-xs mt-1.5 leading-relaxed transition-all duration-300 line-clamp-2",
                                    task.completed ? "text-green-200/70" : "text-white/70 group-hover:text-white/85"
                                  )}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <motion.div
                                className="flex-shrink-0 mt-0.5"
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
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
                          </div>

                          {/* Smart content display based on card size */}
                          <div className="relative z-10 mt-auto">
                            <div className="flex items-center justify-between">
                              {/* Smart duration display - simple for short tasks, detailed for long ones */}
                              {task.duration <= 45 ? (
                                /* Short tasks: Just duration */
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-auto"
                                >
                                  <Badge className={cn(
                                    "text-xs font-bold transition-all duration-300 px-2.5 py-1 shadow-sm",
                                    task.completed 
                                      ? "bg-green-500/25 text-green-100 border border-green-400/50 shadow-green-500/30" 
                                      : "bg-white/20 text-white border border-white/30 group-hover:bg-white/30 group-hover:border-white/40 shadow-black/20"
                                  )}>
                                    {task.duration}m
                                  </Badge>
                                </motion.div>
                              ) : (
                                /* Longer tasks: More detailed info */
                                <div className="flex items-center justify-between w-full">
                                  {task.category && (
                                    <div className={cn(
                                      "flex items-center space-x-1 text-xs font-medium transition-all duration-300",
                                      task.completed ? "text-green-200/80" : "text-white/80 group-hover:text-white/95"
                                    )}>
                                      <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        task.category === 'morning' && "bg-amber-400",
                                        task.category === 'deep-work' && "bg-blue-500",
                                        task.category === 'light-work' && "bg-emerald-400",
                                        task.category === 'wellness' && "bg-teal-500",
                                        task.category === 'admin' && "bg-indigo-500"
                                      )} />
                                      <span className="capitalize text-xs">
                                        {task.category.replace('-', ' ')}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Badge className={cn(
                                      "text-xs font-bold transition-all duration-300 px-2.5 py-1 shadow-sm",
                                      task.completed 
                                        ? "bg-green-500/25 text-green-100 border border-green-400/50 shadow-green-500/30" 
                                        : "bg-white/20 text-white border border-white/30 group-hover:bg-white/30 group-hover:border-white/40 shadow-black/20",
                                      task.duration > 90 && "text-sm font-extrabold"
                                    )}>
                                      {task.duration < 60 
                                        ? `${task.duration}m`
                                        : task.duration % 60 === 0
                                          ? `${Math.floor(task.duration / 60)}h`
                                          : `${Math.floor(task.duration / 60)}h ${task.duration % 60}m`
                                      }
                                    </Badge>
                                  </motion.div>
                                </div>
                              )}
                            
                            {/* Enhanced intensity indicators - only for long tasks */}
                            {task.duration >= 90 && (
                              <div className="flex items-center justify-center space-x-1 mt-2">
                                {Array.from({ length: Math.min(4, Math.ceil(task.duration / 60)) }).map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className={cn(
                                      "rounded-full transition-all duration-300",
                                      task.completed 
                                        ? "bg-green-300/70 shadow-sm" 
                                        : "bg-white/70 group-hover:bg-white/90",
                                      i < 2 ? "w-1.5 h-1.5" : "w-1 h-1" // Vary sizes for visual interest
                                    )}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.08, duration: 0.4 }}
                                    whileHover={{ scale: 1.2 }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
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
        
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={handleToggleComplete}
      />
      
      {/* Time Block Form Modal */}
      <TimeBlockFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingBlock(null);
        }}
        onSubmit={handleCreateBlock}
        onUpdate={handleUpdateBlock}
        existingBlock={editingBlock}
        conflicts={conflicts}
        onCheckConflicts={handleCheckConflicts}
      />
      
      {/* Quick Task Scheduler */}
      {isQuickSchedulerOpen && (
        <div className="fixed top-4 right-4 w-96 max-w-[90vw] z-50">
          <QuickTaskScheduler
            isOpen={isQuickSchedulerOpen}
            onClose={() => setIsQuickSchedulerOpen(false)}
            selectedDate={selectedDate}
            onScheduleTask={handleScheduleTask}
          />
        </div>
      )}
    </div>
  );
};

// Memoized export for performance optimization
export const TimeboxSection = memo(TimeboxSectionComponent, (prevProps, nextProps) => {
  // Only re-render if selectedDate changes
  return format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
});