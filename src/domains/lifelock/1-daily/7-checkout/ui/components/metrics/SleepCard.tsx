import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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

export const SleepCard: React.FC<SleepCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<SleepValue>(value);

  const handleChange = (updates: Partial<SleepValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Calculate progress based on optimal range
  const progress = Math.min((localValue.hours / MAX_TARGET) * 100, 100);
  const isInOptimalRange = localValue.hours >= MIN_TARGET && localValue.hours <= MAX_TARGET;
  const targetMet = isInOptimalRange;

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
              <Moon className="h-5 w-5 text-purple-400" />
              Sleep
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-xs text-purple-400">Saving...</span>
              )}
              {!saving && targetMet && (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-400">
                Target: {MIN_TARGET}-{MAX_TARGET}h
              </span>
              <span className={cn(
                "font-semibold",
                isInOptimalRange ? "text-green-400" : localValue.hours < MIN_TARGET ? "text-yellow-400" : "text-purple-300"
              )}>
                {localValue.hours.toFixed(1)}h
              </span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-colors",
                  isInOptimalRange ? "bg-green-500" : localValue.hours < MIN_TARGET ? "bg-yellow-500" : "bg-gradient-to-r from-purple-400 to-purple-600"
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

          {/* Hours Input */}
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
              className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
              placeholder="0.0"
            />
          </div>

          {/* Bedtime & Wake Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">
                Bedtime
              </label>
              <select
                value={localValue.bedTime}
                onChange={(e) => handleChange({ bedTime: e.target.value })}
                className="w-full bg-purple-900/20 border border-purple-700/50 text-white rounded-md px-3 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none"
              >
                <option value="">Select...</option>
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">
                Wake Time
              </label>
              <select
                value={localValue.wakeTime}
                onChange={(e) => handleChange({ wakeTime: e.target.value })}
                className="w-full bg-purple-900/20 border border-purple-700/50 text-white rounded-md px-3 py-2 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none"
              >
                <option value="">Select...</option>
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
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
                  isInOptimalRange ? "text-green-400" : localValue.hours < MIN_TARGET ? "text-yellow-400" : "text-blue-400"
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
        </CardContent>
      </Card>
    </motion.div>
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
