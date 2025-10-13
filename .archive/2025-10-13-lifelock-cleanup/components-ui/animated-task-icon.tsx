import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AnimatedTaskIconProps {
  icon: LucideIcon;
  isCompleted?: boolean;
  isHovered?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  taskType?: 'workout' | 'hygiene' | 'nutrition' | 'planning' | 'meditation' | 'default';
}

// Base animation variants
const iconVariants = {
  idle: { 
    rotate: 0, 
    scale: 1,
    y: 0,
    transition: { duration: 0.2 }
  },
  hover: { 
    scale: 1.1,
    transition: { 
      duration: 0.2,
      type: "spring",
      stiffness: 300
    }
  },
  completed: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    y: [0, -5, 0],
    transition: { 
      duration: 0.6,
      type: "spring",
      stiffness: 200
    }
  }
};

// Task-specific animation variants
const taskSpecificVariants = {
  workout: {
    hover: { 
      rotate: [0, -15, 15, 0],
      transition: { duration: 0.4 }
    },
    completed: { 
      y: [0, -8, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.5 }
    }
  },
  hygiene: {
    hover: { 
      y: [0, -3, 0],
      transition: { 
        repeat: 2,
        duration: 0.3
      }
    },
    completed: { 
      rotate: [0, 10, -10, 0],
      scale: [1, 1.2, 1]
    }
  },
  nutrition: {
    hover: {
      scale: [1, 1.1, 1.05],
      transition: { duration: 0.3 }
    },
    completed: {
      rotate: [0, 180, 360],
      scale: [1, 1.3, 1],
      transition: { duration: 0.7 }
    }
  },
  planning: {
    hover: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.4 }
    },
    completed: {
      y: [0, -6, 0],
      rotate: [0, 360],
      transition: { duration: 0.6 }
    }
  },
  meditation: {
    hover: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: { 
        duration: 1,
        ease: "easeInOut"
      }
    },
    completed: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 0.8 }
    }
  },
  default: {
    hover: iconVariants.hover,
    completed: iconVariants.completed
  }
};

const completionGlow = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: [0, 0.6, 0],
    scale: [0.8, 1.2, 1.4],
    transition: {
      duration: 1,
      ease: "easeOut"
    }
  }
};

export const AnimatedTaskIcon: React.FC<AnimatedTaskIconProps> = ({
  icon: Icon,
  isCompleted = false,
  isHovered = false,
  className = "",
  size = 'md',
  taskType = 'default'
}) => {
  const [justCompleted, setJustCompleted] = React.useState(false);
  const [wasCompleted, setWasCompleted] = React.useState(isCompleted);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  React.useEffect(() => {
    if (isCompleted && !wasCompleted) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
    setWasCompleted(isCompleted);
  }, [isCompleted, wasCompleted]);

  const getAnimationState = () => {
    if (justCompleted) return 'completed';
    if (isHovered) return 'hover';
    return 'idle';
  };

  const getCurrentVariants = () => {
    const taskVariants = taskSpecificVariants[taskType];
    const state = getAnimationState();
    
    if (state === 'completed' && taskVariants.completed) {
      return taskVariants.completed;
    }
    if (state === 'hover' && taskVariants.hover) {
      return taskVariants.hover;
    }
    return iconVariants[state];
  };

  return (
    <div className="relative">
      <motion.div
        animate={getCurrentVariants()}
        className="relative"
      >
        <Icon 
          className={cn(
            sizeClasses[size],
            "transition-colors duration-200",
            isCompleted ? "text-green-400" : "text-yellow-400",
            className
          )} 
        />
      </motion.div>

      {/* Completion glow effect */}
      {justCompleted && (
        <motion.div
          variants={completionGlow}
          initial="initial"
          animate="animate"
          className="absolute inset-0 pointer-events-none"
        >
          <div className={cn(
            sizeClasses[size],
            "rounded-full bg-green-400/30 blur-sm"
          )} />
        </motion.div>
      )}

      {/* Subtle pulse for completed state */}
      {isCompleted && !justCompleted && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className={cn(
            sizeClasses[size],
            "rounded-full bg-green-400/20 blur-xs"
          )} />
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedTaskIcon;