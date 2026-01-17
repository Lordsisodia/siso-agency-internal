import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ResearchValue {
  hours: number;
  topic: string;
  notes: string;
}

interface ResearchCardProps {
  value: ResearchValue;
  onChange: (value: ResearchValue) => void;
  saving?: boolean;
}

const TARGET_HOURS = 2;

export const ResearchCard: React.FC<ResearchCardProps> = ({
  value,
  onChange,
  saving = false
}) => {
  const [localValue, setLocalValue] = useState<ResearchValue>(value);

  const handleChange = (updates: Partial<ResearchValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const progress = Math.min((localValue.hours / TARGET_HOURS) * 100, 100);
  const targetMet = localValue.hours >= TARGET_HOURS;

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
              Hours of Research
            </label>
            <Input
              type="number"
              min="0"
              max="24"
              step="0.25"
              value={localValue.hours || ''}
              onChange={(e) => handleChange({ hours: parseFloat(e.target.value) || 0 })}
              className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
              placeholder="0.0"
            />
            <p className="text-xs text-purple-400/70">
              Decimals allowed (e.g., 1.5 hours)
            </p>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              Research Topic
            </label>
            <Input
              type="text"
              value={localValue.topic}
              onChange={(e) => handleChange({ topic: e.target.value })}
              className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
              placeholder="What did you research?"
            />
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              Key Insights & Notes
            </label>
            <Textarea
              value={localValue.notes}
              onChange={(e) => handleChange({ notes: e.target.value })}
              className="bg-purple-900/20 border-purple-700/50 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 min-h-[100px] resize-none"
              placeholder="What did you learn? Capture key insights..."
            />
            <div className="flex justify-between text-xs text-purple-400/70">
              <span>Capture your main takeaways</span>
              <span>{localValue.notes.length} chars</span>
            </div>
          </div>

          {/* Quick Stats */}
          {localValue.hours > 0 && (
            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400">Research Sessions</span>
                <span className="text-purple-300 font-medium">
                  {localValue.hours >= 1 ? `${Math.floor(localValue.hours)}+ sessions` : 'Partial session'}
                </span>
              </div>
            </div>
          )}
    </div>
  );
};
