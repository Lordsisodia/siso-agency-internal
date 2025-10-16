import React from 'react';
import { motion } from 'framer-motion';

import { Input } from '@/shared/ui/input';

interface WinOfDaySectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const WinOfDaySection: React.FC<WinOfDaySectionProps> = ({ value, onChange }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-700/30">
      <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center">
        <span className="text-2xl mr-2">🏆</span>
        What was your BIGGEST win today?
      </h3>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-purple-900/20 border-purple-700/50 text-white text-lg font-medium placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20"
        placeholder="The ONE thing that made today successful..."
        autoFocus
      />
      <p className="text-xs text-purple-400 mt-2">Force yourself to pick just one - builds clarity 💎</p>
    </div>
  </motion.div>
);
