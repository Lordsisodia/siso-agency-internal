# Agent-Skill Integration Guide

How BlackBox5 agents use and interact with the skills system.

## Overview

Skills are knowledge blocks that agents load and execute. This guide explains how to integrate skills with agents.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BLACKBOX5 ENGINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  AGENTS SYSTEM   │         │  SKILLS SYSTEM   │          │
│  │  agents/         │         │  agents/.skills/ │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ • Orchestrator   │────┐    │ • TDD            │          │
│  │ • BMAD Master    │────┤    │ • Debugging      │          │
│  │ • Amelia (Dev)   │────┼────┤ • Research       │          │
│  │ • Ralph          │────┤    │ • Planning       │          │
│  │ • Specialists    │────┘    │ • [30 more]      │          │
│  └──────────────────┘         └──────────────────┘          │
│         │                              ▲                    │
│         │      ┌───────────────────────┘                    │
│         └──────┤   AGENT LOADS SKILL                       │
│                │   AGENT EXECUTES SKILL                    │
│                └────────────────────                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## How Agents Use Skills

### 1. Automatic Skill Loading

Agents automatically load relevant skills based on context:

```yaml
# dev.agent.yaml (Amelia)
agent:
  persona:
    role: Senior Software Engineer
    principles: |
      - Follow red-green-refactor cycle  # References TDD skill
      - Test-first development
```

When Amelia is activated:
1. System detects "test-first" context
2. Automatically loads `test-driven-development/SKILL.md`
3. Amelia follows the TDD workflow from the skill

### 2. Explicit Skill References

Agents can explicitly reference skills:

```yaml
# orchstrator.agent.yaml
agent:
  critical_actions:
    - "Load skill: development-workflow/coding-assistance/test-driven-development"
    - "Execute skill workflow: RED-GREEN-REFACTOR"
```

### 3. Skill-Driven Workflows

Skills can define entire workflows that agents follow:

```xml
<skill name="test-driven-development">
  <workflow>
    <phase name="RED">Write failing test</phase>
    <phase name="GREEN">Make test pass</phase>
    <phase name="REFACTOR">Improve code</phase>
  </workflow>
</skill>
```

Agent executes each phase in sequence.

## Integration Patterns

### Pattern 1: Agent Principles Reference Skills

```yaml
agent:
  persona:
    principles: |
      - Follow TDD cycle (skill: test-driven-development)
      - Use systematic debugging (skill: systematic-debugging)
      - Think from first principles (skill: first-principles-thinking)
```

### Pattern 2: Agent Menu Triggers Skills

```yaml
agent:
  menu:
    - trigger: "TDD or test-driven"
      action: "load skill: test-driven-development"
      description: "[TDD] Apply Test-Driven Development"
```

### Pattern 3: Agent Spawns Sub-Agents with Skills

```yaml
agent:
  critical_actions:
    - "Spawn sub-agent with skill: deep-research"
    - "Sub-agent follows research workflow from skill"
```

## Skill-Agent Mapping

### BMAD Agents

| Agent | Skills Used | Purpose |
|-------|-------------|---------|
| **BMAD Master** | intelligent-routing | Route to appropriate workflows |
| **Mary (Analyst)** | deep-research, first-principles-thinking | Market research, requirements |
| **Winston (Architect)** | writing-plans, system-design | Architecture, tech stack |
| **Arthur/Amelia (Dev)** | test-driven-development, systematic-debugging | Implementation, testing |
| **John (PM)** | writing-plans, intelligent-routing | Requirements, prioritization |
| **TEA** | deep-research | Technical research, PoCs |

### Research Agents

| Agent | Skills Used | Purpose |
|-------|-------------|---------|
| **Deep Research** | deep-research, first-principles-thinking | In-depth research |
| **Feature Research** | deep-research, competitive-analysis | Feature exploration |
| **OSS Discovery** | deep-research, market-research | Open source research |

### Specialist Agents

| Agent | Skills Used | Purpose |
|-------|-------------|---------|
| **Ralph** | systematic-debugging, first-principles-thinking | Autonomous building |
| **Orchestrator** | intelligent-routing, subagent-driven-development | Agent coordination |
| **UI Cycle Agent** | ui-cycle, test-driven-development | UI development |

## Creating Agent-Skill Integration

