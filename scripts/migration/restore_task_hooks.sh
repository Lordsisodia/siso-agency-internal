#!/bin/bash

echo "💾 Restoring deleted task hooks..."

mkdir -p src/ecosystem/internal/tasks/hooks

git show HEAD:src/features/tasks/hooks/useTaskActions.ts > src/ecosystem/internal/tasks/hooks/useTaskActions.ts
echo "✅ Restored useTaskActions.ts"

git show HEAD:src/features/tasks/hooks/useTaskOrganization.ts > src/ecosystem/internal/tasks/hooks/useTaskOrganization.ts
echo "✅ Restored useTaskOrganization.ts"

echo ""
echo "All task hooks restored to ecosystem"

