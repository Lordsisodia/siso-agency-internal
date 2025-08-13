import React from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Mic, BarChart3, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onHomeClick?: () => void;
  onTasksClick?: () => void;
  onVoiceClick?: () => void;
  onStatsClick?: () => void;
  onMenuClick?: () => void;
  onQuickAddClick?: () => void;
  isListening?: boolean;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onHomeClick,
  onTasksClick,
  onVoiceClick,
  onStatsClick,
  onMenuClick,
  onQuickAddClick,
  isListening = false,
  className
}) => {
  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Today',
      onClick: onHomeClick,
      color: 'text-blue-400'
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      label: 'Tasks',
      onClick: onTasksClick,
      color: 'text-orange-400'
    },
    {
      id: 'voice',
      icon: Mic,
      label: 'Voice',
      onClick: onVoiceClick,
      color: isListening ? 'text-red-400' : 'text-green-400',
      isActive: isListening
    },
    {
      id: 'stats',
      icon: BarChart3,
      label: 'Stats',
      onClick: onStatsClick,
      color: 'text-purple-400'
    },
    {
      id: 'menu',
      icon: Menu,
      label: 'More',
      onClick: onMenuClick,
      color: 'text-gray-400'
    }
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50',
        'safe-area-pb sm:hidden', // Only show on mobile
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all',
              'min-w-[60px] min-h-[60px]',
              item.isActive 
                ? 'bg-gray-700/50 shadow-lg' 
                : 'hover:bg-gray-800/30 active:bg-gray-700/50'
            )}
          >
            <div className={cn(
              'relative',
              item.isActive && 'animate-pulse'
            )}>
              <item.icon 
                className={cn(
                  'h-5 w-5 transition-colors',
                  item.color
                )}
              />
              {item.isActive && (
                <motion.div
                  className="absolute -inset-1 bg-red-500/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
            <span className={cn(
              'text-xs font-medium transition-colors',
              item.isActive ? item.color : 'text-gray-400'
            )}>
              {item.label}
            </span>
          </motion.button>
        ))}
        
        {/* Quick Add FAB integrated */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onQuickAddClick}
          className="absolute -top-6 right-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-gray-900/95" />
    </motion.div>
  );
};

export default BottomNavigation;