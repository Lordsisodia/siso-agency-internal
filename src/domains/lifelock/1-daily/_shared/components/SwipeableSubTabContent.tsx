/**
 * Swipeable Sub-Tab Content Wrapper
 *
 * Provides swipeable navigation between sub-tabs (e.g., morning → timebox → checkout)
 * with animated transitions. Only the content area swipes - header and navigation pills stay fixed.
 *
 * Features:
 * - Swipe left/right to navigate between sub-tabs
 * - Animated slide transitions with proper direction
 * - Syncs with navigation pills (clicking pills updates content, swiping updates pills)
 * - Configurable swipe thresholds
 */

import React, { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { NavSubSection } from '@/services/shared/navigation-config';

interface SwipeableSubTabContentProps {
  subSections: NavSubSection[];
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  children: (activeSubTab: string) => ReactNode;
}

export const SwipeableSubTabContent: React.FC<SwipeableSubTabContentProps> = ({
  subSections,
  activeSubTab,
  onSubTabChange,
  children
}) => {
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Get current and adjacent indices for cycling
  const getCurrentIndex = () => subSections.findIndex(s => s.id === activeSubTab);
  const currentIndex = getCurrentIndex();

  // Navigate to next/previous sub-tab (cycles around)
  const navigateSubTab = useCallback((navDirection: 'next' | 'prev') => {
    const currentIndex = getCurrentIndex();
    let newIndex: number;

    if (navDirection === 'next') {
      // Cycle to first if at end
      newIndex = currentIndex === subSections.length - 1 ? 0 : currentIndex + 1;
      setDirection(-1); // Moving left (content slides out to left)
    } else {
      // Cycle to last if at start
      newIndex = currentIndex === 0 ? subSections.length - 1 : currentIndex - 1;
      setDirection(1); // Moving right (content slides out to right)
    }

    const newSubTab = subSections[newIndex].id;
    onSubTabChange(newSubTab);
  }, [subSections, activeSubTab, onSubTabChange]);

  // Handle swipe gestures
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50; // Minimum distance for swipe
    const swipeVelocityThreshold = 300; // Minimum velocity

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        // Swipe right - go to previous sub-tab
        navigateSubTab('prev');
      } else {
        // Swipe left - go to next sub-tab
        navigateSubTab('next');
      }
    }
    setIsDragging(false);
  }, [navigateSubTab]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Outer drag container - handles swipe gestures */}
      <motion.div
        className="relative overflow-x-hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: isDragging ? 0.98 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Animated content container - only this animates, not the outer container */}
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={activeSubTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 35 },
              opacity: { duration: 0.2 },
            }}
            className="overflow-x-hidden"
          >
            {children(activeSubTab)}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

SwipeableSubTabContent.displayName = 'SwipeableSubTabContent';
