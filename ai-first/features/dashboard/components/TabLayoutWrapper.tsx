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
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Unified Header Card */}
      <div className="flex-shrink-0 bg-gradient-to-br from-black via-gray-900 to-black px-4 py-3">
        <div className="flex items-center justify-center relative">
          {/* Left: Back Icon Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/lifelock')}
            className="absolute left-0 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Center: Compact Date + XP Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
            {/* Single Row: Date Navigation + XP */}
            <div className="flex items-center justify-between px-4 py-2">
              {/* Left: Previous Arrow */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDay('prev')}
                className="text-gray-300 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Center: Date + XP */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <h1 className="text-base font-bold text-white tracking-tight">
                    {format(selectedDate, 'EEE')}
                  </h1>
                  <p className="text-sm text-gray-300">
                    {format(selectedDate, 'MMM d')}
                  </p>
                  {isToday && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 text-xs px-2 py-1 rounded-full">
                      Today
                    </Badge>
                  )}
                </div>
                
                {/* XP Display */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-purple-300">⚡ {getTotalXP().earnedXP}/{getTotalXP().totalXP}</span>
                  <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border-purple-400/30 text-xs px-2 py-0.5">
                    L1
                  </Badge>
                </div>
              </div>
              
              {/* Right: Next Arrow */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateDay('next')}
                className="text-gray-300 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Compact Progress Bar */}
            <div className="px-4 pb-2">
              <div className="relative w-full bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getTotalXP().percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
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
        {/* Mobile: ExpandableTabs Component */}
        {isMobile ? (
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
    </div>
  );
};