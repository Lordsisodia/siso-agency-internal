import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Clock, CheckCircle, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AnimatedDateHeader } from '@/shared/ui/animated-date-header-v2';

import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import { useDailyReflections } from '@/shared/hooks/useDailyReflections';
import { BedTimeTracker } from './components/BedTimeTracker';

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
  
  const [bedTime, setBedTime] = useState<string>('');
  const [isEditingBedTime, setIsEditingBedTime] = useState(false);


  const [nightlyCheckout, setNightlyCheckout] = useState({
    wentWell: [''] as string[],
    evenBetterIf: [''] as string[],
    dailyAnalysis: '',
    actionItems: '',
    overallRating: undefined as number | undefined,
    keyLearnings: '',
    tomorrowFocus: ''
  });

  // Helper function to update checkout data and mark as edited
  const updateCheckout = (updates: Partial<typeof nightlyCheckout>) => {
    setNightlyCheckout(prev => ({ ...prev, ...updates }));
    setHasUserEdited(true);
  };

  // Helper functions for dynamic array management
  const addWentWellItem = () => {
    updateCheckout({
      wentWell: [...nightlyCheckout.wentWell, '']
    });
  };

  const removeWentWellItem = (index: number) => {
    if (nightlyCheckout.wentWell.length > 1) {
      updateCheckout({
        wentWell: nightlyCheckout.wentWell.filter((_, i) => i !== index)
      });
    }
  };

  const addEvenBetterIfItem = () => {
    updateCheckout({
      evenBetterIf: [...nightlyCheckout.evenBetterIf, '']
    });
  };

  const removeEvenBetterIfItem = (index: number) => {
    if (nightlyCheckout.evenBetterIf.length > 1) {
      updateCheckout({
        evenBetterIf: nightlyCheckout.evenBetterIf.filter((_, i) => i !== index)
      });
    }
  };

  // Sync local state with Supabase data when reflection loads
  useEffect(() => {
    if (reflection) {
      setNightlyCheckout({
        wentWell: reflection.wentWell && reflection.wentWell.length > 0 ? reflection.wentWell : [''],
        evenBetterIf: reflection.evenBetterIf && reflection.evenBetterIf.length > 0 ? reflection.evenBetterIf : [''],
        dailyAnalysis: reflection.dailyAnalysis || '',
        actionItems: reflection.actionItems || '',
        overallRating: reflection.overallRating,
        keyLearnings: reflection.keyLearnings || '',
        tomorrowFocus: reflection.tomorrowFocus || ''
      });
    }
  }, [reflection]);

  // Save to Supabase with debouncing
  const [hasUserEdited, setHasUserEdited] = useState(false);
  
  useEffect(() => {
    if (!userId || isLoading || !hasUserEdited) return;
    
    const saveTimer = setTimeout(async () => {
      await saveReflection(nightlyCheckout);
      setHasUserEdited(false); // Reset after save
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nightlyCheckout, userId, isLoading, hasUserEdited]);

  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle setting current time as bed time
  const setCurrentTimeAsBedTime = () => {
    setBedTime(getCurrentTime());
    setIsEditingBedTime(false);
  };



  // Calculate completion progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 6;
    
    // Check if wentWell has at least one non-empty item
    if (nightlyCheckout.wentWell.some(item => item.trim() !== '')) completed++;
    
    // Check if evenBetterIf has at least one non-empty item
    if (nightlyCheckout.evenBetterIf.some(item => item.trim() !== '')) completed++;
    
    // Check other fields
    if (nightlyCheckout.dailyAnalysis?.trim()) completed++;
    if (nightlyCheckout.actionItems?.trim()) completed++;
    if (nightlyCheckout.keyLearnings?.trim()) completed++;
    if (nightlyCheckout.tomorrowFocus?.trim()) completed++;
    
    return total > 0 ? (completed / total) * 100 : 0;
  };
  
  const checkoutProgress = calculateProgress();

  return (
    <div className="min-h-screen w-full bg-gray-900 relative">
      {/* Progress Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50"></div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        {/* Animated Date Header */}
        <AnimatedDateHeader
          selectedDate={selectedDate}
          earnedXP={0}
          potentialXP={0}
          currentLevel={1}
          streakDays={0}
          badgeCount={0}
          onPreviousDate={onPreviousDate}
          onNextDate={onNextDate}
          colorScheme="purple"
        />

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
              <span>{isLoading ? 'Loading...' : `${Math.round(checkoutProgress)}%`}</span>
              {isSaving && <span className="text-xs text-purple-400">Saving...</span>}
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: isLoading ? '0%' : `${checkoutProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-24">
          {/* Bedtime Tracking Section - Hybrid Design */}
          <div className="mb-8">
            {!bedTime && !isEditingBedTime ? (
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
            ) : bedTime && !isEditingBedTime ? (
              // State 2: Set - Collapsed View
              <div className="flex items-center justify-between p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-200">
                    Bedtime: <span className="font-semibold text-purple-100">{bedTime}</span>
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
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
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
            {/* What went well - Clean bullet list design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-purple-300 text-base">What went well today?</h4>
                <Button
                  onClick={addWentWellItem}
                  size="sm"
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2 pl-4 border-l-2 border-purple-700/30">
                {nightlyCheckout.wentWell.map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-2.5">•</span>
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...nightlyCheckout.wentWell];
                        newArray[index] = e.target.value;
                        updateCheckout({ wentWell: newArray });
                      }}
                      className="bg-transparent border-0 border-b border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-0 rounded-none px-2 py-1.5 flex-1"
                      placeholder="Something positive that happened..."
                    />
                    {nightlyCheckout.wentWell.length > 1 && (
                      <Button
                        onClick={() => removeWentWellItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-purple-400/60 hover:text-purple-300 hover:bg-purple-900/20 p-1.5 h-auto"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-purple-700/20" />

            {/* Even better if - Clean bullet list design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-purple-300 text-base">Even better if...</h4>
                <Button
                  onClick={addEvenBetterIfItem}
                  size="sm"
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2 pl-4 border-l-2 border-purple-700/30">
                {nightlyCheckout.evenBetterIf.map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-2.5">•</span>
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...nightlyCheckout.evenBetterIf];
                        newArray[index] = e.target.value;
                        updateCheckout({ evenBetterIf: newArray });
                      }}
                      className="bg-transparent border-0 border-b border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-0 rounded-none px-2 py-1.5 flex-1"
                      placeholder="Something that could improve..."
                    />
                    {nightlyCheckout.evenBetterIf.length > 1 && (
                      <Button
                        onClick={() => removeEvenBetterIfItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-purple-400/60 hover:text-purple-300 hover:bg-purple-900/20 p-1.5 h-auto"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

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

              <div>
                <h4 className="font-semibold text-purple-300 mb-3 text-base">Tomorrow's focus:</h4>
                <Textarea
                  value={nightlyCheckout.tomorrowFocus}
                  onChange={(e) => updateCheckout({ tomorrowFocus: e.target.value })}
                  className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[100px]"
                  placeholder="What's your main focus for tomorrow?"
                />
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
