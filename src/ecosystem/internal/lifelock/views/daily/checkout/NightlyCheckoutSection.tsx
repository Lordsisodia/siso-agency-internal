import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Mic, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import { useDailyReflections } from '@/shared/hooks/useDailyReflections';
import { BedTimeTracker } from './components/BedTimeTracker';
import { ReflectionQuestions } from './components/ReflectionQuestions';
import { MoodPicker } from './components/MoodPicker';
import { ReflectionList } from './components/ReflectionList';
import { NightlyStatsCard } from './components/NightlyStatsCard';

interface NightlyCheckoutSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const NightlyCheckoutSection: React.FC<NightlyCheckoutSectionProps> = ({
  selectedDate,
  onPreviousDate,
  onNextDate
}) => {
  const { userId } = useAuth();
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  // Use the new Supabase hook for data persistence
  const { reflection, loading: isLoading, saving: isSaving, saveReflection } = useDailyReflections({ selectedDate });

  // Fetch yesterday's reflection for accountability
  const yesterday = subDays(selectedDate, 1);
  const { reflection: yesterdayReflection } = useDailyReflections({ selectedDate: yesterday });

  const [isEditingBedTime, setIsEditingBedTime] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // STATE FIRST - Define nightlyCheckout before any functions that use it
  const [nightlyCheckout, setNightlyCheckout] = useState({
    winOfDay: '',
    mood: '',
    bedTime: '', // ✅ FIXED: Now part of saved state
    wentWell: [''] as string[],
    evenBetterIf: [''] as string[],
    dailyAnalysis: '',
    actionItems: '',
    overallRating: undefined as number | undefined,
    energyLevel: undefined as number | undefined,
    keyLearnings: '',
    tomorrowFocus: '',
    tomorrowTopTasks: ['', '', ''] as string[]
  });

  const [hasUserEdited, setHasUserEdited] = useState(false);
  
  // Moods for quick selector
  const moods = useMemo(
    () => [
      { emoji: '😊', label: 'Great', value: 'great' },
      { emoji: '😐', label: 'Okay', value: 'okay' },
      { emoji: '😰', label: 'Stressed', value: 'stressed' },
      { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
      { emoji: '😔', label: 'Down', value: 'down' },
      { emoji: '😌', label: 'Peaceful', value: 'peaceful' }
    ],
    []
  );
  
  const markEdited = useCallback(() => setHasUserEdited(true), []);

  // NOW calculate values that depend on state

  // Calculate streak (count consecutive days with reflections)
  const currentStreak = useMemo(() => {
    // For now, return a placeholder - we'll implement proper streak calculation
    // This would need to fetch multiple days of reflections
    return reflection?.overallRating ? 1 : 0;
  }, [reflection]);

  // Calculate completion progress (depends on nightlyCheckout state)
  const checkoutProgress = useMemo(() => {
    let completed = 0;
    const total = 8; // Updated to include new fields

    // New priority fields
    if (nightlyCheckout.winOfDay?.trim()) completed++;
    if (nightlyCheckout.mood) completed++;

    // Original fields
    if (nightlyCheckout.wentWell.some(item => item.trim() !== '')) completed++;
    if (nightlyCheckout.evenBetterIf.some(item => item.trim() !== '')) completed++;
    if (nightlyCheckout.dailyAnalysis?.trim()) completed++;
    if (nightlyCheckout.actionItems?.trim()) completed++;
    if (nightlyCheckout.keyLearnings?.trim()) completed++;
    if (nightlyCheckout.tomorrowTopTasks.some(task => task.trim() !== '')) completed++;

    return total > 0 ? (completed / total) * 100 : 0;
  }, [nightlyCheckout]);

  // Calculate XP for this checkout (depends on both streak and progress)
  const checkoutXP = useMemo(() => {
    const baseXP = 8; // Base checkout XP
    const streakBonus = Math.min(currentStreak * 2, 50); // Up to +50 XP for streak
    const completionBonus = checkoutProgress === 100 ? 25 : 0; // +25 for perfect completion
    return baseXP + streakBonus + completionBonus;
  }, [currentStreak, checkoutProgress]);

  // Helper function to update checkout data and mark as edited
  const updateCheckout = useCallback(
    (updates: Partial<typeof nightlyCheckout>) => {
      setNightlyCheckout(prev => ({ ...prev, ...updates }));
      markEdited();
    },
    [markEdited]
  );

  // Helper functions for dynamic array management
  const addWentWellItem = useCallback(() => {
    setNightlyCheckout(prev => ({
      ...prev,
      wentWell: [...prev.wentWell, '']
    }));
    markEdited();
  }, [markEdited]);

  const removeWentWellItem = useCallback(
    (index: number) => {
      let didUpdate = false;
      setNightlyCheckout(prev => {
        if (prev.wentWell.length <= 1) {
          return prev;
        }

        didUpdate = true;
        return {
          ...prev,
          wentWell: prev.wentWell.filter((_, i) => i !== index)
        };
      });

      if (didUpdate) {
        markEdited();
      }
    },
    [markEdited]
  );

  const addEvenBetterIfItem = useCallback(() => {
    setNightlyCheckout(prev => ({
      ...prev,
      evenBetterIf: [...prev.evenBetterIf, '']
    }));
    markEdited();
  }, [markEdited]);

  const removeEvenBetterIfItem = useCallback(
    (index: number) => {
      let didUpdate = false;
      setNightlyCheckout(prev => {
        if (prev.evenBetterIf.length <= 1) {
          return prev;
        }

        didUpdate = true;
        return {
          ...prev,
          evenBetterIf: prev.evenBetterIf.filter((_, i) => i !== index)
        };
      });

      if (didUpdate) {
        markEdited();
      }
    },
    [markEdited]
  );

  const handleWentWellChange = useCallback(
    (index: number, value: string) => {
      setNightlyCheckout(prev => {
        const updated = [...prev.wentWell];
        updated[index] = value;
        return { ...prev, wentWell: updated };
      });
      markEdited();
    },
    [markEdited]
  );

  const handleEvenBetterIfChange = useCallback(
    (index: number, value: string) => {
      setNightlyCheckout(prev => {
        const updated = [...prev.evenBetterIf];
        updated[index] = value;
        return { ...prev, evenBetterIf: updated };
      });
      markEdited();
    },
    [markEdited]
  );

  // Sync local state with Supabase data when reflection loads OR reset when changing to new day
  useEffect(() => {
    // Always update form state - either with saved data or empty defaults
    setNightlyCheckout({
      winOfDay: reflection?.winOfDay || '',
      mood: reflection?.mood || '',
      bedTime: reflection?.bedTime || '', // ✅ FIXED: Load bedTime from database
      wentWell: reflection?.wentWell && reflection.wentWell.length > 0 ? reflection.wentWell : [''],
      evenBetterIf: reflection?.evenBetterIf && reflection.evenBetterIf.length > 0 ? reflection.evenBetterIf : [''],
      dailyAnalysis: reflection?.dailyAnalysis || '',
      actionItems: reflection?.actionItems || '',
      overallRating: reflection?.overallRating,
      energyLevel: reflection?.energyLevel,
      keyLearnings: reflection?.keyLearnings || '',
      tomorrowFocus: reflection?.tomorrowFocus || '',
      tomorrowTopTasks: reflection?.tomorrowTopTasks && reflection.tomorrowTopTasks.length > 0 ? reflection.tomorrowTopTasks : ['', '', '']
    });
    // Reset the edited flag when loading new date data
    setHasUserEdited(false);
  }, [reflection]);

  // Save to Supabase with debouncing
  useEffect(() => {
    if (!userId || isLoading || !hasUserEdited) return;

    const saveTimer = setTimeout(async () => {
      await saveReflection(nightlyCheckout);
      setHasUserEdited(false); // Reset after save
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nightlyCheckout, userId, isLoading, hasUserEdited]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#121212] relative overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
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

  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle setting current time as bed time
  const setCurrentTimeAsBedTime = () => {
    updateCheckout({ bedTime: getCurrentTime() }); // ✅ FIXED: Use updateCheckout to save
    setIsEditingBedTime(false);
  };





  return (
    <div className="min-h-screen w-full bg-[#121212] relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-24 bg-purple-900/10 border-purple-700/30">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Moon className="h-5 w-5 mr-2" />
            Nightly Check-Out
          </CardTitle>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-purple-300 mb-2">
              <span>Reflection Progress</span>
              <span>{`${Math.round(checkoutProgress)}%`}</span>
              {isSaving && <span className="text-xs text-purple-400">Saving...</span>}
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${checkoutProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-24">
          <NightlyStatsCard currentStreak={currentStreak} checkoutXP={checkoutXP} />

          {/* Yesterday's Focus - Accountability Check */}
          {yesterdayReflection?.tomorrowFocus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
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
                        Did you follow through? 🎯
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Voice Reflection Button - Prominent CTA */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Button
              onClick={() => setIsRecordingVoice(!isRecordingVoice)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold"
              disabled={isRecordingVoice}
            >
              {isRecordingVoice ? (
                <>
                  <div className="animate-pulse mr-2">🎤</div>
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Reflection (3 min)
                </>
              )}
            </Button>
            <p className="text-xs text-purple-400 text-center mt-2">
              Talk instead of type - 70% faster! ⚡
            </p>
          </motion.div>

          {/* Win of the Day - Primary Focus */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-700/30">
              <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                What was your BIGGEST win today?
              </h3>
              <Input
                value={nightlyCheckout.winOfDay}
                onChange={(e) => updateCheckout({ winOfDay: e.target.value })}
                className="bg-purple-900/20 border-purple-700/50 text-white text-lg font-medium placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
                placeholder="The ONE thing that made today successful..."
                autoFocus
              />
              <p className="text-xs text-purple-400 mt-2">
                Force yourself to pick just one - builds clarity 💎
              </p>
            </div>
          </motion.div>

          <MoodPicker
            title="How are you feeling right now?"
            moods={moods}
            selectedMood={nightlyCheckout.mood}
            onSelect={(value) => updateCheckout({ mood: value })}
          />

          {/* Divider */}
          <div className="border-t border-purple-700/20 mb-8" />

          {/* Bedtime Tracking Section - Hybrid Design */}
          <div className="mb-8">
            {!nightlyCheckout.bedTime && !isEditingBedTime ? (
              // State 1: Unset - Call to Action
              <div className="p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl hover:border-purple-600/50 transition-colors space-y-3">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-200 font-medium">Ready for bed?</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    onClick={setCurrentTimeAsBedTime}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                  >
                    Log Bedtime Now: {getCurrentTime()}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingBedTime(true)}
                    className="border-purple-600 text-purple-400 hover:bg-purple-900/20 w-full sm:w-auto"
                  >
                    Custom Time
                  </Button>
                </div>
              </div>
            ) : nightlyCheckout.bedTime && !isEditingBedTime ? (
              // State 2: Set - Collapsed View
              <div className="flex items-center justify-between p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-200">
                    Bedtime: <span className="font-semibold text-purple-100">{nightlyCheckout.bedTime}</span>
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingBedTime(true)}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                >
                  Edit
                </Button>
              </div>
            ) : (
              // State 3: Editing - Time Picker
              <div className="p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-200 font-medium">Set Bedtime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={nightlyCheckout.bedTime}
                    onChange={(e) => updateCheckout({ bedTime: e.target.value })}
                    className="flex-1 bg-purple-900/20 border border-purple-700/50 text-purple-100 rounded-md px-3 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none"
                  >
                    <option value="">Select time...</option>
                    <option value="9:00 PM">9:00 PM</option>
                    <option value="9:30 PM">9:30 PM</option>
                    <option value="10:00 PM">10:00 PM</option>
                    <option value="10:30 PM">10:30 PM</option>
                    <option value="11:00 PM">11:00 PM</option>
                    <option value="11:30 PM">11:30 PM</option>
                    <option value="12:00 AM">12:00 AM</option>
                    <option value="12:30 AM">12:30 AM</option>
                    <option value="1:00 AM">1:00 AM</option>
                    <option value="1:30 AM">1:30 AM</option>
                    <option value="2:00 AM">2:00 AM</option>
                  </select>
                  <Button
                    size="sm"
                    onClick={setCurrentTimeAsBedTime}
                    className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap"
                  >
                    Use Now: {getCurrentTime()}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingBedTime(false)}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <ReflectionList
              title="What went well today?"
              items={nightlyCheckout.wentWell}
              onAdd={addWentWellItem}
              onRemove={removeWentWellItem}
              onChange={handleWentWellChange}
              placeholder="Something positive that happened..."
              animationDelay={0.3}
            />

            {/* Divider */}
            <div className="border-t border-purple-700/20" />

            {/* Even better if - Clean bullet list design */}
            <ReflectionList
              title="Even better if..."
              items={nightlyCheckout.evenBetterIf}
              onAdd={addEvenBetterIfItem}
              onRemove={removeEvenBetterIfItem}
              onChange={handleEvenBetterIfChange}
              placeholder="Something that could improve..."
              animationDelay={0.4}
            />

            {/* Divider */}
            <div className="border-t border-purple-700/20" />

            {/* Consolidated Analysis & Action Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-semibold text-purple-300 mb-3 text-base">Analyze your day and areas for improvement</h4>
                <Textarea
                  value={nightlyCheckout.dailyAnalysis}
                  onChange={(e) => updateCheckout({ dailyAnalysis: e.target.value })}
                  className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[120px]"
                  placeholder="What patterns did you notice? What recurring behaviors showed up? What insights did you gain?"
                />
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-300 mb-3 text-base">Action items for improvement</h4>
                <Textarea
                  value={nightlyCheckout.actionItems}
                  onChange={(e) => updateCheckout({ actionItems: e.target.value })}
                  className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[120px]"
                  placeholder="What specific changes will you make? What will you do differently tomorrow?"
                />
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-purple-700/20" />

            {/* Energy Level Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-6"
            >
              <h4 className="font-semibold text-purple-300 mb-3 text-base">
                How was your energy today?
              </h4>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-purple-400">Drained</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={nightlyCheckout.energyLevel || 5}
                  onChange={(e) => updateCheckout({ energyLevel: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-sm text-purple-400">Energized</span>
                <div className="min-w-[60px] text-center">
                  <span className="text-2xl font-bold text-purple-100">
                    {nightlyCheckout.energyLevel || 5}
                  </span>
                  <span className="text-purple-400">/10</span>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-purple-700/20 mb-6" />

            {/* Overall Reflection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-semibold text-purple-300 mb-4 text-base">Rate your overall day (1-10):</h4>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => updateCheckout({ overallRating: rating })}
                      className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
                        nightlyCheckout.overallRating === rating
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'border-purple-600/50 text-purple-300 hover:border-purple-400 hover:bg-purple-900/20'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-purple-300 mb-3 text-base">Key learning from today:</h4>
                <Textarea
                  value={nightlyCheckout.keyLearnings}
                  onChange={(e) => updateCheckout({ keyLearnings: e.target.value })}
                  className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[100px]"
                  placeholder="What did you learn about yourself or life today?"
                />
              </div>

              {/* ✅ FIXED: Added Tomorrow's Focus field for accountability */}
              <div>
                <h4 className="font-semibold text-purple-300 mb-3 text-base">What's your main focus for tomorrow?</h4>
                <p className="text-xs text-purple-400 mb-3">
                  This will show up tomorrow as an accountability reminder 🎯
                </p>
                <Input
                  value={nightlyCheckout.tomorrowFocus}
                  onChange={(e) => updateCheckout({ tomorrowFocus: e.target.value })}
                  className="bg-purple-900/10 border-purple-700/30 text-white text-lg font-medium placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                  placeholder="e.g., Finish the client presentation, Launch new feature..."
                />
              </div>

              <div>
                <h4 className="font-semibold text-purple-300 mb-3 text-base">Tomorrow's Top 3 Tasks:</h4>
                <p className="text-xs text-purple-400 mb-3">
                  Specific {'>'}  Vague. What are the 3 most important things?
                </p>
                <div className="space-y-2">
                  {nightlyCheckout.tomorrowTopTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-purple-400 font-bold text-lg">#{idx + 1}</span>
                      <Input
                        value={task}
                        onChange={(e) => {
                          const newTasks = [...nightlyCheckout.tomorrowTopTasks];
                          newTasks[idx] = e.target.value;
                          updateCheckout({ tomorrowTopTasks: newTasks });
                        }}
                        placeholder={`Task ${idx + 1}...`}
                        className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
      </div>
    </div>
  );
}
