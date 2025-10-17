import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Lightbulb, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { TimeboxTask, TimeSlot, DragPreviewState, GapFillerState, TaskPosition, TIMEBOX_HOUR_HEIGHT } from '../types';
import { TimeboxTaskCard } from './TimeboxTaskCard';

interface TimeboxTimelineProps {
  timeSlots: TimeSlot[];
  validTasks: TimeboxTask[];
  hourlyDensity: number[];
  currentTime: Date;
  currentTimePosition: number;
  draggingTaskId: string | null;
  swipingTaskId: string | null;
  swipeDirection: 'left' | 'right' | null;
  dragPreview: DragPreviewState | null;
  gapFiller: GapFillerState | null;
  gapSuggestions: any[];
  getTaskPosition: (startTime: string, duration: number) => TaskPosition;
  onToggleComplete: (taskId: string) => void;
  onAddAfter: (task: TimeboxTask, minutes: number) => void;
  onDragStart: (taskId: string) => void;
  onDrag: (taskId: string, info: any) => void;
  onDragEnd: (taskId: string, info: any) => void;
  onPan: (taskId: string, info: any) => void;
  onPanEnd: (taskId: string, info: any) => void;
  onTaskClick: (task: TimeboxTask) => void;
  onTaskDoubleClick: (task: TimeboxTask) => void;
  onTimelineClick: (e: React.MouseEvent) => void;
  onGapSchedule: (task: any) => void;
  onCloseGapFiller: () => void;
  setIsQuickSchedulerOpen: (open: boolean) => void;
}

export const TimeboxTimeline = forwardRef<HTMLDivElement, TimeboxTimelineProps>(({
  timeSlots,
  validTasks,
  hourlyDensity,
  currentTime,
  currentTimePosition,
  draggingTaskId,
  swipingTaskId,
  swipeDirection,
  dragPreview,
  gapFiller,
  gapSuggestions,
  getTaskPosition,
  onToggleComplete,
  onAddAfter,
  onDragStart,
  onDrag,
  onDragEnd,
  onPan,
  onPanEnd,
  onTaskClick,
  onTaskDoubleClick,
  onTimelineClick,
  onGapSchedule,
  onCloseGapFiller,
  setIsQuickSchedulerOpen
}, ref) => {
  return (
    <div className="relative w-full">
      <div
        className="relative w-full"
        data-timeline-container
        ref={ref}
      >
        {/* Enhanced Timeline Grid */}
        <div className="relative" style={{ height: `${(23 - 0 + 1) * TIMEBOX_HOUR_HEIGHT}px` }}>
          {/* Clean Time Sidebar */}
          <div className="absolute left-0 top-0 w-16 h-full bg-gray-950/80 border-r border-gray-700/30 rounded-l-2xl">
            {timeSlots.map((slot, index) => (
              <motion.div
                key={slot.hour}
                className={cn(
                  "absolute w-full flex items-center justify-end pr-2 group/hour transition-all duration-300",
                  slot.isCurrentHour && "bg-blue-500/10"
                )}
                style={{ top: `${slot.hour * TIMEBOX_HOUR_HEIGHT}px`, height: `${TIMEBOX_HOUR_HEIGHT}px` }}
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
                    "text-xs font-medium tracking-wide text-right",
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
                  hourlyDensity[slot.hour] === 1 && "bg-sky-500/12",
                  hourlyDensity[slot.hour] === 2 && "bg-sky-400/18",
                  hourlyDensity[slot.hour] >= 3 && "bg-violet-500/24"
                )}
                style={{ top: `${slot.hour * TIMEBOX_HOUR_HEIGHT}px`, height: `${TIMEBOX_HOUR_HEIGHT}px` }}
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
              style={{ top: `${slot.hour * TIMEBOX_HOUR_HEIGHT}px` }}
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
              {/* Subtle blue line */}
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
                {/* Glowing effect */}
                <motion.div
                  className="absolute inset-0 h-[2px] bg-blue-400/40 blur-md"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>

              {/* Animated time bubble */}
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

          {/* Enhanced Task Blocks Container */}
          <div
            className="absolute left-16 right-2 top-0 bottom-0"
            style={{ width: 'calc(100% - 72px)' }}
            onClick={onTimelineClick}
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
                      onClick={onCloseGapFiller}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {gapSuggestions.map((task, idx) => (
                      <motion.button
                        key={task.id}
                        onClick={() => onGapSchedule(task)}
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
                const position = getTaskPosition(task.startTime, task.endTime);
                return (
                  <TimeboxTaskCard
                    key={task.id}
                    task={task}
                    position={position}
                    currentTimePosition={currentTimePosition}
                    draggingTaskId={draggingTaskId}
                    swipingTaskId={swipingTaskId}
                    swipeDirection={swipeDirection}
                    index={index}
                    onToggleComplete={onToggleComplete}
                    onAddAfter={onAddAfter}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    onPan={onPan}
                    onPanEnd={onPanEnd}
                    onTaskClick={onTaskClick}
                    onTaskDoubleClick={onTaskDoubleClick}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TimeboxTimeline.displayName = 'TimeboxTimeline';
