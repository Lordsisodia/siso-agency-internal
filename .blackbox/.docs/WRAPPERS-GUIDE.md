# Ralph Runtime Wrapper Scripts - Complete Guide

## Overview

This guide documents all wrapper scripts created for Ralph Runtime in Blackbox4 Phase 4. These scripts provide a comprehensive CLI interface for autonomous execution, monitoring, and intervention.

## Script Summary

| Script | Size | Purpose |
|--------|------|---------|
| `ralph-runtime.sh` | 19KB | Main wrapper for Ralph Runtime |
| `circuit-breaker.sh` | 22KB | Circuit breaker operations |
| `analyze-response.sh` | 24KB | Response analysis |
| `autonomous-run.sh` | 24KB | Autonomous execution wrapper |
| `ralph-cli.sh` | 29KB | Unified CLI for all operations |
| `monitor.sh` | 15KB | Real-time monitoring |
| `intervene.sh` | 22KB | Human intervention |

## 1. ralph-runtime.sh

Main wrapper for Ralph Runtime autonomous execution system.

### Commands

- `run` - Execute a plan or agent workflow
- `status` - Show runtime status and active sessions
- `pause` - Pause an active session
- `resume` - Resume a paused session
- `stop` - Stop an active session
- `logs` - View runtime logs
- `config` - Manage configuration

### Usage Examples

```bash
# Run a plan in autonomous mode
./ralph-runtime.sh run --plan .plans/my-project --autonomous

# Run specific task
./ralph-runtime.sh run --task task-001 --plan .plans/my-project

# Check runtime status
./ralph-runtime.sh status

# Pause a session
./ralph-runtime.sh pause --session abc123

# Resume a session
./ralph-runtime.sh resume --session abc123

# View logs
./ralph-runtime.sh logs --session abc123 --tail 50
```

### Options

- `--plan <path>` - Plan directory to execute
- `--agent <name>` - Specific agent to run
- `--task <id>` - Specific task ID to execute
- `--autonomous` - Enable autonomous mode
- `--interactive` - Enable interactive mode
- `--max-iterations <n>` - Maximum iterations (default: 100)
- `--session <id>` - Resume existing session
- `--parallel` - Enable parallel task execution
- `--dry-run` - Show what would be done
- `-v, --verbose` - Enable verbose output
- `-q, --quiet` - Suppress output

## 2. circuit-breaker.sh

Wrapper for circuit breaker operations in Ralph Runtime.

### Commands

- `status` - Show circuit breaker status
- `reset` - Reset circuit breaker to closed state
- `test` - Test circuit breaker behavior
- `metrics` - Show circuit breaker metrics
- `history` - Show circuit breaker state history
- `configure` - Manage circuit breaker configuration

### Usage Examples

```bash
# Check circuit breaker status
./circuit-breaker.sh status

# Check specific breaker
./circuit-breaker.sh status --breaker agent-execution

# Reset circuit breaker
./circuit-breaker.sh reset --breaker ralph-main

# Test failure scenario
./circuit-breaker.sh test --scenario failure --iterations 5

# Show metrics in JSON
./circuit-breaker.sh metrics --json

# Detailed status with watch
./circuit-breaker.sh status --detailed --watch
```

### Circuit Breaker States

- **CLOSED** (Green) - Normal operation, requests pass through
- **OPEN** (Red) - Circuit is tripped, requests are blocked
- **HALF_OPEN** (Yellow) - Testing if system has recovered

### Options

- `--breaker <name>` - Circuit breaker name (default: ralph-main)
- `--json` - Output in JSON format
- `--timeout <ms>` - Recovery timeout in milliseconds
- `--threshold <n>` - Failure threshold
- `--detailed` - Show detailed status information
- `--watch` - Continuously monitor status

## 3. analyze-response.sh

Wrapper for response analyzer - analyzes agent responses for quality and patterns.

### Commands

- `analyze` - Analyze a response file or text
- `score` - Calculate and display quality score
- `patterns` - Detect and report patterns
- `quality` - Check quality metrics
- `consistency` - Check consistency across responses
- `compare` - Compare multiple responses
- `report` - Generate detailed analysis report

### Usage Examples

```bash
# Analyze a response file
./analyze-response.sh analyze --file response.txt

# Analyze with text input
./analyze-response.sh analyze --text "The agent response here..."

# Analyze with detailed output
./analyze-response.sh analyze --file response.txt --detailed --format json

# Score a response
./analyze-response.sh score --file response.txt --min-score 70

# Check for patterns
./analyze-response.sh patterns --file response.txt --type repetition

# Generate full report
./analyze-response.sh report --session abc123 --output report.html

# Compare multiple responses
./analyze-response.sh compare --files response1.txt response2.txt response3.txt
```

### Quality Metrics

- **Clarity** - How clear and understandable the response is
- **Completeness** - How completely it addresses the request
- **Accuracy** - Factual correctness (requires reference)
- **Relevance** - How relevant to the original query
- **Structure** - Organization and formatting

### Pattern Types

- `repetition` - Repetitive phrases or patterns
- `vagueness` - Vague or non-committal language
- `errors` - Factual or logical errors
- `inconsistency` - Internal contradictions
- `bias` - Potential biases in response

### Options

- `--file <path>` - Response file to analyze
- `--text <string>` - Response text to analyze
- `--session <id>` - Analyze session responses
- `--output <path>` - Output file for results
- `--format <type>` - Output format (text, json, html)
- `--check-patterns` - Enable pattern detection
- `--check-quality` - Enable quality checking
- `--check-consistency` - Enable consistency checking
- `--min-score <n>` - Minimum acceptable score (0-100)

## 4. autonomous-run.sh

High-level autonomous execution wrapper for Ralph Runtime.

### Commands

- `start` - Start autonomous execution
- `monitor` - Monitor running autonomous session
- `intervene` - Intervene in autonomous execution
- `status` - Show autonomous execution status
- `stop` - Stop autonomous execution
- `resume` - Resume paused execution
- `logs` - View execution logs
- `configure` - Manage autonomous configuration

### Usage Examples

```bash
# Start autonomous execution with a spec
./autonomous-run.sh start --spec .specs/my-spec.json

# Start with a plan
./autonomous-run.sh start --plan .plans/my-project --max-iterations 50

# Start with no intervention
./autonomous-run.sh start --spec .specs/my-spec.json --no-intervention

# Monitor a session
./autonomous-run.sh monitor --session abc123 --follow

# Intervene in a session
./autonomous-run.sh intervene --session abc123 --action pause --reason "Manual review needed"

# Check status
./autonomous-run.sh status
```

### Features

- **Automatic Task Breakdown** - Breaks down complex tasks automatically
- **Circuit Breaker** - Prevents cascading failures
- **Response Analysis** - Validates agent responses
- **Human Intervention** - Allows human oversight when needed
- **Progress Tracking** - Tracks execution progress
- **Error Recovery** - Automatic recovery from errors

### Options

- `--spec <path>` - Spec file to execute
- `--plan <path>` - Plan directory to execute
- `--agent <name>` - Specific agent to run
- `--max-iterations <n>` - Maximum iterations (default: 100)
- `--session-id <id>` - Custom session ID
- `--no-intervention` - Disable human intervention
- `--no-circuit-breaker` - Disable circuit breaker
- `--no-response-analysis` - Disable response analysis
- `--dry-run` - Show what would be done

## 5. ralph-cli.sh

Unified CLI for all Ralph Runtime operations - comprehensive command-line interface.

### Commands

**Core Commands:**
- `run` - Execute plans or agents
- `status` - Show system status
- `config` - Manage configuration
- `logs` - View logs
- `metrics` - Show metrics

**Session Commands:**
- `session` - Manage sessions
- `pause` - Pause a session
- `resume` - Resume a session
- `stop` - Stop a session

**Analysis Commands:**
- `analyze` - Analyze responses
- `test` - Run tests
- `validate` - Validate configurations

**Autonomous Commands:**
- `auto` - Autonomous execution
- `monitor` - Monitor execution
- `intervene` - Intervene in execution

