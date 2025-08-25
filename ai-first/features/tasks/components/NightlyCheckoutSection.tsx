import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-3">1. What went well today?</h4>
              <p className="text-gray-400 text-sm mb-3">(Write down at least three positive things that happened during the day)</p>
              <div className="space-y-2">
                {nightlyCheckout.wentWell.map((item: string, index: number) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => {
                      const newArray = [...nightlyCheckout.wentWell];
                      newArray[index] = e.target.value;
                      setNightlyCheckout(prev => ({ ...prev, wentWell: newArray }));
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={`Positive thing ${index + 1}...`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">2. Even better if...</h4>
              <p className="text-gray-400 text-sm mb-3">(List areas where you could improve or things that could have gone better)</p>
              <div className="space-y-2">
                {nightlyCheckout.evenBetterIf.map((item: string, index: number) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => {
                      const newArray = [...nightlyCheckout.evenBetterIf];
                      newArray[index] = e.target.value;
                      setNightlyCheckout(prev => ({ ...prev, evenBetterIf: newArray }));
                    }}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={`Improvement area ${index + 1}...`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">3. Analysis & Improvement:</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">(Reflect on how you can improve in the areas mentioned in "Even better if...")</p>
                  <div className="space-y-2">
                    {nightlyCheckout.analysis.map((item: string, index: number) => (
                      <Textarea
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.analysis];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, analysis: newArray }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={`Analysis point ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-2">(Identify any patterns or behaviors that may be preventing you from achieving your goals)</p>
                  <div className="space-y-2">
                    {nightlyCheckout.patterns.map((item: string, index: number) => (
                      <Textarea
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.patterns];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, patterns: newArray }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={`Pattern ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-2">(Consider any changes you can make in your habits or environment to support improvement)</p>
                  <div className="space-y-2">
                    {nightlyCheckout.changes.map((item: string, index: number) => (
                      <Textarea
                        key={index}
                        value={item}
                        onChange={(e) => {
                          const newArray = [...nightlyCheckout.changes];
                          newArray[index] = e.target.value;
                          setNightlyCheckout(prev => ({ ...prev, changes: newArray }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={`Change ${index + 1}...`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};