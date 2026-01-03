
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FeatureCategory } from '@/models/plan/features';
import { FeatureItem } from './FeatureItem';

interface FeatureCategoryCardProps { 
  category: FeatureCategory;
  onShowDetail: (feature: any) => void;
}

export const FeatureCategoryCard: React.FC<FeatureCategoryCardProps> = ({ 
  category, 
  onShowDetail 
}) => {
  const mvpFeatures = category.features.filter(f => f.tier === 'mvp');
  const advancedFeatures = category.features.filter(f => f.tier === 'advanced');
  const premiumFeatures = category.features.filter(f => f.tier === 'premium');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-siso-text/10 rounded-lg bg-black/30 overflow-hidden h-full flex flex-col"
    >
      <div className="p-5 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-black/40">
              {category.icon}
            </div>
            <h4 className="font-medium text-white">{category.name}</h4>
          </div>
          
          {mvpFeatures.length > 0 && (
            <Badge variant="outline" className="bg-siso-orange/10 text-siso-orange border-siso-orange/20">
              MVP Included
            </Badge>
          )}
        </div>
        
        {category.description && (
          <p className="text-sm text-siso-text mt-2 mb-4">{category.description}</p>
        )}
        
        <div className="space-y-3">
          {mvpFeatures.map(feature => (
            <FeatureItem 
              key={feature.id} 
              name={feature.name}
              description={feature.description}
              tier="mvp"
              recommended={feature.recommended}
              onClick={() => onShowDetail({...feature, category: category.id})}
            />
          ))}
          
          {advancedFeatures.length > 0 && (
            <div className="mt-4 pt-3 border-t border-siso-text/10">
              <span className="text-xs text-siso-text/70">Advanced Features:</span>
              {advancedFeatures.map(feature => (
                <FeatureItem 
                  key={feature.id} 
                  name={feature.name}
                  description={feature.description}
                  tier="advanced"
                  recommended={feature.recommended}
                  onClick={() => onShowDetail({...feature, category: category.id})}
                />
              ))}
            </div>
          )}
          
          {premiumFeatures.length > 0 && (
            <div className="mt-4 pt-3 border-t border-siso-text/10">
              <span className="text-xs text-siso-text/70">Premium Features:</span>
              {premiumFeatures.map(feature => (
                <FeatureItem 
                  key={feature.id} 
                  name={feature.name}
                  description={feature.description}
                  tier="premium"
                  recommended={feature.recommended}
                  onClick={() => onShowDetail({...feature, category: category.id})}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
