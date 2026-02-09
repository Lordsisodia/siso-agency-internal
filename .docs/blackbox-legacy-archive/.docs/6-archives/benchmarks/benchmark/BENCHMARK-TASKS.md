# Real-World Benchmark Tasks for Blackbox3

**Tasks that actually benefit from structured multi-agent workflows**

---

## Why Email Validation Was a Bad Benchmark

- Too simple - single function, well-defined requirements
- No research needed
- No architectural decisions
- No multi-step reasoning
- Single agent sufficient
- Action Plan overhead > benefit

---

## Good Benchmark Criteria

A good benchmark task should:

1. **Require multiple steps** - Planning, research, design, implementation
2. **Need different perspectives** - PM for requirements, Architect for design, Dev for code, QA for testing
3. **Have ambiguity** - Requires clarification and iteration
4. **Benefit from documentation** - Artifacts have ongoing value
5. **Mirror real work** - Actual tasks you'd use Blackbox3 for

---

## Benchmark Tasks

### Task 1: UI Development - User Dashboard

**Complexity:** Moderate
**Time Estimate:** 2-4 hours (raw AI) vs 1-2 hours (Blackbox3)

**Prompt:**
> "Build a user dashboard with:
> - User profile card with avatar, name, email
> - Recent activity feed (last 10 actions)
> - Quick stats cards (total logins, last login, account age)
> - Settings section with form validation
> - Responsive design (mobile/desktop)
> - Loading states and error handling
> - Use React + Tailwind CSS"

**Why it's a good benchmark:**
- Multiple components to design
- UX decisions (layout, hierarchy)
- State management complexity
- Responsive design requirements
- Error handling edge cases
- PM agent can clarify requirements
- Architect can design component structure
- Dev can implement
- QA can validate interactions

**Workflow:**
```
PM (requirements) → Architect (design) → Dev (implement) → QA (test)
```

---

### Task 2: Research - Competitor Analysis

**Complexity:** Moderate
**Time Estimate:** 1-2 hours (raw AI) vs 45-90 min (Blackbox3)

**Prompt:**
> "Research and analyze the top 5 React dashboard component libraries. For each:
> - Features and capabilities
> - Pricing model
> - Community size (GitHub stars, npm downloads)
> - Documentation quality
> - Learning curve
> - Pros and cons
>
> Create a recommendation matrix with scores for:
> - Feature completeness
> - Ease of use
> - Performance
> - Customization options
> - Support for our use case (e-commerce dashboard)
>
> Provide final recommendation with rationale."

**Why it's a good benchmark:**
- Multiple data sources to check
- Synthesis required
- Decision-making framework needed
- Comparison matrix creation
- Recommendation with justification
- Analyst agent has structured research methods
- Avoids shallow "Google and summarize" approach

**Workflow:**
```
Analyst (research) → Analyst (synthesize) → Tech Writer (format)
```

---

### Task 3: Feature - Search with Filters

**Complexity:** Complex
**Time Estimate:** 4-6 hours (raw AI) vs 2-3 hours (Blackbox3)

**Prompt:**
> "Implement an advanced product search feature for an e-commerce site:
>
> **Search:**
> - Full-text search across product name, description, tags
> - Autocomplete suggestions
> - Recent searches display
>
> **Filters:**
> - Category (multi-select)
> - Price range (slider)
> - Rating (4+ stars, 3+ stars, etc.)
> - In stock only
> - On sale
> - Brand (multi-select with search)
> - Color swatches
>
> **Results:**
> - Sort by relevance, price, rating, newest
> - Grid/list view toggle
> - Load more (infinite scroll)
> - Result count
> - Selected filters display with remove option
>
> **Technical:**
> - API design for search endpoint
> - Database indexing strategy
> - Caching layer (Redis)
> - Debounce search input
> - Handle 100K+ products
>
> Use: Next.js, PostgreSQL, Redis"

