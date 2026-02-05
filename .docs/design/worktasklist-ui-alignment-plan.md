# WorkTaskList UI Alignment Plan

## Current State vs Design System Comparison

### Padding Issues

| Location | Morning Routine / Nightly Checkout | Current WorkTaskList | Issue |
|----------|-----------------------------------|---------------------|-------|
| **CardHeader** | `p-4 sm:p-6` | `p-3 sm:p-4` | **Too small** - needs more breathing room |
| **CardContent** | `p-4` or `px-4 pb-4` | `p-3 sm:p-4 pt-0` | **Inconsistent** - missing top padding |
| **Content spacing** | `space-y-4` | `space-y-1` | **Too tight** - tasks crammed together |

### Visual Style Differences

| Element | Design System Pattern | Current WorkTaskList |
|---------|----------------------|---------------------|
| **Card BG** | `bg-{color}-900/20` | ✅ Correct |
| **Card Border** | `border-{color}-700/40` | ✅ Correct |
| **Header Icon** | `p-1.5 rounded-lg border border-{color}-400/30` | ❌ No icon container |
| **Dividers** | Minimal use, prefer spacing | ❌ 3 dividers in header |
| **Progress** | Various styles (circular, bar) | ❌ Small bar in corner |
| **Stats** | Bento grid or pills | ❌ Text row only |

---

## Recommended Changes (Non-Task Components)

### 1. Fix Card Padding (Priority: HIGH)

**Current:**
```tsx
<CardHeader className="p-3 sm:p-4">
<CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
```

**Should be:**
```tsx
<CardHeader className="p-4 sm:p-6">
<CardContent className="p-4 sm:p-6 pt-0">
```

### 2. Add Header Icon Container (Priority: MEDIUM)

**Pattern from Morning Routine:**
```tsx
<div className="flex items-center gap-2">
  <div className="p-1.5 rounded-lg border border-blue-400/30 flex-shrink-0">
    <Brain className="h-4 w-4 text-blue-400" />
  </div>
  <CardTitle className="text-blue-400 text-lg font-semibold">
    {flowProtocol.title}
  </CardTitle>
</div>
```

### 3. Replace Dividers with Spacing (Priority: MEDIUM)

**Current:** 3 horizontal dividers
**Should be:** Use `space-y-4`, `gap-4`, and visual hierarchy instead

### 4. Implement Bento Grid Stats (Priority: MEDIUM)

**Pattern from Timebox/Nightly Checkout:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
  <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
    <div className="text-lg font-bold text-blue-300">{activeCount}</div>
    <div className="text-xs text-blue-400">Active</div>
  </div>
  <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
    <div className="text-lg font-bold text-blue-300">{completedCount}</div>
    <div className="text-xs text-blue-400">Completed</div>
  </div>
  <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
    <div className="text-lg font-bold text-blue-300">{timeRemaining}</div>
    <div className="text-xs text-blue-400">Time Left</div>
  </div>
</div>
```

### 5. Collapsible Protocol Drawer (Priority: LOW)

**Pattern from Nightly Checkout:**
- Icon-triggered (Info icon) instead of always-visible header
- Smooth animation with Framer Motion
- Shows on first visit, then icon-only

---

## Implementation Plan

### Phase 1: Fix Padding (Quick Win)

Update `WorkTaskList.tsx`:
- Line 649: Change `p-3 sm:p-4` → `p-4 sm:p-6`
- Line 738 (approx): Change `p-3 sm:p-4 pt-0 sm:pt-0` → `p-4 sm:p-6 pt-0`
- Task list spacing: Change `space-y-1` → `space-y-3`

### Phase 2: Header Redesign (Visual Impact)

Create new header structure:
```tsx
<CardHeader className="p-4 sm:p-6">
  {/* Top Row: Icon + Title + Progress */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg border border-blue-400/30">
        <Brain className="h-4 w-4 text-blue-400" />
      </div>
      <CardTitle className="text-blue-400 text-lg font-semibold">
        {flowProtocol.title}
      </CardTitle>
    </div>
    {/* Protocol trigger button */}
  </div>

  {/* Bento Stats Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
    {/* Stat cards */}
  </div>

  {/* Collapsible Protocol */}
  <AnimatePresence>
    {isProtocolExpanded && <ProtocolDrawer />}
  </AnimatePresence>
</CardHeader>
```

### Phase 3: Polish

- Add Framer Motion entrance animations
- Ensure mobile responsiveness
- Test both Light (green) and Deep (blue) themes

---

## Files to Modify

1. `/src/domains/lifelock/1-daily/_shared/components/WorkTaskList.tsx`
   - Update padding classes
   - Redesign header section (lines 649-720)
   - Update task list spacing

---

## Visual Comparison

### Current
```
┌─────────────────────────────────────────┐
│🧠 Deep Work Tasks         3/5 done ▓▓  │  ← p-3, no icon container
├─────────────────────────────────────────┤  ← Divider
│ 2 active, 3 completed   ~2h 30m left   │  ← Text stats
├─────────────────────────────────────────┤  ← Divider
│ Flow State Protocol            [Show]  │  ← Always visible
├─────────────────────────────────────────┤  ← Divider
│[task]                                  │  ← space-y-1 (cramped)
│[task]                                  │
│[task]                                  │
└─────────────────────────────────────────┘
```

### Aligned with Design System
```
┌─────────────────────────────────────────┐
│ ┌──┐ 🧠 Deep Work Tasks          [i]   │  ← p-4, icon container
│ └──┘                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐             │  ← Bento stats
│ │ 2    │ │ 3    │ │2h30m │             │
│ │Active│ │Done  │ │Left  │             │
│ └──────┘ └──────┘ └──────┘             │
│ [Protocol content when expanded...]    │
├─────────────────────────────────────────┤
│                                         │
│  [task]                                │  ← space-y-3 (breathing room)
│  [task]                                │
│  [task]                                │
│                                         │
└─────────────────────────────────────────┘
```

---

## Key Design Tokens to Apply

| Token | Value | Usage |
|-------|-------|-------|
| Card padding | `p-4 sm:p-6` | Header and content |
| Content spacing | `space-y-3` or `space-y-4` | Between tasks |
| Icon container | `p-1.5 rounded-lg border border-{color}-400/30` | Header icon |
| Stats grid | `grid grid-cols-2 sm:grid-cols-3 gap-3` | Stats layout |
| Stat card | `p-3 rounded-lg bg-{color}-900/20 border border-{color}-700/30` | Individual stats |
