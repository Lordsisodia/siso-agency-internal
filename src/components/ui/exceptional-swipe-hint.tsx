import React from 'react';
import { motion, AnimatePresence, useReducedMotion, useAnimation } from 'framer-motion';
import { ChevronRight, ChevronLeft, Hand, X, Smartphone } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ExceptionalSwipeHintProps {
  show: boolean;
  onDismiss: () => void;
  className?: string;
  variant?: 'floating' | 'inline' | 'modal';
  swipeActions?: {
    left?: { label: string; icon?: React.ReactNode; color?: string };
    right?: { label: string; icon?: React.ReactNode; color?: string };
  };
  adaptivePosition?: 'top' | 'bottom' | 'center' | 'auto';
  gestureContext?: 'subtasks' | 'navigation' | 'completion';
}

// Sophisticated gesture physics
const swipePhysics = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
  mass: 1
};

const floatingVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    filter: "blur(10px)"
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 30,
    filter: "blur(5px)",
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.6, 1]
    }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)"
  },
  visible: { 
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.6, 1]
    }
  }
};

const phoneVariants = {
  idle: { 
    rotateY: 0, 
    rotateX: 0,
    scale: 1 
  },
  tiltLeft: { 
    rotateY: -15, 
    rotateX: 5,
    scale: 1.05,
    transition: swipePhysics
  },
  tiltRight: { 
    rotateY: 15, 
    rotateX: 5,
    scale: 1.05,
    transition: swipePhysics
  }
};

const handVariants = {
  swipeRight: {
    x: [0, 40, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1
    }
  },
  swipeLeft: {
    x: [0, -40, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1
    }
  },
  tap: {
    scale: [1, 0.9, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1.5
    }
  }
};

const gestureTextVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.2,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

// Context-aware positioning
const getAdaptivePosition = (context: string, userAgent: string) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  const isTablet = /iPad/i.test(userAgent) || (isMobile && window.innerWidth > 768);
  
  if (context === 'subtasks') {
    return isMobile ? 'bottom' : 'center';
  }
  if (context === 'navigation') {
    return isTablet ? 'top' : 'center';
  }
  return 'bottom';
};

// Intelligent gesture hints based on context
const getContextualHints = (context: string) => {
  const hintMap = {
    subtasks: {
      primary: "Swipe right to complete tasks quickly",
      secondary: "Swipe left to mark as incomplete",
      icon: <ChevronRight className="h-5 w-5" />,
      demonstration: "swipeRight"
    },
    navigation: {
      primary: "Swipe to navigate between sections",
      secondary: "Or use touch controls",
      icon: <Hand className="h-5 w-5" />,
      demonstration: "tap"
    },
    completion: {
      primary: "Swipe to celebrate completions",
      secondary: "Feel the satisfying feedback",
      icon: <ChevronRight className="h-5 w-5" />,
      demonstration: "swipeRight"
    }
  };
  
  return hintMap[context as keyof typeof hintMap] || hintMap.subtasks;
};

