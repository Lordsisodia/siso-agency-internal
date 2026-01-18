
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureSelectionSummaryProps {
  selectedCount: number;
  maxFeatures: number | string;
  totalTime: number;
  baseTime: number;
  additionalTime: number;
  currentTier: string;
  onContinue: () => void;
}

export const FeatureSelectionSummary: React.FC<FeatureSelectionSummaryProps> = ({
  selectedCount,
  maxFeatures,
  totalTime,
  baseTime,
  additionalTime,
  currentTier,
  onContinue
}) => {
  const isMvp = currentTier === 'mvp';
  const isNearLimit = isMvp && selectedCount >= 8;
  const isAtLimit = isMvp && selectedCount >= 10;
  
  // Format days
  const formatDays = (days: number) => {
    return days === 1 ? "1 day" : `${days} days`;
  };
  
  // Format hours
  const formatHours = (days: number) => {
    const hours = Math.round((days % 1) * 24);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  };
  
  // Check if there are partial days
  const hasPartialDays = additionalTime % 1 > 0;
  const wholeDays = Math.floor(additionalTime);
  const additionalHours = formatHours(additionalTime);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-sm border border-siso-text/10 rounded-lg p-4 sticky bottom-4 mt-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-siso-orange" />
          <div>
            <h3 className="text-white font-medium">Features</h3>
            <p className={`text-sm ${isNearLimit ? "text-siso-orange" : "text-siso-text"}`}>
              {selectedCount} selected {isMvp ? `(out of ${maxFeatures})` : "(unlimited)"}
            </p>
          </div>
        </div>
        
        <div className="h-10 border-r border-siso-text/10 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-siso-orange" />
          <div>
            <h3 className="text-white font-medium">Timeline</h3>
            <p className="text-sm text-siso-text">
              {formatDays(baseTime)} base + {wholeDays > 0 ? `${formatDays(wholeDays)} ` : ""}
              {hasPartialDays ? additionalHours : ""}
            </p>
          </div>
        </div>
        
        <div className="h-10 border-r border-siso-text/10 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-siso-orange" />
          <div>
            <h3 className="text-white font-medium">Total Time</h3>
            <p className="text-sm text-siso-orange font-semibold">
              {formatDays(totalTime)}
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
      >
        Continue with Selected Features
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
};
