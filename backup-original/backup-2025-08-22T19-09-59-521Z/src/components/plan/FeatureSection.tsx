
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Button } from '@/components/ui/button';
import { 
  featureCategories, 
  modelFacingCategories, 
  agencyFacingCategories, 
  sharedFeatureCategories 
} from '@/data/plan/featureData';
import { ClickThroughFeatureSelection } from './ClickThroughFeatureSelection';
import { RecommendedPackage } from './RecommendedPackage';
import { UpsellSection } from './UpsellSection';
import { useRecommendedPackage } from '@/hooks/useRecommendedPackage';
import { UserFacingFeatures } from './UserFacingFeatures';

interface FeatureSectionProps {
  onFinalizeFeatures: (selectedFeatures: string[]) => void;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  onFinalizeFeatures
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [showFeatureOverview, setShowFeatureOverview] = useState(true);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recommendedPackage = useRecommendedPackage();
  
  const handleSelectRecommended = () => {
    const ids = recommendedPackage.selectRecommended();
    setSelectedFeatureIds(ids);
    onFinalizeFeatures(recommendedPackage.allFeatureNames);
  };
  
  const handleCustomize = () => {
    recommendedPackage.customizeFeatures();
    setShowFeatureOverview(false);
    setShowCustomization(true);
  };
  
  const handleFinalizeCustomFeatures = (selectedFeatures: string[]) => {
    onFinalizeFeatures(selectedFeatures);
  };
  
  const handleAddUpsellFeature = (featureId: string) => {
    // Add to selected features
    if (!selectedFeatureIds.includes(featureId)) {
      const newSelectedFeatures = [...selectedFeatureIds, featureId];
      setSelectedFeatureIds(newSelectedFeatures);
      
      // Find feature name
      let featureName = '';
      for (const category of featureCategories) {
        const feature = category.features.find(f => f.id === featureId);
        if (feature) {
          featureName = feature.name;
          break;
        }
      }
      
      // Add to recommended features list
      recommendedPackage.addUpsellFeature(featureId);
      
      // Update finalized features
      onFinalizeFeatures([...recommendedPackage.allFeatureNames, featureName]);
    }
  };
  
  const handleSubmitFeatures = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      // Auto-select recommended if no custom features were chosen
      if (!recommendedPackage.isRecommendedSelected && !showCustomization) {
        handleSelectRecommended();
      }
    }, 1000);
  };
  
  const handleSelectFeaturesFromOverview = (selectedFeatures: string[]) => {
    // Mark as recommended selected
    recommendedPackage.selectRecommended();
    // Finalize features
    onFinalizeFeatures(selectedFeatures);
  };
  
  // Auto-select recommended package on first load
  React.useEffect(() => {
    if (!recommendedPackage.isRecommendedSelected && selectedFeatureIds.length === 0) {
      handleSelectRecommended();
    }
  }, []);
  
  return (
    <motion.section 
      id="features-section" 
      className="space-y-6 pt-6 pb-48" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
    >
      <GradientHeading className="text-2xl font-bold" variant="primary">
        Your Agency Platform Features
      </GradientHeading>
      
      <p className="text-siso-text max-w-3xl">
        Our OnlyFans agency platform includes separate interfaces for models and agency staff, ensuring everyone has exactly what they need. The MVP tier includes essential features to get you started immediately.
      </p>
      
      {showFeatureOverview && (
        <UserFacingFeatures
          modelFacingCategories={modelFacingCategories}
          agencyFacingCategories={agencyFacingCategories}
          sharedFeatureCategories={sharedFeatureCategories}
          onFeatureSelect={handleSelectFeaturesFromOverview}
          onCustomize={handleCustomize}
        />
      )}
      
      {!showFeatureOverview && !showCustomization && (
        <RecommendedPackage 
          onSelectRecommended={handleSelectRecommended}
          onCustomize={handleCustomize}
        />
      )}
      
      {showCustomization ? (
        <ClickThroughFeatureSelection 
          featureCategories={featureCategories}
          onFinalizeFeatures={handleFinalizeCustomFeatures}
        />
      ) : recommendedPackage.isRecommendedSelected && !showFeatureOverview && (
        <UpsellSection 
          selectedFeatureIds={selectedFeatureIds}
          onAddFeature={handleAddUpsellFeature}
        />
      )}
      
      {recommendedPackage.isRecommendedSelected && !showCustomization && !showFeatureOverview && (
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmitFeatures}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Features
              </>
            )}
          </Button>
        </div>
      )}
    </motion.section>
  );
};
