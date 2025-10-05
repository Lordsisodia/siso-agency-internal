#!/bin/bash

echo "💾 Restoring all deleted task .ts files..."
echo "==========================================="

# Create directories
mkdir -p src/ecosystem/internal/tasks/types
mkdir -p src/ecosystem/internal/tasks/utils
mkdir -p src/ecosystem/internal/tasks/api
mkdir -p src/ecosystem/internal/tasks/stores

# Restore types
if git show HEAD:src/features/tasks/types/task.types.ts > /tmp/task.types.ts 2>/dev/null; then
    mv /tmp/task.types.ts src/ecosystem/internal/tasks/types/task.types.ts
    echo "✅ task.types.ts"
fi

# Restore utils
if git show HEAD:src/features/tasks/utils/taskCardUtils.ts > /tmp/taskCardUtils.ts 2>/dev/null; then
    mv /tmp/taskCardUtils.ts src/ecosystem/internal/tasks/utils/taskCardUtils.ts
    echo "✅ taskCardUtils.ts"
fi

if git show HEAD:src/features/tasks/utils/taskHelpers.ts > /tmp/taskHelpers.ts 2>/dev/null; then
    mv /tmp/taskHelpers.ts src/ecosystem/internal/tasks/utils/taskHelpers.ts
    echo "✅ taskHelpers.ts"
fi

# Restore API
if git show HEAD:src/features/tasks/api/taskApi.ts > /tmp/taskApi.ts 2>/dev/null; then
    mv /tmp/taskApi.ts src/ecosystem/internal/tasks/api/taskApi.ts
    echo "✅ taskApi.ts"
fi

# Restore stores
if git show HEAD:src/features/tasks/stores/taskStore.ts > /tmp/taskStore.ts 2>/dev/null; then
    mv /tmp/taskStore.ts src/ecosystem/internal/tasks/stores/taskStore.ts
    echo "✅ taskStore.ts"
fi

# Restore main hooks
if git show HEAD:src/features/tasks/tasks.hooks.ts > /tmp/tasks.hooks.ts 2>/dev/null; then
    mv /tmp/tasks.hooks.ts src/ecosystem/internal/tasks/tasks.hooks.ts
    echo "✅ tasks.hooks.ts"
fi

if git show HEAD:src/features/tasks/tasks.types.ts > /tmp/tasks.types.ts 2>/dev/null; then
    mv /tmp/tasks.types.ts src/ecosystem/internal/tasks/tasks.types.ts
    echo "✅ tasks.types.ts"
fi

echo ""
echo "==========================================="
echo "All task support files restored"

