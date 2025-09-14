# 🤖 Agent Execution Prompts

## 🎯 Agent 1: Database & Services Decomposition

**Agent Type:** `database-specialist`  
**Branch:** `feature/taskservice-decomposition`

### **Prompt:**
```
TASK: Decompose supabaseTaskService.ts into modular, maintainable services

CONTEXT:
You're working on the SISO Internal application's database layer. The current supabaseTaskService.ts file is a monolithic service that handles all task operations and has become risky to modify. It needs to be decomposed into focused, testable services.

DETAILED PLAN LOCATION:
Read the complete decomposition plan at:
.claude-tasks/2025-01-14__architectural-decomposition-planning/decomposition-plans/05-supabaseTaskService-decomposition.md

KEY DELIVERABLES:
1. BaseTaskService.ts - Abstract foundation class with retry logic and caching
2. LightWorkTaskService.ts - Service for light work tasks with specific validation
3. DeepWorkTaskService.ts - Service for deep work tasks with enhanced validation
4. TaskServiceRegistry.ts - Central service registry and factory
5. UnifiedTaskService.ts - Migration-friendly interface that matches current API

CRITICAL REQUIREMENTS:
- Maintain EXACT API compatibility with existing supabaseTaskService
- Implement enhanced error handling with retry logic
- Add intelligent caching to reduce database load
- Use enhanced commenting (English explanation every 5 lines)
- Include comprehensive TypeScript types
- Create thorough test coverage

CURRENT FILE LOCATION:
/src/services/supabaseTaskService.ts

MIGRATION STRATEGY:
1. Create BaseTaskService with common functionality
2. Extract LightWorkTaskService with current light work operations
3. Extract DeepWorkTaskService with current deep work operations  
4. Create registry system for service management
5. Create UnifiedTaskService that maintains exact same interface
6. Replace old service import with new unified service
7. Test that ALL existing functionality still works

TESTING CHECKLIST:
- [ ] Light work task CRUD operations work identically
- [ ] Deep work task CRUD operations work identically
- [ ] Error handling is improved (retries, better messages)
- [ ] Performance is same or better (caching helps)
- [ ] All existing components still work without changes
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing API

ENHANCED COMMENTING REQUIREMENTS:
- File header explaining purpose, context, and business reasoning
- Every 5 lines: Plain English explaining what and WHY
- Integration points documented
- Error handling strategy explained
- Performance optimizations noted
- Business logic reasoning included

WORK ON BRANCH: feature/taskservice-decomposition
DO NOT TOUCH: Other components - focus only on service layer
SAFETY: Keep original file as backup until fully tested

START WITH: Reading the current supabaseTaskService.ts to understand existing patterns
```

---

## 🎯 Agent 2: Configuration & Tab System

**Agent Type:** `backend-developer-mcp-enhanced`  
**Branch:** `feature/tabconfig-decomposition`

### **Prompt:**
```
TASK: Decompose tab-config.ts into a robust, type-safe configuration system

CONTEXT:
You're working on the SISO Internal application's tab navigation system. The current tab-config.ts is a monolithic configuration file that's risky to modify and lacks validation. It needs to become a modular, extensible system.

DETAILED PLAN LOCATION:
Read the complete decomposition plan at:
.claude-tasks/2025-01-14__architectural-decomposition-planning/decomposition-plans/03-tab-config-decomposition.md

KEY DELIVERABLES:
1. Individual tab configuration files (tabs/morning-tab-config.ts, etc.)
2. Comprehensive TypeScript types (types/tab-types.ts)
3. TabRegistry.ts - Service registry with validation and health checks
4. ConfigLoader.ts - Safe configuration loading with fallbacks
5. useTabConfiguration.ts - React hook for consuming configuration
6. Migration-friendly exports that maintain existing interface

CRITICAL REQUIREMENTS:
- Maintain exact compatibility with existing tab-config.ts usage
- Add comprehensive validation and error handling
- Implement fallback mechanisms for broken configurations
- Create type-safe interfaces for all configuration
- Add environment-specific configuration support
- Use enhanced commenting throughout

CURRENT FILE LOCATION:
/src/shared/services/tab-config.ts

MIGRATION STRATEGY:
1. Create comprehensive TypeScript interfaces for tab configuration
2. Extract each tab configuration to individual files
3. Create TabRegistry with validation and service discovery
4. Implement ConfigLoader with error handling and fallbacks
5. Create React hook for consuming configuration
6. Replace direct imports with hook usage
7. Test all navigation functionality works identically

TABS TO CONFIGURE:
- Morning Routine (morning-tab-config.ts)
- Light Work (light-work-tab-config.ts)
- Deep Work (deep-work-tab-config.ts)
- Wellness (wellness-tab-config.ts)  
- Time Box (timebox-tab-config.ts)
- Checkout (checkout-tab-config.ts)

TESTING CHECKLIST:
- [ ] All tabs load and display correctly
- [ ] Tab navigation works identically to before
- [ ] Configuration validation prevents invalid configs
- [ ] Fallback configuration loads if main config fails
- [ ] useTabConfiguration hook provides correct data
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing navigation

ENHANCED COMMENTING REQUIREMENTS:
- Explain tab configuration patterns and business reasoning
- Document validation rules and why they exist
- Explain fallback strategies and error recovery
- Comment registry patterns and service discovery
- Include examples of how to add new tabs

WORK ON BRANCH: feature/tabconfig-decomposition
FOCUS AREA: Configuration system only - don't modify UI components
SAFETY: Test configuration loading thoroughly before replacing original

START WITH: Analyzing existing tab-config.ts structure and usage patterns
```

