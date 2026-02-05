import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Plus, Minus, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MeditationValue {
  minutes: number;
  focusLevel: 'distracted' | 'somewhat-focused' | 'deeply-present' | null;
  feelingAfter: 'more-stressed' | 'same' | 'more-calm' | 'transformed' | null;
}

interface MeditationCardProps {
  value: MeditationValue;
  onChange: (value: MeditationValue) => void;
  saving?: boolean;
  streakData?: {
    last7Days: number;
    totalSessions: number;
    averageMinutes: number;
  };
}

const TARGET_MINUTES = 30;

const FOCUS_LEVELS = [
  { value: 'distracted', label: 'Distracted' },
  { value: 'somewhat-focused', label: 'Somewhat focused' },
  { value: 'deeply-present', label: 'Deeply present' }
] as const;

const FEELING_AFTER = [
  { value: 'more-stressed', label: 'More stressed' },
  { value: 'same', label: 'Same' },
  { value: 'more-calm', label: 'More calm' },
  { value: 'transformed', label: 'Transformed' }
] as const;

const MINUTE_PRESETS = [10, 15, 20, 30] as const;

export const MeditationCard: React.FC<MeditationCardProps> = ({
  value,
  onChange,
  saving = false,
  streakData = { last7Days: 0, totalSessions: 0, averageMinutes: 0 }
}) => {
  const [localValue, setLocalValue] = useState<MeditationValue>(value);

  const handleChange = (updates: Partial<MeditationValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const progress = Math.min((localValue.minutes / TARGET_MINUTES) * 100, 100);
  const targetMet = localValue.minutes >= TARGET_MINUTES;

  return (
    <div className="space-y-4">
      {/* Saving Indicator & Target Met */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-purple-400">Saving...</span>
          )}
          {!saving && targetMet && (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-400">Progress</span>
          <span className={cn(
            "font-semibold",
            targetMet ? "text-green-400" : "text-purple-300"
          )}>
            {localValue.minutes} / {TARGET_MINUTES} min
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

      {/* Streak Context */}
      {streakData.totalSessions > 0 && (
        <div className="flex items-center gap-2 text-sm text-purple-300/80 bg-purple-900/20 rounded-lg px-3 py-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span>
            Last 7 days: <span className="font-semibold text-purple-200">{streakData.last7Days}/7</span> sessions, avg <span className="font-semibold text-purple-200">{streakData.averageMinutes} min</span>
          </span>
        </div>
      )}

      {/* Minutes Input with Quick Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-300">
          Minutes Meditated
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            max="180"
            value={localValue.minutes || ''}
            onChange={(e) => handleChange({ minutes: parseInt(e.target.value) || 0 })}
            className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
            placeholder="0"
          />
        </div>

        {/* Minute Presets */}
        <div className="flex gap-2">
          {MINUTE_PRESETS.map((preset) => (
            <Button
              key={preset}
              onClick={() => handleChange({ minutes: preset })}
              size="sm"
              variant="outline"
              className={cn(
                "flex-1 text-xs font-medium transition-all",
                localValue.minutes === preset
                  ? "bg-purple-600 border-purple-400 text-white"
                  : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200"
              )}
            >
              {preset}m
            </Button>
          ))}
        </div>

        {/* Quick +/- Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleChange({ minutes: Math.max(0, localValue.minutes - 1) })}
            size="sm"
            variant="outline"
            className="flex-1 bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200"
          >
            <Minus className="h-3 w-3 mr-1" />
            1
          </Button>
          <Button
            onClick={() => handleChange({ minutes: localValue.minutes + 1 })}
            size="sm"
            variant="outline"
            className="flex-1 bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            1
          </Button>
          <Button
            onClick={() => handleChange({ minutes: localValue.minutes + 5 })}
            size="sm"
            variant="outline"
            className="flex-1 bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            5
          </Button>
        </div>
      </div>

      {/* Focus Level Question */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-300">
          How focused were you?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FOCUS_LEVELS.map((level) => (
            <Button
              key={level.value}
              onClick={() => handleChange({ focusLevel: level.value })}
              variant="outline"
              size="sm"
              className={cn(
                "h-10 text-xs font-medium transition-all",
                localValue.focusLevel === level.value
                  ? "bg-purple-600 border-purple-400 text-white"
                  : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
              )}
            >
              {level.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Feeling After Question */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-300">
          How do you feel after?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FEELING_AFTER.map((feeling) => (
            <Button
              key={feeling.value}
              onClick={() => handleChange({ feelingAfter: feeling.value })}
              variant="outline"
              size="sm"
              className={cn(
                "h-10 text-xs font-medium transition-all",
                localValue.feelingAfter === feeling.value
                  ? "bg-purple-600 border-purple-400 text-white"
                  : "bg-purple-900/20 border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
              )}
            >
              {feeling.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
