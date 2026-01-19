# Core Agent Frameworks

**Status:** ✅ Active (Integrated in BlackBox5)
**Count:** 4 Frameworks
**Location:** `.blackbox5/engine/frameworks/`

---

## Overview

These are the **primary frameworks** actively integrated into BlackBox5. They form the foundation of agent orchestration and coordination.

---

## 1. BMAD (BlackBox Multi-Agent Development)

**Type:** Multi-Agent Orchestration
**Status:** ✅ Active (Primary Framework)
**Priority:** ⭐⭐⭐⭐⭐

### Purpose
Primary framework for coordinating specialized agents through a master-agent architecture.

### Key Components
- **BMAD Master** - Central orchestrator
- **Analyst Module** - Research & analysis
- **Architect Module** - System design
- **Developer Module** - Code implementation
- **PM Module** - Project management

### Key Features
- Master-agent coordination pattern
- Role-based agent specialization
- Workflow-based collaboration
- Task distribution & aggregation

### Code Location
```
.blackbox5/engine/frameworks/1-bmad/
├── core/
│   ├── bmad-master.agent.yaml
│   └── ...
├── modules/
│   ├── analyst.agent.yaml
│   ├── architect.agent.yaml
│   ├── dev.agent.yaml
│   └── pm.agent.yaml
└── workflows/
    └── ...
```

### Documentation
- **Analysis:** `BMAD-ANALYSIS.md`
- **Method:** `bmad-code-org-BMAD-METHOD-ANALYSIS.md`
- **Workflows:** `workflows/README.md`
- **Agents:** `agents/README.md`

### Usage
BMAD is the default orchestration framework for complex multi-agent tasks requiring specialized roles.

---

## 2. SpecKit

**Type:** Spec-Driven Development
**Status:** ✅ Active
**Priority:** ⭐⭐⭐⭐

### Purpose
Specification-driven development with templates and slash commands for consistency.

### Key Components
- **Slash Commands** - Quick CLI actions
- **Template System** - Consistent output formats
- **Spec-First Workflow** - Specification before implementation

### Key Features
- Command-line interface
- Template-based generation
- Spec-driven development
- Rapid prototyping

### Code Location
```
.blackbox5/engine/frameworks/2-speckit/
├── slash-commands/
│   └── README.md
├── templates/
│   └── README.md
└── README.md
```

### Documentation
- **Overview:** `README.md`
- **Commands:** `slash-commands/README.md`
- **Templates:** `templates/README.md`

### Usage
Use SpecKit when you need consistent, specification-driven development with quick CLI access.

---

## 3. MetaGPT

**Type:** Multi-Agent with SOPs
**Status:** ✅ Active
**Priority:** ⭐⭐⭐⭐

### Purpose
Standard Operating Procedures (SOPs) for consistent agent workflows and outputs.

### Key Components
- **SOP System** - Standardized procedures
- **Role-Based Agents** - Specific responsibilities
- **Consistent Outputs** - Predictable formats

### Key Features
- SOP-based coordination
- Role-based interactions
- Consistent formatting
- Repeatable workflows

### Code Location
```
.blackbox5/engine/frameworks/3-metagpt/
├── templates/
│   └── README.md
└── README.md
```

### Documentation
- **Overview:** `README.md`
- **GitHub Analysis:** `METAGPT-GITHUB-ANALYSIS.md`
- **Foundation Agents:** `FoundationAgents-MetaGPT-ANALYSIS.md`

### Usage
Use MetaGPT when you need consistent, standardized workflows with predictable outputs.

---

## 4. Swarm (OpenAI)

**Type:** Lightweight Orchestration
**Status:** ✅ Active
**Priority:** ⭐⭐⭐⭐

### Purpose
Lightweight multi-agent coordination with emergent behavior through conversational handoffs.

### Key Components
- **Conversational Interface** - Natural agent handoffs
- **Emergent Behavior** - Self-organizing coordination
- **Lightweight** - Minimal overhead

### Key Features
- Simple conversational API
- Agent handoffs
- Emergent coordination
- Easy integration

