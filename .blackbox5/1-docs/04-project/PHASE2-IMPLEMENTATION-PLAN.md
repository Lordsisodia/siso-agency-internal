# Phase 2 Implementation Plan - BlackBox 5

**Date:** 2026-01-19
**Status:** Ready to Begin
**Estimated Time:** 2-3 weeks

---

## Current State (Post-Phase 1)

### ✅ Complete (Phase 1)
- **Kill Switch** - Emergency shutdown (570 lines)
- **Safe Mode** - Degraded operation (480 lines)
- **Constitutional Classifiers** - Content filtering (650 lines)
- **Testing** - 35 tests, 88% pass rate
- **Documentation** - Complete guides

### ✅ Already Built (Previous Work)
- **Core Engine** - Multi-agent orchestration (156K+ lines)
- **Skills System** - 52 skills imported
- **Circuit Breakers** - Production ready (724 lines)
- **3 Agents** - Developer, Analyst, Architect
- **Memory Systems** - Partial implementation
- **Integrations** - GitHub, Notion, Supabase, etc.

---

## Phase 2 Implementation Plan

### Task 1: Fix CLI Integration ⚡ Priority: HIGH
**Effort:** 3-5 days
**Impact:** Enables command-line usage

**What's Needed:**
1. Create `interface/cli/bb5.py` with all commands
2. Create `interface/api/main.py` for REST API
3. Fix root `bb5` script path
4. Implement all CLI commands:
   - `bb5 ask` - Process requests
   - `bb5 agents` - List agents
   - `bb5 inspect` - Agent details
   - `bb5 skills` - List skills
   - `bb5 guide` - Find guides
5. Add safety integration to all commands

**Files to Create:**
```
.blackbox5/2-engine/01-core/
├── interface/
│   ├── __init__.py
│   ├── cli/
│   │   ├── __init__.py
│   │   └── bb5.py          # Main CLI (300 lines)
│   └── api/
│       ├── __init__.py
│       └── main.py          # REST API (400 lines)
```

**Success Criteria:**
- ✅ `./bb5 ask "What is 2+2?"` works
- ✅ `./bb5 agents` lists all agents
- ✅ `./bb5 skills` lists all skills
- ✅ Safety checks integrated

---

### Task 2: Implement Remaining 6 Agents 🤖 Priority: HIGH
**Effort:** 1-2 weeks
**Impact:** Completes agent ecosystem

**Remaining Agents (from existing YAML specs):**
1. **ProductManagerAgent** - Product management
2. **UXDesignerAgent** - UX design
3. **TechWriterAgent** - Technical writing
4. **TEAAgent** - Test engineering
5. **ScrumMasterAgent** - Sprint management
6. **QuickFlowSoloDevAgent** - Quick development

**Location:**
```
.blackbox5/2-engine/02-agents/implementations/
├── 04-specialists/
│   ├── ProductManagerAgent.py
│   ├── UXDesignerAgent.py
│   ├── TechWriterAgent.py
│   ├── TEAAgent.py
│   ├── ScrumMasterAgent.py
│   └── QuickFlowSoloDevAgent.py
```

**Implementation Pattern:**
```python
# Each agent follows the same pattern as existing 3
class ProductManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="product-manager",
            role="Product Manager",
            category="specialists",
            description="Product management and requirements",
            temperature=0.7
        )
```

**Success Criteria:**
- ✅ All 6 agents implemented
- ✅ Each agent tested individually
- ✅ Multi-agent workflows tested
- ✅ Total of 9 working agents

---

### Task 3: Wire Up AgentMemory 💾 Priority: MEDIUM
**Effort:** 1 week
**Impact:** Context persistence across sessions

**What's Needed:**
1. Integrate existing memory components
2. Wire up AgentMemory to agents
3. Connect working/archival/extended memory
4. Test context persistence
5. Add memory to CLI/API

**Memory Components (Already Exist):**
```
.blackbox5/2-engine/03-knowledge/memory/memory/
├── AgentMemory.py              # Agent memory system
├── extended/
│   ├── services/
│   │   ├── semantic_search.py
│   │   ├── vector_store.py
│   │   └── hybrid_embedder.py
│   └── services/test_memory_system.py
```

**Integration Points:**
1. **Agent Memory** - Session persistence
2. **Working Memory** - Short-term context
3. **Archival Memory** - Long-term storage
4. **Extended Memory** - Vector search

