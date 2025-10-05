#!/bin/bash

echo "📊 FINAL CODEBASE ANALYSIS"
echo "=========================="
echo ""

echo "STRUCTURE SUMMARY:"
echo "------------------"
total_tsx=$(find src -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
total_ts=$(find src -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
total=$((total_tsx + total_ts))

echo "  Total .tsx files: $total_tsx"
echo "  Total .ts files: $total_ts"
echo "  TOTAL: $total files"

echo ""
echo "ECOSYSTEM BREAKDOWN:"
echo "--------------------"

internal=$(find src/ecosystem/internal -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
client=$(find src/ecosystem/client -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
external=$(find src/ecosystem/external -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
partnership=$(find src/ecosystem/partnership -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
ecosystem_total=$((internal + client + external + partnership))

echo "  internal/: $internal files"
echo "  client/: $client files"
echo "  external/: $external files"
echo "  partnership/: $partnership files"
echo "  ECOSYSTEM TOTAL: $ecosystem_total files"

echo ""
echo "OTHER DIRECTORIES:"
echo "------------------"

features=$(find src/features -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
components=$(find src/components -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
shared=$(find src/shared -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
pages=$(find src/pages -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')

echo "  features/ (redirects): $features files"
echo "  components/: $components files"
echo "  shared/: $shared files"
echo "  pages/: $pages files"

echo ""
echo "IMPORT HEALTH:"
echo "--------------"

ecosystem_imports=$(grep -r "from '@/ecosystem" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
features_imports=$(grep -r "from '@/features" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
shared_imports=$(grep -r "from '@/shared" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
component_imports=$(grep -r "from '@/components" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')

echo "  @/ecosystem: $ecosystem_imports imports"
echo "  @/features: $features_imports imports (via redirects)"
echo "  @/shared: $shared_imports imports"
echo "  @/components: $component_imports imports"

echo ""
echo "REDIRECT STATUS:"
echo "----------------"

redirect_count=$(grep -r "🔄 DUPLICATE REDIRECT" src --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "  Active redirects: $redirect_count files"

echo ""
echo "=========================="
echo "📈 CODEBASE METRICS:"
echo "=========================="
echo "  Total files: $total"
echo "  Ecosystem: $ecosystem_total ($(echo "scale=1; $ecosystem_total * 100 / $total" | bc)%)"
echo "  Features (redirects): $features ($(echo "scale=1; $features * 100 / $total" | bc)%)"
echo "  Shared/Components: $((shared + components)) ($(echo "scale=1; ($shared + $components) * 100 / $total" | bc)%)"

