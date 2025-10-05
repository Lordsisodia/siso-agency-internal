
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeatureItem } from '@/models/plan/features';

interface EnhancedFeatureItemProps {
  feature: FeatureItem;
  isSelected: boolean;
  onToggle: () => void;
}

export function EnhancedFeatureItem({ feature, isSelected, onToggle }: EnhancedFeatureItemProps) {
  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onToggle}
        className={cn(
          "flex gap-3 p-3 rounded-lg border cursor-pointer transition-all",
          isSelected
            ? "bg-siso-orange/10 border-siso-orange/30"
            : "bg-black/20 border-siso-text/10 hover:bg-black/30"
        )}
      >
        {/* Selection circle */}
        <div className="flex-shrink-0 mt-1">
          <div className={cn(
            "w-5 h-5 rounded-full transition-colors flex items-center justify-center",
            isSelected 
              ? "bg-siso-orange/20 border-2 border-siso-orange" 
              : "border-2 border-siso-text/30"
          )}>
            {isSelected && (
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-medium text-white">{feature.name}</h4>
              {feature.recommended && (
                <Badge variant="success" className="text-xs">
                  Recommended
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-siso-text mb-1">{feature.description}</p>
          
          <div className="flex items-center gap-3 text-xs text-siso-text/70">
            {feature.timeEstimate > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>+{feature.timeEstimate} {feature.timeEstimate === 1 ? 'day' : 'days'}</span>
              </div>
            )}
            
            {feature.roi && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-siso-orange cursor-help">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Business impact</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{feature.roi}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
