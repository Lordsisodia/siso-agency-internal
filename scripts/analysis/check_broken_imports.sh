#!/bin/bash

echo "🔍 Checking for potentially broken imports..."
echo "=============================================="

# Check for imports to deleted directories
echo ""
echo "1. Checking for imports to deleted /features directory:"
count=$(grep -r "from.*['\"].*\/features\/" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
echo "   Found: $count references"
if [ "$count" -gt 0 ]; then
    echo "   ⚠️  Sample references:"
    grep -r "from.*['\"].*\/features\/" src --include="*.tsx" --include="*.ts" 2>/dev/null | head -5
fi

echo ""
echo "2. Checking for imports to deleted ai-first directory:"
count=$(grep -r "from.*['\"].*ai-first" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "   Found: $count references"
if [ "$count" -gt 0 ]; then
    echo "   ⚠️  Sample references:"
    grep -r "from.*['\"].*ai-first" src --include="*.tsx" --include="*.ts" 2>/dev/null | head -5
fi

echo ""
echo "3. Checking for relative path imports that might be broken:"
count=$(grep -r "from ['\"]\.\.\/\.\.\/\.\.\/" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "   Found: $count deep relative imports (3+ levels)"

echo ""
echo "4. Checking all imports use @ alias correctly:"
alias_count=$(grep -r "from ['\"]\@\/" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "   Found: $alias_count imports using @/ alias ✅"

echo ""
echo "=============================================="
echo "Summary:"
if [ "$count" -eq 0 ]; then
    echo "✅ No broken imports found!"
else
    echo "⚠️  Found potential issues - review above"
fi

