/**
 * Grid More Menu Component V2
 *
 * 3x3 grid layout popup for the More menu
 * Features animated AI orb in center position
 * Staggered entrance animations
 * Glassmorphism design matching V2 aesthetic
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GRID_MENU_ITEMS, GridMenuItem } from '@/services/shared/navigation-config';
import { AIOrbButton } from '@/components/ui/AIOrbButton';
import { cn } from '@/lib/utils';

interface GridMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GridMoreMenu: React.FC<GridMoreMenuProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: GridMenuItem) => {
    navigate(item.path);
    onOpenChange(false);
  };

  // Sort items by position for proper grid layout
  const sortedItems = [...GRID_MENU_ITEMS].sort((a, b) => a.position - b.position);
  const centerItem = sortedItems.find(item => item.isSpecial);

  const containerVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: '100%',
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
            onClick={() => onOpenChange(false)}
          />

          {/* Grid Menu */}
          <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 pointer-events-none">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-t border-x border-white/10 rounded-t-[2.5rem] shadow-2xl p-6 max-w-md w-full pb-8"
            >
              {/* Handle Bar */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent mb-1">
                  Quick Access
                </h2>
                <p className="text-sm text-white/40">Navigate to any view</p>
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-3">
                {sortedItems.map((item) => {
                  if (item.isSpecial) {
                    // Special center item - AI Orb
                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="aspect-square"
                      >
                        <div className="h-full flex flex-col items-center justify-center gap-2">
                          <AIOrbButton
                            onClick={() => handleItemClick(item)}
                            size="md"
                          />
                          <span className="text-xs font-medium text-purple-300">
                            {item.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  }

                  // Regular grid items
                  return (
                    <motion.button
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'rounded-2xl min-h-[100px]',
                        'bg-gradient-to-br from-white/5 to-white/[0.02]',
                        'border border-white/10',
                        'flex flex-col items-center justify-center gap-2 py-3',
                        'hover:scale-105 active:scale-95',
                        'transition-all duration-200',
                        'group shadow-lg'
                      )}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className={cn(
                        'h-12 w-12 rounded-xl',
                        'bg-gradient-to-br from-white/10 to-white/5',
                        'flex items-center justify-center',
                        'group-hover:scale-110 transition-transform duration-200',
                        'shadow-inner'
                      )}>
                        <item.icon className={cn('h-6 w-6', item.color)} strokeWidth={2} />
                      </div>
                      <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors leading-tight text-center px-1">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="mt-5 text-center">
                <p className="text-xs text-white/30">Tap anywhere to close</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GridMoreMenu;
