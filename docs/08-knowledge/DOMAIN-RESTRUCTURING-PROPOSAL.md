# Domain Architecture Standardization Proposal

## Problem Statement

Current domains lack consistency in structure and user flow. LifeLock has an excellent numbered flow system (1-daily, 2-weekly, etc.) that should be applied across domains.

## Proposed Standard Domain Structure

### Pattern A: Sequential Flow Domains (Like LifeLock)

For domains with a clear user journey, use numbered sections:

```
<domain>/
├── 1-<section-name>/   # First step in user journey
│   ├── domain/        # Business logic, types, utils
│   ├── features/      # Sub-features
│   ├── hooks/         # Custom hooks
│   └── ui/            # Section-specific UI
│       ├── components/
│       └── pages/
├── 2-<section-name>/   # Second step
├── _shared/           # Shared code across sections
├── services/          # Domain-wide services
└── index.ts
```

### Pattern B: Feature-Based Domains

For domains without sequential flow, organize by feature:

```
<domain>/
├── features/
│   ├── <feature-1>/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── pages/
│   └── <feature-2>/
├── _shared/           # Shared components, hooks, types
├── domain/            # Core business logic
├── services/          # External integrations
└── index.ts
```

## Proposed Domain Restructuring

### 1. XP Store → Pattern A (Sequential)

```
xp-store/
├── 1-earn/            # How users earn XP
│   ├── domain/
│   │   ├── calculations.ts
│   │   └── types.ts
│   ├── features/
│   │   ├── daily-bonus/
│   │   ├── streak-bonus/
│   │   └── achievements/
│   ├── hooks/
│   └── ui/
│       ├── components/
│       └── pages/
├── 2-spend/           # How users spend XP
│   ├── domain/
│   ├── features/
│   │   ├── storefront/
│   │   ├── rewards/
│   │   └── categories/
│   ├── hooks/
│   └── ui/
├── 3-track/           # XP history and analytics
│   ├── domain/
│   ├── features/
│   │   ├── history/
│   │   ├── analytics/
│   │   └── leaderboards/
│   ├── hooks/
│   └── ui/
├── _shared/
├── services/
└── index.ts
```

### 2. Tasks → Pattern B (Feature-Based)

```
tasks/
├── features/
│   ├── task-management/      # Core task CRUD
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── domain/
│   │   └── pages/
│   ├── deep-work/           # Deep work specific
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── light-work/          # Light work specific
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── calendar-integration/
│       ├── components/
│       └── hooks/
├── _shared/
│   ├── components/          # Reusable task components
│   ├── hooks/              # Shared task hooks
│   ├── types/              # Common types
│   └── utils/              # Helper functions
├── domain/                 # Core business logic
├── services/               # Database and API
└── index.ts
```

### 3. Projects → Pattern A (Sequential)

```
projects/
├── 1-discover/        # Browse and explore projects
├── 2-plan/           # Project planning phase
├── 3-build/          # Active project work
├── 4-review/         # Project review and analytics
├── 5-archive/        # Completed projects
├── _shared/
├── services/
└── index.ts
```

### 4. Resources → Pattern A (Sequential)

```
resources/
├── 1-browse/         # Search and discover
├── 2-read/          # Reading interface
├── 3-save/          # Bookmarks and collections
├── 4-share/         # Sharing features
├── _shared/
└── index.ts
```

### 5. Admin → Pattern A (Sequential)

```
admin/
├── 1-overview/       # Dashboard and analytics
├── 2-clients/       # Client management
├── 3-partners/      # Partner relationships
├── 4-financials/    # Financial tracking
├── 5-settings/      # System settings
├── _shared/
├── services/
└── index.ts
```

### 6. Home → Simplify

Home is just a redirect/router, should be minimal or removed:

```
# Option 1: Remove entirely and use app router
# Option 2: Keep as simple router component
home/
└── pages/
    └── HomePage.tsx  # Simple redirect logic
```

## Migration Strategy

1. **Phase 1**: Restructure XP Store (smallest domain, good test case)
2. **Phase 2**: Restructure Resources (simple, straightforward)
3. **Phase 3**: Restructure Projects (moderate complexity)
4. **Phase 4**: Restructure Tasks (most complex, requires careful planning)
5. **Phase 5**: Restructure Admin (moderate complexity)
6. **Phase 6**: Handle Home (remove or simplify)

## Benefits

- **Consistency**: All domains follow same patterns
- **Clarity**: Clear user journey through numbered sections
- **Maintainability**: Easy to find related code
- **Scalability**: Easy to add new sections or features
- **Onboarding**: New developers understand structure quickly
