#!/bin/bash

echo "🔍 Checking which unique ai-first files are actually imported..."
echo "================================================================"

# Check for imports FROM ai-first in the main src/
echo ""
echo "Imports FROM src/ TO ai-first:"
grep -r "from.*['\"].*ai-first" src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "Sample imports (first 20):"
grep -r "from.*['\"].*ai-first" src --include="*.tsx" --include="*.ts" | head -20

# Check for specific high-value files
echo ""
echo "================================================================"
echo "Checking high-value candidates:"
echo ""

for file in "CollapsibleTaskCard" "TimeBlockView" "MorningRoutineTimer" "RealTaskManager" "TasksProvider"; do
    count=$(grep -r "from.*$file" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
    echo "$file: $count imports"
done

