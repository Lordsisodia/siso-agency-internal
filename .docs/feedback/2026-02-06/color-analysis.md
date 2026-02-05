# Color Analysis: Current vs Notion Dark Mode

## Notion Dark Mode Colors (from screenshot)

| Element | Hex Code | Description |
|---------|----------|-------------|
| Main Window | `#2F3438` | Primary background - charcoal gray |
| Sidebar | `#373C3F` | Elevated surfaces - slightly lighter |
| Hover | `#3F4448` | Hover states - lightest gray |

## Previous SISO Colors

| Element | Hex Code | Description |
|---------|----------|-------------|
| siso-bg | `#121212` | Near-black (TOO DARK) |
| siso-bg-alt | `#1A1A1A` | Slightly lighter but still very dark |
| siso-border | `#2A2A2A` | Border color |

## Key Differences

1. **Luminance**: Notion uses charcoal grays (#2F3438) which are much lighter than near-black (#121212)
2. **Hierarchy**: Notion has clear 3-level hierarchy (main → sidebar → hover)
3. **Readability**: Notion's colors reduce eye strain while maintaining dark mode aesthetics
4. **Professional feel**: Charcoal gray feels more polished than pure black

## Changes Made

### tailwind.config.ts
```typescript
siso: {
  bg: "#2F3438",           // Changed from #121212 - Notion Main Window
  "bg-alt": "#373C3F",     // Changed from #1A1A1A - Notion Sidebar
  "bg-hover": "#3F4448",   // NEW - Notion Hover
  border: "#4A4F53",       // Adjusted for new bg
  "border-hover": "#5A5F63",
}
```

### Files Updated
1. `tailwind.config.ts` - Updated color palette
2. `TabLayoutWrapper.tsx` - Changed bg-[#121212] to bg-siso-bg
3. `NightlyCheckoutSection.tsx` - Changed all bg-[#121212] to bg-siso-bg
4. `WeeklyView.tsx` - Changed all bg-[#121212] to bg-siso-bg
5. `AdminLayout.tsx` - Changed inline styles from #121212 to #2F3438
6. `DailyBottomNav.tsx` - Changed bg-gray-900/70 to bg-siso-bg-alt/70

## Visual Impact

**Before**: Very dark, high contrast, can cause eye strain
**After**: Softer charcoal tones, better hierarchy, easier on the eyes

## Usage Guidelines

- **siso-bg (#2F3438)**: Main app background, page containers
- **siso-bg-alt (#373C3F)**: Cards, sidebars, elevated surfaces, bottom nav
- **siso-bg-hover (#3F4448)**: Hover states, active items, highlights
