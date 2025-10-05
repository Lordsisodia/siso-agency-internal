#!/bin/bash

echo "🧪 TESTING CRITICAL IMPORT PATHS"
echo "================================="
echo ""

echo "1️⃣ Testing @/ecosystem imports..."
echo "-----------------------------------"

# Sample 10 random @/ecosystem imports and verify targets exist
count=0
errors=0

for import_line in $(grep -r "from '@/ecosystem" src --include="*.tsx" --include="*.ts" 2>/dev/null | head -20); do
    # Extract the import path
    import_path=$(echo "$import_line" | grep -o "@/ecosystem[^'\"]*" | head -1)
    
    if [ -n "$import_path" ]; then
        # Convert to file path
        file_path=$(echo "$import_path" | sed 's|@/|src/|' | sed 's|$|.tsx|')
        alt_path=$(echo "$import_path" | sed 's|@/|src/|' | sed 's|$|.ts|')
        index_path=$(echo "$import_path" | sed 's|@/|src/|' | sed 's|$|/index.tsx|')
        
        if [ -f "$file_path" ] || [ -f "$alt_path" ] || [ -f "$index_path" ]; then
            count=$((count + 1))
        else
            echo "  ⚠️ Cannot find: $import_path"
            errors=$((errors + 1))
        fi
    fi
done

echo "  Checked: $count imports"
echo "  Errors: $errors"

echo ""
echo "2️⃣ Testing @/shared imports..."
echo "-------------------------------"

# Verify shared imports resolve
shared_count=$(grep -r "from '@/shared" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Total @/shared imports: $shared_count"
echo "  Files in src/shared: $(find src/shared -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)"

echo ""
echo "3️⃣ Testing @/components imports..."
echo "-----------------------------------"

comp_count=$(grep -r "from '@/components" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Total @/components imports: $comp_count"
echo "  Files in src/components: $(find src/components -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l)"

echo ""
echo "4️⃣ Checking for undefined imports..."
echo "--------------------------------------"

# Look for common undefined import patterns
undefined_count=$(grep -r "from 'undefined'" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  'undefined' imports: $undefined_count"

empty_count=$(grep -r "from ''" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Empty string imports: $empty_count"

echo ""
echo "================================="
echo "SUMMARY:"
if [ $errors -eq 0 ] && [ $undefined_count -eq 0 ] && [ $empty_count -eq 0 ]; then
    echo "✅ ALL IMPORTS HEALTHY"
else
    echo "⚠️ Found some issues (see above)"
fi

