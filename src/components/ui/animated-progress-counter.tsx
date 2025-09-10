import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import confetti from 'canvas-confetti';

interface AnimatedProgressCounterProps {
  current: number;
  total: number;
  className?: string;
  showCelebration?: boolean;
}

const counterVariants = {
  initial: { scale: 1 },
  updated: { 
    scale: [1, 1.2, 1],
    transition: { 
      duration: 0.4,
      type: "spring",
      stiffness: 300
    }
  },
  completed: {
    scale: [1, 1.3, 1],
    transition: { 
      duration: 0.6,
      type: "spring", 
      stiffness: 200
    }
  }
};

const backgroundVariants = {
  incomplete: {
    background: "linear-gradient(to right, rgba(250, 204, 21, 0.3), rgba(234, 179, 8, 0.3))",
    borderColor: "rgba(250, 204, 21, 0.6)",
    transition: { duration: 0.3 }
  },
  completed: {
    background: "linear-gradient(to right, rgba(34, 197, 94, 0.4), rgba(22, 163, 74, 0.4))",
    borderColor: "rgba(34, 197, 94, 0.8)",
    transition: { duration: 0.3 }
  }
};

const numberVariants = {
  enter: {
    y: 20,
    opacity: 0,
    scale: 0.8
  },
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 300
    }
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

export const AnimatedProgressCounter: React.FC<AnimatedProgressCounterProps> = ({
  current,
  total,
  className = "",
  showCelebration = true
}) => {
  const [prevCurrent, setPrevCurrent] = React.useState(current);
  const [justCompleted, setJustCompleted] = React.useState(false);
  const isComplete = current === total && total > 0;
  const wasComplete = prevCurrent === total && total > 0;

  React.useEffect(() => {
    if (current !== prevCurrent) {
      setPrevCurrent(current);
      
      // Check if just completed all tasks
      if (current === total && !wasComplete && total > 0 && showCelebration) {
        setJustCompleted(true);
        
        // Trigger completion celebration
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#15803d', '#facc15'],
          scalar: 1.2,
          gravity: 0.8,
          drift: 0.1
        });
        
        setTimeout(() => setJustCompleted(false), 800);
      }
    }
  }, [current, prevCurrent, total, wasComplete, showCelebration]);

  return (
    <div className="relative">
      <motion.div
        variants={counterVariants}
        initial="initial"
        animate={
          justCompleted ? "completed" : 
          current !== prevCurrent ? "updated" : 
          "initial"
        }
        className="relative"
      >
        <motion.div
          variants={backgroundVariants}
          animate={isComplete ? "completed" : "incomplete"}
          className={cn(
            "border-2 rounded-full px-4 py-2 shadow-md transition-all duration-300",
            "relative overflow-hidden",
            className
          )}
        >
          <div className="relative z-10 flex items-center space-x-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={current}
                variants={numberVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={cn(
                  "text-sm font-bold tracking-wide transition-colors duration-300",
                  isComplete ? "text-green-200" : "text-yellow-200"
                )}
              >
                {current}
              </motion.span>
            </AnimatePresence>
            
            <span className={cn(
              "text-sm font-bold tracking-wide transition-colors duration-300",
              isComplete ? "text-green-200" : "text-yellow-200"
            )}>
              /{total}
            </span>
          </div>
          
          {/* Completion pulse effect */}
          {isComplete && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full border-2 border-green-300/50"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Completion indicator */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-green-300 shadow-lg"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="absolute inset-1 bg-green-200 rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedProgressCounter;