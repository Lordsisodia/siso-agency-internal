# Tool Intelligence - Smart MCP Routing

## 🛠️ Available Tool Categories

### Core Claude Code Tools:
```
File Operations:
- Read: Read file content
- Write: Create/overwrite files  
- Edit: Make targeted edits
- MultiEdit: Multiple edits in one operation
- Glob: Find files by pattern
- Grep: Search file content

Development Tools:
- Bash: Execute shell commands
- TodoWrite: Task management and planning

Navigation Tools:
- Task: Launch specialized agents
```

### MCP Servers Available:
```
Supabase (siso-memory-vault):
- Database operations
- Table management
- Migration execution
- TypeScript type generation
- Edge function deployment

Zen Intelligence (zen-mcp):
- Deep analysis (thinkdeep)
- Planning (planner)  
- Consensus building
- Code review
- Security audits
- Documentation generation

Serena Code Intelligence:
- Symbol-based code operations
- Intelligent search and navigation
- Memory management
- Project analysis
```

## 🧠 Smart Routing Logic

### Database Operations → Supabase MCP
```javascript
const isDatabaseTask = (task) => {
  return task.includes([
    'database', 'table', 'migration', 'supabase',
    'sql', 'schema', 'data', 'postgres'
  ]);
};

// Auto-route to: mcp__siso-memory-vault__*
// Examples:
// - "Add user preferences table" → execute_sql, apply_migration
// - "Generate TypeScript types" → generate_typescript_types
// - "Deploy edge function" → deploy_edge_function
```

### Complex Analysis → Zen MCP
```javascript
const isComplexAnalysis = (task) => {
  return task.includes([
    'analyze', 'review', 'audit', 'plan', 'architecture',
    'security', 'performance', 'debug', 'refactor'
  ]);
};

// Auto-route to: mcp__zen-mcp__*
// Examples:
// - "Analyze code architecture" → analyze
// - "Plan feature implementation" → planner  
// - "Security audit" → secaudit
// - "Deep debugging" → debug
```

### Code Operations → Serena MCP
```javascript
const isCodeNavigation = (task) => {
  return task.includes([
    'find symbol', 'search code', 'refactor', 
    'understand codebase', 'navigate code'
  ]);
};

// Auto-route to: mcp__serena__*
// Examples:
// - "Find all references to function" → find_referencing_symbols
// - "Get code overview" → get_symbols_overview
// - "Replace symbol" → replace_symbol_body
```

### File Operations → Claude Code
```javascript
const isBasicFileOp = (task) => {
  return task.includes([
    'read file', 'edit file', 'create file',
    'search files', 'run command'
  ]);
};

// Use standard Claude Code tools:
// - Read files → Read tool
// - Edit files → Edit or MultiEdit
// - Find files → Glob
// - Search content → Grep
```

## 🎯 Intelligent Tool Selection

### Decision Tree:
```
1. Is this a database operation?
   YES → Use Supabase MCP tools
   NO → Continue

2. Does this require complex analysis/planning?
   YES → Use Zen MCP tools
   NO → Continue

3. Does this involve code navigation/symbols?
   YES → Use Serena MCP tools  
   NO → Continue

4. Is this a basic file/command operation?
   YES → Use Claude Code tools
   NO → Ask for clarification
```

### Multi-Tool Workflows:
```
Complex Feature Implementation:
1. Zen MCP (planner) → Plan the feature
2. Serena MCP → Analyze existing code patterns
3. Claude Code → Implement file changes
4. Supabase MCP → Handle database changes
5. Zen MCP (codereview) → Review implementation
```

## 🚀 Auto-Enhancement Patterns

### Batch Operations:
```javascript
// Instead of multiple single calls:
Read file1 → Read file2 → Read file3

// Auto-batch into:
[Read file1, Read file2, Read file3] // Parallel execution
```

### Context Optimization:
```javascript
// Smart context management:
const shouldUseSerenaRead = (files) => {
  return files.length > 3 || files.some(f => f.size > '50KB');
};

// For large codebases, prefer symbolic operations over full reads
```

### Error Recovery:
```javascript
// If primary tool fails:
if (supabaseMCP.fails) {
  fallbackTo(claudeCodeBash('psql commands'));
}

if (zenMCP.fails) {
  fallbackTo(claudeCodeAnalysis());
}
```

## 📊 Tool Performance Tracking

### Usage Metrics:
```
- Tool selection accuracy
- Task completion success rate  
- Time saved through smart routing
- User satisfaction with tool choices
```

### Optimization Feedback:
```
- Track which tool combinations work well
- Learn from failed tool selections
- Adapt routing logic based on success patterns
- Improve fallback strategies
```

## 🔄 Adaptive Routing

### Learning Patterns:
```javascript
// Track successful patterns:
const successfulPatterns = {
  'database migration': ['supabase.apply_migration', 'supabase.generate_types'],
  'bug analysis': ['zen.debug', 'serena.find_symbol', 'claudecode.read'],
  'feature planning': ['zen.planner', 'zen.consensus', 'todowrtie']
};
```

### Context-Aware Selection:
```javascript
// Consider project context:
const projectContext = {
  tech_stack: ['React', 'TypeScript', 'Supabase'],
  current_task_type: 'frontend_development',
  complexity_level: 'medium'
};

// Adjust tool selection based on context
```

## 🛡️ Safety and Fallbacks

### Tool Validation:
```javascript
// Before using any tool:
1. Verify tool is available
2. Check required parameters
3. Validate permissions
4. Prepare fallback options
```

### Graceful Degradation:
```javascript
// If advanced MCP tools fail:
Supabase MCP → Standard Bash + psql
Zen MCP → Claude Code analysis  
Serena MCP → Standard Grep/Read operations
```

## 📋 Quick Reference

### Common Task → Tool Mapping:
```
Database Schema → mcp__siso-memory-vault__apply_migration
Code Analysis → mcp__zen-mcp__analyze  
Planning → mcp__zen-mcp__planner
Code Search → mcp__serena__find_symbol
File Edit → Edit or MultiEdit
Command → Bash
Documentation → mcp__zen-mcp__docgen
Security → mcp__zen-mcp__secaudit
```

---

*Tool Intelligence - The right tool for every job, automatically*