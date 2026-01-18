/**
 * TimeBox Calendar - Visual day planner for real LifeLock tasks
 * Shows scheduled and unscheduled tasks in a 24-hour timeline view
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMinutes } from 'date-fns';
import { 
  Clock, 
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Move,
  Zap,
  Brain,
  Coffee,
  Timer,
  Settings,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { timeboxApi, DaySchedule, TimeBoxTask, TimeSlot } from '@/services/api/timeboxApi';
import { TaskIntegrationService, UnifiedTimeBoxTask } from '@/services/taskIntegrationService';

interface TimeBoxCalendarProps {
  schedule: DaySchedule | null;
  onScheduleChange?: () => void;
  onTaskComplete?: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
  onStopTimer?: (taskId: string) => void;
  onAutoSchedule?: () => void;
  activeTimer?: string | null;
  className?: string;
}

export const TimeBoxCalendar: React.FC<TimeBoxCalendarProps> = ({
  schedule,
  onScheduleChange,
  onTaskComplete,
  onStartTimer,
  onStopTimer,
  onAutoSchedule,
  activeTimer,
  className
}) => {
  const [draggedTask, setDraggedTask] = useState<TimeBoxTask | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'light_work' | 'deep_work' | 'morning_routine'>('all');
  const [unifiedTasks, setUnifiedTasks] = useState<UnifiedTimeBoxTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate time slots from 6 AM to 10 PM
  const timeSlots = schedule?.timeSlots || timeboxApi.generateTimeSlots(6, 22, 30);

  // Update current time every minute for accurate red line positioning
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Load unified tasks from LifeLock services
  useEffect(() => {
    const loadUnifiedTasks = async () => {
      try {
        setIsLoadingTasks(true);
        const tasks = await TaskIntegrationService.getUnifiedTasks();
        setUnifiedTasks(tasks);
      } catch (error) {
        console.error('Failed to load unified tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    loadUnifiedTasks();
  }, []);

  // Filter tasks by selected category
  const filteredTasks = TaskIntegrationService.filterTasksByCategory(unifiedTasks, selectedCategory);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, task: TimeBoxTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSlot(slot.id);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
    setHoveredSlot(null);
    
    if (draggedTask) {
      try {
        await timeboxApi.scheduleTask(draggedTask.id, slot);
        onScheduleChange?.();
        
      } catch (error) {
        console.error('Failed to schedule task:', error);
      }
    }
    setDraggedTask(null);
  };

  // Handle task unscheduling
  const handleUnscheduleTask = async (task: TimeBoxTask) => {
    try {
      await timeboxApi.unscheduleTask(task.id, schedule?.date || format(new Date(), 'yyyy-MM-dd'));
      onScheduleChange?.();
    } catch (error) {
      console.error('Failed to unschedule task:', error);
    }
  };

  // Get task icon based on category
  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'deep_work':
        return Brain;
      case 'light_work':
        return Coffee;
      case 'admin':
        return Settings;
      case 'learning':
        return Zap;
      case 'planning':
        return Calendar;
      default:
        return Circle;
    }
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    
    // Convert to position within our 6 AM - 10 PM range
    if (hour < 6 || hour > 22) return null;
    
    const totalMinutes = (hour - 6) * 60 + minute;
    const slotHeight = 64; // Each hour slot is 64px tall
    const pixelsPerMinute = slotHeight / 60;
    
    return totalMinutes * pixelsPerMinute;
  };

  const currentTimePosition = getCurrentTimePosition();

  if (!schedule) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 ${className}`}>
        <div className="p-4">
          {/* Auto Schedule Button */}
          {onAutoSchedule && (
            <div className="flex justify-center mb-4">
              <Button
                onClick={onAutoSchedule}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto Schedule
              </Button>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Time Slots Calendar */}
            <div className="flex-1">
              <div className="flex">
                {/* Time Labels */}
                <div className="w-12 lg:w-16 flex-shrink-0">
                  {Array.from({ length: 16 }, (_, i) => { // 6 AM to 10 PM = 16 hours
                    const hour = 6 + i;
                    return (
                      <div key={`hour-label-${hour}`} className="h-16 flex items-start justify-end pr-1 lg:pr-2 pt-1">
                        <span className="text-xs lg:text-xs text-gray-400 font-medium">
                          {format(new Date().setHours(hour, 0), 'HH:mm')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 relative">
                  <ScrollArea className="h-96">
                    <div className="relative">
                      {/* Time Slots */}
                      {timeSlots.map((slot, index) => {
                        const scheduledTask = slot.task;
                        const isHovered = hoveredSlot === slot.id;
                        
                        return (
                          <div
                            key={slot.id}
                            className={`h-8 border-b border-gray-700/50 relative transition-all duration-200 ${
                              isHovered && draggedTask 
                                ? 'bg-blue-500/20 border-blue-400/50' 
                                : index % 4 === 0 
                                  ? 'border-gray-600/70' 
                                  : 'border-gray-700/30'
                            }`}
                            onDragOver={(e) => handleDragOver(e, slot)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, slot)}
                          >
                            {/* Time Label for every hour */}
                            {index % 2 === 0 && (
                              <span className="absolute -left-12 top-0 text-xs text-gray-500">
                                {slot.startTime}
                              </span>
                            )}

                            {/* Scheduled Task */}
                            {scheduledTask && (
                              <motion.div
                                className={`absolute inset-x-2 inset-y-0.5 rounded px-2 py-1 cursor-pointer group ${
                                  scheduledTask.status === 'completed'
                                    ? 'bg-green-600/30 border border-green-500/50'
                                    : scheduledTask.status === 'in_progress'
                                    ? 'bg-blue-600/40 border border-blue-400/70 shadow-lg'
                                    : scheduledTask.category === 'deep_work'
                                    ? 'bg-purple-600/30 border border-purple-500/50'
                                    : 'bg-blue-600/30 border border-blue-500/50'
                                }`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => onTaskComplete?.(scheduledTask.id)}
                              >
                                <div className="flex items-center justify-between h-full">
                                  <div className="flex items-center space-x-1 min-w-0">
                                    {React.createElement(getTaskIcon(scheduledTask.category), {
                                      className: "h-3 w-3 flex-shrink-0 text-white"
                                    })}
                                    <span className="text-xs text-white font-medium truncate">
                                      {scheduledTask.title}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-5 w-5 p-0 text-white hover:bg-white/20"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (activeTimer === scheduledTask.id) {
                                              onStopTimer?.(scheduledTask.id);
                                            } else {
                                              onStartTimer?.(scheduledTask.id);
                                            }
                                          }}
                                        >
                                          {activeTimer === scheduledTask.id ? (
                                            <Pause className="h-3 w-3" />
                                          ) : (
                                            <Play className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {activeTimer === scheduledTask.id ? 'Stop timer' : 'Start timer'}
                                      </TooltipContent>
                                    </Tooltip>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-5 w-5 p-0 text-white hover:bg-white/20"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem
                                          onClick={() => handleUnscheduleTask(scheduledTask)}
                                        >
                                          <Move className="h-4 w-4 mr-2" />
                                          Unschedule
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Drop Zone Indicator */}
                            {isHovered && draggedTask && !scheduledTask && (
                              <div className="absolute inset-x-2 inset-y-0.5 border-2 border-dashed border-blue-400 rounded bg-blue-400/10 flex items-center justify-center">
                                <span className="text-xs text-blue-400 font-medium">Drop here</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Current Time Indicator */}
                      {currentTimePosition !== null && (
                        <motion.div
                          className="absolute left-0 right-4 z-10 flex items-center"
                          style={{ top: `${currentTimePosition}px` }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <div className="flex-1 h-0.5 bg-red-500" />
                          <span className="text-xs text-red-500 font-medium ml-2">
                            {format(currentTime, 'HH:mm')}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Unscheduled Tasks Sidebar */}
            <div className="w-full lg:w-64 lg:flex-shrink-0">
              <h4 className="text-sm font-semibold text-white mb-3">📋 Unscheduled Tasks</h4>
              
              {/* Category Filter Buttons */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <Button
                    size="sm"
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    className={`h-7 px-2 ${selectedCategory === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'text-white hover:bg-white/10'}`}
                  >
                    All ({unifiedTasks.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === 'light_work' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('light_work')}
                    className={`h-7 px-2 ${selectedCategory === 'light_work' ? 'bg-blue-600 hover:bg-blue-700' : 'text-white hover:bg-white/10'}`}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Light ({unifiedTasks.filter(t => t.category === 'light_work').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === 'deep_work' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('deep_work')}
                    className={`h-7 px-2 ${selectedCategory === 'deep_work' ? 'bg-purple-600 hover:bg-purple-700' : 'text-white hover:bg-white/10'}`}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Deep ({unifiedTasks.filter(t => t.category === 'deep_work').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedCategory === 'morning_routine' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('morning_routine')}
                    className={`h-7 px-2 ${selectedCategory === 'morning_routine' ? 'bg-orange-600 hover:bg-orange-700' : 'text-white hover:bg-white/10'}`}
                  >
                    <Coffee className="h-3 w-3 mr-1" />
                    Morning ({unifiedTasks.filter(t => t.category === 'morning_routine').length})
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-64 lg:h-96">
                <div className="space-y-2">
                  {isLoadingTasks ? (
                    <div className="text-center py-6">
                      <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Loading tasks...</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className={`p-3 rounded-lg cursor-move transition-all duration-200 ${
                        task.category === 'deep_work'
                          ? 'bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30'
                          : task.category === 'light_work'
                          ? 'bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30'
                          : 'bg-orange-600/20 border border-orange-500/40 hover:bg-orange-600/30'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task as any)}
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.05, rotate: 2 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 min-w-0">
                          {React.createElement(getTaskIcon(task.category), {
                            className: "h-4 w-4 flex-shrink-0 text-white mt-0.5"
                          })}
                          <div className="min-w-0">
                            <h6 className="text-sm font-medium text-white truncate">
                              {task.title}
                            </h6>
                            <p className="text-xs text-gray-300">
                              {task.estimatedDuration}m • {task.priority}
                            </p>
                          </div>
                        </div>
                        <Move className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))
                  )}
                  
                  {!isLoadingTasks && filteredTasks.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        {selectedCategory === 'all' ? 'All tasks scheduled!' : `No ${selectedCategory.replace('_', ' ')} tasks`}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TimeBoxCalendar;