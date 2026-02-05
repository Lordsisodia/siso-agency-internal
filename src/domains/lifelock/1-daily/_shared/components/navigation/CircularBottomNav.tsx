/**
 * Circular Bottom Navigation Component
 *
 * A horizontal row of circular buttons with icons above and text below.
 * Each button represents a main navigation section.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CircularBottomNavTab {
  title: string;
  icon: LucideIcon;
  color?: string;
  bgActive?: string;
}

interface CircularBottomNavProps {
  tabs: CircularBottomNavTab[];
  activeIndex: number;
  onChange: (index: number | null) => void;
  className?: string;
}

export const CircularBottomNav: React.FC<CircularBottomNavProps> = ({
  tabs,
  activeIndex,
  onChange,
  className = ''
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 sm:gap-4",
        "px-4 py-3 rounded-2xl",
        "bg-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl z-50",
        className
      )}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeIndex === index;

        // Use provided colors or defaults
        const activeColor = tab.color || 'text-orange-400';
        const activeBgColor = tab.bgActive || 'bg-orange-400/20';
        const activeBorderColor = activeColor.replace('text-', 'border-');
        const activeShadowColor = activeColor.replace('text-', 'shadow-').replace('-400', '-500/30');

        return (
          <motion.button
            key={tab.title}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5",
              "w-16 h-16 sm:w-18 sm:h-18", // Circular button container
              "rounded-full",
              "bg-gray-900/80 backdrop-blur-md border-2",
              "transition-all duration-300",
              isActive ? activeBgColor : "",
              isActive ? activeBorderColor : "border-white/20",
              isActive && `shadow-lg ${activeShadowColor}`
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: isActive ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            onClick={() => onChange(index)}
            aria-label={tab.title}
            aria-pressed={isActive}
          >
            <Icon
              size={20}
              className={cn(
                "text-white/80",
                isActive && activeColor
              )}
            />
            <span
              className={cn(
                "text-[9px] sm:text-[10px] font-medium whitespace-nowrap leading-tight",
                "text-white/80",
                isActive && activeColor
              )}
            >
              {tab.title}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
