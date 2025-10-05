
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, MessageSquare } from 'lucide-react';
import { UpsellFeatureCard } from './UpsellFeatureCard';
import { featureCategories } from '@/data/plan/featureData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UPSELL_FEATURE_IDS } from '@/hooks/useRecommendedPackage';

interface UpsellSectionProps {
  selectedFeatureIds: string[];
  onAddFeature: (id: string) => void;
}

export function UpsellSection({ selectedFeatureIds, onAddFeature }: UpsellSectionProps) {
  const [customFeature, setCustomFeature] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  
  const getUpsellFeatures = () => {
    const upsellFeatures = [];
    
    for (const featureId of UPSELL_FEATURE_IDS) {
      for (const category of featureCategories) {
        const feature = category.features.find(f => f.id === featureId);
        if (feature) {
          upsellFeatures.push({
            ...feature,
            categoryName: category.name
          });
          break;
        }
      }
    }
    
    return upsellFeatures;
  };
  
  const upsellFeatures = getUpsellFeatures();
  
  const handleRequestCall = () => {
    alert("Thank you! Our team will contact you soon to discuss your custom feature.");
    setCustomFeature('');
    setShowCustomInput(false);
  };
  
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 border-t border-siso-text/10 pt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-siso-orange" />
        <h3 className="text-lg font-semibold text-white">Enhance Your Platform</h3>
      </div>
      
      <div className="bg-gradient-to-br from-black/40 to-black/20 border border-siso-orange/20 rounded-lg p-5 mb-6">
        <h4 className="text-white font-medium mb-2">Your MVP Package Includes:</h4>
        <p className="text-siso-text mb-4">
          Essential features to get your agency platform running, completely free.
          Upgrade with premium add-ons below to maximize your platform's capabilities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-siso-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            </div>
            <span className="text-siso-text">Client profiles & management</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-siso-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            </div>
            <span className="text-siso-text">Content calendar & scheduling</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-siso-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            </div>
            <span className="text-siso-text">Basic performance analytics</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-siso-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            </div>
            <span className="text-siso-text">Creator to-do lists & tasks</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-siso-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            </div>
            <span className="text-siso-text">Agency dashboard</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-siso-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2.5 w-2.5 rounded-full bg-siso-orange"></div>
            </div>
            <span className="text-siso-text">Basic notification system</span>
          </div>
        </div>
      </div>
      
      <h4 className="text-white font-medium mb-3">Recommended Premium Add-ons:</h4>
      <p className="text-siso-text mb-4">
        Enhance your agency platform with these premium features for better performance and client satisfaction.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {upsellFeatures.map(feature => (
          <UpsellFeatureCard
            key={feature.id}
            id={feature.id}
            name={feature.name}
            description={feature.description}
            category={feature.categoryName}
            onAdd={onAddFeature}
            isAdded={selectedFeatureIds.includes(feature.id)}
          />
        ))}
      </div>
      
      {!showCustomInput ? (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCustomInput(true)}
            variant="outline"
            className="border-siso-text/20 hover:bg-black/40 group"
          >
            Need a custom feature?
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-black/20 border border-siso-text/10 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-siso-orange" />
            <h4 className="text-white font-medium">Request Custom Feature</h4>
          </div>
          
          <Textarea
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            placeholder="Describe your custom feature requirement here..."
            className="mb-3 bg-black/30 border-siso-text/20"
          />
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCustomInput(false)} 
              className="border-siso-text/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestCall}
              className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            >
              Request a Call
            </Button>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
