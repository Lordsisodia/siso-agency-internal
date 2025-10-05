#!/bin/bash

echo "🔍 Checking usage of 9 remaining /features files..."
echo "=================================================="

files=(
    "UnifiedTaskCard"
    "UnifiedWorkSection"
    "TenantSwitcher"
    "LandingPageRouter"
    "PartnershipPortal"
    "ClientPortal"
    "PartnerAuthGuard"
    "ComingSoonSection"
    "PartnerLeaderboard"
)

for file in "${files[@]}"; do
    count=$(grep -r "from.*$file\|import.*$file" src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "src/features" | wc -l | tr -d ' ')
    echo "$file: $count imports (outside /features)"
done

echo ""
echo "=================================================="
echo "Checking /ecosystem for equivalents..."
echo ""

for file in "${files[@]}"; do
    found=$(find src/ecosystem -name "$file.tsx" 2>/dev/null)
    if [ -n "$found" ]; then
        echo "✅ $file exists in ecosystem: $found"
    else
        echo "❌ $file NOT in ecosystem"
    fi
done

