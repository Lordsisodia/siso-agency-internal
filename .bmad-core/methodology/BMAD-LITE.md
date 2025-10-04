# BMAD-Lite v2.0 - Practical Development Intelligence

## 🎯 Core Principles
**Simple, Practical, Valuable** - Each component must add more value than overhead.

**Stack**: React + TypeScript + Vite + Supabase + Tailwind + PWA  
**Commands**: `npm run dev` | `npm run build` | `npx tsc --noEmit`  
**Rules**: Mobile-first | Auto-test | Copy existing patterns | NO abstractions

---

## 🧠 TASK INTELLIGENCE
**TodoWrite Integration** - Systematic task decomposition and tracking

### Auto-Activation Triggers:
- Multi-component features (>3 files)
- Architecture changes 
- Tasks requiring >1 day
- User explicitly requests planning

### Task Breakdown Pattern:
```
1. Analyze current state
2. Identify required changes  
3. Plan implementation steps
4. Execute with validation
5. Test and verify
```

**Example Usage:**
```
User: "Add dark mode to the app"
→ Auto-create TodoWrite list:
  - Analyze current theme system
  - Design dark mode color scheme  
  - Implement theme context
  - Update all components
  - Test across devices
```

---

## 🛠️ TOOL INTELLIGENCE  
**Smart MCP Routing** - Automatically select the best tool for each task

### MCP Tool Categories:
- **Database**: `mcp__siso-memory-vault__*` for Supabase operations
- **Documentation**: `mcp__zen-mcp__*` for analysis and planning
- **Code Operations**: Standard Claude Code tools for file operations
- **Web Research**: `WebSearch` and `WebFetch` for external information

### Auto-Routing Rules:
```
Database queries → Supabase MCP tools
Complex analysis → Zen MCP (thinkdeep, analyze)
File operations → Claude Code (Read, Write, Edit)
Planning tasks → Zen MCP (planner, consensus)
```

---

## 🧠 CONTEXT INTELLIGENCE
**Smart Memory Management** - Optimize context window usage

### Context Optimization:
- **Core Context**: Keep project essentials (stack, patterns, rules)
- **Working Memory**: Current task context only
- **Smart Caching**: Reference files without full loading
- **Progressive Detail**: Load details only when needed

### Memory Patterns:
```
Active Session (30%): Current task + immediate context
Project Context (20%): Tech stack + patterns + rules  
Tool Context (20%): Available MCPs + capabilities
Buffer (30%): Available for detailed work
```

---

## 🔄 SIMPLE WORKFLOWS
**Linear, Clear, Fail-Safe** - No complex orchestration

### Core Workflow:
```
ANALYZE → PLAN → EXECUTE → VALIDATE
```

### Workflow Details:
1. **ANALYZE**: Understand problem, gather context
2. **PLAN**: TodoWrite breakdown, identify tools
3. **EXECUTE**: Implement with smart tool routing  
4. **VALIDATE**: Test, verify, document

### Handoff Pattern:
- Each phase completes fully before next
- Explicit context transfer between phases
- Clear success criteria for each phase
- Rollback capability at each step

---

## 📋 PRACTICAL PATTERNS
**Copy-Paste Ready** - Proven, working examples

### Authentication:
```typescript
const { user } = useClerkUser();  // From @/shared/ClerkProvider
```

### Data Fetching:
```typescript
const { data, error, mutate } = useSWR('/api/tasks', fetcher);
```

### Supabase Operations:
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id);
```

### Modal Pattern:
```typescript
const [isOpen, setIsOpen] = useState(false);
// Use Radix Dialog primitives
```

### Form Pattern:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});
```

---

## 🚨 ARCHITECTURE GUARDRAILS
**Enforce Simplicity** - Prevent over-engineering

### NEVER CREATE:
- New service patterns (use existing Supabase calls)
- Micro-hooks (combine into existing hooks)
- Files in `/shared/` or `/refactored/` directories  
- Import chains >2 levels deep

### ALWAYS ENFORCE:
- Mobile-first PWA requirements
- TypeScript strict mode compliance
- Test coverage for all new functions
- Component reuse over duplication

---

## 📍 DOMAIN LOCATIONS
**Navigate Efficiently** - Know where things belong

**🏠 LifeLock**: `/ecosystem/internal/lifelock/`  
Daily workflows, habit tracking, time management

**📊 Admin**: `/ecosystem/internal/admin/`  
Overview dashboards, analytics, configuration

**✅ Tasks**: `/ecosystem/internal/tasks/`  
Task management, CRUD operations, organization

---

## 🎯 SUCCESS METRICS
**Measure Real Value** - Continuous validation

- **Context Efficiency**: <30% usage for configuration
- **Setup Time**: <5 minutes to understand and use
- **Feature Utilization**: >80% of included features actively used
- **Maintenance Overhead**: Near zero ongoing maintenance
- **Task Completion**: Faster development with fewer errors

---

## 🔄 CONTINUOUS IMPROVEMENT
**Evolve Based on Use** - Adapt to real needs

### Feedback Loop:
1. **Use BMAD-Lite** on real development tasks
2. **Measure Outcomes** against success metrics  
3. **Identify Gaps** where additional intelligence would help
4. **Add Only Proven Value** - no speculative features
5. **Remove Unused Components** - aggressive pruning

### Evolution Rules:
- Add features only after 3+ successful use cases
- Remove features unused for 2+ weeks
- Prioritize simplicity over completeness
- Validate every addition against overhead cost

---

*BMAD-Lite v2.0 - Practical Intelligence for Real Development*