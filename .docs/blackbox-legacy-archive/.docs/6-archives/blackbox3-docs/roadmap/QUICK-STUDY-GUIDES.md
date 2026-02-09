# Quick Study Guides: Best Implementations by Feature

**Date:** 2026-01-15
**Purpose:** Quick reference for studying open-source code to implement features in Blackbox3

---

## How to Use These Guides

**For Each Feature You Want to Implement:**

1. **Find the feature** in the matrix (FEATURE-MATRIX-&-IMPLEMENTATION-ROADMAP.md)
2. **Go to the repository** listed under "Study Code"
3. **Read the "Key Files"** to understand implementation
4. **Copy the patterns** (not copy-paste code, but understand the logic)
5. **Adapt to Blackbox3** (following Blackbox3 conventions: file-based, bash scripts, etc.)

---

## Critical Features: Study Priority

### Feature 1: Circuit Breaker (CRITICAL)
**Best Source:** Ralph (Anthropic)
**Repository:** github.com/anthropics/claude-code/tree/main/ralph-claude-code

**What to Study:**
```
ralph-claude-code/
├── ralph_loop.sh              # Main loop execution
├── lib/
│   ├── circuit_breaker.sh      # Circuit breaker logic
│   └── state_manager.sh        # State persistence
└── config/
    └── circuit_config.yaml     # Threshold configuration
```

**Key Files to Read:**
1. `lib/circuit_breaker.sh` - How to detect stagnation
2. `lib/state_manager.sh` - How to persist state across loops
3. `ralph_loop.sh` - How to integrate circuit breaker in main loop

**Key Patterns to Copy:**
- State persistence in JSON file
- Threshold checking (max loops, stagnation rate)
- Manual reset mechanism
- Comprehensive logging
- Configurable per project

**Implementation Time:** 8 hours

---

### Feature 2: Exit Detection (CRITICAL)
**Best Source:** Ralph (Anthropic)
**Repository:** github.com/anthropics/claude-code/tree/main/ralph-claude-code

**What to Study:**
```
ralph-claude-code/
├── lib/
│   ├── exit_detector.sh        # Exit decision logic
│   └── response_parser.sh      # Parse AI responses
└── .ralph/
    └── @fix_plan.md           # Task completion format
```

**Key Files to Read:**
1. `lib/exit_detector.sh` - Multi-criteria exit decision
2. `lib/response_parser.sh` - Parse tasks, completion indicators
3. `lib/progress_tracker.sh` - Track completion percentage

**Key Patterns to Copy:**
- Multi-criteria evaluation (AND logic, not OR)
- Confidence scoring (0-100%)
- Task completion detection from markdown
- Completion keyword detection (done, complete, finished)
- Confidence indicators (explicit vs implicit)

**Implementation Time:** 6 hours

---

### Feature 3: Agent Handoff (HIGH PRIORITY)
**Best Source:** OpenAI Agents SDK (recommended over deprecated Swarm)
**Repository:** github.com/openai/openai-agents-python
**Documentation:** platform.openai.com/docs/guides/agents

**What to Study:**
```
openai-agents-python/
├── openai/
│   ├── agents/
│   │   ├── __init__.py
│   │   └── base.py            # Agent base class with handoff
│   └── assistant/
│       └── __init__.py         # Assistant agent examples
└── examples/
    ├── handoffs/
    │   ├── simple_handoff.py  # Basic handoff example
    │   └── context_handoff.py # Context-preserving handoff
    └── weather_agent.py          # Multi-agent example
```

**Key Files to Read:**
1. `openai/agents/base.py` - Agent base class
2. `examples/handoffs/simple_handoff.py` - Handoff pattern
3. `examples/handoffs/context_handoff.py` - Context preservation

**Key Patterns to Copy:**
- Functions return Agent objects (handoff)
- Context preservation across handoffs
- Handoff triggers (conditions, completion)
- Context injection into agent instructions
- Multi-agent conversations

**Implementation Time:** 8 hours

---

### Feature 4: Hierarchical Tasks (HIGH PRIORITY)
**Best Source:** CrewAI
**Repository:** github.com/joaomdmoura/crewAI

**What to Study:**
```
crewAI/
├── crewai/
│   ├── task.py                # Task class
│   ├── crew.py                # Crew class
│   └── process/
│       ├── hierarchical.py      # Hierarchical process
│       └── sequential.py       # Sequential process
└── examples/
    └── hierarchical_tasks/     # Examples
```

**Key Files to Read:**
1. `crewai/task.py` - Task class with dependencies
2. `crewai/process/hierarchical.py` - Hierarchical execution
3. `examples/hierarchical_tasks/` - Usage examples

**Key Patterns to Copy:**
- Parent-child task relationships
- Task dependencies (B depends on A)
- Automatic task breakdown
- Task completion status tracking
- Visual hierarchy representation

**Implementation Time:** 12 hours

---

### Feature 5: Cyclic Workflows (HIGH PRIORITY)
**Best Source:** LangGraph
**Repository:** github.com/langchain-ai/langgraph

**What to Study:**
```
langgraph/
├── langgraph/
│   ├── graph.py                # StateGraph class
│   ├── checkpoint.py            # State persistence
│   └── prebuilt/
│       ├── agent_executor.py    # Agent-based workflows
│       └── chatbot_executor.py # Conversational workflows
└── examples/
    ├── agent_branching.py       # Branching workflows
    ├── human_in_the_loop.py    # Human intervention
    └── multi_agent.py          # Multi-agent coordination
```

**Key Files to Read:**
1. `langgraph/graph.py` - StateGraph class
2. `langgraph/checkpoint.py` - State persistence
3. `examples/agent_branching.py` - Conditional branching
4. `examples/multi_agent.py` - Multi-agent coordination

**Key Patterns to Copy:**
- Nodes and edges graph model
- Cyclic execution (loops back to previous states)
- State preservation across cycles
- Conditional edge routing (if/else)
- Retry logic with max attempts
- Error recovery patterns

**Implementation Time:** 16 hours

---

### Feature 6: Structured Spec Creation (HIGH PRIORITY)
**Best Source:** Spec Kit
**Repository:** github.com/github/spec-kit

**What to Study:**
```
spec-kit/
├── src/
│   └── specify_cli/
│       ├── commands/
│       │   ├── constitution.py  # Constitution workflow
│       │   ├── specify.py       # Spec creation workflow
│       │   ├── clarify.py       # Questioning workflow
│       │   ├── plan.py          # Planning workflow
│       │   ├── tasks.py         # Task breakdown
│       │   └── analyze.py       # Analysis workflow
│       └── templates/
│           ├── spec-template.md    # Spec template
│           └── prd-template.md     # PRD template
└── docs/
    ├── spec-driven.md             # Spec-driven development methodology
    └── commands.md              # Command documentation
```

**Key Files to Read:**
1. `src/specify_cli/commands/specify.py` - Spec creation logic
2. `src/specify_cli/commands/clarify.py` - Sequential questioning
3. `src/specify_cli/templates/spec-template.md` - Spec template
4. `docs/spec-driven.md` - Spec-driven methodology

**Key Patterns to Copy:**
- Sequential questioning workflow
- Coverage-based questioning (unit tests for English)
- Structured output format
- Answer recording and gap identification
- Slash command system

**Implementation Time:** 16 hours

---

### Feature 7: Context Variables (HIGH PRIORITY for Multi-Tenant)
**Best Source:** OpenAI Agents SDK (recommended)
**Repository:** github.com/openai/openai-agents-python
**Documentation:** platform.openai.com/docs/guides/agents

**What to Study:**
```
openai-agents-python/
├── openai/
│   ├── agents/
│   │   ├── base.py            # Base agent with context
│   │   └── tools.py           # Tool integration
│   └── agent/
│       └── __init__.py         # Agent examples
└── examples/
    ├── context_variables/        # Context usage examples
    ├── multi_tenant/           # Multi-tenant patterns
    └── weather_agent.py         # Agent with context
```

**Key Files to Read:**
1. `openai/agents/base.py` - Context variable support
2. `examples/context_variables/` - Context usage
3. `examples/multi_tenant/` - Multi-tenant examples

**Key Patterns to Copy:**
- Dynamic prompt generation with context
- Context dict with tenant_id, config, features
- Context injection into agent instructions
- Tenant isolation (no cross-tenant data leaks)
- Multiple simultaneous tenants

**Implementation Time:** 12 hours

---

### Feature 8: Knowledge Graph (HIGH PRIORITY for Your Research)
**Best Source:** LlamaIndex
**Repository:** github.com/run-llama/llama_index

**What to Study:**
```
llama_index/
├── llama_index/
│   ├── core/
│   │   ├── knowledge_graph.py    # Knowledge graph class
│   │   ├── graph_store.py       # Graph storage
│   │   └── retrievers/
│   │       ├── kg_retriever.py # Knowledge graph retrieval
│   │       └── kg_query.py     # Graph queries
│   └── core/
│       └── extractors/
│           ├── entity_extractor.py # Entity extraction
│           └── relation_extractor.py # Relationship extraction
└── examples/
    ├── kg_demo/                  # Knowledge graph examples
    └── rag_with_kg.py           # RAG + KG examples
```

**Key Files to Read:**
1. `llama_index/core/knowledge_graph.py` - Knowledge graph class
2. `llama_index/core/extractors/entity_extractor.py` - Entity extraction
3. `llama_index/core/retrievers/kg_retriever.py` - Graph retrieval
4. `examples/kg_demo/` - Usage examples

**Key Patterns to Copy:**
- LLM-based entity extraction
- Entity types and properties
- Relationship types and extraction
- Graph construction (nodes and edges)
- Graph queries (neighbors, path, connected)
- Integration with semantic search
- Hybrid search (graph + semantic)

**Implementation Time:** 20 hours

---

### Feature 9: Real-Time Monitoring (MEDIUM PRIORITY)
**Best Source:** Cline (open source)
**Repository:** github.com/allaunderaunder/claude-code

**What to Study:**
```
claude-code/
├── src/
│   ├── monitoring/
│   │   ├── progress_tracker.py   # Progress tracking
│   │   ├── status_display.py     # Terminal status
│   │   └── loop_monitor.py       # Loop monitoring
│   └── utils/
│       └── terminal.py           # Terminal formatting
└── examples/
    └── autonomous_monitoring/   # Monitoring examples
```

**Key Files to Read:**
1. `src/monitoring/progress_tracker.py` - Progress calculation
2. `src/monitoring/status_display.py` - Terminal display
3. `src/monitoring/loop_monitor.py` - Loop state tracking
4. `examples/autonomous_monitoring/` - Usage examples

**Key Patterns to Copy:**
- Real-time progress updates
- Task completion percentage tracking
- Elapsed time and ETA
- Current task display
- Keyboard interrupt handling
- Status file updates
- Terminal formatting and clearing

**Implementation Time:** 8 hours

---

### Feature 10: Git-Aware File System (MEDIUM PRIORITY)
**Best Source:** Aider
**Repository:** github.com/paul-gauthier/aider

**What to Study:**
```
aider/
├── aider/
│   ├── git.py                 # Git operations
│   ├── io.py                  # File I/O with git awareness
│   └── commands/
│       ├── commit.py             # Commit operations
│       └── diff.py               # Diff operations
├── src/
│   └── repomap.py              # Repository mapping
└── examples/
    └── git_aware/               # Git-aware examples
```

**Key Files to Read:**
1. `aider/git.py` - Git state detection
2. `aider/io.py` - Git-aware file operations
3. `aider/commands/commit.py` - Commit generation
4. `aider/commands/diff.py` - Diff preview

**Key Patterns to Copy:**
- Git state detection (branch, status, staged files)
- Context-aware file modifications
- Automatic commit message generation
- Diff preview before changes
- Branch switching awareness
- Conflict resolution support

**Implementation Time:** 10 hours

---

