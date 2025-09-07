
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Clock } from 'lucide-react';

interface ImpactMetric {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

interface BusinessImpactCardProps {
  title: string;
  metrics: ImpactMetric[];
}

export const BusinessImpactCard = ({ title, metrics }: BusinessImpactCardProps) => {
  return (
    <div className="rounded-lg border border-siso-text/10 bg-black/20 p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-siso-orange" />
        {title}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg border border-siso-text/5 bg-black/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-siso-orange/10">
                {metric.icon}
              </div>
              <h4 className="font-medium text-white">{metric.title}</h4>
            </div>
            <div className="text-xl font-bold text-siso-orange mb-1">{metric.value}</div>
            <p className="text-sm text-siso-text">{metric.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
