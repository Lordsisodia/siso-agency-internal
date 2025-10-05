
import React from 'react';
import { motion } from 'framer-motion';
import { Hourglass, CalendarCheck, Video, ArrowRight, MessageSquare, CheckCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImplementationPlanProps {
  onScrollToFeatures: () => void;
}

export const ImplementationPlan: React.FC<ImplementationPlanProps> = ({ 
  onScrollToFeatures 
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="bg-gradient-to-r from-black/80 via-siso-red/10 to-black/80 rounded-lg border border-siso-orange/20 p-6 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-siso-orange/10 rounded-full">
          <Hourglass className="h-6 w-6 text-siso-orange" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-siso-orange to-white bg-clip-text text-transparent">
          Your Implementation Plan
        </h2>
      </motion.div>
      
      <div className="space-y-6">
        {/* Streamlined Timeline */}
        <motion.div variants={item} className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-siso-orange" />
            Rapid Implementation Timeline
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-4 rounded-lg border border-siso-text/10 relative">
              <div className="absolute -top-3 -left-1 bg-siso-orange text-black text-xs font-bold px-2 py-0.5 rounded">
                DAYS 1-2
              </div>
              <h4 className="text-white font-medium mt-2 mb-2">App Blueprint & Setup</h4>
              <ul className="text-sm text-siso-text space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Quick requirements gathering</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Custom MVP blueprint creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Platform foundation setup</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg border border-siso-text/10 relative">
              <div className="absolute -top-3 -left-1 bg-siso-orange text-black text-xs font-bold px-2 py-0.5 rounded">
                DAYS 2-3
              </div>
              <h4 className="text-white font-medium mt-2 mb-2">Collaborative Review</h4>
              <ul className="text-sm text-siso-text space-y-2">
                <li className="flex items-start gap-2">
                  <Video className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>1:1 consultation call</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCcw className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Feature refinement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Final blueprint approval</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg border border-siso-text/10 relative">
              <div className="absolute -top-3 -left-1 bg-siso-orange text-black text-xs font-bold px-2 py-0.5 rounded">
                DAYS 3-5
              </div>
              <h4 className="text-white font-medium mt-2 mb-2">Implementation & Refinement</h4>
              <ul className="text-sm text-siso-text space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Feature implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Platform launch</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                  <span>Quick team onboarding</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-siso-orange/10 p-4 rounded-lg border border-siso-orange/20 text-sm italic text-center">
            <span className="text-white">Our accelerated timeline means you'll have a working platform in under a week!</span>
          </div>
        </motion.div>
        
        {/* Ongoing Support */}
        <motion.div variants={item} className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-siso-orange" />
            Continuous Support
          </h3>
          
          <div className="bg-black/30 p-4 rounded-lg border border-siso-text/10">
            <p className="text-siso-text mb-3">
              After launch, our relationship continues with easy access to support and updates:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                <span className="text-siso-text text-sm">
                  <span className="text-white font-medium">Client Dashboard Access</span><br />
                  Request changes and track progress
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                <span className="text-siso-text text-sm">
                  <span className="text-white font-medium">Weekly Check-ins</span><br />
                  Regular touchpoints during first month
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                <span className="text-siso-text text-sm">
                  <span className="text-white font-medium">Feature Updates</span><br />
                  Continuous platform improvement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-siso-orange mt-0.5 shrink-0" />
                <span className="text-siso-text text-sm">
                  <span className="text-white font-medium">Priority Support</span><br />
                  Fast response for critical issues
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
      
      <motion.div variants={item} className="mt-6">
        <Button 
          onClick={onScrollToFeatures}
          className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
        >
          Explore Platform Features
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
