import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NutritionValue {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  hitCalorieGoal: boolean;
}

interface NutritionCardProps {
  value: NutritionValue;
  onChange: (value: NutritionValue) => void;
  saving?: boolean;
}

const TARGET_CALORIES = 3000;

export const NutritionCard: React.FC<NutritionCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<NutritionValue>(value);

  const handleChange = (updates: Partial<NutritionValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const progress = Math.min((localValue.calories / TARGET_CALORIES) * 100, 100);
  const targetMet = localValue.calories >= TARGET_CALORIES;

  return (
    <div className="space-y-4">
      {/* Saving Indicator & Status */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-purple-400">Saving...</span>
          )}
          {targetMet && (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          )}
        </div>
      </div>

      {/* Calorie Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-400">Calories</span>
              <span className={cn(
                "font-semibold",
                targetMet ? "text-green-400" : "text-purple-300"
              )}>
                {localValue.calories} / {TARGET_CALORIES}
              </span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-colors",
                  targetMet ? "bg-green-500" : "bg-gradient-to-r from-purple-400 to-purple-600"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Macro Inputs Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-purple-300">
                Protein (g)
              </label>
              <Input
                type="number"
                min="0"
                max="500"
                value={localValue.protein || ''}
                onChange={(e) => handleChange({ protein: parseInt(e.target.value) || 0 })}
                className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 h-10 text-center"
                placeholder="0"
              />
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-purple-300">
                Carbs (g)
              </label>
              <Input
                type="number"
                min="0"
                max="500"
                value={localValue.carbs || ''}
                onChange={(e) => handleChange({ carbs: parseInt(e.target.value) || 0 })}
                className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 h-10 text-center"
                placeholder="0"
              />
            </div>

            {/* Fats */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-purple-300">
                Fats (g)
              </label>
              <Input
                type="number"
                min="0"
                max="200"
                value={localValue.fats || ''}
                onChange={(e) => handleChange({ fats: parseInt(e.target.value) || 0 })}
                className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 h-10 text-center"
                placeholder="0"
              />
            </div>
          </div>

          {/* Hit Calorie Goal Checkbox */}
          <button
            onClick={() => handleChange({ hitCalorieGoal: !localValue.hitCalorieGoal })}
            className={cn(
              "w-full h-11 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2",
              localValue.hitCalorieGoal
                ? "bg-green-600/20 border-green-500 text-green-300"
                : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:border-purple-600"
            )}
          >
            {localValue.hitCalorieGoal ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Hit my calorie goal!
              </>
            ) : (
              "Hit my calorie goal?"
            )}
          </button>

          {/* Macro Summary */}
          <div className="bg-purple-900/20 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-400">Total Macros</span>
              <span className="text-purple-300 font-medium">
                {localValue.protein + localValue.carbs + localValue.fats}g
              </span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-red-500/70"
                initial={{ width: 0 }}
                animate={{
                  width: `${localValue.protein > 0 ? (localValue.protein / (localValue.protein + localValue.carbs + localValue.fats)) * 100 : 0}%`
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="bg-blue-500/70"
                initial={{ width: 0 }}
                animate={{
                  width: `${localValue.carbs > 0 ? (localValue.carbs / (localValue.protein + localValue.carbs + localValue.fats)) * 100 : 0}%`
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="bg-yellow-500/70"
                initial={{ width: 0 }}
                animate={{
                  width: `${localValue.fats > 0 ? (localValue.fats / (localValue.protein + localValue.carbs + localValue.fats)) * 100 : 0}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="text-purple-400">Protein</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500/70" />
                <span className="text-purple-400">Carbs</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                <span className="text-purple-400">Fats</span>
              </div>
            </div>
          </div>
    </div>
  );
};
