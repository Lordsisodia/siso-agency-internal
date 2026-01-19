# BlackBox5 Workflows

This directory contains reusable workflow templates and orchestration patterns for the BlackBox5 engine.

## Structure

```
.workflows/
├── bmad/              # BMAD (Business-Managed Agile Development) workflows
├── automation/        # Automation and task execution workflows
├── development/       # Software development lifecycle workflows
├── research/          # Research and analysis workflows
└── collaboration/     # Team collaboration workflows
```

## BMAD Workflows

The BMAD framework provides 50+ proven workflows for software development:

### Core Development Workflows
- **Quick Flow Solo Dev** - Fast-track single developer workflow
- **Full Team SDLC** - Complete software development lifecycle
- **Agile Sprint Planning** - Iterative planning and execution
- **Code Review Process** - Systematic code review workflows

### Analysis Workflows
- **Requirements Analysis** - Business requirement gathering and analysis
- **Technical Architecture** - System design and architecture planning
- **Impact Analysis** - Change impact assessment
- **Risk Assessment** - Project risk identification and mitigation

### QA Workflows
- **Test Planning** - Comprehensive test strategy development
- **Test Execution** - Automated and manual test workflows
- **Bug Triage** - Systematic bug classification and prioritization

### Documentation Workflows
- **API Documentation** - Automated API doc generation
- **README Generation** - Project documentation workflows
- **Technical Writing** - User guides and technical specs

## Usage

Workflows can be invoked by agents in the `.agents` directory. Each workflow is defined as a YAML configuration that specifies:

- **Agent roles** required
- **Execution steps** and sequence
- **Input/output** contracts
- **Validation** checkpoints

## Adding New Workflows

1. Create a new YAML file in the appropriate category
2. Define the workflow structure following the BMAD pattern
3. Test with the BMAD Master agent
4. Document in this README

---

**Status**: Active Development
**Last Updated**: 2025-01-18
