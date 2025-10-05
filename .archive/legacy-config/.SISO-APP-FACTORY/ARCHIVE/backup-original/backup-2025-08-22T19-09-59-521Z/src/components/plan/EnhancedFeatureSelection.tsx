
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Badge } from '@/components/ui/badge';
import { FeatureTierIntro } from './FeatureTierIntro';
import { FeatureCategoryCard } from './FeatureCategoryCard';
import { EnhancedFeatureItem } from './EnhancedFeatureItem';
import { FeatureSelectionSummary } from './FeatureSelectionSummary';
import { UpgradePrompt } from './UpgradePrompt';
import { FeatureCategory, FeatureItem } from '@/models/plan/features';

interface EnhancedFeatureSelectionProps {
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
    description: 'Essential features to get your platform started.'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    maxFeatures: 'Unlimited',
    baseTimeEstimate: 60,
    price: 249,
    description: 'Enhanced features with faster delivery.'
  },
  {
    id: 'premium',
    name: 'Premium',
    maxFeatures: 'All Features',
    baseTimeEstimate: 21,
    price: 499,
    description: 'All features with priority support and fastest delivery.'
  }
];

export const EnhancedFeatureSelection: React.FC<EnhancedFeatureSelectionProps> = ({
  featureCategories,
  onFinalizeFeatures
}) => {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('mvp');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [filterRecommended, setFilterRecommended] = useState(false);
  
  // Initialize with first category expanded
  useEffect(() => {
    if (featureCategories.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories([featureCategories[0].id]);
      setActiveCategory(featureCategories[0].id);
    }
  }, [featureCategories]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    // Expand the selected category if it's not already expanded
    if (!expandedCategories.includes(categoryId)) {
      setExpandedCategories(prev => [...prev, categoryId]);
    }
    
    // Scroll to the category section
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      // Remove feature
      setSelectedFeatureIds(prev => prev.filter(id => id !== featureId));
      setShowUpgradePrompt(false);
    } else {
      // Add feature - check limits for MVP tier
      if (currentTier === 'mvp' && selectedFeatureIds.length >= 10) {
        setShowUpgradePrompt(true);
        return;
      }
      
      setSelectedFeatureIds(prev => [...prev, featureId]);
    }
  };
  
  // Handle tier change
  const handleTierChange = (tier: string) => {
    setCurrentTier(tier);
    setShowUpgradePrompt(false);
  };
  
  // Get filtered features for a category
  const getFilteredFeatures = (category: FeatureCategory) => {
    let filtered = [...category.features];
    
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
  
  // Get selected feature count for a category
  const getSelectedCountForCategory = (categoryId: string) => {
    let count = 0;
    const category = featureCategories.find(c => c.id === categoryId);
    
    if (category) {
      category.features.forEach(feature => {
        if (selectedFeatureIds.includes(feature.id)) {
          count++;
        }
      });
    }
    
    return count;
  };
  
  // Get total time estimate for a category
  const getTotalTimeForCategory = (categoryId: string) => {
    let totalTime = 0;
    const category = featureCategories.find(c => c.id === categoryId);
    
    if (category) {
      category.features.forEach(feature => {
        if (selectedFeatureIds.includes(feature.id)) {
          totalTime += feature.timeEstimate;
        }
      });
    }
    
    return totalTime;
  };
  
  // Calculate total time based on selected features
  const calculateTotalTime = () => {
    const currentTierInfo = tiers.find(t => t.id === currentTier) || tiers[0];
    const baseTime = currentTierInfo.baseTimeEstimate;
    
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
  
  const { baseTime, additionalTime, totalTime } = calculateTotalTime();
  
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
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Check if any features match the current filters
  const hasMatchingFeatures = featureCategories.some(category => 
    getFilteredFeatures(category).length > 0
  );
  
  const currentTierInfo = tiers.find(t => t.id === currentTier) || tiers[0];
  
  return (
    <section id="features-section" className="space-y-6">
      <GradientHeading className="text-2xl font-bold" variant="primary">
        Customize Your Features
      </GradientHeading>
      
      {/* Tier Introduction */}
      <FeatureTierIntro
        currentTier={currentTier}
        tiers={tiers}
        selectedCount={selectedFeatureIds.length}
        totalTimeEstimate={totalTime}
        onTierChange={handleTierChange}
      />
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            }}
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Main content area with categories and features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Category cards for quick navigation */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-white font-medium mb-2">Feature Categories</h3>
          {featureCategories.map(category => (
            <FeatureCategoryCard
              key={category.id}
              category={category}
              active={activeCategory === category.id}
              selectedFeatureCount={getSelectedCountForCategory(category.id)}
              totalTimeEstimate={getTotalTimeForCategory(category.id)}
              onClick={() => handleCategorySelect(category.id)}
            />
          ))}
        </div>
        
        {/* Feature lists */}
        <div className="md:col-span-3">
          {!hasMatchingFeatures ? (
            <div className="bg-black/20 rounded-lg border border-siso-text/10 p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-siso-text/50 mb-2" />
              <h3 className="text-white font-medium mb-1">No matching features</h3>
              <p className="text-sm text-siso-text mb-3">
                Try adjusting your search or filters to see more features
              </p>
              <Button
                variant="outline"
                className="border-siso-text/20"
                onClick={() => {
                  setSearchQuery('');
                  setFilterRecommended(false);
                }}
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedCategories}
              onValueChange={setExpandedCategories}
              className="space-y-3"
            >
              {featureCategories.map(category => {
                const filteredFeatures = getFilteredFeatures(category);
                if (filteredFeatures.length === 0) return null;
                
                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="rounded-lg border border-siso-text/10 bg-black/20 overflow-hidden"
                    id={`category-${category.id}`}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-black/40">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-siso-orange/10 p-1.5">
                          {category.icon}
                        </div>
                        <div>
                          <span className="font-medium text-white">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-black/40">
                              {getSelectedCountForCategory(category.id)} selected
                            </Badge>
                            {getTotalTimeForCategory(category.id) > 0 && (
                              <Badge variant="outline" className="text-xs bg-black/40">
                                +{getTotalTimeForCategory(category.id)} days
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="space-y-2 mt-2">
                        {filteredFeatures.map(feature => (
                          <EnhancedFeatureItem
                            key={feature.id}
                            feature={feature}
                            isSelected={selectedFeatureIds.includes(feature.id)}
                            onToggle={() => handleFeatureToggle(feature.id)}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
      
      {/* Upgrade prompt if needed */}
      <UpgradePrompt
        show={showUpgradePrompt}
        onUpgrade={handleTierChange}
        onDismiss={() => setShowUpgradePrompt(false)}
      />
      
      {/* Sticky summary footer */}
      <FeatureSelectionSummary
        selectedCount={selectedFeatureIds.length}
        maxFeatures={currentTierInfo.maxFeatures}
        totalTime={totalTime}
        baseTime={baseTime}
        additionalTime={additionalTime}
        currentTier={currentTier}
        onContinue={handleContinue}
      />
    </section>
  );
};
