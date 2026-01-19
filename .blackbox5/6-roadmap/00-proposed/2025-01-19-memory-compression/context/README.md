# Context Template for Memory Compression

This directory contains context and auxiliary information for the Memory Compression System roadmap item.

## Purpose

This context directory provides:
1. **Agent Instructions** - Prompts and guidance for agents working on this item
2. **Research Materials** - Supporting documentation and references
3. **Design Artifacts** - Diagrams, schemas, and technical notes
4. **Testing Context** - Test scenarios and validation criteria

---

## Agent Instructions

### When Working on This Item

**For Research Agents:**
- Focus on DeerFlow research documentation
- Investigate memory compression algorithms
- Compare different importance scoring approaches
- Document findings in `01-research/proposal.md`

**For Design Agents:**
- Review existing memory system architecture
- Design compression pipeline components
- Define data structures for compressed memory
- Create technical design in `02-design/proposal.md`

**For Implementation Agents:**
- Follow the implementation plan in `03-planned/proposal.md`
- Update progress in `04-active/proposal.md`
- Track metrics and blockers
- Document completion in `05-completed/proposal.md`

---

## Key Context

### Problem
BlackBox5 agents have no memory compression, leading to excessive token usage and potential context overflow.

### Solution
Multi-layered compression system with:
- Importance scoring
- Multiple compression strategies
- Retrievable compressed memory
- Configurable thresholds

### Success Criteria
- 60-80% token reduction
- 90%+ reasoning effectiveness maintained
- Searchable compressed memory
- Zero data loss

---

## Related Systems

- `.blackbox5/engine/memory/` - Memory system implementation
- `.blackbox5/engine/core/token_compressor.py` - Existing token compression
- `BLACKBOX5-RESEARCH-CATEGORIES.md` - Memory & Context category (18% weight)

---

## Quick Reference

**Item ID:** 2025-01-19-memory-compression
**Current Stage:** 00-proposed
**Priority:** High
**Category:** Memory
**Complexity:** Medium (1-2 weeks)

---

## File Structure

```
00-proposed/2025-01-19-memory-compression/
├── proposal.md           # Main proposal document
├── context/              # This directory
│   ├── README.md         # This file
│   ├── agents/           # Agent-specific instructions
│   ├── research/         # Research materials
│   ├── design/           # Design artifacts
│   └── testing/          # Test scenarios
└── .manifest.yml         # Item metadata (auto-generated)
```

---

## Last Updated

2025-01-19 - Initial context structure created
