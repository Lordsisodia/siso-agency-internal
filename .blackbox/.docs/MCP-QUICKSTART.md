# MCP Crash Prevention - Quick Start

## One-Time Setup

```bash
# Run the setup script
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox
./4-scripts/setup-mcp-prevention.sh

# Reload your shell
source ~/.zshrc  # or ~/.bashrc
```

## Daily Usage

### Before Starting Agents
```bash
mcp-health
```

### While Running Agents
```bash
# Check status
mcp-status

# Monitor logs
mcp-logs

# Manual cleanup if needed
mcp-cleanup
```

### Quick Process Count
```bash
ps aux | grep -E "npm|npx|node" | grep -v grep | wc -l
```

## What This Fixes

| Issue | Before | After |
|-------|--------|-------|
| MCP processes | 125+ | < 20 |
| CPU spikes | 93-99% | < 80% |
| VSCode crashes | Every ~2 hours | Prevented |
| Orphaned servers | Many | Auto-cleanup |

## Files Created

- `~/.mcp-logs/` - Log directory
- `~/.mcp-singleton-locks/` - Lock files
- `~/Library/LaunchAgents/com.siso.mcp-monitor.plist` - Background service
- Aliases in `~/.zshrc` or `~/.bashrc`

## Troubleshooting

```bash
# Check if daemon is running
launchctl list | grep mcp-monitor

# Restart daemon
launchctl unload ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist

# View logs
cat ~/.mcp-logs/mcp-monitor.log
```

## Full Documentation

See `.blackbox/.docs/MCP-CRASH-PREVENTION.md` for complete details.
