import React, { useState, ReactNode, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { TAB_CONFIG, TabId, getAllTabIds } from '@/services/shared/tab-config';
import { NAV_SECTIONS, LEGACY_TAB_MAPPING } from '@/services/shared/navigation-config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsolidatedBottomNav } from '@/domains/lifelock/1-daily/_shared/components/navigation/ConsolidatedBottomNav';
import { BevelDateHeader, UnifiedTopNav, SwipeableSubTabContent } from '@/domains/lifelock/1-daily/_shared/components';
import { useDateCompletionMap } from '@/domains/lifelock/1-daily/_shared/hooks/useDateCompletionMap';
import { useDateXPMap } from '@/domains/lifelock/1-daily/_shared/hooks/useDateXPMap';
import { useDateScreenTimeMap } from '@/domains/lifelock/1-daily/_shared/hooks/useDateScreenTimeMap';
import { SectionSubNav } from '@/components/navigation/SectionSubNav';
import { cn } from '@/lib/utils';
import { calculateDayCompletionPercentage } from '@/lib/utils/dayProgress';
import { checkMorningRoutineCompletion, getDefaultTimeboxSubtab } from '@/domains/lifelock/_shared/utils/timeboxNavigation';
import { useSubtabCompletion } from '@/domains/lifelock/_shared/services/subtabCompletionService';

// Use centralized tab configuration to prevent routing inconsistencies
const tabs = Object.values(TAB_CONFIG);

// Section-specific colors for bottom navigation
const TAB_COLORS: Record<string, string> = {
  'morning': 'text-orange-400',      // Morning routine - orange
  'light-work': 'text-emerald-400',  // Light work - green  
  'work': 'text-blue-400',           // Deep work - blue
  'wellness': 'text-red-400',        // Wellness - red
  'tasks': 'text-amber-400',         // Tasks - amber
  'timebox': 'text-sky-400',         // Timebox - light blue
  'checkout': 'text-purple-400'      // Checkout - purple
};

// Section-specific background colors for active tab (lighter versions)
const TAB_BG_COLORS: Record<string, string> = {
  'morning': 'bg-orange-400/20',      // Morning routine - light orange
  'light-work': 'bg-emerald-400/20',  // Light work - light green  
  'work': 'bg-blue-400/20',           // Deep work - light blue
  'wellness': 'bg-red-400/20',        // Wellness - light red
  'tasks': 'bg-amber-400/20',         // Tasks - light amber
  'timebox': 'bg-sky-400/20',         // Timebox - lighter blue
  'checkout': 'bg-purple-400/20'      // Checkout - light purple
};

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
  const location = useLocation();

  // NEW: Section and subtab state for consolidated navigation
  const [activeSection, setActiveSection] = useState<string>('timebox');
  const [activeSubTab, setActiveSubTab] = useState<string>('timebox');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [morningRoutineCompleted, setMorningRoutineCompleted] = useState<boolean>(false);
  const [hasCheckedMorningRoutine, setHasCheckedMorningRoutine] = useState<boolean>(false);

  // Fetch date completion map for the dropdown
  const { completionMap } = useDateCompletionMap(userId || undefined);

  // Fetch XP map for the date picker modal
  const { xpMap } = useDateXPMap(userId || undefined, selectedDate);

  // Fetch screen time map for the date picker modal
  const { screenTimeMap } = useDateScreenTimeMap(userId || undefined, selectedDate);

  // Subtab completion management
  const { completedSubtabs, toggleCompleted, setCompleted } = useSubtabCompletion(selectedDate, userId);

  // Completion percentages for subtabs
  const [completionPercentages, setCompletionPercentages] = useState<Record<string, number>>({});

  // Fetch morning routine completion percentage
  useEffect(() => {
    if (!userId || activeSection !== 'timebox') return;

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    if (!isToday) return;

    const fetchMorningProgress = async () => {
      try {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/morning-routine?userId=${userId}&date=${dateKey}`);

        if (response.ok) {
          const data = await response.json();
          if (data?.completionPercentage !== undefined) {
            setCompletionPercentages(prev => ({
              ...prev,
              morning: data.completionPercentage
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch morning routine progress:', error);
      }
    };

    fetchMorningProgress();
  }, [selectedDate, userId, activeSection, morningRoutineCompleted]);

  // Bulk action handlers
  const handleBulkAction = useCallback((action: 'markAllComplete' | 'markAllIncomplete') => {
    const currentSection = NAV_SECTIONS.find(s => s.id === activeSection);
    if (!currentSection?.subSections) return;

    const subtabIds = currentSection.subSections.map(s => s.id);

    if (action === 'markAllComplete') {
      subtabIds.forEach(subtabId => {
        if (!completedSubtabs.includes(subtabId)) {
          setCompleted(subtabId, true);
        }
      });
      // Trigger confetti for bulk complete
      if (typeof window !== 'undefined') {
        const { celebrateSides } = require('@/lib/utils/confetti');
        celebrateSides();
      }
    } else {
      subtabIds.forEach(subtabId => {
        if (completedSubtabs.includes(subtabId)) {
          setCompleted(subtabId, false);
        }
      });
    }
  }, [activeSection, completedSubtabs, setCompleted]);

  // Handle legacy tab URLs for backward compatibility
  useEffect(() => {
    const legacyTab = searchParams.get('tab');
    if (legacyTab && LEGACY_TAB_MAPPING[legacyTab]) {
      const { section, subtab } = LEGACY_TAB_MAPPING[legacyTab];
      setActiveSection(section);
      if (subtab) setActiveSubTab(subtab);
      // Remove legacy tab param
      searchParams.delete('tab');
      setSearchParams(searchParams);
    }
  }, []);

  // Read from URL params on mount (new format)
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const subtabParam = searchParams.get('subtab');

    if (sectionParam) {
      setActiveSection(sectionParam);
      if (subtabParam) {
        setActiveSubTab(subtabParam);
      } else if (sectionParam === 'timebox') {
        // For timebox section, default to morning tab initially
        // This will be updated by the morning routine completion check
        setActiveSubTab('morning');
      }
    } else {
      // Default to timebox section with morning subtab
      setActiveSection('timebox');
      setActiveSubTab('morning');
    }
  }, []);

  // Get smart defaults based on time of day
  const getSmartDefaultTab = (): string => {
    return 'morning';
  };

  // Legacy: keep activeTabId for compatibility with existing children
  const [activeTabId, setActiveTabId] = useState<string>(
    searchParams.get('tab') || getSmartDefaultTab()
  );

  // Get current section config (moved before effectiveTabId calculation)
  const currentSection = NAV_SECTIONS.find(s => s.id === activeSection);

  // Use activeSubTab if available, otherwise fall back to activeSection, then legacy tab
  // For sections without sub-nav, use the section ID directly as the tab ID
  const hasSubNav = currentSection?.hasSubNav;
  const effectiveTabId = hasSubNav ? (activeSubTab || activeSection || activeTabId) : activeSection;

  const activeTabIndex = tabs.findIndex(tab => tab.id === effectiveTabId);
  const activeTab = tabs[activeTabIndex];

  // Initialize URL with current tab if not present (legacy)
  useEffect(() => {
    if (!searchParams.get('tab') && !searchParams.get('section')) {
      setSearchParams({ tab: activeTabId }, { replace: true });
    }
  }, []);

  // Update URL when section/subtab changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeSection) params.set('section', activeSection);
    if (activeSubTab && activeSubTab !== activeSection) params.set('subtab', activeSubTab);
    if (params.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [activeSection, activeSubTab]);

  // Sync legacy activeTabId with new state
  useEffect(() => {
    setActiveTabId(effectiveTabId);
  }, [effectiveTabId]);

  // Check morning routine completion when on timebox section
  useEffect(() => {
    // Only check if we're on the timebox section and viewing today
    if (activeSection !== 'timebox') {
      return;
    }

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    if (!isToday || !userId) {
      // If not today or no user, don't check - use current subtab as-is
      return;
    }

    // Check morning routine completion status
    const checkCompletion = async () => {
      try {
        const completed = await checkMorningRoutineCompletion(selectedDate, userId);
        setMorningRoutineCompleted(completed);
        setHasCheckedMorningRoutine(true);

        // Only auto-switch if we haven't already set a subtab via URL
        const subtabParam = searchParams.get('subtab');
        if (!subtabParam) {
          const defaultSubtab = getDefaultTimeboxSubtab({
            morningRoutineCompleted: completed,
            selectedDate,
            userId
          });
          setActiveSubTab(defaultSubtab);
        }
      } catch (error) {
        console.error('Failed to check morning routine completion:', error);
        setHasCheckedMorningRoutine(true);
      }
    };

    checkCompletion();
  }, [selectedDate, userId, activeSection]);

  // Auto-switch to checkout based on time (when morning routine is completed)
  useEffect(() => {
    // Only apply this logic when on timebox section and viewing today
    if (activeSection !== 'timebox') {
      return;
    }

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    if (!isToday) {
      return;
    }

    // Don't override if user has manually selected a subtab
    const subtabParam = searchParams.get('subtab');
    if (subtabParam) {
      return;
    }

    // If morning routine is completed, check if we should show checkout
    if (hasCheckedMorningRoutine && morningRoutineCompleted) {
      const defaultSubtab = getDefaultTimeboxSubtab({
        morningRoutineCompleted: true,
        selectedDate,
        userId
      });

      // Update subtab if it should be checkout
      if (defaultSubtab === 'checkout' && activeSubTab !== 'checkout') {
        setActiveSubTab('checkout');
      } else if (defaultSubtab === 'timebox' && activeSubTab === 'morning') {
        // Transition from morning to timebox after completion
        setActiveSubTab('timebox');
      }
    }
  }, [morningRoutineCompleted, hasCheckedMorningRoutine, selectedDate, activeSection, activeSubTab]);

  // Sync morning routine completion with subtab completion state
  useEffect(() => {
    if (!hasCheckedMorningRoutine || !userId) {
      return;
    }

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    if (!isToday) {
      return;
    }

    // Automatically mark morning subtab as completed if morning routine is completed
    if (morningRoutineCompleted && !completedSubtabs.includes('morning')) {
      toggleCompleted('morning');
    } else if (!morningRoutineCompleted && completedSubtabs.includes('morning')) {
      // Unmark if morning routine is no longer completed (shouldn't happen normally)
      toggleCompleted('morning');
    }
  }, [morningRoutineCompleted, hasCheckedMorningRoutine, selectedDate, userId]);

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
      {/* SCROLLABLE CONTENT AREA - Contains header, pills, and content */}
      <div className="flex-1 relative overflow-x-hidden overflow-y-hidden">
        <AnimatePresence mode="popLayout" custom={activeTabIndex}>
          <motion.div
            key={effectiveTabId}
            custom={activeTabIndex}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 35 },
              opacity: { duration: 0.15 },
            }}
            className="h-full overflow-x-hidden overflow-y-auto"
            style={{
              paddingBottom: '100px',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}
          >
            {/* NEW Unified Top Navigation */}
            <UnifiedTopNav
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              completionPercentage={calculateDayCompletionPercentage(selectedDate)}
              activeTab={effectiveTabId}
              dateCompletionMap={completionMap}
              dateXPMap={xpMap}
              dateScreenTimeMap={screenTimeMap}
              onPickerOpenChange={setIsDatePickerOpen}
            />

            {/* NEW: Sub-navigation for sections that have it */}
            {currentSection?.hasSubNav && (
              <SectionSubNav
                subSections={currentSection.subSections || []}
                activeSubTab={activeSubTab}
                onSubTabChange={(subTab) => setActiveSubTab(subTab)}
                activeColor={currentSection.color}
                activeBgColor={currentSection.bgActive}
                completedSubTabs={completedSubtabs}
                onToggleComplete={toggleCompleted}
                completionPercentages={completionPercentages}
                onBulkAction={handleBulkAction}
              />
            )}

            {/* Render tab content via children function */}
            {currentSection?.hasSubNav ? (
              <SwipeableSubTabContent
                subSections={currentSection.subSections || []}
                activeSubTab={activeSubTab}
                onSubTabChange={(subTab) => setActiveSubTab(subTab)}
              >
                {(subTab) => children(subTab, navigateDay)}
              </SwipeableSubTabContent>
            ) : (
              children(effectiveTabId, navigateDay)
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Tab Navigation - Hidden when AI chat is open or date picker is open */}
      {!hideBottomNav && !isDatePickerOpen && (
        <ConsolidatedBottomNav
          activeSection={activeSection}
          activeSubTab={activeSubTab}
          onSectionChange={(section, subtab) => {
            setActiveSection(section);
            if (subtab) setActiveSubTab(subtab);
          }}
        />
      )}

    </div>
  );
};

TabLayoutWrapper.displayName = 'TabLayoutWrapper';
