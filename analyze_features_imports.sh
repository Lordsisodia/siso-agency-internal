#!/bin/bash

echo "📊 ANALYZING @/features IMPORTS"
echo "================================"
echo ""

echo "Imports FROM outside features/ TO features/:"
echo "--------------------------------------------"
outside_to_features=$(grep -r "from '@/features" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/features/" | wc -l | tr -d ' ')
echo "Count: $outside_to_features"
echo ""

if [ $outside_to_features -gt 0 ]; then
    echo "These are the REAL blockers:"
    grep -r "from '@/features" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/features/"
fi

echo ""
echo "Imports WITHIN features/ to other features/ files:"
echo "---------------------------------------------------"
within_features=$(grep -r "from '@/features" src/features --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "Count: $within_features"
echo ""
echo "These don't matter - they'll be deleted with features/"

