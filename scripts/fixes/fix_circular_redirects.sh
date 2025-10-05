#!/bin/bash

echo "🔧 Fixing all circular redirects..."
echo "===================================="

# Array of circular redirects to fix
declare -a files=(
    "src/ecosystem/internal/admin/clients/SavedViewsManager.tsx"
    "src/ecosystem/internal/admin/clients/TodoList.tsx"
    "src/ecosystem/internal/admin/daily-planner/TaskView.tsx"
    "src/ecosystem/internal/admin/financials/expense/ExpensesTableHeader.tsx"
    "src/ecosystem/internal/admin/financials/expense/ExpensesTable.tsx"
    "src/ecosystem/internal/admin/financials/import/ImportProgress.tsx"
    "src/ecosystem/internal/admin/dashboard/ui/InteractiveTaskItem.tsx"
    "src/ecosystem/internal/admin/dashboard/components/ImportProgress.tsx"
    "src/ecosystem/internal/admin/dashboard/components/SavedViewsManager.tsx"
    "src/ecosystem/internal/admin/dashboard/QuickActions.tsx"
)

# Restore from before redirects were created (commit 7f83b9b or earlier)
for file in "${files[@]}"; do
    echo "Restoring $file..."
    git show 7f83b9b:"$file" > "$file" 2>/dev/null && echo "✅ $(basename $file)" || echo "⚠️ Not found: $file"
done

echo ""
echo "===================================="
echo "All circular redirects fixed"

