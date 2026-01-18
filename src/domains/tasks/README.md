# Tasks Domain

Unified task management system with specialized features for different work types.

## Structure

```
tasks/
├── features/
│   ├── task-management/  # Core task CRUD and management
│   │   ├── ui/
│   │   │   ├── pages/    # Task management pages
│   │   │   └── components/ # Task CRUD components
│   │   ├── domain/       # Task business logic
│   │   └── hooks/        # Task management hooks
│   ├── deep-work/        # Deep work focused tasks
│   │   └── ui/
│   │       ├── pages/    # Deep work pages
│   │       └── components/ # Deep work components
│   ├── light-work/       # Light work focused tasks
│   │   └── ui/
│   │       ├── pages/    # Light work pages
│   │       └── components/ # Light work components
│   ├── ai-assistant/     # AI-powered task features
│   │   └── ui/
│   │       ├── pages/    # AI assistant pages
│   │       └── components/ # AI components
│   ├── calendar/         # Calendar view
│   │   └── ui/
│   │       ├── pages/    # Calendar pages
│   │       └── components/ # Calendar components
│   └── analytics/        # Task analytics and stats
│       └── ui/
│           ├── pages/    # Analytics pages
│           └── components/ # Analytics components
├── _shared/              # Cross-cutting pieces
│   ├── ui/
│   │   └── components/   # Shared UI components
│   ├── domain/           # Domain logic and types
│   ├── hooks/            # Custom hooks
│   └── stores/           # State management
└── index.ts              # Barrel exports
```

## Features

### Task Management
Core task CRUD operations, filtering, sorting, and organization.

### Deep Work
Focused, high-intensity task management with session tracking.

### Light Work
Quick, low-intensity task management with flexible scheduling.

### AI Assistant
AI-powered task suggestions, planning, and optimization.

### Calendar
Calendar-based task viewing and scheduling.

### Analytics
Task statistics, progress tracking, and insights.

## Key Features

- **Unified Interface**: Single interface for all task types
- **Work Type Differentiation**: Separate flows for deep vs light work
- **AI Integration**: Intelligent task planning and suggestions
- **Calendar Integration**: Visual task scheduling
- **Analytics**: Track productivity and patterns

## Usage

```tsx
import { TaskManager, DeepWorkTab, LightWorkTab } from '@/domains/tasks';
```
