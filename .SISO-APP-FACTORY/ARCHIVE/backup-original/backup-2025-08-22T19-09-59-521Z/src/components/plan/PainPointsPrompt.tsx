
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, MessageSquare, ArrowRight, Award, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PainPointsPromptProps {
  onComplete: () => void;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  currentStep?: number;
  onNextStep?: () => void;
}

interface PainPoint {
  text: string;
  solution: string;
  icon: React.ReactNode;
  buttonText: string;
  benefits: string[];
}

export const PainPointsPrompt = ({ 
  onComplete, 
  autoAdvance = true, // Default to auto-advance
  autoAdvanceDelay = 4000, // Default delay of 4 seconds
  currentStep = 0,
  onNextStep
}: PainPointsPromptProps) => {
  const [animatingBenefits, setAnimatingBenefits] = useState(false);
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const painPoints: PainPoint[] = [
    {
      text: "Agency struggle with creator retention?",
      solution: "Boost retention by 60% with our platform",
      icon: <Users className="h-12 w-12 text-siso-orange" />,
      buttonText: "Tell me more",
      benefits: [
        "Transparent reporting to build trust",
        "Automated check-ins to maintain engagement",
        "Clear ROI metrics for creators to see value",
        "Customized dashboards for each creator"
      ]
    },
    {
      text: "Disorganized content workflows?",
      solution: "Save 15+ hours weekly with streamlined management",
      icon: <Calendar className="h-12 w-12 text-siso-orange" />,
      buttonText: "Show me how",
      benefits: [
        "Centralized content library with search",
        "Automated scheduling across platforms",
        "Content performance analytics",
        "Team collaboration tools"
      ]
    },
    {
      text: "Communication delays with clients?",
      solution: "Cut response times by 50% with unified messaging",
      icon: <MessageSquare className="h-12 w-12 text-siso-orange" />,
      buttonText: "See the Solution",
      benefits: [
        "Unified inbox for all client communications",
        "Automated responses for common questions",
        "Priority notifications for urgent messages",
        "Message templates for consistent communication"
      ]
    }
  ];
  
  // Handle auto-advancement
  useEffect(() => {
    if (autoAdvance) {
      // Clear any existing timer when component updates
      if (autoProgressTimer) {
        clearTimeout(autoProgressTimer);
      }
      
      // Set timer for auto-advancement
      const timer = setTimeout(() => {
        if (animatingBenefits) {
          // If showing benefits, go to next step
          setAnimatingBenefits(false);
          if (onNextStep) {
            onNextStep();
          } else if (currentStep < painPoints.length - 1) {
            // This is a fallback if onNextStep isn't provided
          } else {
            onComplete();
          }
        } else {
          // If showing main card, show benefits
          setAnimatingBenefits(true);
          
          // Set another timer to automatically progress to next step
          const benefitsTimer = setTimeout(() => {
            setAnimatingBenefits(false);
            if (onNextStep) {
              onNextStep();
            } else if (currentStep < painPoints.length - 1) {
              // This is a fallback if onNextStep isn't provided
            } else {
              onComplete();
            }
          }, autoAdvanceDelay);
          
          setAutoProgressTimer(benefitsTimer);
        }
      }, autoAdvanceDelay);
      
      setAutoProgressTimer(timer);
      
      return () => {
        if (autoProgressTimer) clearTimeout(autoProgressTimer);
        if (timer) clearTimeout(timer);
      };
    }
  }, [currentStep, autoAdvance, autoAdvanceDelay, animatingBenefits, onNextStep, painPoints.length, onComplete]);
  
  const handleNext = () => {
    // Clear any auto-progress timers when manually advancing
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer);
      setAutoProgressTimer(null);
    }
    
    if (animatingBenefits) {
      setAnimatingBenefits(false);
      if (onNextStep) {
        onNextStep();
      } else {
        // This is a fallback if onNextStep isn't provided
      }
    } else {
      setAnimatingBenefits(true);
    }
  };
  
  const currentPoint = painPoints[currentStep];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-xl w-full bg-black/40 border border-siso-orange/20 rounded-lg p-8 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${animatingBenefits ? 'benefits' : 'main'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {!animatingBenefits ? (
            <>
              <div className="flex justify-center mb-6">
                <motion.div
                  className="p-4 bg-siso-orange/10 rounded-full"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                >
                  {currentPoint.icon}
                </motion.div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentPoint.text}
              </h2>
              <p className="text-lg text-siso-text mb-8">
                {currentPoint.solution}
              </p>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white min-w-[120px]"
                >
                  {currentPoint.buttonText}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-siso-orange/10 rounded-full">
                  <Award className="h-12 w-12 text-siso-orange" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Key Benefits
              </h2>
              
              <div className="space-y-3 mb-6 text-left">
                {currentPoint.benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
                    <span className="text-siso-text">{benefit}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white min-w-[120px]"
                >
                  {currentStep < painPoints.length - 1 ? 'Next Pain Point' : 'See Your Custom Plan'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          
          <div className="flex justify-center mt-6 gap-2">
            {painPoints.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-siso-orange' : 'bg-siso-text/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
