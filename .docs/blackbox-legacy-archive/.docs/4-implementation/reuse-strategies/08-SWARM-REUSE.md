# 08 - Swarm Reuse Strategy

**Status:** ✅ Ready to Copy (PATTERNS AS DOCS)
**Source:** `Blackbox Implementation Plan/Evaluations/06-SWARM.md`
**Destination:** `blackbox4/patterns/swarm/`

**Action:** Copy Swarm patterns as documentation, not code.

---

## 📦 What You're Getting (Patterns, Not Code)

Swarm is deprecated and lightweight (minimal primitives). Blackbox4 needs only its **patterns**, not the implementation.

### Why Not Copy Swarm Code?

| Reason | Swarm | Blackbox4 Approach |
|--------|--------|-------------------|
| **Status** | Deprecated | Use patterns only |
| **Implementation** | Minimal primitives | You have full Blackbox3 agents |
| **Philosophy** | Build everything | Use proven agents + workflows |
| **Fit** | Too lightweight | You have BMAD + Omo agents |
| **Integration** | Not needed | Patterns guide, don't replace |

**Decision:** Use only Swarm's **patterns** as documentation, not code.

---

## 📋 Patterns to Document

### A. Context Variable Pattern (Multi-Tenant)

**Purpose:** Clean tenant context injection for multi-tenant scenarios

**Pattern Description:**

Instead of hardcoding tenant IDs throughout the code, use a context variable system that injects tenant context into agent prompts.

**Key Benefits:**
- Single source of truth for tenant context
- Easy to change tenant at runtime
- Prevents tenant data leaks
- Clean separation of concerns

**Implementation in Blackbox4:**

```bash
# Context variable system in Blackbox4
# Located: .opencode/context-variables.json

# Define context variables
{
  "tenant": {
    "id": "tenant_123",
    "name": "Acme Corp",
    "config": {
      "max_users": 1000,
      "features": ["feature_a", "feature_b"]
    }
  },
  "user": {
    "id": "user_456",
    "email": "user@acme.com",
    "role": "admin"
  },
  "project": {
    "id": "project_789",
    "name": "Q1 Dashboard",
    "deadline": "2024-03-31"
  }
}
```

**Usage in Agent Prompts:**

```markdown
# Agent prompt with context variables

You are an AI assistant working on project.

## Current Context

**Tenant:** {{tenant.name}} (ID: {{tenant.id}})
**User:** {{user.email}} (Role: {{user.role}})
**Project:** {{project.name}} (Deadline: {{project.deadline}})

## Tenant Configuration
- Max users: {{tenant.config.max_users}}
- Enabled features: {{tenant.config.features}}

## Task
[Your task here]
```

**How to Inject Context:**

```bash
# Use Blackbox4 context manager to inject variables
cd blackbox4

# Load agent with context
# "Read: agents/_core/context-injector.agent.yaml
# Load: agent with tenant context variables"

# Context is automatically injected from .opencode/context-variables.json
```

---

### B. Validation Agent Pattern

**Purpose:** Separate validation from creation, reusable across projects

**Pattern Description:**

Instead of baking validation into each agent, create dedicated validation agents that can be reused. This ensures consistent validation logic and makes updates easier.

**Key Benefits:**
- Single source of truth for validation
- Easy to update validation logic
- Reusable across projects
- Clear separation of concerns

**Implementation in Blackbox4:**

**Option 1: Use Existing Custom Validators**

Blackbox3 already has these validators in `agents/custom/`:

| Validator | Purpose | Status |
|-----------|---------|--------|
| `vendor-swap-validator.agent.yaml` | Vendor swap compliance | ✅ Exists |
| `multi-tenant-validator.agent.yaml` | Multi-tenant patterns | ✅ Exists |
| `architecture-validator.agent.yaml` | Architecture review | ✅ Exists |

**Usage:**

