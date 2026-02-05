import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, Clock, LayoutGrid, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { TimeBlockFormModal } from '../components/TimeBlockFormModal';
import QuickTaskScheduler from '../components/QuickTaskScheduler';
import { useTimeBlocks } from '@/domains/lifelock/1-daily/2-tasks/domain/useTimeBlocks';
import { toast } from 'sonner';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { cn } from '@/lib/utils';

import { TimeboxSectionProps, TimeboxTask, DragPreviewState, GapFillerState, FocusSprintType, TimeboxViewMode } from '../../domain/types';
import { mapUIToCategory } from '../../domain/utils';
import { useAutoTimeblocks } from '@/domains/lifelock/1-daily/6-timebox/domain/useAutoTimeblocks';
import { useTimeboxCalculations } from '../../domain/useTimeboxCalculations';
import { useTimeboxHandlers } from '../../domain/useTimeboxHandlers';
import { TimeboxStats } from '../components/TimeboxStats';
import { TimeboxTimeline } from '../components/TimeboxTimeline';
import { DayForecast } from '../components/DayForecast';
import { DayProgressBar } from '../components/DayProgressBar';
import { NowTaskSpotlight } from '../components/NowTaskSpotlight';
import { AUTO_TIMEBOX_CONFIG, createOrUpdateAutoTimeboxes } from '@/domains/lifelock/_shared/services/autoTimeblockService';
import { Badge } from '@/components/ui/badge';
import { PlanningAssistant } from '../components/PlanningAssistant';
import { useNavigate } from 'react-router-dom';

