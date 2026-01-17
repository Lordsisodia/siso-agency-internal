import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MeditationValue {
  minutes: number;
  quality: number;
}

interface MeditationCardProps {
  value: MeditationValue;
  onChange: (value: MeditationValue) => void;
  saving?: boolean;
}

const TARGET_MINUTES = 30;

export const MeditationCard: React.FC<MeditationCardProps> = ({
  value,
  onChange,
  saving = false
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
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
};
