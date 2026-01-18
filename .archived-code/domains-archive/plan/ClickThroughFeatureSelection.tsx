
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Info, Circle, CheckCircle, Clock, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeatureCategory, FeatureItem } from '@/models/plan/features';

interface ClickThroughFeatureSelectionProps {
  featureCategories: FeatureCategory[];
  onFinalizeFeatures: (selectedFeatures: string[]) => void;
}

// Define tiers
const tiers = [
  {
    id: 'mvp',
    name: 'MVP',
    maxFeatures: 10,
    baseTimeEstimate: 90,
    price: 0,
    icon: <Circle className="h-4 w-4" />,
    description: 'Essential features to get your platform started.'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    maxFeatures: 'Unlimited',
    baseTimeEstimate: 60,
    price: 249,
    icon: <Shield className="h-4 w-4" />,
    description: 'Enhanced features with faster delivery.'
  },
  {
    id: 'premium',
    name: 'Premium',
    maxFeatures: 'All Features',
    baseTimeEstimate: 21,
    price: 499,
    icon: <Sparkles className="h-4 w-4" />,
    description: 'All features with priority support and fastest delivery.'
  }
];

export const ClickThroughFeatureSelection: React.FC<ClickThroughFeatureSelectionProps> = ({
  featureCategories,
  onFinalizeFeatures
}) => {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('mvp');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterRecommended, setFilterRecommended] = useState(false);
  
  // Calculate total time based on selected features
  const calculateTotalTime = () => {
    // Get the base time from the current tier
    const currentTierInfo = tiers.find(t => t.id === currentTier) || tiers[0];
    const baseTime = currentTierInfo.baseTimeEstimate;
    
    // Calculate additional time from features
    let additionalTime = 0;
    selectedFeatureIds.forEach(featureId => {
      for (const category of featureCategories) {
        const feature = category.features.find(f => f.id === featureId);
        if (feature) {
          additionalTime += feature.timeEstimate;
          break;
        }
      }
    });
    
    return {
      baseTime,
      additionalTime,
      totalTime: baseTime + additionalTime
    };
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      // Remove feature
      setSelectedFeatureIds(prev => prev.filter(id => id !== featureId));
    } else {
      // Add feature - check limits for MVP tier
      if (currentTier === 'mvp' && selectedFeatureIds.length >= 10) {
        // Show upgrade dialog or toast
        const confirmUpgrade = window.confirm(
          "You've reached the maximum of 10 features for the MVP tier. Would you like to upgrade to Advanced for unlimited features?"
        );
        if (confirmUpgrade) {
          setCurrentTier('advanced');
          setSelectedFeatureIds(prev => [...prev, featureId]);
        }
        return;
      }
      
      setSelectedFeatureIds(prev => [...prev, featureId]);
    }
  };
  
  // Get all features flat
  const getAllFeatures = (): FeatureItem[] => {
    return featureCategories.flatMap(category => category.features);
  };
  
  // Get filtered features
  const getFilteredFeatures = () => {
    let filtered = getAllFeatures();
    
    // Apply tier filter - only show features available in the current tier
    if (currentTier === 'mvp') {
      filtered = filtered.filter(feature => feature.tier === 'mvp');
    } else if (currentTier === 'advanced') {
      filtered = filtered.filter(feature => feature.tier === 'mvp' || feature.tier === 'advanced');
    }
    
    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(feature => feature.category === activeCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(feature => 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply recommended filter
    if (filterRecommended) {
      filtered = filtered.filter(feature => feature.recommended);
    }
    
    return filtered;
  };
  
  // Get selected feature names for passing to parent
  const getSelectedFeatureNames = () => {
    const names: string[] = [];
    
    selectedFeatureIds.forEach(featureId => {
      for (const category of featureCategories) {
        const feature = category.features.find(f => f.id === featureId);
        if (feature) {
          names.push(feature.name);
          break;
        }
      }
    });
    
    return names;
  };
  
  // Handle continue button
  const handleContinue = () => {
    onFinalizeFeatures(getSelectedFeatureNames());
  };
  
  const { baseTime, additionalTime, totalTime } = calculateTotalTime();
  const filteredFeatures = getFilteredFeatures();
  const currentTierInfo = tiers.find(t => t.id === currentTier) || tiers[0];

  // Get a feature's category object
  const getFeatureCategory = (categoryId: string) => {
    return featureCategories.find(cat => cat.id === categoryId);
  };
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Tier selection tabs */}
        <Tabs value={currentTier} onValueChange={setCurrentTier} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Select Your Plan</h3>
            <TabsList className="bg-black/30">
              {tiers.map(tier => (
                <TabsTrigger 
                  key={tier.id} 
                  value={tier.id}
                  className={cn(
                    "data-[state=active]:bg-siso-orange data-[state=active]:text-white",
                    tier.id === 'advanced' && "relative"
                  )}
                >
                  {tier.name}
                  {tier.price > 0 && <span className="ml-1 text-xs opacity-70">(£{tier.price})</span>}
                  {tier.id === 'advanced' && (
                    <div className="absolute -top-2 -right-2 bg-siso-red text-white text-xs px-1 py-0.5 rounded-full">
                      Popular
                    </div>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tier descriptions */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {tiers.map(tier => (
              <div 
                key={tier.id}
                className={cn(
                  "p-4 rounded-lg border text-sm",
                  currentTier === tier.id 
                    ? "border-siso-orange bg-siso-orange/10" 
                    : "border-siso-text/10 bg-black/20"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {tier.icon}
                  <span className="font-medium text-white">{tier.name}</span>
                </div>
                <ul className="space-y-1 text-xs text-siso-text">
                  <li className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-siso-orange" />
                    {typeof tier.maxFeatures === 'number' ? `Up to ${tier.maxFeatures} features` : 'Unlimited features'}
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-siso-orange" />
                    {tier.baseTimeEstimate} days delivery time
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-siso-orange" />
                    {tier.id === 'premium' ? 'Priority support' : 'Standard support'}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </Tabs>
        
        {/* Search and category filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-siso-text" />
            <Input 
              placeholder="Search features..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/30 border-siso-text/20 text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterRecommended ? "default" : "outline"}
              className={filterRecommended ? "bg-siso-orange hover:bg-siso-orange/90" : "border-siso-text/20"}
              onClick={() => setFilterRecommended(!filterRecommended)}
              size="sm"
            >
              <Star className="h-4 w-4 mr-1" />
              Recommended
            </Button>
            
            <Button
              variant="outline"
              className="border-siso-text/20"
              onClick={() => {
                setSearchQuery('');
                setFilterRecommended(false);
                setActiveCategory('all');
              }}
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Category filter tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="bg-black/30 w-full flex overflow-x-auto hide-scrollbar py-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
            >
              All Categories
            </TabsTrigger>
            {featureCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1.5">
                  {category.icon}
                  {category.name}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Feature selection counter */}
        <div className="flex justify-between items-center bg-black/30 rounded-lg p-3 border border-siso-text/10 mb-4">
          <div>
            <span className="text-white font-medium">
              {selectedFeatureIds.length}{' '}
              {currentTier === 'mvp' ? `/ 10` : ''} features selected
            </span>
            <p className="text-xs text-siso-text">
              {currentTier === 'mvp'
                ? `Select up to ${10 - selectedFeatureIds.length} more features in the free MVP tier`
                : `You can select unlimited features in the ${currentTierInfo.name} tier`}
            </p>
          </div>
          <div className="text-right">
            <span className="text-white font-medium">
              Total time: {totalTime} days
            </span>
            <p className="text-xs text-siso-text">
              Base: {baseTime} days + Features: +{additionalTime} days
            </p>
          </div>
        </div>
        
        {/* Feature grid - all features visible at once */}
        <div className="space-y-1">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-8 bg-black/20 rounded-lg border border-siso-text/10">
              <Search className="mx-auto h-6 w-6 text-siso-text/50 mb-2" />
              <h3 className="text-white font-medium">No features match your filters</h3>
              <p className="text-sm text-siso-text mb-3">
                Try adjusting your search criteria
              </p>
              <Button
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterRecommended(false);
                  setActiveCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeatures.map(feature => {
                const isSelected = selectedFeatureIds.includes(feature.id);
                const category = getFeatureCategory(feature.category);
                
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex gap-3 p-4 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-siso-orange/10 border border-siso-orange/30"
                        : "bg-black/20 border border-siso-text/10 hover:bg-black/30",
                      feature.tier !== 'mvp' && "relative overflow-hidden"
                    )}
                    onClick={() => handleFeatureToggle(feature.id)}
                  >
                    {/* Tier badge for non-MVP features */}
                    {feature.tier !== 'mvp' && (
                      <div className="absolute top-0 right-0">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "rounded-none rounded-bl-md border-0 text-xs",
                            feature.tier === 'advanced' 
                              ? "bg-siso-orange/20 text-siso-orange" 
                              : "bg-siso-red/20 text-siso-red"
                          )}
                        >
                          {feature.tier === 'advanced' ? 'Advanced' : 'Premium'}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Selection indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-siso-orange" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-siso-text/50" />
                      )}
                    </div>
                    
                    {/* Feature content */}
                    <div className="flex-grow mr-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-white flex items-center gap-1.5">
                          {feature.name}
                          {feature.recommended && (
                            <Star className="h-3.5 w-3.5 text-siso-orange fill-siso-orange" />
                          )}
                        </h4>
                      </div>
                      
                      {/* Category and time estimate */}
                      <div className="flex items-center gap-2 mb-1">
                        {category?.icon && (
                          <div className="flex items-center text-xs text-siso-text gap-1">
                            <span className="opacity-70">{category?.name}</span>
                          </div>
                        )}
                        {feature.timeEstimate > 0 && (
                          <div className="flex items-center text-xs text-siso-text gap-1">
                            <Clock className="h-3 w-3 opacity-70" />
                            <span>
                              +{feature.timeEstimate} {feature.timeEstimate === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-siso-text">
                        {feature.description}
                      </p>
                      
                      {feature.roi && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mt-2 flex items-center text-xs text-siso-orange gap-1 cursor-help">
                              <Info className="h-3 w-3" />
                              <span>Impact: {feature.roi.length > 30 ? `${feature.roi.substring(0, 30)}...` : feature.roi}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{feature.roi}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Continue button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            size="lg"
            disabled={selectedFeatureIds.length === 0}
          >
            Continue with {selectedFeatureIds.length} features
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
