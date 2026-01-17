import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, AlertCircle, Target, List } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TomorrowsPlanSectionProps {
  nonNegotiables: string[];
  tomorrowFocus: string;
  topTasks: [string, string, string];
  onChange: (updates: {
    nonNegotiables?: string[];
    tomorrowFocus?: string;
    topTasks?: [string, string, string];
  }) => void;
}

export const TomorrowsPlanSection: React.FC<TomorrowsPlanSectionProps> = ({
  nonNegotiables,
  tomorrowFocus,
  topTasks,
  onChange
}) => {
  const [expandedSections, setExpandedSections] = useState({
    nonNegotiables: false,
    mainFocus: false,
    topTasks: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateNonNegotiable = (index: number, value: string) => {
    const newNonNegotiables = [...nonNegotiables];
    newNonNegotiables[index] = value;
    onChange({ nonNegotiables: newNonNegotiables });
  };

  const updateTopTask = (index: number, value: string) => {
    const newTasks = [...topTasks] as [string, string, string];
    newTasks[index] = value;
    onChange({ topTasks: newTasks });
  };

  return (
    <div className="w-full">
      <Card className="mx-6 sm:mx-8 md:mx-12 bg-purple-900/10 border-purple-700/30 overflow-hidden">
        {/* Solid Purple Header Bar */}
        <div className="bg-purple-800/80 border-b border-purple-700/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Tomorrow's Plan</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Non-Negotiables - Collapsible */}
          <div className="border border-purple-700/30 rounded-lg overflow-hidden">
            <div
              className="bg-purple-900/20 px-4 py-3 cursor-pointer hover:bg-purple-900/30 transition-colors"
              onClick={() => toggleSection('nonNegotiables')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <h4 className="font-semibold text-purple-300 text-sm">Non-Negotiables</h4>
                </div>
                {expandedSections.nonNegotiables ? (
                  <ChevronUp className="h-4 w-4 text-purple-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-purple-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.nonNegotiables && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-purple-400">
                      The things you MUST do tomorrow, no matter what
                    </p>
                    <div className="space-y-2 pl-4 border-l-2 border-red-700/30">
                      {nonNegotiables.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-red-400 mt-2.5">•</span>
                          <Input
                            value={item}
                            onChange={(e) => updateNonNegotiable(index, e.target.value)}
                            className="bg-transparent border-0 border-b border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-red-400 focus:ring-0 rounded-none px-2 py-1.5 flex-1"
                            placeholder="A must-do task..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Focus - Collapsible */}
          <div className="border border-purple-700/30 rounded-lg overflow-hidden">
            <div
              className="bg-purple-900/20 px-4 py-3 cursor-pointer hover:bg-purple-900/30 transition-colors"
              onClick={() => toggleSection('mainFocus')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <h4 className="font-semibold text-purple-300 text-sm">Main Focus</h4>
                </div>
                {expandedSections.mainFocus ? (
                  <ChevronUp className="h-4 w-4 text-purple-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-purple-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.mainFocus && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-purple-400">
                      Shows up tomorrow as an accountability reminder 🎯
                    </p>
                    <Input
                      value={tomorrowFocus}
                      onChange={(e) => onChange({ tomorrowFocus: e.target.value })}
                      className="bg-purple-900/10 border-purple-700/30 text-white text-lg font-medium placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                      placeholder="Your main focus for tomorrow..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top 3 Tasks - Collapsible */}
          <div className="border border-purple-700/30 rounded-lg overflow-hidden">
            <div
              className="bg-purple-900/20 px-4 py-3 cursor-pointer hover:bg-purple-900/30 transition-colors"
              onClick={() => toggleSection('topTasks')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-purple-400" />
                  <h4 className="font-semibold text-purple-300 text-sm">Top 3 Tasks</h4>
                </div>
                {expandedSections.topTasks ? (
                  <ChevronUp className="h-4 w-4 text-purple-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-purple-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.topTasks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-purple-400">
                      Specific &gt; Vague. What are the 3 most important things?
                    </p>
                    <div className="space-y-2">
                      {topTasks.map((task, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="text-purple-400 font-bold text-lg">#{idx + 1}</span>
                          <Input
                            value={task}
                            onChange={(e) => updateTopTask(idx, e.target.value)}
                            placeholder={`Task ${idx + 1}...`}
                            className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
};

TomorrowsPlanSection.displayName = 'TomorrowsPlanSection';
