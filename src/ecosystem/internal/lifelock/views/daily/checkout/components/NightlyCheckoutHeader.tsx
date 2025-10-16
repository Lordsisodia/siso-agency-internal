import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';

import { CardHeader, CardTitle } from '@/shared/ui/card';

interface NightlyCheckoutHeaderProps {
  progress: number;
  isSaving: boolean;
}

export const NightlyCheckoutHeader: React.FC<NightlyCheckoutHeaderProps> = ({ progress, isSaving }) => (
  <CardHeader>
    <CardTitle className="flex items-center text-purple-400">
      <Moon className="h-5 w-5 mr-2" />
      Nightly Check-Out
    </CardTitle>

    <div className="mt-4">
      <div className="flex justify-between text-sm text-purple-300 mb-2">
        <span>Reflection Progress</span>
        <span>{`${Math.round(progress)}%`}</span>
        {isSaving && <span className="text-xs text-purple-400">Saving...</span>}
      </div>
      <div className="w-full bg-purple-900/30 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  </CardHeader>
);
