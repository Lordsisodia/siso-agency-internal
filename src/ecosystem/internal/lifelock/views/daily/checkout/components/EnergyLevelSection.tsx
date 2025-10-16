import React from 'react';
import { motion } from 'framer-motion';

interface EnergyLevelSectionProps {
  value?: number;
  onChange: (value: number) => void;
}

export const EnergyLevelSection: React.FC<EnergyLevelSectionProps> = ({ value = 5, onChange }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mb-6">
    <h4 className="font-semibold text-purple-300 mb-3 text-base">How was your energy today?</h4>
    <div className="flex items-center space-x-4">
      <span className="text-sm text-purple-400">Drained</span>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(event) => onChange(parseInt(event.target.value, 10))}
        className="flex-1 h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
      <span className="text-sm text-purple-400">Energized</span>
      <div className="min-w-[60px] text-center">
        <span className="text-2xl font-bold text-purple-100">{value}</span>
        <span className="text-purple-400">/10</span>
      </div>
    </div>
  </motion.div>
);
