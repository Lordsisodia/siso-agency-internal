# 📚 SISO Internal Documentation

> **Organized Documentation Hub** - Everything you need to understand the SISO Internal codebase

---

## 🎯 Quick Start

**New to the codebase?** Start here:
1. [`/README.md`](../README.md) - Project setup and deployment
2. [`/CODEBASE.md`](../CODEBASE.md) - Navigation guide
3. [`/AI-AGENT-GUIDE.md`](../AI-AGENT-GUIDE.md) - AI assistant rules
4. [`/COMPONENT-REGISTRY.md`](../COMPONENT-REGISTRY.md) - Component reference

---

## 📂 Documentation Structure

### 🏗️ `/architecture/`
**System design, technical decisions, and infrastructure planning**
- Database organization and migration plans
- Task architecture decomposition
- LifeLock architecture analysis and completion strategies
- Component duplication analysis
- Deployment and ecosystem strategies
- AI chat assistant design

### 📊 `/bmad-outputs/`
**BMAD methodology project outputs**
- Consolidation plans and architecture analysis
- Feature inventory and current state assessments
- Architecture fragmentation analysis
- Component consolidation plans
- State management plans
- Task reordering implementation plans
- Execution plans

### 🎓 `/bmad-methodology/`
**BMAD Method guides and documentation**
- User guide and implementation summary
- Core architecture and guiding principles
- Enhanced IDE development workflow
- Working in brownfield projects
- Partnership portal feature analysis

**Note:** For Claude-specific BMAD workflows, see `.bmad-core/methodology/`

### ✅ `/completion-reports/`
**Historical phase completion reports**
- BMAD completion report
- Phase 1, 2, 3 summaries
- Production readiness reports
- Testing and next steps

### 📖 `/guides/`
**Active development guides**
- AI development lessons
- AI navigation improvements
- LifeLock testing checklist
- Component deduplication stories

### 📝 `/planning/`
**Active planning documents**
- Morning routine enhancements and animations
- Timebox AI integration
- Ultimate AI agent implementation plan
- Feature specifications and backlogs

### 📋 `/prd/`
**Product requirement documents**
- Deep focus work PRD
- Light focus work integration PRD
- Nightly checkout integration PRD
- Epic 1: Architecture migration

### 🗄️ `/archive/`
**Resolved issues and historical debugging**
- Architecture fixes (resolved)
- Debug reports (completed)
- Deduplication analysis (superseded)
- Offline system fixes
- LifeLock tab padding fix
- Enhanced AI agent capabilities (completed)

### 💭 `/thought-dumps/`
**Daily brainstorming and idea capture**
- Raw thoughts and planning discussions
- Timestamped for reference
- Processed into actionable items

### 🎨 `/ui-ux/`
**Design and user experience documentation**
- Enhanced LifeLock design
- Mobile-first iPhone design plan

### 📄 `/siso-command-center/`, `/stories/`, `/testing/`
**Specialized project documentation**
- SISO command center documentation
- Story implementation details
- Testing guides and integration summaries

---

## 🔍 Finding Documentation

### By Topic
```bash
# Architecture decisions
docs/architecture/

# BMAD methodology guides (how to use BMAD)
docs/bmad-methodology/

# BMAD project outputs (what BMAD produced)
docs/bmad-outputs/

# Product requirements
docs/prd/

# Active planning documents
docs/planning/

# Development guides
docs/guides/

# Historical reports
docs/completion-reports/

# Resolved issues
docs/archive/
```

### By File Type
```bash
# All markdown files
find docs/ -name "*.md"

# Search by keyword
grep -r "keyword" docs/
```

---

## 🧠 BMAD Documentation

### Three Levels of BMAD Documentation

**1. Methodology Guides (Visible)** - `docs/bmad-methodology/`
How to use the BMAD Method:
- `user-guide.md` - Complete BMAD usage guide
- `core-architecture.md` - BMAD system architecture
- `GUIDING-PRINCIPLES.md` - BMAD philosophy
- `working-in-the-brownfield.md` - Brownfield project guide
- `enhanced-ide-development-workflow.md` - IDE integration

**2. Claude Workflows (Hidden)** - `.bmad-core/methodology/`
Claude-specific BMAD implementations:
- `BMAD-LITE.md` - Lightweight BMAD approach
- `BMAD-FULL.md` - Complete BMAD methodology
- `CLAUDE-*.md` - Claude-specific workflows

**3. Project Outputs (Visible)** - `docs/bmad-outputs/`
BMAD-generated plans and analysis for this project

---

## 📝 File Naming Conventions

### Standard Formats
- Architecture: `COMPONENT-NAME-ARCHITECTURE.md`
- Reports: `PHASE-X-COMPLETION-REPORT.md`
- Plans: `FEATURE-NAME-PLAN.md`
- Guides: `TOPIC-GUIDE.md`

### Historical Docs
- Thought dumps: `YYYY-MM-DD-topic-description.md`
- Meeting notes: `YYYY-MM-DD-meeting-type.md`

---

## 🎯 Documentation Best Practices

### For Contributors
1. **Check existing docs first** - Avoid duplication
2. **Use clear names** - Descriptive, not cryptic
3. **Update the index** - This README when adding new categories
4. **Archive completed work** - Move to `/archive/` when done

### For AI Assistants
1. **Check COMPONENT-REGISTRY.md** before creating components
2. **Reference architectural warnings** in `.bmad-core/architectural-warnings/`
3. **Follow patterns** documented in guides
4. **Update completion reports** when finishing phases

---

## 🔗 Related Documentation

- **Root Documentation**: Project-level docs in `/` (README, CLAUDE.md, etc.)
- **Pro Dev Feedback**: External architecture critiques in `/pro-dev-feedback/`
- **BMAD System**: Complete methodology system in `.bmad-core/`
- **BMAD Methodology**: Visible methodology guides in `/docs/bmad-methodology/`

---

## 📊 Documentation Stats

**Total Organization:**
- **12 organized directories** with clear purposes
- **6 essential files** in root (83% reduction from original 35)
- **60+ documentation files** properly categorized

**By Category:**
- **Architecture**: 12 files (system design, strategies, analysis)
- **BMAD Methodology**: 7 files (how to use BMAD Method)
- **BMAD Outputs**: 10 files (project-specific BMAD deliverables)
- **Planning**: 6 files (active feature planning)
- **PRD**: 4 files (product requirements)
- **Guides**: 4 files (development best practices)
- **Completion Reports**: 5 files (phase summaries)
- **Archive**: 6 files (resolved issues)

---

*Last Updated: 2025-10-04*
*Phase 1: Root cleanup - 35 files → 6 files*
*Phase 2: Complete reorganization - All docs categorized*
