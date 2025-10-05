#!/bin/bash

echo "🗂️  ECOSYSTEM DOMAIN VERIFICATION"
echo "=================================="
echo ""

echo "Core Domains in ecosystem/internal/:"
echo "-------------------------------------"

for domain in admin tasks dashboard lifelock projects planning app-plan tools automations leaderboard xp-store; do
    if [ -d "src/ecosystem/internal/$domain" ]; then
        file_count=$(find "src/ecosystem/internal/$domain" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
        ts_count=$(find "src/ecosystem/internal/$domain" -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
        total=$((file_count + ts_count))
        echo "  ✅ $domain/: $file_count .tsx + $ts_count .ts = $total files"
    else
        echo "  ❌ $domain/: NOT FOUND"
    fi
done

echo ""
echo "External Domains:"
echo "-----------------"

echo "ecosystem/client/:"
if [ -d "src/ecosystem/client" ]; then
    client_files=$(find "src/ecosystem/client" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ $client_files files"
    ls src/ecosystem/client/ | sed 's/^/    - /'
else
    echo "  ❌ NOT FOUND"
fi

echo ""
echo "ecosystem/external/:"
if [ -d "src/ecosystem/external" ]; then
    external_files=$(find "src/ecosystem/external" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ $external_files files"
    ls src/ecosystem/external/ | sed 's/^/    - /'
else
    echo "  ❌ NOT FOUND"
fi

echo ""
echo "ecosystem/partnership/:"
if [ -d "src/ecosystem/partnership" ]; then
    partner_files=$(find "src/ecosystem/partnership" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ $partner_files files"
else
    echo "  ❌ NOT FOUND"
fi

echo ""
echo "=================================="
echo "Domain verification complete"