```bash
# Load validation agent
cd blackbox4

# Validate vendor swap compliance
# "Read: agents/custom/vendor-swap-validator.agent.yaml
# Validate: This code for vendor swap compliance"

# Validate multi-tenant patterns
# "Read: agents/custom/multi-tenant-validator.agent.yaml
# Validate: This architecture for multi-tenant compliance"

# Validate architecture
# "Read: agents/custom/architecture-validator.agent.yaml
# Validate: This system architecture"
```

**Option 2: Create New Validation Agent**

**File:** `blackbox4/agents/custom/validation-agent.agent.yaml`

```yaml
agent:
  metadata:
    name: "Generic Validation Agent"
    version: "1.0"
    purpose: "Reusable validation agent for custom checks"
  
  persona: |
    You are a validation specialist. Your job is to validate
    code against specific criteria and provide clear feedback.
    
    When validating:
    1. Check each criterion listed
    2. Provide specific evidence for each
    3. Suggest improvements if criteria not met
    4. Be constructive and specific
    
  validation_criteria:
    # Load from checklists or provided in context
    
  functions:
    - validate_code: "Validate code against criteria"
    - generate_report: "Generate validation report"
```

---

### C. Handoff Pattern

**Purpose:** Seamless conversation transfer between agents

**Pattern Description:**

Instead of forcing users to manually copy context between agents, use a handoff pattern where functions return Agents and conversation transfers seamlessly.

**Key Benefits:**
- Smooth agent transitions
- No manual context copying
- Better user experience
- Preserves conversation history

**Implementation in Blackbox4:**

**Option 1: Use Existing Handoff System**

Blackbox3 already has handoff system in `.memory/handoffs/`:

```bash
# Check existing handoff system
ls -lh "Blackbox3/.memory/handoffs/"
```

**Usage:**

```bash
cd blackbox4

# Use agent handoff
# "After completing research, handoff to development agent:
# Read: agents/bmad/mary.agent.yaml
# Perform: competitive analysis
# 
# Handoff to:
# Read: agents/bmad/john.agent.yaml
# Continue with: PRD creation based on research"

# Blackbox4's handoff system preserves:
# - Previous agent's outputs
# - Decision context
# - Next steps
```

**Option 2: Create Handoff Template**

**File:** `blackbox4/patterns/swarm/handoff-template.md`

```markdown
# Agent Handoff Template

## From Agent: [Agent Name]

### Summary
[What was accomplished in this session?]

### Decisions Made
- [Decision 1]: [Rationale]
- [Decision 2]: [Rationale]

### Outputs Generated
- [Artifact 1]: [Location]
- [Artifact 2]: [Location]
- [Artifact 3]: [Location]

### Next Steps
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

### Context to Preserve
- [Important context item 1]
- [Important context item 2]
- [Important context item 3]

---

## To Agent: [Agent Name]

### Handoff Accepted
[Agent acknowledges handoff and confirms next steps]

### Context Review
[Agent reviews context and confirms understanding]

### Next Actions
1. [Action 1]
2. [Action 2]
3. [Action 3]
```

---

## 🚀 Copy Command

```bash
# 1. Create patterns directory
mkdir -p blackbox4/patterns/swarm

# 2. Create pattern documentation
cat > blackbox4/patterns/swarm/01-context-variable-pattern.md << 'EOF'
[Copy Context Variable Pattern section from above]
EOF

cat > blackbox4/patterns/swarm/02-validation-agent-pattern.md << 'EOF'
[Copy Validation Agent Pattern section from above]
EOF

cat > blackbox4/patterns/swarm/03-handoff-pattern.md << 'EOF'
[Copy Handoff Pattern section from above]
EOF

# 3. Copy Swarm evaluation as reference
cp "Blackbox Implementation Plan/Evaluations/06-SWARM.md" \
   blackbox4/docs/frameworks/swarm-reference.md
```

---

## 🎯 Usage Examples

### Use Context Variable Pattern

