
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FeatureItemProps { 
  name: string; 
  description: string;
  tier: 'mvp' | 'advanced' | 'premium';
  recommended?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onInfoClick?: () => void;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ 
  name, 
  description, 
  tier, 
  recommended,
  isSelected = false,
  onClick,
  onInfoClick
}) => {
  return (
    <motion.div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-md cursor-pointer hover:bg-black/30 transition-colors",
        isSelected ? "bg-black/40 border border-siso-orange/40" : "bg-black/10",
        tier === 'mvp' ? "bg-opacity-20" : "bg-opacity-10"
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CheckCircle className={cn(
        "h-4 w-4 shrink-0 mt-0.5",
        isSelected ? "text-siso-orange" : "text-siso-text/50"
      )} />
      
      <div>
        <div className="flex items-center gap-1">
          <span className={cn(
            "font-medium text-sm",
            isSelected ? "text-white" : "text-siso-text/80"
          )}>
            {name}
          </span>
          
          {recommended && (
            <Badge variant="outline" className="text-xs bg-siso-orange/10 text-siso-orange border-0 py-0 h-4">
              Recommended
            </Badge>
          )}
          
          {tier !== 'mvp' && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs py-0 h-4 border-0",
                tier === 'advanced' 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "bg-purple-500/10 text-purple-400"
              )}
            >
              {tier === 'advanced' ? 'Advanced' : 'Premium'}
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-siso-text mt-1">{description}</p>
        
        <div className="flex items-center mt-1">
          <Button variant="link" className="text-xs text-siso-orange p-0 h-auto" onClick={(e) => {
            e.stopPropagation();
            if (onInfoClick) onInfoClick();
          }}>
            <Info className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
