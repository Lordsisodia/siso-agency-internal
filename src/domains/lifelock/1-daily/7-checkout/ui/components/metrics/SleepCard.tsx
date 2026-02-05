import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { calculateBedTimeXP } from '../../../domain/xpCalculations';

interface SleepValue {
  hours: number;
  bedTime: string;
  wakeTime: string;
  quality: number;
}

interface SleepCardProps {
  value: SleepValue;
  onChange: (value: SleepValue) => void;
  saving?: boolean;
}

const MIN_TARGET = 7;
const MAX_TARGET = 9;

// Quick-select bedtime options
const QUICK_BEDTIMES = [
  { label: '9 PM', value: '9:00 PM' },
  { label: '10 PM', value: '10:00 PM' },
  { label: '11 PM', value: '11:00 PM' },
  { label: '12 AM', value: '12:00 AM' },
  { label: '1 AM', value: '1:00 AM' },
];

export const SleepCard: React.FC<SleepCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<SleepValue>(value);
  const [showCustomBedTime, setShowCustomBedTime] = useState(false);

  const handleChange = (updates: Partial<SleepValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Calculate XP preview for bedtime
  const bedTimeXP = useMemo(() => calculateBedTimeXP(localValue.bedTime), [localValue.bedTime]);

  // Get XP message based on bedtime
  const getXPMessage = (xp: number): string => {
    if (xp >= 100) return 'Early bird bonus!';
    if (xp >= 75) return 'Great bedtime!';
    if (xp >= 50) return 'Solid sleep schedule';
    if (xp > 0) return 'Could be earlier...';
    return '';
  };

  // Calculate progress based on optimal range
  const progress = Math.min((localValue.hours / MAX_TARGET) * 100, 100);
  const isInOptimalRange = localValue.hours >= MIN_TARGET && localValue.hours <= MAX_TARGET;
  const targetMet = isInOptimalRange;

  return (
    <div className="space-y-4">
      {/* Saving Indicator & Status */}
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
              <span className="text-purple-400">
                Target: {MIN_TARGET}-{MAX_TARGET}h
              </span>
              <span className={cn(
                "font-semibold",
                isInOptimalRange ? "text-green-400" : localValue.hours < MIN_TARGET ? "text-purple-300" : "text-purple-300"
              )}>
                {localValue.hours.toFixed(1)}h
              </span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-colors",
                  isInOptimalRange ? "bg-green-500" : localValue.hours < MIN_TARGET ? "bg-purple-500" : "bg-gradient-to-r from-purple-400 to-purple-600"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            {isInOptimalRange && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-green-400 text-center"
              >
                Optimal sleep range achieved!
              </motion.p>
            )}
          </div>

          {/* Hours Display - Simple input since wake time is auto-collected */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              Hours Slept
            </label>
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={localValue.hours || ''}
              onChange={(e) => handleChange({ hours: parseFloat(e.target.value) || 0 })}
              placeholder="How many hours did you sleep?"
              className="bg-purple-900/20 border-purple-700/50 text-white"
            />
            <p className="text-xs text-purple-400/50">
              Wake time is auto-collected when you open the app
            </p>
          </div>

          {/* Bedtime with Quick-Select */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-purple-300">
                Bedtime
              </label>
              {/* XP Preview */}
              {bedTimeXP > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">
                    {bedTimeXP} XP
                  </span>
                  <span className="text-xs text-purple-400/70">
                    - {getXPMessage(bedTimeXP)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Quick-select buttons */}
            <div className="flex flex-wrap gap-2">
              {QUICK_BEDTIMES.map(({ label, value: timeValue }) => (
                <button
                  key={timeValue}
                  onClick={() => handleChange({ bedTime: timeValue })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    localValue.bedTime === timeValue
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30"
                  )}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomBedTime(!showCustomBedTime)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  showCustomBedTime
                    ? "bg-purple-600 text-white"
                    : "bg-purple-900/30 text-purple-300 hover:bg-purple-800/40 border border-purple-700/30"
                )}
              >
                Custom
              </button>
            </div>

            {/* Custom dropdown (shown when Custom is clicked) */}
            {showCustomBedTime && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <select
                  value={localValue.bedTime}
                  onChange={(e) => handleChange({ bedTime: e.target.value })}
                  className="w-full bg-purple-900/20 border border-purple-700/50 text-white rounded-md px-3 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none"
                >
                  <option value="">Select time...</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </div>

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-purple-300">
                Sleep Quality
              </label>
              <span className="text-sm font-semibold text-purple-400">
                {localValue.quality}%
              </span>
            </div>
            <Slider
              value={[localValue.quality]}
              onValueChange={(values) => handleChange({ quality: values[0] })}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-400/70">
              <span>Poor</span>
              <span>Restful</span>
            </div>
          </div>

          {/* Sleep Insights */}
          {localValue.hours > 0 && (
            <div className="bg-purple-900/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400">Sleep Status</span>
                <span className={cn(
                  "font-medium",
                  isInOptimalRange ? "text-green-400" : localValue.hours < MIN_TARGET ? "text-purple-400" : "text-purple-400"
                )}>
                  {isInOptimalRange ? "Optimal" : localValue.hours < MIN_TARGET ? "Sleep Debt" : "Extra Rest"}
                </span>
              </div>
              {localValue.bedTime && localValue.wakeTime && (
                <div className="text-xs text-purple-300">
                  <span className="text-purple-400">Schedule:</span> {localValue.bedTime} - {localValue.wakeTime}
                </div>
              )}
            </div>
          )}
    </div>
  );
};

// Helper function to generate time options
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMinute = minute === 0 ? '00' : minute;
      options.push(`${displayHour}:${displayMinute} ${period}`);
    }
  }
  return options;
}
