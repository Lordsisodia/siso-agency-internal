import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyTrackerSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  noPadding?: boolean;
  id?: string;
}

export const DailyTrackerSection: React.FC<DailyTrackerSectionProps> = ({
  title,
  subtitle,
  children,
  className,
  action,
  collapsible = false,
  defaultCollapsed = false,
  noPadding = false,
  id
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <motion.section
      id={id}
      className={cn('relative', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || subtitle || action) && (
        <div className={cn(
          'mb-4 sm:mb-6',
          noPadding ? '' : 'px-1'
        )}>
          <div className="flex items-center justify-between">
            <div 
              className={cn(
                'flex-1',
                collapsible && 'cursor-pointer select-none'
              )}
              onClick={handleToggle}
            >
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  {collapsible && (
                    <motion.div
                      animate={{ rotate: isCollapsed ? 0 : 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  )}
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {action.icon}
                {action.label}
              </Button>
            )}
          </div>
        </div>
      )}

      <motion.div
        animate={{
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div className={cn(
          noPadding ? '' : 'px-1'
        )}>
          {children}
        </div>
      </motion.div>
    </motion.section>
  );
};

// Section divider component
export const DailyTrackerDivider: React.FC<{
  className?: string;
  color?: 'gray' | 'orange' | 'yellow';
}> = ({ className, color = 'gray' }) => {
  const colorClasses = {
    gray: 'border-gray-700',
    orange: 'border-orange-600/50',
    yellow: 'border-yellow-600/50'
  };

  return (
    <div className={cn(
      'border-t my-6 sm:my-8',
      colorClasses[color],
      className
    )} />
  );
};

// Section group for related sections
export const DailyTrackerSectionGroup: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {title && (
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-lg sm:text-xl font-bold text-orange-400">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default DailyTrackerSection;