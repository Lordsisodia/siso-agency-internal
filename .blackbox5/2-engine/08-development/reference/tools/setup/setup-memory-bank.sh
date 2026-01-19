#!/bin/bash

# Black Box Memory Bank Setup Script
# Initializes the Memory Bank with required files if they don't exist

set -e

MEMORY_BANK_PATH=".blackbox5/engine/memory/memory-bank"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Black Box Memory Bank Setup                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create directory if it doesn't exist
if [ ! -d "$MEMORY_BANK_PATH" ]; then
    echo -e "${YELLOW}► Creating Memory Bank directory...${NC}"
    mkdir -p "$MEMORY_BANK_PATH"
    echo -e "${GREEN}✓ Created $MEMORY_BANK_PATH${NC}"
else
    echo -e "${GREEN}✓ Memory Bank directory exists${NC}"
fi

# Function to create a file if it doesn't exist
create_file() {
    local file_path="$1"
    local content="$2"

    if [ ! -f "$file_path" ]; then
        echo -e "${YELLOW}► Creating $(basename "$file_path")...${NC}"
        echo "$content" > "$file_path"
        echo -e "${GREEN}✓ Created $(basename "$file_path")${NC}"
    else
        echo -e "${GREEN}✓ $(basename "$file_path") already exists${NC}"
    fi
}

# Create active-context.md
create_file "$MEMORY_BANK_PATH/active-context.md" "# Active Context

## Current Focus
Initializing the Black Box Memory Bank system.

## Recent Changes
- Set up Memory Bank structure
- Created initial context files

## Known Issues
None currently

## Next Priorities
1. Complete any pending tasks from Vibe Kanban
2. Update this file as focus shifts

## System State
- **Auth**: Using Supabase Auth
- **Database**: Supabase PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (serverless)
- **State Management**: Context API + Zustand
- **Styling**: Tailwind CSS

## Active Projects
- **SISO Internal**: Main project repository
- **Vibe Kanban Integration**: Task and agent management

## Relevant Links
- Domain Knowledge: .blackbox5/engine/domains/_map.md
- Skills: .blackbox5/engine/.agents/.skills/
- Vibe Kanban: http://localhost:3000
"

# Create progress.md
create_file "$MEMORY_BANK_PATH/progress.md" "# Progress Tracking

This file tracks progress on all tasks across the Black Box system.

## Template for New Tasks

\`\`\`markdown
## Task: [Task Name]
- Status: [Starting | In Progress | Complete | Blocked]
- Agent: [Agent Name]
- Started: [Timestamp - e.g., 2026-01-18T12:00:00Z]
- Last Update: [Timestamp]
- Domain: [Relevant domain, if applicable]
- Next Steps:
  - [Step 1]
  - [Step 2]
\`\`\`

---

## Active Tasks

*No active tasks currently*

## Completed Tasks

*Recently completed tasks will appear here*

## Blocked Tasks

*No blocked tasks*

---

**Last Updated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
"

# Create decision-log.md
create_file "$MEMORY_BANK_PATH/decision-log.md" "# Decision Log

This file tracks all architectural, technical, and product decisions made in the project.

## Template for New Decisions

\`\`\`markdown
## Decision: [Decision Title]
- Timestamp: [Timestamp - e.g., 2026-01-18T12:00:00Z]
- Category: [Architecture | Technical | Product | Process]

### Context
[What led to this decision]

### Options Considered
1. [Option 1]
2. [Option 2]
3. [Option 3]

### Decision
[The choice made]

### Rationale
[Why this choice was made]

### Consequences
- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Mitigation**: [How drawbacks are addressed]
\`\`\`

---

## Recent Decisions

### Decision: Set up Black Box Memory Bank system
- Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Category: Process

### Context
Needed a persistent memory system for AI agents to maintain context across sessions and track work progress.

### Options Considered
1. Database-backed memory (PostgreSQL)
2. File-based markdown (chosen)
3. Vector database only (ChromaDB)

### Decision
Use file-based markdown with MCP server integration

### Rationale
- Human-readable and editable
- Version control friendly
- Simple and reliable
- Works well with git workflow
- Easy to query and parse

### Consequences
- **Pros**: Simple, transparent, git-tracked, human-readable
- **Cons**: Manual updates required, no query language
- **Mitigation**: MCP server for programmatic access, clear templates

---

## Historical Decisions

*Older decisions will be archived here*

---

**Last Updated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
"

# Create product-context.md
create_file "$MEMORY_BANK_PATH/product-context.md" "# Product Context

## Product Overview

**SISO Internal** is the core product for this codebase.

## Core Features

### 1. Gamification System
- **Earning** (1-earn): Users earn points through habit completion
- **Spending** (2-spend): Storefront for redeeming rewards
- **Tracking** (3-track): Analytics and progress dashboards

### 2. Habit Tracking
- Daily habit check-in
- Streak tracking
- Progress visualization

### 3. User Management
- Authentication (Supabase Auth)
- Profile management
- Settings and preferences

## Product Architecture

```
src/domains/
├── auth/              # Authentication
├── analytics/         # Analytics and dashboards
├── lifelock/          # Core product
│   └── habits/        # Habit tracking
│       └── gamification/  # Gamification system
│           ├── 1-earn/    # Earning points
│           ├── 2-spend/   # Spending points (store)
│           └── 3-track/   # Tracking progress
├── admin/             # Admin interfaces
└── shared/            # Shared components
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: Context API + Zustand
- **Routing**: React Router
- **Forms**: React Hook Form + Zod

