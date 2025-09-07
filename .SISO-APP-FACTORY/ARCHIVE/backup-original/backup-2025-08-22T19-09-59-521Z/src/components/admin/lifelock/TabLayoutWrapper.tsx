import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { 
  Sunrise, 
  Target, 
  Zap, 
  Calendar, 
  Moon, 
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  timeRelevance: number[];
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'morning',
    name: 'Morning',
    icon: Sunrise,
    timeRelevance: [6, 7, 8, 9],
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: Target,
    timeRelevance: [9, 10, 11, 14, 15, 16],
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'light',
    name: 'Light Work',
    icon: Zap,
    timeRelevance: [11, 12, 13, 16, 17],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'timebox',
    name: 'Time Box',
    icon: Calendar,
    timeRelevance: [8, 12, 17],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'checkout',
    name: 'Checkout',
    icon: Moon,
    timeRelevance: [18, 19, 20, 21],
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'ai',
    name: 'AI Chat',
    icon: Bot,
    timeRelevance: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    color: 'from-cyan-500 to-teal-500'
  }
];

interface TabLayoutWrapperProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  children: (activeTab: string) => ReactNode;
}

export const TabLayoutWrapper: React.FC<TabLayoutWrapperProps> = ({ 
  selectedDate, 
  onDateChange, 
  children 
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Get smart default tab based on time of day
  const getSmartDefaultTab = (): string => {
    const hour = new Date().getHours();
    const relevantTab = tabs.find(tab => tab.timeRelevance.includes(hour));
    return relevantTab?.id || 'morning';
  };

  const [activeTabId, setActiveTabId] = useState<string>(
    searchParams.get('tab') || getSmartDefaultTab()
  );
  
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabId);
  const activeTab = tabs[activeTabIndex];

  // Update URL when tab or date changes
  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', activeTabId);
    newParams.set('date', format(selectedDate, 'yyyy-MM-dd'));
    setSearchParams(newParams);
  }, [activeTabId, selectedDate, setSearchParams]);

  // Day navigation
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' 
      ? addDays(selectedDate, 1) 
      : subDays(selectedDate, 1);
    onDateChange(newDate);
  };

  // Tab navigation
  const navigateTab = (direction: 'prev' | 'next') => {
    const currentIndex = activeTabIndex;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    }
    
    setActiveTabId(tabs[newIndex].id);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  // Swipe gesture handling for tab navigation
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 80; // Reduced threshold for easier swiping
    const swipeVelocityThreshold = 400; // Reduced velocity threshold
    
    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        // Swipe right - go to previous tab
        navigateTab('prev');
      } else {
        // Swipe left - go to next tab
        navigateTab('next');
      }
    }
  };

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

  const today = new Date();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Day Navigation Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-b border-orange-400/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDay('prev')}
            className="text-gray-300 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-white">
              {format(selectedDate, 'EEEE')}
            </h1>
            <p className="text-sm text-gray-300">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
            {isToday && (
              <Badge className="mt-1 bg-orange-500/20 text-orange-300 border-orange-500/40 text-xs">
                Today
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDay('next')}
            className="text-gray-300 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {isMobile && (
          <div className="text-center mt-2 text-xs text-gray-500">
            Swipe left/right to change tabs
          </div>
        )}
      </div>

      {/* Tab Content with Swipe Support */}
      <div className="flex-1 relative overflow-hidden touch-action-pan-y">
        <motion.div
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          dragMomentum={false}
          whileDrag={{ scale: 0.98 }}
          onDragEnd={handleDragEnd}
          className="h-full touch-pan-y"
        >
          <AnimatePresence mode="wait" custom={activeTabIndex}>
            <motion.div
              key={activeTabId}
              custom={activeTabIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 overflow-y-auto"
            >
              {/* Render tab content via children function */}
              {children(activeTabId)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-t border-orange-400/20 px-4 py-3">
        {/* Mobile: Bottom Tab Bar */}
        {isMobile ? (
          <div className="flex justify-around items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 transition-all duration-200 min-w-0 flex-1",
                    tab.id === activeTabId 
                      ? "text-orange-400" 
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    tab.id === activeTabId 
                      ? `bg-gradient-to-r ${tab.color}` 
                      : "bg-gray-700/50"
                  )}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium truncate">{tab.name}</span>
                </Button>
              );
            })}
          </div>
        ) : (
          /* Desktop: Full Tab Bar */
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={tab.id === activeTabId ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 transition-all duration-200",
                    tab.id === activeTabId 
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};