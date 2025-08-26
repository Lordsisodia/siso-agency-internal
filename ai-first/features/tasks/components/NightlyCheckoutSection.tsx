import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock, Mic, Sparkles, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { format } from 'date-fns';

interface NightlyCheckoutSectionProps {
  selectedDate: Date;
}

export const NightlyCheckoutSection: React.FC<NightlyCheckoutSectionProps> = ({
  selectedDate
}) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const [bedTime, setBedTime] = useState<string>(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-bedTime`);
    return saved || '';
  });

  const [isEditingBedTime, setIsEditingBedTime] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<any>(null);
  const [showVoicePreview, setShowVoicePreview] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const [nightlyCheckout, setNightlyCheckout] = useState(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-nightlyCheckout`);
    return saved ? JSON.parse(saved) : {
      wentWell: ['', '', ''],
      evenBetterIf: ['', '', '', '', ''],
      analysis: ['', '', ''],
      patterns: ['', '', ''],
      changes: ['', '', '']
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-nightlyCheckout`, JSON.stringify(nightlyCheckout));
  }, [nightlyCheckout, dateKey]);

  // Save bed time to localStorage
  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-bedTime`, bedTime);
  }, [bedTime, dateKey]);

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
      ...nightlyCheckout.changes
    ];
  };

  const completedInputs = getAllInputs().filter(input => input.trim() !== '').length;
  const totalInputs = getAllInputs().length;
  const checkoutProgress = totalInputs > 0 ? (completedInputs / totalInputs) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="bg-indigo-900/20 border-indigo-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-400">
            <Moon className="h-5 w-5 mr-2" />
            🌙 Nightly Check-Out
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-indigo-300 mb-2">
              <span>Reflection Progress</span>
              <span>{Math.round(checkoutProgress)}%</span>
            </div>
            <div className="w-full bg-indigo-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${checkoutProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Voice Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 bg-gradient-to-br from-indigo-900/20 via-indigo-800/15 to-indigo-700/10 backdrop-blur-sm border border-indigo-700/30 rounded-xl"
          >
            <h4 className="font-semibold text-indigo-300 mb-4 flex items-center text-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              🎤 Voice-Powered Reflection
            </h4>
            <p className="text-indigo-300/70 text-sm mb-5">
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
              className="mb-8 p-6 bg-gradient-to-br from-green-900/20 via-green-800/15 to-green-700/10 backdrop-blur-sm border border-green-700/30 rounded-xl"
            >
              <h4 className="font-semibold text-green-300 mb-4 flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                AI Analysis Results
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {voiceAnalysisResult.wentWell.length > 0 && (
                  <div>
                    <h5 className="text-green-200 font-medium mb-2">What went well:</h5>
                    <ul className="space-y-1">
                      {voiceAnalysisResult.wentWell.map((item: string, index: number) => (
                        <li key={index} className="text-green-100/80 text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {voiceAnalysisResult.evenBetterIf.length > 0 && (
                  <div>
                    <h5 className="text-green-200 font-medium mb-2">Could improve:</h5>
                    <ul className="space-y-1">
                      {voiceAnalysisResult.evenBetterIf.map((item: string, index: number) => (
                        <li key={index} className="text-green-100/80 text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={applyVoiceAnalysis}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Apply to Reflection
                </Button>
                <Button
                  onClick={() => {
                    setShowVoicePreview(false);
                    setVoiceAnalysisResult(null);
                  }}
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-900/20"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
          {/* Bedtime Tracking Section */}
          <div className="mb-6 p-4 bg-indigo-900/10 border border-indigo-700/30 rounded-xl">
            <h4 className="font-semibold text-indigo-300 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Sleep Time Tracker
            </h4>
            
            {bedTime ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-indigo-900/20 border border-indigo-700/50 rounded-md px-3 py-2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span className="text-indigo-100 font-semibold">
                    Going to bed at: {bedTime}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingBedTime(!isEditingBedTime)}
                  className="border-indigo-600 text-indigo-400 hover:bg-indigo-900/20"
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
                  className="bg-indigo-900/20 border-indigo-700/50 text-indigo-100 text-sm placeholder:text-gray-400 focus:border-indigo-600 flex-1"
                />
                <Button
                  size="sm"
                  onClick={setCurrentTimeAsBedTime}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
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
              className="bg-gradient-to-br from-indigo-900/15 via-indigo-800/10 to-indigo-700/5 backdrop-blur-sm border border-indigo-700/20 rounded-xl p-6"
            >
              <h4 className="font-semibold text-white mb-4 text-lg">1. What went well today?</h4>
              <p className="text-indigo-300/70 text-sm mb-5">(Write down at least three positive things that happened during the day)</p>
              <div className="space-y-3">
                {nightlyCheckout.wentWell.map((item: string, index: number) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => {
                      const newArray = [...nightlyCheckout.wentWell];
                      newArray[index] = e.target.value;
                      setNightlyCheckout(prev => ({ ...prev, wentWell: newArray }));
                    }}
                    className="bg-indigo-900/40 border-indigo-600/50 text-white placeholder:text-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg"
                    placeholder={`Positive thing ${index + 1}...`}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-indigo-900/15 via-indigo-800/10 to-indigo-700/5 backdrop-blur-sm border border-indigo-700/20 rounded-xl p-6"
            >
              <h4 className="font-semibold text-white mb-4 text-lg">2. Even better if...</h4>
              <p className="text-indigo-300/70 text-sm mb-5">(List areas where you could improve or things that could have gone better)</p>
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
                    className="bg-indigo-900/40 border-indigo-600/50 text-white placeholder:text-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg"
                    placeholder={`Improvement area ${index + 1}...`}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-900/15 via-indigo-800/10 to-indigo-700/5 backdrop-blur-sm border border-indigo-700/20 rounded-xl p-6"
            >
              <h4 className="font-semibold text-white mb-4 text-lg">3. Analysis & Improvement:</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-indigo-300/70 text-sm mb-4">(Reflect on how you can improve in the areas mentioned in "Even better if...")</p>
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
                        className="bg-indigo-900/40 border-indigo-600/50 text-white placeholder:text-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg min-h-[80px]"
                        placeholder={`Analysis point ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-indigo-300/70 text-sm mb-4">(Identify any patterns or behaviors that may be preventing you from achieving your goals)</p>
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
                        className="bg-indigo-900/40 border-indigo-600/50 text-white placeholder:text-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg min-h-[80px]"
                        placeholder={`Pattern ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-indigo-300/70 text-sm mb-4">(Consider any changes you can make in your habits or environment to support improvement)</p>
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
                        className="bg-indigo-900/40 border-indigo-600/50 text-white placeholder:text-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400/20 rounded-lg min-h-[80px]"
                        placeholder={`Change ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};