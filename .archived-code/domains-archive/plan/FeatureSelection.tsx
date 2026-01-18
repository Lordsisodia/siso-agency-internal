
import { useState } from 'react';
import { CheckCircle, Circle, Settings, Clock, Tag, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  included: boolean;
  timeEstimate?: number;
  category?: 'mvp' | 'advanced' | 'premium';
  recommended?: boolean;
  roi?: string;
}

interface FeatureSelectionProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
  readOnly?: boolean;
  showPricing?: boolean;
  filterCategory?: 'mvp' | 'advanced' | 'premium' | 'all';
}

export const FeatureSelection = ({ 
  features, 
  onChange,
  readOnly = false,
  showPricing = false,
  filterCategory = 'all'
}: FeatureSelectionProps) => {
  const [activeCategory, setActiveCategory] = useState<'mvp' | 'advanced' | 'premium' | 'all'>(filterCategory);
  
  const toggleFeature = (featureId: string) => {
    if (readOnly) return;
    
    const updatedFeatures = features.map(feature => 
      feature.id === featureId 
        ? { ...feature, included: !feature.included } 
        : feature
    );
    
    onChange(updatedFeatures);
  };
  
  const filteredFeatures = features.filter(feature => 
    activeCategory === 'all' || feature.category === activeCategory
  );
  
  // Helper to get category title
  const getCategoryTitle = (category: string) => {
    switch(category) {
      case 'mvp': return 'MVP Features';
      case 'advanced': return 'Advanced Features';
      case 'premium': return 'Premium Features';
      default: return 'All Features';
    }
  };
  
  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'mvp': return <Circle className="h-4 w-4" />;
      case 'advanced': return <Settings className="h-4 w-4" />;
      case 'premium': return <Tag className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };
  
  return (
    <TooltipProvider>
      <div className="rounded-lg border border-siso-text/10 bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-siso-orange" />
            <h3 className="text-lg font-semibold text-white">Customize Features</h3>
          </div>
          
          <div className="flex space-x-1 bg-black/30 p-1 rounded-md">
            {['all', 'mvp', 'advanced', 'premium'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as any)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                  activeCategory === category
                    ? "bg-siso-orange text-white"
                    : "text-siso-text hover:text-white"
                )}
              >
                {getCategoryTitle(category).split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Category description */}
        {activeCategory !== 'all' && (
          <div className="mb-4 p-3 bg-black/30 rounded-md border border-siso-text/10">
            <div className="flex items-center gap-2 text-siso-orange">
              {getCategoryIcon(activeCategory)}
              <h4 className="font-medium">{getCategoryTitle(activeCategory)}</h4>
            </div>
            <p className="mt-1 text-sm text-siso-text">
              {activeCategory === 'mvp' && "Essential features included in the base price to get your platform up and running."}
              {activeCategory === 'advanced' && "Enhanced functionality to improve user experience and operational efficiency."}
              {activeCategory === 'premium' && "Premium capabilities for maximum customization and competitive advantage."}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {filteredFeatures.map((feature) => (
            <motion.div 
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "rounded-lg border border-siso-text/5 bg-black/30 p-3 transition-all duration-200",
                feature.included ? "border-siso-orange/30" : "",
                !readOnly && "cursor-pointer hover:bg-black/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {feature.included ? (
                    <CheckCircle className="h-5 w-5 text-siso-orange" />
                  ) : (
                    <Circle className="h-5 w-5 text-siso-text/50" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h4 className="font-medium text-white">{feature.name}</h4>
                      {feature.recommended && (
                        <span className="ml-2 px-1.5 py-0.5 bg-siso-orange/20 text-siso-orange rounded-sm text-xs font-medium">
                          Recommended
                        </span>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="ml-1 text-siso-text hover:text-siso-orange">
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{feature.description}</p>
                          {feature.roi && (
                            <div className="mt-2 pt-2 border-t border-siso-text/10">
                              <span className="flex items-center text-siso-orange font-medium">
                                <TrendingUp className="h-3.5 w-3.5 mr-1" /> Business Impact:
                              </span>
                              <p className="text-sm mt-1">{feature.roi}</p>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {showPricing && feature.price > 0 && (
                      <span className="text-sm text-siso-orange">+£{feature.price}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-siso-text">{feature.description}</p>
                  
                  {feature.timeEstimate !== undefined && (
                    <div className="mt-2 flex items-center text-xs text-siso-text/70">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{feature.timeEstimate > 0 ? `+${feature.timeEstimate} days` : 'No additional time'}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
