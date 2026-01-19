# Three-Tier Hierarchical Memory System

**ID:** `2026-01-19-three-tier-hierarchical-memory-system`
**Created:** 2026-01-19
**Status:** ✅ PARTIALLY IMPLEMENTED
**Category:** Memory
**Priority:** Critical
**Updated:** 2026-01-19

---

## Summary

✅ **PARTIALLY IMPLEMENTED** - BlackBox5 has a solid two-tier memory system (WorkingMemory + PersistentMemory) with consolidation, importance scoring, and semantic retrieval. Upgrading to three-tier hierarchy requires adding a dedicated SummaryTier layer.

**Current State:** 60-70% of research recommendations implemented
**Remaining Work:** Add SummaryTier layer (1 week effort)

---

## Problem Statement

**Previous Issue:**
- BlackBox5 lacked hierarchical memory organization
- No automated memory consolidation
- No cross-session persistence ✅ SOLVED
- No intelligent memory retrieval ✅ SOLVED
- No memory importance scoring ✅ SOLVED

**Current State:**
✅ WorkingMemory (in-memory, 100 messages)
✅ PersistentMemory (SQLite-based, unlimited)
✅ MemoryConsolidation (automatic, LLM-based)
✅ ImportanceScoring (multi-factor)
✅ Semantic retrieval (via external service)
✅ EpisodicMemory (episode linking)
✅ LLMLingua compression (20-90% cost reduction)

**Gap:** Missing dedicated SummaryTier layer (research recommends 3 tiers)

---

## Current Implementation

### ✅ What Exists (Two-Tier Architecture)

```
┌─────────────────────────────────────────────────────────┐
│              TIER 1: WORKING MEMORY                     │
│  - Stores last 100 messages (in-memory)               │
│  - Fast deque-based storage with sliding window       │
│  - Thread-safe with locking                           │
│  - Consolidates when > 10 messages (TUNED ✅)         │
│  - Size: ~5K tokens                                    │
└────────────────┬───────────────────────────────────────┘
                 │ Consolidation Trigger
                 ↓
┌─────────────────────────────────────────────────────────┐
│              TIER 2: PERSISTENT MEMORY                  │
│  - SQLite-based long-term storage                      │
│  - Message deduplication via hashing                   │
│  - Task and agent filtering                            │
│  - Keyword search (can be upgraded to vector)         │
│  - Size: Unlimited                                     │
└─────────────────────────────────────────────────────────┘
```

**Files:**
- `.blackbox5/2-engine/03-knowledge/storage/ProductionMemorySystem.py` (372 lines)
- `.blackbox5/2-engine/03-knowledge/storage/EnhancedProductionMemorySystem.py` (944 lines)
- `.blackbox5/2-engine/03-knowledge/storage/consolidation/MemoryConsolidation.py` (438 lines)

### ❌ What's Missing (Three-Tier Research Recommendation)

```
┌─────────────────────────────────────────────────────────┐
│              TIER 1: BUFFER (WORKING)                  │
│  - Stores last 50 messages                              │
│  - Fast in-memory storage                               │
│  - Consolidates every 10 messages ✅ (TUNED)           │
│  - Size: ~5K tokens                                     │
└────────────────┬───────────────────────────────────────┘
                 │ Consolidation Trigger
                 ↓
┌─────────────────────────────────────────────────────────┐
│                 TIER 2: SUMMARIES ⚠️ MISSING           │
│  - Stores last 10 consolidation cycles                 │
│  - LLM-summarized conversations                         │
│  - Extracts key information, entities, decisions        │
│  - Size: ~10K tokens                                    │
└────────────────┬───────────────────────────────────────┘
                 │ Extraction Trigger
                 ↓
┌─────────────────────────────────────────────────────────┐
│               TIER 3: LONG-TERM (PERSISTENT)            │
│  - SQLite storage (upgrade to PostgreSQL + pgvector)   │
│  - Semantic search via embeddings ⚠️ MISSING            │
│  - Metadata filtering (time, importance, type) ✅      │
│  - Cross-session persistent ✅                          │
│  - Size: Unlimited (managed by importance scoring)    │
└─────────────────────────────────────────────────────────┘
```

---

## Proposed Solution (Upgrade Path)

**High-Level Approach:**

Add a dedicated SummaryTier layer between WorkingMemory and PersistentMemory.

**Changes Required:**

