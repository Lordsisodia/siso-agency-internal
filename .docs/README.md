# SISO Internal Documentation

**🎯 NEW STRUCTURE** — Reorganized January 18, 2025

Use this file as the map. Content is organized into **9 numbered areas** following the development lifecycle.

---

## 🤖 For AI Agents

**Start Here**: Read `AI-READY.md` for quick navigation or `AI-KNOWLEDGE-CATALOG.json` for complete file mapping.

These files provide structured knowledge for intelligent context retrieval and file discovery.

---

## 📚 Nine Main Areas

### 01. [Overview](./01-overview/) 📍
**START HERE** - What is SISO Internal? Quick start, architecture overview, tech stack, glossary

**For**: New developers, stakeholders, anyone new to the project

**Key Files**:
- `00-project-overview.md` - High-level introduction
- `01-quick-start/README.md` - Get running in 5 minutes

---

### 02. [Architecture](./02-architecture/) 🏗️
**HOW IT WORKS** - System design, patterns, database schema, and technical decisions

**For**: Architects, developers, technical leads

**Key Sections**:
- `01-system-design/` - Domains, state management, routing, authentication
- `02-database/` - Schema, migrations, relationships, data models
- `03-components/` - Component architecture and patterns
- `04-integrations/` - External service architecture
- `05-api/` - API design and endpoints
- `06-security/` - Security architecture
- `07-performance/` - Optimization strategies
- `08-analysis/` - Technical analysis and documentation

---

### 03. [Product](./03-product/) 📦
**WHAT WE'RE BUILDING** - Features, domains, product requirements, and planning

**For**: Product managers, developers, stakeholders

**Key Sections**:
- `01-domains/` - Domain-specific features (LifeLock, Tasks, Partners, Clients, XP Store)
- `02-planning/` - Product planning, roadmap, migration
- `03-prds/` - Product Requirement Documents

**Current Focus**: `01-domains/01-lifelock/` - LifeLock productivity dashboard

---

### 04. [Integrations](./04-integrations/) 🔌
**EXTERNAL CONNECTIONS** - AI, agents, MCP, APIs, and external services

**For**: AI engineers, developers, DevOps

**Key Sections**:
- `01-ai-agents/` - AI agent integration, prompts, coordination
- `02-mcp/` - Model Context Protocol servers (Vibe Kanban, BlackBox)
- `03-external-services/` - Third-party integrations
- `04-offline/` - Offline-first architecture and PWA features

**Key Files**:
- `AGENT-BLACKBOX-INSTRUCTIONS.md` - AI agent setup
- `VIBE-KANBAN-MCP-SETUP-GUIDE.md` - MCP integration

---

### 05. [Development](./05-development/) 💻
**HOW TO BUILD** - Guides, workflows, and tooling for development

**For**: Developers, contributors

**Key Sections**:
- `01-getting-started/` - Onboarding, environment setup, deployment
- `02-workflows/` - Development methodologies, planning, outputs
- `03-guides/` - AI guides, fixes, component registry, QA
- `04-tools/` - Development tools and utilities
- `05-troubleshooting/` - Common issues and solutions

**Key Files**:
- `QUICK_START.md` - Fast setup
- `CODEBASE.md` - Codebase overview
- `COMPONENT-REGISTRY.md` - All components

---

### 06. [Testing](./06-testing/) 🧪
**QUALITY ASSURANCE** - Testing guides, QA processes, and health checks

**For**: QA engineers, developers, DevOps

**Key Sections**:
- `01-testing-guide/` - Testing how-to guides
- `02-qa-process/` - QA processes and procedures
- `03-test-reports/` - Test results and reports
- `04-health-checks/` - System health and verification
- `05-automation/` - Automated testing infrastructure

**Key Files**:
- `CODEBASE-HEALTH-REPORT.md` - Current system health
- `VERIFICATION-SUMMARY.md` - Migration verification

---

### 07. [Operations](./07-operations/) 🚀
**KEEPING IT RUNNING** - Deployment, monitoring, maintenance, and migrations

**For**: DevOps, SREs, system administrators

**Key Sections**:
- `01-deployment/` - Deployment guides and procedures
- `02-monitoring/` - System monitoring and alerting
- `03-maintenance/` - Maintenance procedures and runbooks
- `04-migrations/` - Migration history and completion reports

**Key Files**:
- `VERCEL-BUILD-ANALYSIS.md` - Deployment analysis
- `PRODUCTION-READINESS-REPORT.md` - Migration status

