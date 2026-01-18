# Intelligent Routing Skill

**Purpose:** Enable AI to make intelligent decisions about where to place new things and how to find existing things in Blackbox4.

**Last Updated:** 2026-01-15

---

## Trigger

**Use this skill when:**
- Creating a new agent, skill, library, or other component
- Need to determine where something should go
- Trying to find something in Blackbox4
- Unclear about correct location for a file/directory

---

## Outputs

**Artifacts Created:**
- Placement recommendation (where to put new thing)
- Discovery result (where to find existing thing)
- Rationale explanation (why this location)
- Related references (what else is related)

---

## Key Requirements

The skill must:
1. Identify the type of thing being placed/found
2. Apply the Type Routing Table from SEMANTIC-INDEX.md
3. Use Specific Rules from PLACEMENT-RULES.md
4. Validate against Core Principles
5. Provide clear rationale
6. Suggest related items

---

## Step-by-Step Framework

### Phase 1: Identify (What is it?)

**[ ] Determine the type**

Ask: "What is this thing?"

**Type Identification Questions:**

- Is it an **Agent**? (AI entity with its own prompt/behavior)
- Is it a **Skill**? (Reusable workflow/framework)
- Is it a **Plan**? (Project with tasks/checklist)
- Is it a **Library**? (Reusable code)
- Is it a **Script**? (Executable code)
- Is it a **Template**? (Reusable pattern)
- Is it a **Document**? (Documentation/explanation)
- Is it a **Test**? (Test code)
- Is it a **Config**? (Configuration/settings)
- Is it a **Memory**? (Working knowledge)
- Is it a **Runtime**? (Execution state)
- Is it a **Module**? (Functional unit with agents)
- Is it a **Framework**? (Framework pattern)
- Is it a **Tool**? (Maintenance/utility)
- Is it a **Workspace**? (Active work area)
- Is it an **Example**? (Demonstration)

**[ ] Resolve ambiguous types**

If unclear, use these clarifying questions:

- Agent vs Skill:
  - Agent = Standalone AI entity
  - Skill = Reusable workflow for agents

- Library vs Module:
  - Library = Reusable code
  - Module = Functional unit with own agents

- Script vs Tool:
  - Script = Execution/workflow
  - Tool = Maintenance/utility

- Template vs Example:
  - Template = Reusable pattern
  - Example = Usage demonstration

**[ ] Document the type**

Write down: "This is a [TYPE]"

---

### Phase 2: Route (Where does it go?)

**[ ] Apply Type Routing Table**

Use SEMANTIC-INDEX.md Type Routing Table:

| Type | Primary Location |
|------|-------------------|
| Agent | `1-agents/` |
| Skill | `1-agents/.skills/` |
| Plan | `.plans/` |
| Library | `4-scripts/lib/` |
| Script | `4-scripts/` |
| Template | `5-templates/` |
| Document | `.docs/` |
| Test | `8-testing/` |
| Config | `.config/` |
| Memory | `.memory/` |
| Runtime | `.runtime/` |
| Module | `3-modules/` |
| Framework | `2-frameworks/` |
| Tool | `6-tools/` |
| Workspace | `7-workspace/` |
| Example | `1-agents/*-examples/` |

**[ ] Apply specific rules**

Use PLACEMENT-RULES.md Specific Rules by Type:

**For Agents:**
- What type of agent?
  - Core → `1-agents/1-core/`
  - BMAD → `1-agents/2-bmad/`
  - Research → `1-agents/3-research/`
  - Specialist → `1-agents/4-specialists/`
  - Enhanced → `1-agents/5-enhanced/`

**For Skills:**
- What type of skill?
  - Core → `.skills/1-core/`
  - MCP → `.skills/2-mcp/`
  - Workflow → `.skills/3-workflow/`

**For Libraries:**
- Which phase?
  - Phase 1 → `context-variables/`
  - Phase 2 → `hierarchical-tasks/` or `task-breakdown/`
  - Phase 3 → `spec-creation/`
  - Phase 4 → `ralph-runtime/`, `circuit-breaker/`, `response-analyzer/`
  - Other → `4-scripts/lib/[name]/`

