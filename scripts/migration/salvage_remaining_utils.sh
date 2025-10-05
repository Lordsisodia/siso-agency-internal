#!/bin/bash

echo "💾 Salvaging remaining utility files..."

# Create directories
mkdir -p src/shared/services
mkdir -p src/shared/utils
mkdir -p src/ecosystem/internal/tasks/types

# Copy utility files if they exist
if [ -f "ai-first/core/task.service.ts" ]; then
    cp ai-first/core/task.service.ts src/shared/services/task.service.ts
    echo "✅ task.service.ts → src/shared/services/"
fi

if [ -f "ai-first/shared/utils/feature-flags.ts" ]; then
    cp ai-first/shared/utils/feature-flags.ts src/shared/utils/feature-flags.ts
    echo "✅ feature-flags.ts → src/shared/utils/"
fi

if [ -f "ai-first/features/tasks/DayTabContainer.tsx" ]; then
    cp ai-first/features/tasks/DayTabContainer.tsx src/ecosystem/internal/tasks/components/DayTabContainer.tsx
    echo "✅ DayTabContainer.tsx → src/ecosystem/internal/tasks/components/"
fi

echo ""
echo "Done salvaging utility files"

