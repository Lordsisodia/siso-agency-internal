# Task UI Domain

Unified task management interface for different task types and workflows.

## Structure

```
task-ui/
├── components/          # Task-related components
├── hooks/              # Task management hooks
├── services/           # Task business logic
├── stores/             # State management
└── types/              # TypeScript definitions
```

## Key Features

- **Unified Task Interface**: Single interface for all task types
- **Task CRUD**: Create, read, update, delete tasks
- **Task Validation**: Ensure task data integrity
- **Task Transformation**: Convert between task formats

## Usage

```tsx
import { TaskCard, TaskList } from '@/domains/task-ui';
import { useTaskCRUD } from '@/domains/task-ui/hooks';
```
