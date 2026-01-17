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
import { BevelDateHeader, UnifiedTopNav, SwipeableSubTabContent, XPToastNotification, useXPToasts } from '@/domains/lifelock/1-daily/_shared/components';
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
  'health': 'text-rose-400',         // Health - rose
  'tasks': 'text-amber-400',         // Tasks - amber
  'plan': 'text-purple-400',         // Plan - purple
  'diet': 'text-green-400',          // Diet - green
  'timebox': 'text-purple-400',       // Timebox (for backward compat)
  'checkout': 'text-purple-400'      // Checkout - purple
};

// Section-specific background colors for active tab (lighter versions)
const TAB_BG_COLORS: Record<string, string> = {
  'morning': 'bg-orange-400/20',      // Morning routine - light orange
  'light-work': 'bg-emerald-400/20',  // Light work - light green
  'work': 'bg-blue-400/20',           // Deep work - light blue
  'health': 'bg-rose-400/20',         // Health - light rose
  'tasks': 'bg-amber-400/20',         // Tasks - light amber
  'plan': 'bg-purple-400/20',         // Plan - light purple
  'diet': 'bg-green-400/20',          // Diet - light green
  'timebox': 'bg-purple-400/20',      // Timebox (for backward compat)
  'checkout': 'bg-purple-400/20'      // Checkout - light purple
};

// Section-specific accent line colors (left border)
const ACCENT_LINE_COLORS: Record<string, { from: string; via: string; to: string; shadow: string }> = {
  'morning': { from: 'from-orange-500/60', via: 'via-orange-600/60', to: 'to-orange-700/60', shadow: 'shadow-orange-500/20' },
  'light-work': { from: 'from-emerald-500/60', via: 'via-green-500/60', to: 'to-emerald-600/60', shadow: 'shadow-emerald-500/20' },
  'work': { from: 'from-blue-500/60', via: 'via-blue-600/60', to: 'to-blue-700/60', shadow: 'shadow-blue-500/20' },
  'health': { from: 'from-blue-500/60', via: 'via-cyan-500/60', to: 'to-blue-600/60', shadow: 'shadow-blue-500/20' },
  'water': { from: 'from-blue-500/60', via: 'via-cyan-500/60', to: 'to-blue-600/60', shadow: 'shadow-blue-500/20' },
  'fitness': { from: 'from-rose-500/60', via: 'via-red-500/60', to: 'to-rose-600/60', shadow: 'shadow-rose-500/20' },
  'smoking': { from: 'from-purple-500/60', via: 'via-pink-500/60', to: 'to-purple-600/60', shadow: 'shadow-purple-500/20' },
  'tasks': { from: 'from-amber-500/60', via: 'via-yellow-500/60', to: 'to-amber-600/60', shadow: 'shadow-amber-500/20' },
  'plan': { from: 'from-purple-500/60', via: 'via-purple-600/60', to: 'to-purple-700/60', shadow: 'shadow-purple-500/20' },
  'diet': { from: 'from-green-500/60', via: 'via-emerald-500/60', to: 'to-green-600/60', shadow: 'shadow-green-500/20' },
  'photo': { from: 'from-green-500/60', via: 'via-emerald-500/60', to: 'to-green-600/60', shadow: 'shadow-green-500/20' },
  'meals': { from: 'from-green-500/60', via: 'via-emerald-500/60', to: 'to-green-600/60', shadow: 'shadow-green-500/20' },
  'macros': { from: 'from-green-500/60', via: 'via-emerald-500/60', to: 'to-green-600/60', shadow: 'shadow-green-500/20' },
  'timebox': { from: 'from-purple-500/60', via: 'via-purple-600/60', to: 'to-purple-700/60', shadow: 'shadow-purple-500/20' },
  'checkout': { from: 'from-purple-500/60', via: 'via-purple-600/60', to: 'to-purple-700/60', shadow: 'shadow-purple-500/20' }
};

interface TabLayoutWrapperProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  userId?: string | null;  // Add userId prop
  hideBottomNav?: boolean;  // Hide navigation when AI chat is open
  children: (activeTab: string, navigateDay?: (direction: 'prev' | 'next') => void, activeSubTab?: string) => ReactNode;
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
  const [activeSection, setActiveSection] = useState<string>('plan');
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

  // XP Toast management
  const { toasts, addToast, removeToast } = useXPToasts();

  // Completion percentages for subtabs
  const [completionPercentages, setCompletionPercentages] = useState<Record<string, number>>({});

  // Fetch morning routine completion percentage
  useEffect(() => {
    if (!userId || activeSection !== 'plan') return;

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
      } else if (sectionParam === 'plan') {
        // For plan section, default to morning tab initially
        // This will be updated by the morning routine completion check
        setActiveSubTab('morning');
      } else if (sectionParam === 'health') {
        // For health section, default to water tab
        setActiveSubTab('water');
      } else if (sectionParam === 'diet') {
        // For diet section, default to photo tab
        setActiveSubTab('photo');
      } else if (sectionParam === 'tasks') {
        // For tasks section, default to tasks tab
        setActiveSubTab('tasks');
      }
    } else {
      // Default to plan section with morning subtab
      setActiveSection('plan');
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

  // Get accent line colors based on active section or subtab
  // For sections with sub-navigation, use the subtab color for more specific theming
  const colorKey = hasSubNav ? activeSubTab : activeSection;
  const accentColors = ACCENT_LINE_COLORS[colorKey] || ACCENT_LINE_COLORS[activeSection] || ACCENT_LINE_COLORS['plan'];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden relative bg-white/5">
      {/* Page accent line on left side - fixed to true viewport edge, dynamic color based on section */}
      <div className={`fixed top-0 left-0 w-1 h-screen bg-gradient-to-b ${accentColors.from} ${accentColors.via} ${accentColors.to} shadow-lg ${accentColors.shadow} pointer-events-none z-50`} />
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
            className="h-full overflow-x-hidden overflow-y-auto hide-scrollbar"
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
              userId={userId}
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
                {(subTab) => children(subTab, navigateDay, subTab)}
              </SwipeableSubTabContent>
            ) : (
              children(effectiveTabId, navigateDay, undefined)
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

      {/* XP Toast Notifications */}
      <XPToastNotification
        toasts={toasts}
        onRemove={removeToast}
      />

    </div>
  );
};

TabLayoutWrapper.displayName = 'TabLayoutWrapper';
