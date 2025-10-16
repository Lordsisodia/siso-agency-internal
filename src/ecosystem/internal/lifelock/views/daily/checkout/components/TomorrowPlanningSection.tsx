import React from 'react';
import { motion } from 'framer-motion';

import { Input } from '@/shared/ui/input';

interface TomorrowPlanningSectionProps {
  focus: string;
  tasks: string[];
  onFocusChange: (value: string) => void;
  onTaskChange: (index: number, value: string) => void;
}

export const TomorrowPlanningSection: React.FC<TomorrowPlanningSectionProps> = ({
  focus,
  tasks,
  onFocusChange,
  onTaskChange
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="space-y-6">
    <div>
      <h4 className="font-semibold text-purple-300 mb-3 text-base">What's your main focus for tomorrow?</h4>
      <p className="text-xs text-purple-400 mb-3">This will show up tomorrow as an accountability reminder 🎯</p>
      <Input
        value={focus}
        onChange={(event) => onFocusChange(event.target.value)}
        className="bg-purple-900/10 border-purple-700/30 text-white text-lg font-medium placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
        placeholder="e.g., Finish the client presentation, Launch new feature..."
      />
    </div>

    <div>
      <h4 className="font-semibold text-purple-300 mb-3 text-base">Tomorrow's Top 3 Tasks:</h4>
      <p className="text-xs text-purple-400 mb-3">Specific {'>'}  Vague. What are the 3 most important things?</p>
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-purple-400 font-bold text-lg">#{index + 1}</span>
            <Input
              value={task}
              onChange={(event) => onTaskChange(index, event.target.value)}
              placeholder={`Task ${index + 1}...`}
              className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);
