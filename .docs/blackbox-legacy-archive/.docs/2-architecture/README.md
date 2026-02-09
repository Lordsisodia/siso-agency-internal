# Blackbox4 Architecture Documentation

**Last Updated**: 2026-01-15
**Status**: Complete

---

## Overview

This section contains all architecture documentation for Blackbox4, including system design, component integration, and technical specifications.

---

## Quick Navigation

### 📋 Main Documents
- **[BLACKBOX4-README.md](BLACKBOX4-README.md)** - Main overview and feature summary (648 lines)
- **[ARCHITECTURE-FINAL.md](ARCHITECTURE-FINAL.md)** - Final architecture design with numbered folder structure
- **[COMPLETE-STRUCTURE.md](COMPLETE-STRUCTURE.md)** - Complete directory structure reference
- **[BLACKBOX3-REFERENCE-STRUCTURE.md](BLACKBOX3-REFERENCE-STRUCTURE.md)** - Blackbox3 reference for comparison

### 🎨 Design Documents
Located in [`design/`](design/):
- Architecture evolution and planning documents
- Design decisions and rationale
- System architecture diagrams

### 🔧 Components
Located in [`components/`](components/):
- Orchestrator Protocol
- Individual component specifications
- Integration patterns

---

## Key Architecture Highlights

### System Structure
```
.blackbox4/
├── .config/              # System configuration
├── .docs/                # ALL documentation
├── .memory/              # 3-tier memory system
├── .plans/               # Active project plans
├── .runtime/             # Runtime/state data
├── 1-agents/             # ALL agent definitions
├── 2-frameworks/         # Framework patterns & templates
├── 3-modules/            # Domain modules
├── 4-scripts/            # All executable scripts
├── 5-templates/          # Document/file templates
├── 6-tools/              # Helper utilities
├── 7-workspace/          # Active workspace
└── 8-testing/            # Testing infrastructure
```

### Key Improvements Over Blackbox3
1. **65% reduction in agent folders** (17+ → 6 categories)
2. **Numbered folders** (1-8) for clear mental model
3. **Max 7 items per level** (reduced cognitive load)
4. **Empty folders eliminated** (cleaner navigation)
5. **Documentation reorganized** (6 numbered sections)

### Integration Features
- Ralph Autonomous Engine (complete runtime)
- Circuit Breaker (309 lines, working)
- Exit Detection Engine (249 lines)
- Response Analyzer (4.5KB)
- Agent Handoff Protocol (245 lines)
- BMAD 4-Phase Methodology
- Oh-My-OpenCode Integration (MCP, LSP, Enhanced Agents)

---

## Quick Start

1. **New to Blackbox4?** Start with [BLACKBOX4-README.md](BLACKBOX4-README.md)
2. **Understanding the structure?** See [COMPLETE-STRUCTURE.md](COMPLETE-STRUCTURE.md)
3. **Implementation details?** Check [ARCHITECTURE-FINAL.md](ARCHITECTURE-FINAL.md)
4. **Component specs?** Look in [components/](components/)

---

## Related Documentation

- **[Getting Started](../1-getting-started/)** - User guides and quick start
- **[Frameworks](../3-frameworks/)** - Framework-specific documentation
- **[Implementation](../4-implementation/)** - Implementation guides and strategies
- **[Reference](../2-reference/)** - Technical reference materials

---

**Status**: ✅ Architecture Complete and Documented
**Next**: See [Getting Started](../1-getting-started/) for usage guides
