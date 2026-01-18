# AI Knowledge Infrastructure - Quick Reference

**Purpose**: This file enables AI agents to quickly understand where every file is located in the SISO Internal documentation system.

## 🚀 Quick Start for AI Agents

**Start Here**: `.docs/01-overview/README.md`
**Complete Catalog**: `.docs/AI-KNOWLEDGE-CATALOG.json` (structured JSON for querying)

## 📁 Folder Structure (09 Numbered Categories)

```
.docs/
├── 01-overview/          # START HERE - Project intro & quick start
├── 02-architecture/      # System design, DB schema, patterns
├── 03-product/          # Features, domains, PRDs, planning
├── 04-integrations/     # AI agents, MCP servers, APIs
├── 05-development/      # Guides, workflows, tooling
├── 06-testing/          # Testing guides, QA, health checks
├── 07-operations/       # Deployment, migrations, monitoring
├── 08-knowledge/        # Research, feedback, stories, thought dumps
└── 09-archive/          # Legacy, deprecated, historical
```

## 🎯 Common AI Agent Queries

### "How do I get started?"
→ `.docs/01-overview/README.md`
→ `.docs/01-overview/00-project-overview.md`
→ `.docs/01-overview/01-quick-start/README.md`

### "What's the architecture?"
→ `.docs/02-architecture/README.md`
→ `.docs/02-architecture/01-system-design/`
→ `.docs/02-architecture/02-database/schema/SCHEMA-ANALYSIS.md`

### "How do I implement a feature?"
→ `.docs/03-product/01-domains/` (find your domain)
→ `.docs/05-development/03-guides/general/CODEBASE.md`
→ `.docs/05-development/03-guides/general/COMPONENT-REGISTRY.md`

### "How do I set up AI agents?"
→ `.docs/04-integrations/01-ai-agents/AGENTS.md`
→ `.docs/04-integrations/01-ai-agents/AGENT-BLACKBOX-INSTRUCTIONS.md`
→ `.docs/04-integrations/02-mcp/VIBE-KANBAN-MCP-SETUP-GUIDE.md`

### "Something's broken - help!"
→ `.docs/05-development/03-guides/fixes/EASY-FIXES-GUIDE.md`
→ `.docs/05-development/03-guides/qa/ERROR-ANALYSIS.md`
→ `.docs/06-testing/04-health-checks/CODEBASE-HEALTH-REPORT.md`

### "How do I test this?"
→ `.docs/06-testing/README.md`
→ `.docs/06-testing/01-testing-guide/TEST-MCP-FINAL.md`
→ `.docs/06-testing/02-qa-process/TESTING-QUICK-START.md`

### "How do I deploy?"
→ `.docs/05-development/01-getting-started/VERCEL_DEPLOYMENT_GUIDE.md`
→ `.docs/05-development/01-getting-started/GOLIVE_INSTRUCTIONS.md`
→ `.docs/07-operations/01-deployment/VERCEL-BUILD-ANALYSIS.md`

### "What's the migration status?"
→ `.docs/07-operations/04-migrations/phases/`
→ `.docs/07-operations/04-migrations/completion/PRODUCTION-READINESS-REPORT.md`
→ `.docs/06-testing/04-health-checks/VERIFICATION-SUMMARY.md`

### "What do users hate?"
→ `.docs/08-knowledge/02-feedback/feedback/pro-dev-feedback/00-MASTER-WTF-SUMMARY.md`
→ `.docs/08-knowledge/02-feedback/feedback/pro-dev-feedback/` (all numbered issues)

### "What research exists?"
→ `.docs/08-knowledge/01-research/briefs/DEEP-RESEARCH-BRIEFS.md`
→ `.docs/08-knowledge/01-research/questions/DEEP-RESEARCH-QUESTION-BANK.md`

## 🗂️ Key Files by Topic

### LifeLock Domain
- `.docs/03-product/01-domains/01-lifelock/` - All LifeLock documentation

### Database
- `.docs/02-architecture/02-database/schema/SCHEMA-ANALYSIS.md` - DB schema
- `.docs/02-architecture/02-database/schema/DOMAIN-MODEL.md` - Domain model

### AI Integration
- `.docs/04-integrations/01-ai-agents/` - AI agent setup and config
- `.docs/04-integrations/02-mcp/` - MCP server integration

### Component Registry
- `.docs/05-development/03-guides/general/COMPONENT-REGISTRY.md` - All components

### Health & Status
- `.docs/06-testing/04-health-checks/CODEBASE-HEALTH-REPORT.md` - System health
- `.docs/07-operations/04-migrations/completion/PRODUCTION-READINESS-REPORT.md` - Migration status

### Methodology
- `.docs/05-development/02-workflows/methodology/GUIDING-PRINCIPLES.md` - Core principles
- `.docs/05-development/02-workflows/methodology/enhanced-ide-development-workflow.md` - Workflow

## 📊 File Statistics

- **Total Files**: 345
- **Total Categories**: 9
- **Max Depth**: 3 levels
- **Naming**: kebab-case folders, Title-Case or ALL_CAPS files
- **Every folder has**: README.md explaining its purpose

## 🔍 Search Strategy

### By Domain
- LifeLock: `03-product/01-domains/01-lifelock/`
- Tasks: `03-product/01-domains/02-tasks/` (planned)
- Partners: `03-product/01-domains/03-partners/` (planned)

### By Type
- Architecture: `02-architecture/`
- Features: `03-product/`
- Guides: `05-development/03-guides/`
- Tests: `06-testing/`
- Operations: `07-operations/`
- Research: `08-knowledge/01-research/`
- Feedback: `08-knowledge/02-feedback/`

### By Audience
- New Devs: `01-overview/`, `05-development/01-getting-started/`
- Architects: `02-architecture/`
- Product: `03-product/`
- AI Engineers: `04-integrations/`
- QA: `06-testing/`
- DevOps: `07-operations/`

## 💡 Tips for AI Agents

1. **Always start with the README** in any folder before diving deeper
2. **Check dependencies** - most files reference related files
3. **Use the JSON catalog** for complex queries (AI-KNOWLEDGE-CATALOG.json)
4. **Legacy files are in 09-archive/** - check there for historical context
5. **Empty folders are deleted** - if a folder exists, it has content
6. **All paths are relative to `.docs/` folder**

## 🔄 Recent Changes

**2025-01-18**: Major reorganization
- Renamed `docs/` → `.docs/`
- Organized into 9 numbered categories
- All files in subdirectories (max 3 levels deep)
- Created AI knowledge infrastructure (this file)
- Removed all empty folders
- Updated all READMEs

## 📞 For Humans

If you're a human reading this, welcome! This file is designed to help AI agents navigate our documentation, but it's also a pretty good quick reference for you too.

For a more detailed overview, start with: `.docs/01-overview/README.md`
