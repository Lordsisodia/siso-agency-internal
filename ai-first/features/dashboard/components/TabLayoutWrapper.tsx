import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { 
  Sunrise, 
  Target, 
  Zap, 
  Calendar, 
  Moon, 
  Bot,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
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
    id: 'work',
    name: 'Work',
    icon: Zap,
    timeRelevance: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    color: 'from-blue-500 to-green-500'
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
  const navigate = useNavigate();
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
    const swipeThreshold = 60; // More sensitive threshold for easier swiping
    const swipeVelocityThreshold = 300; // More sensitive velocity threshold
    
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
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Day Navigation Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-b border-orange-400/20 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/lifelock')}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDay('prev')}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Date Display */}
          <div className="flex flex-col items-center mx-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {format(selectedDate, 'EEEE')}
            </h1>
            <p className="text-sm text-gray-300 mt-0.5">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
            {isToday && (
              <Badge className="mt-2 bg-orange-500/20 text-orange-300 border-orange-500/40 text-xs px-2 py-0.5">
                Today
              </Badge>
            )}
          </div>

          {/* Right: Next Button */}
          <div className="flex items-center justify-end min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDay('next')}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isMobile && (
          <div className="text-center mt-3 text-xs text-gray-400">
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
          className="h-full touch-pan-y relative z-10"
          style={{ 
            // Prevent content from interfering with bottom navigation
            paddingBottom: isMobile ? '0px' : '0px' 
          }}
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
              className="absolute inset-0 overflow-y-auto overscroll-y-contain"
              style={{ 
                // Ensure content doesn't overlap bottom nav
                paddingBottom: isMobile ? '100px' : '20px',
                // Prevent overscroll that might interfere with touch events
                overscrollBehavior: 'contain'
              }}
            >
              {/* Render tab content via children function */}
              {children(activeTabId)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="flex-shrink-0 px-4 py-4 relative z-50 flex justify-center">
        {/* Mobile: ExpandableTabs Component */}
        {isMobile ? (
          <ExpandableTabs
            tabs={tabs.map(tab => ({
              title: tab.name,
              icon: tab.icon
            }))}
            activeIndex={activeTabIndex}
            activeColor="text-orange-400"
            className="bg-transparent border-transparent shadow-none"
            onChange={(index) => {
              if (index !== null) {
                handleTabClick(tabs[index].id);
              }
            }}
          />
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