### Code Location
```
.blackbox5/engine/frameworks/4-swarm/
├── examples/
│   └── README.md
├── patterns/
│   └── README.md
└── README.md
```

### Documentation
- **Overview:** `README.md`
- **Examples:** `examples/README.md`
- **Patterns:** `patterns/README.md`
- **Analysis:** `openai-swarm-ANALYSIS.md`

### Usage
Use Swarm for lightweight multi-agent scenarios requiring simple coordination patterns.

---

## Framework Comparison

| Feature | BMAD | SpecKit | MetaGPT | Swarm |
|---------|------|---------|---------|-------|
| **Orchestration** | Master-Agent | Spec-Driven | SOP-Based | Conversational |
| **Complexity** | High | Medium | Medium | Low |
| **Specialization** | Role-Based | Template-Based | Procedure-Based | Emergent |
| **Use Case** | Complex Tasks | Consistent Output | Standardized Workflows | Simple Coordination |
| **Learning Curve** | Steep | Moderate | Moderate | Gentle |

---

## Integration Examples

### BMAD for Complex Tasks
```python
# Use BMAD when you need specialized roles
from bmad import BMADMaster

master = BMADMaster()
master.register_agent(AnalystAgent())
master.register_agent(ArchitectAgent())
master.register_agent(DeveloperAgent())
result = master.execute_complex_task("Build a REST API")
```

### SpecKit for Quick Specs
```bash
# Use SpecKit for rapid specification
speckit generate-spec --type=web-app --name=MyApp
speckit create-prd --template=fullstack
```

### MetaGPT for Consistent Workflows
```python
# Use MetaGPT for standardized procedures
from metagpt import SOPAgent

agent = SOPAgent(sop="code_review")
result = agent.execute_standard_procedure(pr_code)
```

### Swarm for Simple Coordination
```python
# Use Swarm for lightweight handoffs
from swarm import Swarm

swarm = Swarm()
swarm.add_agent(agent_a)
swarm.add_agent(agent_b)
swarm.conversation_handoff("Agent A, hand off to Agent B")
```

---

## When to Use Each Framework

### Use BMAD When:
- Task requires multiple specialized roles
- Complex coordination needed
- Master-agent pattern fits
- Long-running workflows

### Use SpecKit When:
- Need consistent output formats
- Rapid prototyping required
- Specification-first approach
- CLI-driven workflow

### Use MetaGPT When:
- Standardized procedures needed
- Consistent outputs critical
- Repeatable workflows
- Role-based interactions

### Use Swarm When:
- Lightweight coordination sufficient
- Simple handoffs needed
- Emergent behavior acceptable
- Low overhead required

---

## Framework Composition

These frameworks can be combined:

**BMAD + MetaGPT:**
- BMAD provides orchestration
- MetaGPT provides SOPs for individual agents
- Result: Complex, standardized workflows

**SpecKit + Swarm:**
- SpecKit provides templates
- Swarm provides coordination
- Result: Consistent multi-agent output

**BMAD + Swarm:**
- BMAD provides master coordination
- Swarm provides lightweight handoffs
- Result: Scalable multi-agent system

---

## Code References

### Framework Implementations
- **BMAD:** `.blackbox5/engine/frameworks/1-bmad/`
- **SpecKit:** `.blackbox5/engine/frameworks/2-speckit/`
- **MetaGPT:** `.blackbox5/engine/frameworks/3-metagpt/`
- **Swarm:** `.blackbox5/engine/frameworks/4-swarm/`

### Additional Framework Copies
- **Development:** `.blackbox5/engine/development/frameworks/`
- **Analysis:** `.blackbox5/engine/development/framework-research/`

---

## Next Steps

1. **Choose Framework** - Select based on use case
2. **Review Documentation** - Understand patterns
3. **Study Examples** - Learn from implementations
4. **Integrate** - Combine frameworks for power

---

**Last Updated:** 2026-01-19
**Status:** ✅ All Active
**Maintainer:** BlackBox5 Engine Team
