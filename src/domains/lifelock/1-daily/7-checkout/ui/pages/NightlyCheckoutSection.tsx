import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Clock, CheckCircle, Mic, TrendingUp, Zap, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import { useDailyReflections } from '@/domains/lifelock/1-daily/5-stats/domain/useDailyReflections';
import { useDeepWorkTasksSupabase, type DeepWorkTask } from '@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase';
import {
  calculateTotalCheckoutXP,
  calculateWentWellXP,
  calculateEvenBetterIfXP,
  calculateTomorrowTasksXP,
  calculateBedTimeXP,
  calculateMeditationXP,
  calculateWorkoutXP,
  calculateDeepWorkXP,
  calculateResearchXP
} from '../../domain/xpCalculations';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';

// Import new components
import { DailyMetricsSection } from '../components/metrics';
import { WentWellSection, EvenBetterIfSection } from '../components/reflection';
import { TomorrowsPlanSection } from '../components/tomorrow';

interface NightlyCheckoutSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

// Types for the new data structure
interface MeditationValue {
  minutes: number;
  focusLevel: 'distracted' | 'somewhat-focused' | 'deeply-present' | null;
  feelingAfter: 'more-stressed' | 'same' | 'more-calm' | 'transformed' | null;
}

interface WorkoutValue {
  completed: boolean;
  type: string;
  duration: number;
  intensity: string;
}

interface NutritionValue {
  protein: number;
  hitGoal: boolean;
}

interface DeepWorkValue {
  hours: number;
  quality: number;
  flowState?: 'distracted' | 'focused' | 'flow';
}

interface ResearchValue {
  hours: number;
  topic: string;
  notes: string;
}

interface SleepValue {
  hours: number;
  bedTime: string;
  wakeTime: string;
  quality: number;
}

interface CheckoutData {
  // Metrics
  meditation: MeditationValue;
  workout: WorkoutValue;
  nutrition: NutritionValue;
  deepWork: DeepWorkValue;
  research: ResearchValue;
  sleep: SleepValue;

  // State
  moodStart: number;
  moodEnd: number;
  energyLevel: number;
  stressLevel: number;

  // Reflection
  wentWell: string[];
  evenBetterIf: string[];

  // Tomorrow
  nonNegotiables: string[]; // Changed to array
  topTasks: [string, string, string];
  tomorrowFocus: string;
}

