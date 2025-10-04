# Context Intelligence - Smart Memory Management

## 🧠 Context Window Optimization

### Target Context Allocation:
```
Total Context Window: 100%
├── Core Project Context: 20%
│   ├── Tech stack (React, TypeScript, Supabase, etc.)
│   ├── Architecture patterns
│   └── Development rules
├── Active Task Context: 30%  
│   ├── Current task description
│   ├── TodoWrite list
│   └── Immediate working files
├── Tool Context: 20%
│   ├── Available MCP tools
│   ├── Tool routing logic
│   └── Command patterns
└── Working Buffer: 30%
    ├── File content as needed
    ├── Code analysis results
    └── Temporary context
```

### Context Efficiency Rules:
```
1. NEVER load full files unless absolutely necessary
2. Use symbolic operations (Serena MCP) for code navigation
3. Reference files by path rather than embedding content
4. Load details progressively as needed
5. Clear working buffer between major tasks
```

## 📚 Smart Memory Patterns

### Project Memory:
```javascript
// Core context that stays loaded:
const projectCore = {
  tech_stack: {
    frontend: 'React + TypeScript + Vite',
    database: 'Supabase + PostgreSQL',
    styling: 'Tailwind CSS + shadcn/ui',
    components: 'Radix UI primitives',
    forms: 'React Hook Form + Zod'
  },
  
  patterns: {
    auth: 'const { user } = useClerkUser();',
    data: 'const { data, error, mutate } = useSWR(\'/api/tasks\', fetcher);',
    supabase: 'await supabase.from(\'table\').select(\'*\').eq(\'user_id\', user.id)',
    modal: 'useState + Radix Dialog primitives',
    form: 'useForm + zodResolver'
  },
  
  rules: {
    typescript: 'Strict mode - NO any types',
    testing: 'ALWAYS write tests first',
    mobile: 'PWA requirements mandatory',
    security: 'Zod validation for all inputs',
    patterns: 'Copy existing, don\'t create new'
  },
  
  domains: {
    lifelock: '/ecosystem/internal/lifelock/',
    admin: '/ecosystem/internal/admin/',
    tasks: '/ecosystem/internal/tasks/'
  }
};
```

### Working Memory:
```javascript
// Context that changes with each task:
const workingMemory = {
  current_task: 'Fix mobile scroll issues',
  todo_list: [...], // Current TodoWrite list
  active_files: ['TabLayoutWrapper.tsx', 'MorningRoutineSection.tsx'],
  recent_changes: [...], // Last 3-5 changes made
  context_notes: [...], // Key insights from current work
  tools_used: ['Edit', 'Read', 'TodoWrite'], // Tools used in session
};
```

### Reference Memory:
```javascript
// Files and information referenced but not loaded:
const referenceMemory = {
  available_files: {
    components: ['Button', 'Card', 'Input', ...],
    services: ['database', 'auth', 'api', ...],
    types: ['User', 'Task', 'Config', ...]
  },
  
  patterns_locations: {
    authentication: 'src/shared/ClerkProvider.tsx',
    database_ops: 'src/services/database/',
    component_examples: 'src/components/',
    hook_patterns: 'src/hooks/'
  },
  
  external_resources: {
    docs: 'https://supabase.com/docs',
    ui_components: 'https://ui.shadcn.com',
    tailwind: 'https://tailwindcss.com'
  }
};
```

## 🎯 Context-Aware Loading

### Progressive Detail Loading:
```javascript
// Start with minimal context:
Level 1: File existence and structure
Level 2: Function/component signatures  
Level 3: Implementation details
Level 4: Full file content (only when necessary)

// Example:
"Fix authentication issue" 
→ Level 1: Check auth-related files exist
→ Level 2: Get auth function signatures
→ Level 3: Load specific function implementation
→ Level 4: Full file only if needed for complex changes
```

### Smart File Loading:
```javascript
const shouldLoadFullFile = (file, task) => {
  return (
    file.size < '10KB' ||
    task.requires_full_context ||
    file.changes_needed > 'simple_edit'
  );
};

const loadStrategy = (file, task) => {
  if (shouldLoadFullFile(file, task)) {
    return 'full_content';
  } else {
    return 'symbolic_navigation'; // Use Serena MCP
  }
};
```

### Context Cleanup:
```javascript
// Between major tasks:
const contextCleanup = () => {
  // Clear working buffer
  workingMemory.active_files = [];
  workingMemory.recent_changes = [];
  
  // Keep only essential context
  // Reset tool context to defaults
  // Prepare for new task context
};
```

## 🔄 Memory Persistence

### Session Memory:
```javascript
// Information that persists across task switches:
const sessionMemory = {
  completed_tasks: [...], // What's been accomplished
  learned_patterns: [...], // New patterns discovered
  project_insights: [...], // Understanding gained about codebase
  effective_tools: [...], // Which tools worked well
  common_locations: [...], // Frequently accessed files/patterns
};
```

### Cross-Session Learning:
```javascript
// Patterns to remember for future sessions:
const persistentLearning = {
  project_structure: 'Understanding of how project is organized',
  common_tasks: 'Frequent types of work done',
  effective_workflows: 'What sequences of actions work well',
  problem_patterns: 'Common issues and their solutions',
  optimization_opportunities: 'Ways to work more efficiently'
};
```

## 🚀 Context Optimization Strategies

### Lazy Loading:
```javascript
// Load information only when needed:
const lazyLoad = {
  file_content: 'Load only when editing or analyzing',
  dependencies: 'Load only when changing imports',
  test_files: 'Load only when writing or updating tests',
  documentation: 'Load only when creating or updating docs'
};
```

### Context Compression:
```javascript
// Compress repeated information:
const compress = {
  file_references: 'Use relative paths, not full content',
  pattern_references: 'Link to pattern library, not duplicate',
  repeated_code: 'Reference existing examples, not embed',
  tool_descriptions: 'Use short names, not full descriptions'
};
```

### Smart Caching:
```javascript
// Cache frequently used information:
const smartCache = {
  project_patterns: 'Keep common patterns readily available',
  file_structure: 'Maintain map of important files',
  recent_context: 'Keep last 2-3 tasks accessible',
  tool_preferences: 'Remember which tools work best for what'
};
```

## 📊 Context Health Monitoring

### Usage Metrics:
```javascript
const contextMetrics = {
  current_usage: '45%', // Of total context window
  core_context: '18%',  // Project essentials
  task_context: '15%',  // Current work
  tool_context: '8%',   // Available tools  
  buffer_available: '55%' // For detailed work
};
```

### Optimization Triggers:
```javascript
const optimizationTriggers = {
  context_usage_over_70: 'Start aggressive cleanup',
  buffer_under_25: 'Switch to reference-only mode',
  task_switch: 'Clear working memory',
  session_over_2_hours: 'Reset to core context only'
};
```

## 🛡️ Context Safety

### Fallback Strategies:
```javascript
// If context becomes overloaded:
const fallbackStrategies = {
  emergency_cleanup: 'Keep only current task + core context',
  minimal_mode: 'Work with file references only',
  progressive_reload: 'Rebuild context piece by piece',
  session_restart: 'Fresh start with lessons learned'
};
```

### Context Validation:
```javascript
// Ensure context remains useful:
const validateContext = () => {
  return {
    has_project_core: true,
    has_current_task: true,
    has_tool_access: true,
    buffer_sufficient: context.buffer > 25,
    no_stale_data: context.last_update < '30min'
  };
};
```

---

*Context Intelligence - Maximum capability within optimal constraints*