#!/bin/bash

echo "🔍 COMPREHENSIVE CODEBASE CHECK"
echo "================================"
echo ""

echo "1️⃣ CHECKING FOR BROKEN IMPORTS..."
echo "-----------------------------------"

# Check for imports to non-existent paths
echo "Checking for imports to deleted directories:"
deleted_imports=$(grep -r "from.*['\"].*ai-first" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  ai-first imports: $deleted_imports"

# Check for missing files being imported
echo ""
echo "2️⃣ CHECKING FOR MISSING FILES..."
echo "-----------------------------------"

# Sample check: Look for common import failures
for path in "useTaskData" "UnifiedTaskCard" "taskConstants" "QuickActions" "AdminTasks"; do
    imports=$(grep -r "from.*$path" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    files=$(find src -name "*$path*" 2>/dev/null | wc -l | tr -d ' ')
    echo "  $path: $imports imports, $files files found"
done

echo ""
echo "3️⃣ CHECKING RELATIVE IMPORT ISSUES..."
echo "---------------------------------------"

# Find files with potentially broken relative imports
echo "Files with deep relative imports (3+ levels):"
deep_relative=$(grep -r "from ['\"]\.\.\/\.\.\/\.\.\/" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Found: $deep_relative files"

echo ""
echo "4️⃣ CHECKING REDIRECT FILES..."
echo "-------------------------------"

# Verify all redirects point to existing files
echo "Redirect file analysis:"
total_redirects=$(grep -r "🔄 DUPLICATE REDIRECT" src --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "  Total redirects: $total_redirects"

echo ""
echo "5️⃣ CHECKING FOR CIRCULAR DEPENDENCIES..."
echo "------------------------------------------"

# Check for self-referencing exports
echo "Looking for circular redirects:"
circular=0
for file in $(find src/ecosystem -name "*.tsx" -exec grep -l "🔄 DUPLICATE REDIRECT" {} \;); do
    canonical=$(grep "Canonical:" "$file" | sed 's/.*Canonical: //' | tr -d ' ')
    actual=$(echo "$file" | sed 's|^\./||')
    if [ "$canonical" = "$actual" ]; then
        circular=$((circular + 1))
        echo "  ⚠️ CIRCULAR: $actual"
    fi
done

if [ $circular -eq 0 ]; then
    echo "  ✅ No circular redirects found"
fi

echo ""
echo "================================"
echo "SUMMARY"
echo "================================"
echo "Deleted directory imports: $deleted_imports"
echo "Deep relative imports: $deep_relative"
echo "Total redirects: $total_redirects"
echo "Circular redirects: $circular"