export const ExceptionalSwipeHint: React.FC<ExceptionalSwipeHintProps> = ({
  show,
  onDismiss,
  className = "",
  variant = 'floating',
  swipeActions = {
    right: { label: "Complete", color: "text-green-400" },
    left: { label: "Undo", color: "text-red-400" }
  },
  adaptivePosition = 'auto',
  gestureContext = 'subtasks'
}) => {
  const [currentDemo, setCurrentDemo] = React.useState<'swipeRight' | 'swipeLeft' | 'tap'>('swipeRight');
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [deviceOrientation, setDeviceOrientation] = React.useState<'portrait' | 'landscape'>('portrait');
  const [userAgent, setUserAgent] = React.useState('');
  const prefersReducedMotion = useReducedMotion();
  const phoneControls = useAnimation();
  
  const hints = React.useMemo(() => getContextualHints(gestureContext), [gestureContext]);
  
  // Device detection and adaptive behavior
  React.useEffect(() => {
    setUserAgent(navigator.userAgent);
    
    const handleOrientationChange = () => {
      setDeviceOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // Auto-cycle demonstrations
  React.useEffect(() => {
    if (!show || prefersReducedMotion || hasInteracted) return;
    
    const demonstrations = ['swipeRight', 'swipeLeft', 'tap'] as const;
    let currentIndex = 0;
    
    const cycleDemos = () => {
      currentIndex = (currentIndex + 1) % demonstrations.length;
      setCurrentDemo(demonstrations[currentIndex]);
      
      // Animate phone tilt
      if (demonstrations[currentIndex] === 'swipeRight') {
        phoneControls.start('tiltRight');
      } else if (demonstrations[currentIndex] === 'swipeLeft') {
        phoneControls.start('tiltLeft');
      } else {
        phoneControls.start('idle');
      }
    };
    
    const interval = setInterval(cycleDemos, 3000);
    return () => clearInterval(interval);
  }, [show, prefersReducedMotion, hasInteracted, phoneControls]);

  // Smart dismissal with interaction tracking
  const handleDismiss = React.useCallback(() => {
    setHasInteracted(true);
    onDismiss();
    
    // Analytics/feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  }, [onDismiss]);

  // Auto-dismiss after extended interaction
  React.useEffect(() => {
    if (!show) return;
    
    const handleUserInteraction = () => {
      setHasInteracted(true);
    };
    
    const events = ['touchstart', 'mousedown', 'scroll', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });
    
    // Auto-dismiss after 15 seconds of no interaction
    const timeout = setTimeout(() => {
      if (!hasInteracted) {
        handleDismiss();
      }
    }, 15000);
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      clearTimeout(timeout);
    };
  }, [show, hasInteracted, handleDismiss]);

  const position = React.useMemo(() => {
    if (adaptivePosition === 'auto') {
      return getAdaptivePosition(gestureContext, userAgent);
    }
    return adaptivePosition;
  }, [adaptivePosition, gestureContext, userAgent]);

  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    auto: 'bottom-4 left-1/2 -translate-x-1/2'
  };

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {show && (
          <div className={cn(
            "fixed z-50 bg-gray-800/95 backdrop-blur-sm border border-yellow-400/50 rounded-xl p-4 shadow-xl",
            positionClasses[position],
            className
          )}>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-100 text-sm font-medium">
                  {hints.primary}
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {show && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={handleDismiss}
            />
            
            {/* Modal content */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                "bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md",
                "border border-yellow-400/30 rounded-2xl p-8 shadow-2xl",
                "max-w-sm w-full mx-4",
                className
              )}
            >
              <div className="text-center space-y-6">
                <motion.div
                  variants={phoneVariants}
                  animate={phoneControls}
                  className="mx-auto w-16 h-28 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border-2 border-gray-600 relative overflow-hidden"
                  style={{ perspective: 1000 }}
                >
                  <div className="absolute inset-1 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-md" />
                  <motion.div
                    variants={handVariants}
                    animate={currentDemo}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Hand className="h-6 w-6 text-yellow-400/80" />
                  </motion.div>
                </motion.div>

                <div className="space-y-3">
                  <motion.h3
                    variants={gestureTextVariants}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                    className="text-yellow-100 font-semibold text-lg"
                  >
                    {hints.primary}
                  </motion.h3>
                  
                  <motion.p
                    variants={gestureTextVariants}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    className="text-gray-300 text-sm"
                  >
                    {hints.secondary}
                  </motion.p>

                  <div className="flex justify-center space-x-6 pt-2">
                    <motion.div
                      variants={gestureTextVariants}
                      initial="hidden"
                      animate="visible"
                      custom={2}
                      className="flex items-center space-x-2"
                    >
                      <ChevronRight className="h-4 w-4 text-green-400" />
                      <span className={cn("text-xs font-medium", swipeActions.right?.color)}>
                        {swipeActions.right?.label}
                      </span>
                    </motion.div>
                    
                    <motion.div
                      variants={gestureTextVariants}
                      initial="hidden"
                      animate="visible"
                      custom={3}
                      className="flex items-center space-x-2"
                    >
                      <ChevronLeft className="h-4 w-4 text-red-400" />
                      <span className={cn("text-xs font-medium", swipeActions.left?.color)}>
                        {swipeActions.left?.label}
                      </span>
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  variants={gestureTextVariants}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                  onClick={handleDismiss}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={floatingVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "fixed z-50 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-md",
            "border border-yellow-400/50 rounded-xl p-4 shadow-xl max-w-xs",
            positionClasses[position],
            className
          )}
        >
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3">
              <motion.div
                variants={handVariants}
                animate={currentDemo}
                className="text-yellow-400"
              >
                <Hand className="h-5 w-5" />
              </motion.div>
              
              <div className="flex-1">
                <p className="text-yellow-100 text-sm font-medium leading-tight">
                  {hints.primary}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <ChevronRight className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">{swipeActions.right?.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChevronLeft className="h-3 w-3 text-red-400" />
                    <span className="text-xs text-red-400">{swipeActions.left?.label}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExceptionalSwipeHint;