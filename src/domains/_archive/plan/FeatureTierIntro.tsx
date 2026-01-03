
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TierInfo {
  id: string;
  name: string;
  maxFeatures: number | string;
  baseTimeEstimate: number;
  price: number;
  description: string;
}

interface FeatureTierIntroProps {
  currentTier: string;
  tiers: TierInfo[];
  selectedCount: number;
  totalTimeEstimate: number;
  onTierChange: (tier: string) => void;
}

export const FeatureTierIntro: React.FC<FeatureTierIntroProps> = ({
  currentTier,
  tiers,
  selectedCount,
  totalTimeEstimate,
  onTierChange
}) => {
  const currentTierInfo = tiers.find(t => t.id === currentTier) || tiers[0];
  const isMvp = currentTier === 'mvp';
  const progressPercentage = isMvp ? Math.min((selectedCount / 10) * 100, 100) : 100;
  
  return (
    <TooltipProvider>
      <div className="bg-black/30 rounded-lg border border-siso-text/10 p-4 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Info className="h-5 w-5 text-siso-orange shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-medium mb-1">Feature Selection Guide</h3>
            <p className="text-sm text-siso-text">
              {isMvp 
                ? `Pick up to 10 features for the free MVP tier. Each feature adds time to the base ${currentTierInfo.baseTimeEstimate}-day timeline.` 
                : `You've upgraded to ${currentTierInfo.name} tier with ${currentTierInfo.maxFeatures} features and a ${currentTierInfo.baseTimeEstimate}-day base timeline.`
              }
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-siso-text">Features Selected</span>
            <span className={isMvp && selectedCount >= 8 ? "text-siso-orange font-medium" : "text-siso-text"}>
              {selectedCount}{isMvp ? "/10" : ""}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {tiers.map(tier => (
            <motion.div
              key={tier.id}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "p-3 rounded-lg border cursor-pointer",
                tier.id === currentTier 
                  ? "bg-siso-orange/10 border-siso-orange" 
                  : "bg-black/20 border-siso-text/10 hover:bg-black/30"
              )}
              onClick={() => onTierChange(tier.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium text-white">{tier.name}</h4>
                {tier.id === currentTier && (
                  <Check className="h-4 w-4 text-siso-orange" />
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-siso-text">Features:</span>
                <span className="text-siso-orange font-medium">{tier.maxFeatures}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-siso-text">Base Timeline:</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-siso-orange" />
                  <span className="text-siso-orange font-medium">{tier.baseTimeEstimate} days</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-siso-text">Price:</span>
                <span className="text-white font-bold">
                  {tier.price === 0 ? "Free" : `£${tier.price}`}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {isMvp && selectedCount >= 8 && (
          <div className="flex items-center gap-2 text-xs text-siso-orange mt-2">
            <AlertTriangle className="h-3 w-3" />
            <span>You're approaching the 10-feature limit for the free tier</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

// Helper function to conditionally join class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
