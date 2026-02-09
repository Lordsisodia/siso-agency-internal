# Bottom Navigation Redesign - Visual Diagram

## Current State (7 Tabs)

```
┌────────────────────────────────────────────────────────────┐
│  [Morning] [Light] [Deep] [Wellness] [Tasks] [Timebox] [Checkout]  │
└────────────────────────────────────────────────────────────┘
```

## New State (4 Buttons + Smart Navigator + More)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────────┐ ┌──────┐     │
│  │ 📅  │ │ ✅  │ │  ❤️   │ │  📅→Week│ │  ⊞  │     │
│  │Time  │ │Tasks │ │Wellness│ │  ly     │ │More  │     │
│  └──────┘ └──────┘ └────────┘ └──────────┘ └──────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘
   Button 1   Button 2   Button 3    Button 4     Button 5
```

---

## Button 1: Timebox (with sub-navigation)

```
┌──────────────────────────────────────────────┐
│  Back to Weekly                               │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐ ┌─────────┐ ┌────────┐          │
│  │ 📅Time │ │ 🌅Morning│ │ 🌙Check│          │  ← Sub-nav bar
│  │  box   │ │         │ │  out   │          │
│  └────────┘ └─────────┘ └────────┘          │
│                                              │
│  [Timebox content renders here]              │
│                                              │
└──────────────────────────────────────────────┘
```

## Button 2: Tasks (with sub-navigation)

```
┌──────────────────────────────────────────────┐
│  Back to Weekly                               │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐ ┌──────────┐ ┌──────────┐       │
│  │ ✅Today│ │ ☕Light   │ │ ⚡Deep   │       │  ← Sub-nav bar
│  │        │ │  Work    │ │  Work    │       │
│  └────────┘ └──────────┘ └──────────┘       │
│                                              │
│  [Tasks content renders here]                │
│                                              │
└──────────────────────────────────────────────┘
```

## Button 3: Wellness (no sub-navigation)

```
┌──────────────────────────────────────────────┐
│  Back to Weekly                               │
├──────────────────────────────────────────────┤
│                                              │
│  [Wellness content renders here]              │
│  (No sub-nav needed)                          │
│                                              │
└──────────────────────────────────────────────┘
```

## Button 4: Smart View Navigator (Contextual)

### On Daily View
```
┌────────┐
│ 📅     │  Shows "Weekly"
│ Weekly │  → Click goes to /admin/lifelock/weekly
└────────┘
```

### On Weekly View
```
┌────────┐
│ 📅     │  Shows "Monthly"
 │Monthly│  → Click goes to /admin/lifelock/monthly
└────────┘
```

### On Monthly View
```
┌────────┐
│ 📅     │  Shows "Yearly"
│Yearly  │  → Click goes to /admin/lifelock/yearly
└────────┘
```

### On Yearly View
```
┌────────┐
│ ✨     │  Shows "Life"
│ Life   │  → Click goes to /admin/lifelock
└────────┘
```

### On Life View
```
┌────────┐
│ 📅     │  Shows "Daily"
│ Daily  │  → Click goes to /admin/lifelock/daily
└────────┘
```

**Creates a cycle: Daily → Weekly → Monthly → Yearly → Life → Daily**

---

## Button 5: More Menu (Popup)

### Mobile (Bottom Sheet)
```
┌────────────────────────────────────────────┐
│                                            │
│              More                          │
│                                            │
│  ┌──────────┐  ┌──────────┐               │
│  │  👥     │  │  🤝     │               │
│  │Clients   │  │Partners  │               │
│  └──────────┘  └──────────┘               │
│                                            │
│  ┌──────────┐  ┌──────────┐               │
│  │  🏆     │  │  🛍️     │               │
│  │XP Dash.  │  │XP Store  │               │
│  └──────────┘  └──────────┘               │
│                                            │
│                                            │
└────────────────────────────────────────────┘
       ↑ Slide up from bottom
```

### Desktop (Popover/Modal)
```
                    ┌─────────────────┐
                    │      More       │
                    ├─────────────────┤
                    │  👥 Clients     │
                    │  🤝 Partners    │
                    │  🏆 XP Dash.    │
                    │  🛍️ XP Store    │
                    └─────────────────┘
                            ↑
                    Opens above button
```

---

## Navigation Flow Examples

### User wants to do Light Work
1. Click **Tasks** button (bottom nav)
2. See sub-nav: [Today] [Light Work] [Deep Work]
3. Click **Light Work** in sub-nav
4. Light Work section renders

### User wants to do Morning Routine
1. Click **Timebox** button (bottom nav)
2. See sub-nav: [Timebox] [Morning] [Checkout]
3. Click **Morning** in sub-nav
4. Morning Routine renders

### User wants to see Monthly View
1. Currently on Daily View
2. Smart Navigator shows **"Weekly"**
3. Click it → goes to Weekly View
4. Smart Navigator now shows **"Monthly"**
5. Click it → goes to Monthly View

### User wants to see Clients
1. Click **More** button (9-dot icon)
2. Popup opens
3. Click **Clients**
4. Navigates to /admin/clients

---

## URL Structure Examples

### Timebox Section
```
/admin/lifelock/daily?section=timebox&subtab=timebox
/admin/lifelock/daily?section=timebox&subtab=morning
/admin/lifelock/daily?section=timebox&subtab=checkout
```

### Tasks Section
```
/admin/lifelock/daily?section=tasks&subtab=tasks
/admin/lifelock/daily?section=tasks&subtab=light-work
/admin/lifelock/daily?section=tasks&subtab=deep-work
```

### Wellness Section
```
/admin/lifelock/daily?section=wellness
```

### Legacy URLs (Auto-redirect)
```
?tab=morning      → ?section=timebox&subtab=morning
?tab=light-work   → ?section=tasks&subtab=light-work
?tab=work         → ?section=tasks&subtab=deep-work
?tab=wellness     → ?section=wellness
```

---

## Component Hierarchy

```
TabLayoutWrapper
├── Header (Back button)
├── SectionSubNav (if section has sub-tabs)
│   ├── Timebox: [Timebox] [Morning] [Checkout]
│   └── Tasks: [Today] [Light Work] [Deep Work]
├── Content Area
│   └── Renders based on activeSubTab or activeSection
└── ConsolidatedBottomNav
    ├── Timebox Button
    ├── Tasks Button
    ├── Wellness Button
    ├── Smart View Navigator (contextual)
    └── More Button → Sheet → Menu Items
```

---

## Key Benefits

1. **Fewer Buttons** - 4 vs 7 tabs
2. **Logical Grouping** - Related features together
3. **Smart Hierarchy** - Easy to jump between time horizons
4. **Always Available** - Morning/Checkout never hidden
5. **Easy Switching** - Sub-nav for quick context switches
6. **Accessible Menu** - All other pages one tap away
