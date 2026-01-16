import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface DeepWorkValue {
  hours: number;
  quality: number;
}

interface DeepWorkCardProps {
  value: DeepWorkValue;
  onChange: (value: DeepWorkValue) => void;
  saving?: boolean;
}

const TARGET_HOURS = 8;

export const DeepWorkCard: React.FC<DeepWorkCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<DeepWorkValue>(value);

  const handleChange = (updates: Partial<DeepWorkValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const progress = Math.min((localValue.hours / TARGET_HOURS) * 100, 100);
  const targetMet = localValue.hours >= TARGET_HOURS;

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
              <Briefcase className="h-5 w-5 text-purple-400" />
              Deep Work
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
              <span className="text-purple-400">Progress</span>
              <span className={cn(
                "font-semibold",
                targetMet ? "text-green-400" : "text-purple-300"
              )}>
                {localValue.hours.toFixed(1)} / {TARGET_HOURS}h
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

          {/* Hours Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              Hours of Deep Work
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
            <p className="text-xs text-purple-400/70">
              Decimals allowed (e.g., 2.5 hours)
            </p>
          </div>

          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-purple-300">
                Quality
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
              <span>Distracted</span>
              <span>Flow State</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-purple-900/20 rounded-lg p-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-200">
                {Math.floor(localValue.hours)}
              </div>
              <div className="text-xs text-purple-400">Full Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-200">
                {Math.round((localValue.hours % 1) * 60)}
              </div>
              <div className="text-xs text-purple-400">Extra Minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
