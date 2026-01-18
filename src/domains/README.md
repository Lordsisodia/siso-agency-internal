# Domains

This workspace groups product logic by **domains** (features/verticals). Each domain is self-contained with its own components, pages, hooks, services, and types.

## Domain Structure

Domains follow one of two organizational patterns:

### Numbered Flow Pattern
Used for domains with clear sequential workflows:

```
<domain>/
├── 1-first-step/     # First step in flow
│   └── ui/
│       ├── pages/    # Page components
│       └── components/ # UI components
├── 2-second-step/    # Second step in flow
│   └── ui/
│       ├── pages/    # Page components
│       └── components/ # UI components
├── ...
├── _shared/          # Cross-cutting pieces
│   ├── ui/
│   │   └── components/ # Shared UI components
│   ├── domain/       # Domain logic and types
│   └── hooks/        # Custom hooks
├── index.ts          # Barrel exports
└── README.md         # Domain documentation
```

### Feature-Based Pattern
Used for domains with distinct features:

```
<domain>/
├── features/
│   ├── feature-a/    # Feature A
│   │   ├── ui/
│   │   │   ├── pages/    # Page components
│   │   │   └── components/ # UI components
│   │   ├── domain/       # Business logic
│   │   └── hooks/        # Custom hooks
│   ├── feature-b/    # Feature B
│   │   └── ...
│   └── ...
├── _shared/          # Cross-cutting pieces
│   ├── ui/
│   │   └── components/ # Shared UI components
│   ├── domain/       # Shared domain logic
│   ├── hooks/        # Shared hooks
│   └── stores/       # State management
├── index.ts          # Barrel exports
└── README.md         # Domain documentation
```

## Available Domains

### Core Domains

#### **lifelock/** - Personal Productivity System
- Daily, weekly, monthly, yearly life management
- Morning routine, tasks, deep work, wellness tracking
- Time boxing and daily checkout
- XP-based gamification system

#### **admin/** - Administrative Dashboard (Numbered Flow)
1. Overview - Dashboard and analytics
2. Clients - Client relationship management
3. Partners - Partner tracking and management
4. Financials - Revenue and expenses
5. Settings - System configuration

#### **tasks/** - Task Management (Feature-Based)
- task-management: Core task CRUD and management
- deep-work: Focused, high-intensity task sessions
- light-work: Quick, low-intensity task management
- ai-assistant: AI-powered task planning and optimization
- calendar: Calendar-based task viewing
- analytics: Task statistics and insights

#### **projects/** - Project Management (Numbered Flow)
1. Discover - Browse and discover projects
2. Plan - Create app plans and roadmaps
3. Build - Execute development and wireframes
4. Review - Review progress and gather feedback
5. Archive - Archive completed projects

#### **xp-store/** - Gamification (Numbered Flow)
1. Storefront - XP rewards and redemptions
2. Track - XP tracking and display
3. Achievements - Achievement system
4. Leaderboards - Competitive rankings

#### **resources/** - Knowledge Base (Numbered Flow)
1. Browse - Discover and search resources
2. Read - Consume and study content
3. Save - Bookmark and organize resources
4. Share - Distribute resources to others

#### **home/** - Landing/Home
- Main landing page
- Home dashboard

## Patterns

### File Organization
- **Numbered flow domains**: Use `1-step-name/`, `2-step-name/`, etc. for sequential workflows
- **Feature-based domains**: Use `features/feature-name/` for distinct features
- **Shared pieces**: Always in `_shared/` for cross-cutting concerns
- **UI layers**: Organized under `ui/` subdirectories
- **Domain logic**: Kept in `domain/` for business logic
- **Shared UI** lives in `src/components/ui`
- **Shared services** live in `src/services`
- **Shared utilities** live in `src/lib`

### Import Conventions
```tsx
// Import from numbered flow domain
import { ProjectCard } from '@/domains/projects/1-discover/ui/components/ProjectCard';

// Import from feature-based domain
import { TaskManager } from '@/domains/tasks/features/task-management/ui/components/TaskManager';
import { DeepWorkTab } from '@/domains/tasks/features/deep-work/ui/components/DeepWorkTab';

// Import shared pieces from domain
import { TaskDetailsSheet } from '@/domains/tasks/_shared/ui/components/TaskDetailsSheet';

// Import from different domain
import { ClientCard } from '@/domains/admin/2-clients/ui/components/ClientCard';

// Import shared UI
import { Button } from '@/components/ui/button';
```

### When Adding a New Page
1. For numbered flows: Create in `src/domains/<domain>/N-step-name/ui/pages/<Name>.tsx`
2. For feature-based: Create in `src/domains/<domain>/features/feature-name/ui/pages/<Name>.tsx`
3. Import via appropriate path alias
4. Keep route wrappers thin; heavy logic belongs in domain components/services

### Testing
- Tests can be co-located in `src/domains/<domain>/**/__tests__/`
- Or mirrored under `tests/unit/domains/<domain>/`

## Rationale

- **Clear Ownership**: Each domain owns its pages, UI, hooks, and services
- **Reduced Duplication**: Eliminates duplicate page trees and shared folder sprawl
- **Better Navigation**: Easy to find related functionality
- **Independent Development**: Teams can work on different domains without conflicts
- **Scalability**: Easy to add new domains or reorganize existing ones
