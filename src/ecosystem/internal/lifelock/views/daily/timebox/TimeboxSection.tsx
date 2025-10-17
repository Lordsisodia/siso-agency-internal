import React, { useState, useEffect, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { format } from 'date-fns';
import { TimeBlockFormModal } from '@/ecosystem/internal/tasks/components/TimeBlockFormModal';
import QuickTaskScheduler from '@/ecosystem/internal/tasks/components/QuickTaskScheduler';
import { useTimeBlocks } from '@/shared/hooks/useTimeBlocks';
import { toast } from 'sonner';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';

import { TimeboxSectionProps, TimeboxTask, DragPreviewState, GapFillerState, FocusSprintType } from './types';
import { mapUIToCategory } from './utils';
import { useTimeboxCalculations } from './hooks/useTimeboxCalculations';
import { useTimeboxHandlers } from './hooks/useTimeboxHandlers';
import { TimeboxStats } from './components/TimeboxStats';
import { TimeboxTimeline } from './components/TimeboxTimeline';

const TimeboxSectionComponent: React.FC<TimeboxSectionProps> = ({ selectedDate }) => {
  // Authentication
  const { user, isSignedIn } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  // State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TimeboxTask | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isQuickSchedulerOpen, setIsQuickSchedulerOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreviewState | null>(null);
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [swipingTaskId, setSwipingTaskId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [gapFiller, setGapFiller] = useState<GapFillerState | null>(null);
  const [gapSuggestions, setGapSuggestions] = useState<any[]>([]);
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  console.log('🔍 [TIMEBOX] RENDER with internalUserId:', internalUserId, 'isSignedIn:', isSignedIn, 'date:', format(selectedDate, 'yyyy-MM-dd'));

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Database hook
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
  } = useTimeBlocks({
    userId: internalUserId,
    selectedDate,
    enableOptimisticUpdates: true
  });

  // Calculations hook (memoized data)
  const {
    timeSlots,
    tasks,
    validTasks,
    getTaskPosition,
    currentTimePosition,
    hourlyDensity,
    todayStats,
    yesterdayStats
  } = useTimeboxCalculations({ timeBlocks, selectedDate });

  // Handlers hook
  const {
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
    handlePan,
    handlePanEnd,
    handleTimelineClick,
    handleGapSchedule,
    createFocusSprint
  } = useTimeboxHandlers({
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
    userId: internalUserId,
    dateKey
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on page load
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container || currentTimePosition < 0) {
      return;
    }

    const scrollToPosition = Math.max(0, currentTimePosition - 200);
    const timeout = window.setTimeout(() => {
      container.scrollTo({
        top: scrollToPosition,
        behavior: 'smooth'
      });
    }, 800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [currentTimePosition, tasks]);

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

    try {
      localStorage.setItem('timebox-avg-durations', JSON.stringify(avgDurations));
    } catch (error) {
      console.warn('Failed to cache avg durations:', error);
    }
  }, [validTasks]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full mb-24 bg-black">
        <div className="w-full relative">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 space-y-6">
            <Card className="bg-purple-900/10 border-purple-700/30">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={`timebox-stat-skeleton-${index}`}
                      className="rounded-xl border border-purple-700/40 bg-purple-900/30 p-4 space-y-3"
                    >
                      <Skeleton className="h-4 w-24 bg-purple-500/20" />
                      <Skeleton className="h-8 w-20 bg-purple-400/30" />
                      <Skeleton className="h-2 w-full bg-purple-500/20 rounded-full" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-6 w-48 bg-purple-500/20" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={`timebox-timeline-skeleton-${index}`}
                        className="h-12 w-full bg-purple-900/30 border border-purple-700/40 rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-900/20 border-purple-700/40">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-32 bg-purple-500/20" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton
                      key={`timebox-action-skeleton-${index}`}
                      className="h-12 w-full bg-purple-900/40 border border-purple-700/40 rounded-xl"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-transparent">
      <div className="w-full relative">
        <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-10 py-6 pb-32 space-y-6">
          {/* Stats Section */}
          <TimeboxStats
            validTasks={validTasks}
            todayStats={todayStats}
            yesterdayStats={yesterdayStats}
            showComparison={showComparison}
            setShowComparison={setShowComparison}
          />

          {/* Add Tasks Button + Sprint Menu */}
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
                      {(['pomodoro', 'extended', 'deep'] as FocusSprintType[]).map((type) => {
                        const configs = {
                          pomodoro: { icon: '🍅', name: 'Classic Pomodoro', desc: '4x (25min work + 5min break) = 2 hours' },
                          extended: { icon: '⚡', name: 'Extended Focus', desc: '2x (50min work + 10min break) = 2 hours' },
                          deep: { icon: '🧠', name: 'Deep Immersion', desc: '2x (90min work + 20min break) = 3.5 hours' }
                        };
                        const config = configs[type];
                        return (
                          <Button
                            key={type}
                            onClick={() => {
                              const now = new Date();
                              const startTime = `${now.getHours().toString().padStart(2, '0')}:${Math.ceil(now.getMinutes() / 15) * 15}`;
                              createFocusSprint(startTime, type);
                            }}
                            className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-white justify-start"
                          >
                            <div className="flex flex-col items-start w-full">
                              <span className="font-semibold">{config.icon} {config.name}</span>
                              <span className="text-xs text-gray-300">{config.desc}</span>
                            </div>
                          </Button>
                        );
                      })}
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

          {/* Timeline */}
          <Card className="w-full bg-transparent border-gray-800/30 rounded-2xl">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-800/40">
                <span className="text-sm font-semibold text-white/90">Daily Timeline</span>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-3 w-3 rounded-sm bg-sky-500/15 border border-sky-400/30" />
                    Balanced load (1-2 tasks)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-3 w-3 rounded-sm bg-violet-500/20 border border-violet-400/40" />
                    Peak load (3+ tasks)
                  </span>
                </div>
              </div>
              <div className="w-full">
                <TimeboxTimeline
                  ref={timelineContainerRef}
                  timeSlots={timeSlots}
                  validTasks={validTasks}
                  hourlyDensity={hourlyDensity}
                  currentTime={currentTime}
                  currentTimePosition={currentTimePosition}
                  draggingTaskId={draggingTaskId}
                  swipingTaskId={swipingTaskId}
                  swipeDirection={swipeDirection}
                  dragPreview={dragPreview}
                  gapFiller={gapFiller}
                  gapSuggestions={gapSuggestions}
                  getTaskPosition={getTaskPosition}
                  onToggleComplete={handleToggleComplete}
                  onAddAfter={handleAddAfter}
                  onDragStart={setDraggingTaskId}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  onPan={handlePan}
                  onPanEnd={handlePanEnd}
                  onTaskClick={setSelectedTask}
                  onTaskDoubleClick={handleEditBlock}
                  onTimelineClick={handleTimelineClick}
                  onGapSchedule={(task) => handleGapSchedule(task, gapFiller)}
                  onCloseGapFiller={() => {
                    setGapFiller(null);
                    setGapSuggestions([]);
                  }}
                  setIsQuickSchedulerOpen={setIsQuickSchedulerOpen}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
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
            userId={internalUserId}
            dateKey={dateKey}
          />
        )}

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
          userId={internalUserId}
          dateKey={dateKey}
        />

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
  const dateEqual = format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
  return dateEqual;
});
