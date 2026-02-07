import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, AlertCircle, Target, List, CheckCircle, Check, Crosshair } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';

interface TomorrowsPlanSectionProps {
  nonNegotiables: string[];
  tomorrowFocus: string;
  topTasks: [string, string, string];
  xp: number;
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
  xp,
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

  // Calculate completion states
  const hasNonNegotiables = nonNegotiables.some(item => item.trim() !== '');
  const hasMainFocus = tomorrowFocus.trim() !== '';
  const hasTopTasks = topTasks.some(task => task.trim() !== '');

  // Calculate completion counts for progress
  const completedNonNegotiables = nonNegotiables.filter(item => item.trim() !== '').length;
  const completedTopTasks = topTasks.filter(task => task.trim() !== '').length;
  const totalCompleted = completedNonNegotiables + (hasMainFocus ? 1 : 0) + completedTopTasks;
  const totalItems = nonNegotiables.length + 1 + topTasks.length;

  return (
    <div className="w-full">
      <Card className="bg-purple-900/20 border-purple-700/40 overflow-hidden">
        {/* Clickable Header */}
        <div
          className="p-4 sm:p-6 cursor-pointer hover:bg-purple-900/10 transition-colors"
          onClick={() => toggleSection('nonNegotiables')}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 rounded-lg border border-purple-400/30 flex-shrink-0">
                <Clock className="h-4 w-4 text-purple-300" />
              </div>
              <h4 className="text-purple-100 font-semibold text-base truncate">Tomorrow's Plan</h4>
              {/* Green CheckCircle when all 3 subsections have content */}
              {hasNonNegotiables && hasMainFocus && hasTopTasks && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <XPPill
                xp={xp}
                earned={hasNonNegotiables || hasMainFocus || hasTopTasks}
                showGlow={hasNonNegotiables || hasMainFocus || hasTopTasks}
              />
              {expandedSections.nonNegotiables ? (
                <ChevronUp className="h-5 w-5 text-purple-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-purple-400 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="mt-2 mb-1">
            <div className="w-full bg-purple-900/30 border border-purple-600/20 rounded-full h-1.5">
              <motion.div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalCompleted / Math.max(totalItems, 1)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-purple-400/70 font-medium">
                {totalCompleted} items planned
              </span>
              {(hasNonNegotiables || hasMainFocus || hasTopTasks) && !expandedSections.nonNegotiables && (
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1"><Check className="h-3 w-3" /> Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {expandedSections.nonNegotiables && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                {/* Non-Negotiables */}
                <div className="border border-purple-700/30 rounded-lg overflow-hidden bg-purple-900/10">
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-purple-900/20 transition-colors"
                    onClick={(e) => { e.stopPropagation(); toggleSection('nonNegotiables'); }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-purple-400" />
                        <h4 className="font-semibold text-purple-300 text-sm">Non-Negotiables</h4>
                        {hasNonNegotiables && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </motion.div>
                        )}
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
                          <div className="space-y-2 pl-4 border-l-2 border-purple-700/30">
                            {nonNegotiables.map((item, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="text-purple-400 mt-2.5">•</span>
                                <Input
                                  value={item}
                                  onChange={(e) => updateNonNegotiable(index, e.target.value)}
                                  className="bg-transparent border-0 border-b border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-0 rounded-none px-2 py-1.5 flex-1"
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

                {/* Main Focus */}
                <div className="border border-purple-700/30 rounded-lg overflow-hidden bg-purple-900/10">
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-purple-900/20 transition-colors"
                    onClick={() => toggleSection('mainFocus')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        <h4 className="font-semibold text-purple-300 text-sm">Main Focus</h4>
                        {hasMainFocus && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </motion.div>
                        )}
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
                            Shows up tomorrow as an accountability reminder
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

                {/* Top 3 Tasks */}
                <div className="border border-purple-700/30 rounded-lg overflow-hidden bg-purple-900/10">
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-purple-900/20 transition-colors"
                    onClick={() => toggleSection('topTasks')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4 text-purple-400" />
                        <h4 className="font-semibold text-purple-300 text-sm">Top 3 Tasks</h4>
                        {hasTopTasks && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          </motion.div>
                        )}
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
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

TomorrowsPlanSection.displayName = 'TomorrowsPlanSection';
