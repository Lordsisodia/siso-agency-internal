#!/bin/bash

echo "📊 SHARED DIRECTORY USAGE ANALYSIS"
echo "==================================="
echo ""

# Check each questionable directory
for dir in ai chat features notion-editor; do
    if [ -d "src/shared/$dir" ]; then
        files=$(find "src/shared/$dir" -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
        imports=$(grep -r "from.*@/shared/$dir" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
        
        if [ $imports -eq 0 ]; then
            echo "❌ /shared/$dir/: $files files, $imports imports (ORPHANED - DELETE)"
        elif [ $imports -lt 5 ]; then
            echo "⚠️  /shared/$dir/: $files files, $imports imports (LOW USAGE)"
        else
            echo "✅ /shared/$dir/: $files files, $imports imports (ACTIVELY USED)"
        fi
    fi
done

echo ""
echo "==================================="
echo "RECOMMENDATION:"
echo "  - Delete orphaned directories (0 imports)"
echo "  - Move low-usage to ecosystem (1-4 imports)"
echo "  - Keep actively used (5+ imports)"

