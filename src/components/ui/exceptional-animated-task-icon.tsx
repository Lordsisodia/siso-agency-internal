import React from 'react';
import { motion, useReducedMotion, useAnimation, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ExceptionalAnimatedTaskIconProps {
  icon: LucideIcon;
  isCompleted: boolean;
  size?: 'sm' | 'md' | 'lg';
  taskType?: 'workout' | 'hygiene' | 'nutrition' | 'planning' | 'meditation' | 'default';
  className?: string;
  completionStreak?: number;
  taskDifficulty?: 'easy' | 'medium' | 'hard';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  showProgress?: boolean;
  progress?: number; // 0-100
}

// Sophisticated easing curves for natural motion
const naturalEasing = [0.25, 0.46, 0.45, 0.94];
const playfulEasing = [0.68, -0.55, 0.265, 1.55];
const preciseEasing = [0.4, 0, 0.2, 1];

// Context-aware color schemes
const getTaskTypeColors = (taskType: string, timeOfDay: string) => {
  const morningMultiplier = timeOfDay === 'morning' ? 1.1 : 1;
  
  const colorSchemes = {
    workout: {
      idle: { 
        color: `rgba(239, 68, 68, ${0.8 * morningMultiplier})`, // red-500
        background: `rgba(239, 68, 68, ${0.1 * morningMultiplier})`,
        glow: `rgba(239, 68, 68, ${0.3 * morningMultiplier})`
      },
      completed: { 
        color: `rgba(34, 197, 94, ${0.9 * morningMultiplier})`, // green-500
        background: `rgba(34, 197, 94, ${0.15 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.4 * morningMultiplier})`
      }
    },
    hygiene: {
      idle: { 
        color: `rgba(20, 184, 166, ${0.8 * morningMultiplier})`, // teal-500
        background: `rgba(20, 184, 166, ${0.1 * morningMultiplier})`,
        glow: `rgba(20, 184, 166, ${0.3 * morningMultiplier})`
      },
      completed: { 
        color: `rgba(34, 197, 94, ${0.9 * morningMultiplier})`,
        background: `rgba(34, 197, 94, ${0.15 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.4 * morningMultiplier})`
      }
    },
    nutrition: {
      idle: { 
        color: `rgba(34, 197, 94, ${0.7 * morningMultiplier})`, // green-500
        background: `rgba(34, 197, 94, ${0.1 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.3 * morningMultiplier})`
      },
      completed: { 
        color: `rgba(34, 197, 94, ${0.9 * morningMultiplier})`,
        background: `rgba(34, 197, 94, ${0.15 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.4 * morningMultiplier})`
      }
    },
    planning: {
      idle: { 
        color: `rgba(245, 158, 11, ${0.8 * morningMultiplier})`, // amber-500
        background: `rgba(245, 158, 11, ${0.1 * morningMultiplier})`,
        glow: `rgba(245, 158, 11, ${0.3 * morningMultiplier})`
      },
      completed: { 
        color: `rgba(34, 197, 94, ${0.9 * morningMultiplier})`,
        background: `rgba(34, 197, 94, ${0.15 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.4 * morningMultiplier})`
      }
    },
    meditation: {
      idle: { 
        color: `rgba(139, 92, 246, ${0.8 * morningMultiplier})`, // violet-500
        background: `rgba(139, 92, 246, ${0.1 * morningMultiplier})`,
        glow: `rgba(139, 92, 246, ${0.3 * morningMultiplier})`
      },
      completed: { 
        color: `rgba(34, 197, 94, ${0.9 * morningMultiplier})`,
        background: `rgba(34, 197, 94, ${0.15 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.4 * morningMultiplier})`
      }
    },
    default: {
      idle: { 
        color: `rgba(250, 204, 21, ${0.8 * morningMultiplier})`, // yellow-400
        background: `rgba(250, 204, 21, ${0.1 * morningMultiplier})`,
        glow: `rgba(250, 204, 21, ${0.3 * morningMultiplier})`
      },
      completed: { 
        color: `rgba(34, 197, 94, ${0.9 * morningMultiplier})`,
        background: `rgba(34, 197, 94, ${0.15 * morningMultiplier})`,
        glow: `rgba(34, 197, 94, ${0.4 * morningMultiplier})`
      }
    }
  };

  return colorSchemes[taskType as keyof typeof colorSchemes] || colorSchemes.default;
};

// Advanced animation variants with context awareness
const createIconVariants = (difficulty: string, streak: number, taskType: string) => {
  const difficultyIntensity = {
    easy: 1,
    medium: 1.2,
    hard: 1.5
  }[difficulty] || 1.2;

  const streakBonus = Math.min(1 + (streak * 0.1), 2);
  const finalIntensity = difficultyIntensity * streakBonus;

  return {
    idle: {
      scale: 1,
      rotate: 0,
      filter: "brightness(1)",
      transition: { 
        duration: 0.3,
        ease: naturalEasing
      }
    },
    hover: {
      scale: 1.1 * finalIntensity,
      rotate: taskType === 'workout' ? 15 : taskType === 'meditation' ? -10 : 5,
      filter: "brightness(1.2)",
      transition: { 
        duration: 0.4,
        ease: playfulEasing
      }
    },
    completing: {
      scale: [1, 0.8, 1.4, 1],
      rotate: [0, -15, 15, 0],
      filter: ["brightness(1)", "brightness(1.3)", "brightness(1.5)", "brightness(1.2)"],
      transition: { 
        duration: 0.8,
        ease: playfulEasing,
        times: [0, 0.3, 0.7, 1]
      }
    },
    completed: {
      scale: 1.05,
      rotate: 0,
      filter: "brightness(1.3) saturate(1.2)",
      transition: { 
        duration: 0.5,
        ease: naturalEasing
      }
    },
    pulse: {
      scale: [1, 1.15, 1],
      filter: ["brightness(1.3)", "brightness(1.5)", "brightness(1.3)"],
      transition: {
        duration: streak >= 5 ? 1.5 : 2,
        ease: "easeInOut",
        repeat: streak >= 3 ? Infinity : 3,
        repeatDelay: streak >= 5 ? 0.3 : 0.8
      }
    }
  };
};

// Progress ring animation
const progressRingVariants = {
  hidden: { 
    pathLength: 0, 
    opacity: 0,
    rotate: -90
  },
  visible: (progress: number) => ({
    pathLength: progress / 100,
    opacity: 0.8,
    rotate: -90,
    transition: {
      pathLength: {
        duration: 1.2,
        ease: preciseEasing
      },
      opacity: {
        duration: 0.3
      }
    }
  })
};

// Streak achievement overlay
const achievementVariants = {
  hidden: { scale: 0, opacity: 0, rotate: 0 },
  visible: {
    scale: [0, 1.3, 1],
    opacity: [0, 1, 0.8],
    rotate: [0, 180, 360],
    transition: {
      duration: 0.8,
      ease: playfulEasing,
      times: [0, 0.5, 1]
    }
  }
};

export const ExceptionalAnimatedTaskIcon: React.FC<ExceptionalAnimatedTaskIconProps> = ({
  icon: Icon,
  isCompleted,
  size = 'md',
  taskType = 'default',
  className = "",
  completionStreak = 0,
  taskDifficulty = 'medium',
  timeOfDay = 'morning',
  showProgress = false,
  progress = 0
}) => {
  const [isHovering, setIsHovering] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [showAchievement, setShowAchievement] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const prevCompleted = React.useRef(isCompleted);

  const sizeClasses = {
    sm: "h-4 w-4 p-2",
    md: "h-5 w-5 p-2.5", 
    lg: "h-6 w-6 p-3"
  };

  const colors = React.useMemo(
    () => getTaskTypeColors(taskType, timeOfDay),
    [taskType, timeOfDay]
  );

  const variants = React.useMemo(
    () => createIconVariants(taskDifficulty, completionStreak, taskType),
    [taskDifficulty, completionStreak, taskType]
  );

  // Handle completion state changes
  React.useEffect(() => {
    if (isCompleted && !prevCompleted.current && !prefersReducedMotion) {
      setIsCompleting(true);
      controls.start('completing').then(() => {
        setIsCompleting(false);
        
        // Show achievement for streaks
        if (completionStreak >= 3) {
          setShowAchievement(true);
          setTimeout(() => setShowAchievement(false), 1200);
        }
      });
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted, completionStreak, prefersReducedMotion, controls]);

  // Continuous pulse for completed tasks with high streaks
  React.useEffect(() => {
    if (isCompleted && completionStreak >= 3 && !isCompleting && !prefersReducedMotion) {
      controls.start('pulse');
    }
  }, [isCompleted, completionStreak, isCompleting, prefersReducedMotion, controls]);

  const getAnimationState = () => {
    if (isCompleting) return 'completing';
    if (isCompleted && completionStreak >= 3) return 'pulse';
    if (isCompleted) return 'completed';
    if (isHovering) return 'hover';
    return 'idle';
  };

  const currentColors = isCompleted ? colors.completed : colors.idle;

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div 
        className={cn(
          "relative rounded-full flex items-center justify-center transition-colors duration-300",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.color
        }}
      >
        <Icon className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        variants={variants}
        animate={controls}
        initial="idle"
        onHoverStart={() => !isCompleting && setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className={cn(
          "relative rounded-full flex items-center justify-center cursor-pointer overflow-hidden",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.color,
          boxShadow: isCompleted ? `0 0 16px ${currentColors.glow}` : `0 0 8px ${currentColors.glow}`
        }}
      >
        {/* Progress ring for subtasks */}
        {showProgress && progress > 0 && (
          <div className="absolute inset-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.2"
              />
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                variants={progressRingVariants}
                initial="hidden"
                animate="visible"
                custom={progress}
                style={{
                  pathLength: 0,
                  filter: `drop-shadow(0 0 4px ${currentColors.glow})`
                }}
              />
            </svg>
          </div>
        )}

        {/* Main icon */}
        <motion.div
          className="relative z-10"
          animate={{
            filter: isCompleted ? 
              `drop-shadow(0 0 6px ${currentColors.glow})` : 
              `drop-shadow(0 0 3px ${currentColors.glow})`
          }}
        >
          <Icon className="h-full w-full" />
        </motion.div>

        {/* Completion ripple effect */}
        {isCompleting && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: currentColors.color }}
          />
        )}

        {/* Epic streak glow effect */}
        {completionStreak >= 5 && isCompleted && (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${currentColors.glow} 0%, transparent 70%)`,
              filter: "blur(2px)"
            }}
          />
        )}
      </motion.div>

      {/* Achievement overlay for streaks */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            variants={achievementVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-lg"
          >
            {completionStreak >= 10 ? '👑' : 
             completionStreak >= 7 ? '🔥' : 
             completionStreak >= 5 ? '⭐' : '⚡'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARIA live region for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isCompleted ? 
          `${taskType} task completed${completionStreak > 0 ? `, ${completionStreak} in a row` : ''}` : 
          `${taskType} task pending${showProgress ? `, ${progress}% progress` : ''}`
        }
      </div>
    </div>
  );
};

export default ExceptionalAnimatedTaskIcon;