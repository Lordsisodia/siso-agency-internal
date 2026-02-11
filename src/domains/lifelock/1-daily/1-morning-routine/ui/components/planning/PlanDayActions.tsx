/**
 * Plan Day Actions Component
 *
 * AI Thought Dump button and manual completion for daily planning.
 * Part of "Plan Day" task in morning routine.
 */

import React from 'react';
import { Button } from '@/components/ui/button';

interface PlanDayActionsProps {
  isComplete: boolean;
  onMarkComplete: () => void;
  onOpenThoughtDump: () => void;
}

export const PlanDayActions: React.FC<PlanDayActionsProps> = ({
  isComplete,
  onMarkComplete,
  onOpenThoughtDump
}) => {
  return (
    <div className="mt-3 space-y-2">
      {/* AI Thought Dump Button */}
      <button
        className="w-full text-left p-3 bg-gradient-to-r from-orange-900/20 to-orange-900/20 border border-orange-600/40 rounded-lg hover:border-orange-500/60 transition-all cursor-pointer"
        onClick={onOpenThoughtDump}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎤</div>
          <div className="flex-1">
            <div className="text-orange-300 font-medium text-sm">🧠 AI Thought Dump</div>
            <p className="text-xs text-orange-400/60">Talk → Auto-organize → Timebox</p>
          </div>
        </div>
      </button>

      {/* Mark Complete Button */}
      {!isComplete && (
        <Button
          onClick={onMarkComplete}
          className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/40 text-orange-300 text-sm"
        >
          ✓ Mark Plan Day Complete
        </Button>
      )}
    </div>
  );
};