**For Documents:**
- What type of doc?
  - Tutorial → `.docs/1-getting-started/`
  - Architecture → `.docs/2-architecture/`
  - Component → `.docs/3-components/`
  - Framework → `.docs/4-frameworks/`
  - Workflow → `.docs/5-workflows/`
  - Phase-specific → `.docs/phase[1-4]/`

**[ ] Determine exact path**

Format: `[primary-location]/[specific-path]/[filename]`

Example: `1-agents/4-specialists/my-agent.md`

---

### Phase 3: Validate (Is this correct?)

**[ ] Apply Core Principles**

**Principle 1: Type Consistency**
- Does this match where other things of this type go?
- ✅ Yes → Continue
- ❌ No → Reconsider location

**Principle 2: Co-location**
- Is it near related things?
- ✅ Yes → Continue
- ❌ No → Consider moving near related items

**Principle 3: Number Alignment**
- Does the number prefix match the layer?
  - 1-* = Intelligence/agents
  - 4-* = Execution/scripts
  - 8-* = Testing/validation
- ✅ Yes → Continue
- ❌ No → Reconsider

**Principle 4: Hidden vs Visible**
- Should this be hidden (system) or visible (user-facing)?
- ✅ Correct → Continue
- ❌ No → Move to hidden or visible

**Principle 5: Single Source of Truth**
- Does this already exist elsewhere?
- ✅ No → Continue
- ❌ Yes → Use existing, don't duplicate

**[ ] Resolve conflicts**

If multiple locations seem valid:

1. **Primary Purpose** - What is the MAIN purpose?
2. **Primary User** - Who primarily uses it?
3. **Primary Usage** - Where is it primarily used?
4. **Most Specific** - Use most specific category

---

### Phase 4: Complete (Finish and document)

**[ ] Finalize location**

Write down: "Place at: [FULL-PATH]"

**[ ] Create structure if needed**

If creating new directory:
- Add `.purpose.md` explaining directory purpose
- Follow structure patterns from existing directories

**[ ] Document related items**

What else is related?
- Tests in `8-testing/`
- Documentation in `.docs/`
- Examples in `*-examples/`

**[ ] Update references**

What needs to know about this?
- Update `DISCOVERY-INDEX.md` if major new thing
- Update category READMEs
- Add cross-references

**[ ] Provide rationale**

Explain WHY this location:
- Type-based routing
- Specific rule application
- Core principle validation
- Co-location benefits

---

## Discovery Mode (Finding Things)

### When Finding, Not Placing

**[ ] Identify what you're finding**

What type of thing? (Use Phase 1 identification)

**[ ] Use Discovery Protocol**

1. Check DISCOVERY-INDEX.md Quick Answers
2. Check SEMANTIC-INDEX.md for type location
3. Use search patterns
4. Check related locations

**[ ] Search commands**

By type:
```bash
# Agents
find 1-agents/ -name "*.md"

# Libraries
find 4-scripts/lib/ -maxdepth 1 -type d

# Scripts
find 4-scripts/ -name "*.sh" -o -name "*.py"

# Documentation
find .docs/ -name "*.md"
```

**[ ] Fallback**

If not found:
- Check related locations
- Check `.docs/` for documentation
- Check `.memory/` for working knowledge
- Use broader search patterns

---

## Output Templates

### Template 1: Placement Recommendation

```markdown
# Placement Recommendation

**Item:** [description of item]
**Type:** [agent/skill/library/etc]
**Recommended Location:** `[full-path]`

## Rationale

1. **Type Identification:** This is a [TYPE] because [reasoning]
2. **Type Routing:** [TYPE] items go in [primary-location]
3. **Specific Rules:** [specific rule applied]
4. **Validation:** Passes all core principles

## Related Items

- Tests: `[test-location]`
- Documentation: `[doc-location]`
- Examples: `[example-location]`

## Next Steps

1. Create at: `[full-path]`
2. Add `.purpose.md` if new directory
3. Create related items (tests, docs, examples)
4. Update references in `DISCOVERY-INDEX.md`
```

### Template 2: Discovery Result

