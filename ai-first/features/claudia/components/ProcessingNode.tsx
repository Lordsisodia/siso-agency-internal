
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingDots } from './ThinkingDots';

interface ProcessingNodeProps {
  icon: typeof Bot;
  label: string;
  isActive: boolean;
  isComplete: boolean;
  size?: 'sm' | 'default';
  thoughts?: string[];
}

export const ProcessingNode = ({ icon: Icon, label, isActive, isComplete, size = 'default', thoughts }: ProcessingNodeProps) => {
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (isActive && thoughts) {
      const interval = setInterval(() => {
        setThoughtIndex((prev) => (prev + 1) % thoughts.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive, thoughts]);

  return (
    <div className={cn(
      "relative flex flex-col items-center text-center group",
      size === 'sm' ? 'gap-3' : 'gap-4'
    )}>
      <motion.div
        initial={false}
        animate={{
          scale: isActive ? 1.1 : 1,
          backgroundColor: isComplete ? 'rgb(var(--siso-orange))' : isActive ? 'rgb(var(--siso-red))' : 'rgb(var(--siso-text) / 0.1)',
        }}
        className={cn(
          "relative flex items-center justify-center rounded-full bg-siso-text/10 z-10 transition-shadow duration-500",
          size === 'sm' ? 'w-20 h-20' : 'w-28 h-28',
          isActive && "shadow-lg shadow-siso-orange/30",
          isComplete && "shadow-md shadow-siso-orange/20",
          "hover:scale-110 transition-transform duration-300"
        )}
      >
        {/* Outer glow effect */}
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-siso-red/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-siso-red/10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
            />
            
            {/* Aurora effect */}
            <motion.div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ clipPath: 'circle(50% at 50% 50%)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-siso-orange/30 via-siso-red/20 to-transparent"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </>
        )}
        
        <Icon className={cn(
          "text-white relative z-10",
          size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'
        )} />

        {/* Progress ring */}
        {isActive && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-siso-text/5"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              r="48"
              cx="50"
              cy="50"
            />
            <motion.circle
              className="text-siso-orange"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              r="48"
              cx="50"
              cy="50"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        )}
      </motion.div>
      
      <div className="flex-1 space-y-1">
        <span className={cn(
          "font-medium relative block whitespace-nowrap",
          size === 'sm' ? 'text-sm' : 'text-base',
          isActive ? 'text-white' : 'text-siso-text/70',
          isComplete && 'text-siso-orange'
        )}>
          {label}
          {isActive && (
            <motion.div
              className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-siso-orange to-siso-red"
              initial={{ width: "0%", x: "-50%" }}
              animate={{ width: "100%", x: "0%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </span>

        {isActive && thoughts && (
          <motion.div 
            className="text-xs text-siso-text/70"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {thoughts[thoughtIndex]}
              <ThinkingDots />
            </span>
          </motion.div>
        )}
      </div>

      {/* Enhanced background effect */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-4 bg-gradient-radial from-siso-text/10 to-transparent backdrop-blur-sm rounded-xl -z-10"
        />
      )}
    </div>
  );
};