```bash
cd blackbox4/agents/.plans/multi-tenant-project

# 1. Set tenant context
cat > .opencode/context-variables.json << 'EOF'
{
  "tenant": {
    "id": "tenant_123",
    "name": "Acme Corp",
    "config": {
      "max_users": 1000,
      "features": ["feature_a", "feature_b"]
    }
  }
}
EOF

# 2. Work with AI (context is auto-injected)
# "Read: agents/bmad/winston.agent.yaml
# Design multi-tenant architecture for Acme Corp with 1000 users max"
# AI automatically knows tenant context from variables
```

### Use Validation Agent Pattern

```bash
cd blackbox4/agents/.plans/my-project

# Option 1: Use existing vendor swap validator
# "Read: agents/custom/vendor-swap-validator.agent.yaml
# Validate: This code adheres to vendor swap principles"

# Option 2: Use existing multi-tenant validator
# "Read: agents/custom/multi-tenant-validator.agent.yaml
# Validate: This architecture supports multi-tenancy correctly"

# Option 3: Create custom validation
# Create custom checklist:
cat > validation-checklist.md << 'EOF'
# Custom Validation Checklist

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Criteria
- [ ] Criterion 1
- [ ] Criterion 2
EOF

# "Read: agents/custom/validation-agent.agent.yaml
# Validate: This code against validation-checklist.md"
```

### Use Handoff Pattern

```bash
cd blackbox4/agents/.plans/my-project

# 1. Complete Phase 1 (Analysis) with Mary agent
# "Read: agents/bmad/mary.agent.yaml"
# Perform: Market research and competitive analysis"

# 2. Use handoff template to document
cp patterns/swarm/03-handoff-pattern.md .handoff-analysis.md

# 3. Fill in handoff with AI
# "Read: .handoff-analysis.md
# Fill in summary, decisions, outputs, next steps"

# 4. Continue with Phase 2 (Planning) with John agent
# "Read: .handoff-analysis.md
# Acknowledge handoff and review context"
# "Read: agents/bmad/john.agent.yaml"
# Continue: Create PRD based on Mary's research"
```

---

## ✅ What You Get After This Section

1. ✅ **3 Pattern Documents** - Context variables, validation agent, handoff
2. ✅ **Reference Documentation** - Swarm evaluation for reference
3. ✅ **Usage Examples** - How to use patterns in Blackbox4
4. ✅ **Integration Guide** - How patterns fit with existing Blackbox4 components

**Total New Code:** 0 lines
**Total Code Reused:** Patterns from Swarm documentation
**Implementation:** As documentation only, not code

---

## 📊 Integration Summary

| Component | Source | Size | Action | Status |
|-----------|--------|------|--------|--------|
| **Context Variable Pattern** | Swarm | Pattern doc | Copy | ✅ Ready |
| **Validation Agent Pattern** | Swarm | Pattern doc | Copy | ✅ Ready |
| **Handoff Pattern** | Swarm | Pattern doc | Copy | ✅ Ready |
| **Swarm Evaluation** | Implementation Plan | Doc | Copy as ref | ✅ Ready |
| **Usage Examples** | This doc | Examples | New | ✅ Ready |

**Reuse Ratio:** 100% patterns from Swarm
**Implementation:** Documentation only, no code

---

## ✅ Success Criteria

After completing this section:

1. ✅ `patterns/swarm/01-context-variable-pattern.md` exists with full documentation
2. ✅ `patterns/swarm/02-validation-agent-pattern.md` exists with full documentation
3. ✅ `patterns/swarm/03-handoff-pattern.md` exists with full documentation
4. ✅ All patterns are well-documented with examples
5. ✅ Integration with existing Blackbox4 components is documented
6. ✅ Reference documentation is available

---

## 🎯 Next Step

**Go to:** `09-FINAL-STRUCTURE.md`

**See the resulting Blackbox4 directory structure and get started.**
