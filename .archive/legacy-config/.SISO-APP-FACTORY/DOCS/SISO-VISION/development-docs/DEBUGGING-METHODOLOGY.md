# 🧠 Debugging Methodology - Learned from API Mistakes

## ⚡ MANDATORY PRE-CODING CHECKLIST

Before writing ANY new code, ALWAYS run through this checklist:

### 1. 🔍 **WHAT'S ALREADY WORKING?**
- [ ] Find a similar working feature in the codebase
- [ ] Use Grep to search for existing patterns: `grep -r "similar_functionality" src/`
- [ ] Read the working implementation completely
- [ ] Understand the data flow from frontend to backend

### 2. 🧮 **MUSK'S ALGORITHM (MANDATORY)**
- [ ] **Question Requirements**: Do we actually need new code?
- [ ] **Delete/Simplify**: What existing solution can we extend?
- [ ] **Follow Working Patterns**: Use the same architecture that already works
- [ ] **Test Incrementally**: Make smallest possible changes
- [ ] **Document Why**: Record why this approach vs building new

### 3. 📊 **EVIDENCE-BASED DEBUGGING**
When user says "X already works":
- [ ] Find X in the codebase immediately
- [ ] Trace how X gets its data (API routes, services, database)
- [ ] Apply the SAME pattern to the broken feature
- [ ] Never build parallel systems unless absolutely necessary

### 4. 🔧 **ARCHITECTURE INVESTIGATION PROTOCOL**
```bash
# Always run these commands first:
grep -r "working_feature" src/           # Find the working code
grep -r "API.*working_feature" src/      # Find the API pattern
ls src/pages/api/                        # Check existing API routes
grep -r "taskDatabaseService" src/       # Find the data service pattern
```

## 🚨 **RED FLAGS - STOP AND INVESTIGATE**
- User mentions something "already works" → Investigate that working system first
- Building new APIs when API errors occur → Check existing API routes first  
- Creating parallel systems → Question if extension is better
- Getting 404s on new endpoints → Check if working endpoints exist

## ✅ **SUCCESS PATTERN**
1. **Find the working example** (light work sections)
2. **Trace the data flow** (frontend → API route → service → database)
3. **Extend the working pattern** (add morning routine to existing system)
4. **Test incrementally** (one small change at a time)

## 📝 **DOCUMENTATION RULE**
Always document:
- Why we chose to extend vs build new
- What working pattern we're following
- Evidence that supports this approach

---
**Created after API debugging mistake - August 28, 2025**
**Principle: Extend what works instead of building what breaks**