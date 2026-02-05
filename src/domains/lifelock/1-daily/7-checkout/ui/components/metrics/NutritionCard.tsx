import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface NutritionValue {
  protein: number;
  hitGoal: boolean;
}

interface NutritionCardProps {
  value: NutritionValue;
  onChange: (value: NutritionValue) => void;
  saving?: boolean;
  calorieTarget?: number;
}

const DEFAULT_CALORIE_TARGET = 2500;
const CALORIES_PER_PROTEIN_GRAM = 15;

export const NutritionCard: React.FC<NutritionCardProps> = ({
  value,
  onChange,
  saving = false,
  calorieTarget = DEFAULT_CALORIE_TARGET
}) => {
  const [localProtein, setLocalProtein] = useState<number>(value.protein || 0);

  // Sync with parent value
  useEffect(() => {
    setLocalProtein(value.protein || 0);
  }, [value.protein]);

  const handleProteinChange = (protein: number) => {
    setLocalProtein(protein);
    onChange({ ...value, protein });
  };

  // Auto-estimate calories from protein
  const estimatedCalories = Math.round(localProtein * CALORIES_PER_PROTEIN_GRAM);
  const progress = Math.min((estimatedCalories / calorieTarget) * 100, 100);
  const targetMet = estimatedCalories >= calorieTarget;

  // Protein tier for XP display
  const getProteinTier = (protein: number) => {
    if (protein >= 150) return { label: 'Elite', color: 'text-purple-300', xp: 25 };
    if (protein >= 100) return { label: 'Advanced', color: 'text-purple-300', xp: 20 };
    if (protein >= 50) return { label: 'Solid', color: 'text-purple-300', xp: 15 };
    return { label: 'Starter', color: 'text-purple-300', xp: 5 };
  };

  const proteinTier = getProteinTier(localProtein);

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

      {/* Single Protein Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Protein (g)
          </label>
          <span className={cn("text-sm font-semibold", proteinTier.color)}>
            {proteinTier.label} (+{proteinTier.xp} XP)
          </span>
        </div>
        <Input
          type="number"
          min="0"
          max="500"
          value={localProtein || ''}
          onChange={(e) => handleProteinChange(parseInt(e.target.value) || 0)}
          className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 h-12 text-lg text-center"
          placeholder="Enter protein in grams"
        />
      </div>

      {/* Calorie Progress Bar - Auto-estimated */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            Est. Calories
          </span>
          <span className={cn(
            "font-semibold",
            targetMet ? "text-green-400" : "text-purple-300"
          )}>
            {estimatedCalories} / {calorieTarget}
          </span>
        </div>
        <div className="w-full bg-purple-900/30 rounded-full h-2.5 overflow-hidden">
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
        <p className="text-xs text-purple-400/60 text-center">
          Estimated from protein × {CALORIES_PER_PROTEIN_GRAM}
        </p>
      </div>

      {/* Hit Goal Checkbox */}
      <button
        onClick={() => onChange({ ...value, hitGoal: !value.hitGoal })}
        className={cn(
          "w-full h-11 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2",
          value.hitGoal
            ? "bg-green-600/20 border-green-500 text-green-300"
            : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:border-purple-600"
        )}
      >
        {value.hitGoal ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Hit my nutrition goal!
          </>
        ) : (
          "Hit my nutrition goal?"
        )}
      </button>
    </div>
  );
};
