import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/shared/ui/checkbox';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import confetti from 'canvas-confetti';

interface AnimatedCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCelebration?: boolean;
  disabled?: boolean;
}

// Animation variants for different states
const checkboxVariants = {
  unchecked: { 
    scale: 1,
    rotateZ: 0,
    transition: { 
      duration: 0.2,
      type: "spring",
      stiffness: 300
    }
  },
  checked: { 
    scale: [1, 1.15, 1], 
    rotateZ: [0, 5, 0],
    transition: { 
      duration: 0.4, 
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.15,
      type: "tween"
    }
  }
};

const celebrationVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    rotate: 0
  },
  visible: { 
    scale: [0, 1.3, 1], 
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
};

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onCheckedChange,
  className = "",
  size = 'md',
  showCelebration = false,
  disabled = false
}) => {
  const [justChecked, setJustChecked] = React.useState(false);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  const handleChange = (newChecked: boolean) => {
    onCheckedChange(newChecked);
    
    if (newChecked && showCelebration) {
      setJustChecked(true);
      
      // Trigger confetti celebration
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0.7 },
        colors: ['#facc15', '#eab308', '#ca8a04'],
        scalar: 0.8,
        gravity: 1.2,
        drift: 0
      });
      
      // Reset celebration state
      setTimeout(() => setJustChecked(false), 600);
    }
  };

  return (
    <div className="relative">
      <motion.div
        variants={checkboxVariants}
        initial="unchecked"
        animate={checked ? "checked" : "unchecked"}
        whileHover={!disabled ? "hover" : undefined}
        className="relative"
      >
        <Checkbox
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          className={cn(
            sizeClasses[size],
            "border-yellow-400/70 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500",
            "transition-all duration-200",
            "hover:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50",
            "data-[state=checked]:shadow-lg data-[state=checked]:shadow-yellow-500/25",
            className
          )}
        />
      </motion.div>

      {/* Celebration animation overlay */}
      {justChecked && showCelebration && (
        <motion.div
          variants={celebrationVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        </motion.div>
      )}
      
      {/* Completion pulse effect for checked state */}
      {checked && (
        <motion.div
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded border-2 border-green-400/30 pointer-events-none"
        />
      )}
    </div>
  );
};

export default AnimatedCheckbox;