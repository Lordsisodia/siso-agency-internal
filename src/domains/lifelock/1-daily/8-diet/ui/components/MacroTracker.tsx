/**
 * Macro Tracker Component
 *
 * Tracks macros with +/- increment buttons (calories, protein, carbs, fats)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      className="bg-gradient-to-br from-green-900/30 to-green-950/30 border-2 border-green-600/40 rounded-xl p-5 hover:border-green-500/60 transition-all shadow-lg"
    >
      <label className="text-green-100 font-semibold mb-3 block text-base">{label}</label>
      <div className="flex items-center gap-2 mb-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(Math.max(0, value - steps[0]))}
          className="border-green-600/60 text-green-400 hover:bg-green-900/30 hover:border-green-500 transition-all"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="bg-green-950/50 border-green-600/50 text-white text-center font-bold focus:border-green-400 focus:ring-green-400/20"
        />
        <span className="text-green-300 min-w-8 font-medium">{unit}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange(value + steps[0])}
          className="border-green-600/60 text-green-400 hover:bg-green-900/30 hover:border-green-500 transition-all"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {steps.map((step) => (
          <Button
            key={step}
            size="sm"
            variant="ghost"
            onClick={() => onChange(value + step)}
            className="text-green-300 hover:bg-green-900/40 text-xs border border-green-600/30 rounded-lg transition-all"
          >
            +{step}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
