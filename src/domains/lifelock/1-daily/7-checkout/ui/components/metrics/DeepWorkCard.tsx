import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type FlowState = 'distracted' | 'focused' | 'flow';

export interface DeepWorkValue {
  hours: number;
  quality: number; // 0-100, mapped from flow state
  flowState: FlowState;
}

interface DeepWorkCardProps {
  value: DeepWorkValue;
  onChange: (value: DeepWorkValue) => void;
  saving?: boolean;
  autoCalculatedHours?: number;
  completedTaskCount?: number;
}

const DEFAULT_TARGET_HOURS = 4;

const FLOW_STATE_OPTIONS: { value: FlowState; label: string; color: string; quality: number }[] = [
  { value: 'distracted', label: 'Distracted', color: 'bg-red-500/20 text-red-400 border-red-500/50', quality: 33 },
  { value: 'focused', label: 'Focused', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', quality: 66 },
  { value: 'flow', label: 'Flow State', color: 'bg-green-500/20 text-green-400 border-green-500/50', quality: 100 },
];

export const DeepWorkCard: React.FC<DeepWorkCardProps> = ({
  value,
  onChange,
  saving = false,
  autoCalculatedHours = 0,
  completedTaskCount = 0
}) => {
  const [localValue, setLocalValue] = useState<DeepWorkValue>(value);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [targetHours, setTargetHours] = useState(DEFAULT_TARGET_HOURS);

  // Auto-populate hours when autoCalculatedHours changes and user hasn't manually edited
  useEffect(() => {
    if (autoCalculatedHours > 0 && !isAutoPopulated && localValue.hours === 0) {
      const newValue = { ...localValue, hours: autoCalculatedHours };
      setLocalValue(newValue);
      onChange(newValue);
      setIsAutoPopulated(true);
    }
  }, [autoCalculatedHours, isAutoPopulated, localValue, onChange]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (updates: Partial<DeepWorkValue>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    onChange(newValue);
    if (updates.hours !== undefined && updates.hours !== autoCalculatedHours) {
      setIsAutoPopulated(false);
    }
  };

  const handleFlowStateChange = (flowState: FlowState) => {
    const option = FLOW_STATE_OPTIONS.find(o => o.value === flowState);
    if (option) {
      handleChange({ flowState, quality: option.quality });
    }
  };

  const handleAcceptAutoCalculate = () => {
    handleChange({ hours: autoCalculatedHours });
    setIsAutoPopulated(true);
  };

  const progress = Math.min((localValue.hours / targetHours) * 100, 100);
  const targetMet = localValue.hours >= targetHours;

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
            {localValue.hours.toFixed(1)} / {targetHours}h
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
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-purple-300">
            Hours of Deep Work
          </label>
          {completedTaskCount > 0 && (
            <span className="text-xs text-purple-400/70">
              {completedTaskCount} task{completedTaskCount !== 1 ? 's' : ''} completed
            </span>
          )}
        </div>
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

        {/* Auto-calculation indicator */}
        {autoCalculatedHours > 0 && localValue.hours !== autoCalculatedHours && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAcceptAutoCalculate}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>{autoCalculatedHours.toFixed(1)}h auto-calculated from completed tasks</span>
            <span className="text-purple-400 underline">Apply</span>
          </motion.button>
        )}

        {isAutoPopulated && (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Auto-populated from completed tasks
          </p>
        )}
        <p className="text-xs text-purple-400/70">
          Decimals allowed (e.g., 2.5 hours)
        </p>
      </div>

      {/* Flow State Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-300">
          How was your focus?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FLOW_STATE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFlowStateChange(option.value)}
              className={cn(
                "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                localValue.flowState === option.value
                  ? option.color
                  : "bg-purple-900/20 border-purple-700/30 text-purple-400/70 hover:bg-purple-900/30"
              )}
            >
              {option.label}
            </button>
          ))}
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
    </div>
  );
};
