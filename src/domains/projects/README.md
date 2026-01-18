# Projects Domain

Project management, wireframes, app plans, and development workflow.

## Structure

```
projects/
├── 1-discover/       # Discover and browse projects
│   └── ui/
│       ├── pages/    # Project discovery pages
│       └── components/ # Project browsing components
├── 2-plan/           # Plan projects and app plans
│   └── ui/
│       ├── pages/    # Planning pages
│       └── components/ # Planning components
├── 3-build/          # Build and develop projects
│   └── ui/
│       ├── pages/    # Development pages
│       └── components/ # Development components
├── 4-review/         # Review and feedback
│   └── ui/
│       ├── pages/    # Review pages
│       └── components/ # Review components
├── 5-archive/        # Archive completed projects
│   └── ui/
│       ├── pages/    # Archive pages
│       └── components/ # Archive components
├── _shared/          # Cross-cutting pieces
│   ├── ui/
│   │   └── components/ # Shared UI components
│   ├── domain/       # Domain logic and types
│   ├── hooks/        # Custom hooks
│   └── features/     # Feature management
└── index.ts          # Barrel exports
```

## Flow

1. **Discover** (1-discover): Browse and discover available projects
2. **Plan** (2-plan): Create app plans and project roadmaps
3. **Build** (3-build): Execute development and wireframes
4. **Review** (4-review): Review progress and gather feedback
5. **Archive** (5-archive): Archive completed projects

## Key Features

- **Project Cards**: Visual project representation
- **Wireframes**: Interactive wireframe editor
- **App Plans**: Structured project planning
- **User Flows**: Visual flow diagram editor
- **Feature Tracking**: Feature request management
- **Timeline Management**: Project timeline and milestones

## Usage

```tsx
import { ProjectCard, WireframeEditor, UserFlow } from '@/domains/projects';
```
