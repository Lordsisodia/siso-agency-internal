import { Bot, Rocket, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Feature } from './types';
import { cn } from '@/lib/utils';

const featureItems: Feature[] = [
  {
    icon: Bot,
    title: "AI-Powered Research",
    description: "Get instant insights and answers powered by advanced AI technology"
  },
  {
    icon: Rocket,
    title: "Resource Hub Access",
    description: "Access comprehensive resources and documentation"
  },
  {
    icon: Users,
    title: "Social Integration",
    description: "Connect and collaborate with the SISO community"
  },
  {
    icon: Zap,
    title: "Automated Tools",
    description: "Streamline your workflow with automated solutions"
  }
];

export const FeatureGrid = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl px-4 sm:px-6"
      role="region"
      aria-label="Feature Overview"
    >
      {featureItems.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          className={cn(
            "group relative overflow-hidden rounded-lg",
            "bg-black/20 border border-siso-text/10",
            "p-4 sm:p-6",
            "hover:bg-black/30 hover:border-siso-orange/30",
            "transition-all duration-300",
            "focus-within:ring-2 focus-within:ring-siso-orange/50",
            "touch-pan-y"
          )}
          tabIndex={0}
          role="article"
          aria-labelledby={`feature-title-${index}`}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br from-siso-red/5 to-siso-orange/5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" 
          />
          <div className="relative z-10">
            <feature.icon 
              className="w-6 h-6 sm:w-8 sm:h-8 text-siso-orange mb-3 sm:mb-4" 
              aria-hidden="true"
            />
            <h3 
              id={`feature-title-${index}`}
              className="text-base sm:text-lg font-semibold text-siso-text-bold mb-1 sm:mb-2"
            >
              {feature.title}
            </h3>
            <p className="text-sm text-siso-text/80 line-clamp-3">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};