---

## 🎯 Agent 3: Task Management System

**Agent Type:** `ai-integration-specialist`  
**Branch:** `feature/taskcontainer-decomposition`

### **Prompt:**
```
TASK: Decompose TaskContainer.tsx into modular, reusable task management system

CONTEXT:
You're working on the SISO Internal application's task management core. The TaskContainer.tsx component is critical because it's shared between Deep Work and Light Work pages. It currently does too much and is risky to modify.

DETAILED PLAN LOCATION:
Read the complete decomposition plan at:
.claude-tasks/2025-01-14__architectural-decomposition-planning/decomposition-plans/04-TaskContainer-decomposition.md

KEY DELIVERABLES:
1. useTaskCRUD.ts - React Query-based CRUD operations with optimistic updates
2. useTaskState.ts - State management for filtering, sorting, selection
3. useTaskValidation.ts - Business logic and validation rules
4. TaskProvider.tsx - Context provider for shared state
5. TaskManager.tsx - UI coordination component
6. Refactored TaskContainer.tsx - Simple wrapper component

CRITICAL REQUIREMENTS:
- MUST work identically for both 'light-work' and 'deep-work' task types
- Implement React Query for server state management
- Add optimistic updates for immediate UI feedback  
- Create comprehensive validation system
- Maintain exact same UI/UX experience
- Use enhanced commenting throughout

CURRENT FILE LOCATION:
/src/components/tasks/TaskContainer.tsx

INTEGRATION POINTS:
- Works with supabaseTaskService (use current version until Agent 1 finishes)
- Used by: Deep Work page, Light Work page
- Renders: TaskCard, TaskList, TaskForm components

MIGRATION STRATEGY:
1. Extract useTaskCRUD hook with React Query integration
2. Extract useTaskState hook for UI state management
3. Extract useTaskValidation hook for business rules
4. Create TaskProvider for context management
5. Create TaskManager for UI coordination
6. Refactor TaskContainer to use new modular system
7. Test with BOTH deep-work and light-work contexts

VALIDATION RULES:
- Light Work: Simple validation (title required, basic priority)
- Deep Work: Enhanced validation (description required, min time estimates)
- Both: Title length limits, priority validation, data integrity

TESTING CHECKLIST:
- [ ] Deep Work tasks create/read/update/delete correctly
- [ ] Light Work tasks create/read/update/delete correctly  
- [ ] Optimistic updates work (immediate UI response)
- [ ] Validation prevents invalid data entry
- [ ] Filtering and sorting work correctly
- [ ] Task selection and bulk operations work
- [ ] Error handling shows appropriate messages
- [ ] Loading states display correctly
- [ ] No regressions in existing functionality

ENHANCED COMMENTING REQUIREMENTS:
- Explain React Query patterns and why they're used
- Document optimistic update strategy
- Comment validation rules and business reasoning
- Explain context provider patterns
- Include examples of extending with new task types

WORK ON BRANCH: feature/taskcontainer-decomposition
CRITICAL: Test with BOTH task types - this component is shared!
SAFETY: Any breaking change affects both Deep Work and Light Work

START WITH: Understanding how TaskContainer currently integrates with both task types
```

---

## 📋 **Agent Coordination Strategy**

### **Launch Order:**
1. **Start Agent 1** (Database) - Foundation for others
2. **Start Agent 2** (Config) - Independent, can work parallel  
3. **Start Agent 3** (TaskContainer) - Can use current services while Agent 1 works

### **Why These 3 First:**
- **Highest Impact:** Database + Config + Task Management are the core architecture
- **Independent Work:** Each can work without blocking others
- **Manageable Integration:** 3 branches easier to merge than 5
- **Foundation Building:** These prepare for the remaining 2 components

### **After These Complete:**
We can launch the remaining 2 agents:
- **Agent 4:** AdminLifeLock decomposition (depends on config system)
- **Agent 5:** TabLayoutWrapper decomposition (can work independently)

## 🚀 **Copy-Paste Commands**

```bash
# Agent 1: Database Services
[Open Claude Code Window 1 and paste the Agent 1 prompt above]

# Agent 2: Configuration System  
[Open Claude Code Window 2 and paste the Agent 2 prompt above]

# Agent 3: Task Management
[Open Claude Code Window 3 and paste the Agent 3 prompt above]
```

This gives you maximum parallelization while keeping coordination manageable. The 3 agents can work for 4-6 hours and deliver the core architectural improvements!