import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

interface MoodPickerProps {
  title: string;
  moods: MoodOption[];
  selectedMood: string;
  onSelect: (value: string) => void;
  animationDelay?: number;
}

const MoodPickerComponent: React.FC<MoodPickerProps> = ({
  title,
  moods,
  selectedMood,
  onSelect,
  animationDelay = 0.4
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="mb-8"
    >
      <h4 className="font-semibold text-purple-300 mb-3 text-base">{title}</h4>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {moods.map(moodOption => (
          <button
            key={moodOption.value}
            onClick={() => onSelect(moodOption.value)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              selectedMood === moodOption.value
                ? 'border-purple-400 bg-purple-900/40 scale-105'
                : 'border-purple-700/30 hover:border-purple-600 hover:bg-purple-900/20'
            }`}
            type="button"
          >
            <span className="text-3xl mb-1">{moodOption.emoji}</span>
            <span className="text-xs text-purple-300">{moodOption.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export const MoodPicker = memo(MoodPickerComponent);
export type { MoodPickerProps, MoodOption };
