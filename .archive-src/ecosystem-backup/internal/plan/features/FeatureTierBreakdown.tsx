
import React from 'react';
import { FeatureCategory } from '@/models/plan/features';

interface FeatureTierBreakdownProps {
  modelFacingCategories: FeatureCategory[];
  agencyFacingCategories: FeatureCategory[];
  sharedFeatureCategories: FeatureCategory[];
}

export const FeatureTierBreakdown: React.FC<FeatureTierBreakdownProps> = ({
  modelFacingCategories,
  agencyFacingCategories,
  sharedFeatureCategories
}) => {
  // Count features by tier
  const countFeaturesByTier = (tier: 'mvp' | 'advanced' | 'premium') => {
    let count = 0;
    const allCategories = [
      ...modelFacingCategories, 
      ...agencyFacingCategories, 
      ...sharedFeatureCategories
    ];
    
    allCategories.forEach(category => {
      category.features.forEach(feature => {
        if (feature.tier === tier) {
          count++;
        }
      });
    });
    
    return count;
  };
  
  const mvpFeatureCount = countFeaturesByTier('mvp');
  const advancedFeatureCount = countFeaturesByTier('advanced');
  const premiumFeatureCount = countFeaturesByTier('premium');
  
  return (
    <div className="mt-8 p-4 bg-black/30 border border-siso-text/10 rounded-lg">
      <h3 className="text-white font-semibold mb-3">Features By Tier</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 bg-black/40 border border-siso-text/20 rounded-lg">
          <h4 className="text-siso-orange font-medium flex items-center">
            <span className="h-2 w-2 bg-siso-orange rounded-full mr-2"></span>
            MVP Tier (Free)
          </h4>
          <p className="text-sm text-siso-text mt-1">
            {mvpFeatureCount} essential features included in the base package
          </p>
        </div>
        
        <div className="p-3 bg-black/40 border border-siso-text/20 rounded-lg">
          <h4 className="text-siso-orange font-medium flex items-center">
            <span className="h-2 w-2 bg-siso-orange rounded-full mr-2"></span>
            Advanced Tier
          </h4>
          <p className="text-sm text-siso-text mt-1">
            {advancedFeatureCount} enhanced features for optimal efficiency
          </p>
        </div>
        
        <div className="p-3 bg-black/40 border border-siso-text/20 rounded-lg">
          <h4 className="text-siso-orange font-medium flex items-center">
            <span className="h-2 w-2 bg-siso-orange rounded-full mr-2"></span>
            Premium Tier
          </h4>
          <p className="text-sm text-siso-text mt-1">
            {premiumFeatureCount} premium capabilities for maximum growth
          </p>
        </div>
      </div>
    </div>
  );
};
