import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Activity, Apple, Brain, Book, Moon, CheckCircle, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';

import {
  MeditationCard,
  WorkoutCard,
  NutritionCard,
  DeepWorkCard,
  ResearchCard,
  SleepCard
} from './index';

interface DailyMetricsSectionProps {
  meditation: { minutes: number; focusLevel: 'distracted' | 'somewhat-focused' | 'deeply-present' | null; feelingAfter: 'more-stressed' | 'same' | 'more-calm' | 'transformed' | null };
  workout: { completed: boolean; type: string; duration: number; intensity: string };
  nutrition: { protein: number; hitGoal: boolean };
  deepWork: { hours: number; quality: number; flowState?: 'distracted' | 'focused' | 'flow' };
  research: { hours: number; topic: string; notes: string };
  sleep: { hours: number; bedTime: string; wakeTime: string; quality: number };
  xpBreakdown: {
    meditation: number;
    workout: number;
    nutrition: number;
    deepWork: number;
    research: number;
    sleep: number;
    bedTime: number;
  };
  saving: boolean;
  onChange: (updates: {
    meditation?: { minutes: number; focusLevel: 'distracted' | 'somewhat-focused' | 'deeply-present' | null; feelingAfter: 'more-stressed' | 'same' | 'more-calm' | 'transformed' | null };
    workout?: { completed: boolean; type: string; duration: number; intensity: string };
    nutrition?: { protein: number; hitGoal: boolean };
    deepWork?: { hours: number; quality: number; flowState?: 'distracted' | 'focused' | 'flow' };
    research?: { hours: number; topic: string; notes: string };
    sleep?: { hours: number; bedTime: string; wakeTime: string; quality: number };
  }) => void;
  meditationStreakData?: {
    last7Days: number;
    totalSessions: number;
    averageMinutes: number;
  };
  autoCalculatedDeepWorkHours?: number;
  completedDeepWorkTaskCount?: number;
}

