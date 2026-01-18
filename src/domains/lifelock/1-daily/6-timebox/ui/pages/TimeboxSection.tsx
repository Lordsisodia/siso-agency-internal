import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { TimeBlockFormModal } from '../components/TimeBlockFormModal';
import QuickTaskScheduler from '../components/QuickTaskScheduler';
import { useTimeBlocks } from '@/lib/hooks/useTimeBlocks';
import { toast } from 'sonner';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';

import { TimeboxSectionProps, TimeboxTask, DragPreviewState, GapFillerState, FocusSprintType } from '../../domain/types';
import { mapUIToCategory } from '../../domain/utils';
import { useAutoTimeblocks } from '@/domains/lifelock/1-daily/6-timebox/domain/useAutoTimeblocks';
import { useTimeboxCalculations } from '../../domain/useTimeboxCalculations';
import { useTimeboxHandlers } from '../../domain/useTimeboxHandlers';
import { TimeboxStats } from '../components/TimeboxStats';
import { TimeboxTimeline } from '../components/TimeboxTimeline';
import { AUTO_TIMEBOX_CONFIG, createOrUpdateAutoTimeboxes } from '@/domains/lifelock/_shared/services/autoTimeblockService';
import { Badge } from '@/components/ui/badge';
import { PlanningAssistant } from '../components/PlanningAssistant';

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
  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [wakeUpTime, setWakeUpTime] = useState('');
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const processedAutoAdjustmentsRef = useRef<Set<string>>(new Set());
  const autoSyncingRef = useRef(false);


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
    refreshTimeBlocks,
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
    yesterdayStats,
    autoAdjustments
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

  useEffect(() => {
    if (!user?.id) {
      setWakeUpTime('');
      return;
    }

    let isActive = true;

    const fetchWakeUpTime = async () => {
      try {
        const response = await fetch(`/api/morning-routine/metadata?userId=${user.id}&date=${dateKey}`);
        if (response.ok) {
          const result = await response.json();
          const fetchedWakeUpTime =
            result?.data?.wakeUpTime ??
            result?.wakeUpTime ??
            result?.metadata?.wakeUpTime ??
            '';

          if (isActive) {
            setWakeUpTime(fetchedWakeUpTime || '');
          }
        } else if (isActive) {
          setWakeUpTime('');
        }
      } catch (error) {
        // API endpoint not available - user can manually set wake-up time
        if (import.meta.env.DEV) {
          console.debug('Wake-up time metadata API not available');
        }
        if (isActive) {
          setWakeUpTime('');
        }
      }
    };

    fetchWakeUpTime();

    return () => {
      isActive = false;
    };
  }, [user?.id, dateKey]);

  const handleAutoBlocksUpdated = useCallback(() => {
    refreshTimeBlocks();
  }, [refreshTimeBlocks]);

  useAutoTimeblocks({
    wakeUpTime,
    userId: internalUserId,
    selectedDate,
    enabled: Boolean(internalUserId && wakeUpTime),
    onAutoBlocksUpdated: handleAutoBlocksUpdated
  });

  useEffect(() => {
    processedAutoAdjustmentsRef.current.clear();
  }, [dateKey, internalUserId]);

  useEffect(() => {
    if (!internalUserId || autoAdjustments.length === 0) {
      return;
    }

    const pending = autoAdjustments.filter(adjustment => {
      const key = `${adjustment.id}-${adjustment.newStartTime}-${adjustment.newEndTime}`;
      return !processedAutoAdjustmentsRef.current.has(key);
    });

    if (pending.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      let adjustedAny = false;

      for (const adjustment of pending) {
        const key = `${adjustment.id}-${adjustment.newStartTime}-${adjustment.newEndTime}`;
        try {
          const success = await updateTimeBlock(adjustment.id, {
            userId: internalUserId,
            date: dateKey,
            startTime: adjustment.newStartTime,
            endTime: adjustment.newEndTime
          });

          if (cancelled) {
            return;
          }

          if (success) {
            processedAutoAdjustmentsRef.current.add(key);
            adjustedAny = true;
          }
        } catch (error) {
          console.error('Failed to auto-adjust time block', adjustment, error);
        }
      }

      if (!cancelled && adjustedAny) {
        toast.info('Timeline auto-adjusted to prevent overlap.');
        await refreshTimeBlocks();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoAdjustments, updateTimeBlock, refreshTimeBlocks, internalUserId, dateKey]);

  useEffect(() => {
    if (!internalUserId || !wakeUpTime || autoSyncingRef.current) {
      return;
    }

    const hasMorning = timeBlocks.some(block =>
      block.title === AUTO_TIMEBOX_CONFIG.morningRoutine.title ||
      (block.description ?? '').includes(AUTO_TIMEBOX_CONFIG.morningRoutine.metadataTag)
    );

    const hasNightly = timeBlocks.some(block =>
      block.title === AUTO_TIMEBOX_CONFIG.nightlyCheckout.title ||
      (block.description ?? '').includes(AUTO_TIMEBOX_CONFIG.nightlyCheckout.metadataTag)
    );

    if (hasMorning && hasNightly) {
      return;
    }

    autoSyncingRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const result = await createOrUpdateAutoTimeboxes(wakeUpTime, internalUserId, dateKey);
        if (!cancelled && result.success) {
          await refreshTimeBlocks();
        }
      } catch (error) {
        console.error('Failed to ensure auto timeboxes exist:', error);
      } finally {
        if (!cancelled) {
          autoSyncingRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
      autoSyncingRef.current = false;
    };
  }, [timeBlocks, internalUserId, wakeUpTime, dateKey, refreshTimeBlocks]);

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
      <div className="min-h-screen w-full mb-24 bg-black overflow-x-hidden">
        <div className="w-full relative">
        <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 space-y-6">
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
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full relative">
          <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pb-32">
          {/* Timeline - No header, no stats, just the timeline */}
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
            setAvailabilityMode(false);
          }}
          onSubmit={handleCreateBlock}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
          existingBlock={editingBlock}
          conflicts={conflicts}
          onCheckConflicts={handleCheckConflicts}
          userId={internalUserId}
          dateKey={dateKey}
          initialCategory={availabilityMode ? 'AVAILABILITY' : undefined}
          variant={availabilityMode ? 'fullscreen' : 'modal'}
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

        {/* AI Planning Assistant */}
        <PlanningAssistant
          selectedDate={selectedDate}
          createTimeBlock={handleCreateBlock}
          timeBlocks={timeBlocks}
        />
      </div>
    </div>
  );
};

// Memoized export for performance optimization
export const TimeboxSection = memo(TimeboxSectionComponent, (prevProps, nextProps) => {
  const dateEqual = format(prevProps.selectedDate, 'yyyy-MM-dd') === format(nextProps.selectedDate, 'yyyy-MM-dd');
  return dateEqual;
});
