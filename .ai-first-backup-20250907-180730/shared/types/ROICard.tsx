
import React from 'react';
import { TrendingUp, BarChart, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ROICardProps {
  feature: string;
  metrics: {
    timeReduction?: string;
    revenueIncrease?: string;
    clientRetention?: string;
    efficiency?: string;
  }
}

export const ROICard = ({ feature, metrics }: ROICardProps) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-siso-orange/20 bg-siso-orange/5 p-4 mb-4"
    >
      <h3 className="text-white font-medium mb-3 flex items-center">
        <TrendingUp className="h-4 w-4 mr-2 text-siso-orange" />
        Business Impact: {feature}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.timeReduction && (
          <motion.div variants={itemVariants} className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-siso-orange shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Time Reduction</p>
              <p className="text-xs text-siso-text">{metrics.timeReduction}</p>
            </div>
          </motion.div>
        )}
        
        {metrics.revenueIncrease && (
          <motion.div variants={itemVariants} className="flex items-start gap-2">
            <BarChart className="h-4 w-4 text-siso-orange shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Revenue Impact</p>
              <p className="text-xs text-siso-text">{metrics.revenueIncrease}</p>
            </div>
          </motion.div>
        )}
        
        {metrics.clientRetention && (
          <motion.div variants={itemVariants} className="flex items-start gap-2">
            <Users className="h-4 w-4 text-siso-orange shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Client Retention</p>
              <p className="text-xs text-siso-text">{metrics.clientRetention}</p>
            </div>
          </motion.div>
        )}
        
        {metrics.efficiency && (
          <motion.div variants={itemVariants} className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-siso-orange shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Efficiency</p>
              <p className="text-xs text-siso-text">{metrics.efficiency}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