export const NightlyCheckoutSection: React.FC<NightlyCheckoutSectionProps> = ({
  selectedDate,
  onPreviousDate,
  onNextDate
}) => {
  const { userId } = useAuth();
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Use the new Supabase hook for data persistence
  const {
    reflection,
    previousReflection: yesterdayReflection,
    loading: isLoading,
    saving: isSaving,
    saveReflection
  } = useDailyReflections({ selectedDate, includePreviousDay: true });

  // Fetch deep work tasks for auto-calculation
  const { tasks: deepWorkTasks, loading: deepWorkLoading } = useDeepWorkTasksSupabase({ selectedDate });

  // Initialize checkout data with default values
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    // Metrics
    meditation: { minutes: 0, focusLevel: null, feelingAfter: null },
    workout: { completed: false, type: '', duration: 0, intensity: '' },
    nutrition: { protein: 0, hitGoal: false },
    deepWork: { hours: 0, quality: 50 },
    research: { hours: 0, topic: '', notes: '' },
    sleep: { hours: 0, bedTime: '', wakeTime: '', quality: 50 },

    // State
    moodStart: 5,
    moodEnd: 5,
    energyLevel: 5,
    stressLevel: 5,

    // Reflection
    wentWell: ['', '', ''],
    evenBetterIf: ['', '', ''],

    // Tomorrow
    nonNegotiables: ['', '', ''], // Changed to array
    topTasks: ['', '', ''] as [string, string, string],
    tomorrowFocus: ''
  });

  // Track if user has edited
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [previousCheckoutXP, setPreviousCheckoutXP] = useState(0);

  // Calculate completed deep work hours from tasks
  const { autoCalculatedDeepWorkHours, completedDeepWorkTaskCount } = useMemo(() => {
    if (!deepWorkTasks || deepWorkTasks.length === 0) {
      return { autoCalculatedDeepWorkHours: 0, completedDeepWorkTaskCount: 0 };
    }

    const completedTasks = deepWorkTasks.filter(task => task.completed);
    const totalMinutes = completedTasks.reduce((sum, task) => {
      // Use actual duration if available, otherwise fall back to estimated duration
      const duration = task.actualDurationMin || task.estimatedDuration || 0;
      return sum + duration;
    }, 0);

    return {
      autoCalculatedDeepWorkHours: Math.round((totalMinutes / 60) * 10) / 10, // Round to 1 decimal
      completedDeepWorkTaskCount: completedTasks.length
    };
  }, [deepWorkTasks]);

  // Sync local state with Supabase data when reflection loads
  useEffect(() => {
    if (reflection) {
      setCheckoutData({
        // Metrics
        meditation: reflection.meditation || { minutes: 0, focusLevel: null, feelingAfter: null },
        workout: reflection.workout || { completed: false, type: '', duration: 0, intensity: '' },
        nutrition: reflection.nutrition || { protein: 0, hitGoal: false },
        deepWork: reflection.deepWork || { hours: 0, quality: 50 },
        research: reflection.research || { hours: 0, topic: '', notes: '' },
        sleep: reflection.sleep || { hours: 0, bedTime: reflection.bedTime || '', wakeTime: '', quality: 50 },

        // State
        moodStart: reflection.moodStart || 5,
        moodEnd: reflection.moodEnd || 5,
        energyLevel: reflection.energyLevel || 5,
        stressLevel: reflection.stressLevel || 5,

        // Reflection
        wentWell: reflection.wentWell && reflection.wentWell.length > 0 ? reflection.wentWell : ['', '', ''],
        evenBetterIf: reflection.evenBetterIf && reflection.evenBetterIf.length > 0 ? reflection.evenBetterIf : ['', '', ''],

        // Tomorrow
        nonNegotiables: reflection.nonNegotiables && reflection.nonNegotiables.length > 0
          ? reflection.nonNegotiables
          : (reflection.nonNegotiable ? [reflection.nonNegotiable] : ['', '', '']), // Support old single field
        topTasks: reflection.tomorrowTopTasks && reflection.tomorrowTopTasks.length > 0
          ? reflection.tomorrowTopTasks as [string, string, string]
          : ['', '', ''],
        tomorrowFocus: reflection.tomorrowFocus || ''
      });
      setHasUserEdited(false);
    }
  }, [reflection]);

  // Helper function to update checkout data and mark as edited
  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...updates }));
    setHasUserEdited(true);
  };

  // Calculate streak (count consecutive days with reflections)
  const currentStreak = useMemo(() => {
    // For now, return a placeholder - we'll implement proper streak calculation
    return reflection?.moodEnd ? 1 : 0;
  }, [reflection]);

  // Calculate completion progress
  const checkoutProgress = useMemo(() => {
    let completed = 0;
    const total = 10; // Updated total fields

    // Metrics (6 metrics - count if any data entered)
    if (checkoutData.meditation.minutes > 0) completed++;
    if (checkoutData.workout.completed) completed++;
    if (checkoutData.nutrition.protein > 0) completed++;
    if (checkoutData.deepWork.hours > 0) completed++;
    if (checkoutData.research.hours > 0) completed++;
    if (checkoutData.sleep.hours > 0 || checkoutData.sleep.bedTime) completed++;

    // State (4 fields)
    if (checkoutData.moodStart !== 5) completed++;
    if (checkoutData.moodEnd !== 5) completed++;
    if (checkoutData.energyLevel !== 5) completed++;
    if (checkoutData.stressLevel !== 5) completed++;

    // Reflection
    if (checkoutData.wentWell.some(item => item.trim() !== '')) completed++;
    if (checkoutData.evenBetterIf.some(item => item.trim() !== '')) completed++;

    // Tomorrow
    if (checkoutData.nonNegotiables.some(item => item.trim() !== '')) completed++;
    if (checkoutData.topTasks.some(task => task.trim() !== '')) completed++;
    if (checkoutData.tomorrowFocus?.trim()) completed++;

    return Math.min((completed / total) * 100, 100);
  }, [checkoutData]);

  // Calculate protein-tier XP based on intake
  const calculateNutritionXP = (protein: number): number => {
    if (protein >= 150) return 25; // Elite tier
    if (protein >= 100) return 20; // Advanced tier
    if (protein >= 50) return 15;  // Solid tier
    if (protein > 0) return 5;     // Starter tier
    return 0;                      // No protein logged
  };

  // Calculate per-section XP breakdown for display on cards
  const sectionXP = useMemo(() => {
    return {
      wentWell: calculateWentWellXP(checkoutData.wentWell),
      evenBetterIf: calculateEvenBetterIfXP(checkoutData.evenBetterIf),
      tomorrowTasks: calculateTomorrowTasksXP(checkoutData.topTasks),
      bedTime: calculateBedTimeXP(checkoutData.sleep.bedTime),
      // Per-metric XP using tiered calculations
      // TODO: Update calculateMeditationXP to use focusLevel and feelingAfter instead of quality
      meditation: calculateMeditationXP(checkoutData.meditation.minutes, 75), // Default quality for now
      workout: calculateWorkoutXP(checkoutData.workout.duration, checkoutData.workout.intensity),
      nutrition: calculateNutritionXP(checkoutData.nutrition.protein),
      deepWork: calculateDeepWorkXP(checkoutData.deepWork.hours, checkoutData.deepWork.quality >= 70),
      research: calculateResearchXP(checkoutData.research.hours, checkoutData.research.notes.length),
      sleep: checkoutData.sleep.hours > 0 ? 25 : 0
    };
  }, [checkoutData]);

  // Calculate XP for this checkout
  const checkoutXP = useMemo(() => {
    // Sum all section XP values
    const metricsXP = sectionXP.meditation + sectionXP.workout + sectionXP.nutrition +
                      sectionXP.deepWork + sectionXP.research + sectionXP.sleep;
    const reflectionXP = sectionXP.wentWell + sectionXP.evenBetterIf;
    const planningXP = sectionXP.tomorrowTasks + sectionXP.bedTime;

    const subtotal = metricsXP + reflectionXP + planningXP;

    // Streak bonus: +2 XP per day, cap at 50 XP
    const streakBonus = Math.min(currentStreak * 2, 50);

    return {
      total: subtotal + streakBonus,
      breakdown: {
        metrics: metricsXP,
        reflection: reflectionXP,
        planning: planningXP,
        streak: streakBonus
      }
    };
  }, [sectionXP, currentStreak]);

  // Save to Supabase with debouncing
  useEffect(() => {
    if (!userId || isLoading || !hasUserEdited) return;

    const saveTimer = setTimeout(async () => {
      // Map checkoutData to the database schema
      const dataToSave = {
        ...reflection,
        ...checkoutData,
        // Map sleep.bedTime to the root bedTime field for backward compatibility
        bedTime: checkoutData.sleep.bedTime,
        // Map topTasks to tomorrowTopTasks for backward compatibility
        tomorrowTopTasks: checkoutData.topTasks,
        // Map nonNegotiables array to both new field and old field for compatibility
        nonNegotiables: checkoutData.nonNegotiables,
        nonNegotiable: checkoutData.nonNegotiables[0] || checkoutData.nonNegotiables.join('; ') // Legacy support
      };

      await saveReflection(dataToSave);
      setHasUserEdited(false);

      // Award XP if checkout is complete
      if (checkoutProgress === 100 && checkoutXP.total > previousCheckoutXP) {
        GamificationService.awardXP('reflection_complete', checkoutXP.total / 50);
        setPreviousCheckoutXP(checkoutXP.total);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
  }, [checkoutData, userId, isLoading, hasUserEdited, checkoutProgress, checkoutXP.total, previousCheckoutXP, reflection, saveReflection]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-siso-bg relative overflow-x-hidden">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 space-y-6">
          <Card className="mb-24 bg-purple-900/10 border-purple-700/30">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full bg-purple-500/30" />
                  <Skeleton className="h-5 w-48 bg-purple-400/20" />
                </div>
                <Skeleton className="h-4 w-20 bg-purple-400/20" />
              </div>
              <Skeleton className="h-2 w-full bg-purple-400/20 rounded-full" />
            </CardHeader>
            <CardContent className="pb-24 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`checkout-stat-skeleton-${index}`}
                    className="rounded-xl border border-purple-700/40 bg-purple-900/30 p-4 space-y-3"
                  >
                    <Skeleton className="h-4 w-1/2 bg-purple-400/20" />
                    <Skeleton className="h-6 w-16 bg-purple-400/30" />
                    <Skeleton className="h-2 w-full bg-purple-400/20 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`checkout-reflection-skeleton-${index}`}
                    className="rounded-xl border border-purple-700/40 bg-purple-900/30 p-4 space-y-3"
                  >
                    <Skeleton className="h-4 w-1/3 bg-purple-400/20" />
                    <Skeleton className="h-12 w-full bg-purple-400/10 rounded-lg" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Skeleton className="h-10 w-full sm:w-40 bg-purple-400/20 rounded-lg" />
                <Skeleton className="h-10 w-full sm:w-40 bg-purple-400/20 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-siso-bg relative overflow-x-hidden">
      <div className="w-full max-w-none p-4 sm:p-6 space-y-4">

        {/* Page Header - Title, Icon, Subtext */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Moon className="h-4 w-4 text-purple-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white tracking-tight">Nightly Checkout</h1>
                <p className="text-xs text-white/60">Reflect on your day</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-lg font-semibold text-purple-400">{checkoutXP.total} XP</div>
                <div className="text-xs text-purple-400/70">{Math.round(checkoutProgress)}% complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Accountability Card (if yesterday's focus exists) */}
        {yesterdayReflection?.tomorrowFocus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-full">
              <Card className="bg-yellow-900/20 border-l-4 border-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-yellow-300 font-semibold mb-2 text-sm">
                      Yesterday you said you'd focus on:
                    </h4>
                    <p className="text-yellow-100 font-medium italic">
                      "{yesterdayReflection.tomorrowFocus}"
                    </p>
                    <p className="text-yellow-400 text-xs mt-2">
                      Did you follow through?
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </motion.div>
        )}

        {/* What Went Well - Standalone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WentWellSection
            items={checkoutData.wentWell}
            xp={sectionXP.wentWell}
            onChange={(items) => updateCheckoutData({ wentWell: items })}
          />
        </motion.div>

        {/* Even Better If - Standalone Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <EvenBetterIfSection
            items={checkoutData.evenBetterIf}
            xp={sectionXP.evenBetterIf}
            onChange={(items) => updateCheckoutData({ evenBetterIf: items })}
          />
        </motion.div>

        {/* Tomorrow's Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <TomorrowsPlanSection
            nonNegotiables={checkoutData.nonNegotiables}
            tomorrowFocus={checkoutData.tomorrowFocus}
            topTasks={checkoutData.topTasks}
            xp={sectionXP.tomorrowTasks}
            onChange={(updates) => updateCheckoutData(updates)}
          />
        </motion.div>

        {/* Daily Metrics Card - Main Wrapper for all metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <DailyMetricsSection
            meditation={checkoutData.meditation}
            workout={checkoutData.workout}
            nutrition={checkoutData.nutrition}
            deepWork={checkoutData.deepWork}
            research={checkoutData.research}
            sleep={checkoutData.sleep}
            xpBreakdown={sectionXP}
            saving={isSaving}
            onChange={(updates) => updateCheckoutData(updates)}
            autoCalculatedDeepWorkHours={autoCalculatedDeepWorkHours}
            completedDeepWorkTaskCount={completedDeepWorkTaskCount}
          />
        </motion.div>


      </div>
    </div>
  );
};
