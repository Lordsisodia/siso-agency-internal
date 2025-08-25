
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, ChevronRight, Phone } from 'lucide-react';
import { ButtonCta } from '@/components/ui/button-shiny';
import { Button } from '@/components/ui/button';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useNavigate } from 'react-router-dom';

interface EnhancedNextStepsProps {
  showFeatureSelection: boolean;
  onShowFeatures: () => void;
}

export const EnhancedNextSteps: React.FC<EnhancedNextStepsProps> = ({
  showFeatureSelection,
  onShowFeatures
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleSubmitPlan = () => {
    navigate('/onboarding/social');
  };

  return (
    <motion.section 
      className="space-y-6 mx-auto max-w-5xl px-4 pb-6 pt-10 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GradientHeading 
        className="text-2xl font-bold" 
        variant="primary"
      >
        Next Steps
      </GradientHeading>
      
      <motion.div 
        className="bg-gradient-to-r from-siso-red/30 to-siso-orange/30 rounded-xl p-6 border border-siso-orange/20 shadow-lg backdrop-blur-sm"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-siso-red to-siso-orange p-2.5 rounded-full">
            <Send className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Ready to get your custom OnlyFans platform?
          </h3>
        </div>
        
        <p className="text-siso-text mb-6 max-w-3xl">
          {!showFeatureSelection ? 
            "Select your desired features to create a customized plan for your OnlyFans agency. After submitting, we'll collect your contact details to keep you updated on your MVP progress." :
            "Submit your MVP plan to get started! We'll collect your WhatsApp number and social details, then you can create an account to monitor your app's progress through our client dashboard."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {!showFeatureSelection ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RainbowButton
                onClick={onShowFeatures}
                className="w-full sm:w-auto text-base font-medium"
              >
                Customize Your Features
                <ChevronRight className="ml-2 h-4 w-4" />
              </RainbowButton>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ButtonCta
                label="Submit MVP Plan"
                className="w-full sm:w-auto"
                onClick={handleSubmitPlan}
              />
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Button 
              variant="outline"
              className="w-full sm:w-auto relative overflow-hidden group border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
              onClick={() => window.open('tel:+18889991234', '_blank')}
            >
              <span className="relative z-10 flex items-center">
                Call For Assistance
                <Phone className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              
              {/* Button shine effect */}
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: isHovered ? '100%' : '-100%' }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </Button>
          </motion.div>
        </div>
        
        <div className="mt-6 pt-5 border-t border-siso-text/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-siso-orange" />
            <span className="text-sm text-siso-text">Your MVP will be ready in under 5 days</span>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
