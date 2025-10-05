#!/bin/bash

echo "🔬 DEEP VERIFICATION CHECK"
echo "==========================="
echo ""

echo "1️⃣ CRITICAL FILE EXISTENCE CHECK"
echo "---------------------------------"

# Check that all commonly imported files exist
critical_files=(
    "src/stores/tasks/taskProviderCompat.tsx"
    "src/stores/tasks/optimizedTaskHooks.ts"
    "src/ecosystem/internal/tasks/types/task.types.ts"
    "src/ecosystem/internal/tasks/constants/taskConstants.ts"
    "src/ecosystem/internal/tasks/hooks/useTaskData.ts"
    "src/ecosystem/internal/tasks/components/UnifiedTaskCard.tsx"
    "src/ecosystem/internal/admin/dashboard/AdminTasks.tsx"
    "src/ecosystem/internal/admin/dashboard/ui/QuickActions.tsx"
)

missing=0
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ MISSING: $file"
        missing=$((missing + 1))
    fi
done

echo ""
echo "2️⃣ IMPORT RESOLUTION TEST"
echo "-------------------------"

# Check if imports can actually be resolved
echo "Testing common import patterns:"

# Count imports and verify files exist
for pattern in "taskProviderCompat" "UnifiedTaskCard" "AdminTasks" "QuickActions" "task.types"; do
    import_count=$(grep -r "import.*$pattern" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    file_count=$(find src -name "*$pattern*" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ $import_count -gt 0 ] && [ $file_count -eq 0 ]; then
        echo "  ⚠️ $pattern: $import_count imports but NO files!"
    elif [ $import_count -gt 0 ]; then
        echo "  ✅ $pattern: $import_count imports, $file_count files"
    fi
done

echo ""
echo "3️⃣ REDIRECT INTEGRITY CHECK"
echo "----------------------------"

# Verify redirects point to real files
echo "Verifying redirect targets exist:"

redirect_errors=0
checked=0

for redirect_file in $(find src/features -name "*.tsx" -exec grep -l "🔄 DUPLICATE REDIRECT" {} \; 2>/dev/null | head -20); do
    checked=$((checked + 1))
    
    # Extract canonical path from redirect
    canonical=$(grep "Canonical:" "$redirect_file" | sed 's/.*Canonical: //' | tr -d ' ' | tr -d '\r')
    
    if [ -n "$canonical" ] && [ ! -f "$canonical" ]; then
        echo "  ⚠️ $redirect_file → $canonical (MISSING)"
        redirect_errors=$((redirect_errors + 1))
    fi
done

if [ $redirect_errors -eq 0 ]; then
    echo "  ✅ All $checked redirects checked - targets exist"
else
    echo "  ⚠️ Found $redirect_errors broken redirects"
fi

echo ""
echo "4️⃣ DUPLICATE FILE CHECK"
echo "------------------------"

# Look for files that exist in multiple locations
echo "Checking for duplicate implementations:"

dupe_count=0
for name in "AdminTasks.tsx" "QuickActions.tsx" "TasksPage.tsx"; do
    locations=$(find src/ecosystem -name "$name" 2>/dev/null | wc -l | tr -d ' ')
    if [ $locations -gt 1 ]; then
        echo "  ⚠️ $name: Found in $locations locations"
        find src/ecosystem -name "$name" 2>/dev/null | sed 's/^/    - /'
        dupe_count=$((dupe_count + 1))
    fi
done

if [ $dupe_count -eq 0 ]; then
    echo "  ✅ No problematic duplicates found"
fi

echo ""
echo "==========================="
echo "RESULTS:"
echo "  Missing critical files: $missing"
echo "  Broken redirects: $redirect_errors"
echo "  Duplicate issues: $dupe_count"
echo "==========================="

if [ $missing -eq 0 ] && [ $redirect_errors -eq 0 ] && [ $dupe_count -eq 0 ]; then
    echo ""
    echo "✅ ALL CHECKS PASSED"
else
    echo ""
    echo "⚠️ ISSUES FOUND - Review above"
fi

