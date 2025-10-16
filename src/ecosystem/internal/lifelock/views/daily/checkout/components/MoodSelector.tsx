import React from 'react';
import { motion } from 'framer-motion';

import { MoodOption } from '../hooks/useNightlyCheckout';

interface MoodSelectorProps {
  moods: MoodOption[];
  selectedMood: string;
  onSelect: (value: string) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ moods, selectedMood, onSelect }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
    <h4 className="font-semibold text-purple-300 mb-3 text-base">How are you feeling right now?</h4>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {moods.map((moodOption) => (
        <button
          key={moodOption.value}
          onClick={() => onSelect(moodOption.value)}
          className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
            selectedMood === moodOption.value
              ? 'border-purple-400 bg-purple-900/40 scale-105'
              : 'border-purple-700/30 hover:border-purple-600 hover:bg-purple-900/20'
          }`}
        >
          <span className="text-3xl mb-1">{moodOption.emoji}</span>
          <span className="text-xs text-purple-300">{moodOption.label}</span>
        </button>
      ))}
    </div>
  </motion.div>
);
