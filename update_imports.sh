#!/bin/bash

echo "🔄 Updating imports to new locations..."
echo "==========================================="

# Update CollapsibleTaskCard.tsx
sed -i '' "s|from '@/ai-first/core/task.service'|from '@/shared/services/task.service'|g" \
    src/ecosystem/internal/tasks/ui/CollapsibleTaskCard.tsx 2>/dev/null || \
sed -i "s|from '@/ai-first/core/task.service'|from '@/shared/services/task.service'|g" \
    src/ecosystem/internal/tasks/ui/CollapsibleTaskCard.tsx

echo "✅ Updated CollapsibleTaskCard.tsx"

# Update TimeBlockView.tsx  
sed -i '' "s|from '@/ai-first/core/task.service'|from '@/shared/services/task.service'|g" \
    src/ecosystem/internal/dashboard/components/TimeBlockView.tsx 2>/dev/null || \
sed -i "s|from '@/ai-first/core/task.service'|from '@/shared/services/task.service'|g" \
    src/ecosystem/internal/dashboard/components/TimeBlockView.tsx

echo "✅ Updated TimeBlockView.tsx"

# Update FloatingAIAssistant.tsx
sed -i '' "s|from '../../ai-first/features/tasks/components/EnhancedAIAssistantTab'|from '@/ecosystem/internal/tasks/components/EnhancedAIAssistantTab'|g" \
    src/shared/components/FloatingAIAssistant.tsx 2>/dev/null || \
sed -i "s|from '../../ai-first/features/tasks/components/EnhancedAIAssistantTab'|from '@/ecosystem/internal/tasks/components/EnhancedAIAssistantTab'|g" \
    src/shared/components/FloatingAIAssistant.tsx

sed -i '' "s|from '../../ai-first/shared/utils/feature-flags'|from '@/shared/utils/feature-flags'|g" \
    src/shared/components/FloatingAIAssistant.tsx 2>/dev/null || \
sed -i "s|from '../../ai-first/shared/utils/feature-flags'|from '@/shared/utils/feature-flags'|g" \
    src/shared/components/FloatingAIAssistant.tsx

echo "✅ Updated FloatingAIAssistant.tsx"

# Update test files
sed -i '' "s|from '../../../ai-first/shared/utils/feature-flags'|from '@/shared/utils/feature-flags'|g" \
    src/pages/test/AIAssistantTesting.tsx 2>/dev/null || \
sed -i "s|from '../../../ai-first/shared/utils/feature-flags'|from '@/shared/utils/feature-flags'|g" \
    src/pages/test/AIAssistantTesting.tsx

sed -i '' "s|from '../../../ai-first/shared/utils/feature-flags'|from '@/shared/utils/feature-flags'|g" \
    src/pages/AIAssistantTesting.tsx 2>/dev/null || \
sed -i "s|from '../../../ai-first/shared/utils/feature-flags'|from '@/shared/utils/feature-flags'|g" \
    src/pages/AIAssistantTesting.tsx

echo "✅ Updated test files"

echo ""
echo "==========================================="
echo "All imports updated!"

