import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock, Mic, Sparkles, CheckCircle, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { PromptInputBox } from '@/shared/ui/ai-prompt-box';
import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import { useDailyReflections } from '@/shared/hooks/useDailyReflections';

interface NightlyCheckoutSectionProps {
  selectedDate: Date;
}

export const NightlyCheckoutSection: React.FC<NightlyCheckoutSectionProps> = ({
  selectedDate
}) => {
  const { userId } = useAuth();
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  // Use the new Supabase hook for data persistence
  const { reflection, loading: isLoading, saving: isSaving, saveReflection } = useDailyReflections({ selectedDate });
  
  const [bedTime, setBedTime] = useState<string>('');
  const [isEditingBedTime, setIsEditingBedTime] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<any>(null);
  const [showVoicePreview, setShowVoicePreview] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const [nightlyCheckout, setNightlyCheckout] = useState({
    wentWell: ['', '', ''],
    evenBetterIf: ['', '', '', '', ''],
    analysis: ['', '', ''],
    patterns: ['', '', ''],
    changes: ['', '', ''],
    overallRating: undefined as number | undefined,
    keyLearnings: '',
    tomorrowFocus: ''
  });

  // Helper functions for dynamic array management
  const addWentWellItem = () => {
    setNightlyCheckout(prev => ({
      ...prev,
      wentWell: [...prev.wentWell, '']
    }));
  };

  const removeWentWellItem = (index: number) => {
    if (nightlyCheckout.wentWell.length > 1) {
      setNightlyCheckout(prev => ({
        ...prev,
        wentWell: prev.wentWell.filter((_, i) => i !== index)
      }));
    }
  };

  // Sync local state with Supabase data when reflection loads
  useEffect(() => {
    if (reflection) {
      setNightlyCheckout({
        wentWell: reflection.wentWell && reflection.wentWell.length > 0 ? reflection.wentWell : ['', '', ''],
        evenBetterIf: reflection.evenBetterIf || ['', '', '', '', ''],
        analysis: reflection.analysis || ['', '', ''],
        patterns: reflection.patterns || ['', '', ''],
        changes: reflection.changes || ['', '', ''],
        overallRating: reflection.overallRating,
        keyLearnings: reflection.keyLearnings || '',
        tomorrowFocus: reflection.tomorrowFocus || ''
      });
    }
  }, [reflection]);

  // Save to Supabase with debouncing
  useEffect(() => {
    if (!userId || isLoading) return;
    
    const saveTimer = setTimeout(async () => {
      await saveReflection(nightlyCheckout);
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
  }, [nightlyCheckout, userId, isLoading, saveReflection]);

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

  // Voice analysis function with better error handling
  const analyzeVoiceInput = async (voiceText: string) => {
    setIsVoiceProcessing(true);
    setVoiceError(null);
    
    try {
      // Validate input
      if (!voiceText || voiceText.trim().length < 10) {
        throw new Error('Please provide more details about your day for a better analysis.');
      }
      
      // Here you would normally call your AI service
      // For now, I'll create a mock response that demonstrates the parsing
      const mockAnalysis = {
        wentWell: [
          voiceText.toLowerCase().includes('good') || voiceText.toLowerCase().includes('great') || voiceText.toLowerCase().includes('well') ? 'Had a good day overall' : '',
          voiceText.toLowerCase().includes('workout') || voiceText.toLowerCase().includes('exercise') ? 'Completed workout' : '',
          voiceText.toLowerCase().includes('work') || voiceText.toLowerCase().includes('productive') || voiceText.toLowerCase().includes('meeting') ? 'Productive work session' : '',
          voiceText.toLowerCase().includes('eat') || voiceText.toLowerCase().includes('meal') || voiceText.toLowerCase().includes('healthy') ? 'Maintained healthy eating' : ''
        ].filter(item => item !== ''),
        evenBetterIf: [
          voiceText.toLowerCase().includes('distract') || voiceText.toLowerCase().includes('phone') || voiceText.toLowerCase().includes('social media') ? 'Reduce phone/social media distractions' : '',
          voiceText.toLowerCase().includes('sleep') || voiceText.toLowerCase().includes('late') || voiceText.toLowerCase().includes('tired') ? 'Better sleep schedule' : '',
          voiceText.toLowerCase().includes('time') || voiceText.toLowerCase().includes('manage') || voiceText.toLowerCase().includes('rush') ? 'Better time management' : '',
          voiceText.toLowerCase().includes('stress') || voiceText.toLowerCase().includes('overwhelm') ? 'Better stress management' : '',
          voiceText.toLowerCase().includes('procrastinate') || voiceText.toLowerCase().includes('delay') ? 'Less procrastination' : ''
        ].filter(item => item !== ''),
        analysis: [
          voiceText.toLowerCase().includes('distract') ? 'Distractions seem to be a recurring challenge that needs addressing' : '',
          voiceText.toLowerCase().includes('time') ? 'Time management appears to be an area for improvement' : '',
          'Reflecting on daily patterns helps identify improvement opportunities'
        ].filter(item => item !== ''),
        patterns: [
          voiceText.toLowerCase().includes('phone') || voiceText.toLowerCase().includes('social') ? 'Tendency to get distracted by phone/social media' : '',
          voiceText.toLowerCase().includes('morning') || voiceText.toLowerCase().includes('start') ? 'Morning routines impact the rest of the day' : '',
          'Daily habits compound over time'
        ].filter(item => item !== ''),
        changes: [
          voiceText.toLowerCase().includes('phone') ? 'Put phone in another room during focused work' : '',
          voiceText.toLowerCase().includes('sleep') ? 'Set a consistent bedtime routine' : '',
          'Create more structured daily routines'
        ].filter(item => item !== '')
      };
      
      // Ensure we have at least some content
      if (mockAnalysis.wentWell.length === 0 && mockAnalysis.evenBetterIf.length === 0) {
        mockAnalysis.wentWell = ['Took time to reflect on the day'];
        mockAnalysis.evenBetterIf = ['Be more specific about daily experiences'];
      }
      
      setVoiceAnalysisResult(mockAnalysis);
      setShowVoicePreview(true);
      
    } catch (error) {
      console.error('Voice analysis failed:', error);
      setVoiceError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsVoiceProcessing(false);
    }
  };
  
  // Apply voice analysis results
  const applyVoiceAnalysis = () => {
    if (voiceAnalysisResult) {
      setNightlyCheckout(prev => ({
        wentWell: [
          ...voiceAnalysisResult.wentWell,
          ...Array(Math.max(0, 3 - voiceAnalysisResult.wentWell.length)).fill('')
        ].slice(0, 3),
        evenBetterIf: [
          ...voiceAnalysisResult.evenBetterIf,
          ...Array(Math.max(0, 5 - voiceAnalysisResult.evenBetterIf.length)).fill('')
        ].slice(0, 5),
        analysis: [
          ...voiceAnalysisResult.analysis,
          ...Array(Math.max(0, 3 - voiceAnalysisResult.analysis.length)).fill('')
        ].slice(0, 3),
        patterns: [
          ...voiceAnalysisResult.patterns,
          ...Array(Math.max(0, 3 - voiceAnalysisResult.patterns.length)).fill('')
        ].slice(0, 3),
        changes: [
          ...voiceAnalysisResult.changes,
          ...Array(Math.max(0, 3 - voiceAnalysisResult.changes.length)).fill('')
        ].slice(0, 3)
      }));
      setShowVoicePreview(false);
      setVoiceAnalysisResult(null);
    }
  };

  // Calculate completion progress
  const getAllInputs = () => {
    return [
      ...nightlyCheckout.wentWell,
      ...nightlyCheckout.evenBetterIf,
      ...nightlyCheckout.analysis,
      ...nightlyCheckout.patterns,
      ...nightlyCheckout.changes,
      nightlyCheckout.keyLearnings,
      nightlyCheckout.tomorrowFocus
    ];
  };

  const completedInputs = getAllInputs().filter(input => 
    typeof input === 'string' ? input.trim() !== '' : input !== undefined
  ).length;
  const totalInputs = getAllInputs().length;
  const checkoutProgress = totalInputs > 0 ? (completedInputs / totalInputs) * 100 : 0;

  return (
    <div className="min-h-screen w-full bg-gray-900 relative">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-purple-900/20 border-purple-700/50">
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
          {/* Voice Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-purple-700/10 backdrop-blur-sm border border-purple-700/30 rounded-xl"
          >
            <h4 className="font-semibold text-purple-300 mb-4 flex items-center text-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              🎤 Voice-Powered Reflection
            </h4>
            <p className="text-purple-300/70 text-sm mb-5">
              Speak naturally about your day and AI will automatically organize your thoughts into the reflection categories below.
            </p>
            
            <div className="space-y-4">
              <PromptInputBox
                onSend={(text) => {
                  setVoiceError(null); // Clear any previous errors
                  analyzeVoiceInput(text);
                }}
                isLoading={isVoiceProcessing}
                placeholder="Tell me about your day... What went well? What could have been better? Any patterns you noticed?"
                className="bg-indigo-900/20 border-indigo-600/40"
              />
              
              {isVoiceProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-4 text-indigo-300"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mr-3"
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  Analyzing your reflection...
                </motion.div>
              )}
              
              {voiceError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg"
                >
                  <p className="text-red-300 text-sm mb-2">⚠️ {voiceError}</p>
                  <p className="text-red-200/70 text-xs">
                    Tip: You can also type your reflection directly in the text box above if voice isn't working.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Voice Analysis Preview Modal */}
          {showVoicePreview && voiceAnalysisResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-purple-700/10 backdrop-blur-sm border border-purple-700/30 rounded-xl"
            >
              <h4 className="font-semibold text-purple-300 mb-4 flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                AI Analysis Results
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {voiceAnalysisResult.wentWell.length > 0 && (
                  <div>
                    <h5 className="text-purple-200 font-medium mb-2">What went well:</h5>
                    <ul className="space-y-1">
                      {voiceAnalysisResult.wentWell.map((item: string, index: number) => (
                        <li key={index} className="text-purple-100/80 text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {voiceAnalysisResult.evenBetterIf.length > 0 && (
                  <div>
                    <h5 className="text-purple-200 font-medium mb-2">Could improve:</h5>
                    <ul className="space-y-1">
                      {voiceAnalysisResult.evenBetterIf.map((item: string, index: number) => (
                        <li key={index} className="text-purple-100/80 text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={applyVoiceAnalysis}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Apply to Reflection
                </Button>
                <Button
                  onClick={() => {
                    setShowVoicePreview(false);
                    setVoiceAnalysisResult(null);
                  }}
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
          {/* Bedtime Tracking Section */}
          <div className="mb-6 p-4 bg-purple-900/10 border border-purple-700/30 rounded-xl">
            <h4 className="font-semibold text-purple-300 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Sleep Time Tracker
            </h4>
            
            {bedTime ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-purple-900/20 border border-purple-700/50 rounded-md px-3 py-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-100 font-semibold">
                    Going to bed at: {bedTime}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingBedTime(!isEditingBedTime)}
                  className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                >
                  Edit
                </Button>
              </div>
            ) : null}
            
            {(!bedTime || isEditingBedTime) && (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter bedtime (e.g., 10:30 PM)"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="bg-orange-900/20 border-orange-700/50 text-orange-100 text-sm placeholder:text-gray-400 focus:border-orange-600 flex-1"
                />
                <Button
                  size="sm"
                  onClick={setCurrentTimeAsBedTime}
                  className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
                >
                  Use Now ({getCurrentTime()})
                </Button>
              </div>
            )}
            
            <p className="text-xs text-gray-400 italic mt-2">
              Track your bedtime to maintain consistent sleep schedule.
            </p>
          </div>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-900/20 border-purple-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-400 text-lg">What went well today?</h4>
                <Button
                  onClick={addWentWellItem}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {nightlyCheckout.wentWell.map((item: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...nightlyCheckout.wentWell];
                        newArray[index] = e.target.value;
                        setNightlyCheckout(prev => ({ ...prev, wentWell: newArray }));
                      }}
                      className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg flex-1"
                      placeholder="Something positive that happened today..."
                    />
                    {nightlyCheckout.wentWell.length > 1 && (
                      <Button
                        onClick={() => removeWentWellItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 p-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-900/20 border-purple-700/50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-purple-400 mb-4 text-lg">Even better if...</h4>
              <div className="space-y-3">
                {nightlyCheckout.evenBetterIf.map((item: string, index: number) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => {
                      const newArray = [...nightlyCheckout.evenBetterIf];
                      newArray[index] = e.target.value;
                      setNightlyCheckout(prev => ({ ...prev, evenBetterIf: newArray }));
                    }}
                    className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                    placeholder="Something that could have been improved..."
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-purple-900/20 border-purple-700/50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-purple-400 mb-4 text-lg">Analysis & Improvement</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-purple-300/70 text-sm mb-4">Analysis</p>
                  <div className="space-y-3">
                    {nightlyCheckout.analysis.map((item: string, index: number) => (
                      <Textarea
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.analysis];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, analysis: newArray }));
                        }}
                        className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[80px]"
                        placeholder="Analyze your day and areas for improvement..."
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-purple-300/70 text-sm mb-4">Patterns</p>
                  <div className="space-y-3">
                    {nightlyCheckout.patterns.map((item: string, index: number) => (
                      <Textarea
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.patterns];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, patterns: newArray }));
                        }}
                        className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[80px]"
                        placeholder="Identify recurring patterns or behaviors..."
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-purple-300/70 text-sm mb-4">Changes</p>
                  <div className="space-y-3">
                    {nightlyCheckout.changes.map((item: string, index: number) => (
                      <Textarea
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.changes];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, changes: newArray }));
                        }}
                        className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[80px]"
                        placeholder="What changes will you make to improve..."
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-900/20 border-purple-700/50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-purple-400 mb-4 text-lg">Overall Reflection</h4>
              
              <div className="space-y-6">
                <div>
                  <p className="text-purple-300/70 text-sm mb-4">Rate your overall day (1-10):</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNightlyCheckout(prev => ({ ...prev, overallRating: rating }))}
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
                  <p className="text-purple-300/70 text-sm mb-4">Key learning from today:</p>
                  <Textarea
                    value={nightlyCheckout.keyLearnings}
                    onChange={(e) => setNightlyCheckout(prev => ({ ...prev, keyLearnings: e.target.value }))}
                    className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[100px]"
                    placeholder="What did you learn about yourself or life today?"
                  />
                </div>

                <div>
                  <p className="text-purple-300/70 text-sm mb-4">Tomorrow's focus:</p>
                  <Textarea
                    value={nightlyCheckout.tomorrowFocus}
                    onChange={(e) => setNightlyCheckout(prev => ({ ...prev, tomorrowFocus: e.target.value }))}
                    className="bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[100px]"
                    placeholder="What's your main focus for tomorrow?"
                  />
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
};