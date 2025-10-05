
import { useState, useCallback, useEffect, useRef } from 'react';
import { FeatureCategory } from '@/models/plan/features';

export interface CustomFeature {
  name: string;
  description: string;
}

export function useFeatureSelection(
  modelFacingCategories: FeatureCategory[],
  agencyFacingCategories: FeatureCategory[],
  sharedFeatureCategories: FeatureCategory[]
) {
  // Add a mounted ref to track component lifecycle
  const isMounted = useRef(true);
  
  // State for selected features
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // State for custom features
  const [customFeaturesList, setCustomFeaturesList] = useState<CustomFeature[]>([]);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Safe state setter functions
  const safeSetSelectedFeatures = useCallback((value: string[] | ((prev: string[]) => string[])) => {
    if (isMounted.current) {
      setSelectedFeatures(value);
    }
  }, []);
  
  const safeSetCustomFeaturesList = useCallback((value: CustomFeature[] | ((prev: CustomFeature[]) => CustomFeature[])) => {
    if (isMounted.current) {
      setCustomFeaturesList(value);
    }
  }, []);
  
  // Function to select recommended features
  const handleSelectRecommended = useCallback(() => {
    const recommendedFeatures: string[] = [];
    
    // Collect all recommended features
    const allCategories = [
      ...modelFacingCategories, 
      ...agencyFacingCategories, 
      ...sharedFeatureCategories
    ];
    
    allCategories.forEach(category => {
      category.features.forEach(feature => {
        if (feature.recommended) {
          recommendedFeatures.push(feature.name);
        }
      });
    });
    
    safeSetSelectedFeatures(recommendedFeatures);
    return recommendedFeatures;
  }, [modelFacingCategories, agencyFacingCategories, sharedFeatureCategories, safeSetSelectedFeatures]);

  // Function to toggle a single feature by name
  const toggleFeature = useCallback((featureName: string) => {
    safeSetSelectedFeatures(prev => 
      prev.includes(featureName)
        ? prev.filter(f => f !== featureName)
        : [...prev, featureName]
    );
  }, [safeSetSelectedFeatures]);
  
  // Add a custom feature
  const addCustomFeature = useCallback((name: string, description: string) => {
    safeSetCustomFeaturesList(prev => [...prev, { name, description }]);
    safeSetSelectedFeatures(prev => [...prev, `Custom: ${name}`]);
  }, [safeSetCustomFeaturesList, safeSetSelectedFeatures]);
  
  // Remove a custom feature
  const removeCustomFeature = useCallback((index: number) => {
    const featureToRemove = customFeaturesList[index];
    safeSetCustomFeaturesList(prev => prev.filter((_, i) => i !== index));
    safeSetSelectedFeatures(prev => prev.filter(f => f !== `Custom: ${featureToRemove.name}`));
  }, [customFeaturesList, safeSetCustomFeaturesList, safeSetSelectedFeatures]);
  
  // Find a feature by name in all categories
  const findFeatureById = useCallback((featureId: string) => {
    const allCategories = [
      ...modelFacingCategories, 
      ...agencyFacingCategories, 
      ...sharedFeatureCategories
    ];
    
    for (const category of allCategories) {
      const feature = category.features.find(f => f.id === featureId);
      if (feature) return feature;
    }
    return null;
  }, [modelFacingCategories, agencyFacingCategories, sharedFeatureCategories]);
  
  // Find a feature by name in all categories
  const findFeatureByName = useCallback((featureName: string) => {
    const allCategories = [
      ...modelFacingCategories, 
      ...agencyFacingCategories, 
      ...sharedFeatureCategories
    ];
    
    for (const category of allCategories) {
      const feature = category.features.find(f => f.name === featureName);
      if (feature) return feature;
    }
    return null;
  }, [modelFacingCategories, agencyFacingCategories, sharedFeatureCategories]);
  
  return {
    selectedFeatures,
    setSelectedFeatures: safeSetSelectedFeatures,
    handleSelectRecommended,
    toggleFeature,
    findFeatureById,
    findFeatureByName,
    customFeaturesList,
    addCustomFeature,
    removeCustomFeature
  };
}
