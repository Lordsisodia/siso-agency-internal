import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SwipeHintProps {
  show: boolean;
  onDismiss: () => void;
}

const hintVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

const arrowVariants = {
  swipe: {
    x: [0, 20, 0],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

const reverseArrowVariants = {
  swipe: {
    x: [0, -20, 0],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
      delay: 0.75
    }
  }
};

export const SwipeHint: React.FC<SwipeHintProps> = ({ show, onDismiss }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000); // Auto-dismiss after 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={hintVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-yellow-900/90 backdrop-blur-sm border border-yellow-700/50 rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-3 text-yellow-100">
              <motion.div variants={reverseArrowVariants} animate="swipe">
                <ChevronLeft className="h-4 w-4 text-red-400" />
              </motion.div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Swipe to toggle tasks</p>
                <p className="text-xs text-yellow-300/80">Right: Complete • Left: Undo</p>
              </div>
              
              <motion.div variants={arrowVariants} animate="swipe">
                <ChevronRight className="h-4 w-4 text-green-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeHint;