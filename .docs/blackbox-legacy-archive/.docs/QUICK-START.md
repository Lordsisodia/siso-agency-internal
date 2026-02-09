# Ralph Runtime CLI - Quick Reference

## Quick Start

```bash
# Run a plan autonomously
./ralph-runtime.sh run --plan .plans/my-project --autonomous

# Monitor execution
./monitor.sh --follow

# Check status
./ralph-cli status
```

## Command Summary

### Core Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `ralph-runtime.sh run` | Execute plan | `./ralph-runtime.sh run --plan .plans/my-project --autonomous` |
| `ralph-cli run` | Unified run command | `ralph-cli run --plan .plans/my-project --autonomous` |
| `autonomous-run.sh start` | Start autonomous | `./autonomous-run.sh start --spec .specs/my-spec.json` |
| `monitor.sh` | Monitor execution | `./monitor.sh --session abc123 --follow` |
| `intervene.sh` | Intervene | `./intervene.sh --session abc123 --action pause` |

### Status & Monitoring

| Command | Purpose |
|---------|---------|
| `ralph-cli status` | Show system status |
| `circuit-breaker.sh status` | Circuit breaker status |
| `monitor.sh` | Real-time monitoring |
| `ralph-cli logs` | View logs |
| `ralph-cli metrics` | Show metrics |

### Analysis

| Command | Purpose |
|---------|---------|
| `analyze-response.sh analyze` | Analyze response |
| `analyze-response.sh score` | Score quality |
| `analyze-response.sh patterns` | Check patterns |

### Session Management

| Command | Purpose |
|---------|---------|
| `ralph-cli session list` | List sessions |
| `ralph-runtime.sh pause` | Pause session |
| `ralph-runtime.sh resume` | Resume session |
| `ralph-runtime.sh stop` | Stop session |

### System

| Command | Purpose |
|---------|---------|
| `ralph-cli health` | Check health |
| `ralph-cli doctor` | Diagnose issues |
| `ralph-cli clean` | Clean up |
| `circuit-breaker.sh reset` | Reset breaker |

## Common Options

| Option | Purpose |
|--------|---------|
| `--plan <path>` | Plan directory |
| `--spec <path>` | Spec file |
| `--autonomous` | Enable autonomous mode |
| `--session <id>` | Session ID |
| `--verbose` | Verbose output |
| `--dry-run` | Show what would be done |
| `--help` | Show help |

## Workflow Examples

### Basic Autonomous Execution

```bash
# 1. Start execution
ralph-cli run --plan .plans/my-project --autonomous

# 2. Monitor in another terminal
monitor.sh --follow

# 3. Check status
ralph-cli status
```

### With Intervention

```bash
# 1. Start execution
./autonomous-run.sh start --spec .specs/my-spec.json

# 2. Pause if needed
./intervene.sh --session abc123 --action pause

# 3. Provide guidance
./intervene.sh --session abc123 --action guidance --input "Try alternative approach"

# 4. Resume
./autonomous-run.sh resume --session abc123
```

### Analysis Workflow

```bash
# 1. Run execution
ralph-cli run --plan .plans/my-project --autonomous

# 2. Analyze responses
./analyze-response.sh analyze --file response.txt

# 3. Check patterns
./analyze-response.sh patterns --file response.txt

# 4. Generate report
./analyze-response.sh report --file response.txt --output report.html
```

## Circuit Breaker Workflow

```bash
# 1. Check status
./circuit-breaker.sh status

# 2. View metrics
./circuit-breaker.sh metrics

# 3. Test scenarios
./circuit-breaker.sh test --scenario failure --iterations 5

# 4. Reset if needed
./circuit-breaker.sh reset --breaker ralph-main
```

## Troubleshooting

### Issue: Session not found

```bash
# List sessions
ralph-cli session list

# Find most recent
ralph-cli status
```

### Issue: Circuit breaker open

```bash
# Check status
./circuit-breaker.sh status --detailed

# Reset
./circuit-breaker.sh reset
```

### Issue: Poor response quality

```bash
# Analyze
./analyze-response.sh analyze --file response.txt --detailed

# Score
./analyze-response.sh score --file response.txt --min-score 70
```

## Keyboard Shortcuts

- `Ctrl+C` - Exit monitor / Stop execution
- Space - Pause/resume updates (monitor)

## Environment Variables

```bash
export RALPH_HOME="/path/to/blackbox4"
export RALPH_LOG_LEVEL="debug"
export RALPH_AUTO_CONFIRM="true"
export RALPH_PROFILE="development"
```

## Profiles

- `default` - Standard configuration
- `development` - Verbose, debug mode
- `production` - Optimized, minimal output
- `testing` - Dry-run, verbose

```bash
ralph-cli --profile development run --plan .plans/my-project
```

## File Locations

- Config: `.blackbox4/config/`
- Logs: `.blackbox4/logs/`
- Sessions: `.blackbox4/sessions/`
- State: `.blackbox4/state/`
- Interventions: `.blackbox4/interventions/`

## Getting Help

```bash
# General help
ralph-cli help

# Script-specific help
./ralph-runtime.sh --help
./circuit-breaker.sh --help
./analyze-response.sh --help

# Command help
ralph-cli run --help
ralph-cli monitor --help
```

## Shell Completion

```bash
# Bash
ralph-cli completion bash > /etc/bash_completion.d/ralph-cli
source /etc/bash_completion.d/ralph-cli

# Zsh
ralph-cli completion zsh > ~/.zsh/completion/_ralph-cli

# Fish
ralph-cli completion fish > ~/.config/fish/completions/ralph-cli.fish
```

## Tips

1. **Use `--dry-run`** to test before actual execution
2. **Monitor in separate terminal** with `--follow`
3. **Enable verbose logging** for debugging: `--verbose`
4. **Set limits** with `--max-iterations`
5. **Use profiles** for different environments
6. **Check health** before running: `ralph-cli health`
7. **Analyze responses** regularly for quality
8. **Keep circuit breaker enabled** for production

## Quick Commands Reference

```bash
# Run
ralph-cli run --plan .plans/my-project --autonomous

# Status
ralph-cli status

# Monitor
monitor.sh --follow

# Pause
intervene.sh --session <id> --action pause

# Resume
intervene.sh --session <id> --action resume

# Logs
ralph-cli logs --session <id> --follow

# Analyze
analyze-response.sh analyze --file response.txt

# Health
ralph-cli health

# Clean
ralph-cli clean
```

---

For detailed documentation, see [WRAPPERS-GUIDE.md](./WRAPPERS-GUIDE.md)
