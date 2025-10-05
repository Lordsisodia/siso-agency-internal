#!/bin/bash

echo "⚡ RUNTIME ISSUE CHECK"
echo "======================"
echo ""

echo "1️⃣ CHECKING FOR COMMON RUNTIME ERRORS..."
echo "------------------------------------------"

# Check for console.log that might cause issues
console_logs=$(grep -r "console\.log" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  console.log statements: $console_logs (informational)"

# Check for debugger statements
debuggers=$(grep -r "debugger" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  debugger statements: $debuggers"

# Check for TODO/FIXME comments
todos=$(grep -r "TODO\|FIXME" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  TODO/FIXME comments: $todos"

echo ""
echo "2️⃣ CHECKING FOR POTENTIAL NULL/UNDEFINED ISSUES..."
echo "----------------------------------------------------"

# Check for optional chaining usage (good)
optional_chain=$(grep -r "\?\.  " src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Optional chaining usage: $optional_chain (good practice)"

# Check for non-null assertions (potentially risky)
non_null=$(grep -r "!\.  " src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Non-null assertions: $non_null (review these)"

echo ""
echo "3️⃣ CHECKING HOOK USAGE..."
echo "--------------------------"

# Verify hooks are imported correctly
echo "  React hooks imports:"
use_state=$(grep -r "useState" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "    useState: $use_state usages"

use_effect=$(grep -r "useEffect" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "    useEffect: $use_effect usages"

# Custom hooks
custom_hooks=$(find src -name "use*.ts" -o -name "use*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "  Custom hooks: $custom_hooks files"

echo ""
echo "4️⃣ CHECKING API/SERVICE IMPORTS..."
echo "------------------------------------"

# Check for API service imports
api_imports=$(grep -r "from.*api" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  API-related imports: $api_imports"

# Check for Supabase imports
supabase_imports=$(grep -r "from.*supabase" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  Supabase imports: $supabase_imports"

echo ""
echo "5️⃣ CHECKING FOR MISSING DEPENDENCIES..."
echo "-----------------------------------------"

# Check if package.json dependencies are imported
if grep -q "framer-motion" package.json 2>/dev/null; then
    fm_usage=$(grep -r "framer-motion" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ framer-motion: installed, $fm_usage usages"
else
    echo "  ⚠️ framer-motion: not in package.json"
fi

if grep -q "lucide-react" package.json 2>/dev/null; then
    lucide_usage=$(grep -r "lucide-react" src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ lucide-react: installed, $lucide_usage usages"
else
    echo "  ⚠️ lucide-react: not in package.json"
fi

echo ""
echo "======================"
echo "Runtime checks complete"