---

### 08. [Knowledge](./08-knowledge/) 🧠
**INSTITUTIONAL MEMORY** - Research, feedback, stories, and lessons learned

**For**: Developers, researchers, AI agents

**Key Sections**:
- `01-research/` - Research briefs, comparisons, questions
- `02-feedback/` - User feedback and professional development
- `03-stories/` - Development stories and narratives
- `04-thought-dumps/` - Brainstorming sessions and raw ideas
- `05-lessons-learned/` - Lessons learned and best practices

**Key Files**:
- `feedback/pro-dev-feedback/00-MASTER-WTF-SUMMARY.md` - Improvement areas
- `research/briefs/DEEP-RESEARCH-BRIEFS.md` - Research topics

---

### 09. [Archive](./09-archive/) 📦
**HISTORICAL RECORDS** - Legacy documentation, deprecated content, and history

**For**: Archivists, historical research

**Sections**:
- `01-legacy-structure/` - Pre-migration documentation
- `02-root-notes/` - Notes from root directory
- `03-deprecated/` - Deprecated features
- `04-dated/` - Time-stamped documentation
- `archive/` - Previous documentation structures

---

## 🎯 Quick Navigation

### I'm new here...
→ Start with **[01. Overview](./01-overview/)**

### I want to understand the architecture...
→ Go to **[02. Architecture](./02-architecture/)**

### I need to implement a feature...
→ Check **[03. Product](./03-product/)** for requirements, then **[05. Development](./05-development/)** for guides

### I'm setting up AI agents...
→ See **[04. Integrations → 01. AI Agents](./04-integrations/01-ai-agents/)**

### Something's broken...
→ Try **[05. Development → 03. Guides → Fixes](./05-development/03-guides/fixes/)** or **[06. Testing → Health Checks](./06-testing/04-health-checks/)**

### I need to deploy...
→ Read **[05. Development → Getting Started → Deployment](./05-development/01-getting-started/)** and **[07. Operations → Deployment](./07-operations/01-deployment/)**

### What's the migration status?
→ Check **[07. Operations → Migrations](./07-operations/04-migrations/)** or **[06. Testing → Health Checks](./06-testing/04-health-checks/)**

---

## 📊 Statistics

- **Total Files**: 345
- **Categories**: 9
- **Max Depth**: 3 levels
- **Last Updated**: January 18, 2025

---

## 🏷️ Naming Conventions

- **Folders**: `kebab-case` (e.g., `01-getting-started`, `ai-agents`)
- **Files**: `Title-Case.md` or `ALL_CAPS.md` (legacy)
- **Numbers**: Used for logical ordering (01-09)
- **README.md**: Every folder has one explaining its purpose

---

## 🗂️ Organization Principles

1. **Numbered folders** indicate logical flow (overview → architecture → build → test → run)
2. **Max 3 levels deep** for easy navigation
3. **Every folder has a README.md** explaining its purpose
4. **No empty folders** - deleted immediately
5. **Archive old content** in `09-archive/` instead of deleting

---

## 🔍 Searching

### By Topic
- LifeLock: `03-product/01-domains/01-lifelock/`
- Authentication: `02-architecture/01-system-design/authentication/`
- Database: `02-architecture/02-database/`
- AI: `04-integrations/01-ai-agents/`
- MCP: `04-integrations/02-mcp/`
- Testing: `06-testing/`
- Deployment: `07-operations/01-deployment/`

### By Audience
- **New Devs**: `01-overview/`, `05-development/01-getting-started/`
- **Architects**: `02-architecture/`
- **Product**: `03-product/`
- **AI Engineers**: `04-integrations/01-ai-agents/`, `04-integrations/02-mcp/`
- **QA**: `06-testing/`
- **DevOps**: `07-operations/`

---

## 📝 Maintenance

**When adding files**:
1. Put them in the appropriate numbered category (01-09)
2. Use the appropriate subdirectory (max 3 levels deep)
3. Update the folder's README.md if needed
4. Update `AI-KNOWLEDGE-CATALOG.json` for AI agents

**When removing files**:
1. Delete empty folders immediately
2. Archive important old content in `09-archive/` instead of deleting

---

## 🤖 Contributing

This documentation is designed to be:
- **Human-readable** - Clear structure and navigation
- **AI-friendly** - Structured catalog for intelligent context retrieval
- **Maintainable** - Clear conventions and organization principles

For AI integration details, see `AI-READY.md` and `AI-KNOWLEDGE-CATALOG.json`.
