# SISO Internal - Intelligent Development Assistant

## 🎯 Core Context (Always Active)
**Stack**: React + TypeScript + Vite + Supabase + Tailwind + PWA  
**Commands**: `npm run dev` | `npm run build` | `npm run typecheck`  
**Rules**: Mobile-first | Auto-test | Copy existing patterns | NO abstractions

## ⚡ Quick Actions
<details><summary>Emergency Fixes</summary>

- **Broken import**: Check file location → Copy working pattern
- **Mobile issue**: Test mobile view → Apply PWA standards  
- **Claude Code breaks something**: `git restore <files>`
- **Component not working**: Copy from `/src/components/[working-example]`
</details>

<details><summary>Development Shortcuts</summary>

- **Add feature**: Use existing pattern in `/src/ecosystem/internal/[domain]`
- **Database operation**: Copy from `/src/services/database/[working-patterns]`
- **Fix styling**: Follow Tailwind + shadcn/ui patterns
- **State management**: Use existing hook patterns
</details>

## 🧠 Intelligence Systems (Progressive)
<details><summary>For Complex Features → Use BMAD</summary>

**Trigger**: Multi-component features, architecture changes, >1 week tasks  
**Command**: `*agent analyst` → `*agent pm` → `*agent architect` → `*agent dev`  
**Context**: All implementation context embedded in stories  
**Safety**: Zero information loss, full rollback capability
</details>

<details><summary>SuperClaude Integration</summary>

**MCP Tools**: Context7 (docs), Sequential (reasoning), Magic (UI), Supabase (DB)  
**Token Optimization**: 70% reduction pipeline active  
**Evidence Requirement**: AI must provide proof for all suggestions  
**Smart Routing**: Auto-select optimal Claude variant per task
</details>

<details><summary>Architecture Guardrails</summary>

**NEVER CREATE**:  
- New service patterns (use existing Supabase calls)
- Micro-hooks (combine into existing hooks)  
- Files in `/shared/` or `/refactored/` directories
- Import chains >2 levels deep

**ALWAYS ENFORCE**:
- Mobile-first PWA requirements
- TypeScript strict mode compliance
- Test coverage for all new functions
- Component reuse over duplication

**📋 Full Guidelines**: [`.bmad-core/architectural-warnings/`](.bmad-core/architectural-warnings/)
</details>

---

## 📋 Pattern Library (Copy These!)
<details><summary>Working Code Examples</summary>

```typescript
// Authentication Pattern
const { user } = useClerkUser();  // From @/shared/ClerkProvider

// Data Fetching Pattern  
const { data, error, mutate } = useSWR('/api/tasks', fetcher);

// Modal Pattern
const [isOpen, setIsOpen] = useState(false);
// Use Radix Dialog primitives

// Form Pattern
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});

// Supabase Pattern
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id);
```
</details>

<details><summary>Domain Locations</summary>

**🏠 LifeLock**: `/ecosystem/internal/lifelock/`  
Daily workflows, habit tracking, time management

**📊 Admin**: `/ecosystem/internal/admin/`  
Overview dashboards, analytics, configuration  

**✅ Tasks**: `/ecosystem/internal/tasks/`  
Task management, CRUD operations, organization
</details>

## 🎯 Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase + PostgreSQL  
- **Styling**: Tailwind CSS + shadcn/ui
- **Components**: Radix UI primitives
- **Forms**: React Hook Form + Zod validation

## 🔄 Development Rules
- **TypeScript**: Strict mode - NO `any` types
- **Testing**: ALWAYS write tests first
- **Mobile**: PWA requirements mandatory
- **Security**: Zod validation for all inputs
- **Patterns**: Copy existing, don't create new

---

*Research-optimized structure for maximum developer productivity and minimal cognitive load*