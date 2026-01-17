import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Droplets,
  Dumbbell,
  Brain,
  Newspaper,
  Target,
  Calendar as CalendarIcon,
  Activity,
  Heart,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import TextareaAutosize from 'react-textarea-autosize';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseUserId } from '@/lib/supabase-clerk';
import { MorningRoutineMetadata, useMorningRoutineSupabase } from '@/lib/hooks/useMorningRoutineSupabase';
import { SimpleThoughtDumpPage, ThoughtDumpResults, lifeLockVoiceTaskProcessor } from '@/domains/lifelock/1-daily/1-morning-routine/features/ai-thought-dump';
import type { ThoughtDumpResult } from '@/domains/lifelock/1-daily/1-morning-routine/features/ai-thought-dump';
import { getRotatingQuotes } from '@/lib/data/motivational-quotes';
import { debounce } from '@/lib/utils/debounce';
import { TimeScrollPicker } from '../components/TimeScrollPicker';
import { WaterTracker } from '../components/WaterTracker';
import { PushUpTracker } from '../components/PushUpTracker';
import { MeditationTracker } from '../components/MeditationTracker';
import { WakeUpTimeTracker } from '../components/WakeUpTimeTracker';
import { PlanDayActions } from '../components/PlanDayActions';
import { MotivationalQuotes } from '../components/MotivationalQuotes';
import { Skeleton } from '@/components/ui/skeleton';
import { useAutoTimeblocks } from '@/lib/hooks/useAutoTimeblocks';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import {
  calculateMinutesSinceWake,
  calculateStepXpMultiplier,
  calculateWakeUpXpMultiplier,
  getWakeUpTimestamp
} from '../../domain/morningRoutineXpUtils';
import {
  calculateWakeUpXP,
  calculateFreshenUpXP,
  calculateGetBloodFlowingXP,
  calculatePowerUpBrainXP,
  calculatePlanDayXP,
  calculateMeditationXP,
  calculatePrioritiesXP,
  calculateTotalMorningXP
} from '../../domain/xpCalculations';
import { calculateWaterXP } from '@/domains/lifelock/1-daily/5-stats/features/wellness/domain/xpCalculations';
import { XPPill } from '../components/XPPill';
import { XPFooterSummary } from '../components/XPFooterSummary';

interface MorningRoutineHabit {
  name: string;
  completed: boolean;
}

interface MorningRoutineData {
  id: string;
  userId: string;
  date: string;
  items: MorningRoutineHabit[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

interface MorningRoutineSectionProps {
  selectedDate: Date;
}

interface MorningRoutineXPState {
  wakeAwarded: boolean;
  steps: Record<string, boolean>;
  lastCompletionTimestamp: number | null;
}

const createDefaultXpState = (): MorningRoutineXPState => ({
  wakeAwarded: false,
  steps: {},
  lastCompletionTimestamp: null
});

const loadXpStateFromStorage = (storageKey: string): MorningRoutineXPState => {
  if (typeof window === 'undefined') {
    return createDefaultXpState();
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return createDefaultXpState();
    }

    const parsed = JSON.parse(stored);
    return {
      wakeAwarded: Boolean(parsed?.wakeAwarded),
      steps: typeof parsed?.steps === 'object' && parsed.steps !== null ? { ...parsed.steps } : {},
      lastCompletionTimestamp:
        typeof parsed?.lastCompletionTimestamp === 'number'
          ? parsed.lastCompletionTimestamp
          : null
    };
  } catch (error) {
    console.error('Failed to read morning routine XP state:', error);
    return createDefaultXpState();
  }
};

const persistXpStateToStorage = (storageKey: string, state: MorningRoutineXPState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist morning routine XP state:', error);
  }
};

