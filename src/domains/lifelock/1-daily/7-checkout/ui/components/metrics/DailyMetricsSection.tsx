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
      <Card className="mx-6 sm:mx-8 md:mx-12 bg-purple-900/10 border-purple-700/30 overflow-hidden">
        {/* Solid Purple Header Bar */}
        <div className="bg-purple-800/80 border-b border-purple-700/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Daily Metrics</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="border border-purple-700/30 rounded-lg overflow-hidden">
              <div
                className="bg-purple-900/20 px-4 py-3 cursor-pointer hover:bg-purple-900/30 transition-colors"
                onClick={() => toggleSection(metric.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <h4 className="font-semibold text-purple-300 text-sm">{metric.title}</h4>
                  </div>
                  {expandedSections[metric.key] ? (
                    <ChevronUp className="h-4 w-4 text-purple-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-400" />
                  )}
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
                    <div className="p-4 bg-purple-900/10">
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
