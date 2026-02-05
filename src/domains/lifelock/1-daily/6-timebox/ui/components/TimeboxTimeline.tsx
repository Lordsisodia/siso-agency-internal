import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Lightbulb, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TimeboxTask, TimeSlot, DragPreviewState, GapFillerState, TaskPosition, TIMEBOX_HOUR_HEIGHT, TimeboxViewMode } from '../../domain/types';
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
  occupiedSlots: number[];
  getTaskPosition: (task: TimeboxTask) => TaskPosition;
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
  onQuickAddTask: (hour: number, title: string) => void;
  viewMode?: TimeboxViewMode;
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
  occupiedSlots,
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
  setIsQuickSchedulerOpen,
  onQuickAddTask,
  viewMode = 'category'
}, ref) => {
  // Track which slot is being edited for quick add
  const [quickAddSlot, setQuickAddSlot] = useState<number | null>(null);
  const [quickAddInput, setQuickAddInput] = useState('');

  // Check if a time slot has any tasks (using occupiedSlots prop)
  const hasTaskInSlot = (hour: number): boolean => {
    return occupiedSlots?.includes(hour) ?? false;
  };

  // Handle click on empty slot
  const handleSlotClick = (hour: number, e: React.MouseEvent) => {
    // Prevent if clicking on a task or if already editing
    if (hasTaskInSlot(hour) || quickAddSlot !== null) return;

    // Don't trigger if clicking on a task card
    const target = e.target as HTMLElement;
    if (target.closest('[data-task-card]')) return;

    setQuickAddSlot(hour);
    setQuickAddInput('');
  };

  // Handle quick add submit
  const handleQuickAddSubmit = (hour: number) => {
    if (!quickAddInput.trim()) {
      setQuickAddSlot(null);
      setQuickAddInput('');
      return;
    }

    onQuickAddTask(hour, quickAddInput.trim());
    setQuickAddSlot(null);
    setQuickAddInput('');
  };

  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent, hour: number) => {
    if (e.key === 'Enter') {
      handleQuickAddSubmit(hour);
    } else if (e.key === 'Escape') {
      setQuickAddSlot(null);
      setQuickAddInput('');
    }
  };

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
          <div className="absolute left-0 top-0 w-14 h-full bg-gray-950/80 border-r border-gray-700/30 rounded-l-2xl">
            {timeSlots.map((slot) => (
              <div
                key={slot.displayIndex}
                className={cn(
                  "absolute w-full flex items-center justify-end pr-3",
                  slot.isCurrentHour && "border-l-2 border-sky-400/60"
                )}
                style={{ top: `${slot.displayIndex * TIMEBOX_HOUR_HEIGHT}px`, height: `${TIMEBOX_HOUR_HEIGHT}px` }}
              >
                <span className={cn(
                  "text-xs font-medium tabular-nums text-right",
                  slot.isCurrentHour
                    ? "text-sky-300"
                    : "text-white/40"
                )}>
                  {slot.label}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Density Heatmap - Background layer */}
          <div className="absolute left-16 right-0 top-0 bottom-0 pointer-events-none">
            {timeSlots.map((slot, index) => (
              <motion.div
                key={`heatmap-${slot.displayIndex}`}
                className={cn(
                  "absolute w-full transition-all duration-700",
                  hourlyDensity[slot.displayIndex] === 0 && "bg-transparent",
                  hourlyDensity[slot.displayIndex] === 1 && "bg-sky-500/12",
                  hourlyDensity[slot.displayIndex] === 2 && "bg-sky-400/18",
                  hourlyDensity[slot.displayIndex] >= 3 && "bg-violet-500/24"
                )}
                style={{ top: `${slot.displayIndex * TIMEBOX_HOUR_HEIGHT}px`, height: `${TIMEBOX_HOUR_HEIGHT}px` }}
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
          {timeSlots.map((slot) => (
            <div
              key={`divider-${slot.displayIndex}`}
              className={cn(
                "absolute left-16 right-0 border-t transition-colors duration-200",
                slot.isCurrentHour
                  ? "border-sky-400/20"
                  : "border-white/[0.03] hover:border-white/[0.06]"
              )}
              style={{ top: `${slot.displayIndex * TIMEBOX_HOUR_HEIGHT}px` }}
            />
          ))}

          {/* Clickable Empty Slot Areas */}
          {timeSlots.map((slot) => {
            const slotHasTask = hasTaskInSlot(slot.hour);
            const isEditing = quickAddSlot === slot.hour;

            return (
              <motion.div
                key={`slot-${slot.displayIndex}`}
                className={cn(
                  "absolute left-16 right-0 cursor-pointer transition-all duration-200",
                  !slotHasTask && !isEditing && "hover:bg-white/[0.02]",
                  isEditing && "bg-white/[0.04] z-20"
                )}
                style={{
                  top: `${slot.displayIndex * TIMEBOX_HOUR_HEIGHT}px`,
                  height: `${TIMEBOX_HOUR_HEIGHT}px`
                }}
                onClick={(e) => handleSlotClick(slot.hour, e)}
              >
                {/* Inline Quick Add Input */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      className="absolute inset-2 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 w-full max-w-md">
                        <Input
                          autoFocus
                          type="text"
                          placeholder={`Add task at ${slot.label}...`}
                          value={quickAddInput}
                          onChange={(e) => setQuickAddInput(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, slot.hour)}
                          onBlur={() => handleQuickAddSubmit(slot.hour)}
                          className="flex-1 bg-gray-900/90 border-gray-600/50 text-white placeholder:text-gray-500 text-sm h-10 focus:border-sky-500/50 focus:ring-sky-500/20"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleQuickAddSubmit(slot.hour)}
                          className="bg-sky-600/80 hover:bg-sky-500 text-white h-10 px-3"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtle hint for empty slots */}
                {!slotHasTask && !isEditing && quickAddSlot === null && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                    initial={false}
                  >
                    <div className="flex items-center gap-1.5 text-white/20 text-xs">
                      <Plus className="h-3 w-3" />
                      <span>Click to add</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

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
              {/* Thin reference line */}
              <div className="flex-1 h-px bg-blue-400/30" />

              {/* Glassmorphism time pill */}
              <motion.div
                className="absolute left-20 flex items-center gap-2 bg-gray-900/60 backdrop-blur-md border border-blue-400/30 rounded-full px-3 py-1.5 pointer-events-auto cursor-default"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {/* Pulsing dot */}
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    opacity: [1, 0.4, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                {/* Time text */}
                <span className="text-blue-100 text-xs font-medium tabular-nums">
                  {format(currentTime, 'HH:mm')}
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Enhanced Task Blocks Container */}
          <div
            className="absolute left-16 right-0 top-0 bottom-0"
            onClick={onTimelineClick}
          >
            {/* Drag Time Preview with Conflict Visualization */}
            {dragPreview && (
              <motion.div
                className="absolute left-6 z-50 pointer-events-none"
                style={{ top: `${dragPreview.top}px`, transform: 'translateY(-50%)' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className={cn(
                  "px-4 py-2 rounded-full text-white text-xs font-bold shadow-xl border-2 transition-colors duration-200",
                  // Green: safe to drop (no conflicts)
                  !dragPreview.hasConflict && "bg-gradient-to-r from-green-500 to-emerald-600 border-white/40",
                  // Yellow: would overlap (show which task conflicts)
                  dragPreview.hasConflict && dragPreview.conflictingTasks?.[0] !== 'Outside timeline bounds' && "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-300/60",
                  // Red: invalid (outside bounds)
                  dragPreview.hasConflict && dragPreview.conflictingTasks?.[0] === 'Outside timeline bounds' && "bg-gradient-to-r from-red-500 to-rose-600 border-red-300/60"
                )}>
                  <div className="flex items-center gap-2">
                    <span>{dragPreview.startTime} → {dragPreview.endTime}</span>
                    {dragPreview.hasConflict && dragPreview.conflictingTasks && dragPreview.conflictingTasks.length > 0 && (
                      <span className="text-[10px] opacity-90">
                        ({dragPreview.conflictingTasks[0] === 'Outside timeline bounds'
                          ? 'Outside bounds'
                          : `Conflicts: ${dragPreview.conflictingTasks.slice(0, 2).join(', ')}${dragPreview.conflictingTasks.length > 2 ? ` +${dragPreview.conflictingTasks.length - 2}` : ''}`
                        })
                      </span>
                    )}
                  </div>
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
                    <Calendar className="h-20 w-20 mx-auto text-sky-500/30" />
                  </motion.div>
                  <h3 className="text-white text-xl font-semibold mb-3">Your Timeline is Empty</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Start planning your day by adding tasks from Deep Work or Light Work sections
                  </p>
                  <Button
                    onClick={() => setIsQuickSchedulerOpen(true)}
                    className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl px-6 py-3"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Task
                  </Button>
                </motion.div>
              </div>
            ) : (
              validTasks.map((task, index) => {
                const position = getTaskPosition(task);
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
                    viewMode={viewMode}
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
