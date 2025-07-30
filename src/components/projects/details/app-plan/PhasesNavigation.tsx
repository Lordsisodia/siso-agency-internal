
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlanPhase } from '@/hooks/usePlanData';

interface PhasesNavigationProps {
  phases: PlanPhase[];
  activePhaseId: string;
  setActivePhaseId: (id: string) => void;
}

export function PhasesNavigation({ phases, activePhaseId, setActivePhaseId }: PhasesNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="sticky top-4 z-10 mb-4"
    >
      <div className="bg-black/50 backdrop-blur-md rounded-lg border border-white/10 p-4">
        <div className="flex flex-wrap gap-2">
          {phases.map(phase => (
            <Button 
              key={phase.id}
              variant={activePhaseId === phase.id ? "default" : "outline"}
              className={cn(
                'node-orange',
                activePhaseId === phase.id 
                  ? 'active'
                  : 'hover:bg-orange-500/40'
              )}
              onClick={() => setActivePhaseId(phase.id)}
            >
              {phase.title.split('.')[0]}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
