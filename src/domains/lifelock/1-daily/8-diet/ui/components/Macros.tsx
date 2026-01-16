/**
 * Macros Component
 *
 * Enhanced daily macro tracking with modern UI
 * Tracks: Calories, Protein, Carbs, Fats
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Flame, Dumbbell, Wheat, Droplet, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseUserId } from '@/lib/supabase-clerk';
import { useNutritionSupabase } from '@/lib/hooks/useNutritionSupabase';
import { format } from 'date-fns';

interface MacrosProps {
  selectedDate: Date;
}

// Daily goals configuration
const MACRO_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fats: 65
};

// Macro configuration with icons and colors
const MACRO_CONFIG = {
  calories: {
    label: 'Calories',
    icon: Flame,
    unit: 'cal',
    steps: [100, 250, 500],
    color: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-500/20',
    textColor: 'text-orange-300',
    progressColor: 'bg-gradient-to-r from-orange-500 to-amber-500'
  },
  protein: {
    label: 'Protein',
    icon: Dumbbell,
    unit: 'g',
    steps: [10, 25, 50],
    color: 'from-red-500 to-rose-500',
    bgLight: 'bg-red-500/20',
    textColor: 'text-red-300',
    progressColor: 'bg-gradient-to-r from-red-500 to-rose-500'
  },
  carbs: {
    label: 'Carbs',
    icon: Wheat,
    unit: 'g',
    steps: [20, 50, 100],
    color: 'from-yellow-500 to-amber-500',
    bgLight: 'bg-yellow-500/20',
    textColor: 'text-yellow-300',
    progressColor: 'bg-gradient-to-r from-yellow-500 to-amber-500'
  },
  fats: {
    label: 'Fats',
    icon: Droplet,
    unit: 'g',
    steps: [5, 15, 30],
    color: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-500/20',
    textColor: 'text-blue-300',
    progressColor: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  }
};

export const Macros: React.FC<MacrosProps> = ({ selectedDate }) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const { nutrition, loading, updateMacros } = useNutritionSupabase(
    internalUserId || '',
    dateKey
  );

  const [dailyTotals, setDailyTotals] = useState(nutrition.macros);
  const hasLoadedInitialData = React.useRef(false);

  // Update local state when nutrition data loads from server
  useEffect(() => {
    if (!loading && !hasLoadedInitialData.current) {
      setDailyTotals(nutrition.macros);
      hasLoadedInitialData.current = true;
    }
  }, [nutrition.macros, loading]);

  // Handle macro changes
  const handleMacroChange = (macro: keyof typeof dailyTotals, value: number) => {
    const newValue = Math.max(0, value);
    const newTotals = { ...dailyTotals, [macro]: newValue };
    setDailyTotals(newTotals);

    // Save to Supabase
    if (internalUserId && hasLoadedInitialData.current) {
      updateMacros(newTotals);
    }
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(100, Math.max(0, (current / goal) * 100));
  };

  // Get status based on progress
  const getStatus = (progress: number) => {
    if (progress >= 100) return { label: 'On Track', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (progress >= 75) return { label: 'Almost There', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Keep Going', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Detailed Macro Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(MACRO_CONFIG) as Array<keyof typeof MACRO_CONFIG>).map((macroKey, index) => {
          const config = MACRO_CONFIG[macroKey];
          const Icon = config.icon;
          const current = dailyTotals[macroKey];
          const goal = MACRO_GOALS[macroKey];
          const progress = calculateProgress(current, goal);
          const status = getStatus(progress);

          return (
            <motion.div
              key={macroKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-2 border-green-600/40 hover:border-green-500/60 transition-all overflow-hidden">
                {/* Gradient overlay */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.color} opacity-5 rounded-full blur-2xl translate-x-16 -translate-y-16`} />

                <CardContent className="relative p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} border border-white/10 shadow-lg flex-shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-green-100 text-sm truncate">{config.label}</h3>
                        <div className={`text-[11px] ${config.textColor} font-medium truncate`}>
                          {current} / {goal} {config.unit}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color} flex-shrink-0`}>
                      {status.label}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <Progress value={progress} className="h-1.5 bg-green-950/50">
                      <motion.div
                        className={`h-full ${config.progressColor} rounded-full shadow-lg`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </Progress>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-green-300/60">Progress</span>
                      <span className="text-[10px] font-semibold text-green-300">{Math.round(progress)}%</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMacroChange(macroKey, current - config.steps[0])}
                      disabled={current === 0}
                      className="border-green-600/60 text-green-400 hover:bg-green-900/30 hover:border-green-500 flex-shrink-0 h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <div className="flex-1 grid grid-cols-3 gap-1">
                      {config.steps.map((step) => (
                        <Button
                          key={step}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMacroChange(macroKey, current + step)}
                          className={`text-[10px] font-medium ${config.bgLight} ${config.textColor} hover:opacity-80 border-0 rounded-md transition-all h-7 px-1`}
                        >
                          +{step}
                        </Button>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMacroChange(macroKey, current + config.steps[0])}
                      className="border-green-600/60 text-green-400 hover:bg-green-900/30 hover:border-green-500 flex-shrink-0 h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