**Why it's a good benchmark:**
- Full-stack feature (frontend + backend + database)
- Multiple technical decisions
- Scalability considerations
- UX complexity (filters, sorting, pagination)
- API design required
- Performance optimization needed
- Each agent brings expertise:
  - PM: Define requirements
  - Architect: Design system (API, DB, caching)
  - Dev: Implement
  - QA: Test edge cases

**Workflow:**
```
PM (requirements) → Architect (system design) → Dev (implement) → QA (test)
```

---

### Task 4: Architecture - Microservices Migration

**Complexity:** Complex
**Time Estimate:** 6-8 hours (raw AI) vs 3-4 hours (Blackbox3)

**Prompt:**
> "Design a migration plan to move a monolithic e-commerce app to microservices:
>
> **Current Monolith:**
> - User management
> - Product catalog
> - Orders and payments
> - Inventory
> - Shipping
> - Notifications (email/SMS)
>
> **Requirements:**
> - Independent deployments
> - Fault isolation
> - Technology diversity (different services can use different stacks)
> - Team autonomy (different teams own different services)
> - Maintain current functionality
> - Zero-downtime migration
>
> **Deliverables:**
> - Service decomposition strategy
> - Communication patterns (sync vs async)
> - Data management approach (distributed transactions, eventual consistency)
> - Migration phases (strangler fig pattern)
> - API gateway design
> - Observability strategy (logging, tracing, metrics)
> - Rollback plan"

**Why it's a good benchmark:**
- Complex architectural decisions
- Trade-off analysis required
- Multiple valid approaches
- Risk assessment needed
- Phased implementation plan
- Documentation heavy
- Architect agent excels here
- Multiple review cycles beneficial

**Workflow:**
```
Architect (analyze) → Architect (design) → Tech Writer (document)
```

---

### Task 5: Debug - Performance Investigation

**Complexity:** Moderate
**Time Estimate:** 2-3 hours (raw AI) vs 1-2 hours (Blackbox3)

**Prompt:**
> "Investigate and fix a performance issue:
>
> **Symptoms:**
> - Product listing page loads in 8-10 seconds
> - Database shows 50K+ queries per page load (N+1 problem suspected)
> - CPU spikes on application server
> - Memory usage increases over time (possible memory leak)
>
> **Context:**
> - Rails 7 application
> - PostgreSQL database
> - 100K products, 1M orders
> - Redis for caching (but underutilized)
> - No monitoring/profiling currently set up
>
> **Deliverables:**
> - Root cause analysis
> - Fix implementation
> - Performance improvements before/after
> - Monitoring setup to prevent future issues
> - Team runbook for common performance issues"

**Why it's a good benchmark:**
- Debugging methodology required
- Multiple potential root causes
- Systematic investigation approach
- Fix validation needed
- Preventive measures (monitoring)
- Dev + QA collaboration valuable

**Workflow:**
```
Dev (investigate) → Dev (fix) → QA (validate) → Tech Writer (document)
```

---

## Running a Benchmark

Choose one task above and run both comparisons:

```bash
# Create benchmark
./scripts/benchmark-task.sh "Build a user dashboard..." moderate

# Run WITHOUT Blackbox3 (raw AI chat)
# Time yourself, track iterations

# Run WITH Blackbox3 (action-plan.sh)
# Time yourself, track iterations

# Compare results
```

---

## Expected Results

For these meaningful tasks:

| Metric | Expected Improvement |
|--------|---------------------|
| Time | +30-50% faster |
| Iterations | +50-70% fewer |
| Quality | +40-60% better |
| Completeness | +80% more thorough |
| Documentation | +200% better |

**Why:** Structured workflows prevent:
- Scope creep
- Forgotten requirements
- Incomplete testing
- Poor architectural decisions
- Missing documentation

---

## Recommended First Benchmark

**Task 1: User Dashboard** - Best balance of:
- Complexity (multiple components)
- Tangible output (working UI)
- Clear success criteria
- Real-world relevance
- Timeboxed (~2-3 hours per run)

---

**Created:** 2026-01-13
**Purpose:** Define meaningful benchmarks that showcase Blackbox3's value
