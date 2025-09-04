import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { 
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { TAB_CONFIG, TabId, getAllTabIds } from '@/ai-first/core/tab-config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLifeLockData } from '@/hooks/useLifeLockData';

// Use centralized tab configuration to prevent routing inconsistencies
const tabs = Object.values(TAB_CONFIG);

interface TabLayoutWrapperProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  children: (activeTab: string, navigateDay?: (direction: 'prev' | 'next') => void) => ReactNode;
}

export const TabLayoutWrapper: React.FC<TabLayoutWrapperProps> = ({ 
  selectedDate, 
  onDateChange, 
  children 
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data } = useLifeLockData(selectedDate);
  
  // Get smart default tab based on time of day
  const getSmartDefaultTab = (): string => {
    const hour = new Date().getHours();
    const relevantTab = tabs.find(tab => tab.timeRelevance.includes(hour));
    return relevantTab?.id || 'morning';
  };

  // Calculate total XP from all sections
  const getTotalXP = () => {
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
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Hidden Header - Now using AnimatedDateHeader in each tab */}

      {/* Tab Content with Swipe Support (All Devices) */}
      <div className="flex-1 relative overflow-hidden touch-action-pan-y">
        <motion.div
          drag="x"
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
                // Full height content with more bottom padding for navigation clearance
                paddingBottom: isMobile ? '120px' : '100px',
                // Prevent overscroll that might interfere with touch events
                overscrollBehavior: 'contain'
              }}
            >
              {/* Render tab content via children function */}
              {children(activeTabId, navigateDay)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Tab Navigation - Transparent Floating */}
      <div className="absolute bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
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