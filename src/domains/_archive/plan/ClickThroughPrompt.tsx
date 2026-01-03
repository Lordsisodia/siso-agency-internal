
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ClickThroughPromptProps {
  agencyName: string;
  onContinue: () => void;
}

export const ClickThroughPrompt = ({ agencyName, onContinue }: ClickThroughPromptProps) => {
  const welcomeTextRef = useRef<HTMLSpanElement>(null);
  
  // Typewriter effect for the agency name
  useEffect(() => {
    if (welcomeTextRef.current) {
      const text = agencyName;
      let i = 0;
      // Speed up the typewriter effect
      const interval = setInterval(() => {
        if (i <= text.length) {
          welcomeTextRef.current!.innerText = text.substring(0, i);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50); // Reduced from 100ms to 50ms
      
      return () => clearInterval(interval);
    }
  }, [agencyName]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-xl w-full z-10"
    >
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 border border-siso-orange/20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <Sparkles className="h-16 w-16 text-siso-orange mx-auto mb-4" />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome, <span ref={welcomeTextRef} className="text-siso-orange"></span>!
        </h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-siso-text mx-auto mt-3 text-lg mb-6 space-y-4"
        >
          <p>Ready to transform your OnlyFans management?</p>
          
          <div className="bg-black/30 p-4 rounded-lg border border-siso-orange/10 text-left">
            <h3 className="text-white text-lg font-semibold mb-2">Your plan includes:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-siso-orange"></div>
                <span>Complete creator management system</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-siso-orange"></div>
                <span>Automated content scheduling</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-siso-orange"></div>
                <span>Unified messaging platform</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-siso-orange"></div>
                <span>Real-time analytics dashboard</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <Button 
            onClick={onContinue}
            className="px-8 py-6 text-lg bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white"
          >
            View Your Plan
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
