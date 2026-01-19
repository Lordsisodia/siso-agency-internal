# Framework Code References

**Purpose:** Direct links to actual framework code locations
**Last Updated:** 2026-01-19

---

## Core Frameworks (Integrated)

### BMAD
**Implementation:** `.blackbox5/engine/frameworks/1-bmad/`
```bash
# Main components
.blackbox5/engine/frameworks/1-bmad/core/bmad-master.agent.yaml
.blackbox5/engine/frameworks/1-bmad/modules/analyst.agent.yaml
.blackbox5/engine/frameworks/1-bmad/modules/architect.agent.yaml
.blackbox5/engine/frameworks/1-bmad/modules/dev.agent.yaml
.blackbox5/engine/frameworks/1-bmad/modules/pm.agent.yaml
```

### SpecKit
**Implementation:** `.blackbox5/engine/frameworks/2-speckit/`
```bash
# Main components
.blackbox5/engine/frameworks/2-speckit/slash-commands/
.blackbox5/engine/frameworks/2-speckit/templates/
```

### MetaGPT
**Implementation:** `.blackbox5/engine/frameworks/3-metagpt/`
```bash
# Main components
.blackbox5/engine/frameworks/3-metagpt/templates/
```

### Swarm
**Implementation:** `.blackbox5/engine/frameworks/4-swarm/`
```bash
# Main components
.blackbox5/engine/frameworks/4-swarm/examples/
.blackbox5/engine/frameworks/4-swarm/patterns/
```

---

## Additional Framework Copies

### Development Directory
**Location:** `.blackbox5/engine/development/frameworks/`
```bash
.blackbox5/engine/development/frameworks/1-bmad/
.blackbox5/engine/development/frameworks/2-speckit/
.blackbox5/engine/development/frameworks/3-metagpt/
.blackbox5/engine/development/frameworks/4-swarm/
```

**Purpose:** Development and testing copies

---

## Research & Analysis Files

### Framework Research Directory
**Location:** `.blackbox5/engine/development/framework-research/`

#### Analysis Files (16 total)
```bash
# Core Frameworks
.blackbox5/engine/development/framework-research/BMAD-ANALYSIS.md
.blackbox5/engine/development/framework-research/bmad-code-org-BMAD-METHOD-ANALYSIS.md
.blackbox5/engine/development/framework-research/METAGPT-GITHUB-ANALYSIS.md
.blackbox5/engine/development/framework-research/FoundationAgents-MetaGPT-ANALYSIS.md
.blackbox5/engine/development/framework-research/openai-swarm-ANALYSIS.md

# Production Frameworks
.blackbox5/engine/development/framework-research/agentscope-ai-agentscope-ANALYSIS.md
.blackbox5/engine/development/framework-research/AGENTSCOPE-GITHUB-ANALYSIS.md
.blackbox5/engine/development/framework-research/bytedance-deer-flow-ANALYSIS.md
.blackbox5/engine/development/framework-research/DEERFLOW-ANALYSIS.md
.blackbox5/engine/development/framework-research/iflytek-astron-agent-ANALYSIS.md

# Enterprise Frameworks
.blackbox5/engine/development/framework-research/google-adk-python-ANALYSIS.md
.blackbox5/engine/development/framework-research/GOOGLE-ADK-ANALYSIS.md
.blackbox5/engine/development/framework-research/microsoft-agent-framework-ANALYSIS.md
.blackbox5/engine/development/framework-research/MervinPraison-PraisonAI-ANALYSIS.md
.blackbox5/engine/development/framework-research/PRAISONAI-ANALYSIS.md
```

---

## Inspiration Framework Analysis

### AutoMaker
**Location:** `.docs/frameworks-analysis/automaker/`
```bash
.docs/frameworks-analysis/automaker/automaker-analysis.md
.docs/frameworks-analysis/automaker/comparison.md
.docs/frameworks-analysis/automaker/inspirations.md
.docs/frameworks-analysis/automaker/QUICK-REFERENCE.md
```

### Maestro
**Location:** `.docs/frameworks-analysis/Maestro/`
```bash
.docs/frameworks-analysis/Maestro/maestro-analysis.md
.docs/frameworks-analysis/Maestro/comparison.md
.docs/frameworks-analysis/Maestro/inspirations.md
.docs/frameworks-analysis/Maestro/QUICK-REFERENCE.md
```

---

## Documentation Files

### Framework Documentation
**Location:** `.blackbox5/docs/`
```bash
.blackbox5/docs/FRAMEWORK-IMPLEMENTATION-PLAN.md       # 4-week implementation plan
.blackbox5/docs/FRAMEWORK-FEATURES-ANALYSIS.md         # Feature comparison
.blackbox5/docs/FRAMEWORK-COMPARISON.md                # Side-by-side comparison
```

