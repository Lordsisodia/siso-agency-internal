
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Gauge, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanReviewSummaryProps {
  selectedFeatures: string[];
  timeline: number;
  totalCost: number;
  onApprove: () => void;
  isSubmitting: boolean;
}

export const PlanReviewSummary: React.FC<PlanReviewSummaryProps> = ({
  selectedFeatures,
  timeline,
  totalCost,
  onApprove,
  isSubmitting
}) => {
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Separate regular features from custom features
  const customFeatures = selectedFeatures.filter(feature => feature.startsWith('Custom:'));
  const standardFeatures = selectedFeatures.filter(feature => !feature.startsWith('Custom:'));

  return (
    <div className="bg-black/30 border border-siso-text/10 rounded-lg p-6 backdrop-blur-md">
      <h3 className="text-xl font-bold text-white mb-4">Your Plan Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/20 border border-siso-text/10 rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-5 w-5 text-siso-orange" />
            <h4 className="text-lg font-semibold text-white">Selected Features</h4>
          </div>
          <p className="text-3xl font-bold text-siso-orange">{selectedFeatures.length}</p>
          <p className="text-sm text-siso-text mt-1">Features included in your plan</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/20 border border-siso-text/10 rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-siso-orange" />
            <h4 className="text-lg font-semibold text-white">Timeline</h4>
          </div>
          <p className="text-3xl font-bold text-siso-orange">{timeline} days</p>
          <p className="text-sm text-siso-text mt-1">Time to launch your platform</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/20 border border-siso-text/10 rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-siso-orange" />
            <h4 className="text-lg font-semibold text-white">Total Investment</h4>
          </div>
          <p className="text-3xl font-bold text-siso-orange">${totalCost.toLocaleString()}</p>
          <p className="text-sm text-siso-text mt-1">Base price for selected features</p>
        </motion.div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {standardFeatures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/20 border border-siso-text/10 rounded-lg p-4"
          >
            <h4 className="text-lg font-semibold text-white mb-3">Standard Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standardFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-black/20 rounded px-3 py-2">
                  <CheckCircle className="h-4 w-4 text-siso-orange flex-shrink-0" />
                  <span className="text-sm text-siso-text">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {customFeatures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/20 border border-siso-text/10 rounded-lg p-4"
          >
            <h4 className="text-lg font-semibold text-white mb-3">Custom Features</h4>
            <div className="space-y-2">
              {customFeatures.map((feature, index) => (
                <div key={index} className="bg-gradient-to-r from-siso-orange/10 to-siso-red/10 border border-siso-orange/20 rounded px-3 py-2">
                  <span className="text-sm text-white">{feature.replace('Custom: ', '')}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-siso-text mt-3">
              Custom features will be reviewed by our team and may affect final pricing and timeline.
            </p>
          </motion.div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={onApprove}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 px-6"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
