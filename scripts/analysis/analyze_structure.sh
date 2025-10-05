#!/bin/bash

echo "📊 CODEBASE STRUCTURE ANALYSIS"
echo "==============================="
echo ""

echo "📁 Directory Structure:"
echo "----------------------"
echo "Total .tsx files by directory:"
find src/ecosystem/internal -name "*.tsx" | wc -l | xargs echo "  ecosystem/internal/:"
find src/ecosystem/client -name "*.tsx" 2>/dev/null | wc -l | xargs echo "  ecosystem/client/:"
find src/ecosystem/external -name "*.tsx" 2>/dev/null | wc -l | xargs echo "  ecosystem/external/:"
find src/ecosystem/partnership -name "*.tsx" 2>/dev/null | wc -l | xargs echo "  ecosystem/partnership/:"
find src/features -name "*.tsx" 2>/dev/null | wc -l | xargs echo "  features/ (redirects):"
find src/components -name "*.tsx" 2>/dev/null | wc -l | xargs echo "  components/:"
find src/shared -name "*.tsx" 2>/dev/null | wc -l | xargs echo "  shared/:"

echo ""
echo "🔄 Redirect Analysis:"
echo "--------------------"
grep -r "🔄 DUPLICATE REDIRECT" src --include="*.tsx" 2>/dev/null | wc -l | xargs echo "  Total redirect files:"

echo ""
echo "📈 Import Analysis:"
echo "------------------"
grep -r "from '@/ecosystem" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | xargs echo "  @/ecosystem imports:"
grep -r "from '@/features" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | xargs echo "  @/features imports:"
grep -r "from '@/shared" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | xargs echo "  @/shared imports:"
grep -r "from '@/components" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | xargs echo "  @/components imports:"