### Root Documentation
**Location:** Root directory
```bash
FRAMEWORKS-DEEP-DIVE.md                                # Comprehensive deep dive
CLAUDE-CODE-AUTONOMOUS-FRAMEWORKS.md                  # Claude Code extensions
```

---

## Framework GitHub Repositories

### External Framework References

#### BMAD
- **Original:** `https://github.com/bmad-code-org/bmad`
- **Analysis:** `bmad-code-org-BMAD-METHOD-ANALYSIS.md`

#### MetaGPT
- **Original:** `https://github.com/geekan/MetaGPT`
- **Analysis:** `METAGPT-GITHUB-ANALYSIS.md`

#### Swarm
- **Original:** `https://github.com/openai/swarm`
- **Analysis:** `openai-swarm-ANALYSIS.md`

#### AgentScope
- **Original:** `https://github.com/modelscope/agentscope`
- **Analysis:** `agentscope-ai-agentscope-ANALYSIS.md`

#### DeerFlow
- **Original:** `https://github.com/bytedance/deerflow`
- **Analysis:** `bytedance-deer-flow-ANALYSIS.md`

#### Astron Agent
- **Original:** `https://github.com/iflytek/astron`
- **Analysis:** `iflytek-astron-agent-ANALYSIS.md`

#### Google ADK
- **Original:** `https://github.com/google/adk-python`
- **Analysis:** `google-adk-python-ANALYSIS.md`

#### Microsoft Agent Framework
- **Docs:** `https://docs.microsoft.com/ai-agent`
- **Analysis:** `microsoft-agent-framework-ANALYSIS.md`

#### PraisonAI
- **Original:** `https://github.com/MervinPraison/PraisonAI`
- **Analysis:** `MervinPraison-PraisonAI-ANALYSIS.md`

---

## Claude Code Autonomous Frameworks

### Claude-Flow
- **Repository:** `https://github.com/ruvnet/Claude-Flow`
- **Analysis:** `.docs/frameworks-analysis/claude-flow/`
- **Reference:** `CLAUDE-CODE-AUTONOMOUS-FRAMEWORKS.md`
- **Deep Dive:** `ruvnet-claude-flow-ANALYSIS.md`

### Sleepless Agent
- **Repository:** Various sources
- **Analysis:** `.docs/frameworks-analysis/sleepless/`
- **Reference:** `FRAMEWORKS-DEEP-DIVE.md`

### LLM Autonomous Agent Plugin
- **Repository:** Plugin ecosystem
- **Analysis:** `.docs/frameworks-analysis/llm-plugin/`
- **Reference:** `FRAMEWORKS-DEEP-DIVE.md`

---

## Quick Navigation

### For Implementation
1. **Code:** `.blackbox5/engine/frameworks/{1-bmad,2-speckit,3-metagpt,4-swarm}/`
2. **Plans:** `.blackbox5/docs/FRAMEWORK-IMPLEMENTATION-PLAN.md`
3. **Features:** `.blackbox5/docs/FRAMEWORK-FEATURES-ANALYSIS.md`

### For Research
1. **Analysis:** `.blackbox5/engine/development/framework-research/*.md`
2. **Inspiration:** `.docs/frameworks-analysis/{automaker,Maestro}/`
3. **Deep Dive:** `FRAMEWORKS-DEEP-DIVE.md`

### For Integration
1. **Comparison:** `.blackbox5/engine/development/frameworks/FRAMEWORK-COMPARISON.md`
2. **Roadmap:** `.blackbox5/engine/development/frameworks/AUTONOMOUS-WORKFLOW-RECOMMENDATIONS.md`
3. **Patterns:** `.docs/frameworks-analysis/inspirations.md`

---

## Symbolic Links (Recommended)

To make navigation easier, consider creating symbolic links:

```bash
# Create shortcuts from roadmap to actual code
cd .blackbox5/roadmap/frameworks/code-references/

# Core frameworks
ln -s ../../../engine/frameworks/1-bmad bmad-code
ln -s ../../../engine/frameworks/2-speckit speckit-code
ln -s ../../../engine/frameworks/3-metagpt metagpt-code
ln -s ../../../engine/frameworks/4-swarm swarm-code

# Research
ln -s ../../../engine/development/framework-research framework-research

# Documentation
ln -s ../../../docs framework-docs
```

---

**Last Updated:** 2026-01-19
**Purpose:** Quick navigation to all framework code and documentation
