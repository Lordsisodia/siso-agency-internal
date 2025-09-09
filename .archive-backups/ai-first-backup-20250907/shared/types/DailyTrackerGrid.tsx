import React from 'react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GridItem {
  id: string;
  content: React.ReactNode;
  span?: 'full' | 'half' | 'third' | 'two-thirds';
  priority?: number;
}

interface DailyTrackerGridProps {
  items: GridItem[];
  columns?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 2 | 3 | 4 | 5 | 6;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-5',
  lg: 'gap-4 sm:gap-6 lg:gap-8'
};

const spanClasses = {
  full: 'col-span-full',
  half: 'col-span-full sm:col-span-1',
  third: 'col-span-full sm:col-span-1 lg:col-span-1',
  'two-thirds': 'col-span-full sm:col-span-2 lg:col-span-2'
};

export const DailyTrackerGrid: React.FC<DailyTrackerGridProps> = ({
  items,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className,
  animate = true
}) => {
  // Sort items by priority if specified
  const sortedItems = [...items].sort((a, b) => {
    if (a.priority === undefined && b.priority === undefined) return 0;
    if (a.priority === undefined) return 1;
    if (b.priority === undefined) return -1;
    return a.priority - b.priority;
  });

  const gridColumns = cn(
    'grid',
    // Mobile columns
    columns.mobile === 1 && 'grid-cols-1',
    columns.mobile === 2 && 'grid-cols-1 xs:grid-cols-2',
    
    // Tablet columns
    columns.tablet === 2 && 'md:grid-cols-2',
    columns.tablet === 3 && 'md:grid-cols-3',
    columns.tablet === 4 && 'md:grid-cols-4',
    
    // Desktop columns
    columns.desktop === 2 && 'lg:grid-cols-2',
    columns.desktop === 3 && 'lg:grid-cols-3',
    columns.desktop === 4 && 'lg:grid-cols-4',
    columns.desktop === 5 && 'lg:grid-cols-5',
    columns.desktop === 6 && 'lg:grid-cols-6',
    
    gapClasses[gap],
    className
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animate ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: animate ? 20 : 0,
      scale: animate ? 0.95 : 1
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      className={gridColumns}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {sortedItems.map((item) => (
          <motion.div
            key={item.id}
            className={cn(
              'h-full',
              item.span && spanClasses[item.span]
            )}
            variants={itemVariants}
            layout
          >
            {item.content}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// Additional layout components for specific grid patterns
export const DailyTrackerMasonryGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      'columns-1 md:columns-2 xl:columns-3 gap-4 sm:gap-6',
      className
    )}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          className="break-inside-avoid mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// Responsive grid with auto-fit
export const DailyTrackerAutoGrid: React.FC<{
  children: React.ReactNode;
  minCardWidth?: string;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  children, 
  minCardWidth = '320px',
  gap = 'md',
  className 
}) => {
  return (
    <div 
      className={cn(
        'grid',
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

export default DailyTrackerGrid;