## Alternative Sources by Feature

### For Agent Orchestration:
| Feature | Primary Source | Alternative |
|---------|---------------|-------------|
| Agent Handoff | OpenAI Agents SDK | Swarm (deprecated) |
| Hierarchical Tasks | CrewAI | ZenStack |
| Cyclic Workflows | LangGraph | AutoGen |
| Multi-Agent Conversations | AutoGen | CrewAI |

### For Planning:
| Feature | Primary Source | Alternative |
|---------|---------------|-------------|
| Structured Spec | Spec Kit | MetaGPT |
| Sequential Questioning | Spec Kit | MetaGPT |
| Task Auto-Breakdown | MetaGPT | None found |
| Constitution-Based Dev | Spec Kit | None found |

### For Memory:
| Feature | Primary Source | Alternative |
|---------|---------------|-------------|
| Context Variables | OpenAI Agents SDK | Swarm (deprecated) |
| Knowledge Graph | LlamaIndex | Neo4j, GraphDB |
| Entity Extraction | LlamaIndex | Spacy, OpenAI NER |
| Relationship Tracking | LlamaIndex | Neo4j |

### For Developer Experience:
| Feature | Primary Source | Alternative |
|---------|---------------|-------------|
| Real-Time Monitoring | Cline | Cursor (closed) |
| Command Palette | Cursor (closed) | None found |
| Git-Aware FS | Aider | Cursor (closed) |
| Streaming Output | LangChain | OpenAI streaming API |
| Diff Previews | Cursor (closed) | Aider |

---

## Study Strategy: How to Learn Efficiently

### Step 1: Choose Your First Feature
Start with quick wins (Week 1):
1. Circuit Breaker (8 hrs) - Critical for autonomous execution
2. Exit Detection (6 hrs) - Essential for knowing when done
3. Context Variables (12 hrs) - Critical for your multi-tenant research
4. Command Palette (6 hrs) - Huge productivity boost

**Total Week 1:** 32 hours

### Step 2: Study the Implementation
1. Read "Key Files" in this guide
2. Understand the logic and patterns
3. Identify what to copy vs what to adapt
4. Note any dependencies or integrations needed

### Step 3: Implement in Blackbox3
1. Follow thought-chain implementation plan (THOUGHT-CHAIN-IMPLEMENTATION-PLAN.md)
2. Adapt patterns to Blackbox3 conventions (file-based, bash scripts)
3. Test with real scenarios
4. Iterate and refine

### Step 4: Document Your Implementation
1. Write what you did (similar to this document)
2. Note challenges and solutions
3. Share with team/community
4. Update this document with lessons learned

---

## Repository Clone Commands

Clone all at once:

```bash
# Create study directory
mkdir -p ~/blackbox3-study
cd ~/blackbox3-study

# Clone repositories
git clone --depth 1 https://github.com/anthropics/claude-code.git ralph
git clone --depth 1 https://github.com/joaomdmoura/crewAI.git
git clone --depth 1 https://github.com/langchain-ai/langgraph.git
git clone --depth 1 https://github.com/openai/openai-agents-python.git
git clone --depth 1 https://github.com/github/spec-kit.git
git clone --depth 1 https://github.com/run-llama/llama_index.git
git clone --depth 1 https://github.com/paul-gauthier/aider.git
git clone --depth 1 https://github.com/allaunderaunder/claude-code.git
```

---

## Quick Reference: Feature Study Order

Based on importance to Blackbox3, study in this order:

### Phase 1: Safety (CRITICAL) - 14 hours
1. Circuit Breaker (Ralph) - 2 hours
2. Exit Detection (Ralph) - 1.5 hours
3. Response Analysis (Ralph) - 2 hours
4. Context Variables (OpenAI Agents SDK) - 3 hours
5. Agent Evaluation (OpenAI Agents SDK) - 2 hours

### Phase 2: Orchestration (HIGH) - 24 hours
6. Agent Handoff (OpenAI Agents SDK) - 4 hours
7. Hierarchical Tasks (CrewAI) - 6 hours
8. Cyclic Workflows (LangGraph) - 8 hours
9. Multi-Agent Conversations (AutoGen) - 6 hours

