
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import '@/components/ui/animations.css';

interface WelcomeLoaderProps {
  progress: number;
  complete: boolean;
  steps: string[];
  onContinue: () => void;
}

export const WelcomeLoader = ({ 
  progress, 
  complete, 
  steps,
  onContinue
}: WelcomeLoaderProps) => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Enhanced pulse animation for progress indicator
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div 
      className="max-w-md w-full bg-black/40 border border-siso-text/10 rounded-lg p-6 backdrop-blur-sm shine-effect"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="mx-auto mb-3"
          animate={{ 
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 1 
          }}
        >
          <Sparkles className="h-12 w-12 text-siso-orange float-animation" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Preparing Your Custom Plan
        </h2>
        <p className="text-siso-text text-sm">
          We're finalizing your custom OnlyFans Management Suite
        </p>
      </motion.div>
      
      <motion.div 
        className="mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-siso-text">Loading your plan</span>
          <motion.span 
            className="text-sm text-siso-orange" 
            animate={complete ? {} : pulseAnimation}
          >
            {complete ? 'Ready!' : `${progress}%`}
          </motion.span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 bg-black/30" 
          indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange gradient-bg glow-effect" 
        />
      </motion.div>
      
      <motion.div 
        className="space-y-3 mb-6 stagger-children"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, index) => (
          <motion.div 
            key={index} 
            className="flex items-center gap-3"
            variants={itemVariants}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
              progress >= (index + 1) * 33 ? 'bg-siso-orange/20' : 'bg-siso-text/5'
            }`}>
              {progress >= (index + 1) * 33 ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <CheckCircle className="h-4 w-4 text-siso-orange" />
                </motion.div>
              ) : progress >= index * 33 ? (
                <Loader2 className="h-4 w-4 text-siso-orange animate-spin" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-siso-text/20" />
              )}
            </div>
            <p className={`text-sm transition-colors duration-300 ${
              progress >= (index + 1) * 33 ? 'text-siso-text' : 'text-siso-text/50'
            }`}>
              {step}
            </p>
          </motion.div>
        ))}
      </motion.div>
      
      {complete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="button-3d"
        >
          <Button 
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white shine-effect"
          >
            View Your Personalized Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
