import React from 'react';
import { motion, AnimatePresence, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import confetti from 'canvas-confetti';
import { Crown, Flame, Star, Zap } from 'lucide-react';

interface ExceptionalProgressCounterProps {
  current: number;
  total: number;
  className?: string;
  showCelebration?: boolean;
  taskType?: 'workout' | 'hygiene' | 'nutrition' | 'planning' | 'meditation';
  completionStreak?: number;
  taskDifficulty?: 'easy' | 'medium' | 'hard';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

// Advanced spring physics for natural motion
const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 1.2
};

// Context-aware celebration intensities
const getCelebrationConfig = (
  type: string, 
  streak: number, 
  difficulty: string,
  timeOfDay: string
) => {
  const baseIntensity = difficulty === 'hard' ? 1.5 : 1;
  const streakMultiplier = Math.min(1 + (streak * 0.2), 3);
  const timeMultiplier = timeOfDay === 'morning' ? 1.2 : 1;
  
  return {
    particleCount: Math.floor(50 * baseIntensity * streakMultiplier),
    spread: Math.min(70 + (streak * 5), 120),
    scalar: Math.min(1 + (streak * 0.1), 2) * timeMultiplier,
    colors: getContextualColors(type, streak >= 5),
    shapes: streak >= 5 ? ['star', 'circle'] as const : ['circle'] as const
  };
};

const getContextualColors = (taskType: string, isEpicStreak: boolean) => {
  if (isEpicStreak) {
    return ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#ff9ff3', '#f8b500'];
  }
  
  const colorMap = {
    workout: ['#ff6b6b', '#ff8e53', '#ff6b6b'],
    hygiene: ['#4ecdc4', '#44a08d', '#4ecdc4'],
    nutrition: ['#6bcf7f', '#4ecdc4', '#6bcf7f'],
    planning: ['#ffd93d', '#ffb74d', '#ffd93d'],
    meditation: ['#b19cd9', '#8e44ad', '#b19cd9']
  };
  
  return colorMap[taskType as keyof typeof colorMap] || ['#facc15', '#eab308', '#ca8a04'];
};

// Streak-based achievement icons
const getAchievementIcon = (streak: number, isComplete: boolean) => {
  if (!isComplete) return null;
  
  if (streak >= 10) return Crown;
  if (streak >= 7) return Flame;
  if (streak >= 5) return Star;
  if (streak >= 3) return Zap;
  return null;
};

// Intelligent background morphing
const createBackgroundVariants = (taskType: string, timeOfDay: string) => {
  const morningBrightness = timeOfDay === 'morning' ? 1.1 : 1;
  
  const typeColors = {
    workout: {
      incomplete: `linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.2))`,
      complete: `linear-gradient(135deg, rgba(255, 107, 107, 0.4), rgba(255, 142, 83, 0.4))`
    },
    hygiene: {
      incomplete: `linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(68, 160, 141, 0.2))`,
      complete: `linear-gradient(135deg, rgba(78, 205, 196, 0.4), rgba(68, 160, 141, 0.4))`
    },
    nutrition: {
      incomplete: `linear-gradient(135deg, rgba(107, 207, 127, 0.2), rgba(78, 205, 196, 0.2))`,
      complete: `linear-gradient(135deg, rgba(107, 207, 127, 0.4), rgba(78, 205, 196, 0.4))`
    },
    planning: {
      incomplete: `linear-gradient(135deg, rgba(255, 217, 61, 0.2), rgba(255, 183, 77, 0.2))`,
      complete: `linear-gradient(135deg, rgba(255, 217, 61, 0.4), rgba(255, 183, 77, 0.4))`
    },
    meditation: {
      incomplete: `linear-gradient(135deg, rgba(177, 156, 217, 0.2), rgba(142, 68, 173, 0.2))`,
      complete: `linear-gradient(135deg, rgba(177, 156, 217, 0.4), rgba(142, 68, 173, 0.4))`
    }
  };

  return {
    incomplete: {
      background: typeColors[taskType as keyof typeof typeColors]?.incomplete || 
                 `linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(234, 179, 8, 0.2))`,
      borderColor: "rgba(250, 204, 21, 0.6)",
      scale: 1,
      filter: `brightness(${morningBrightness})`,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    complete: {
      background: typeColors[taskType as keyof typeof typeColors]?.complete || 
                 `linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(22, 163, 74, 0.4))`,
      borderColor: "rgba(34, 197, 94, 0.8)",
      scale: 1.02,
      filter: `brightness(${morningBrightness * 1.1})`,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    celebrating: {
      scale: [1, 1.1, 1.05],
      filter: `brightness(${morningBrightness * 1.2}) saturate(1.3)`,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };
};

// Sophisticated number morphing
const numberVariants = {
  enter: {
    y: 30,
    opacity: 0,
    scale: 0.7,
    rotateX: 90
  },
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    y: -30,
    opacity: 0,
    scale: 0.7,
    rotateX: -90,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const ExceptionalProgressCounter: React.FC<ExceptionalProgressCounterProps> = ({
  current,
  total,
  className = "",
  showCelebration = true,
  taskType = 'planning',
  completionStreak = 0,
  taskDifficulty = 'medium',
  timeOfDay = 'morning'
}) => {
  const [prevCurrent, setPrevCurrent] = React.useState(current);
  const [isCelebrating, setIsCelebrating] = React.useState(false);
  const [hasEverBeenComplete, setHasEverBeenComplete] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const counterRef = React.useRef<HTMLDivElement>(null);

  const isComplete = current === total && total > 0;
  const wasComplete = prevCurrent === total && total > 0;
  const progress = total > 0 ? (current / total) * 100 : 0;

  // Advanced spring physics for progress bar
  const springProgress = useSpring(progress, springConfig);
  const progressTransform = useTransform(springProgress, [0, 100], ['0%', '100%']);

  const backgroundVariants = React.useMemo(
    () => createBackgroundVariants(taskType, timeOfDay),
    [taskType, timeOfDay]
  );

  const AchievementIcon = getAchievementIcon(completionStreak, isComplete);

  React.useEffect(() => {
    if (current !== prevCurrent) {
      setPrevCurrent(current);
      
      // Track if ever completed for achievement logic
      if (isComplete && !wasComplete) {
        setHasEverBeenComplete(true);
        
        if (showCelebration && !prefersReducedMotion) {
          setIsCelebrating(true);
          
          // Advanced contextual celebration
          if (counterRef.current) {
            const rect = counterRef.current.getBoundingClientRect();
            const origin = {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            };

            const config = getCelebrationConfig(taskType, completionStreak, taskDifficulty, timeOfDay);
            
            confetti({
              ...config,
              origin,
              gravity: 0.6,
              drift: 0.1,
              startVelocity: 45,
              ticks: 300
            });

            // Epic streak gets a second wave
            if (completionStreak >= 5) {
              setTimeout(() => {
                confetti({
                  ...config,
                  origin,
                  particleCount: Math.floor(config.particleCount * 0.7),
                  gravity: 0.8,
                  spread: config.spread * 0.8
                });
              }, 200);
            }
          }
          
          // Haptic feedback for mobile
          if ('vibrate' in navigator) {
            const pattern = completionStreak >= 5 ? [30, 10, 30, 10, 30] : [50];
            navigator.vibrate(pattern);
          }
          
          setTimeout(() => setIsCelebrating(false), 1000);
        }
      }
    }
  }, [current, prevCurrent, total, wasComplete, showCelebration, prefersReducedMotion, taskType, completionStreak, taskDifficulty, timeOfDay, isComplete]);

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div className={cn("relative", className)} ref={counterRef}>
        <div className="border-2 rounded-full px-4 py-2 bg-gradient-to-r from-yellow-500/30 to-yellow-400/30 border-yellow-400/60">
          <span className="text-sm font-bold text-yellow-200">
            {current}/{total}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={counterRef}>
      <motion.div
        variants={backgroundVariants}
        animate={
          isCelebrating ? 'celebrating' : 
          isComplete ? 'complete' : 
          'incomplete'
        }
        className={cn(
          "relative border-2 rounded-full px-4 py-2 shadow-md overflow-hidden",
          "min-w-[60px] flex items-center justify-center",
          className
        )}
      >
        {/* Animated progress bar background */}
        <motion.div
          style={{ width: progressTransform }}
          className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-full"
          initial={{ width: '0%' }}
        />

        {/* Counter numbers with sophisticated morphing */}
        <div className="relative z-10 flex items-center space-x-1">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={current}
                variants={numberVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className={cn(
                  "text-sm font-bold tracking-wide block",
                  isComplete ? "text-green-200" : "text-yellow-200"
                )}
                style={{ textShadow: isComplete ? '0 0 8px rgba(34, 197, 94, 0.3)' : 'none' }}
              >
                {current}
              </motion.span>
            </AnimatePresence>
          </div>
          
          <span className={cn(
            "text-sm font-bold tracking-wide transition-colors duration-300",
            isComplete ? "text-green-200" : "text-yellow-200"
          )}>
            /{total}
          </span>

          {/* Achievement icon */}
          {AchievementIcon && isComplete && (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2
              }}
              className="ml-1"
            >
              <AchievementIcon className="h-3 w-3 text-yellow-300" />
            </motion.div>
          )}
        </div>

        {/* Completion pulse with streak-based intensity */}
        {isComplete && hasEverBeenComplete && (
          <motion.div
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ 
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              repeat: completionStreak >= 3 ? Infinity : 5,
              duration: completionStreak >= 5 ? 1.5 : 2,
              ease: "easeInOut",
              repeatDelay: completionStreak >= 5 ? 0.5 : 1
            }}
            className="absolute inset-0 rounded-full border-2 border-green-300/50"
          />
        )}

        {/* Epic streak glow effect */}
        {completionStreak >= 5 && isComplete && (
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 217, 61, 0.4)',
                '0 0 30px rgba(255, 217, 61, 0.6)',
                '0 0 20px rgba(255, 217, 61, 0.4)'
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full"
          />
        )}
      </motion.div>

      {/* ARIA live region for accessibility */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isComplete ? 
          `All ${total} subtasks completed${completionStreak > 0 ? `, ${completionStreak} streak` : ''}` : 
          `${current} of ${total} subtasks completed`
        }
      </div>
    </div>
  );
};

export default ExceptionalProgressCounter;