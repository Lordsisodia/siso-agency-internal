---
id: "PROPOSAL-005"
title: "Agent Types & Specialization Research"
slug: "agent-types-research"
status: "proposed"
stage: "00-proposed"

# Metadata
created_at: "2026-01-19T10:30:00Z"
created_by: "claude"
updated_at: "2026-01-19T10:30:00Z"

# Classification
category: "research"
domain: "agents"
priority: "high"

# Relationships
depends_on: []
blocks: []
blocked_by: []
relates_to: ["PROPOSAL-002", "PROPOSAL-003"]
parent_improvement: null

# Tasks
related_tasks: []
parent_prd: null
parent_epic: null

# Effort Tracking
estimated_hours: 30
actual_hours: null
progress: 0.0

# Review
review_status: "not-reviewed"
reviewed_by: null
reviewed_at: null
approval_notes: null

# Tags
tags: ["agents", "specialization", "routing", "discovery", "research", "tier-2"]

# Links
proposal_link: "00-proposed/agent-types-research.md"
research_link: null
design_link: null
plan_link: null
active_link: null
completion_link: null

# Git Integration
git_branch: null
git_pr: null

# Custom Metadata
metadata:
  research_weight: 12
  tier: "high"
  first_principles: "Different tasks require different approaches. Specialization enables efficiency and expertise."
---

# Proposal: Agent Types & Specialization Research

## Problem Statement

BlackBox5 has 50 agents across 5 major types, but the agent system has significant gaps:

1. **No Agent Discovery** - Agents can't find each other automatically
2. **No Capability Registry** - No way to query what agents can do
3. **No Dynamic Routing** - Manual agent selection required
4. **Limited Specialization** - Agents are general-purpose
5. **Poor Inter-Agent Communication** - Ad-hoc patterns

Without these capabilities, the agent system is:
- Hard to scale (manual routing)
- Inefficient (wrong agents for tasks)
- Difficult to extend (no clear patterns)
- Lacking in collaboration (poor communication)

## Current State

**What We Have:**
- 50 agents across 5 types:
  - Core Agents - Base implementations
  - BMAD Agents - Multi-agent orchestration
  - Research Agents - Deep research specialists
  - Specialist Agents - Domain experts
  - Enhanced Agents - Advanced capabilities
- Basic agent loading system
- Manual agent routing

**Pain Points:**
- No agent capability registry
- No automatic agent discovery
- No agent selection algorithms
- Limited inter-agent communication
- No specialization patterns
- Ad-hoc coordination

**Locations:**
- `.blackbox5/engine/agents/`

## Proposed Solution

### Phase 1: Agent Capability Registry (4-5 days)
- Define agent capability schema
- Register all agent capabilities
- Capability query interface
- Semantic capability matching
- Agent metadata registry

### Phase 2: Agent Discovery System (4-5 days)
- Automatic agent discovery
- Agent advertisement protocols
- Capability broadcasting
- Agent health monitoring
- Dynamic agent registration

### Phase 3: Intelligent Agent Routing (5-6 days)
- Task-to-agent matching algorithms
- Multi-agent task allocation
- Load balancing across agents
- Agent selection heuristics
- Routing optimization

### Phase 4: Inter-Agent Communication (4-5 days)
- Standardized message formats
- Agent-to-agent messaging protocols
- Event-driven communication
- Request/response patterns
- Broadcast and multicast

### Phase 5: Specialization Patterns (3-4 days)
- Define specialist agent archetypes
- Agent composition patterns
- Hierarchical agent structures
- Agent team formation
- Role-based agent interactions

## Expected Impact

**Quantitative:**
- Automatic agent selection (zero manual routing)
- 10x faster agent discovery
- 5x improvement in task-agent matching
- Support for 100+ agents

**Qualitative:**
- Easier to add new agents
- Better task-agent fit
- More efficient agent utilization
- Richer multi-agent collaboration

**Who Benefits:**
- System: More scalable and efficient
- Developers: Easier to add agents
- Users: Better task completion

## Alternatives Considered

1. **Manual Agent Selection**
   - Rejected: Doesn't scale
   - Rejected: Error-prone

2. **Centralized Agent Registry**
   - Rejected: Single point of failure
   - Rejected: Bottleneck

3. **Full Agent Marketplace**
   - Rejected: Too complex for current needs
   - Rejected: Over-engineering

## Risks and Concerns

**Technical Risks:**
- Agent routing may make poor choices
- Discovery overhead may be significant
- Communication protocols may be complex
- Specialization may limit flexibility

**Mitigation Strategies:**
- Learn from routing decisions
- Cache discovery results
- Use simple, proven protocols
- Allow generalist agents

## Next Steps

**Immediate:**
1. Approve this proposal
2. Move to `01-research/` stage

**Research Phase:**
1. Study agent systems in other frameworks
2. Evaluate routing algorithms
3. Benchmark current agent usage
4. Identify specialization opportunities

---

**Approval Required:** Move to research phase
**Estimated Research Duration:** 1 week
**Proposed By:** Claude (First Principles Analysis)
**Priority:** High (Tier 2 - 12% weight)
