import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkoutValue {
  completed: boolean;
  type?: 'strength' | 'cardio' | 'yoga' | 'hiit' | 'other';
  duration?: number;
  intensity?: 'light' | 'moderate' | 'intense';
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
  { value: 'light', label: 'Light', color: 'bg-green-500' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
  { value: 'intense', label: 'Intense', color: 'bg-red-500' }
] as const;

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<WorkoutValue>(value);

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
      intensity: newCompleted ? 'moderate' : undefined
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-purple-900/10 border-purple-700/30 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-purple-300 text-base">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-purple-400" />
              Workout
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-xs text-purple-400">Saving...</span>
              )}
              {localValue.completed && (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            {localValue.completed ? "✓ Workout Complete" : "Did you work out?"}
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
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="300"
                    value={localValue.duration || ''}
                    onChange={(e) => handleChange({ duration: parseInt(e.target.value) || undefined })}
                    className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
                    placeholder="30"
                  />
                </div>

                {/* Intensity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {INTENSITIES.map((intensity) => (
                      <Button
                        key={intensity.value}
                        onClick={() => handleChange({ intensity: intensity.value as any })}
                        variant="outline"
                        className={cn(
                          "h-10 text-sm font-medium transition-all relative",
                          localValue.intensity === intensity.value
                            ? "border-purple-400 text-white"
                            : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
                        )}
                        style={
                          localValue.intensity === intensity.value
                            ? { backgroundColor: intensity.color.replace('bg-', '') }
                            : {}
                        }
                      >
                        <span className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          intensity.color
                        )} />
                        {intensity.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
