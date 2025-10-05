#!/bin/bash

echo "🔍 ANALYZING DUPLICATE FILES"
echo "============================="
echo ""

echo "AdminTasks.tsx variants:"
echo "------------------------"
for file in $(find src/ecosystem -name "AdminTasks.tsx" 2>/dev/null); do
    lines=$(wc -l < "$file" | tr -d ' ')
    is_redirect=$(grep -c "🔄 DUPLICATE REDIRECT" "$file")
    
    if [ $is_redirect -gt 0 ]; then
        echo "  🔄 $file ($lines lines) - REDIRECT"
    else
        echo "  📄 $file ($lines lines) - REAL FILE"
        head -5 "$file" | sed 's/^/      /'
    fi
    echo ""
done

echo "QuickActions.tsx variants:"
echo "-------------------------"
for file in $(find src/ecosystem -name "QuickActions.tsx" 2>/dev/null); do
    lines=$(wc -l < "$file" | tr -d ' ')
    is_redirect=$(grep -c "🔄 DUPLICATE REDIRECT" "$file")
    
    if [ $is_redirect -gt 0 ]; then
        echo "  🔄 $file ($lines lines) - REDIRECT"
    else
        echo "  📄 $file ($lines lines) - REAL FILE"
    fi
done

