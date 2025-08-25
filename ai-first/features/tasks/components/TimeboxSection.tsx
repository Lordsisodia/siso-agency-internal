import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock,
  Calendar,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskDetailModal } from './TaskDetailModal';

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
}

const TimeboxSectionComponent: React.FC<TimeboxSectionProps> = ({
  selectedDate
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TimeboxTask | null>(null);
  
  // Enhanced task data with improved variety and realistic productivity scheduling
  const [tasks, setTasks] = useState<TimeboxTask[]>(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const savedTasks = localStorage.getItem(`lifelock-${dateKey}-timeline`);
    
    const defaultTasks: TimeboxTask[] = [
    {
      id: '1',
      title: '☀️ Morning Routine',
      startTime: '07:00',
      endTime: '07:30',
      duration: 30,
      category: 'morning',
      description: 'Meditation, stretching, coffee, and day planning',
      completed: true,
      color: 'from-amber-400/90 via-orange-500/80 to-yellow-500/70'
    },
    {
      id: '2', 
      title: '🧠 Deep Work Block 1',
      startTime: '08:00',
      endTime: '11:30',
      duration: 210,
      category: 'deep-work',
      description: 'Core development work - highest priority tasks',
      completed: false,
      color: 'from-blue-600/90 via-indigo-600/80 to-purple-600/80'
    },
    {
      id: '3',
      title: '📧 Admin & Light Work',
      startTime: '12:00', 
      endTime: '13:00',
      duration: 60,
      category: 'light-work',
      description: 'Emails, scheduling, quick tasks',
      completed: true,
      color: 'from-emerald-500/90 via-green-500/80 to-teal-500/70'
    },
    {
      id: '4',
      title: '🍽️ Lunch Break',
      startTime: '13:00',
      endTime: '13:30', 
      duration: 30,
      category: 'wellness',
      description: 'Mindful eating and rest',
      completed: false,
      color: 'from-lime-500/80 via-green-400/70 to-emerald-400/60'
    },
    {
      id: '5', 
      title: '🔥 Deep Work Block 2',
      startTime: '14:00',
      endTime: '16:30',
      duration: 150,
      category: 'deep-work',
      description: 'Focused coding and problem solving',
      completed: false,
      color: 'from-violet-600/90 via-purple-600/80 to-indigo-600/80'
    },
    {
      id: '6',
      title: '💪 Workout Session',
      startTime: '17:00',
      endTime: '17:45', 
      duration: 45,
      category: 'wellness',
      description: 'Strength training and cardio',
      completed: false,
      color: 'from-teal-600/90 via-cyan-500/80 to-blue-500/70'
    },
    {
      id: '7',
      title: '🌙 Evening Checkout',
      startTime: '20:30',
      endTime: '21:15', 
      duration: 45,
      category: 'admin',
      description: 'Day review, tomorrow planning, and reflection',
      completed: false,
      color: 'from-indigo-700/90 via-purple-700/80 to-violet-700/70'
    },
    {
      id: '8',
      title: '📚 Learning Block',
      startTime: '19:00',
      endTime: '20:00', 
      duration: 60,
      category: 'light-work',
      description: 'Reading, courses, or skill development',
      completed: false,
      color: 'from-cyan-600/80 via-blue-500/70 to-indigo-500/60'
    }
  ];
  
  return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
});

  // Generate hour slots from 6am to 11pm with enhanced formatting
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
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

  // Save tasks to localStorage when they change
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`lifelock-${dateKey}-timeline`, JSON.stringify(tasks));
  }, [tasks, selectedDate]);

  // Enhanced calculation for current time position with improved accuracy
  const getCurrentTimePosition = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Only show if within our timeline range (6am-11pm)
    if (hours < 6 || hours > 23) return -1;
    
    const PIXELS_PER_MINUTE = 80 / 60; // 1.333px per minute (80px per hour)
    const totalMinutesFromStart = (hours - 6) * 60 + minutes;
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
      
      const totalMinutesFromStart = (hours - 6) * 60 + minutes;
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

  // Optimized task completion toggle with error handling
  const handleToggleComplete = useCallback((taskId: string) => {
    try {
      setTasks(prevTasks => {
        const taskExists = prevTasks.some(task => task.id === taskId);
        if (!taskExists) {
          console.warn(`Task with ID ${taskId} not found`);
          return prevTasks;
        }
        
        return prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed }
            : task
        );
      });
      
      // Close modal after toggling for smoother UX
      setSelectedTask(null);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      // Keep modal open on error so user can retry
    }
  }, []);

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
  }, [currentTimePosition, validTasks]); // Trigger when current time or valid tasks change

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Enhanced Header */}
        <Card className="bg-gradient-to-br from-purple-900/30 via-purple-900/20 to-indigo-900/20 border-purple-700/40 shadow-2xl backdrop-blur-sm">
          <CardHeader className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 mr-4">
                  <Calendar className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Daily Timeline
                  </CardTitle>
                  <p className="text-purple-300/80 text-sm mt-1">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              {/* Quick stats */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{validTasks.filter(t => t.completed).length}</p>
                  <p className="text-xs text-green-300/80">Completed</p>
                </div>
                <div className="w-px h-8 bg-purple-600/50"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{validTasks.length}</p>
                  <p className="text-xs text-blue-300/80">Total Tasks</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gradient-to-r from-purple-600/30 via-purple-500/50 to-purple-600/30 my-6"></div>
            
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-xl p-4 border border-purple-600/30">
              <h3 className="font-bold text-purple-200 mb-3 text-base flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                Visual Time Management
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                See your entire day at a glance. The <span className="text-red-400 font-semibold">pulsing red line</span> shows your current time, 
                and color-coded task blocks show your scheduled activities. Click any task to view details or mark it complete.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0">
            {/* Enhanced Timeline Container with Scroll Indicators */}
            <div className="relative">
              {/* Scroll fade indicators */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900/80 to-transparent z-30 pointer-events-none rounded-t-2xl" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/80 to-transparent z-30 pointer-events-none rounded-b-2xl" />
              
              <div 
                className="relative bg-gradient-to-b from-gray-900/70 to-gray-800/50 border-2 border-purple-500/30 rounded-2xl overflow-auto max-h-[700px] shadow-inner backdrop-blur-md group hover:border-purple-400/40 transition-all duration-300 hover:shadow-purple-500/10" 
                data-timeline-container
              >
              
              {/* Enhanced Timeline Grid with improved proportions */}
              <div className="relative" style={{ height: `${(23 - 6 + 1) * 80}px` }}>
                
                {/* Enhanced Hour Markers and Labels */}
                {timeSlots.map((slot, index) => (
                  <motion.div
                    key={slot.hour}
                    className={cn(
                      "absolute w-full group/hour hover:bg-purple-500/5 transition-all duration-300 cursor-pointer",
                      slot.isCurrentHour && "bg-purple-500/10 border-l-4 border-purple-400/50"
                    )}
                    style={{ top: `${(slot.hour - 6) * 80}px`, height: '80px' }}
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
                            className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
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
                    {/* Animated red line with pulse effect */}
                    <motion.div 
                      className="flex-1 relative"
                      animate={{ 
                        boxShadow: [
                          "0 0 10px rgba(239, 68, 68, 0.5)",
                          "0 0 20px rgba(239, 68, 68, 0.8)",
                          "0 0 10px rgba(239, 68, 68, 0.5)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="h-0.5 bg-gradient-to-r from-red-400 to-red-500" />
                      {/* Glowing effect */}
                      <motion.div 
                        className="absolute inset-0 h-0.5 bg-red-400 blur-sm opacity-60"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </motion.div>
                    
                    {/* Animated time bubble */}
                    <motion.div 
                      className="absolute right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl border border-red-400/30"
                      whileHover={{ scale: 1.1 }}
                      animate={{ 
                        boxShadow: [
                          "0 4px 15px rgba(239, 68, 68, 0.3)",
                          "0 6px 20px rgba(239, 68, 68, 0.5)",
                          "0 4px 15px rgba(239, 68, 68, 0.3)"
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
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-300 rounded-full"
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
          </CardContent>
        </Card>
        
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
};

// Memoized export for performance optimization
export const TimeboxSection = memo(TimeboxSectionComponent, (prevProps, nextProps) => {
  // Only re-render if selectedDate changes
  return format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
});