const MORNING_ROUTINE_TASKS = [
  {
    key: 'wakeUp' as const,
    title: 'Wake Up',
    description: 'Start the day before midday to maximize productivity. Track your wake-up time.',
    icon: Sun,
    hasTimeTracking: true,
    subtasks: []
  },
  {
    key: 'freshenUp' as const,
    title: 'Freshen Up',
    description: 'Cold shower to wake up - Personal hygiene and cleanliness.',
    icon: Droplets,
    hasTimeTracking: false,
    subtasks: [
      { key: 'bathroom', title: 'Bathroom break' },
      { key: 'brushTeeth', title: 'Brush teeth' },
      { key: 'coldShower', title: 'Cold shower' }
    ]
  },
  {
    key: 'getBloodFlowing' as const,
    title: 'Get Blood Flowing',
    description: 'Max rep push-ups (Target PB: 30) - Physical activation to wake up the body.',
    icon: Dumbbell,
    hasTimeTracking: false,
    subtasks: [
      { key: 'pushups', title: 'Push-ups (PB 30)' }
    ]
  },
  {
    key: 'powerUpBrain' as const,
    title: 'Power Up Brain',
    description: 'Hydrate and fuel the body and mind.',
    icon: Brain,
    hasTimeTracking: false,
    subtasks: [
      { key: 'supplements', title: 'Supplements' },
      { key: 'water', title: 'Water (500ml)' }
    ]
  },
  {
    key: 'planDay' as const,
    title: 'Plan Day',
    description: 'Use AI Thought Dump to organize tasks and set timebox.',
    icon: CalendarIcon,
    hasTimeTracking: false,
    subtasks: []
  },
  {
    key: 'meditation' as const,
    title: 'Meditation',
    description: 'Meditate to set an innovative mindset for creating business value.',
    icon: Heart,
    hasTimeTracking: true,
    subtasks: []
  }
];

