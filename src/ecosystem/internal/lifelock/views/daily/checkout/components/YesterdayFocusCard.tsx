import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/shared/ui/card';

interface YesterdayFocusCardProps {
  focus: string;
}

export const YesterdayFocusCard: React.FC<YesterdayFocusCardProps> = ({ focus }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
    <Card className="bg-yellow-900/20 border-l-4 border-yellow-500">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-yellow-300 font-semibold mb-2 text-sm">Yesterday you said you'd focus on:</h4>
            <p className="text-yellow-100 font-medium italic">"{focus}"</p>
            <p className="text-yellow-400 text-xs mt-2">Did you follow through? 🎯</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
