
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { FeatureCategory, FeatureItem } from '@/models/plan/features';
import { cn } from '@/lib/utils';

interface FeatureCategoryListProps {
  categories: FeatureCategory[];
  selectedCategory: string;
  selectedFeatureIds: string[];
  onFeatureToggle: (featureId: string) => void;
  getFilteredFeatures: (category: FeatureCategory) => FeatureItem[];
}

export const FeatureCategoryList: React.FC<FeatureCategoryListProps> = ({
  categories,
  selectedCategory,
  selectedFeatureIds,
  onFeatureToggle,
  getFilteredFeatures
}) => {
  return (
    <TooltipProvider>
      <Accordion type="multiple" className="space-y-3">
        {categories
          .filter(category => selectedCategory === 'all' || category.id === selectedCategory)
          .map((category) => (
            <AccordionItem 
              key={category.id} 
              value={category.id}
              className="rounded-lg border border-siso-text/10 bg-black/20 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-black/40">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-siso-orange/10 p-1.5">
                    {category.icon}
                  </div>
                  <span className="font-medium text-white">{category.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="space-y-2 mt-2">
                  {getFilteredFeatures(category).length === 0 ? (
                    <p className="text-siso-text text-sm italic">No features match your search.</p>
                  ) : (
                    getFilteredFeatures(category).map((feature) => (
                      <div 
                        key={feature.id}
                        onClick={() => onFeatureToggle(feature.id)}
                        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                          selectedFeatureIds.includes(feature.id) 
                            ? 'bg-siso-orange/10 border border-siso-orange/30' 
                            : 'bg-black/30 border border-siso-text/10 hover:bg-black/40'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {selectedFeatureIds.includes(feature.id) ? (
                            <CheckCircle className="h-5 w-5 text-siso-orange" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-siso-text/50" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">{feature.name}</h4>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="bg-black/40 text-siso-text border-siso-text/20 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {feature.timeEstimate < 1 
                                    ? `+${Math.round(feature.timeEstimate * 24)} hours` 
                                    : `+${feature.timeEstimate} day${feature.timeEstimate !== 1 ? 's' : ''}`}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This feature adds {feature.timeEstimate < 1 
                                  ? `${Math.round(feature.timeEstimate * 24)} hours` 
                                  : `${feature.timeEstimate} day${feature.timeEstimate !== 1 ? 's' : ''}`} to your timeline</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-sm text-siso-text mt-1">{feature.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </TooltipProvider>
  );
};
