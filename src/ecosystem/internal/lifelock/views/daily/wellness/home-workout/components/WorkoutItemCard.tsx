/**
 * Workout Item Card Component
 *
 * Individual workout with checkbox, target, logged value, and quick rep buttons
 */

import React from 'react';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { motion } from 'framer-motion';

interface WorkoutItem {
  id: string;
  title: string;
  completed: boolean;
  target?: string;
  logged?: string;
}

interface WorkoutItemCardProps {
  item: WorkoutItem;
  quickReps: number[];
  onToggle: () => void;
  onUpdateTarget: (value: string) => void;
  onUpdateLogged: (value: string) => void;
}

export const WorkoutItemCard: React.FC<WorkoutItemCardProps> = ({
  item,
  quickReps,
  onToggle,
  onUpdateTarget,
  onUpdateLogged
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-purple-900/20 border border-purple-600/40 rounded-lg p-4 hover:border-purple-500/60 transition-all"
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.completed}
          onCheckedChange={onToggle}
          className="mt-1 border-purple-600 data-[state=checked]:bg-purple-600"
        />
        <div className="flex-1">
          <div className="text-white font-medium mb-2">{item.title}</div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-purple-300 text-xs">Target:</label>
              <Input
                value={item.target || ''}
                onChange={(e) => onUpdateTarget(e.target.value)}
                className="bg-purple-900/30 border-purple-600/50 text-white text-sm"
                placeholder="e.g., 50 reps"
              />
            </div>
            <div>
              <label className="text-purple-300 text-xs">Logged:</label>
              <Input
                value={item.logged || ''}
                onChange={(e) => onUpdateLogged(e.target.value)}
                className="bg-purple-900/30 border-purple-600/50 text-white text-sm"
                placeholder="0"
              />
            </div>
          </div>

          {/* Quick rep buttons */}
          <div className="flex gap-2">
            {quickReps.map((rep) => (
              <Button
                key={rep}
                size="sm"
                variant="ghost"
                onClick={() => onUpdateLogged(rep.toString())}
                className="text-purple-300 hover:bg-purple-900/30 text-xs"
              >
                {rep}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
