import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { useIsMobile } from '@/shared/hooks/use-mobile';

// Tab components (to be created)
import { MorningRoutineTab } from './tabs/MorningRoutineTab';
import { DeepFocusTab } from './tabs/DeepFocusTab';
import { LightWorkTab } from './tabs/LightWorkTab';
import { TimeBoxTab } from './tabs/TimeBoxTab';
import { NightlyCheckoutTab } from './tabs/NightlyCheckoutTab';
import { AIAssistantTab } from './tabs/AIAssistantTab';

export interface TabProps {
  user: any;
  todayCard: any;
  weekCards: any[];
  refreshTrigger: number;
  onRefresh: () => void;
  onTaskToggle: (taskId: string) => void;
  onQuickAdd: () => void;
  onCustomTaskAdd: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => void;
  onVoiceCommand: (command: string) => void;
  onCardClick: (card: any) => void;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onOrganizeTasks: () => void;
  isProcessingVoice: boolean;
  isAnalyzingTasks: boolean;
  lastThoughtDumpResult: any;
  eisenhowerResult: any;
  showEisenhowerModal: boolean;
  onCloseEisenhowerModal: () => void;
  onApplyOrganization: () => void;
  onReanalyze: () => void;
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<TabProps>;
  timeRelevance: number[];
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'morning',
    name: 'Morning',
    icon: Sunrise,
    component: MorningRoutineTab,
    timeRelevance: [6, 7, 8, 9],
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    icon: Target,
    component: DeepFocusTab,
    timeRelevance: [9, 10, 11, 14, 15, 16],
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'light',
    name: 'Light Work',
    icon: Zap,
    component: LightWorkTab,
    timeRelevance: [11, 12, 13, 16, 17],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'timebox',
    name: 'Time Box',
    icon: Calendar,
    component: TimeBoxTab,
    timeRelevance: [8, 12, 17],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'checkout',
    name: 'Checkout',
    icon: Moon,
    component: NightlyCheckoutTab,
    timeRelevance: [18, 19, 20, 21],
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'ai',
    name: 'AI Chat',
    icon: Bot,
    component: AIAssistantTab,
    timeRelevance: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    color: 'from-cyan-500 to-teal-500'
  }
];

interface LifeLockTabContainerProps extends TabProps {}

export const LifeLockTabContainer: React.FC<LifeLockTabContainerProps> = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get smart default tab based on time of day
  const getSmartDefaultTab = (): string => {
    const hour = new Date().getHours();
    
    // Find tab most relevant to current time
    const relevantTab = tabs.find(tab => 
      tab.timeRelevance.includes(hour)
    );
    
    return relevantTab?.id || 'morning';
  };

  const [activeTabId, setActiveTabId] = useState<string>(
    searchParams.get('tab') || getSmartDefaultTab()
  );
  
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTabId);
  const activeTab = tabs[activeTabIndex];

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTabId });
  }, [activeTabId, setSearchParams]);

  // Swipe gesture handling
  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If user is clearly trying to scroll vertically, don't capture drag
    if (Math.abs(info.velocity.y) > Math.abs(info.velocity.x)) {
      return false; // Let native scroll handle it
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;
    
    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold) {
      if (info.offset.x > 0) {
        // Swiped right - go to previous tab
        navigateTab('prev');
      } else {
        // Swiped left - go to next tab
        navigateTab('next');
      }
    }
  };

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

  const ActiveTabComponent = activeTab.component;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Tab Content with Swipe Support */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          dragDirectionLock={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="h-full"
          style={{ touchAction: 'pan-y' }}
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
              <ActiveTabComponent {...props} />
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