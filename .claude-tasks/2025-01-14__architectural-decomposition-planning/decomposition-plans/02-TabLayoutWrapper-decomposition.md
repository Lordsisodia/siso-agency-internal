# 🎯 TabLayoutWrapper.tsx Decomposition Plan

## Current State Analysis

**File:** `/src/shared/components/TabLayoutWrapper.tsx`  
**Risk Level:** 🔴 **HIGH** - Navigation breakage affects entire app

### Current Responsibilities (Too Many!)
1. **Tab Navigation UI** - Rendering tab buttons and active states
2. **Swipe Gesture Detection** - Touch and mouse gesture handling
3. **Tab Animation Logic** - Transitions between tabs
4. **Content Switching** - Rendering appropriate tab content
5. **URL State Sync** - Syncing with browser URL parameters
6. **Mobile Responsiveness** - Different behaviors for mobile vs desktop
7. **Accessibility** - Keyboard navigation and ARIA labels
8. **State Management** - Complex tab transition states

## Decomposition Strategy

### **Phase 1: Extract Navigation Components**

#### `TabNavigation.tsx`
```typescript
interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  disabled?: boolean;
}

export const TabNavigation = ({ tabs, activeTab, onTabChange, disabled }: TabNavigationProps) => {
  return (
    <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
```

#### `TabButton.tsx`
```typescript
interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const TabButton = ({ tab, isActive, onClick, disabled }: TabButtonProps) => {
  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
      }`}
      onClick={onClick}
      disabled={disabled}
      aria-selected={isActive}
      role="tab"
    >
      {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
      {tab.label}
    </button>
  );
};
```

### **Phase 2: Extract Gesture System**

#### `useSwipeGestures.ts`
```typescript
interface SwipeGestureConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useSwipeGestures = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50,
  enabled = true 
}: SwipeGestureConfig) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, enabled]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};
```

#### `GestureWrapper.tsx`
```typescript
interface GestureWrapperProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  enabled?: boolean;
}

export const GestureWrapper = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  enabled = true 
}: GestureWrapperProps) => {
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGestures({
    onSwipeLeft,
    onSwipeRight,
    enabled
  });

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="touch-pan-y"
    >
      {children}
    </div>
  );
};
```

### **Phase 3: Extract Animation System**

#### `TabAnimations.tsx`
```typescript
interface TabAnimationProps {
  activeTab: string;
  direction: 'left' | 'right' | 'none';
  children: ReactNode;
}

export const TabAnimations = ({ activeTab, direction, children }: TabAnimationProps) => {
  const variants = {
    enter: {
      x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'left' ? 300 : direction === 'right' ? -300 : 0,
      opacity: 0,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTab}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
```

#### `useTabTransitions.ts`
```typescript
export const useTabTransitions = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | 'none'>('none');

  const startTransition = useCallback((direction: 'left' | 'right' | 'none' = 'none') => {
    setIsTransitioning(true);
    setTransitionDirection(direction);
    
    // Auto-reset transition state
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection('none');
    }, 300);
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    startTransition
  };
};
```

### **Phase 4: Content Management**

#### `TabContentRenderer.tsx`
```typescript
interface TabContentRendererProps {
  activeTab: string;
  tabs: TabConfig[];
  contentProps: Record<string, any>;
  animationDirection: 'left' | 'right' | 'none';
}

export const TabContentRenderer = ({ 
  activeTab, 
  tabs, 
  contentProps,
  animationDirection 
}: TabContentRendererProps) => {
  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  
  if (!activeTabConfig) {
    return <div>Tab not found</div>;
  }

  const Content = activeTabConfig.component;

  return (
    <TabAnimations activeTab={activeTab} direction={animationDirection}>
      <Content {...contentProps} />
    </TabAnimations>
  );
};
```

### **Phase 5: URL Sync Management**

#### `useTabUrlSync.ts`
```typescript
export const useTabUrlSync = (defaultTab: string = 'morning') => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || defaultTab;
  
  const setActiveTab = useCallback((tabId: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', tabId);
      return newParams;
    });
  }, [setSearchParams]);

  const getTabFromTime = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 10) return 'morning';
    if (hour < 14) return 'light';
    if (hour < 18) return 'focus';
    return 'checkout';
  }, []);

  return {
    activeTab,
    setActiveTab,
    getTabFromTime
  };
};
```

## Final Decomposed Structure

```typescript
// TabLayoutWrapper.tsx (now just orchestration!)
export const TabLayoutWrapper = ({ children, selectedDate, onDateChange }) => {
  const { activeTab, setActiveTab } = useTabUrlSync();
  const { isTransitioning, transitionDirection, startTransition } = useTabTransitions();
  const tabs = getTabConfig();

  const handleTabChange = (tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newIndex = tabs.findIndex(tab => tab.id === tabId);
    const direction = newIndex > currentIndex ? 'left' : 'right';
    
    startTransition(direction);
    setActiveTab(tabId);
  };

  const handleSwipeLeft = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1].id);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        disabled={isTransitioning}
      />
      
      <GestureWrapper
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        enabled={!isTransitioning}
      >
        <div className="flex-1 mt-4">
          <TabContentRenderer
            activeTab={activeTab}
            tabs={tabs}
            contentProps={{
              selectedDate,
              onDateChange,
              navigateDay: (direction) => {
                // Date navigation logic
              }
            }}
            animationDirection={transitionDirection}
          />
        </div>
      </GestureWrapper>
    </div>
  );
};
```

## Benefits of This Decomposition

### **1. Focused Responsibilities**
- Navigation UI separate from gesture detection
- Animations isolated from content switching
- URL sync independent of UI rendering

### **2. Testability**
- Test gestures without UI
- Test animations independently
- Mock individual pieces easily

### **3. Reusability**
- Use TabNavigation in other contexts
- Reuse swipe gestures elsewhere
- Apply animations to other components

### **4. Maintainability**
- Update gesture sensitivity without touching navigation
- Modify animations without affecting gestures
- Change tab styling without breaking logic

## Migration Strategy

### **Step 1: Extract TabNavigation (Safest)**
- Create TabNavigation and TabButton components
- Replace inline tab rendering
- Test that tab clicking still works

### **Step 2: Extract Gesture System**
- Create useSwipeGestures hook
- Create GestureWrapper component
- Test that swiping still works on mobile

### **Step 3: Extract Animation System**
- Create TabAnimations component
- Create useTabTransitions hook
- Test that transitions look correct

### **Step 4: Extract Content Rendering**
- Create TabContentRenderer component
- Test that content switching works
- Verify props are passed correctly

### **Step 5: Extract URL Sync**
- Create useTabUrlSync hook
- Test that URL updates on tab change
- Verify browser back/forward works

## Safety Protocols

### **Testing Checklist:**
- [ ] Tab clicking navigation works
- [ ] Swipe gestures work on mobile
- [ ] Tab animations play correctly
- [ ] Content switches properly
- [ ] URL updates on tab change
- [ ] Browser back/forward works
- [ ] Keyboard navigation works
- [ ] Screen readers announce tab changes
- [ ] No console errors or warnings

### **Rollback Plan:**
- Keep original TabLayoutWrapper as backup
- Test each extraction thoroughly
- Revert individual pieces if issues found
- Never break gesture or navigation functionality

## Expected Outcome

**Before:** Complex monolithic component handling everything  
**After:** Orchestrated system of focused components

**Risk Reduction:** 🔴 High → 🟢 Low  
**Maintainability:** 🔴 Hard → 🟢 Easy  
**Mobile Experience:** 🟡 Works → 🟢 Excellent