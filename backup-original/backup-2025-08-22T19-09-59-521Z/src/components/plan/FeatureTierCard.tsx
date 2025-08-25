
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureTierCardProps {
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  icon: React.ReactNode;
  isRecommended?: boolean;
  onClick: () => void;
}

export const FeatureTierCard = ({
  name,
  price,
  features,
  isActive,
  icon,
  isRecommended = false,
  onClick
}: FeatureTierCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={cn(
        "rounded-lg border p-4 cursor-pointer transition-all duration-200",
        isActive 
          ? "border-siso-orange/30 bg-siso-orange/5" 
          : "border-siso-text/5 bg-black/20 hover:bg-black/30"
      )}
    >
      {isRecommended && (
        <div className="mb-3 -mt-1 flex justify-center">
          <span className="px-2 py-0.5 bg-siso-orange text-white text-xs font-medium rounded-full flex items-center">
            <Star className="h-3 w-3 mr-1" /> Recommended
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "p-2 rounded-full",
          isActive ? "bg-siso-orange/20" : "bg-siso-text/10"
        )}>
          {icon}
        </div>
        <h3 className="font-semibold text-white">{name}</h3>
      </div>
      
      <div className="mb-4">
        <span className="text-2xl font-bold text-siso-orange">£{price}</span>
      </div>
      
      <ul className="space-y-2 text-sm">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className={cn(
              "h-3.5 w-3.5 mr-2 shrink-0 mt-0.5",
              isActive ? "text-siso-orange" : "text-siso-text/50"
            )} />
            <span className="text-siso-text">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
