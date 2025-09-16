# 🛡️ Claude Code Guardrails - Stop AI from Destroying Your Architecture

*How to Prevent AI Coding Assistants from Making Your Codebase Worse*

## 🚨 **THE PROBLEM: AI Over-Engineering Bias**

AI coding assistants see your existing complexity and assume it's GOOD architecture. Every "helpful" suggestion makes things worse by:
- Creating more micro-abstractions
- Adding files to problematic directories (`/shared/`, `/refactored/`)
- Generating new service patterns when simple ones exist
- Importing from everywhere without architectural boundaries

## 🎯 **GUARDRAILS FOR CLAUDE CODE REQUESTS**

### **❌ NEVER SAY THIS TO CLAUDE CODE:**
- "Fix this functionality" (too vague - will over-engineer)
- "Add a new feature" (will copy existing bad patterns)
- "Make this better" (will add unnecessary abstractions)
- "Refactor this code" (will create more complexity)

### **✅ ALWAYS SAY THIS INSTEAD:**
- "Fix this broken import/function call using existing patterns"
- "Add this ONE specific function using direct Supabase calls"  
- "Copy this working pattern from [specific file]"
- "Use the SIMPLEST possible approach - no new abstractions"

## 🔒 **MANDATORY PROMPTING PATTERN:**

**Before ANY Claude Code request, start with:**
```
"ARCHITECTURE CONSTRAINTS:
- NO new service patterns (use existing Supabase calls)  
- NO new micro-hooks (combine into existing hooks)
- NO files in /shared/ or /refactored/ directories
- NO imports more than 2 directories deep
- Use the SIMPLEST approach possible"
```

## 🛑 **IMMEDIATE RED FLAGS TO REJECT:**

**If Claude Code suggests ANY of these, say NO:**
- Creating new `useTaskXXX` hooks
- Adding files to `/shared/` or `/refactored/`  
- New service registries or factories
- "Let me create a reusable component" (when you just need a fix)
- More than 5 imports in a single file

## 🎯 **SAFE PATTERNS TO REQUEST:**

### **For Bug Fixes:**
```
"Fix this broken [specific thing] by copying the pattern from [working file]. 
No new abstractions - just make it work like [example]."
```

### **For New Features:**
```
"Add [specific functionality] using direct Supabase calls like in [example file].
Keep all code in /ecosystem/internal/[feature]/ directory."
```

### **For Improvements:**
```
"Simplify this code by removing abstractions and using direct function calls.
Show me the before/after with fewer files, not more."
```

## 🚀 **THE ANTI-AI-COMPLEXITY WORKFLOW:**

1. **Before asking Claude Code for help:**
   - Find a working example of similar functionality
   - Identify the SIMPLEST existing pattern
   - Specify exactly what you want (no general requests)

2. **When Claude Code responds:**
   - Count the files it wants to create (if >2, reject)
   - Check if it's using existing patterns (if not, reject)  
   - Verify it's not creating new abstractions (if yes, reject)

3. **After implementation:**
   - Did it make your architecture simpler? ✅ Good
   - Did it add more complexity? ❌ Revert and try again

## 💡 **PRO TIP: The "Dumb Solution" Request**

When stuck, ask Claude Code:
```
"Give me the DUMBEST, most OBVIOUS solution with NO abstractions. 
Just direct function calls and inline code. I can refactor later."
```

**Dumb solutions are often the best solutions.**

## 🎯 **EXAMPLE: Before/After Prompting**

### **❌ BAD PROMPT (Creates Complexity):**
"Help me fix the task management functionality in LifeLock"

**Result:** Claude creates useTaskCRUD, useTaskState, TaskServiceRegistry, etc.

### **✅ GOOD PROMPT (Prevents Complexity):**
"Fix this broken task completion by copying the Supabase update pattern from TaskCard.tsx. No new hooks or services - just make the button work."

**Result:** Claude adds 2 lines of working code using existing patterns.

## 🛡️ **SUMMARY: Train Your AI, Don't Let It Train You**

**AI coding assistants are pattern-matching machines** - they copy what they see. If they see complex architecture, they make it MORE complex.

**Your job:** Give them VERY specific constraints and examples of simple patterns to copy.

**Remember:** You're the architect. Claude Code is just a very enthusiastic junior developer who needs clear boundaries.

---

*Use these guardrails every time you interact with Claude Code or any AI coding assistant.*