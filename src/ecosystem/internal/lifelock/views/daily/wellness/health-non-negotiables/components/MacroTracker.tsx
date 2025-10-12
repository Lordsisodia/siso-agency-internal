/**
 * Macro Tracker Component
 *
 * Tracks macros with +/- increment buttons (calories, protein, carbs, fats)
 * Pattern: Same as WaterTracker from morning routine!
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MacroTrackerProps {
  label: string;
  value: number;
  unit: string;
  steps: number[]; // e.g., [10, 25, 50]
  onChange: (value: number) => void;
}

export const MacroTracker: React.FC<MacroTrackerProps> = ({
  label,
  value,
  unit,
  steps,
  onChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-pink-900/30 border border-pink-600/40 rounded-lg p-4 hover:border-pink-500/60 transition-all"
    >
      <label className="text-pink-200 font-medium mb-3 block">{label}:</label>
      <div className="flex items-center gap-2 mb-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(Math.max(0, value - steps[0]))}
          className="border-pink-600 text-pink-400 hover:bg-pink-900/30"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="bg-pink-900/40 border-pink-600/50 text-white text-center font-bold focus:border-pink-400"
        />
        <span className="text-pink-300 min-w-8">{unit}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(value + steps[0])}
          className="border-pink-600 text-pink-400 hover:bg-pink-900/30"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex gap-2">
        {steps.map((step) => (
          <Button
            key={step}
            size="sm"
            variant="ghost"
            onClick={() => onChange(value + step)}
            className="text-pink-300 hover:bg-pink-900/30 text-xs"
          >
            +{step}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
