
import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Users, Building, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeatureCategory } from '@/models/plan/features';

interface QuickSummaryFeaturesProps {
  modelFacingCategories: FeatureCategory[];
  agencyFacingCategories: FeatureCategory[];
  sharedFeatureCategories: FeatureCategory[];
  onFeatureSelect: (featureName: string) => void;
  onSelectAll: () => void;
}

export const QuickSummaryFeatures: React.FC<QuickSummaryFeaturesProps> = ({
  modelFacingCategories,
  agencyFacingCategories,
  sharedFeatureCategories,
  onFeatureSelect,
  onSelectAll,
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Extract only MVP features
  const getMvpFeatures = (categories: FeatureCategory[]) => {
    return categories.flatMap(category => 
      category.features
        .filter(feature => feature.tier === 'mvp')
        .map(feature => ({
          ...feature,
          categoryName: category.name,
          categoryIcon: category.icon
        }))
    );
  };

  const modelMvpFeatures = getMvpFeatures(modelFacingCategories);
  const agencyMvpFeatures = getMvpFeatures(agencyFacingCategories);
  const sharedMvpFeatures = getMvpFeatures(sharedFeatureCategories);
  
  const totalMvpCount = modelMvpFeatures.length + agencyMvpFeatures.length + sharedMvpFeatures.length;
  
  return (
    <div className="bg-black/40 border border-siso-text/10 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-siso-orange" />
          <h3 className="text-lg font-semibold text-white">Quick Summary</h3>
          <Badge variant="outline" className="bg-siso-orange/10 text-siso-orange border-0">
            {totalMvpCount} MVP Features
          </Badge>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-siso-text hover:text-white"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand
            </>
          )}
        </Button>
      </div>
      
      <p className="text-sm text-siso-text mb-4">
        Below is a quick overview of all included MVP features for both model and agency users. 
        Click "Select All" to choose all recommended features or expand for more details.
      </p>
      
      <div className="flex justify-end mb-4">
        <Button
          onClick={onSelectAll}
          className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
          size="sm"
        >
          Select All MVP Features
        </Button>
      </div>
      
      <Collapsible
        open={expanded}
        onOpenChange={setExpanded}
        className="w-full"
      >
        <CollapsibleContent>
          <div className="space-y-4">
            {/* Model Facing Features */}
            <div>
              <div className="flex items-center gap-2 mb-2 border-b border-siso-text/10 pb-2">
                <div className="p-1.5 rounded-full bg-siso-orange/20">
                  <Users className="h-4 w-4 text-siso-orange" />
                </div>
                <h4 className="font-medium text-white">Model Features ({modelMvpFeatures.length})</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {modelMvpFeatures.map((feature) => (
                  <TooltipProvider key={feature.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex items-center gap-2 p-2 bg-black/30 rounded border border-siso-text/10 hover:border-siso-orange/30 cursor-pointer"
                          onClick={() => onFeatureSelect(feature.name)}
                        >
                          <CheckCircle className="h-4 w-4 text-siso-orange shrink-0" />
                          <span className="text-sm text-siso-text truncate">{feature.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="max-w-xs p-2">
                          <p className="font-medium mb-1">{feature.name}</p>
                          <p className="text-xs">{feature.description}</p>
                          <p className="text-xs mt-1 text-siso-orange">Category: {feature.categoryName}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
            
            {/* Agency Facing Features */}
            <div>
              <div className="flex items-center gap-2 mb-2 border-b border-siso-text/10 pb-2">
                <div className="p-1.5 rounded-full bg-siso-orange/20">
                  <Building className="h-4 w-4 text-siso-orange" />
                </div>
                <h4 className="font-medium text-white">Agency Features ({agencyMvpFeatures.length})</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {agencyMvpFeatures.map((feature) => (
                  <TooltipProvider key={feature.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex items-center gap-2 p-2 bg-black/30 rounded border border-siso-text/10 hover:border-siso-orange/30 cursor-pointer"
                          onClick={() => onFeatureSelect(feature.name)}
                        >
                          <CheckCircle className="h-4 w-4 text-siso-orange shrink-0" />
                          <span className="text-sm text-siso-text truncate">{feature.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="max-w-xs p-2">
                          <p className="font-medium mb-1">{feature.name}</p>
                          <p className="text-xs">{feature.description}</p>
                          <p className="text-xs mt-1 text-siso-orange">Category: {feature.categoryName}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
            
            {/* Shared Features (if any) */}
            {sharedMvpFeatures.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 border-b border-siso-text/10 pb-2">
                  <h4 className="font-medium text-white">Shared Features ({sharedMvpFeatures.length})</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {sharedMvpFeatures.map((feature) => (
                    <TooltipProvider key={feature.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="flex items-center gap-2 p-2 bg-black/30 rounded border border-siso-text/10 hover:border-siso-orange/30 cursor-pointer"
                            onClick={() => onFeatureSelect(feature.name)}
                          >
                            <CheckCircle className="h-4 w-4 text-siso-orange shrink-0" />
                            <span className="text-sm text-siso-text truncate">{feature.name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="max-w-xs p-2">
                            <p className="font-medium mb-1">{feature.name}</p>
                            <p className="text-xs">{feature.description}</p>
                            <p className="text-xs mt-1 text-siso-orange">Category: {feature.categoryName}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
        
        {!expanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
          >
            <div className="bg-black/20 border border-siso-text/10 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-siso-orange" />
                <span className="font-medium text-white">Model Features</span>
                <Badge className="bg-siso-orange/10 text-xs border-0 text-siso-orange">{modelMvpFeatures.length}</Badge>
              </div>
              <p className="text-xs text-siso-text">Content management, earnings tracking, subscribers, and more.</p>
            </div>
            
            <div className="bg-black/20 border border-siso-text/10 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-siso-orange" />
                <span className="font-medium text-white">Agency Features</span>
                <Badge className="bg-siso-orange/10 text-xs border-0 text-siso-orange">{agencyMvpFeatures.length}</Badge>
              </div>
              <p className="text-xs text-siso-text">Analytics, client management, team roles, and administrative tools.</p>
            </div>
          </motion.div>
        )}
      </Collapsible>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-siso-orange hover:bg-siso-orange/10"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show Less" : "Show All Features"}
          {expanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
