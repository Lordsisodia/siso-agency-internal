# Sisyphus Research Orchestrator - Coordination Protocol

**Purpose**: Orchestrate parallel research across multiple AI frameworks
**Orchestrator**: Sisyphus
**Research Phase**: Framework Analysis for Blackbox4 Consolidation
**Date**: 2026-01-15
**Status**: 🚀 ACTIVE

---

## 🎯 Mission Statement

Coordinate 4 parallel research agents to analyze AI frameworks (Oh-My-OpenCode, BMAD, SpecKit, Ralph) and produce actionable integration recommendations for Blackbox4.

**Scale**: "Several hundred to several thousand prompts" across all agents
**Timeline**: 4 phases over 8 weeks (accelerated execution)
**Output**: Comprehensive framework analysis → Actionable Blackbox4 integration plan

---

## 📋 Agent Architecture

### 1. Sisyphus Orchestrator (This Agent)

**Role**: Coordination, workflow management, progress tracking
**Capabilities**:
- Spawn parallel research agents
- Track agent status and deliverables
- Coordinate synthesis phase
- Ensure quality standards
- Handle fallback to backup agents

**Communication**: Direct coordination with all research leads and analysis agent

---

### 2. Research Leads (4 Parallel Agents)

#### Research Lead 1: Oh-My-OpenCode Specialist
**Framework**: Oh-My-OpenCode
**Focus**: MCP integration, enhanced agents, LSP tools, background tasks
**Source Location**: `Open Code/` (local) or GitHub repository
**Deliverables**:
- Framework analysis report (`blackbox4/docs/research/ohmyopencode-analysis.md`)
- Component inventory (MCP system, agents, skills, tools)
- Integration plan for Blackbox4
- Code samples and examples

**Research Questions**: 150+ questions from MASTER-GUIDE.md section "Framework: Oh-My-OpenCode"

---

#### Research Lead 2: BMAD Methodology Specialist
**Framework**: BMAD (Business Model, Architecture, Development)
**Focus**: 12+ agents, 50+ workflows, 4-phase methodology
**Source Location**: `Black Box Factory/current/Blackbox3/agents/bmad/` (local)
**Deliverables**:
- Framework analysis report (`blackbox4/docs/research/bmad-analysis.md`)
- Agent catalog (all 12+ agents documented)
- Workflow library (50+ workflows documented)
- 4-phase enforcement script recommendation

**Research Questions**: 120+ questions from MASTER-GUIDE.md section "Framework: BMAD"

---

#### Research Lead 3: SpecKit Specialist
**Framework**: Spec Kit
**Focus**: Slash commands, document templates, specification patterns
**Source Location**: Documentation and examples
**Deliverables**:
- Framework analysis report (`blackbox4/docs/research/speckit-analysis.md`)
- Slash command patterns (not CLI code)
- Document templates (constitution, requirements, stories)
- Pattern documentation for Blackbox4

**Research Questions**: 100+ questions from MASTER-GUIDE.md section "Framework: Spec Kit"

---

#### Research Lead 4: Ralph Autonomous Agent Framework Specialist
**Framework**: Ralph
**Focus**: Autonomous agent loop, task execution, self-correction
**Source Location**: `ralph-claude-code/` (local) or GitHub
**Deliverables**:
- Framework analysis report (`blackbox4/docs/research/ralph-analysis.md`)
- Autonomous loop implementation details
- Task execution patterns
- Self-correction mechanisms
- Integration as external dependency recommendation

**Research Questions**: 130+ questions from MASTER-GUIDE.md section "Framework: Ralph"

---

### 3. Analysis Agent

**Role**: Synthesize findings from all Research Leads
**Focus**: Create unified recommendations for Blackbox4
**Input**: 4 framework analysis reports
**Output**:
- Synthesis report (`blackbox4/docs/research/SYNTHESIS-REPORT.md`)
- Prioritized feature list
- Integration roadmap
- Risk assessment
- Final recommendations

**Trigger**: After all 4 Research Leads complete their work

---

### 4. Backup Research Agents (3 Standby)

**Role**: Take over if primary Research Leads fail or get blocked
**Status**: STANDBY (activated on-demand)
**Framework Coverage**:
- Backup 1: MetaGPT (document templates, role-based agents)
- Backup 2: Swarm (multi-agent patterns, context management)
- Backup 3: OpenCode/Claude Code (CLI patterns, editor integration)

---

## 🚀 Research Workflow (4 Phases)

### Phase 1: Discovery (Week 1-2)

**Objective**: Understand frameworks at high level, identify key components

**Sisyphus Actions**:
1. ✅ Define Blackbox3 reference structure (DONE)
2. ✅ Create research output format requirements (DONE)
3. Deploy 4 Research Leads in parallel (NOW)
4. Provide each Research Lead with:
   - Framework-specific research questions (from MASTER-GUIDE.md)
   - BLACKBOX3-REFERENCE-STRUCTURE.md (output format)
   - Source locations
   - Success criteria

**Research Lead Actions** (Parallel, Each):
1. Download/access framework code and documentation
2. Read README, docs, examples
3. Map directory structure
4. Identify core components
5. Create component inventory
6. Answer discovery-phase research questions (50% of total questions)
7. Output: `blackbox4/docs/research/{FRAMEWORK}-discovery.md`

**Duration**: 3-5 days per agent
**Effort**: 200-300 prompts per agent

---

### Phase 2: Deep Analysis (Week 3-5)

**Objective**: Detailed analysis of each component, integration feasibility

**Sisyphus Actions**:
1. Monitor all Research Leads progress
2. Collect discovery reports
3. Provide feedback and clarifications
4. Unblock any blocked agents
5. Track deliverables

**Research Lead Actions** (Parallel, Each):
1. Analyze each component in detail (from inventory)
2. Evaluate code quality, complexity, reusability
3. Estimate integration effort
4. Identify code to copy vs code to adapt vs code to reimplement
5. Answer deep-analysis research questions (30% of total questions)
6. Create code examples
7. Document patterns
8. Output: `blackbox4/docs/research/{FRAMEWORK}-deep-analysis.md`

**Duration**: 5-7 days per agent
**Effort**: 300-500 prompts per agent

---

### Phase 3: Integration Planning (Week 6-7)

**Objective**: Create actionable integration plans for Blackbox4

**Sisyphus Actions**:
1. Review deep-analysis reports
2. Identify cross-framework synergies
3. Resolve conflicting recommendations
4. Prepare for synthesis phase

**Research Lead Actions** (Parallel, Each):
1. Prioritize components by impact/effort matrix
2. Create detailed integration plan
3. Define phases for Blackbox4 integration
4. Create component documentation for each item to integrate
5. Answer integration-phase research questions (20% of total questions)
6. Output: `blackbox4/docs/research/{FRAMEWORK}-integration-plan.md`

**Duration**: 3-5 days per agent
**Effort**: 200-300 prompts per agent

**Deliverable**: Complete framework analysis report including:
- Executive summary
- Architecture overview
- Component analysis (all components)
- Integration recommendations (prioritized)
- Code to copy/adapt
- What NOT to copy
- Comparative analysis
- Action plan

---

### Phase 4: Synthesis & Final Recommendations (Week 8)

**Objective**: Unify all findings, create final Blackbox4 integration strategy

**Sisyphus Actions**:
1. Deploy Analysis Agent
2. Provide all 4 framework analysis reports as input
3. Provide Blackbox4 consolidation requirements
4. Set synthesis goals and success criteria

**Analysis Agent Actions**:
1. Read all 4 framework analysis reports
2. Identify common themes and patterns
3. Resolve conflicting recommendations
4. Prioritize features by total impact
5. Create unified integration roadmap
6. Assess total effort and risks
7. Create final recommendations
8. Output: `blackbox4/docs/research/SYNTHESIS-REPORT.md`

**Duration**: 2-3 days
**Effort**: 100-200 prompts

**Deliverable**: Comprehensive synthesis report including:
- Executive summary of all frameworks
- Unified feature priority list
- Recommended Blackbox4 architecture
- Integration roadmap with phases
- Risk mitigation strategies
- Success metrics

---

## 📊 Progress Tracking

### Status Monitoring Protocol

**Sisyphus monitors each Research Lead** using:

**Check Interval**: Every 4-6 hours (or when prompted)

**Status Format** (from BLACKBOX3-REFERENCE-STRUCTURE.md):

```json
{
  "agent": "Research Lead 1",
  "framework": "Oh-My-OpenCode",
  "phase": "Discovery",
  "progress": 35,
  "status": "IN_PROGRESS",
  "deliverables": [
    "blackbox4/docs/research/ohmyopencode-discovery.md (IN PROGRESS)",
    "Component inventory (IN PROGRESS)",
    "50/150 questions answered"
  ],
  "blockers": [
    "None"
  ],
  "next_steps": [
    "Continue answering discovery questions",
    "Start component analysis"
  ],
  "timestamp": "2026-01-15T10:00:00Z"
}
```

### Deliverable Checklist

**Phase 1 Deliverables** (All Agents):
- [ ] Framework discovery report
- [ ] Component inventory
- [ ] Directory structure map
- [ ] 50% research questions answered

**Phase 2 Deliverables** (All Agents):
- [ ] Deep analysis report
- [ ] Component analysis (each component)
- [ ] Code quality evaluation
- [ ] Integration effort estimates
- [ ] 80% research questions answered

**Phase 3 Deliverables** (All Agents):
- [ ] Integration plan
- [ ] Prioritized component list
- [ ] Component documentation
- [ ] Code examples
- [ ] 100% research questions answered
- [ ] COMPLETE framework analysis report

**Phase 4 Deliverables** (Analysis Agent):
- [ ] Synthesis report
- [ ] Unified recommendations
- [ ] Integration roadmap
- [ ] Risk assessment

---

## 🔄 Coordination Protocols

### Agent Communication Flow

```
Sisyphus (Orchestrator)
    ↓ (deploy with context)
Research Lead 1 (Oh-My-OpenCode)
Research Lead 2 (BMAD)
Research Lead 3 (SpecKit)
Research Lead 4 (Ralph)
    ↓ (status updates)
Sisyphus (Orchestrator)
    ↓ (collect reports)
Analysis Agent
    ↓ (synthesis)
Sisyphus (Orchestrator)
    ↓ (final report)
User
```

### Blocker Resolution

**If Research Lead is blocked**:

1. **Identify blocker**: Research Lead reports issue
2. **Assess severity**: Can Sisyphus unblock? Need user intervention?
3. **Resolve if possible**: Sisyphus provides additional context, guidance
4. **Escalate if needed**: Notify user of blocker requiring human decision
5. **Activate backup** (if primary fails): Deploy backup agent with same framework

### Quality Assurance

**Sisyphus validates** each deliverable:
- ✅ Follows BLACKBOX3-REFERENCE-STRUCTURE.md format
- ✅ Includes all required sections
- ✅ Research questions answered
- ✅ Code examples provided
- ✅ Recommendations clear and actionable

**If deliverable fails QA**:
- Return to Research Lead with feedback
- Request corrections
- Re-validate until passing

---

## 📈 Success Metrics

### Research Quality Metrics

- **Completeness**: All research questions answered (100%)
- **Depth**: Code-level analysis with examples
- **Actionability**: Clear integration recommendations
- **Consistency**: All agents follow same format

### Integration Metrics

- **Impact**: Features prioritized by value to Blackbox4
- **Effort**: Realistic effort estimates
- **Risk**: Risks identified and mitigated
- **Coverage**: All valuable components considered

### Execution Metrics

- **Timeline**: Complete all 4 phases in 8 weeks (or less)
- **Parallelism**: All 4 agents running simultaneously
- **Efficiency**: "Several hundred to several thousand prompts" total
- **Quality**: All deliverables pass QA

---

## 🎯 Agent Deployment Instructions

### Sisyphus Orchestrator (Current Session)

**Status**: ✅ DEPLOYED (you are here!)
**Actions**:
- Read MASTER-GUIDE.md for full context
- Read BLACKBOX3-REFERENCE-STRUCTURE.md for output format
- Deploy Research Leads using background_task
- Monitor progress
- Coordinate phases
- Collect deliverables
- Deploy Analysis Agent
- Finalize synthesis

### Research Lead Deployment (Next Steps)

**Use**: `background_task` tool for parallel execution

**Template** for each Research Lead:

```python
background_task(
    agent="general",  # or "explore" for code exploration
    description="Research Lead X: {FRAMEWORK} analysis",
    prompt="""
You are Research Lead X, specializing in {FRAMEWORK} framework analysis.

MISSION: Deep analyze {FRAMEWORK} framework to provide actionable integration recommendations for Blackbox4.

CONTEXT:
- Blackbox4 is consolidating Blackbox3 + Oh-My-OpenCode + BMAD + Ralph + other frameworks
- We need to understand what to copy, adapt, or skip from {FRAMEWORK}
- Output must follow BLACKBOX3-REFERENCE-STRUCTURE.md format

PHASE 1: Discovery (Current Phase)
- Access framework from: {SOURCE_LOCATION}
- Read documentation, examples, code
- Map directory structure
- Identify core components
- Create component inventory
- Answer discovery-phase questions from: blackbox4/implementation-plans/MASTER-GUIDE.md
- Output: blackbox4/docs/research/{FRAMEWORK}-discovery.md

SUCCESS CRITERIA:
- Component inventory complete
- Discovery report complete
- 50% of research questions answered
- All outputs follow BLACKBOX3-REFERENCE-STRUCTURE.md format

REPORTING:
- Provide status updates every 20-30 questions answered
- Use status format from BLACKBOX3-REFERENCE-STRUCTURE.md section 8
- Report blockers immediately

When complete, deliver:
1. Discovery report
2. Component inventory
3. Status update with next steps for Phase 2
"""
)
```

### Analysis Agent Deployment (After Phase 3 Complete)

**Use**: `task` tool (sync, no need for background)

**Prompt Template**:

```python
task(
    subagent_type="oracle",  # Expert advisor for synthesis
    description="Synthesize framework research findings",
    prompt="""
You are the Analysis Agent. Your mission is to synthesize findings from 4 Research Leads who analyzed different AI frameworks.

INPUT FILES:
- blackbox4/docs/research/ohmyopencoanalysis.md
- blackbox4/docs/research/bmad-analysis.md
- blackbox4/docs/research/speckit-analysis.md
- blackbox4/docs/research/ralph-analysis.md

CONTEXT:
- Blackbox4 consolidates Blackbox3 + Oh-My-OpenCode + BMAD + Ralph + patterns from other frameworks
- Blackbox4 follows REUSE strategy: copy existing code, minimal new development
- Goal: Create unified integration recommendations

YOUR TASK:
1. Read all 4 framework analysis reports
2. Identify common themes, patterns, synergies
3. Resolve conflicting recommendations
4. Create unified feature priority list
5. Design Blackbox4 integration roadmap
6. Assess total effort and risks
7. Provide final recommendations

OUTPUT: blackbox4/docs/research/SYNTHESIS-REPORT.md
Format: Follow BLACKBOX3-REFERENCE-STRUCTURE.md synthesis report format

When complete, provide executive summary and key recommendations.
"""
)
```

---

## 📝 Current Session Actions

### ✅ Completed
1. Blackbox3 reference structure defined
2. Research output format requirements created
3. Orchestrator protocol documented

### 🚀 Next Actions (Immediate)
1. Deploy Research Lead 1: Oh-My-OpenCode (background_task)
2. Deploy Research Lead 2: BMAD (background_task)
3. Deploy Research Lead 3: SpecKit (background_task)
4. Deploy Research Lead 4: Ralph (background_task)

### 📋 Then (Phase 1 Active)
1. Monitor all 4 Research Leads (check status every 4-6 hours)
2. Collect discovery reports when complete
3. Validate deliverables (QA)
4. Provide Phase 2 instructions to all agents

### 🔄 Later (Phase 2-4)
1. Coordinate deep analysis phase
2. Coordinate integration planning phase
3. Deploy Analysis Agent for synthesis
4. Finalize complete research project

---

## 🔍 Status Query Interface

**User can query agent status at any time**:

```
"Status: How is Oh-My-OpenCode research progressing?"
→ Sisyphus checks Research Lead 1 status
→ Returns current progress, deliverables, blockers

"Status: Show overall project progress"
→ Sisyphus checks all Research Leads
→ Returns summary of all agents, overall completion %

"Status: What are the blockers?"
→ Sisyphus reports any blockers across all agents
→ Returns blocker details and resolution status

"Status: When will Phase 1 be complete?"
→ Sisyphus estimates based on progress
→ Returns projected completion date

"Action: Show all deliverables so far"
→ Sisyphus lists all completed deliverables
→ Returns file paths and status
```

---

## 📚 Reference Documents

### Core Planning
- **MASTER-GUIDE.md**: Complete research plan with 150+ questions per framework
- **BLACKBOX3-REFERENCE-STRUCTURE.md**: Output format requirements
- **ORCHESTRATOR-PROTOCOL.md**: This file

### Framework-Specific Planning
- **OhMyOpenCode/**: Implementation guides
- **Evaluations/**: Framework comparison matrix
- **README.md**: Blackbox4 consolidation overview

### Blackbox4 Context
- **README.md**: Blackbox4 architecture and consolidation plan
- **01-BLACKBOX3-REUSE.md**: Blackbox3 components
- **02-LUMELLE-REUSE.md**: Lumelle scripts
- **03-OPENCODE-REUSE.md**: Oh-My-OpenCode integration
- **04-BMAD-REUSE.md**: BMAD methodology
- **05-RALPH-REUSE.md**: Ralph integration
- **06-SPECKIT-REUSE.md**: SpecKit patterns

---

## 🎯 Immediate Next Steps

**Right Now**: Deploy 4 Research Leads in parallel using `background_task`

**Command Pattern**:
```python
# Deploy all 4 in parallel
background_task(agent="explore", description="RL1: OhMyOpenCode", prompt="...")
background_task(agent="explore", description="RL2: BMAD", prompt="...")
background_task(agent="explore", description="RL3: SpecKit", prompt="...")
background_task(agent="explore", description="RL4: Ralph", prompt="...")
```

**After Deployment**: Monitor progress with `background_output(task_id="...")`

---

**Orchestrator Status**: 🚀 READY TO DEPLOY RESEARCH AGENTS
**Phase**: 1 - Discovery
**Deployment**: Ready to execute
**Timeline**: Starting immediately

---

**END OF ORCHESTRATOR PROTOCOL**

Last Updated: 2026-01-15
Next Action: Deploy 4 Research Leads in parallel
