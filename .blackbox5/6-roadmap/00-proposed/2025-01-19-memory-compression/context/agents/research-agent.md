# Research Agent Instructions

**For:** Research Agent working on Memory Compression System
**Item ID:** 2025-01-19-memory-compression
**Current Stage:** 00-proposed → 01-research

---

## Your Mission

Conduct comprehensive research on memory compression for autonomous agents, focusing on:
1. DeerFlow research and approaches
2. Memory importance scoring algorithms
3. Compression strategies and their effectiveness
4. Retrieval mechanisms for compressed memory

---

## Research Areas

### 1. DeerFlow Research

**Location:** `.blackbox5/` or external documentation

**Key Questions:**
- What compression algorithms does DeerFlow use?
- How does DeerFlow measure memory importance?
- What compression ratios does DeerFlow achieve?
- How does DeerFlow handle compressed memory retrieval?

**Deliverables:**
- Summary of DeerFlow compression approach
- Applicable algorithms and techniques
- Performance benchmarks (if available)

---

### 2. Importance Scoring

**Research Question:** How do we determine which memory items are important?

**Approaches to Investigate:**
- **Recency scoring** - Recent items weighted more heavily
- **Reference counting** - Items referenced more frequently are important
- **Semantic analysis** - Content-based importance detection
- **Manual tagging** - User-specified importance levels
- **Hybrid approaches** - Combining multiple signals

**Deliverables:**
- Comparison of importance scoring approaches
- Recommended algorithm for BlackBox5
- Pseudocode or implementation sketch

---

### 3. Compression Strategies

**Research Question:** What compression methods work best for different memory types?

**Strategies to Investigate:**
- **Summarization** - LLM-based summarization of long conversations
- **Key extraction** - Extract only key points/entities
- **Semantic clustering** - Group similar items, keep representatives
- **Archival** - Move old items to cold storage
- **Lossless compression** - Code-based compression (for code-heavy context)

**Deliverables:**
- Matrix of strategies vs memory types
- Recommended strategy per memory type
- Expected compression ratios

---

### 4. Retrieval Mechanisms

**Research Question:** How do we make compressed memory searchable and retrievable?

**Approaches to Investigate:**
- **Vector embeddings** - Search compressed items by semantic similarity
- **Keyword indexing** - Maintain searchable index
- **Summarized snippets** - Keep brief summaries for browsing
- **On-demand expansion** - Retrieve full context when needed
- **Hierarchical storage** - Fast access to recent, slower to old

**Deliverables:**
- Recommended retrieval mechanism
- Trade-off analysis (speed vs storage)
- Integration approach with existing memory system

---

## Research Sources

### Internal
- `.blackbox5/engine/memory/` - Current memory system
- `.blackbox5/engine/core/token_compressor.py` - Existing token compression
- `.blackbox5/engine/knowledge/` - Knowledge/RAG system

### External (if accessible)
- DeerFlow documentation and papers
- Academic papers on context window optimization
- Open source memory compression implementations
- LLM provider documentation on context management

---

## Expected Deliverables

When you move this to `02-design`, you should have:

1. **Research Summary** (`01-research/proposal.md`)
   - Key findings from each research area
   - Comparison of approaches
   - Recommended direction with rationale

2. **Data/Findings** (`context/research/`)
   - Raw research notes
   - Comparison matrices
   - Benchmark data
   - Relevant code snippets or algorithms

3. **Recommendations**
   - Clear recommendation on importance scoring
   - Clear recommendation on compression strategies
   - Clear recommendation on retrieval mechanism
   - Risk assessment and mitigation strategies

---

## Success Criteria

Your research is complete when:
- [ ] All 4 research areas have been investigated
- [ ] At least 3 different approaches have been compared for each area
- [ ] Clear recommendations are documented with rationale
- [ ] Risks and trade-offs are identified
- [ ] Next steps for design phase are clear

---

## Notes

- Focus on practical approaches that can be implemented in 1-2 weeks
- Prioritize approaches that work with BlackBox5's existing architecture
- Consider both immediate implementation and future enhancements
- Document assumptions and uncertainties

---

## Questions?

If you need clarification on research scope or priorities, ask before proceeding.

**Last Updated:** 2025-01-19