export const DailyMetricsSection: React.FC<DailyMetricsSectionProps> = ({
  meditation,
  workout,
  nutrition,
  deepWork,
  research,
  sleep,
  xpBreakdown,
  saving,
  onChange,
  meditationStreakData,
  autoCalculatedDeepWorkHours = 0,
  completedDeepWorkTaskCount = 0
}) => {
  const [expandedSections, setExpandedSections] = useState({
    meditation: false,
    workout: false,
    nutrition: false,
    deepWork: false,
    research: false,
    sleep: false
  });

  // Track previous completion states for auto-collapse
  const prevCompleteRef = useRef({
    meditation: false,
    workout: false,
    nutrition: false,
    deepWork: false,
    research: false,
    sleep: false
  });
  // Track expanded sections in ref to avoid dependency cycle
  const expandedSectionsRef = useRef(expandedSections);

  // Keep ref in sync with state
  useEffect(() => {
    expandedSectionsRef.current = expandedSections;
  }, [expandedSections]);

  // Auto-collapse sections when they become complete
  useEffect(() => {
    const hasMeditation = meditation.minutes > 0;
    const hasWorkout = workout.completed;
    const hasNutrition = nutrition.protein > 0;
    const hasDeepWork = deepWork.hours > 0;
    const hasResearch = research.hours > 0 || research.topic.trim() !== '';
    const hasSleep = sleep.hours > 0;

    // Check each section for transition from incomplete to complete
    // Use ref to check current state without adding expandedSections to dependencies
    if (hasMeditation && !prevCompleteRef.current.meditation && expandedSectionsRef.current.meditation) {
      setExpandedSections(prev => ({ ...prev, meditation: false }));
    }
    if (hasWorkout && !prevCompleteRef.current.workout && expandedSectionsRef.current.workout) {
      setExpandedSections(prev => ({ ...prev, workout: false }));
    }
    if (hasNutrition && !prevCompleteRef.current.nutrition && expandedSectionsRef.current.nutrition) {
      setExpandedSections(prev => ({ ...prev, nutrition: false }));
    }
    if (hasDeepWork && !prevCompleteRef.current.deepWork && expandedSectionsRef.current.deepWork) {
      setExpandedSections(prev => ({ ...prev, deepWork: false }));
    }
    if (hasResearch && !prevCompleteRef.current.research && expandedSectionsRef.current.research) {
      setExpandedSections(prev => ({ ...prev, research: false }));
    }
    if (hasSleep && !prevCompleteRef.current.sleep && expandedSectionsRef.current.sleep) {
      setExpandedSections(prev => ({ ...prev, sleep: false }));
    }

    // Update refs
    prevCompleteRef.current = {
      meditation: hasMeditation,
      workout: hasWorkout,
      nutrition: hasNutrition,
      deepWork: hasDeepWork,
      research: hasResearch,
      sleep: hasSleep
    };
  }, [meditation, workout, nutrition, deepWork, research, sleep]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const metrics = [
    {
      key: 'meditation' as const,
      title: 'Meditation',
      icon: <Zap className="h-4 w-4 text-purple-300" />,
      isComplete: meditation.minutes > 0,
      xp: xpBreakdown.meditation,
      component: (
        <MeditationCard
          value={meditation}
          onChange={(value) => onChange({ meditation: value })}
          saving={saving}
          streakData={meditationStreakData}
        />
      )
    },
    {
      key: 'workout' as const,
      title: 'Workout',
      icon: <Activity className="h-4 w-4 text-purple-300" />,
      isComplete: workout.completed,
      xp: xpBreakdown.workout,
      component: (
        <WorkoutCard
          value={workout}
          onChange={(value) => onChange({ workout: value })}
          saving={saving}
        />
      )
    },
    {
      key: 'nutrition' as const,
      title: 'Nutrition',
      icon: <Apple className="h-4 w-4 text-purple-300" />,
      isComplete: nutrition.protein > 0,
      xp: xpBreakdown.nutrition,
      component: (
        <NutritionCard
          value={nutrition}
          onChange={(value) => onChange({ nutrition: value })}
          saving={saving}
        />
      )
    },
    {
      key: 'deepWork' as const,
      title: 'Deep Work',
      icon: <Brain className="h-4 w-4 text-purple-300" />,
      isComplete: deepWork.hours > 0,
      xp: xpBreakdown.deepWork,
      component: (
        <DeepWorkCard
          value={deepWork}
          onChange={(value) => onChange({ deepWork: value })}
          saving={saving}
          autoCalculatedHours={autoCalculatedDeepWorkHours}
          completedTaskCount={completedDeepWorkTaskCount}
        />
      )
    },
    {
      key: 'research' as const,
      title: 'Research & Learning',
      icon: <Book className="h-4 w-4 text-purple-300" />,
      isComplete: research.hours > 0 || research.topic.trim() !== '',
      xp: xpBreakdown.research,
      component: (
        <ResearchCard
          value={research}
          onChange={(value) => onChange({ research: value })}
          saving={saving}
        />
      )
    },
    {
      key: 'sleep' as const,
      title: 'Sleep',
      icon: <Moon className="h-4 w-4 text-purple-300" />,
      isComplete: sleep.hours > 0,
      xp: xpBreakdown.sleep + xpBreakdown.bedTime,
      component: (
        <SleepCard
          value={sleep}
          onChange={(value) => onChange({ sleep: value })}
          saving={saving}
        />
      )
    }
  ];

  // Calculate completion stats
  const completedCount = metrics.filter(m => m.isComplete).length;
  const totalCount = metrics.length;

  return (
    <div className="w-full">
      {/* Today's XP Breakdown Card */}
      <Card className="bg-purple-900/20 border-purple-700/40 overflow-hidden">
        {/* Clickable Header */}
        <div
          className="p-4 sm:p-6 cursor-pointer hover:bg-purple-900/10 transition-colors"
          onClick={() => toggleSection('meditation')}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 rounded-lg border border-purple-400/30 flex-shrink-0">
                <Zap className="h-4 w-4 text-purple-300" />
              </div>
              <h4 className="text-purple-100 font-semibold text-base truncate">Today's XP Breakdown</h4>
              {/* Green CheckCircle when has content */}
              {completedCount > 0 && (
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
              {expandedSections.meditation ? (
                <ChevronUp className="h-5 w-5 text-purple-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-purple-400 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 mb-1">
            <div className="w-full bg-purple-900/30 border border-purple-600/20 rounded-full h-1.5">
              <motion.div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((completedCount / Math.max(totalCount, 1)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-purple-400/70 font-medium">
                {completedCount}/{totalCount} metrics tracked
              </span>
              {completedCount > 0 && !expandedSections.meditation && (
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1"><Check className="h-3 w-3" /> Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {expandedSections.meditation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.key} className="border border-purple-700/30 rounded-lg overflow-hidden bg-purple-900/10 hover:bg-purple-900/20 transition-colors">
                    <div
                      className="px-4 py-3.5 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggleSection(metric.key); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg border border-purple-400/30 flex items-center justify-center">
                            {metric.icon}
                          </div>
                          <h4 className="font-semibold text-purple-200">{metric.title}</h4>
                          {/* Green CheckCircle when complete */}
                          {metric.isComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <XPPill
                            xp={metric.xp}
                            earned={metric.isComplete}
                            showGlow={metric.isComplete}
                          />
                          {expandedSections[metric.key] ? (
                            <ChevronUp className="h-4 w-4 text-purple-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-purple-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedSections[metric.key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 bg-purple-950/30">
                            {metric.component}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

DailyMetricsSection.displayName = 'DailyMetricsSection';