### Step 1: Identify Agent Needs

What does the agent need to know?
- What workflows should it follow?
- What methodologies should it use?
- What are its constraints and principles?

### Step 2: Map to Skills

Find or create skills that match:
```yaml
agent:
  persona:
    principles: |
      - Follow TDD (skill: test-driven-development)
      - Debug systematically (skill: systematic-debugging)
      - Plan first (skill: writing-plans)
```

### Step 3: Reference Skills in Agent Definition

```yaml
agent:
  metadata:
    id: "agents/my-agent"

  persona:
    role: "Specialist Agent"
    principles: |
      - Load skill: category/skill-name
      - Follow skill workflow strictly

  critical_actions:
    - "When [context], load skill: skill-name"
    - "Execute skill workflow phases in order"
```

### Step 4: Test Integration

1. Activate the agent
2. Provide trigger context
3. Verify skill loads correctly
4. Check agent follows skill workflow
5. Validate output matches skill format

## XML Tags in Agent Definitions

Agents can also use XML tags for clarity:

```yaml
agent:
  persona:
    role: Developer Agent

    <skills_required>
    - test-driven-development
    - systematic-debugging
    - refactoring
    </skills_required>

    <skill_integration>
    When test-first context detected:
    1. Load TDD skill
    2. Follow RED-GREEN-REFACTOR workflow
    3. Use skill's <rules> for constraints
    4. Output matches skill's <output_format>
    </skill_integration>
```

## Dynamic Skill Loading

Agents can dynamically load skills based on context:

```yaml
agent:
  critical_actions:
    - "Detect context keywords: [test, tdd, testing]"
    - "Load matching skill: test-driven-development"
    - "Extract skill <workflow>"
    - "Execute workflow phases"
    - "Report using skill <output_format>"
```

## Skill Versioning

Agents should specify skill versions:

```yaml
agent:
  dependencies:
    skills:
      - name: test-driven-development
        version: ">= 1.0.0"
        required: true
      - name: systematic-debugging
        version: ">= 1.0.0"
        required: false
```

## Best Practices

1. **Explicit is better than implicit** - Clearly state which skills an agent uses
2. **One skill per concern** - Don't have overlapping skills
3. **Version your skills** - Track skill versions in agent dependencies
4. **Test integrations** - Verify agents follow skill workflows correctly
5. **Document the flow** - Explain how agent uses skill in agent definition
6. **Fallback gracefully** - What happens if a skill isn't available?

## Example: Complete Agent-Skill Integration

```yaml
# agents/implementation-executor/agent.yaml
agent:
  metadata:
    id: "agents/implementation-executor"
    name: "Implementation Executor"
    version: "1.0.0"

  dependencies:
    skills:
      - name: test-driven-development
        version: "1.0.0"
        required: true
      - name: systematic-debugging
        version: "1.0.0"
        required: false

  persona:
    role: "Senior Implementation Engineer"
    principles: |
      - Always use TDD for new features (skill: test-driven-development)
      - Debug systematically when tests fail (skill: systematic-debugging)
      - Follow skill workflows strictly
      - Output matches skill specifications

  critical_actions:
    - "Detect development context"
    - "Load appropriate skill from skills registry"
    - "Extract skill <workflow> and <rules>"
    - "Execute workflow phases in sequence"
    - "Handle errors using skill <error_handling>"
    - "Format output using skill <output_format>"

  menu:
    - trigger: "Implement with TDD"
      skill: "test-driven-development"
      description: "[TDD] Implement using Test-Driven Development"
```

## Troubleshooting

### Skill Not Loading

**Problem**: Agent doesn't load the skill
**Solution**:
- Check skill path in registry
- Verify skill category matches agent reference
- Ensure skill YAML frontmatter is valid

### Agent Not Following Workflow

**Problem**: Agent loads skill but doesn't follow workflow
**Solution**:
- Check skill has `<workflow>` tags with `<phase>` children
- Verify agent principles reference skill workflow
- Add explicit instruction: "Follow skill workflow strictly"

### Output Format Mismatch

**Problem**: Agent output doesn't match skill format
**Solution**:
- Check skill has `<output_format>` section
- Add explicit instruction: "Use skill output format"
- Verify agent critical_actions mention output format

---

**Last Updated**: 2025-01-18
**Status**: ✅ Active
