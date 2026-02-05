import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkoutValue {
  completed: boolean;
  type?: 'strength' | 'cardio' | 'yoga' | 'hiit' | 'other';
  duration?: number;
  intensity?: 'light' | 'moderate' | 'intense';
  description?: string;
}

interface WorkoutCardProps {
  value: WorkoutValue;
  onChange: (value: WorkoutValue) => void;
  saving?: boolean;
}

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'other', label: 'Other' }
] as const;

const INTENSITIES = [
  { value: 'light', label: 'Light', color: 'bg-green-500', xpMultiplier: 1.0 },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500', xpMultiplier: 1.5 },
  { value: 'intense', label: 'Intense', color: 'bg-red-500', xpMultiplier: 2.0 }
] as const;

const DURATION_OPTIONS = [
  { value: 10, label: '10m' },
  { value: 20, label: '20m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '60m+' },
  { value: 'custom', label: 'Custom' }
] as const;

// Base XP for workout (will be calculated by tiered system)
const BASE_WORKOUT_XP = 50;

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<WorkoutValue>(value);
  const [showDescription, setShowDescription] = useState(false);
  const [isCustomDuration, setIsCustomDuration] = useState(false);

  const handleChange = (updates: Partial<WorkoutValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleToggleCompleted = () => {
    const newCompleted = !localValue.completed;
    handleChange({
      completed: newCompleted,
      type: newCompleted ? 'strength' : undefined,
      duration: newCompleted ? 30 : undefined,
      intensity: newCompleted ? 'moderate' : undefined,
      description: newCompleted ? undefined : localValue.description
    });
    if (!newCompleted) {
      setShowDescription(false);
      setIsCustomDuration(false);
    }
  };

  const handleDurationSelect = (durationValue: number | 'custom') => {
    if (durationValue === 'custom') {
      setIsCustomDuration(true);
      handleChange({ duration: undefined });
    } else {
      setIsCustomDuration(false);
      handleChange({ duration: durationValue });
    }
  };

  // Calculate XP preview based on duration and intensity
  const calculateXP = () => {
    const duration = localValue.duration || 0;
    const intensity = INTENSITIES.find(i => i.value === localValue.intensity);
    const multiplier = intensity?.xpMultiplier || 1.0;

    // Base XP + duration bonus (1 XP per minute) * intensity multiplier
    const durationBonus = duration;
    const totalXP = Math.round((BASE_WORKOUT_XP + durationBonus) * multiplier);

    return totalXP;
  };

  return (
    <div className="space-y-4">
      {/* Saving Indicator & Completed Status */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-purple-400">Saving...</span>
          )}
          {localValue.completed && (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          )}
        </div>
      </div>

      {/* Completed Checkbox */}
      <Button
        onClick={handleToggleCompleted}
        className={cn(
          "w-full h-12 text-base font-semibold transition-all",
          localValue.completed
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50"
        )}
      >
            {localValue.completed ? (
                  <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Workout Complete</span>
                ) : "Did you work out?"}
          </Button>

          <AnimatePresence>
            {localValue.completed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Workout Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    Workout Type
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {WORKOUT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        onClick={() => handleChange({ type: type.value as any })}
                        variant="outline"
                        className={cn(
                          "h-10 text-xs font-medium transition-all",
                          localValue.type === type.value
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
                        )}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    Duration
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {DURATION_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => handleDurationSelect(option.value as any)}
                        variant="outline"
                        className={cn(
                          "h-10 text-xs font-medium transition-all px-2",
                          (option.value !== 'custom' && localValue.duration === option.value) ||
                          (option.value === 'custom' && isCustomDuration)
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  {/* Custom duration input */}
                  <AnimatePresence>
                    {isCustomDuration && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2"
                      >
                        <Input
                          type="number"
                          min="1"
                          max="300"
                          value={localValue.duration || ''}
                          onChange={(e) => handleChange({ duration: parseInt(e.target.value) || undefined })}
                          className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
                          placeholder="Enter minutes..."
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* What did you do? - Optional description */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showDescription ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide description
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        What did you do? (optional)
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {showDescription && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          type="text"
                          value={localValue.description || ''}
                          onChange={(e) => handleChange({ description: e.target.value })}
                          className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
                          placeholder="Briefly describe your workout..."
                        />
                        <p className="text-xs text-purple-400/60 mt-1">
                          Examples: "Morning run", "Push day", "Yoga flow"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Intensity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {INTENSITIES.map((intensity) => {
                      const isSelected = localValue.intensity === intensity.value;
                      const xpPreview = localValue.duration
                        ? Math.round((BASE_WORKOUT_XP + localValue.duration) * intensity.xpMultiplier)
                        : null;

                      return (
                        <Button
                          key={intensity.value}
                          onClick={() => handleChange({ intensity: intensity.value as any })}
                          variant="outline"
                          className={cn(
                            "h-14 text-sm font-medium transition-all relative flex flex-col items-center justify-center gap-1",
                            isSelected
                              ? "border-purple-400 text-white"
                              : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
                          )}
                          style={
                            isSelected
                              ? { backgroundColor: intensity.color.replace('bg-', '') }
                              : {}
                          }
                        >
                          <span className="flex items-center gap-1">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              intensity.color
                            )} />
                            {intensity.label}
                          </span>
                          {xpPreview && (
                            <span className={cn(
                              "text-xs",
                              isSelected ? "text-white/80" : "text-purple-400"
                            )}>
                              +{xpPreview} XP
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};