## Product Decisions

See \`decision-log.md\` for detailed decision history.

## User Workflows

### Habit Completion Flow
1. User checks off daily habit
2. Points awarded automatically
3. Streak updated
4. Achievement unlocked (if applicable)

### Reward Redemption Flow
1. User browses storefront
2. Selects reward
3. Confirms redemption
4. Points deducted
5. Reward delivered/activated

---

**Last Updated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
"

# Create system-patterns.md
create_file "$MEMORY_BANK_PATH/system-patterns.md" "# System Patterns

This file documents reusable patterns and best practices used in the codebase.

## Frontend Patterns

### Component Organization
```
src/domains/{domain}/
├── components/      # Domain-specific components
├── features/        # Feature-specific modules
├── hooks/          # Domain-specific hooks
├── utils/          # Helper functions
└── types/          # TypeScript types
```

### State Management Pattern
- Use **Context API** for global, app-wide state
- Use **Zustand** for complex feature state
- Use **local state** (useState) for simple component state

### Data Fetching Pattern
```typescript
// Use Supabase client with React Query
const { data, error, isLoading } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => supabase.from('table').select('*').eq('id', id).single()
})
```

## Backend Patterns

### Supabase Query Pattern
```typescript
// Single record
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .single()

// Multiple records with join
const { data, error } = await supabase
  .from('table')
  .select('*, related_table(*)')
  .order('created_at', { ascending: false })
```

### RLS Pattern
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- User can only see their own data
CREATE POLICY "Users can view own data"
  ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Code Patterns

### Error Handling Pattern
```typescript
try {
  const { data, error } = await operation()
  if (error) throw error
  return data
} catch (error) {
  console.error('Operation failed:', error)
  // Handle error appropriately
}
```

### Type Safety Pattern
```typescript
// Define types for database tables
type TableRow = {
  id: string
  created_at: string
  // ... other fields
}

// Use Supabase generated types
import { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
```

## Git Patterns

### Commit Message Pattern
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks
```

### Branch Naming Pattern
```
feature/description
bugfix/description
hotfix/description
```

## Testing Patterns

### Component Test Pattern
```typescript
describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('expected text')).toBeInTheDocument()
  })
})
```

## Anti-Patterns to Avoid

❌ **Don't**: Nest components deeply (max 3-4 levels)
❌ **Don't**: Use any type without reason
❌ **Don't**: Skip error handling
❌ **Don't**: Hardcode values that should be configured
❌ **Don't**: Mix concerns (keep data fetching separate from UI)

✅ **Do**: Use TypeScript for type safety
✅ **Do**: Handle loading and error states
✅ **Do**: Write tests for critical paths
✅ **Do**: Document complex logic
✅ **Do**: Keep components small and focused

---

**Last Updated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
"

# Summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Memory Bank setup complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Memory Bank Files Created:${NC}"
echo -e "  • active-context.md     - Current working context"
echo -e "  • progress.md           - Task progress tracking"
echo -e "  • decision-log.md       - Architecture decisions"
echo -e "  • product-context.md    - Product knowledge"
echo -e "  • system-patterns.md    - Reusable patterns"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Review and customize the context files"
echo -e "  2. Add current tasks to progress.md"
echo -e "  3. Document any recent decisions in decision-log.md"
echo -e "  4. Update active-context.md with current focus"
echo ""
echo -e "${YELLOW}Usage:${NC}"
echo -e "  • Read context:  cat .blackbox5/engine/memory/memory-bank/active-context.md"
echo -e "  • Update progress: Use MCP or edit .blackbox5/engine/memory/memory-bank/progress.md"
echo -e "  • Log decisions: Use MCP or edit .blackbox5/engine/memory/memory-bank/decision-log.md"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