export const MorningRoutineSection: React.FC<MorningRoutineSectionProps> = React.memo(({
  selectedDate
}) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mindset tab state
  const [activeMindsetTab, setActiveMindsetTab] = useState<'coding' | 'rules' | 'quotes'>('coding');

  // Thought Dump AI state (persist across HMR refreshes)
  const [showThoughtDumpChat, setShowThoughtDumpChat] = useState(() => {
    // Check sessionStorage to preserve state during HMR
    return sessionStorage.getItem('thoughtDumpOpen') === 'true';
  });
  const [thoughtDumpResult, setThoughtDumpResult] = useState<ThoughtDumpResult | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Persist thought dump open state
  useEffect(() => {
    sessionStorage.setItem('thoughtDumpOpen', showThoughtDumpChat ? 'true' : 'false');
  }, [showThoughtDumpChat]);

  const routineDate = useMemo(() => {
    if (selectedDate && !Number.isNaN(selectedDate.getTime())) {
      return selectedDate;
    }
    return new Date();
  }, [selectedDate]);

  const routineDateKey = useMemo(() => format(routineDate, 'yyyy-MM-dd'), [routineDate]);

  const {
    routine: morningRoutineState,
    loading: routineLoading,
    error: routineError,
    toggleHabit: toggleMorningHabit,
    updateMetadata: persistMorningMetadata,
  } = useMorningRoutineSupabase(selectedDate);

  const [wakeUpTime, setWakeUpTime] = useState<string>('');

  const [isEditingWakeTime, setIsEditingWakeTime] = useState(false);
  const [showTimeScrollPicker, setShowTimeScrollPicker] = useState(false);

  const [meditationDuration, setMeditationDuration] = useState<string>('');

  const [isEditingMeditationTime, setIsEditingMeditationTime] = useState(false);
  const [localProgressTrigger, setLocalProgressTrigger] = useState(0);

  // Plan Day completion state
  const [isPlanDayComplete, setIsPlanDayComplete] = useState<boolean>(false);

// Water tracking state
const [waterAmount, setWaterAmount] = useState<number>(0);
const waterXPRef = useRef(0);

  // Push-ups tracking state
  const [pushupReps, setPushupReps] = useState<number>(0);

  const [pushupPB, setPushupPB] = useState<number>(() => {
    // PB is global, not per day
    const saved = localStorage.getItem('lifelock-pushupPB');
    return saved ? parseInt(saved) : 30; // Default PB is 30
  });

  // Top 3 Daily Priorities (after meditation)
  const [dailyPriorities, setDailyPriorities] = useState<string[]>(['', '', '']);

  // 🤖 Auto-create timeboxes based on wake-up time
  useAutoTimeblocks({
    wakeUpTime,
    userId: internalUserId,
    selectedDate,
    enabled: !!wakeUpTime && !!internalUserId // Only create if wake-up time is set
  });

  // 🎮 XP System State
  const xpStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${routineDateKey}-morningXpState`;
  }, [internalUserId, routineDateKey]);

  const waterXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${routineDateKey}-waterXP`;
  }, [internalUserId, routineDateKey]);

  // Local fallback for pushups/water when not signed in or sync fails
  useEffect(() => {
    const localPushups = localStorage.getItem(`lifelock-pushups-${routineDateKey}`);
    if (localPushups && !internalUserId) {
      setPushupReps(Number(localPushups));
    }

    const localWater = localStorage.getItem(`lifelock-water-amount-${routineDateKey}`);
    if (localWater && !internalUserId) {
      setWaterAmount(Number(localWater));
    }
  }, [routineDateKey, internalUserId]);

  useEffect(() => {
    localStorage.setItem(`lifelock-pushups-${routineDateKey}`, String(pushupReps));
  }, [pushupReps, routineDateKey]);

  useEffect(() => {
    localStorage.setItem(`lifelock-water-amount-${routineDateKey}`, String(waterAmount));
  }, [waterAmount, routineDateKey]);

  const [xpState, setXpState] = useState<MorningRoutineXPState>(() => loadXpStateFromStorage(xpStorageKey));

  useEffect(() => {
    setXpState(loadXpStateFromStorage(xpStorageKey));
  }, [xpStorageKey]);

  useEffect(() => {
    persistXpStateToStorage(xpStorageKey, xpState);
  }, [xpState, xpStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(waterXPStorageKey);
    waterXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [waterXPStorageKey]);

  const meditationPreviousValue = useRef<string>(meditationDuration);
  const planDayPreviousValue = useRef<boolean>(isPlanDayComplete);

  useEffect(() => {
    if (routineError) {
      setError(routineError);
    }
  }, [routineError]);

  useEffect(() => {
    if (!morningRoutineState) return;

    setMorningRoutine({
      id: morningRoutineState.id,
      userId: morningRoutineState.userId,
      date: morningRoutineState.date,
      items: morningRoutineState.items,
      completedCount: morningRoutineState.completedCount,
      totalCount: morningRoutineState.totalCount,
      completionPercentage: morningRoutineState.completionPercentage,
    });

    setWakeUpTime(morningRoutineState.metadata.wakeUpTime ?? '');
    setWaterAmount(morningRoutineState.metadata.waterAmount ?? 0);
    setMeditationDuration(morningRoutineState.metadata.meditationDuration ?? '');
    setPushupReps(morningRoutineState.metadata.pushupReps ?? 0);
    setDailyPriorities(morningRoutineState.metadata.dailyPriorities ?? ['', '', '']);
    setIsPlanDayComplete(morningRoutineState.metadata.isPlanDayComplete ?? false);
  }, [morningRoutineState]);

  // Load morning routine data
  useEffect(() => {
    setLoading(routineLoading);
  }, [routineLoading]);

  // Save wake-up time to Supabase + localStorage (debounced)
  const debouncedMetadataUpdate = useMemo(() => {
    if (!morningRoutineState) {
      return null;
    }

    const update = debounce((payload: Partial<MorningRoutineMetadata>) => {
      void persistMorningMetadata(payload);
    }, 500);

    return update;
  }, [morningRoutineState, persistMorningMetadata]);

  useEffect(() => {
    return () => {
      debouncedMetadataUpdate?.cancel();
    };
  }, [debouncedMetadataUpdate]);

  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    debouncedMetadataUpdate?.({ wakeUpTime });
  }, [wakeUpTime, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save water amount to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    debouncedMetadataUpdate?.({ waterAmount });
  }, [waterAmount, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save meditation duration to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    debouncedMetadataUpdate?.({ meditationDuration });
  }, [meditationDuration, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save push-up reps to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    debouncedMetadataUpdate?.({ pushupReps });
  }, [pushupReps, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save push-up PB to localStorage (global, not per day)
  useEffect(() => {
    localStorage.setItem('lifelock-pushupPB', pushupPB.toString());
  }, [pushupPB]);

  // Save daily priorities to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime()) || !internalUserId) return;

    debouncedMetadataUpdate?.({ dailyPriorities });
  }, [dailyPriorities, selectedDate, internalUserId, debouncedMetadataUpdate, routineDateKey]);

  // Save Plan Day completion to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime()) || !internalUserId) return;

    debouncedMetadataUpdate?.({ isPlanDayComplete });
  }, [isPlanDayComplete, selectedDate, internalUserId, debouncedMetadataUpdate, routineDateKey]);

  const awardWakeUpXp = useCallback((time: string) => {
    if (!time) {
      return;
    }

    let shouldAward = false;
    const wakeTimestamp = getWakeUpTimestamp(routineDate, time);

    setXpState(prev => {
      if (prev.wakeAwarded) {
        return prev;
      }

      shouldAward = true;
      return {
        wakeAwarded: true,
        steps: { ...prev.steps },
        lastCompletionTimestamp: wakeTimestamp ?? prev.lastCompletionTimestamp
      };
    });

    if (!shouldAward) {
      return;
    }

    try {
      const multiplier = calculateWakeUpXpMultiplier(time);
      GamificationService.awardXP('wake_up_tracked', multiplier);
    } catch (error) {
      console.error('Failed to award XP for wake-up time:', error);
    }
  }, [routineDate]);

  useEffect(() => {
    if (wakeUpTime) {
      awardWakeUpXp(wakeUpTime);
    }
  }, [wakeUpTime, awardWakeUpXp]);

  useEffect(() => {
    if (!wakeUpTime) {
      return;
    }

    const wakeTimestamp = getWakeUpTimestamp(routineDate, wakeUpTime);
    if (wakeTimestamp === null) {
      return;
    }

    setXpState(prev => {
      if (!prev.wakeAwarded) {
        return prev;
      }

      if (Object.keys(prev.steps).length > 0 || prev.lastCompletionTimestamp === wakeTimestamp) {
        return prev;
      }

      return {
        ...prev,
        lastCompletionTimestamp: wakeTimestamp
      };
    });
  }, [wakeUpTime, routineDate]);

  const awardHabitCompletion = useCallback((habitKey: string) => {
    let shouldAward = false;
    let previousTimestamp: number | null = null;
    let completionTimestamp = Date.now();

    setXpState(prev => {
      if (prev.steps[habitKey]) {
        return prev;
      }

      shouldAward = true;
      previousTimestamp = prev.lastCompletionTimestamp ?? null;
      completionTimestamp = Date.now();

      return {
        wakeAwarded: prev.wakeAwarded,
        steps: { ...prev.steps, [habitKey]: true },
        lastCompletionTimestamp: completionTimestamp
      };
    });

    if (!shouldAward) {
      return;
    }

    const minutesSinceWake = wakeUpTime
      ? calculateMinutesSinceWake(wakeUpTime, routineDate, completionTimestamp)
      : null;

    const minutesSincePrevious =
      previousTimestamp !== null
        ? (completionTimestamp - previousTimestamp) / 60000
        : null;

    const wakeMultiplier = wakeUpTime ? calculateWakeUpXpMultiplier(wakeUpTime) : 1;

    try {
      const multiplier = calculateStepXpMultiplier({
        minutesSinceWake,
        minutesSincePrevious,
        wakeUpMultiplier: wakeMultiplier
      });
      GamificationService.awardXP('morning_routine_step', multiplier);
    } catch (error) {
      console.error('Failed to award XP for morning routine habit:', error);
    }
  }, [wakeUpTime, routineDate]);

  useEffect(() => {
    if (
      meditationDuration &&
      meditationDuration !== meditationPreviousValue.current &&
      !xpState.steps.meditation
    ) {
      awardHabitCompletion('meditation');
    }
    meditationPreviousValue.current = meditationDuration;
  }, [meditationDuration, xpState.steps.meditation, awardHabitCompletion]);

  useEffect(() => {
    if (
      isPlanDayComplete &&
      planDayPreviousValue.current !== isPlanDayComplete &&
      !xpState.steps.planDay
    ) {
      awardHabitCompletion('planDay');
    }
    planDayPreviousValue.current = isPlanDayComplete;
  }, [isPlanDayComplete, xpState.steps.planDay, awardHabitCompletion]);

  // Water tracking functions
  const incrementWater = () => {
    setWaterAmount(prev => prev + 100);
  };

  const decrementWater = () => {
    setWaterAmount(prev => Math.max(0, prev - 100)); // Don't go below 0
  };

  // Push-up tracking functions
  const updatePushupReps = (reps: number) => {
    setPushupReps(reps);
    // Update PB if new record!
    if (reps > pushupPB) {
      setPushupPB(reps);
    }
  };

  // Handle habit toggle
  const handleHabitToggle = async (habitKey: string, completed: boolean) => {
    if (!selectedDate) return;

    try {
      await toggleMorningHabit(habitKey, completed);

      if (completed) {
        awardHabitCompletion(habitKey);
      }

      setLocalProgressTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating habit:', error);
      setError('Failed to update habit completion');
    }
  };

  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle setting current time as wake-up time
  const setCurrentTimeAsWakeUp = () => {
    setWakeUpTime(getCurrentTime());
    setIsEditingWakeTime(false);
  };

  // Helper function to check if a habit is completed
  const isHabitCompleted = useCallback((habitKey: string): boolean => {
    if (!morningRoutine || !morningRoutine.items) {
      return false;
    }

    const habit = morningRoutine.items.find(item => item.name === habitKey);
    return habit?.completed ?? false;
  }, [morningRoutine]);

  // Smart completion check based on data, not checkboxes
  const isTaskComplete = useCallback((taskKey: string, subtasks: any[]): boolean => {
    switch (taskKey) {
      case 'wakeUp':
        return wakeUpTime !== ''; // Complete when time is set
      case 'freshenUp':
      case 'getBloodFlowing':
      case 'powerUpBrain':
        // Complete when all subtasks are checked
        return subtasks.length > 0 && subtasks.every(subtask => isHabitCompleted(subtask.key));
      case 'planDay':
        return isPlanDayComplete; // Complete when manually marked or AI marks it
      case 'meditation':
        return meditationDuration !== ''; // Complete when duration is entered
      default:
        return false;
    }
  }, [wakeUpTime, meditationDuration, isPlanDayComplete, isHabitCompleted]);

  // Calculate progress based on smart completion logic
  const getRoutineProgress = useCallback(() => {
    const totalTasks = MORNING_ROUTINE_TASKS.length;
    const completedTasks = MORNING_ROUTINE_TASKS.filter(task =>
      isTaskComplete(task.key, task.subtasks)
    ).length;

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [isTaskComplete]);

  const morningRoutineProgress = useMemo(() => {
    return getRoutineProgress();
  }, [getRoutineProgress]);

  // Get today's rotating motivational quotes
  const todaysQuotes = useMemo(() => {
    return getRotatingQuotes(selectedDate);
  }, [selectedDate]);

  // 🎮 Calculate total XP for today
  const todayXP = useMemo(() => {
    const result = calculateTotalMorningXP({
      wakeUpTime,
      date: selectedDate,
      freshenUp: {
        bathroom: isHabitCompleted('bathroom'),
        brushTeeth: isHabitCompleted('brushTeeth'),
        coldShower: isHabitCompleted('coldShower')
      },
      pushupReps,
      pushupPB,
      waterAmount,
      supplementsCompleted: isHabitCompleted('supplements'),
      planDayComplete: isPlanDayComplete,
      meditationDuration,
      priorities: dailyPriorities
    });
    return result;
  }, [wakeUpTime, selectedDate, isHabitCompleted, pushupReps, pushupPB, waterAmount, isPlanDayComplete, meditationDuration, dailyPriorities]);

  const waterXP = useMemo(() => {
    const result = calculateWaterXP(waterAmount, 2000, 0);
    return result.total;
  }, [waterAmount]);

  useEffect(() => {
    if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const isViewingToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    if (!isViewingToday) {
      return;
    }

    if (todayXP.total <= 0) {
      return;
    }

    const breakdown = GamificationService.getDailyXPBreakdown(selectedDate);
    const recordedRoutineXP = breakdown?.categories?.routine ?? 0;
    const diff = todayXP.total - recordedRoutineXP;

    if (diff > 0) {
      const multiplier = diff / 100;
      GamificationService.awardXP('morning_routine_complete', multiplier);
    }
  }, [selectedDate, todayXP.total]);

  useEffect(() => {
    if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const isViewingToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    if (!isViewingToday) {
      return;
    }

    if (waterXP > waterXPRef.current) {
      const diff = waterXP - waterXPRef.current;
      const multiplier = diff / 30;
      GamificationService.awardXP('water_goal_met', multiplier);
      waterXPRef.current = waterXP;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(waterXPStorageKey, waterXP.toString());
      }
    } else if (waterXP < waterXPRef.current) {
      waterXPRef.current = waterXP;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(waterXPStorageKey, waterXP.toString());
      }
    }
  }, [selectedDate, waterXP, waterXPStorageKey]);

  // Thought dump handler
  const handleThoughtDumpSubmit = async (input: string) => {
    setIsProcessingVoice(true);
    try {
      const result = await lifeLockVoiceTaskProcessor.processThoughtDump(input);
      setThoughtDumpResult(result);
    } catch (error) {
      console.error('Thought dump processing failed:', error);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-x-hidden">
        <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
          <Card className="w-full bg-orange-900/20 border-orange-700/50">
            <CardHeader className="p-3 sm:p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full bg-orange-400/30" />
                  <Skeleton className="h-5 w-36 bg-orange-400/20" />
                </div>
                <Skeleton className="h-4 w-16 bg-orange-400/20" />
              </div>
              <Skeleton className="h-2 w-full bg-orange-400/20 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-4 pb-16">
              {Array.from({ length: MORNING_ROUTINE_TASKS.length }).map((_, index) => (
                <div
                  key={`morning-skeleton-${index}`}
                  className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 w-full">
                      <Skeleton className="h-5 w-5 rounded-md bg-orange-400/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3 bg-orange-400/20" />
                        <Skeleton className="h-3 w-full bg-orange-400/10" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-lg bg-orange-400/20" />
                  </div>
                  <Skeleton className="h-2 w-full bg-orange-400/10 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-orange-900/10 border-orange-700/30">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full bg-orange-400/30" />
                <Skeleton className="h-5 w-32 bg-orange-400/20" />
              </div>
              <Skeleton className="h-3 w-3/4 bg-orange-400/10" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={`quote-skeleton-${index}`}
                  className="h-6 w-full bg-orange-400/10 rounded-lg"
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error loading morning routine: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      <div className="w-full max-w-none p-4 sm:p-6 space-y-4">

        {/* Morning Routine Header */}
        <Card className="bg-slate-950/40 border border-slate-700/30 shadow-lg overflow-hidden">
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-orange-400/30">
                  <Sun className="h-4 w-4 text-orange-300" />
                </div>
                <CardTitle className="text-base font-semibold text-orange-100">Morning Routine</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  "border",
                  morningRoutineProgress >= 100
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : morningRoutineProgress >= 50
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                )}>
                  {morningRoutineProgress >= 100 ? 'Complete' : `${Math.round(morningRoutineProgress)}%`}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Mindset Card - Combined with tabs */}
        <Card className="morning-card bg-orange-900/20 border-orange-700/40">
          <CardHeader className="p-4 pb-2">
            {/* Tab Pills */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveMindsetTab('coding')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeMindsetTab === 'coding'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-orange-900/30 text-orange-300/70 hover:bg-orange-900/50 hover:text-orange-200"
                )}
              >
                Coding My Brain
              </button>
              <button
                onClick={() => setActiveMindsetTab('rules')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeMindsetTab === 'rules'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-orange-900/30 text-orange-300/70 hover:bg-orange-900/50 hover:text-orange-200"
                )}
              >
                Flow State Rules
              </button>
              <button
                onClick={() => setActiveMindsetTab('quotes')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  activeMindsetTab === 'quotes'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-orange-900/30 text-orange-300/70 hover:bg-orange-900/50 hover:text-orange-200"
                )}
              >
                Daily Inspiration
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <motion.div
              key={activeMindsetTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="py-2"
            >
              {activeMindsetTab === 'coding' && (
                <div>
                  <h3 className="text-orange-300 font-bold text-base mb-3">Coding My Brain</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path.
                    When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom.
                    I will not be distracted from the path.
                  </p>
                </div>
              )}
              {activeMindsetTab === 'rules' && (
                <div>
                  <h3 className="text-orange-300 font-bold text-base mb-3">Flow State Rules</h3>
                  <ul className="text-gray-200 text-sm space-y-2">
                    <li>• No use of apps other than Notion.</li>
                    <li>• No vapes or drugs (including weed).</li>
                    <li>• No more than 5 seconds until the next action.</li>
                  </ul>
                </div>
              )}
              {activeMindsetTab === 'quotes' && (
                <div>
                  <MotivationalQuotes quotes={todaysQuotes} />
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Morning Routine Tasks - Each in individual card */}
            <div className="space-y-3">
              {MORNING_ROUTINE_TASKS.map((task) => {
                const IconComponent = task.icon;
                const completedSubtasks = task.subtasks.filter(subtask => isHabitCompleted(subtask.key)).length;
                const taskComplete = isTaskComplete(task.key, task.subtasks);

                // Calculate progress percentage
                const progressPercent = task.subtasks.length > 0
                  ? (completedSubtasks / task.subtasks.length) * 100
                  : (taskComplete ? 100 : 0);

                return (
                  <Card key={task.key} className="morning-card bg-orange-900/20 border-orange-700/40 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <IconComponent className="h-5 w-5 text-orange-400 flex-shrink-0" />
                          <h4 className="text-orange-100 font-semibold text-base truncate">{task.title}</h4>
                        </div>
                        {/* XP Pill */}
                        <XPPill
                          xp={todayXP.breakdown[task.key] || 0}
                          earned={taskComplete}
                          showGlow={taskComplete}
                        />
                      </div>

                        {/* Universal Progress Bar - ALL TASKS */}
                        <div className="mt-2 mb-1">
                          <div className="w-full bg-orange-900/30 border border-orange-600/20 rounded-full h-1.5">
                            <motion.div
                              className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all duration-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            {task.subtasks.length > 0 ? (
                              <>
                                <span className="text-xs text-orange-400/70 font-medium">{completedSubtasks}/{task.subtasks.length} completed</span>
                                {taskComplete && (
                                  <span className="text-xs text-green-400 font-semibold">✓ Complete</span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-xs text-orange-400/70 font-medium">
                                  {taskComplete ? 'Completed' : 'Not started'}
                                </span>
                                {taskComplete && (
                                  <span className="text-xs text-green-400 font-semibold">✓ Complete</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">{task.description}</p>
                        )}
                        
                        {/* Time tracking interface - for wake-up */}
                        {task.hasTimeTracking && task.key === 'wakeUp' && (
                          <WakeUpTimeTracker
                            time={wakeUpTime}
                            onTimeChange={setWakeUpTime}
                            onOpenPicker={() => setShowTimeScrollPicker(true)}
                            onUseNow={setCurrentTimeAsWakeUp}
                            getCurrentTime={getCurrentTime}
                            onClear={() => setWakeUpTime('')}
                          />
                        )}

                        {/* Meditation time tracking with buttons */}
                        {task.hasTimeTracking && task.key === 'meditation' && (
                          <MeditationTracker
                            duration={meditationDuration}
                            onChange={setMeditationDuration}
                            selectedDate={selectedDate}
                          />
                        )}
                      </div>

                    {/* Sub-tasks - Enhanced with better visual hierarchy and mobile touch targets */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-4 ml-4 space-y-3">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask.key}>
                            {/* Full row clickable - makes it easier to tap on mobile */}
                            <div
                              className="group flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] p-2 -m-2 hover:bg-orange-900/20 active:bg-orange-900/30"
                              onClick={() => handleHabitToggle(subtask.key, !isHabitCompleted(subtask.key))}
                            >
                              {/* Checkbox - visual indicator only, click handled by parent */}
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={isHabitCompleted(subtask.key)}
                                  className="h-6 w-6 border-2 border-orange-400/70 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 transition-all duration-200 group-hover:border-orange-400 pointer-events-none"
                                />
                              </div>
                              <span className={cn(
                                "text-sm font-medium transition-all duration-200 flex-1",
                                isHabitCompleted(subtask.key)
                                  ? "text-gray-500 line-through"
                                  : "text-orange-200/90 group-hover:text-orange-50"
                              )}>
                                {subtask.title}
                              </span>
                              {isHabitCompleted(subtask.key) && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 animate-in zoom-in-50 duration-200" />
                              )}
                            </div>

                            {/* Push-ups Tracking UI - Special case for pushups subtask */}
                            {subtask.key === 'pushups' && (
                              <PushUpTracker
                                reps={pushupReps}
                                personalBest={pushupPB}
                                onUpdateReps={updatePushupReps}
                              />
                            )}

                            {/* Water Tracking UI - Special case for water subtask */}
                            {subtask.key === 'water' && (
                              <WaterTracker
                                value={waterAmount}
                                onIncrement={incrementWater}
                                onDecrement={decrementWater}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Plan Day Actions */}
                    {task.key === 'planDay' && (
                      <PlanDayActions
                        isComplete={isPlanDayComplete}
                        onMarkComplete={() => setIsPlanDayComplete(true)}
                        onOpenThoughtDump={() => setShowThoughtDumpChat(true)}
                      />
                    )}

                    {/* Completion Status Bar at bottom of card */}
                    {taskComplete && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-3 border-t border-orange-700/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            </motion.div>
                            <span className="text-xs text-green-400 font-semibold">Complete</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-orange-300/70">
                              {task.key === 'wakeUp' ? 'Wake-up logged' :
                               task.key === 'meditation' ? 'Meditation complete' :
                               task.key === 'planDay' ? 'Day planned' :
                               'Task completed'}
                            </span>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 10 }}
                              className="h-2 w-2 rounded-full bg-green-400"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Top 3 Daily Priorities - After Meditation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="morning-card bg-gradient-to-r from-orange-900/30 to-orange-900/30 border-orange-700/40">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center text-orange-300 text-base">
                    <Target className="h-5 w-5 mr-2" />
                    🎯 Top 3 Things I Want to Complete Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-orange-400 mb-4">
                    Not everything - just the 3 that matter most. Be specific.
                  </p>
                  <div className="space-y-3">
                    {dailyPriorities.map((priority, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600/30 border-2 border-orange-500/50 flex items-center justify-center mt-1">
                          <span className="text-orange-300 font-bold text-sm">#{idx + 1}</span>
                        </div>
                        <TextareaAutosize
                          value={priority}
                          onChange={(e) => {
                            const newPriorities = [...dailyPriorities];
                            newPriorities[idx] = e.target.value;
                            setDailyPriorities(newPriorities);
                          }}
                          placeholder={`Priority ${idx + 1}...`}
                          minRows={1}
                          maxRows={4}
                          className="flex-1 bg-orange-900/20 border border-orange-700/30 text-white text-sm placeholder:text-orange-300/40 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 rounded-lg px-3 py-2 resize-none overflow-hidden"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-orange-400/70 mt-3 italic">
                    💡 Tip: Make them specific and actionable!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* XP Footer Summary */}
            <XPFooterSummary
              breakdown={todayXP.breakdown}
              totalXP={todayXP.total}
            />

      </div>

      {/* Simple AI Thought Dump Page */}
      {showThoughtDumpChat && (
        <SimpleThoughtDumpPage
          selectedDate={selectedDate}
          onBack={() => setShowThoughtDumpChat(false)}
          onComplete={(tasks) => {
            setThoughtDumpResult(tasks);
            setShowThoughtDumpChat(false);
          }}
        />
      )}

      {/* Thought Dump Results Modal */}
      {thoughtDumpResult && (
        <ThoughtDumpResults
          result={thoughtDumpResult}
          onClose={() => setThoughtDumpResult(null)}
          onAddToSchedule={() => setThoughtDumpResult(null)}
        />
      )}

      {/* Time Scroll Picker Modal */}
      {showTimeScrollPicker && (
        <TimeScrollPicker
          value={wakeUpTime}
          onChange={(time) => {
            setWakeUpTime(time);
            setIsEditingWakeTime(false);
          }}
          onClose={() => setShowTimeScrollPicker(false)}
        />
      )}
    </div>
  );
});
