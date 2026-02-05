# Implementation Plan: XP Balance Display in Header

## Overview
Add a total XP balance display to the left of the user profile icon in the header, showing the user's lifetime XP with real-time updates.

## Current State Analysis

### Header Structure
- **File**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/UnifiedTopNav.tsx`
- The header currently has:
  - Left side: Date picker button
  - Right side: `UserProfileDropdown` component (contains user avatar)
- The `UserProfileDropdown` receives `totalXP` as a prop but only displays it inside the dropdown menu footer

### XP Data Access
- **Service**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/_shared/services/gamificationService.ts`
  - `GamificationService.getUserProgress()` returns `UserProgress` with `totalXP: number`
  - Event `sisoGamificationProgressUpdated` is dispatched on XP updates
- **Existing Hook**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/_shared/hooks/useTodayXP.ts`
  - Pattern for listening to real-time updates via custom event
  - Uses `window.addEventListener('sisoGamificationProgressUpdated', ...)`

## Implementation Steps

### Step 1: Create `useTotalXP` Hook
**File to Create**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/_shared/hooks/useTotalXP.ts`

```typescript
/**
 * useTotalXP Hook
 * 
 * Fetches total lifetime XP from GamificationService
 * Keeps value in sync with real-time gamification updates.
 */

import { useEffect, useState } from 'react';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';

const GAMIFICATION_EVENT = 'sisoGamificationProgressUpdated';

export function useTotalXP(): number {
  const [totalXP, setTotalXP] = useState<number>(() => {
    const progress = GamificationService.getUserProgress();
    return progress.totalXP;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateFromService = () => {
      const progress = GamificationService.getUserProgress();
      setTotalXP(progress.totalXP);
    };

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'siso_gamification_data') {
        updateFromService();
      }
    };

    window.addEventListener(GAMIFICATION_EVENT, updateFromService);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(GAMIFICATION_EVENT, updateFromService);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return totalXP;
}
```

### Step 2: Create `XPBalanceDisplay` Component
**File to Create**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/XPBalanceDisplay.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useTotalXP } from '@/domains/lifelock/_shared/hooks/useTotalXP';

interface XPBalanceDisplayProps {
  className?: string;
}

export const XPBalanceDisplay: React.FC<XPBalanceDisplayProps> = ({ 
  className = '' 
}) => {
  const totalXP = useTotalXP();

  // Format XP with comma separators (e.g., 2,450)
  const formattedXP = totalXP.toLocaleString();

  return (
    <motion.div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      <span className="text-white font-semibold text-sm">
        {formattedXP} XP
      </span>
    </motion.div>
  );
};

XPBalanceDisplay.displayName = 'XPBalanceDisplay';
```

### Step 3: Update `UnifiedTopNav` Component
**File to Modify**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/UnifiedTopNav.tsx`

**Changes Required**:

1. Add import for `XPBalanceDisplay`:
```typescript
import { XPBalanceDisplay } from './XPBalanceDisplay';
```

2. Modify the right side of the header (around line 99-108) to include XP display before the profile dropdown:

```typescript
{/* Right: XP Balance + Profile Avatar with Dropdown */}
<div className="flex items-center gap-3">
  <XPBalanceDisplay />
  <UserProfileDropdown
    user={user}
    totalXP={totalXP}
    completionPercentage={completionPercentage}
    selectedDate={selectedDate}
    userId={userId}
    isOpen={isProfileDropdownOpen}
    onOpenChange={setIsProfileDropdownOpen}
  />
</div>
```

3. Note: The `totalXP` prop is already being passed to `UnifiedTopNav` from `TabLayoutWrapper`, so we can use that for the `UserProfileDropdown` while `XPBalanceDisplay` manages its own state via the hook.

### Step 4: Update Exports (if needed)
**File to Modify**: `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/index.ts`

Add export for the new component:
```typescript
export { XPBalanceDisplay } from './XPBalanceDisplay';
```

## Styling Specifications

### XP Balance Display
- **Container**: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10`
- **Icon**: `Zap` from lucide-react, `w-4 h-4 text-yellow-400 fill-yellow-400`
- **Text**: `text-white font-semibold text-sm`
- **Animation**: Fade in from left with `initial={{ opacity: 0, x: -10 }}` and `animate={{ opacity: 1, x: 0 }}`

### Responsive Behavior
- On mobile screens (< 640px), consider hiding the "XP" text and showing only the number:
  - Use `hidden sm:inline` for the "XP" suffix
  - Keep the icon and number visible

## Real-time Update Strategy

The implementation uses the existing gamification event system:

1. **Event Listening**: The `useTotalXP` hook listens for `sisoGamificationProgressUpdated` custom events
2. **Storage Sync**: Also listens for `storage` events to sync across tabs
3. **Initial Load**: Reads directly from `GamificationService.getUserProgress()` on mount
4. **Update Flow**:
   - User completes activity -> `GamificationService.awardXP()` is called
   - Service saves to localStorage and dispatches `sisoGamificationProgressUpdated`
   - `useTotalXP` hook receives event and updates state
   - `XPBalanceDisplay` re-renders with new value

## Testing Checklist

- [ ] XP balance displays in header next to user icon
- [ ] Value matches total XP from gamification service
- [ ] Updates in real-time when XP is earned
- [ ] Formatted with comma separators (e.g., 1,000)
- [ ] Responsive on mobile (icon + number only, hide "XP" text)
- [ ] Styling matches existing header (bg-white/5, border-white/10)
- [ ] Works correctly when switching between tabs/dates
- [ ] No console errors or warnings

## Files Summary

### Files to Create
1. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/_shared/hooks/useTotalXP.ts` - Hook for fetching total XP with real-time updates
2. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/XPBalanceDisplay.tsx` - XP balance UI component

### Files to Modify
1. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/UnifiedTopNav.tsx` - Add XP display to header
2. `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/src/domains/lifelock/1-daily/_shared/components/index.ts` - Export new component (if needed)

## Alternative Approaches Considered

### Option A: Pass totalXP as prop from parent
- **Pros**: Single source of truth, no duplicate hook calls
- **Cons**: Requires prop drilling through TabLayoutWrapper -> UnifiedTopNav -> XPBalanceDisplay
- **Decision**: Rejected - the hook approach is cleaner and self-contained

### Option B: Use existing useTodayXP hook
- **Pros**: Reuses existing code
- **Cons**: useTodayXP returns today's XP breakdown, not total lifetime XP
- **Decision**: Rejected - need separate hook for total XP vs daily XP

### Option C: Display in UserProfileDropdown button
- **Pros**: Keeps XP near user-related info
- **Cons**: Feedback specifically requests "left of user icon", not inside dropdown
- **Decision**: Rejected - does not match requirements
