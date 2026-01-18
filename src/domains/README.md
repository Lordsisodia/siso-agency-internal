# Domains

This workspace groups product logic by **domains** (features/verticals). Each domain is self-contained with its own components, pages, hooks, services, and types.

## Domain Structure

Each domain follows a consistent structure:

```
<domain>/
├── pages/           # Route components (page-level)
├── components/      # Domain-specific reusable components
├── hooks/           # Custom React hooks
├── services/        # Business logic and API calls
├── types/           # TypeScript definitions
├── utils/           # Helper functions
├── index.ts         # Barrel exports
└── README.md        # Domain documentation
```

## Available Domains

### Core Domains

#### **lifelock/** - Personal Productivity System
- Daily, weekly, monthly, yearly life management
- Morning routine, tasks, deep work, wellness tracking
- Time boxing and daily checkout
- XP-based gamification system

#### **admin/** - Administrative Dashboard
- Client management and relationships
- Partner and industry tracking
- Financial dashboard and planning
- AI assistant integration

#### **tasks/** - Task Management
- Unified task interface across all work types
- Task CRUD operations
- Light work and deep work task management
- Task filtering, sorting, and validation

#### **projects/** - Project Management
- Project cards and details
- Wireframes and user flows
- Feature request tracking
- Project analytics

#### **xp-store/** - Gamification
- XP tracking and display
- Storefront and dashboard
- Achievement system
- Leaderboards

#### **resources/** - Knowledge Base
- Document library
- Learning resources
- Reference materials

#### **home/** - Landing/Home
- Main landing page
- Home dashboard

## Patterns

### File Organization
- **Pages** live in `src/domains/<domain>/pages/` (route components)
- **Components** are domain-specific and stay in `src/domains/<domain>/components/`
- **Shared UI** lives in `src/components/ui`
- **Shared services** live in `src/services`
- **Shared utilities** live in `src/lib`

### Import Conventions
```tsx
// Import from same domain
import { MyComponent } from '@/domains/<domain>/components/MyComponent';

// Import from different domain
import { TaskCard } from '@/domains/tasks/components/TaskCard';

// Import shared UI
import { Button } from '@/components/ui/button';
```

### When Adding a New Page
1. Create it in `src/domains/<domain>/pages/<Name>.tsx`
2. Import via alias `@/domains/<domain>/pages/<Name>`
3. Keep route wrappers thin; heavy logic belongs in domain components/services

### Testing
- Tests can be co-located in `src/domains/<domain>/**/__tests__/`
- Or mirrored under `tests/unit/domains/<domain>/`

## Rationale

- **Clear Ownership**: Each domain owns its pages, UI, hooks, and services
- **Reduced Duplication**: Eliminates duplicate page trees and shared folder sprawl
- **Better Navigation**: Easy to find related functionality
- **Independent Development**: Teams can work on different domains without conflicts
- **Scalability**: Easy to add new domains or reorganize existing ones
