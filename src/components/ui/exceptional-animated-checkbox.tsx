import React from 'react';
import { motion, useReducedMotion, useAnimation } from 'framer-motion';
import { Checkbox } from '@/shared/ui/checkbox';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import confetti from 'canvas-confetti';

interface ExceptionalAnimatedCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCelebration?: boolean;
  disabled?: boolean;
  taskDifficulty?: 'easy' | 'medium' | 'hard';
  completionStreak?: number;
  contextualPriority?: 'low' | 'medium' | 'high';
}

// Physics-based natural motion curves
const naturalEasing = [0.25, 0.46, 0.45, 0.94]; // Sophisticated bezier curve
const snapEasing = [0.68, -0.55, 0.265, 1.55]; // Playful overshoot

// Intelligent animation variants based on context
const createContextualVariants = (difficulty: string, priority: string) => ({
  unchecked: { 
    scale: 1,
    rotateZ: 0,
    filter: "brightness(1)",
    transition: { 
      duration: 0.25,
      ease: naturalEasing
    }
  },
  checking: {
    scale: [1, 0.9, 1.1],
    rotateZ: [0, -5, 0],
    filter: "brightness(1.2)",
    transition: { 
      duration: 0.4,
      ease: snapEasing,
      times: [0, 0.6, 1]
    }
  },
  checked: { 
    scale: difficulty === 'hard' ? [1, 1.25, 1] : [1, 1.15, 1],
    rotateZ: priority === 'high' ? [0, 10, 0] : [0, 5, 0],
    filter: "brightness(1.1)",
    transition: { 
      duration: difficulty === 'hard' ? 0.6 : 0.4,
      ease: snapEasing,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: { 
    scale: 1.08,
    rotateZ: 2,
    filter: "brightness(1.05)",
    transition: { 
      duration: 0.2,
      ease: naturalEasing
    }
  },
  focus: {
    scale: 1.05,
    boxShadow: "0 0 0 3px rgba(250, 204, 21, 0.3)",
    transition: { duration: 0.15 }
  },
  disabled: {
    scale: 0.95,
    opacity: 0.6,
    filter: "grayscale(0.5)",
    transition: { duration: 0.2 }
  }
});

// Multi-layered celebration system
const createCelebrationVariants = (intensity: 'subtle' | 'medium' | 'intense') => ({
  hidden: { 
    scale: 0, 
    opacity: 0,
    rotate: 0
  },
  visible: { 
    scale: intensity === 'intense' ? [0, 1.5, 1] : [0, 1.3, 1],
    opacity: [0, 1, 0.8, 0],
    rotate: [0, 180, 360],
    transition: { 
      duration: intensity === 'intense' ? 0.8 : 0.6,
      ease: snapEasing,
      times: [0, 0.4, 0.8, 1]
    }
  }
});

// Adaptive confetti based on context
const triggerContextualConfetti = (
  difficulty: string, 
  streak: number, 
  priority: string,
  element: HTMLElement
) => {
  const rect = element.getBoundingClientRect();
  const origin = {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight
  };

  const baseConfig = {
    origin,
    colors: priority === 'high' 
      ? ['#ff6b6b', '#ffd93d', '#6bcf7f'] 
      : ['#facc15', '#eab308', '#ca8a04'],
    gravity: 0.8,
    drift: 0.1
  };

  // Streak-based celebration intensity
  if (streak >= 5) {
    // Epic streak celebration
    confetti({
      ...baseConfig,
      particleCount: 80,
      spread: 100,
      scalar: 1.4,
      shapes: ['star'],
      colors: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#ff9ff3']
    });
  } else if (difficulty === 'hard') {
    // Hard task celebration
    confetti({
      ...baseConfig,
      particleCount: 60,
      spread: 80,
      scalar: 1.2
    });
  } else {
    // Standard celebration
    confetti({
      ...baseConfig,
      particleCount: 30,
      spread: 60,
      scalar: 0.9
    });
  }
};

// Haptic feedback for mobile devices
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    navigator.vibrate(patterns[type]);
  }
};

