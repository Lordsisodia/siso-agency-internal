/**
 * Enhanced TimeBox Calendar - 24-Hour Day View
 * Interactive calendar that displays all your tasks scheduled throughout the day
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { format, addMinutes, parseISO, differenceInMinutes, isToday } from 'date-fns';
import { 
  Clock, 
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  MoreVertical,
  Edit3,
  Move,
  Zap,
  Brain,
  Coffee,
  Dumbbell,
  Heart,
  Sun,
  Moon,
  Timer,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Settings
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { 
  EnhancedTimeBlock, 
  DaySchedule, 
  CalendarViewSettings,
  TimeBlockCategory,
  CompletionStatus 
} from '@/types/timeblock.types';

interface EnhancedTimeBoxCalendarProps {
  schedule: DaySchedule | null;
  onBlockClick?: (block: EnhancedTimeBlock) => void;
  onBlockComplete?: (blockId: string) => void;
  onBlockMove?: (blockId: string, newStartTime: string) => void;
  onOptimizeSchedule?: () => void;
  settings?: Partial<CalendarViewSettings>;
  className?: string;
}

export const EnhancedTimeBoxCalendar: React.FC<EnhancedTimeBoxCalendarProps> = ({
  schedule,
  onBlockClick,
  onBlockComplete,
  onBlockMove,
  onOptimizeSchedule,
  settings: userSettings,
  className
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Default settings
  const defaultSettings: CalendarViewSettings = {
    hourRange: { start: 6, end: 23 },
    timeSlotInterval: 30,
    showWeekends: true,
    showBuffers: true,
    showAlternatives: false,
    compactMode: false,
    showCategoryColors: true,
    showEnergyLevels: true,
    showProgress: true,
    allowDragDrop: true,
    allowInlineEdit: true,
    autoOptimize: false
  };

  const settings = { ...defaultSettings, ...userSettings };

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate hour labels
  const hours = useMemo(() => {
    const result = [];
    for (let hour = settings.hourRange.start; hour <= settings.hourRange.end; hour++) {
      result.push(hour);
    }
    return result;
  }, [settings.hourRange]);

  // Calculate time block position and height
  const calculateBlockPosition = (block: EnhancedTimeBlock) => {
    const hourHeight = 64; // h-16 = 64px per hour
    
    // Parse start time
    const startHour = parseInt(block.startTime.split(':')[0]);
    const startMinute = parseInt(block.startTime.split(':')[1]);
    
    // Parse end time to calculate actual duration
    const endHour = parseInt(block.endTime.split(':')[0]);
    const endMinute = parseInt(block.endTime.split(':')[1]);
    
    // Calculate position from the start of our hour range
    const startFromRangeStart = (startHour - settings.hourRange.start) * 60 + startMinute;
    const endFromRangeStart = (endHour - settings.hourRange.start) * 60 + endMinute;
    
    // Convert to pixels (64px per hour = 64/60 = 1.0667px per minute)
    const pixelsPerMinute = hourHeight / 60;
    const top = startFromRangeStart * pixelsPerMinute;
    const height = (endFromRangeStart - startFromRangeStart) * pixelsPerMinute;
    
    return { 
      top: Math.max(0, top), 
      height: Math.max(20, height) // Minimum 20px height for visibility
    };
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    if (!isToday(schedule?.date || new Date())) return null;
    
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (hour < settings.hourRange.start || hour > settings.hourRange.end) return null;
    
    const totalMinutes = (hour - settings.hourRange.start) * 60 + minute;
    const top = (totalMinutes / settings.timeSlotInterval) * (60 / settings.timeSlotInterval) * 16;
    
    return top;
  };

  // Get category icon
  const getCategoryIcon = (category: TimeBlockCategory) => {
    const iconMap = {
      'morning-routine': Sun,
      'deep-focus': Brain,
      'light-focus': Coffee,
      'workout': Dumbbell,
      'health': Heart,
      'break': Timer,
      'meal': Coffee,
      'commute': Move,
      'meeting': Calendar,
      'admin': Edit3,
      'learning': Brain,
      'creative': Zap,
      'maintenance': Settings,
      'social': Coffee,
      'sleep': Moon,
      'buffer': Timer
    };
    return iconMap[category] || Circle;
  };

  // Get completion status icon
  const getCompletionIcon = (status: CompletionStatus) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in-progress':
        return Play;
      case 'skipped':
        return RotateCcw;
      case 'cancelled':
        return AlertCircle;
      default:
        return Circle;
    }
  };

  // Get status color
  const getStatusColor = (status: CompletionStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-blue-500';
      case 'skipped':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  // Handle block click
  const handleBlockClick = (block: EnhancedTimeBlock) => {
    setSelectedBlock(selectedBlock === block.id ? null : block.id);
    onBlockClick?.(block);
  };

  // Handle block completion
  const handleBlockComplete = (block: EnhancedTimeBlock) => {
    const newStatus = block.completionStatus === 'completed' ? 'pending' : 'completed';
    onBlockComplete?.(block.id);
  };

  // Calculate schedule stats
  const stats = useMemo(() => {
    if (!schedule) return null;
    
    const blocks = schedule.timeBlocks;
    const completedBlocks = blocks.filter(b => b.completionStatus === 'completed');
    const inProgressBlocks = blocks.filter(b => b.completionStatus === 'in-progress');
    const totalWorkTime = blocks
      .filter(b => ['deep-focus', 'light-focus'].includes(b.category))
      .reduce((sum, b) => sum + b.duration, 0);
    
    return {
      total: blocks.length,
      completed: completedBlocks.length,
      inProgress: inProgressBlocks.length,
      completionRate: blocks.length > 0 ? (completedBlocks.length / blocks.length) * 100 : 0,
      workHours: Math.round(totalWorkTime / 60 * 10) / 10,
      focusHours: Math.round(schedule.totalFocusTime / 60 * 10) / 10
    };
  }, [schedule]);

  if (!schedule) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No schedule available</p>
            <Button 
              onClick={onOptimizeSchedule}
              className="mt-4"
              variant="outline"
            >
              Generate Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTimePosition = getCurrentTimePosition();

  return (
    <TooltipProvider>
      <Card className={cn("h-full flex flex-col", className)}>
        {/* Calendar Grid - Full height timeline */}
        <div className="flex-1 min-h-0 flex">
          {/* Time Labels */}
          <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-0">
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-start justify-end pr-3 pt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                    {format(new Date().setHours(hour, 0), 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Content */}
          <ScrollArea className="flex-1">
            <div ref={calendarRef} className="relative min-h-full">
              {/* Hour Grid Lines */}
              {hours.map((hour, index) => (
                <div 
                  key={hour} 
                  className={cn(
                    "h-16 border-b",
                    index % 2 === 0 
                      ? "border-gray-200 dark:border-gray-700" 
                      : "border-gray-100 dark:border-gray-800"
                  )}
                  style={{
                    background: index % 2 === 0 
                      ? 'transparent' 
                      : 'rgba(0,0,0,0.01)'
                  }}
                />
              ))}

              {/* Current Time Indicator */}
              {currentTimePosition !== null && (
                <motion.div
                  className="absolute left-2 right-2 z-30 flex items-center"
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

              {/* Time Blocks */}
              <AnimatePresence>
                {schedule.timeBlocks
                  .filter(block => block.startTime && block.endTime)
                  .map((block) => {
                    const { top, height } = calculateBlockPosition(block);
                    const Icon = getCategoryIcon(block.category);
                    const StatusIcon = getCompletionIcon(block.completionStatus);
                    const isSelected = selectedBlock === block.id;
                    const isDragged = draggedBlock === block.id;

                    return (
                      <motion.div
                        key={block.id}
                        className={cn(
                          "absolute left-3 right-3 rounded-lg border-2 cursor-pointer z-10",
                          "transition-all duration-200 hover:shadow-lg hover:shadow-black/10",
                          "backdrop-blur-sm mb-1",
                          isSelected && "ring-2 ring-blue-500 z-20 shadow-lg",
                          isDragged && "opacity-50 z-30",
                          block.completionStatus === 'completed' && "opacity-80"
                        )}
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          background: `linear-gradient(135deg, ${block.color}45, ${block.color}35)`,
                          borderColor: block.color,
                          minHeight: '48px',
                          boxShadow: `0 2px 8px ${block.color}15`
                        }}
                        onClick={() => handleBlockClick(block)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ 
                          scale: settings.allowDragDrop ? 1.01 : 1,
                          boxShadow: `0 4px 16px ${block.color}25`
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="p-4 h-full flex flex-col">
                          {/* Block Header */}
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon 
                                className="h-4 w-4 flex-shrink-0" 
                                style={{ color: block.color }}
                              />
                              <span 
                                className="text-sm font-semibold truncate text-gray-800 dark:text-gray-100"
                              >
                                {block.title}
                              </span>
                            </div>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlockComplete(block);
                                  }}
                                  className={cn(
                                    "flex-shrink-0 hover:scale-110 transition-all duration-200",
                                    "rounded-full p-1 hover:bg-white/20",
                                    getStatusColor(block.completionStatus)
                                  )}
                                >
                                  <StatusIcon className="h-5 w-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {block.completionStatus === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Time and Duration */}
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                            {block.startTime} - {block.endTime} • {block.duration}m
                          </div>

                          {/* Tags and Priority */}
                          {height > 60 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-2 py-1 font-medium"
                                style={{ 
                                  backgroundColor: `${block.color}25`,
                                  color: block.color,
                                  border: `1px solid ${block.color}50`
                                }}
                              >
                                {block.priority}
                              </Badge>
                              
                              {block.energyRequirement === 'high' && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs px-2 py-1 bg-orange-100 text-orange-700 border-orange-200"
                                >
                                  ⚡ High Energy
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* AI Reasoning (for larger blocks) */}
                          {height > 80 && block.aiReasoning && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {block.aiReasoning}
                            </p>
                          )}

                          {/* Progress Indicator */}
                          {block.completionStatus === 'in-progress' && (
                            <motion.div
                              className="mt-auto h-1 bg-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {/* Empty State for Time Slots */}
              {schedule.timeBlocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No tasks scheduled</p>
                    <Button onClick={onOptimizeSchedule} variant="outline">
                      Generate Schedule
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedTimeBoxCalendar;