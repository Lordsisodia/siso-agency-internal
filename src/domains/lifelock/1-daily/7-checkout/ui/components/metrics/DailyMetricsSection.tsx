import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Activity, Apple, Brain, Book, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';

import {
  MeditationCard,
  WorkoutCard,
  NutritionCard,
  DeepWorkCard,
  ResearchCard,
  SleepCard
} from './index';

interface DailyMetricsSectionProps {
  meditation: { minutes: number; quality: number };
  workout: { completed: boolean; type: string; duration: number; intensity: string };
  nutrition: { calories: number; protein: number; carbs: number; fats: number; hitGoal: boolean };
  deepWork: { hours: number; quality: number };
  research: { hours: number; topic: string; notes: string };
  sleep: { hours: number; bedTime: string; wakeTime: string; quality: number };
  saving: boolean;
  onChange: (updates: {
    meditation?: { minutes: number; quality: number };
    workout?: { completed: boolean; type: string; duration: number; intensity: string };
    nutrition?: { calories: number; protein: number; carbs: number; fats: number; hitGoal: boolean };
    deepWork?: { hours: number; quality: number };
    research?: { hours: number; topic: string; notes: string };
    sleep?: { hours: number; bedTime: string; wakeTime: string; quality: number };
  }) => void;
}

export const DailyMetricsSection: React.FC<DailyMetricsSectionProps> = ({
  meditation,
  workout,
  nutrition,
  deepWork,
  research,
  sleep,
  saving,
  onChange
}) => {
  const [expandedSections, setExpandedSections] = useState({
    meditation: false,
    workout: false,
    nutrition: false,
    deepWork: false,
    research: false,
    sleep: false
  });

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
      icon: <Zap className="h-4 w-4 text-purple-400" />,
      component: (
        <MeditationCard
          value={meditation}
          onChange={(value) => onChange({ meditation: value })}
          saving={saving}
        />
      )
    },
    {
      key: 'workout' as const,
      title: 'Workout',
      icon: <Activity className="h-4 w-4 text-purple-400" />,
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
      icon: <Apple className="h-4 w-4 text-purple-400" />,
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
      icon: <Brain className="h-4 w-4 text-purple-400" />,
      component: (
        <DeepWorkCard
          value={deepWork}
          onChange={(value) => onChange({ deepWork: value })}
          saving={saving}
        />
      )
    },
    {
      key: 'research' as const,
      title: 'Research & Learning',
      icon: <Book className="h-4 w-4 text-purple-400" />,
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
      icon: <Moon className="h-4 w-4 text-purple-400" />,
      component: (
        <SleepCard
          value={sleep}
          onChange={(value) => onChange({ sleep: value })}
          saving={saving}
        />
      )
    }
  ];

  return (
    <div className="w-full">
      {/* Today's XP Breakdown Card */}
      <Card className="mx-0 sm:mx-2 md:mx-4 bg-purple-900/10 border-purple-700/30 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-800/60 to-indigo-800/60 border-b border-purple-700/50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Today's XP Breakdown</h3>
                <p className="text-xs text-purple-300/70">Track your daily metrics and earn rewards</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">+150</div>
              <div className="text-xs text-yellow-300/70">XP available</div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-4 space-y-3">
          {metrics.map((metric) => (
            <div key={metric.key} className="border border-purple-700/30 rounded-lg overflow-hidden bg-purple-900/5 hover:bg-purple-900/10 transition-colors">
              <div
                className="px-4 py-3.5 cursor-pointer"
                onClick={() => toggleSection(metric.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      {metric.icon}
                    </div>
                    <h4 className="font-semibold text-purple-200">{metric.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400/70">+25 XP</span>
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
      </Card>
    </div>
  );
};

DailyMetricsSection.displayName = 'DailyMetricsSection';