export const ExceptionalAnimatedCheckbox: React.FC<ExceptionalAnimatedCheckboxProps> = ({
  checked,
  onCheckedChange,
  className = "",
  size = 'md',
  showCelebration = false,
  disabled = false,
  taskDifficulty = 'medium',
  completionStreak = 0,
  contextualPriority = 'medium'
}) => {
  const [isChecking, setIsChecking] = React.useState(false);
  const [justChecked, setJustChecked] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const checkboxRef = React.useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  const variants = React.useMemo(
    () => createContextualVariants(taskDifficulty, contextualPriority),
    [taskDifficulty, contextualPriority]
  );

  const celebrationIntensity = React.useMemo(() => {
    if (completionStreak >= 5) return 'intense';
    if (taskDifficulty === 'hard') return 'intense';
    if (contextualPriority === 'high') return 'medium';
    return 'subtle';
  }, [completionStreak, taskDifficulty, contextualPriority]);

  const celebrationVariants = React.useMemo(
    () => createCelebrationVariants(celebrationIntensity),
    [celebrationIntensity]
  );

  const handleChange = async (newChecked: boolean) => {
    if (disabled) return;

    setIsChecking(true);
    
    // Haptic feedback
    triggerHaptic(taskDifficulty === 'hard' ? 'heavy' : 'medium');
    
    // Brief checking animation
    await controls.start('checking');
    
    onCheckedChange(newChecked);
    
    if (newChecked && showCelebration && !prefersReducedMotion) {
      setJustChecked(true);
      
      // Contextual confetti
      if (checkboxRef.current) {
        triggerContextualConfetti(
          taskDifficulty, 
          completionStreak, 
          contextualPriority,
          checkboxRef.current
        );
      }
      
      // Reset states
      setTimeout(() => {
        setJustChecked(false);
        setIsChecking(false);
      }, 800);
    } else {
      setIsChecking(false);
    }
  };

  const getAnimationState = () => {
    if (disabled) return 'disabled';
    if (isChecking) return 'checking';
    if (checked) return 'checked';
    if (isFocused) return 'focus';
    return 'unchecked';
  };

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <div className="relative" ref={checkboxRef}>
        <Checkbox
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            sizeClasses[size],
            "border-yellow-400/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500",
            "focus:ring-2 focus:ring-yellow-400/50",
            className
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={checkboxRef}>
      <motion.div
        variants={variants}
        initial="unchecked"
        animate={controls}
        whileHover={!disabled ? "hover" : undefined}
        onHoverStart={() => !disabled && triggerHaptic('light')}
        className="relative"
      >
        <Checkbox
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            sizeClasses[size],
            "border-yellow-400/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500",
            "transition-all duration-200",
            "hover:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50",
            "data-[state=checked]:shadow-lg data-[state=checked]:shadow-yellow-500/25",
            disabled && "opacity-60 cursor-not-allowed",
            className
          )}
        />
      </motion.div>

      {/* Multi-layered celebration */}
      {justChecked && showCelebration && (
        <>
          {/* Primary celebration icon */}
          <motion.div
            variants={celebrationVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <CheckCircle2 className="h-6 w-6 text-green-400" />
          </motion.div>
          
          {/* Secondary sparkle effect for high-priority tasks */}
          {contextualPriority === 'high' && (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.2, 0],
                rotate: [0, 180],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -top-1 -right-1 pointer-events-none"
            >
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </motion.div>
          )}
        </>
      )}
      
      {/* Intelligent completion indicator */}
      {checked && !isChecking && (
        <motion.div
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            repeat: completionStreak >= 3 ? Infinity : 3,
            duration: 2.5,
            ease: "easeInOut",
            repeatDelay: 1
          }}
          className="absolute inset-0 rounded border-2 border-green-400/30 pointer-events-none"
        />
      )}

      {/* ARIA live region for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {checked ? `Task completed${completionStreak > 0 ? `, ${completionStreak} in a row` : ''}` : 'Task pending'}
      </div>
    </div>
  );
};

export default ExceptionalAnimatedCheckbox;