1. **Create SummaryTier Class** (3-5 hours)
   ```python
   class SummaryTier:
       """
       Dedicated storage for consolidated summaries.

       - Stores last 10 consolidation cycles
       - LLM-summarized conversations
       - Extracts entities, decisions, outcomes
       - Faster access than full persistent storage
       """

       def __init__(self, max_summaries=10):
           self.summaries: deque[ConsolidatedMessage] = deque(maxlen=max_summaries)

       def add_summary(self, summary: ConsolidatedMessage):
           self.summaries.append(summary)

       def get_summaries(self, limit=None) -> List[ConsolidatedMessage]:
           return list(self.summaries)[-limit:] if limit else list(self.summaries)
   ```

2. **Update Consolidation Process** (2-3 hours)
   - Current: Consolidates in place in WorkingMemory
   - New: Store consolidated summaries in SummaryTier
   - Keep last 10 summaries in SummaryTier
   - Move older summaries to PersistentMemory

3. **Update Memory Retrieval** (2-3 hours)
   - Check all three tiers during retrieval
   - Priority: WorkingMemory → SummaryTier → PersistentMemory
   - Deduplicate across tiers

4. **Update ConsolidationConfig** (1 hour)
   - Already tuned: max_messages=10, recent_keep=10 ✅
   - No changes needed

**Effort Breakdown:**
- SummaryTier class: 3-5 hours
- Update consolidation: 2-3 hours
- Update retrieval: 2-3 hours
- Testing: 2-3 hours
- **Total: 1-2 days**

---

## First Principles Analysis

**Core Question:**
What is the minimum memory architecture required for agents to maintain coherent long-term context?

**Hypothesis (Validated by Research):**
A three-tier hierarchy (buffer → summaries → long-term) balances:
- Performance (fast access to recent context)
- Efficiency (compressed mid-term storage)
- Persistence (unlimited long-term storage)

**Current Implementation:**
Two-tier hierarchy (working → persistent) works but lacks dedicated summary layer.

**Validation:**
- ✅ Two-tier works well for many use cases
- ✅ Research shows three-tier provides 15-20% better token efficiency
- ✅ SummaryTier is the only missing piece

---

## Success Criteria

### ✅ Already Achieved

- [x] Tier 1 (WorkingMemory) stores last 100 messages with < 50ms access time
- [x] Automated consolidation triggers every 10 messages ✅ (TUNED)
- [x] Importance scoring enables smart pruning
- [x] Cross-session persistence maintained
- [x] Semantic retrieval implemented (via external service)
- [x] Memory consolidation with LLM summarization
- [x] Token reduction: 20-30% (LLMLingua compression)

### ❌ Remaining Work

- [ ] Tier 2 (SummaryTier) stores last 10 consolidation cycles
- [ ] Tier 3 (PersistentMemory) upgraded to PostgreSQL + pgvector
- [ ] Hybrid retrieval with vector embeddings (70% vector + 30% metadata)
- [ ] Enhanced importance scoring (frequency + semantic + user feedback)

---

## Implementation Roadmap

### Phase 1: SummaryTier (1-2 days) 🚀 **HIGH PRIORITY**

**Tasks:**
1. Create SummaryTier class in `SummaryTier.py`
2. Update MemoryConsolidation to use SummaryTier
3. Update EnhancedProductionMemorySystem retrieval logic
4. Add tests for three-tier retrieval
5. Update documentation

**Deliverable:** Three-tier memory hierarchy

### Phase 2: Vector Embeddings (1-2 weeks) 🎯 **HIGH PRIORITY**

**Tasks:**
1. Migrate from SQLite to PostgreSQL + pgvector
2. Add embedding column to messages table
3. Integrate OpenAI text-embedding-3-small
4. Implement vector similarity search
5. Update retrieval to use vector + metadata (70/30)

**Deliverable:** Semantic search with vector embeddings

### Phase 3: Enhanced Importance Scoring (3-5 days) 📊 **MEDIUM PRIORITY**

**Tasks:**
1. Add frequency tracking (access count per message)
2. Add semantic relevance score (via embeddings)
3. Add user feedback mechanism (optional ratings)
4. Update formula: 0.4×Recency + 0.3×Frequency + 0.2×Semantic + 0.1×User
5. Validate against baseline

**Deliverable:** Production-grade importance scoring

---

## Domain Areas

- [x] Memory
- [ ] Infrastructure (PostgreSQL migration)
- [ ] Testing

---

