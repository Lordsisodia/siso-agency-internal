import React from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Mic, BarChart3, Menu } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ExpandableTabs } from '@/shared/ui/expandable-tabs';

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
  const tabs = [
    { title: 'Today', icon: Home },
    { title: 'Tasks', icon: CheckSquare },
    { type: 'separator' as const },
    { title: 'Voice', icon: Mic },
    { title: 'Stats', icon: BarChart3 },
    { title: 'More', icon: Menu }
  ];

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    const tabActions = [
      onHomeClick,     // Today
      onTasksClick,    // Tasks  
      undefined,       // Separator
      onVoiceClick,    // Voice
      onStatsClick,    // Stats
      onMenuClick      // More
    ];

    // Adjust index to account for separator
    const actualIndex = index >= 2 ? index + 1 : index;
    const action = tabActions[actualIndex];
    action?.();
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50',
        'safe-area-pb sm:hidden', // Only show on mobile
        'flex justify-center items-center p-4',
        className
      )}
    >
      <ExpandableTabs 
        tabs={tabs}
        onChange={handleTabChange}
        activeColor="text-yellow-400"
        className="bg-gray-800/60 border-gray-600/50"
      />
      
      {/* Safe area padding for iOS */}
      <div className="absolute bottom-0 left-0 right-0 h-safe-area-inset-bottom bg-gray-900/95" />
    </motion.div>
  );
};

export default BottomNavigation;