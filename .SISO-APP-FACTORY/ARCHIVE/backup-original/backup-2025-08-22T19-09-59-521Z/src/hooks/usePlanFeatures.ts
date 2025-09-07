
import { useState, useMemo } from 'react';
import { featureCategories } from '@/data/plan/featureData';
import { FeatureItem } from '@/models/plan/features';

export function usePlanFeatures() {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('mvp');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  // Toggle feature selection
  const handleFeatureToggle = (featureId: string) => {
    const newSelectedFeatures = [...selectedFeatureIds];
    const featureIndex = newSelectedFeatures.indexOf(featureId);
    
    if (featureIndex === -1) {
      // Adding a new feature
      if (currentTier === 'mvp' && newSelectedFeatures.length >= 10) {
        setShowUpgradePrompt(true);
        return;
      }
      
      newSelectedFeatures.push(featureId);
    } else {
      // Removing a feature
      newSelectedFeatures.splice(featureIndex, 1);
    }
    
    setSelectedFeatureIds(newSelectedFeatures);
  };
  
  // Handle tier change
  const handleTierChange = (tier: string) => {
    setCurrentTier(tier);
    setShowUpgradePrompt(false);
  };
  
  // Calculate total time based on selected features
  const timeCalculation = useMemo(() => {
    let baseDays = 90;
    
    if (currentTier === 'advanced') baseDays = 60;
    if (currentTier === 'premium') baseDays = 21;
    
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
    
    const totalDays = baseDays + Math.floor(additionalTime);
    const additionalHours = (additionalTime % 1) * 24;
    
    return { baseDays, additionalTime, totalDays, additionalHours };
  }, [selectedFeatureIds, currentTier]);
  
  // Get selected feature names for display
  const selectedFeatureNames = useMemo(() => {
    return selectedFeatureIds.map(id => {
      for (const category of featureCategories) {
        const feature = category.features.find(f => f.id === id);
        if (feature) return feature.name;
      }
      return '';
    }).filter(Boolean);
  }, [selectedFeatureIds]);
  
  // Filter features based on search query
  const getFilteredFeatures = (category: any) => {
    return category.features.filter((feature: FeatureItem) => 
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  return {
    selectedFeatureIds,
    currentTier,
    searchQuery,
    selectedCategory,
    showUpgradePrompt,
    timeCalculation,
    selectedFeatureNames,
    setSearchQuery,
    setSelectedCategory,
    handleFeatureToggle,
    handleTierChange,
    setShowUpgradePrompt,
    getFilteredFeatures
  };
}