**System Commands:**
- `health` - Check system health
- `doctor` - Diagnose issues
- `clean` - Clean up resources

**Utility Commands:**
- `help` - Show help
- `version` - Show version
- `completion` - Generate shell completion

### Usage Examples

```bash
# Run a plan autonomously
ralph-cli run --plan .plans/my-project --autonomous

# Check system status
ralph-cli status

# View session logs
ralph-cli logs --session abc123 --tail 50 --follow

# Analyze a response
ralph-cli analyze --file response.txt

# Monitor autonomous execution
ralph-cli monitor --session abc123

# Intervene in execution
ralph-cli intervene --session abc123 --action pause

# Check system health
ralph-cli health

# Interactive mode
ralph-cli -i run --plan .plans/my-project
```

### Profiles

Ralph CLI supports configuration profiles for different environments:

- `default` - Standard configuration
- `development` - Development settings (verbose, debug)
- `production` - Production settings (optimized, minimal output)
- `testing` - Testing settings (dry-run, verbose)

```bash
# Use development profile
ralph-cli --profile development run --plan .plans/my-project
```

### Global Options

- `-v, --verbose` - Enable verbose output
- `-q, --quiet` - Suppress output (except errors)
- `-d, --debug` - Enable debug mode
- `-y, --yes` - Auto-confirm prompts
- `-j, --json` - Output in JSON format
- `-i, --interactive` - Interactive mode
- `-h, --help` - Show help message
- `--config <file>` - Use custom config file
- `--profile <name>` - Use configuration profile

### Shell Completion

Generate shell completion for bash, zsh, or fish:

```bash
# Bash
ralph-cli completion bash > /etc/bash_completion.d/ralph-cli

# Zsh
ralph-cli completion zsh > /usr/local/share/zsh/site-functions/_ralph-cli

# Fish
ralph-cli completion fish > ~/.config/fish/completions/ralph-cli.fish
```

## 6. monitor.sh

Real-time monitoring script for Ralph Runtime sessions.

### Usage Examples

```bash
# Monitor most recent session
./monitor.sh

# Monitor specific session
./monitor.sh --session abc123

# Monitor with faster refresh
./monitor.sh --session abc123 --refresh 1

# Show once and exit
./monitor.sh --once

# Continuous follow mode
./monitor.sh --follow
```

### Dashboard Panels

- **Session Info** - Session ID, status, iterations
- **Metrics** - Performance metrics and statistics
- **Circuit Breaker** - Circuit breaker status and health
- **Recent Logs** - Recent log entries from session
- **Progress** - Task completion progress

### Options

- `--session <id>` - Session ID to monitor (default: most recent)
- `--refresh <n>` - Refresh interval in seconds (default: 2)
- `--no-metrics` - Don't show metrics panel
- `--no-logs` - Don't show logs panel
- `--no-circuit-breaker` - Don't show circuit breaker status
- `--follow` - Follow mode (continuous updates)
- `--once` - Show once and exit (no refresh)

### Keyboard Shortcuts

- `Ctrl+C` - Exit monitor

## 7. intervene.sh

Human intervention script for autonomous execution.

### Actions

- `pause` - Pause autonomous execution
- `resume` - Resume paused execution
- `guidance` - Provide guidance for execution
- `override` - Override execution decision
- `abort` - Abort execution
- `status` - Show intervention status

### Usage Examples

```bash
# Pause a session
./intervene.sh --session abc123 --action pause --reason "Manual review needed"

# Resume a session
./intervene.sh --session abc123 --action resume

# Provide guidance
./intervene.sh --session abc123 --action guidance --input "Focus on UI components first"

# Override with priority
./intervene.sh --session abc123 --action override --input "Use alternative approach" --priority high

# Abort execution
./intervene.sh --session abc123 --action abort --reason "Critical bug found"

# Check intervention status
./intervene.sh --session abc123 --action status
```

### Workflow

1. Pause the autonomous execution
2. Review the current state and logs
3. Provide guidance or override decisions
4. Resume execution with new input

### Intervention Types

