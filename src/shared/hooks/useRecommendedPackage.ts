
import { useState, useEffect } from 'react';
import { featureCategories } from '@/data/plan/featureData';

// MVP Package - Free tier with essential features
export const RECOMMENDED_FEATURE_IDS = [
  // Client Management Features
  'client-profiles',
  'performance-dashboard', 
  'earnings-tracking',
  'subscriber-tracking',
  
  // Content Management Features
  'content-calendar', 
  'media-library',
  'content-approval',
  
  // Communication Features
  'in-app-messaging',
  'notification-system',
  
  // Analytics Features
  'basic-earnings',
  'subscriber-growth',
  
  // Security Features
  'user-authentication',
  'role-based-access',
  
  // Automation Features
  'automated-reminders',
  'workflow-automation',
];

// Premium add-on features (upsell opportunities)
export const UPSELL_FEATURE_IDS = [
  'advanced-analytics',
  'ai-content-optimization',
  'fan-interaction',
  'real-time-analytics',
  'two-factor',
];

export interface RecommendedPackageState {
  isRecommendedSelected: boolean;
  recommendedFeatureIds: string[];
  upsellFeatureIds: string[];
  allFeatureNames: string[];
}

export const useRecommendedPackage = () => {
  const [state, setState] = useState<RecommendedPackageState>({
    isRecommendedSelected: false,
    recommendedFeatureIds: RECOMMENDED_FEATURE_IDS,
    upsellFeatureIds: UPSELL_FEATURE_IDS,
    allFeatureNames: []
  });
  
  useEffect(() => {
    const getAllFeatureNames = () => {
      const names: string[] = [];
      state.recommendedFeatureIds.forEach(featureId => {
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
    
    setState(prev => ({
      ...prev,
      allFeatureNames: getAllFeatureNames()
    }));
  }, [state.recommendedFeatureIds]);
  
  const selectRecommended = () => {
    setState(prev => ({
      ...prev,
      isRecommendedSelected: true
    }));
    return state.recommendedFeatureIds;
  };
  
  const customizeFeatures = () => {
    setState(prev => ({
      ...prev,
      isRecommendedSelected: false
    }));
    return [];
  };
  
  const addUpsellFeature = (featureId: string) => {
    if (state.recommendedFeatureIds.includes(featureId)) {
      return;
    }
    
    setState(prev => ({
      ...prev,
      recommendedFeatureIds: [...prev.recommendedFeatureIds, featureId]
    }));
  };
  
  return {
    ...state,
    selectRecommended,
    customizeFeatures,
    addUpsellFeature
  };
};
