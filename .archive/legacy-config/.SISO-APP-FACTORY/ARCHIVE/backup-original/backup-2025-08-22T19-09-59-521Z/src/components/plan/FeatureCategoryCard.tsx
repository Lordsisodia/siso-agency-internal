
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { FeatureCategory } from '@/models/plan/features';

interface FeatureCategoryCardProps {
  category: FeatureCategory;
  active: boolean;
  selectedFeatureCount: number;
  totalTimeEstimate: number;
  onClick: () => void;
}

export const FeatureCategoryCard: React.FC<FeatureCategoryCardProps> = ({
  category,
  active,
  selectedFeatureCount,
  totalTimeEstimate,
  onClick
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className={`
        rounded-lg p-3 cursor-pointer transition-colors
        ${active 
          ? 'bg-siso-orange/10 border border-siso-orange/30' 
          : 'bg-black/30 border border-siso-text/10 hover:bg-black/40'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-siso-orange/10 p-1.5">
          {category.icon}
        </div>
        
        <div className="flex-grow">
          <h3 className="font-medium text-white">{category.name}</h3>
          {/* Use category.info or category.description or empty string */}
          <p className="text-sm text-siso-text/70 mb-2">{category.info || category.description || ''}</p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedFeatureCount > 0 && (
              <Badge 
                variant={active ? "default" : "secondary"}
                className="text-xs bg-black/40"
              >
                {selectedFeatureCount} selected
              </Badge>
            )}
            
            {totalTimeEstimate > 0 && (
              <Badge 
                variant={active ? "secondary" : "outline"}
                className="flex items-center gap-1 text-xs bg-black/40"
              >
                <Clock className="w-3 h-3" />
                +{totalTimeEstimate} days
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