### Phase 3: Planning (HIGH) - 24 hours
10. Structured Spec Creation (Spec Kit) - 8 hours
11. Sequential Questioning (Spec Kit) - 4 hours
12. Task Auto-Breakdown (MetaGPT) - 6 hours
13. Constitution-Based Dev (Spec Kit) - 4 hours
14. Cross-Artifact Analysis (Spec Kit) - 4 hours

### Phase 4: Memory (HIGH) - 32 hours
15. Knowledge Graph (LlamaIndex) - 12 hours
16. Entity Extraction (LlamaIndex) - 8 hours
17. Relationship Tracking (LlamaIndex) - 8 hours
18. Graph Query Engine (LlamaIndex) - 8 hours

### Phase 5: Developer Experience (MEDIUM) - 24 hours
19. Real-Time Monitoring (Cline) - 4 hours
20. Command Palette - 2 hours (study Cursor concepts)
21. Git-Aware File System (Aider) - 6 hours
22. Streaming Output (LangChain) - 4 hours
23. Diff Previews - 2 hours (study Cursor concepts)
24. Keyboard Shortcuts - 2 hours (study Cursor concepts)

### Phase 6: Advanced (LOWER) - 32 hours
25. Function Schema Gen (OpenAI Agents SDK) - 4 hours
26. Agent Evaluation (OpenAI Agents SDK) - 8 hours
27. Multi-Model Support (MetaGPT) - 6 hours
28. Tool Auto-Discovery (OpenAI Agents SDK) - 6 hours
29. Workflow Visualizer - 12 hours (study Windsurf)
30. Round-Based Execution (MetaGPT) - 6 hours

**Total Study Time:** 150 hours (18.75 days)
**Total Implementation Time:** 322 hours (40.25 days)
**Grand Total:** 472 hours (59 days)

---

## Success Metrics: How to Measure Your Progress

### Phase 1 Completion Criteria
✅ Autonomous loop can run for 1 hour without intervention
✅ Circuit breaker activates on stagnation (3+ loops without progress)
✅ Exit detection accurately identifies completion (≥95% confidence)
✅ Context manager supports 5+ simultaneous tenants
✅ Agent handoffs preserve context correctly

### Phase 2 Completion Criteria
✅ Tasks support 3+ levels of nesting
✅ Workflows can loop back 2+ times with state preservation
✅ Agents can handoff to 3+ other agents dynamically
✅ Multi-agent conversations support 5+ participants
✅ Cyclic workflows have configurable retry limits

### Phase 3 Completion Criteria
✅ Spec creation follows structured workflow (5 steps)
✅ Sequential questioning covers 5+ areas (completeness, clarity, etc.)
✅ Task breakdown generates 10+ subtasks from requirement
✅ Constitution exists and guides all AI decisions
✅ Cross-artifact analysis validates consistency

### Phase 4 Completion Criteria
✅ Knowledge graph contains 1000+ entities from your research
✅ Entity extraction accuracy ≥ 80%
✅ Relationship tracking captures 5+ relationship types
✅ Graph queries complete in <1 second for 10k entities
✅ Hybrid search (graph + semantic) improves results by 30%

### Phase 5 Completion Criteria
✅ Real-time monitoring updates every 1-2 seconds
✅ Command palette responds <100ms for 20+ commands
✅ Git-aware operations understand branch, status, staged files
✅ Streaming output displays tokens in real-time
✅ Diff previews show changes before applying

---

## Summary

You now have:

1. **Complete Feature Matrix** (30 features)
2. **Best Implementations** identified with code links
3. **Quick Study Guides** for 10 critical features
4. **Study Strategy** (150 hours)
5. **Implementation Roadmap** (322 hours)
6. **Success Metrics** for each phase

**Start with Week 1 Quick Wins** (32 hours) to make Blackbox3 much more robust!

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-01-15
**Version:** 1.0
**Next:** Start studying and implementing!

