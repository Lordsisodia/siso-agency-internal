# 07-Operations

Operational scripts, workflows, and tools for running the BlackBox5 Engine in production.

## Purpose

This folder contains everything needed to **operate** the engine:
- Execute commands (run agents, start workflows)
- Follow workflows (planning, development, discovery)
- Manage environment (config, templates, libraries)
- Monitor system health (status, logs, metrics)
- Validate system integrity (tests, checks)

## Structure

Organized by **WHAT YOU WANT TO DO**:

```
07-operations/
├── commands/       # Execute something
├── workflows/      # Follow a process
├── environment/    # Set up where you work
├── monitoring/     # Check system health
├── validation/     # Verify things work
└── utilities/      # Helpful tools
```

## Commands

**Executable scripts for doing things.**

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Run** | `autonomous-run.sh` | Start autonomous execution |
| | `ralph-runtime.sh` | Run Ralph agent |
| **Agents** | `agent-status.sh` | Check agent status |
| | `start-agent-cycle.sh` | Start agent cycle |
| **System** | `intervene.sh` | Intervene in system |
| | `analyze-response.sh` | Analyze responses |
| **Specs** | `spec-create.sh` | Create specifications |
| | `spec-validate.sh` | Validate specs |

## Workflows

**Multi-step processes for getting work done.**

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Planning** | `new-plan.sh` | Create project plan |
| | `new-step.sh` | Create plan step |
| | `promote.sh` | Promote artifacts |
| **Development** | `generate-prd.sh` | Generate PRD |
| | `start-ui-cycle.sh` | Start UI cycle |
| **Memory** | `auto-compact.sh` | Compact memory |
| | `manage-memory-tiers.sh` | Manage memory |

## Environment

**Configuration, templates, and libraries.**

| Category | Content | Purpose |
|----------|---------|---------|
| **Templates** | `prd-templates/` | PRD templates |
| **Libraries** | `lib.sh`, `lib/` | Shell & Python libs |
| **Hooks** | `hooks/` | Git hooks |

## Monitoring

**Check system health and status.**

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Status** | `test-agent-tracking.sh` | Track agents |
| | `plan-status.py` | Check plan status |
| **Logging** | `view-logs.sh` | View logs |
| | `view-manifest.sh` | View manifest |

## Validation

**Verify system integrity.**

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Check** | `validate-all.sh` | Run all validations |
| | `validate-loop.sh` | Validate continuously |
| **Test** | `benchmark-task.sh` | Benchmark tasks |
| | `check-ui-constraints.sh` | Check constraints |

## Utilities

**Helpful tools and maintenance.**

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Maintenance** | `build-semantic-index.sh` | Build index |
| | `generate-readmes.sh` | Generate READMEs |
| **Setup** | `init-project-memory.sh` | Initialize memory |

## Quick Reference

| I want to... | Run this |
|--------------|----------|
| Run the engine | `commands/run/autonomous-run.sh` |
| Check status | `monitoring/status/` |
| Create a plan | `workflows/planning/new-plan.sh` |
| View logs | `monitoring/logging/view-logs.sh` |
| Validate | `validation/check/validate-all.sh` |
| Start agent | `commands/agents/start-agent-cycle.sh` |

## Statistics

- **Total files**: ~600
- **Shell scripts**: ~130
- **Python files**: ~100
- **Categories**: 6

## What's NOT Here

| Moved To | What |
|----------|------|
| `5-project-memory/_template/blackbox/` | Project scaffolding template |
| `5-project-memory/siso-internal/agents/` | Agent session data (ralph, ralphy) |
| `08-development/reference/research/` | Research snippets |
| `05-tools/tools/` | Python development tools |

## Principles

1. **Action-oriented**: Organized by what you want to DO
2. **Clear naming**: Folder names describe purpose
3. **No duplication**: Each thing has one place
4. **Scalable**: Easy to add new commands/workflows

## Related

- Engine code: `../01-core/`, `../02-agents/`
- Development: `../08-development/`
- Project memory: `../../5-project-memory/`
