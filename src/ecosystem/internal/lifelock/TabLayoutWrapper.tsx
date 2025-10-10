import React, { useState, ReactNode, memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { 
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { TAB_CONFIG, TabId, getAllTabIds } from '@/shared/services/tab-config';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ExpandableTabs } from '@/shared/ui/expandable-tabs';
import { cn } from '@/shared/lib/utils';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { useLifeLockData } from '@/ecosystem/internal/lifelock/useLifeLockData';
import { OfflineIndicator } from '@/shared/components/OfflineIndicator';
import { BottomActionBars } from '@/shared/components/BottomActionBars';

// Use centralized tab configuration to prevent routing inconsistencies
const tabs = Object.values(TAB_CONFIG);

interface TabLayoutWrapperProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  userId?: string | null;  // Add userId prop
  children: (activeTab: string, navigateDay?: (direction: 'prev' | 'next') => void) => ReactNode;
}

export const TabLayoutWrapper: React.FC<TabLayoutWrapperProps> = ({
  selectedDate,
  onDateChange,
  userId,
  children
}) => {
const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data } = useLifeLockData(selectedDate);
  
  // Get smart default tab based on time of day
  const getSmartDefaultTab = (): string => {
    // BUSINESS FIX: Always default to morning to show comprehensive morning routine
    return 'morning';
    
    // TODO: Re-enable time-based logic after morning routine is stable
    // const hour = new Date().getHours();
    // const relevantTab = tabs.find(tab => tab.timeRelevance.includes(hour));
    // return relevantTab?.id || 'morning';
  };

  // Calculate total XP from all sections - memoized for performance
  const getTotalXP = useMemo(() => {
    let totalXP = 0;
    let earnedXP = 0;
    
    if (!data) return { earnedXP: 0, totalXP: 0, percentage: 0 };
    
    // Morning routine XP
    if (data.morningTasks) {
      data.morningTasks.forEach((task: any) => {
        const mainTaskXP = 15; // Higher XP for morning routine
        totalXP += mainTaskXP;
        if (task.completed) earnedXP += mainTaskXP;
        
        if (task.subTasks) {
          task.subTasks.forEach((subtask: any) => {
            const subtaskXP = 5;
            totalXP += subtaskXP;
            if (subtask.completed) earnedXP += subtaskXP;
          });
        }
      });
    }
    
    // Light work XP  
    if (data.lightWorkTasks) {
      data.lightWorkTasks.forEach((task: any) => {
        const mainTaskXP = 10;
        totalXP += mainTaskXP;
        if (task.completed) earnedXP += mainTaskXP;
        
        if (task.subTasks) {
          task.subTasks.forEach((subtask: any) => {
            const subtaskXP = 5;
            totalXP += subtaskXP;
            if (subtask.completed) earnedXP += subtaskXP;
          });
        }
      });
    }
    
    // Deep work XP
    if (data.deepWorkTasks) {
      data.deepWorkTasks.forEach((task: any) => {
        const mainTaskXP = 20; // Higher XP for deep work
        totalXP += mainTaskXP;
        if (task.completed) earnedXP += mainTaskXP;
        
        if (task.subTasks) {
          task.subTasks.forEach((subtask: any) => {
            const subtaskXP = 8; // Higher subtask XP for deep work
            totalXP += subtaskXP;
            if (subtask.completed) earnedXP += subtaskXP;
          });
        }
      });
    }
    
    // Wellness/workout XP
    if (data.wellnessTasks) {
      data.wellnessTasks.forEach((task: any) => {
        const mainTaskXP = 12;
        totalXP += mainTaskXP;
        if (task.completed) earnedXP += mainTaskXP;
      });
    }
    
    // Checkout XP
    if (data.checkoutTasks) {
      data.checkoutTasks.forEach((task: any) => {
        const mainTaskXP = 8;
        totalXP += mainTaskXP;
        if (task.completed) earnedXP += mainTaskXP;
      });
    }
    
    return { 
      earnedXP, 
      totalXP, 
      percentage: totalXP > 0 ? (earnedXP / totalXP) * 100 : 0 
    };
  }, [data]);

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
  }, [activeTabId, selectedDate, searchParams, setSearchParams]);

  // Day navigation - memoized to prevent child re-renders
  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    const newDate = direction === 'next' 
      ? addDays(selectedDate, 1) 
      : subDays(selectedDate, 1);
    onDateChange(newDate);
  }, [selectedDate, onDateChange]);

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

  // Swipe gesture handling for tab navigation (enabled for all devices)
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
    <div className="flex flex-col h-screen w-full overflow-hidden" style={{ backgroundColor: '#111827' }}>
      {/* Clean Offline Indicator - Moved to bottom as part of BottomActionBars */}
      {/* <OfflineIndicator /> */}

      {/* UNIFIED SCROLL CONTAINER - Single scroll area for entire screen */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        <motion.div
          className="h-full relative z-10 bg-gray-900"
          style={{
            // PWA-optimized touch handling - full scroll freedom
            touchAction: 'auto'
          }}
        >
          <AnimatePresence mode="popLayout" custom={activeTabIndex}>
            <motion.div
              key={activeTabId}
              custom={activeTabIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 35 },
                opacity: { duration: 0.15 },
              }}
              className="h-full overflow-y-auto bg-gray-900"
              style={{
                // SINGLE SCROLL CONTAINER - this is the ONLY scrollable area
                paddingBottom: '140px', // Optimized: BottomActionBars (48px) + ExpandableTabs (50px) + gaps (42px)
                // PWA scroll optimization for mobile
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                // Prevent bounce effects that compete with swipe gestures
                overscrollBehaviorY: 'contain'
              }}
            >
              {/* Header with Back and Hamburger - Scrollable */}
              <div className="flex items-center justify-between px-4 pt-2 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/life-lock/weekly')}
                  className="text-siso-text-muted hover:text-siso-text hover:bg-transparent -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Weekly
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-siso-text-muted hover:text-siso-text hover:bg-transparent"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Render tab content via children function */}
              {children(activeTabId, navigateDay)}

              {/* Bottom Action Bars - inside scroll container */}
              <BottomActionBars />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Tab Navigation - Transparent Floating */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
        {/* Swipe-Style Interface for All Devices */}
        <ExpandableTabs
          tabs={tabs.map(tab => ({
            title: tab.name,
            icon: tab.icon
          }))}
          activeIndex={activeTabIndex}
          activeColor="text-orange-400"
          className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg rounded-2xl"
          onChange={(index) => {
            if (index !== null) {
              handleTabClick(tabs[index].id);
            }
          }}
        />
        </div>
      </div>

    </div>
  );
};

TabLayoutWrapper.displayName = 'TabLayoutWrapper';