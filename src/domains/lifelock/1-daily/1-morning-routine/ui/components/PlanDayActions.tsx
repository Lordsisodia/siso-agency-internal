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
      <div
        className="p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/40 rounded-lg hover:border-yellow-500/60 transition-all cursor-pointer"
        onClick={onOpenThoughtDump}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎤</div>
          <div className="flex-1">
            <div className="text-yellow-300 font-medium text-sm">🧠 AI Thought Dump</div>
            <p className="text-xs text-yellow-400/60">Talk → Auto-organize → Timebox</p>
          </div>
        </div>
      </div>

      {/* Mark Complete Button */}
      {!isComplete && (
        <Button
          onClick={onMarkComplete}
          className="w-full bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-300 text-sm"
        >
          ✓ Mark Plan Day Complete
        </Button>
      )}
    </div>
  );
};
