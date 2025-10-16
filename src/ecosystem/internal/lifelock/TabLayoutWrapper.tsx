import React, { useState, ReactNode, useCallback, useEffect } from 'react';
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
import { DailyBottomNav } from './views/daily/_shared/components';
import { cn } from '@/shared/lib/utils';

// Use centralized tab configuration to prevent routing inconsistencies
const tabs = Object.values(TAB_CONFIG);

interface TabLayoutWrapperProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  userId?: string | null;  // Add userId prop
  hideBottomNav?: boolean;  // Hide navigation when AI chat is open
  children: (activeTab: string, navigateDay?: (direction: 'prev' | 'next') => void) => ReactNode;
}

export const TabLayoutWrapper: React.FC<TabLayoutWrapperProps> = ({
  selectedDate,
  onDateChange,
  userId,
  hideBottomNav = false,
  children
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Get smart default tab based on time of day
  const getSmartDefaultTab = (): string => {
    // BUSINESS FIX: Always default to morning to show comprehensive morning routine
    return 'morning';
    
    // TODO: Re-enable time-based logic after morning routine is stable
    // const hour = new Date().getHours();
    // const relevantTab = tabs.find(tab => tab.timeRelevance.includes(hour));
    // return relevantTab?.id || 'morning';
  };

  const [activeTabId, setActiveTabId] = useState<string>(
    searchParams.get('tab') || getSmartDefaultTab()
  );

  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabId);
  const activeTab = tabs[activeTabIndex];

  // Initialize URL with current tab if not present
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: activeTabId }, { replace: true });
    }
  }, []); // Run only on mount

  // Clean URLs - no query params for tab/date (managed in component state only)

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

    const newTabId = tabs[newIndex].id;
    setActiveTabId(newTabId);
    // Update URL to persist tab selection across refreshes
    setSearchParams({ tab: newTabId });
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    // Update URL to persist tab selection across refreshes
    setSearchParams({ tab: tabId });
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
    <div className="flex flex-col h-screen w-full overflow-hidden" style={{ backgroundColor: '#121212' }}>
      {/* Clean Offline Indicator - Moved to bottom as part of BottomActionBars */}
      {/* <OfflineIndicator /> */}

      {/* UNIFIED SCROLL CONTAINER - Single scroll area for entire screen */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          className="h-full relative z-10"
          style={{
            // PWA-optimized touch handling - full scroll freedom
            touchAction: 'auto',
            backgroundColor: 'transparent'
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
              className="h-full overflow-y-auto"
              style={{
                // SINGLE SCROLL CONTAINER - this is the ONLY scrollable area
                paddingBottom: '92px', // Optimized: ExpandableTabs (50px) + gaps (42px)
                // PWA scroll optimization for mobile
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                // Prevent bounce effects that compete with swipe gestures
                overscrollBehaviorY: 'contain'
              }}
            >
              {/* Header with Back button - Scrollable */}
              <div className="flex items-center justify-between px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/lifelock/weekly')}
                  className="text-siso-text-muted hover:text-siso-text hover:bg-transparent -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Weekly View
                </Button>
              </div>

              {/* Render tab content via children function */}
              {children(activeTabId, navigateDay)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Tab Navigation - Hidden when AI chat is open */}
      {!hideBottomNav && (
        <DailyBottomNav
          tabs={tabs.map(tab => ({
            title: tab.name,
            icon: tab.icon
          }))}
          activeIndex={activeTabIndex}
          activeColor="text-orange-400"
          onChange={(index) => {
            if (index !== null) {
              handleTabClick(tabs[index].id);
            }
          }}
        />
      )}

    </div>
  );
};

TabLayoutWrapper.displayName = 'TabLayoutWrapper';