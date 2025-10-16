import React from 'react';
import { motion } from 'framer-motion';

import { Textarea } from '@/shared/ui/textarea';

interface AnalysisActionSectionProps {
  dailyAnalysis: string;
  actionItems: string;
  onDailyAnalysisChange: (value: string) => void;
  onActionItemsChange: (value: string) => void;
}

export const AnalysisActionSection: React.FC<AnalysisActionSectionProps> = ({
  dailyAnalysis,
  actionItems,
  onDailyAnalysisChange,
  onActionItemsChange
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
    <div>
      <h4 className="font-semibold text-purple-300 mb-3 text-base">Analyze your day and areas for improvement</h4>
      <Textarea
        value={dailyAnalysis}
        onChange={(event) => onDailyAnalysisChange(event.target.value)}
        className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[120px]"
        placeholder="What patterns did you notice? What recurring behaviors showed up? What insights did you gain?"
      />
    </div>

    <div>
      <h4 className="font-semibold text-purple-300 mb-3 text-base">Action items for improvement</h4>
      <Textarea
        value={actionItems}
        onChange={(event) => onActionItemsChange(event.target.value)}
        className="bg-purple-900/10 border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[120px]"
        placeholder="What specific changes will you make? What will you do differently tomorrow?"
      />
    </div>
  </motion.div>
);
