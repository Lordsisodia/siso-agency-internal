import React, { useState, useEffect } from 'react';
import { Users, Building, CheckCircle, ArrowRight, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FeatureCategory } from '@/models/plan/features';
import { FeatureCategoryCard } from './features/FeatureCategoryCard';
import { FeatureDetailDialog } from './features/FeatureDetailDialog';
import { FeatureTierBreakdown } from './features/FeatureTierBreakdown';
import { FeatureInstructions } from './features/FeatureInstructions';
import { QuickSummaryFeatures } from './features/QuickSummaryFeatures';
import { CustomFeatureInput } from './features/CustomFeatureInput';
import { useFeatureSelection } from '@/hooks/useFeatureSelection';
import { useFeatureDetail } from '@/hooks/useFeatureDetail';

interface UserFacingFeaturesProps {
  modelFacingCategories: FeatureCategory[];
  agencyFacingCategories: FeatureCategory[];
  sharedFeatureCategories: FeatureCategory[];
  onFeatureSelect: (selectedFeatures: string[]) => void;
  onCustomize: () => void;
}

export const UserFacingFeatures: React.FC<UserFacingFeaturesProps> = ({
  modelFacingCategories,
  agencyFacingCategories,
  sharedFeatureCategories,
  onFeatureSelect,
  onCustomize
}) => {
  const [activeTab, setActiveTab] = useState('both');
  // Use a separate state variable for custom features to avoid conflicts
  const [customFeatures, setCustomFeatures] = useState<Array<{ name: string; description: string }>>([]);
  
  const { 
    selectedFeatures,
    setSelectedFeatures,
    handleSelectRecommended,
    toggleFeature,
    addCustomFeature,
    removeCustomFeature,
    customFeaturesList
  } = useFeatureSelection(
    modelFacingCategories,
    agencyFacingCategories,
    sharedFeatureCategories
  );
  
  const {
    featureDetail,
    isDetailOpen,
    setIsDetailOpen,
    handleShowFeatureDetail,
    handleCloseFeatureDetail
  } = useFeatureDetail();
  
  // Notify parent when selected features change
  useEffect(() => {
    // Only notify if we have selected features
    if (selectedFeatures.length > 0) {
      onFeatureSelect(selectedFeatures);
    }
  }, [selectedFeatures, onFeatureSelect]);
  
  const handleSelectRecommendedAndNotify = () => {
    const features = handleSelectRecommended();
    onFeatureSelect(features);
  };

  const handleFeatureSelect = (featureName: string) => {
    toggleFeature(featureName);
  };
  
  const handleAddCustomFeature = (name: string, description: string) => {
    const newCustomFeatures = [...customFeatures, { name, description }];
    setCustomFeatures(newCustomFeatures);
    addCustomFeature(name, description);
  };
  
  const handleRemoveCustomFeature = (index: number) => {
    const updatedCustomFeatures = [...customFeatures];
    updatedCustomFeatures.splice(index, 1);
    setCustomFeatures(updatedCustomFeatures);
    removeCustomFeature(index);
  };
  
  // The rest of the component remains unchanged
  return (
    <TooltipProvider>
      <div className="space-y-6">
        

        <div className="bg-black/20 backdrop-blur-sm border border-siso-text/10 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Comprehensive Agency Management System</h3>
          
          <p className="text-siso-text mb-6">
            Our platform is organized into model-facing and agency-facing features, ensuring each user gets exactly what they need. 
            The MVP tier includes essential features to get you started immediately.
          </p>

          {/* Quick Summary Features */}
          <QuickSummaryFeatures 
            modelFacingCategories={modelFacingCategories}
            agencyFacingCategories={agencyFacingCategories}
            sharedFeatureCategories={sharedFeatureCategories}
            onFeatureSelect={handleFeatureSelect}
            onSelectAll={handleSelectRecommendedAndNotify}
          />
          
          {/* Tab selection for user-facing perspective */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-black/30 border border-siso-text/10">
              <TabsTrigger value="both" className="data-[state=active]:bg-siso-orange data-[state=active]:text-white">
                All Features
              </TabsTrigger>
              <TabsTrigger value="model" className="data-[state=active]:bg-siso-orange data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Model-Facing
              </TabsTrigger>
              <TabsTrigger value="agency" className="data-[state=active]:bg-siso-orange data-[state=active]:text-white">
                <Building className="h-4 w-4 mr-2" />
                Agency-Facing
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-siso-orange data-[state=active]:text-white">
                <Edit className="h-4 w-4 mr-2" />
                Custom Features
              </TabsTrigger>
            </TabsList>
          
            
            <TabsContent value="both" className="mt-4">
              {/* Modified layout: 2 columns instead of 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {/* Model Features Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-siso-orange/20">
                      <Users className="h-5 w-5 text-siso-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Model-Facing Features</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {modelFacingCategories.map((category) => (
                      <FeatureCategoryCard 
                        key={category.id} 
                        category={category}
                        onShowDetail={(feature) => handleShowFeatureDetail(feature, category.name)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Agency Features Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-siso-orange/20">
                      <Building className="h-5 w-5 text-siso-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Agency-Facing Features</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {agencyFacingCategories.map((category) => (
                      <FeatureCategoryCard 
                        key={category.id} 
                        category={category}
                        onShowDetail={(feature) => handleShowFeatureDetail(feature, category.name)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Shared Features */}
              {sharedFeatureCategories.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Shared Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {sharedFeatureCategories.map((category) => (
                      <FeatureCategoryCard 
                        key={category.id} 
                        category={category}
                        onShowDetail={(feature) => handleShowFeatureDetail(feature, category.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="model" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {modelFacingCategories.map((category) => (
                  <FeatureCategoryCard 
                    key={category.id} 
                    category={category}
                    onShowDetail={(feature) => handleShowFeatureDetail(feature, category.name)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="agency" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {agencyFacingCategories.map((category) => (
                  <FeatureCategoryCard 
                    key={category.id} 
                    category={category}
                    onShowDetail={(feature) => handleShowFeatureDetail(feature, category.name)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <CustomFeatureInput 
                    onAddFeature={handleAddCustomFeature}
                    onRemoveFeature={handleRemoveCustomFeature}
                    customFeatures={customFeatures}
                  />
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-black/20 rounded-lg border border-siso-text/10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-siso-orange/20">
                      <Plus className="h-5 w-5 text-siso-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Why Add Custom Features?</h3>
                  </div>
                  
                  <div className="space-y-4 text-siso-text">
                    <p>
                      Need something specific for your business that isn't in our standard features? 
                      Add it here and our team will evaluate if it can be included in your platform.
                    </p>
                    
                    <div className="bg-black/30 rounded-lg p-3 border border-siso-text/10">
                      <h4 className="text-white font-medium mb-2">What happens next?</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>We'll review each custom feature request</li>
                        <li>Our team will reach out to discuss implementation details</li>
                        <li>We'll provide a timeline and cost estimate if needed</li>
                        <li>Approved features will be added to your implementation plan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Feature tier breakdown */}
          <FeatureTierBreakdown
            modelFacingCategories={modelFacingCategories}
            agencyFacingCategories={agencyFacingCategories}
            sharedFeatureCategories={sharedFeatureCategories}
          />
          
          {/* Role-based access explanation */}
          <FeatureInstructions />
          
          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCustomize}
              className="border-siso-text/20"
            >
              Customize Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSelectRecommendedAndNotify}
              className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            >
              Select Recommended Features
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Feature Detail Modal */}
        <FeatureDetailDialog
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          featureDetail={featureDetail}
        />
      </div>
    </TooltipProvider>
  );
};
