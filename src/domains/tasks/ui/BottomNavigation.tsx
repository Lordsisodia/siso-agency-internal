import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Bot, BarChart3, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { MoreMenuPopup } from './MoreMenuPopup';

interface BottomNavigationProps {
  onHomeClick?: () => void;
  onTasksClick?: () => void;
  onAIAssistantClick?: () => void;
  onStatsClick?: () => void;
  onMenuClick?: () => void;
  onQuickAddClick?: () => void;
  isListening?: boolean;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onHomeClick,
  onTasksClick,
  onAIAssistantClick,
  onStatsClick,
  onMenuClick,
  onQuickAddClick,
  isListening = false,
  className
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const tabs = [
    { title: 'Today', icon: Home },
    { title: 'Tasks', icon: CheckSquare },
    { type: 'separator' as const },
    { title: 'AI', icon: Bot },
    { title: 'Stats', icon: BarChart3 },
    { title: 'More', icon: Menu }
  ];

  const handleTabChange = (index: number | null) => {
    if (index === null) return;

    const tabActions = [
      onHomeClick,     // Today
      onTasksClick,    // Tasks
      undefined,       // Separator
      onAIAssistantClick,  // AI Assistant
      onStatsClick,    // Stats
      () => setIsMoreMenuOpen(true)  // More - open menu popup
    ];

    // Adjust index to account for separator
    const actualIndex = index >= 2 ? index + 1 : index;
    const action = tabActions[actualIndex];
    action?.();
  };

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50',
          'safe-area-pb', // Show on all screen sizes
          'flex justify-center items-center p-4',
          // Desktop optimization: center with max-width
          'sm:justify-center',
          className
        )}
      >
        <ExpandableTabs
          tabs={tabs}
          onChange={handleTabChange}
          activeColor="text-yellow-400"
          className="bg-gray-800/60 border-gray-600/50 w-full sm:max-w-4xl sm:mx-auto"
        />

        {/* Safe area padding for iOS */}
        <div className="absolute bottom-0 left-0 right-0 h-safe-area-inset-bottom bg-gray-900/95" />
      </motion.div>

      {/* More Menu Popup */}
      <MoreMenuPopup
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
      />
    </>
  );
};

export default BottomNavigation;