const TimeboxSectionComponent: React.FC<TimeboxSectionProps> = ({ selectedDate }) => {
  // Navigation
  const navigate = useNavigate();

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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<TimeboxViewMode>('category');
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
    autoAdjustments,
    dayForecast,
    dayProgress,
    currentTaskInfo,
    timeboxXP,
    occupiedSlots
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
    handleQuickAddTask,
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
            <Card className="bg-sky-900/10 border-sky-700/30">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={`timebox-stat-skeleton-${index}`}
                      className="rounded-xl border border-sky-700/40 bg-sky-900/30 p-4 space-y-3"
                    >
                      <Skeleton className="h-4 w-24 bg-sky-500/20" />
                      <Skeleton className="h-8 w-20 bg-sky-400/30" />
                      <Skeleton className="h-2 w-full bg-sky-500/20 rounded-full" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-6 w-48 bg-sky-500/20" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={`timebox-timeline-skeleton-${index}`}
                        className="h-12 w-full bg-sky-900/30 border border-sky-700/40 rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-sky-900/20 border-sky-700/40">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-32 bg-sky-500/20" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton
                      key={`timebox-action-skeleton-${index}`}
                      className="h-12 w-full bg-sky-900/40 border border-sky-700/40 rounded-xl"
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

  // Handle navigation to Checkout
  const handleGoToCheckout = useCallback(() => {
    navigate('/lifelock/daily/checkout');
  }, [navigate]);

  // Handle adding more tasks
  const handleAddMoreTasks = useCallback(() => {
    setIsQuickSchedulerOpen(true);
  }, []);

  // Handle snooze task (postpone by N minutes)
  const handleSnoozeTask = useCallback(async (taskId: string, minutes: number) => {
    const task = validTasks.find(t => t.id === taskId);
    if (!task || !internalUserId) return;

    const startMinutes = timeToMinutes(task.startTime) ?? 0;
    const endMinutes = startMinutes + task.duration;

    const newStartMinutes = startMinutes + minutes;
    const newEndMinutes = endMinutes + minutes;

    const formatTime = (mins: number): string => {
      const normalized = mins % (24 * 60);
      const hours = Math.floor(normalized / 60);
      const minsVal = normalized % 60;
      return `${hours.toString().padStart(2, '0')}:${minsVal.toString().padStart(2, '0')}`;
    };

    try {
      const success = await updateTimeBlock(taskId, {
        userId: internalUserId,
        date: dateKey,
        startTime: formatTime(newStartMinutes),
        endTime: formatTime(newEndMinutes)
      });

      if (success) {
        toast.success(`Task postponed by ${minutes} minutes`);
      } else {
        toast.error('Failed to postpone task');
      }
    } catch (error) {
      console.error('Error snoozing task:', error);
      toast.error('Failed to postpone task');
    }
  }, [validTasks, internalUserId, dateKey, updateTimeBlock]);

  // Handle extend task duration
  const handleExtendTask = useCallback(async (taskId: string, minutes: number) => {
    const task = validTasks.find(t => t.id === taskId);
    if (!task || !internalUserId) return;

    const startMinutes = timeToMinutes(task.startTime) ?? 0;
    const endMinutes = startMinutes + task.duration;
    const newEndMinutes = endMinutes + minutes;

    const formatTime = (mins: number): string => {
      const normalized = mins % (24 * 60);
      const hours = Math.floor(normalized / 60);
      const minsVal = normalized % 60;
      return `${hours.toString().padStart(2, '0')}:${minsVal.toString().padStart(2, '0')}`;
    };

    try {
      const success = await updateTimeBlock(taskId, {
        userId: internalUserId,
        date: dateKey,
        startTime: task.startTime,
        endTime: formatTime(newEndMinutes)
      });

      if (success) {
        toast.success(`Task extended by ${minutes} minutes`);
      } else {
        toast.error('Failed to extend task');
      }
    } catch (error) {
      console.error('Error extending task:', error);
      toast.error('Failed to extend task');
    }
  }, [validTasks, internalUserId, dateKey, updateTimeBlock]);

  // Toggle focus mode
  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev);
  }, []);

  // Helper to convert time string to minutes
  const timeToMinutes = (time: string): number | null => {
    const match = time.trim().match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full relative">
          <div className="w-full max-w-none p-4 sm:p-6 space-y-4 pb-32">
          {/* Page Header - Title, Icon, Subtext */}
          <div className="px-3 py-4 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-sky-400" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-white tracking-tight">Timebox</h1>
                  <p className="text-xs text-white/60">Plan your day</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-900/60 rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => setViewMode('category')}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                      viewMode === 'category'
                        ? "bg-sky-500/20 text-sky-300"
                        : "text-white/50 hover:text-white/70"
                    )}
                    title="Category View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Category</span>
                  </button>
                  <button
                    onClick={() => setViewMode('energy')}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                      viewMode === 'energy'
                        ? "bg-sky-500/20 text-sky-300"
                        : "text-white/50 hover:text-white/70"
                    )}
                    title="Energy View"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Energy</span>
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-sky-400">{timeboxXP} XP</div>
                  <div className="text-xs text-sky-400/70">{todayStats.completionPercentage}% complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Progress Bar */}
          <div className="px-3">
            <DayProgressBar dayProgress={dayProgress} />
          </div>

          {/* Now Task Spotlight - Sticky Header */}
          <NowTaskSpotlight
            currentTaskInfo={currentTaskInfo}
            onToggleComplete={handleToggleComplete}
            onSnooze={handleSnoozeTask}
            onExtend={handleExtendTask}
            isFocusMode={isFocusMode}
            onToggleFocusMode={handleToggleFocusMode}
          />

          {/* Timeline */}
          <div className={cn("w-full transition-all duration-500", isFocusMode && "opacity-40 blur-[1px]")}>
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
              occupiedSlots={occupiedSlots}
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
              onQuickAddTask={handleQuickAddTask}
              viewMode={viewMode}
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

        {/* Day Completion Forecast Footer */}
        <DayForecast
          lastEndTime={dayForecast.lastEndTime}
          allCompleted={dayForecast.allCompleted}
          completionPercentage={dayForecast.completionPercentage}
          completionTime={dayForecast.completionTime}
          onGoToCheckout={handleGoToCheckout}
          onAddMoreTasks={handleAddMoreTasks}
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
