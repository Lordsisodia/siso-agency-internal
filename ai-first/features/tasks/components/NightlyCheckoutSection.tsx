import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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