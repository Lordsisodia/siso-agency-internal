# Daily Tracker UI Component Library

A modern, accessible component library for the SISO Agency Daily Tracker dashboard built with React, TypeScript, and Tailwind CSS.

## Components

### DailyTrackerCard
The main card component for displaying sections of the daily tracker.

```tsx
<DailyTrackerCard
  title="Morning Routine"
  description="Start your day right"
  icon={Sun}
  emoji="🌅"
  color="yellow"
  progress={75}
  headerContent={<div>Custom header content</div>}
>
  {/* Card content */}
</DailyTrackerCard>
```

**Props:**
- `title` - Card title
- `description` - Optional description
- `icon` - Lucide icon component
- `emoji` - Optional emoji
- `color` - Theme color (yellow, purple, green, red, pink, indigo, orange, blue)
- `progress` - Progress percentage (0-100)
- `headerContent` - Custom header content
- `isCompact` - Compact variant
- `badge` - Optional badge with label and variant
- `onClick` - Click handler

### DailyTrackerGrid
Responsive grid layout system for organizing cards.

```tsx
<DailyTrackerGrid
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="md"
  items={[
    {
      id: 'card-1',
      priority: 1,
      span: 'full',
      content: <DailyTrackerCard>...</DailyTrackerCard>
    }
  ]}
/>
```

**Props:**
- `items` - Array of grid items with id, content, span, and priority
- `columns` - Responsive column configuration
- `gap` - Gap size (sm, md, lg)
- `animate` - Enable entrance animations

**Variants:**
- `DailyTrackerMasonryGrid` - Pinterest-style masonry layout
- `DailyTrackerAutoGrid` - Auto-fit grid with minimum card width

### DailyTrackerSection
Section wrapper for organizing related content.

```tsx
<DailyTrackerSection
  title="Today's Progress"
  subtitle="Track your daily achievements"
  collapsible
  action={{
    label: "View All",
    onClick: () => {}
  }}
>
  {/* Section content */}
</DailyTrackerSection>
```

**Props:**
- `title` - Section title
- `subtitle` - Optional subtitle
- `collapsible` - Enable collapse/expand
- `defaultCollapsed` - Initial collapsed state
- `action` - Optional action button
- `noPadding` - Remove default padding

### DailyTrackerProgress
Progress indicators in various styles.

```tsx
<DailyTrackerProgress
  value={75}
  max={100}
  label="Morning Routine"
  variant="linear"
  color="success"
  showPercentage
  animate
/>
```

**Props:**
- `value` - Current value
- `max` - Maximum value
- `label` - Progress label
- `variant` - Style variant (linear, circular)
- `color` - Color theme (default, success, warning, danger)
- `size` - Size variant (sm, md, lg)
- `showPercentage` - Show percentage text
- `animate` - Animate on mount

**Additional Components:**
- `DailyTrackerProgressSummary` - Overview of multiple progress sections
- `DailyTrackerStreak` - Streak counter with motivation

### DailyTrackerTaskItem
Task item component with various interactive features.

```tsx
<DailyTrackerTaskItem
  id="task-1"
  title="Complete morning routine"
  completed={false}
  priority="high"
  category="wellness"
  onToggle={(id) => {}}
  onUpdate={(id, field, value) => {}}
  variant="default"
  color="yellow"
/>
```

**Props:**
- `id` - Unique task ID
- `title` - Task title
- `completed` - Completion status
- `description` - Optional description
- `priority` - Priority level (low, medium, high, urgent)
- `category` - Task category
- `dueDate` - Due date string
- `logField` - Optional input field label
- `logValue` - Current log value
- `onToggle` - Toggle completion handler
- `onUpdate` - Update field handler
- `onDelete` - Delete handler
- `editable` - Enable inline editing
- `variant` - Display variant (default, compact, detailed)
- `color` - Theme color

**List Wrapper:**
- `DailyTrackerTaskList` - Wrapper for multiple task items

## Usage Example

```tsx
import {
  DailyTrackerCard,
  DailyTrackerGrid,
  DailyTrackerSection,
  DailyTrackerProgress
} from '@/components/admin/lifelock/ui';

function DailyDashboard() {
  return (
    <DailyTrackerSection title="Today's Tasks">
      <DailyTrackerGrid
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
        items={[
          {
            id: 'morning',
            priority: 1,
            content: (
              <DailyTrackerCard
                title="Morning Routine"
                icon={Sun}
                color="yellow"
                progress={75}
              >
                {/* Task content */}
              </DailyTrackerCard>
            )
          }
        ]}
      />
    </DailyTrackerSection>
  );
}
```

## Design Principles

1. **Mobile-First**: All components are optimized for mobile devices first
2. **Accessible**: WCAG AAA compliant with proper ARIA labels
3. **Performant**: Optimized animations and lazy loading
4. **Consistent**: Uses SISO brand colors and design system
5. **Flexible**: Highly customizable with variants and props
6. **Modern**: Built with latest React patterns and TypeScript

## Color Palette

- **Yellow**: Morning routines, habits
- **Orange**: Deep focus, primary actions
- **Green**: Light focus, success states
- **Red**: Workouts, urgent tasks
- **Pink**: Health, wellness
- **Indigo**: Reflection, analysis
- **Purple**: Special features
- **Blue**: Information, categories