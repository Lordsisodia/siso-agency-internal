import React from 'react';
import { motion } from 'framer-motion';

import { Textarea } from '@/shared/ui/textarea';

interface OverallReflectionSectionProps {
  rating?: number;
  keyLearnings: string;
  onRatingChange: (value: number) => void;
  onKeyLearningsChange: (value: string) => void;
}

export const OverallReflectionSection: React.FC<OverallReflectionSectionProps> = ({
  rating,
  keyLearnings,
  onRatingChange,
  onKeyLearningsChange
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-6">
    <div>
      <h4 className="font-semibold text-purple-300 mb-4 text-base">Rate your overall day (1-10):</h4>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            onClick={() => onRatingChange(value)}
            className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
              rating === value
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'border-purple-600/50 text-purple-300 hover:border-purple-400 hover:bg-purple-900/20'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>

    <div>
      <h4 className="font-semibold text-purple-300 mb-3 text-base">Key learning from today:</h4>
      <Textarea
        value={keyLearnings}
        onChange={(event) => onKeyLearningsChange(event.target.value)}
        className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[100px]"
        placeholder="What did you learn about yourself or life today?"
      />
    </div>
  </motion.div>
);
