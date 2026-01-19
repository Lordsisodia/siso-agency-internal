# Design Agent Instructions

**For:** Design Agent working on Memory Compression System
**Item ID:** 2025-01-19-memory-compression
**Current Stage:** 01-research → 02-design

---

## Your Mission

Create a comprehensive technical design for the memory compression system based on research findings.

---

## Design Requirements

### Must Address

1. **Importance Scoring System**
   - Algorithm for scoring memory items
   - Configuration for tuning weights
   - Real-time scoring vs batch scoring

2. **Compression Pipeline**
   - How items flow through compression
   - When compression is triggered
   - How compression is applied

3. **Storage Architecture**
   - Where compressed items are stored
   - How full items are retained
   - Indexing for retrieval

4. **Retrieval Mechanism**
   - How compressed items are searched
   - How full items are expanded
   - Integration with existing memory queries

5. **Integration Points**
   - How this integrates with `.blackbox5/engine/memory/`
   - How agents use compressed memory
   - Backward compatibility

---

## Design Deliverables

### 1. Architecture Diagram

Create a diagram showing:
- Components and their relationships
- Data flow through the system
- Integration points with existing systems

**Location:** `context/design/architecture.md`

### 2. Data Models

Define schemas for:
- Compressed memory item
- Importance score metadata
- Compression metadata (strategy, ratio, timestamp)
- Retrieval index

**Location:** `context/design/data-models.md`

### 3. API/Interface Design

Define interfaces for:
- Scoring memory items
- Compressing memory
- Retrieving compressed memory
- Expanding compressed items
- Configuring compression parameters

**Location:** `context/design/api-design.md`

### 4. Algorithm Specifications

Specify:
- Importance scoring algorithm
- Compression strategy selection
- Retrieval ranking algorithm

**Location:** `context/design/algorithms.md`

### 5. Testing Strategy

Define:
- Unit test approach for each component
- Integration test scenarios
- Performance benchmarks
- Success criteria

**Location:** `context/testing/test-plan.md`

---

## Design Document Structure

Your main design document (`02-design/proposal.md`) should include:

1. **Overview** - High-level architecture
2. **Components** - Detailed component design
3. **Data Models** - Schemas and structures
4. **API Design** - Interfaces and signatures
5. **Algorithms** - Key algorithms specified
6. **Security** - Safety considerations
7. **Performance** - Expected performance characteristics
8. **Migration** - How to deploy without disruption
9. **Alternatives Considered** - Why this design over others

---

## Integration Context

### Existing Memory System

**Location:** `.blackbox5/engine/memory/`

**Key Files:**
- `ProductionMemorySystem.py` - Main memory implementation
- `EnhancedProductionMemorySystem.py` - Enhanced version
- `consolidation/` - Memory consolidation logic

**Design Question:** How does compression fit with existing consolidation?

### Existing Token Compression

**Location:** `.blackbox5/engine/core/token_compressor.py`

**Design Question:** Can we leverage or integrate with existing token compression?

### RAG/Brain System

**Location:** `.blackbox5/engine/knowledge/`

**Design Question:** How does compressed memory interact with vector search?

---

## Design Constraints

1. **Time:** Implementation must fit in 1-2 weeks
2. **Compatibility:** Must not break existing memory system
3. **Performance:** Compression should not add significant latency
4. **Configurability:** Users must be able to tune compression
5. **Testability:** Design must be testable in isolation

---

## Success Criteria

Your design is complete when:
- [ ] All components are specified with clear responsibilities
- [ ] Data models are defined with schemas
- [ ] APIs are designed with signatures and examples
- [ ] Algorithms are specified in detail
- [ ] Integration points are clearly defined
- [ ] Testing strategy is comprehensive
- [ ] Performance characteristics are estimated
- [ ] Migration path is defined

---

## Design Principles

1. **Simplicity First** - Start with the simplest working solution
2. **Incremental** - Design for phased implementation
3. **Observable** - Make compression visible and debuggable
4. **Configurable** - Allow tuning without code changes
5. **Reversible** - Design allows rolling back compression

---

## Notes

- Use existing BlackBox5 patterns where possible
- Consider both single-agent and multi-agent scenarios
- Think about how this will scale
- Document trade-offs explicitly

---

## Questions?

If you need clarification on design scope or requirements, ask before proceeding.

**Last Updated:** 2025-01-19