```markdown
# Discovery Result

**Looking for:** [description]
**Type:** [agent/skill/library/etc]
**Found at:** `[full-path]`

## Search Process

1. **Type Identification:** Identified as [TYPE]
2. **Primary Location:** Checked [primary-location]
3. **Search Pattern:** Used `[search-pattern]`
4. **Result:** Found at `[full-path]`

## Related Items

- Documentation: `[doc-location]`
- Tests: `[test-location]`
- Examples: `[example-location]`
```

### Template 3: Conflict Resolution

```markdown
# Placement Conflict Resolution

**Item:** [description]
**Ambiguity:** Multiple valid locations

## Options

**Option 1:** `[location-1]`
- Rationale: [reasoning]
- Pros: [advantages]
- Cons: [disadvantages]

**Option 2:** `[location-2]`
- Rationale: [reasoning]
- Pros: [advantages]
- Cons: [disadvantages]

## Resolution

**Recommended:** `[best-location]`

**Reasoning:**
- Primary purpose: [purpose]
- Primary user: [user]
- Primary usage: [usage]
- Most specific: [category]
```

---

## Examples

### Example 1: New Specialist Agent

**Input:** "I need to create a new specialist agent for data analysis"

**Process:**
1. Type: Agent
2. Agent type: Specialist
3. Location: `1-agents/4-specialists/`
4. Specific: `1-agents/4-specialists/data-analyst.md`
5. Examples: `1-agents/4-specialists/data-analyst-examples/`

**Output:**
```
Place at: 1-agents/4-specialists/data-analyst.md
Create examples at: 1-agents/4-specialists/data-analyst-examples/
```

### Example 2: New Phase 2 Library

**Input:** "I need to create a library for task prioritization"

**Process:**
1. Type: Library
2. Phase: Phase 2 (task-related)
3. Location: `4-scripts/lib/`
4. Specific: `4-scripts/lib/task-prioritization/`
5. Tests: `8-testing/unit/libraries/test-task-prioritization.py`

**Output:**
```
Place at: 4-scripts/lib/task-prioritization/
Create tests at: 8-testing/unit/libraries/test-task-prioritization.py
Update docs: .docs/phase2/
```

### Example 3: Finding All Agents

**Input:** "Where are all the BMAD agents?"

**Process:**
1. Type: Agent
2. Agent type: BMAD
3. Location: `1-agents/2-bmad/`
4. Search: `find 1-agents/2-bmad/ -name "*.md"`

**Output:**
```
Found at: 1-agents/2-bmad/
Search: find 1-agents/2-bmad/ -name "*.md"
```

---

## Quality Bar

### Minimum Acceptable

✅ Correct type identification
✅ Valid location from Type Routing Table
✅ Specific rules applied
✅ Core principles validated
✅ Clear rationale provided

### Excellent Quality

✅ All minimum criteria met
✅ Considers edge cases
✅ Identifies related items
✅ Suggests documentation/tests
✅ Provides search commands for discovery
✅ Considers maintenance and evolution

### Anti-Patterns

❌ Don't guess type - use identification questions
❌ Don't skip validation - always check principles
❌ Don't ignore conflicts - resolve them explicitly
❌ Don't forget related items - tests, docs, examples
❌ Don't place randomly - use framework

---

## Integration with Other Skills

This skill integrates with:

- **docs-routing.md** - For routing documentation
- **deep-research.md** - For researching before placement
- **first-principles-thinking.md** - For analyzing placement decisions

**Usage:**
```
"Use intelligent-routing to determine where to place this new agent"
"Use intelligent-routing to find all libraries related to Phase 2"
"Apply intelligent-routing to determine where this documentation should go"
```

---

## Reference Documentation

This skill is based on:

- **BRAIN-ARCHITECTURE.md** - Overall brain architecture
- **SEMANTIC-INDEX.md** - Type system and categories
- **PLACEMENT-RULES.md** - Detailed placement rules
- **DISCOVERY-INDEX.md** - Quick reference for finding

Always consult these documents when making routing decisions.

---

**Status:** Complete
**Version:** 1.0.0
**Last Updated:** 2026-01-15
**Maintainer:** Blackbox4 Core Team
