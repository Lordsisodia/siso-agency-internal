<div align="center">

# 🎯 Blackbox4

### **Advanced AI Agent Orchestration Framework**

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/Lordsisodia/blackbox4)
[![Status](https://img.shields.io/badge/status-production--ready-success.svg)](https://github.com/Lordsisodia/blackbox4)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**The unified framework for building intelligent, multi-agent AI systems**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 🌟 Overview

**Blackbox4** is a production-ready AI agent orchestration framework that combines the best features from multiple leading frameworks including **OpenAI Swarm**, **CrewAI**, **MetaGPT**, **Spec Kit**, **BMAD Method**, **Ralph**, and **Oh-My-OpenCode**.

It provides a complete toolkit for building autonomous AI systems with structured planning, hierarchical task execution, and advanced memory management.

### ✨ What Makes Blackbox4 Different?

- **🧠 Intelligent Planning**: Structured spec creation with validation and automatic refinement
- **🔄 Hierarchical Tasks**: Multi-level task decomposition with autonomous execution
- **💾 Persistent Memory**: Three-tier memory system with semantic search and archival
- **🎭 Specialized Agents**: 5 agent categories with role-specific capabilities
- **🔌 MCP Integration**: 13 built-in Model Context Protocol integrations
- **🛠️ 33 Production Skills**: Reusable skills organized by purpose
- **📊 Kanban System**: Built-in task management and progress tracking
- **⚡ Ralph Runtime**: TUI-based autonomous execution with real-time monitoring

---

## 🚀 Features

### 🎭 Agent System

#### 5 Agent Categories

| Category | Description | Agents |
|----------|-------------|---------|
| **Core** | Foundational agents with base capabilities | Prompt templates, output schemas |
| **BMAD** | Business Model Agent Development framework | Master, Architect, Dev, PM, QA, UX, Tech Writer, Analyst |
| **Research** | Deep research and documentation agents | Deep research, docs feedback |
| **Specialists** | Domain-specific expert agents | Custom specialist agents |
| **Enhanced** | Advanced multi-agent workflows | Coordination agents |

#### 33 Production Skills

Skills are organized into **8 purpose-based categories**:

#### 🛠️ Development
- **Test-Driven Development** - RED-GREEN-REFACTOR cycle for bulletproof code

#### 🔌 MCP Integrations (13 skills)
- **Supabase** - Database and authentication
- **Shopify** - E-commerce platform
- **GitHub** - Repository operations
- **Serena** - Semantic coding tools
- **Chrome DevTools** - Web debugging
- **Playwright** - Browser automation
- **Filesystem** - File operations
- **Sequential Thinking** - Reasoning processes
- **SISO Internal** - Internal tools
- **Artifacts Builder** - HTML artifacts with React & Tailwind
- **DOCX** - Word document processing
- **PDF** - PDF extraction and manipulation
- **MCP Builder** - Create custom MCP servers

#### 🌿 Git Workflow
- **Git Worktrees** - Parallel development without context switching

#### 📚 Documentation
- **Docs Routing** - Intelligent documentation routing
- **Feedback Triage** - Feedback categorization

#### 🧪 Testing
- **Systematic Debugging** - Four-phase root cause analysis

#### ⚙️ Automation
- **GitHub CLI** - Command-line operations
- **Long-Run Ops** - Long-running operation management
- **UI Cycle** - UI development automation

#### 🤝 Collaboration
- **Notifications** - Local, mobile, and Telegram
- **Code Review** - PR preparation workflows
- **Skill Creator** - Create reusable skills
- **Subagent Development** - Multi-agent workflows

#### 🧠 Thinking
- **Deep Research** - In-depth research methodologies
- **First Principles** - Problem-solving framework
- **Intelligent Routing** - Smart task routing
- **Writing Plans** - Implementation planning

### 📋 Task Management

#### Built-in Kanban System
- **Task Boards**: Organize tasks by status (Todo, In Progress, Review, Done)
- **Project Management**: Multiple projects with separate task tracking
- **Workspace Sessions**: Launch dedicated workspaces for tasks
- **Progress Tracking**: Real-time status updates and metrics

### 🧠 Memory Architecture

#### Three-Tier Memory System

```
📁 Working Memory     → Active session data (agents, handoffs, shared state)
📁 Extended Memory    → Long-term storage with semantic search
📁 Archival Memory    → Project history and session archives
```

**Features:**
- Semantic search with ChromaDB vector store
- Agent goal state tracking
- Project state persistence
- Timeline and work queue management
- Automatic archival and compaction

### 🎯 Planning System

#### Structured Spec Creation
- **Template-based Plans**: Standardized plan structure
- **Validation**: Automatic spec validation
- **Progress Tracking**: Real-time plan execution monitoring
- **Rankings**: Feature and approach ranking
- **Success Metrics**: Defined success criteria

#### Planning Modules
- **Domain Generation**: Create structured domains
- **First Principles**: First-principles analysis
- **Implementation**: Implementation planning
- **Research**: Research planning

### 🔌 Integration Frameworks

#### Supported Frameworks
- **OpenAI Swarm** - Context variables and handoffs
- **CrewAI** - Hierarchical task management
- **MetaGPT** - Multi-agent collaboration
- **Spec Kit** - Structured spec creation
- **BMAD Method** - Business model agents
- **Ralph** - TUI runtime system
- **Oh-My-OpenCode** - MCP integration and hooks

---

## 🏗️ Architecture

### Directory Structure

```
.blackbox4/
├── 📁 .config/              # Framework configuration
│   ├── compact-config.json  # Compaction settings
│   ├── hooks.json          # System hooks
│   ├── keywords.json       # Keyword detection
│   ├── mcp-servers.json    # MCP server configs
│   └── model-profiles.yaml # AI model profiles
│
├── 📁 .docs/                # Complete documentation
│   ├── 1-getting-started/  # Quick start guides
│   ├── 2-architecture/     # Architecture docs
│   ├── 3-components/       # Component documentation
│   ├── 4-frameworks/       # Framework integration guides
│   ├── 5-workflows/        # Workflow specifications
│   └── 6-archives/         # Historical docs
│
├── 📁 .memory/              # Three-tier memory system
│   ├── working/            # Active session data
│   ├── extended/           # Long-term storage
│   └── archival/           # Project history
│
├── 📁 .plans/               # Planning system
│   ├── _template/          # Plan templates
│   └── active/             # Active plans
│
├── 📁 .runtime/             # Runtime state
│   └── ralph-tui/          # Ralph TUI runtime
│
├── 📁 1-agents/             # Agent definitions
│   ├── .skills/            # 33 production skills
│   ├── 1-core/             # Core agents
│   ├── 2-bmad/             # BMAD framework
│   ├── 3-research/         # Research agents
│   ├── 4-specialists/      # Specialist agents
│   └── 5-enhanced/         # Enhanced workflows
│
├── 📁 2-frameworks/         # Integration frameworks
├── 📁 3-modules/            # Functional modules
│   ├── context/            # Context management
│   ├── domain/             # Domain generation
│   ├── first-principles/   # First principles analysis
│   ├── implementation/     # Implementation planning
│   ├── kanban/             # Task management
│   ├── planning/           # Planning system
│   └── research/           # Research modules
│
├── 📁 4-scripts/            # Executable scripts
├── 📁 5-templates/          # Document templates
├── 📁 6-tools/              # Utility tools
├── 📁 7-workspace/          # Active workspace
├── 📁 8-testing/            # Test suites
└── manifest.yaml           # Framework manifest
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Blackbox4 Core                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Agents    │  │   Skills    │  │  Frameworks │        │
│  │  (5 cats)   │  │   (33)      │  │    (7)      │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                   ┌──────▼──────┐                           │
│                   │  Orchestrator│                          │
│                   └──────┬──────┘                           │
│                          │                                  │
│  ┌───────────────────────┼───────────────────────┐         │
│  │                       │                       │          │
│ ┌▼─────────┐      ┌─────▼─────┐      ┌────────▼──┐       │
│ │  Memory  │      │  Planning │      │  Kanban   │       │
│ │ (3-tier) │      │  System   │      │  System   │       │
│ └──────────┘      └───────────┘      └───────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
              ┌───────────▼────────────┐
              │   Ralph Runtime       │
              │   (TUI Monitor)       │
              └───────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Git
- GitHub CLI (gh)
- Claude Code or compatible AI assistant

### Installation

```bash
# Clone the repository
git clone https://github.com/Lordsisodia/blackbox4.git
cd blackbox4

# Verify installation
ls -la
```

### Basic Usage

#### 1. Create a Plan

```bash
# Use a plan template
cp -r .plans/_template my-project
cd my-project

# Edit plan files
vim context/project-brief.md
```

#### 2. Run Autonomous Agent

```bash
# Start Ralph runtime
./4-scripts/ralph-runtime.sh run --plan .plans/my-project --autonomous

# Monitor execution
./4-scripts/monitor.sh --follow
```

#### 3. Use Skills

Skills are automatically loaded when relevant context is detected:

```bash
# Example: TDD workflow
"Let's use test-driven development to build this feature"

# Example: Create an MCP server
"Create an MCP server for the GitHub API"

# Example: Debug systematically
"Help me debug this using systematic debugging"
```

#### 4. Manage Tasks

```bash
# List all projects
# (Uses vibe_kanban MCP integration)

# List tasks in a project
# (Uses vibe_kanban MCP integration)

# Start a workspace session
# (Launches dedicated workspace for task execution)
```

---

## 📚 Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](.docs/1-getting-started/QUICK-START.md) | Get started in 5 minutes |
| [Setup Guide](.docs/1-getting-started/SETUP-GUIDE.md) | Complete setup instructions |
| [Architecture](.docs/2-architecture/ARCHITECTURE-FINAL.md) | System architecture |
| [Directory Structure](.docs/2-reference/DIRECTORY-STRUCTURE.md) | Complete file layout |
| [Quick Reference](.docs/2-reference/QUICK-REFERENCE.md) | Quick command reference |

### Component Documentation

- [Agent System](.docs/3-components/agents/README.md)
- [Memory System](.docs/3-components/memory/MEMORY-ARCHITECTURE.md)
- [Planning System](.docs/4-frameworks/roadmap/README.md)
- [Task Management](.docs/2-reference/TASK-MANAGEMENT-SYSTEM.md)

### Framework Integration

- [OpenAI Swarm Integration](.docs/4-implementation/guides/implementation-plans/Evaluations/07-FEATURE-MATRIX.md)
- [CrewAI Integration](.docs/4-implementation/guides/implementation-plans/Evaluations/06-SWARM.md)
- [MetaGPT Integration](.docs/4-implementation/guides/implementation-plans/Evaluations/07-METAGPT.md)
- [BMAD Method](.docs/4-implementation/guides/implementation-plans/Evaluations/02-BMAD-METHOD.md)
- [Ralph Runtime](.docs/4-implementation/guides/implementation-plans/Evaluations/04-RALPH.md)

---

## 🎯 Use Cases

### Software Development
- **Automated Code Generation**: Use BMAD agents for full-stack development
- **Code Review**: Use requesting-code-review skill for PR preparation
- **Testing**: Apply TDD and systematic debugging skills

### Research & Analysis
- **Deep Research**: Use deep-research agent for comprehensive analysis
- **Documentation**: Auto-generate docs with docs-routing skill
- **Competitive Analysis**: Use competitor-matrix prompts

### Project Management
- **Planning**: Create structured plans with spec creation
- **Task Tracking**: Use built-in Kanban system
- **Progress Monitoring**: Real-time execution monitoring

### Automation
- **CI/CD**: Automate with github-cli skill
- **Web Testing**: Use Playwright for browser automation
- **Data Processing**: Use PDF and DOCX skills for document processing

---

## 🔧 Configuration

### MCP Servers

Configure MCP servers in `.config/mcp-servers.json`:

```json
{
  "mcpServers": {
    "supabase": { ... },
    "github": { ... },
    "playwright": { ... }
  }
}
```

### Model Profiles

Configure AI models in `.config/model-profiles.yaml`:

```yaml
models:
  opus:
    model: claude-opus-4-5-20251101
    max_tokens: 200000
  sonnet:
    model: claude-sonnet-4-5-20251101
    max_tokens: 200000
```

### Keywords

Define trigger keywords in `.config/keywords.json`:

```json
{
  "keywords": {
    "test": ["testing", "tdd", "test-driven"],
    "debug": ["debug", "fix", "error"]
  }
}
```

---

## 📊 Statistics

- **Total Files**: 1,410+
- **Agent Categories**: 5
- **Production Skills**: 33
- **MCP Integrations**: 13
- **Memory Tiers**: 3
- **Frameworks Integrated**: 7
- **Documentation Pages**: 100+

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main repository.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Blackbox4 integrates and builds upon these amazing frameworks:

- **OpenAI Swarm** - Context variables and handoffs
- **CrewAI** - Hierarchical tasks
- **MetaGPT** - Multi-agent collaboration
- **Spec Kit** - Structured spec creation
- **BMAD Method** - Business model agents
- **Ralph** - TUI runtime
- **Oh-My-OpenCode** - MCP integration

Special thanks to all contributors and maintainers of these frameworks.

---

## 📞 Support

- **Documentation**: [Complete Docs](.docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/Lordsisodia/blackbox4/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Lordsisodia/blackbox4/discussions)

---

<div align="center">

**Built with ❤️ by the Blackbox Team**

[⬆ Back to Top](#-blackbox4)

</div>