**Success Criteria:**
- ✅ Agents remember previous interactions
- ✅ Context persists across sessions
- ✅ Vector search works
- ✅ Memory accessible via CLI/API

---

## Implementation Order

### Week 1: CLI + Memory
**Days 1-3:** Fix CLI Integration
- Create interface structure
- Implement bb5.py with all commands
- Fix root bb5 script
- Test CLI end-to-end

**Days 4-5:** Wire Up AgentMemory
- Integrate memory components
- Connect to agents
- Test persistence

### Week 2: Agents
**Days 1-3:** Implement 3 agents
- ProductManagerAgent
- UXDesignerAgent
- TechWriterAgent

**Days 4-5:** Implement 3 agents
- TEAAgent
- ScrumMasterAgent
- QuickFlowSoloDevAgent

### Week 3: Integration & Testing
**Days 1-2:** Integration testing
- End-to-end workflows
- Multi-agent coordination
- CLI + API + Memory

**Days 3-4:** Polish & Documentation
- Update guides
- Fix bugs
- Performance tuning

**Day 5:** Final verification

---

## Quick Start for Implementation

### 1. Create CLI Structure
```bash
mkdir -p .blackbox5/2-engine/01-core/interface/cli
mkdir -p .blackbox5/2-engine/01-core/interface/api
```

### 2. Implement bb5 CLI
```python
# .blackbox5/2-engine/01-core/interface/cli/bb5.py
import click
from safety.kill_switch import get_kill_switch
from safety.constitutional_classifier import get_classifier, ContentType

@click.group()
def cli():
    """BlackBox 5 CLI"""
    pass

@cli.command()
@click.argument('message')
def ask(message):
    """Ask BlackBox 5 a question"""
    # Safety checks
    ks = get_kill_switch()
    if not ks.is_operational():
        click.echo(f"❌ Kill switch triggered: {ks.trigger_reason.value}")
        return

    classifier = get_classifier()
    result = classifier.check_input(message, ContentType.USER_INPUT)
    if not result.safe:
        click.echo(f"❌ Input blocked: {result.violation.reason}")
        return

    # Process request (TODO: integrate with actual engine)
    click.echo(f"Processing: {message}")

# Add more commands...
```

### 3. Fix Root bb5 Script
```python
# ./bb5
import sys
from pathlib import Path

# Correct path
cli_path = Path(__file__).parent / ".blackbox5" / "2-engine" / "01-core" / "interface" / "cli" / "bb5.py"

# Execute
if __name__ == "__main__":
    import subprocess
    result = subprocess.run([sys.executable, str(cli_path)] + sys.argv[1:])
    sys.exit(result.returncode)
```

---

## Success Metrics

### Phase 2 Complete When:
- ✅ CLI works: `./bb5 ask "test"` returns response
- ✅ All 9 agents implemented and tested
- ✅ Memory system integrated and working
- ✅ REST API functional
- ✅ Safety integrated throughout
- ✅ Documentation updated

### Performance Targets:
- CLI response time: < 2 seconds
- Agent execution: < 5 seconds
- Memory retrieval: < 100ms
- API response: < 1 second

---

## Dependencies

### Required Components:
- ✅ Safety system (Phase 1) - COMPLETE
- ✅ Core engine - EXISTS
- ✅ BaseAgent class - EXISTS
- ✅ Skills system - EXISTS
- ✅ Memory components - EXIST (need integration)

### External Dependencies:
- Click (CLI framework)
- Flask/FastAPI (REST API)
- Redis (Event bus) - optional for now
- GLM-4.7 (LLM) - already configured

---

## Next Steps After Phase 2

### Phase 3: Production Readiness (Week 5-6)
1. Comprehensive testing
2. GUI basic interface
3. Integration verification
4. Performance optimization

### Phase 4: Enhancement (Optional, Week 7-8)
1. Advanced GUI
2. Additional safety features
3. Performance tuning
4. Monitoring and observability

---

**Status:** Ready to begin Phase 2
**Estimated Time to Full Functionality:** 3-4 weeks total
**Current Progress:** Phase 1 ✅ COMPLETE → Phase 2 🔄 READY TO START

---

**Last Updated:** 2026-01-19
**Maintained By:** BlackBox 5 Core Team
