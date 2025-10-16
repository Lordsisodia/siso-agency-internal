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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { workTypeApiClient, MorningRoutineMetadata } from '@/services/workTypeApiClient';
import { useOfflineManager } from '@/shared/hooks/useOfflineManager';
import { SimpleThoughtDumpPage, ThoughtDumpResults, lifeLockVoiceTaskProcessor } from '@/ecosystem/internal/lifelock/features/ai-thought-dump';
import type { ThoughtDumpResult } from '@/ecosystem/internal/lifelock/features/ai-thought-dump';
import { getRotatingQuotes } from '@/data/motivational-quotes';
import { debounce } from '@/shared/utils/debounce';
import { TimeScrollPicker } from './components/TimeScrollPicker';
import { WaterTracker } from './components/WaterTracker';
import { PushUpTracker } from './components/PushUpTracker';
import { MeditationTracker } from './components/MeditationTracker';
import { WakeUpTimeTracker } from './components/WakeUpTimeTracker';
import { PlanDayActions } from './components/PlanDayActions';
import { MotivationalQuotes } from './components/MotivationalQuotes';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAutoTimeblocks } from '@/shared/hooks/useAutoTimeblocks';
import { GamificationService } from '@/services/gamificationService';
import {
  calculateMinutesSinceWake,
  calculateStepXpMultiplier,
  calculateWakeUpXpMultiplier,
  getWakeUpTimestamp
} from './morningRoutineXpUtils';
import {
  calculateWakeUpXP,
  calculateFreshenUpXP,
  calculateGetBloodFlowingXP,
  calculatePowerUpBrainXP,
  calculatePlanDayXP,
  calculateMeditationXP,
  calculatePrioritiesXP,
  calculateTotalMorningXP
} from './xpCalculations';
import { XPPill } from './components/XPPill';
import { XPFooterSummary } from './components/XPFooterSummary';

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
    timeEstimate: '5 min',
    icon: Sun,
    hasTimeTracking: true,
    subtasks: []
  },
  {
    key: 'freshenUp' as const,
    title: 'Freshen Up',
    description: 'Cold shower to wake up - Personal hygiene and cleanliness.',
    timeEstimate: '25 min',
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
    timeEstimate: '5 min',
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
    timeEstimate: '5 min',
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
    timeEstimate: '15 min',
    icon: CalendarIcon,
    hasTimeTracking: false,
    subtasks: []
  },
  {
    key: 'meditation' as const,
    title: 'Meditation',
    description: 'Meditate to set an innovative mindset for creating business value.',
    timeEstimate: '2 min',
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
  const { saveTask, loadTasks, isOffline } = useOfflineManager();
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [wakeUpTime, setWakeUpTime] = useState<string>(() => {
    const saved = localStorage.getItem(`lifelock-${routineDateKey}-wakeUpTime`);
    return saved || '';
  });

  const [isEditingWakeTime, setIsEditingWakeTime] = useState(false);
  const [showTimeScrollPicker, setShowTimeScrollPicker] = useState(false);

  const [meditationDuration, setMeditationDuration] = useState<string>(() => {
    const saved = localStorage.getItem(`lifelock-${routineDateKey}-meditationDuration`);
    return saved || '';
  });

  const [isEditingMeditationTime, setIsEditingMeditationTime] = useState(false);
  const [localProgressTrigger, setLocalProgressTrigger] = useState(0);

  // Plan Day completion state
  const [isPlanDayComplete, setIsPlanDayComplete] = useState<boolean>(() => {
    const saved = localStorage.getItem(`lifelock-${routineDateKey}-planDayComplete`);
    return saved === 'true';
  });

  // Water tracking state
  const [waterAmount, setWaterAmount] = useState<number>(() => {
    const saved = localStorage.getItem(`lifelock-${routineDateKey}-waterAmount`);
    return saved ? parseInt(saved) : 0;
  });

  // Push-ups tracking state
  const [pushupReps, setPushupReps] = useState<number>(() => {
    const saved = localStorage.getItem(`lifelock-${routineDateKey}-pushupReps`);
    return saved ? parseInt(saved) : 0;
  });

  const [pushupPB, setPushupPB] = useState<number>(() => {
    // PB is global, not per day
    const saved = localStorage.getItem('lifelock-pushupPB');
    return saved ? parseInt(saved) : 30; // Default PB is 30
  });

  // Top 3 Daily Priorities (after meditation)
  const [dailyPriorities, setDailyPriorities] = useState<string[]>(() => {
    const saved = localStorage.getItem(`lifelock-${routineDateKey}-dailyPriorities`);
    return saved ? JSON.parse(saved) : ['', '', ''];
  });

  // 🤖 Auto-create timeboxes based on wake-up time
  useAutoTimeblocks({
    wakeUpTime,
    userId: internalUserId,
    selectedDate,
    enabled: !!wakeUpTime && !!internalUserId // Only create if wake-up time is set
  });

  // 🎮 XP System State
  const xpStorageKey = useMemo(
    () => `lifelock-${routineDateKey}-morningXpState`,
    [routineDateKey]
  );

  const [xpState, setXpState] = useState<MorningRoutineXPState>(() => loadXpStateFromStorage(xpStorageKey));

  useEffect(() => {
    setXpState(loadXpStateFromStorage(xpStorageKey));
  }, [xpStorageKey]);

  useEffect(() => {
    persistXpStateToStorage(xpStorageKey, xpState);
  }, [xpState, xpStorageKey]);

  const meditationPreviousValue = useRef<string>(meditationDuration);
  const planDayPreviousValue = useRef<boolean>(isPlanDayComplete);

  // Reload date-specific data when date changes (from Supabase + localStorage fallback)
  useEffect(() => {
    const loadDateSpecificData = async () => {
      if (!selectedDate || isNaN(selectedDate.getTime()) || !user?.id) return;
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        // Try to load from Supabase first (use Clerk ID, not internal UUID)
        const response = await fetch(`/api/morning-routine/metadata?userId=${user.id}&date=${dateKey}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const metadata = result.data;
          // Load from Supabase if available
          setWakeUpTime(metadata.wakeUpTime || '');
          setWaterAmount(metadata.waterAmount || 0);
          setMeditationDuration(metadata.meditationDuration || '');
          setPushupReps(metadata.pushupReps || 0);
          setDailyPriorities(metadata.dailyPriorities || ['', '', '']);
          setIsPlanDayComplete(metadata.isPlanDayComplete || false);
        } else {
          throw new Error('No Supabase data, falling back to localStorage');
        }
      } catch (error) {
        // Fallback to localStorage if Supabase fails
        console.log('Loading from localStorage fallback');
        const savedWakeUpTime = localStorage.getItem(`lifelock-${dateKey}-wakeUpTime`);
        setWakeUpTime(savedWakeUpTime || '');
        
        const savedWaterAmount = localStorage.getItem(`lifelock-${dateKey}-waterAmount`);
        setWaterAmount(savedWaterAmount ? parseInt(savedWaterAmount) : 0);
        
        const savedMeditationDuration = localStorage.getItem(`lifelock-${dateKey}-meditationDuration`);
        setMeditationDuration(savedMeditationDuration || '');
        
        const savedPushupReps = localStorage.getItem(`lifelock-${dateKey}-pushupReps`);
        setPushupReps(savedPushupReps ? parseInt(savedPushupReps) : 0);
        
        const savedDailyPriorities = localStorage.getItem(`lifelock-${dateKey}-dailyPriorities`);
        setDailyPriorities(savedDailyPriorities ? JSON.parse(savedDailyPriorities) : ['', '', '']);
        
        const savedPlanDayComplete = localStorage.getItem(`lifelock-${dateKey}-planDayComplete`);
        setIsPlanDayComplete(savedPlanDayComplete === 'true');
      }
    };
    
    loadDateSpecificData();
  }, [selectedDate, user?.id]);

  // Load morning routine data
  useEffect(() => {
    const loadMorningRoutine = async () => {
      if (!user?.id || !selectedDate) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load from API (which reads from daily_routines table)
        const apiData = await workTypeApiClient.getMorningRoutine(user.id, selectedDate);
        
        if (apiData) {
          setMorningRoutine(apiData);
          
          // ✅ FIX: Sync checkbox states from Supabase to localStorage
          const dateKey = format(selectedDate, 'yyyy-MM-dd');
          if (apiData.items && Array.isArray(apiData.items)) {
            apiData.items.forEach((item: MorningRoutineHabit) => {
              localStorage.setItem(`lifelock-${dateKey}-${item.name}`, item.completed.toString());
            });
          }
        }
      } catch (error) {
        console.error('Error loading morning routine:', error);
        setError('Failed to load morning routine');
      } finally {
        setLoading(false);
      }
    };

    loadMorningRoutine();
  }, [user?.id, selectedDate]);

  // Save wake-up time to Supabase + localStorage (debounced)
  const debouncedMetadataUpdate = useMemo(() => {
    if (!user?.id || !selectedDate || isNaN(selectedDate.getTime())) {
      return null;
    }

    const update = debounce((payload: Partial<MorningRoutineMetadata>) => {
      workTypeApiClient.updateMorningRoutineMetadata(user.id!, selectedDate, payload).catch(error => {
        console.error('Failed to save morning routine metadata to Supabase:', error);
      });
    }, 500);

    return update;
  }, [user?.id, selectedDate]);

  useEffect(() => {
    return () => {
      debouncedMetadataUpdate?.cancel();
    };
  }, [debouncedMetadataUpdate]);

  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    localStorage.setItem(`lifelock-${routineDateKey}-wakeUpTime`, wakeUpTime);

    debouncedMetadataUpdate?.({ wakeUpTime });
  }, [wakeUpTime, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save water amount to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    localStorage.setItem(`lifelock-${routineDateKey}-waterAmount`, waterAmount.toString());

    debouncedMetadataUpdate?.({ waterAmount });
  }, [waterAmount, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save meditation duration to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    localStorage.setItem(`lifelock-${routineDateKey}-meditationDuration`, meditationDuration);

    debouncedMetadataUpdate?.({ meditationDuration });
  }, [meditationDuration, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save push-up reps to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return;

    localStorage.setItem(`lifelock-${routineDateKey}-pushupReps`, pushupReps.toString());

    debouncedMetadataUpdate?.({ pushupReps });
  }, [pushupReps, selectedDate, debouncedMetadataUpdate, routineDateKey]);

  // Save push-up PB to localStorage (global, not per day)
  useEffect(() => {
    localStorage.setItem('lifelock-pushupPB', pushupPB.toString());
  }, [pushupPB]);

  // Save daily priorities to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime()) || !internalUserId) return;

    localStorage.setItem(`lifelock-${routineDateKey}-dailyPriorities`, JSON.stringify(dailyPriorities));

    debouncedMetadataUpdate?.({ dailyPriorities });
  }, [dailyPriorities, selectedDate, internalUserId, debouncedMetadataUpdate, routineDateKey]);

  // Save Plan Day completion to Supabase + localStorage (debounced)
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime()) || !internalUserId) return;

    localStorage.setItem(`lifelock-${routineDateKey}-planDayComplete`, isPlanDayComplete.toString());

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
    if (!user?.id || !selectedDate) return;

    try {
      // Always save to localStorage for immediate feedback
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      localStorage.setItem(`lifelock-${dateKey}-${habitKey}`, completed.toString());

      // ✅ Save to Supabase via API
      await workTypeApiClient.updateMorningRoutineHabit(user.id, selectedDate, habitKey, completed);

      // 🎮 Award XP for habit completion
      if (completed) {
        awardHabitCompletion(habitKey);
      }

      // Update local state immediately for better UX
      if (morningRoutine && morningRoutine.items && Array.isArray(morningRoutine.items)) {
        const updatedItems = morningRoutine.items.map(item =>
          item.name === habitKey ? { ...item, completed } : item
        );
        
        // If habit doesn't exist, add it
        if (!updatedItems.find(item => item.name === habitKey)) {
          updatedItems.push({ name: habitKey, completed });
        }
        
        const completedCount = updatedItems.filter(item => item.completed).length;
        setMorningRoutine({
          ...morningRoutine,
          items: updatedItems,
          completedCount,
          completionPercentage: (completedCount / updatedItems.length) * 100
        });
      } else {
        // Create new morningRoutine if it doesn't exist
        setMorningRoutine({
          id: '',
          userId: user.id,
          date: dateKey,
          items: [{ name: habitKey, completed }],
          completedCount: completed ? 1 : 0,
          totalCount: 1,
          completionPercentage: completed ? 100 : 0
        });
      }
      
      // Force re-render to update progress calculation
      setLocalProgressTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating habit:', error);
      // LocalStorage save still works even if API fails
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
    if (morningRoutine && morningRoutine.items) {
      // Use API data if available
      const habit = morningRoutine.items.find(item => item.name === habitKey);
      return habit?.completed || false;
    } else {
      // Fallback to localStorage if API data not available
      const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const stored = localStorage.getItem(`lifelock-${dateKey}-${habitKey}`);
      return stored === 'true';
    }
  }, [morningRoutine, selectedDate]);

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
          <Card className="w-full bg-yellow-900/20 border-yellow-700/50">
            <CardHeader className="p-3 sm:p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full bg-yellow-400/30" />
                  <Skeleton className="h-5 w-36 bg-yellow-400/20" />
                </div>
                <Skeleton className="h-4 w-16 bg-yellow-400/20" />
              </div>
              <Skeleton className="h-2 w-full bg-yellow-400/20 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-4 pb-16">
              {Array.from({ length: MORNING_ROUTINE_TASKS.length }).map((_, index) => (
                <div
                  key={`morning-skeleton-${index}`}
                  className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 w-full">
                      <Skeleton className="h-5 w-5 rounded-md bg-yellow-400/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3 bg-yellow-400/20" />
                        <Skeleton className="h-3 w-full bg-yellow-400/10" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-lg bg-yellow-400/20" />
                  </div>
                  <Skeleton className="h-2 w-full bg-yellow-400/10 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/10 border-yellow-700/30">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full bg-yellow-400/30" />
                <Skeleton className="h-5 w-32 bg-yellow-400/20" />
              </div>
              <Skeleton className="h-3 w-3/4 bg-yellow-400/10" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={`quote-skeleton-${index}`}
                  className="h-6 w-full bg-yellow-400/10 rounded-lg"
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
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">

        {/* Morning Routine Card */}
        <Card className="w-full bg-yellow-900/20 border-yellow-700/50">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="flex items-center justify-between text-yellow-400 text-base sm:text-lg">
              <div className="flex items-center">
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                🌅 Morning Routine
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="text-yellow-300">{todayXP.total} XP</span>
                <span className="text-yellow-500/70">|</span>
                <span>{Math.round(morningRoutineProgress)}%</span>
              </div>
            </CardTitle>
            
            {/* Progress Bar */}
            <div className="w-full bg-yellow-900/20 rounded-full h-2 mt-4">
              <motion.div
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${morningRoutineProgress}%` }}
              />
            </div>

            <div className="border-t border-yellow-600/50 my-4"></div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-yellow-300 mb-2 text-sm sm:text-base">Coding My Brain</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path. 
                  When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom. 
                  I will not be distracted from the path.
                </p>
              </div>
              <div className="border-t border-yellow-600/50 my-4"></div>
              <div>
                <h3 className="font-bold text-yellow-300 mb-2 text-sm sm:text-base">Flow State Rules</h3>
                <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
                  <li>• No use of apps other than Notion.</li>
                  <li>• No vapes or drugs (including weed).</li>
                  <li>• No more than 5 seconds until the next action.</li>
                </ul>
              </div>
              <div className="border-t border-yellow-600/50 my-4"></div>
              <MotivationalQuotes quotes={todaysQuotes} />
            </div>
            <div className="border-t border-yellow-600/50 my-3 sm:my-4"></div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            

            {/* Morning Routine Tasks */}
            <div className="space-y-2 sm:space-y-3">
              {MORNING_ROUTINE_TASKS.map((task) => {
                const IconComponent = task.icon;
                const completedSubtasks = task.subtasks.filter(subtask => isHabitCompleted(subtask.key)).length;
                const taskComplete = isTaskComplete(task.key, task.subtasks);

                // Calculate progress percentage
                const progressPercent = task.subtasks.length > 0
                  ? (completedSubtasks / task.subtasks.length) * 100
                  : (taskComplete ? 100 : 0);

                return (
                  <div key={task.key} className="group py-3 transition-all duration-300">
                    {/* Main Task Header - NO CHECKBOX */}
                    <div className="p-2 sm:p-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <IconComponent className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                            <h4 className="text-yellow-100 font-semibold text-sm sm:text-base truncate">{task.title}</h4>
                            <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-full px-2.5 py-0.5 flex-shrink-0">
                              <span className="text-xs text-yellow-300 font-medium whitespace-nowrap">{task.timeEstimate}</span>
                            </div>
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
                          <div className="w-full bg-yellow-900/30 border border-yellow-600/20 rounded-full h-1.5">
                            <motion.div
                              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            {task.subtasks.length > 0 ? (
                              <>
                                <span className="text-xs text-yellow-400/70 font-medium">{completedSubtasks}/{task.subtasks.length} completed</span>
                                {taskComplete && (
                                  <span className="text-xs text-green-400 font-semibold">✓ Complete</span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="text-xs text-yellow-400/70 font-medium">
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
                          />
                        )}

                        {/* Meditation time tracking with buttons */}
                        {task.hasTimeTracking && task.key === 'meditation' && (
                          <MeditationTracker
                            duration={meditationDuration}
                            onChange={setMeditationDuration}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Sub-tasks - Enhanced with better visual hierarchy */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-4 ml-4 space-y-3">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask.key}>
                            <div className="group flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01]">
                              {/* Checkbox without connector line */}
                              <Checkbox
                                checked={isHabitCompleted(subtask.key)}
                                onCheckedChange={(checked) => handleHabitToggle(subtask.key, !!checked)}
                                className="h-4 w-4 border-yellow-400/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 transition-all duration-200 group-hover:border-yellow-400"
                              />
                              <span className={cn(
                                "text-sm font-medium transition-all duration-200 flex-1",
                                isHabitCompleted(subtask.key)
                                  ? "text-gray-500 line-through"
                                  : "text-yellow-100/90 group-hover:text-yellow-50"
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
                  </div>
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
              <Card className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-700/40">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center text-yellow-300 text-base">
                    <Target className="h-5 w-5 mr-2" />
                    🎯 Top 3 Things I Want to Complete Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-yellow-400 mb-4">
                    Not everything - just the 3 that matter most. Be specific.
                  </p>
                  <div className="space-y-3">
                    {dailyPriorities.map((priority, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600/30 border-2 border-yellow-500/50 flex items-center justify-center">
                          <span className="text-yellow-300 font-bold text-sm">#{idx + 1}</span>
                        </div>
                        <Input
                          value={priority}
                          onChange={(e) => {
                            const newPriorities = [...dailyPriorities];
                            newPriorities[idx] = e.target.value;
                            setDailyPriorities(newPriorities);
                          }}
                          placeholder={`Priority ${idx + 1}...`}
                          className="bg-yellow-900/20 border-yellow-700/30 text-white placeholder:text-yellow-300/40 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-400/70 mt-3 italic">
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

          </CardContent>
        </Card>

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