## Category

- [x] Feature - New capability
- [ ] Refactor - Improving existing code

---

## Estimated Complexity

- [x] Medium (1-2 weeks) - REMAINING WORK
  - SummaryTier: 1-2 days
  - Vector embeddings: 1-2 weeks
  - Enhanced importance: 3-5 days

---

## Dependencies

**Blocks:**
- GraphRAG integration (depends on three-tier memory foundation)
- Advanced semantic search (depends on vector embeddings)

**Blocked By:**
- None - can start immediately

**Related:**
- Memory Compression System ✅ COMPLETE
- Vector Database Evaluation (next priority)
- Importance Scoring Enhancement (partially implemented)

---

## Risks & Concerns

**Low Risk:**
1. **SummaryTier complexity** - Low risk, straightforward implementation
   - Mitigation: Design follows existing consolidation pattern

2. **Migration effort** - Low risk, incremental changes
   - Mitigation: Backward compatible, can run in parallel

3. **Performance impact** - Low risk, SummaryTier improves efficiency
   - Mitigation: In-memory storage, fast access

---

## Alternatives Considered

1. **Keep two-tier system** - Rejected
   - Works but suboptimal token efficiency
   - Research shows three-tier provides 15-20% improvement

2. **Use GraphRAG instead** - Complementary, not replacement
   - GraphRAG for complex reasoning
   - Three-tier memory for token efficiency
   - Can coexist

---

## Open Questions

1. **Summary retention** - Keep 10 summaries in SummaryTier?
   - **Plan:** Test with 5, 10, 20 summaries
   - **Validation:** Measure retrieval quality vs storage

2. **PostgreSQL migration** - When to migrate from SQLite?
   - **Plan:** Migrate when adding vector embeddings (Phase 2)
   - **Validation:** Performance benchmark

3. **Importance weights** - Current formula vs research formula?
   - **Plan:** Evaluate current implementation
   - **Validation:** A/B test different weight combinations

---

## Next Steps

**Immediate (This Week):**
1. ✅ Review existing implementation
2. ✅ Tune consolidation triggers (COMPLETED)
3. 🚀 Create SummaryTier class (1-2 days)
4. 📝 Update documentation

**Short-term (Next 2 Weeks):**
5. 🎯 Migrate to PostgreSQL + pgvector
6. 🔍 Implement vector embeddings
7. 🧪 Write tests for three-tier retrieval

**Medium-term (Next Month):**
8. 📊 Enhanced importance scoring
9. 📈 Performance benchmarking
10. 📚 Update documentation

---

## Metadata

**Proposed By:** Claude (Based on comprehensive research)
**Updated By:** Claude Code (Gap analysis)
**Tags:** memory, hierarchical, consolidation, three-tier
**Related Issues:**
- Memory Compression ✅ COMPLETE
- Vector Embeddings + pgvector Migration (new proposal needed)
- GraphRAG Integration (depends on this)
**Reference Links:**
- Research: `.blackbox5/roadmap/01-research/memory-context/RESEARCH-SUMMARY.md`
- Gap Analysis: `.blackbox5/roadmap/01-research/memory-context/MEMORY-SYSTEM-GAP-ANALYSIS.md`
- Implementation: `.blackbox5/2-engine/03-knowledge/storage/`

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-19 | Initial proposal (based on research) | Claude |
| 2026-01-19 | ✅ UPDATED: Partially implemented (60-70% complete) | Claude Code |
| 2026-01-19 | Added: Gap analysis and upgrade path | Claude Code |
| 2026-01-19 | Tuned: Consolidation triggers (every 10 messages) | Claude Code |
| 2026-01-19 | Clarified: Remaining work (SummaryTier + vector embeddings) | Claude Code |

---

## Conclusion

✅ **STRONG FOUNDATION** - BlackBox5 has a solid two-tier memory system with 60-70% of research recommendations already implemented.

**Remaining Work:**
1. Add SummaryTier layer (1-2 days)
2. Migrate to PostgreSQL + pgvector (1 week)
3. Implement vector embeddings (3-5 days)
4. Enhanced importance scoring (3-5 days)

**Total Effort:** 2-3 weeks to match 90% of research recommendations

**Recommendation:** Start with SummaryTier implementation (highest ROI, lowest effort).

---

**Status:** Partially Implemented (60-70% complete)
**Next Priority:** Create SummaryTier class
**Time to Complete:** 2-3 weeks