- **pause** - Temporarily stop execution (can be resumed)
- **guidance** - Provide hints/suggestions without forcing decisions
- **override** - Force a specific decision or action
- **abort** - Stop execution permanently (cannot be resumed)

### Priority Levels

- `low` - Informational guidance
- `medium` - Important guidance
- `high` - Critical guidance
- `critical` - Immediate override required

### Options

- `--session <id>` - Session ID to intervene in
- `--action <type>` - Action to perform
- `--input <data>` - Input data for guidance/override
- `--reason <text>` - Reason for intervention
- `--priority <level>` - Priority level (low, medium, high, critical)
- `--file <path>` - Read input from file
- `--interactive` - Interactive mode
- `-y, --yes` - Auto-confirm prompts

## Integration

All wrapper scripts integrate seamlessly:

```bash
# Complete workflow example
# 1. Start autonomous execution
./autonomous-run.sh start --spec .specs/my-spec.json

# 2. Monitor in another terminal
./monitor.sh --follow

# 3. Intervene if needed
./intervene.sh --session abc123 --action pause --reason "Need to review"

# 4. Check circuit breaker
./circuit-breaker.sh status

# 5. Analyze response
./analyze-response.sh analyze --file agent-output.txt

# 6. Resume execution
./autonomous-run.sh resume --session abc123

# Or use unified CLI
ralph-cli run --spec .specs/my-spec.json --autonomous
ralph-cli monitor --session abc123
ralph-cli intervene --session abc123 --action pause
```

## Environment Variables

Common environment variables across all scripts:

- `RALPH_HOME` - Ralph Runtime directory
- `RALPH_CONFIG_DIR` - Configuration directory
- `RALPH_LOG_LEVEL` - Log level (debug, info, warn, error)
- `RALPH_AUTO_CONFIRM` - Skip confirmation prompts
- `RALPH_PROFILE` - Configuration profile to use

## Configuration Files

Configuration files are loaded from:

1. `.blackbox4/config/ralph-runtime.yaml` (default)
2. `~/.ralph-runtime.yaml` (user)
3. `.ralph-runtime.yaml` (project-specific)
4. `--config <file>` (custom override)

## Best Practices

1. **Start Simple**: Use `ralph-cli run` for basic execution
2. **Monitor Actively**: Use `monitor.sh --follow` in a separate terminal
3. **Set Limits**: Use `--max-iterations` to prevent runaway execution
4. **Enable Circuit Breaker**: Keep circuit breaker enabled for production
5. **Analyze Responses**: Regularly analyze agent outputs for quality
6. **Use Profiles**: Leverage configuration profiles for different environments
7. **Log Everything**: Enable verbose logging for debugging
8. **Test First**: Use `--dry-run` to validate before actual execution

## Troubleshooting

### Session not found

```bash
# Check existing sessions
ralph-cli session list

# Use most recent session
ralph-cli status
```

### Circuit breaker open

```bash
# Check status
./circuit-breaker.sh status

# Reset if needed
./circuit-breaker.sh reset
```

### Poor response quality

```bash
# Analyze response
./analyze-response.sh analyze --file response.txt --detailed

# Check patterns
./analyze-response.sh patterns --file response.txt
```

### Execution stuck

```bash
# Monitor session
./monitor.sh --session <id>

# Intervene if needed
./intervene.sh --session <id> --action pause
```

## Additional Resources

- `docs/ralph-runtime.md` - Ralph Runtime documentation
- `docs/circuit-breaker.md` - Circuit breaker documentation
- `docs/response-analyzer.md` - Response analyzer documentation
- `docs/autonomous-run.md` - Autonomous execution documentation
- `docs/ralph-cli.md` - Ralph CLI documentation
- `docs/monitor.md` - Monitor documentation
- `docs/intervene.md` - Intervention documentation

## Support

For issues or questions:
1. Check script help: `./script-name.sh --help`
2. Run diagnostics: `ralph-cli doctor`
3. Check system health: `ralph-cli health`
4. Review logs: `ralph-cli logs --session <id>`

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
**Project:** Blackbox4 Phase 4
**Author:** Black Box Factory
