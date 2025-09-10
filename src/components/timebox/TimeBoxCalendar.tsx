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
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { timeboxApi, DaySchedule, TimeBoxTask, TimeSlot } from '@/api/timeboxApi';

interface TimeBoxCalendarProps {
  schedule: DaySchedule | null;
  onScheduleChange?: () => void;
  onTaskComplete?: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
  onStopTimer?: (taskId: string) => void;
  activeTimer?: string | null;
  className?: string;
}

export const TimeBoxCalendar: React.FC<TimeBoxCalendarProps> = ({
  schedule,
  onScheduleChange,
  onTaskComplete,
  onStartTimer,
  onStopTimer,
  activeTimer,
  className
}) => {
  const [draggedTask, setDraggedTask] = useState<TimeBoxTask | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Generate time slots from 6 AM to 10 PM
  const timeSlots = schedule?.timeSlots || timeboxApi.generateTimeSlots(
    schedule?.date || format(new Date(), 'yyyy-MM-dd')
  );

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
        console.log(`Scheduled ${draggedTask.title} to ${slot.startTime}`);
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

  // Get task icon based on type
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'deep_work':
        return Brain;
      case 'light_work':
        return Coffee;
      case 'break':
        return Timer;
      default:
        return Circle;
    }
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
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
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {format(new Date(schedule.date), 'EEEE, MMM d')}
              </h3>
            </div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
              {schedule.scheduledTasks.length} / {schedule.timeSlots.length} slots
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {/* Time Slots Calendar */}
            <div className="flex-1">
              <div className="flex">
                {/* Time Labels */}
                <div className="w-16 flex-shrink-0">
                  {timeSlots.slice(0, Math.ceil(timeSlots.length / 2)).map((slot, index) => {
                    const hour = 6 + Math.floor(index / 2);
                    return (
                      <div key={`hour-${hour}`} className="h-16 flex items-start justify-end pr-2 pt-1">
                        <span className="text-xs text-gray-400 font-medium">
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
                        const scheduledTask = schedule.scheduledTasks.find(
                          task => task.scheduledSlot?.id === slot.id
                        );
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
                                  scheduledTask.completed
                                    ? 'bg-green-600/30 border border-green-500/50'
                                    : scheduledTask.isActive
                                    ? 'bg-blue-600/40 border border-blue-400/70 shadow-lg'
                                    : scheduledTask.taskType === 'deep_work'
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
                                    {React.createElement(getTaskIcon(scheduledTask.taskType), {
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
                            {format(new Date(), 'HH:mm')}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Unscheduled Tasks Sidebar */}
            <div className="w-64 flex-shrink-0">
              <h4 className="text-sm font-semibold text-white mb-3">📋 Unscheduled Tasks</h4>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {schedule.unscheduledTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className={`p-3 rounded-lg cursor-move transition-all duration-200 ${
                        task.taskType === 'deep_work'
                          ? 'bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30'
                          : 'bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30'
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.05, rotate: 2 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 min-w-0">
                          {React.createElement(getTaskIcon(task.taskType), {
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
                  ))}
                  
                  {schedule.unscheduledTasks.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">All tasks scheduled!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default TimeBoxCalendar;