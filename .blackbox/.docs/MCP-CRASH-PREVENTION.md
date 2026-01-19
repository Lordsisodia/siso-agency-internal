# MCP Crash Prevention Setup

This document describes the setup to prevent VSCode crashes when running multiple Claude Code agents.

## Problem

When running 6+ Claude Code agents simultaneously, MCP (Model Context Protocol) servers were spawning duplicate instances without cleanup, leading to:
- 125+ node/npm processes
- CPU usage spikes (93-99% per process)
- Memory pressure and compression
- VSCode crashes every ~2 hours

## Solution Architecture

### 1. Configuration Changes

**Claude Settings** (`~/.claude/settings.json`)
- Reduced `API_TIMEOUT_MS` from 3000000ms (50 min) to 120000ms (2 min)
- Added `MCP_SERVER_TIMEOUT: 60000` (1 minute)

**MCP Server Config** (`.blackbox/.config/mcp-servers.json`)
- Added resource limits and health check settings
- Max instances per server: 2
- Max age: 7200 seconds (2 hours)
- CPU threshold: 80%
- Memory threshold: 500MB

### 2. Management Scripts

#### Startup Health Check
```bash
.blackbox/4-scripts/startup-health-check.sh
```
Run this before starting agents to verify environment health.

#### MCP Monitor Daemon
```bash
.blackbox/4-scripts/mcp-monitor-daemon.sh
```
Background service that:
- Monitors MCP server health every 60 seconds
- Auto-cleanup of orphaned processes
- Resource usage tracking
- State reporting to `~/.mcp-logs/mcp-state.json`

#### MCP Singleton Manager
```bash
.blackbox/4-scripts/mcp-singleton-manager.sh
```
Prevents duplicate instances via file-based locking.

### 3. LaunchDaemon Service

**Install:**
```bash
cp .blackbox/4-scripts/com.siso.mcp-monitor.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
```

**Uninstall:**
```bash
launchctl unload ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
rm ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
```

## Installation Steps

### Step 1: Apply Configuration Changes
Already done - settings have been updated.

### Step 2: Install LaunchDaemon (Recommended)
```bash
# Copy the plist file
cp .blackbox/4-scripts/com.siso.mcp-monitor.plist ~/Library/LaunchAgents/

# Load the service
launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist

# Verify it's running
launchctl list | grep mcp-monitor
```

### Step 3: Add to Shell Profile (Optional)
Add to `~/.zshrc` or `~/.bashrc`:
```bash
# MCP Singleton Manager
source ~/.blackbox/4-scripts/mcp-singleton-manager.sh
```

### Step 4: Create Alias for Quick Health Check
Add to `~/.zshrc` or `~/.bashrc`:
```bash
alias mcp-health='~/.blackbox/4-scripts/startup-health-check.sh'
alias mcp-cleanup='~/.blackbox/4-scripts/cleanup-mcp-processes.sh'
alias mcp-status='cat ~/.mcp-logs/mcp-state.json'
alias mcp-logs='tail -f ~/.mcp-logs/mcp-monitor.log'
```

## Usage

### Before Starting Agents
```bash
# Run health check
mcp-health
```

### While Running Agents
```bash
# Check current status
mcp-status

# Monitor logs in real-time
mcp-logs

# Manual cleanup if needed
mcp-cleanup
```

### After Stopping Agents
```bash
# Verify cleanup
ps aux | grep -E "npm|npx|node" | grep -v grep | wc -l
```

## Monitoring

### Key Metrics

**Healthy State:**
- Total MCP processes: < 20
- CPU usage per process: < 80%
- Memory usage per process: < 500MB
- No duplicate servers (> 2 instances per type)

**Warning Signs:**
- MCP processes > 50
- CPU usage > 90% sustained
- Memory compression > 500,000 pages
- Duplicate server instances

### Log Files

- `~/.mcp-logs/mcp-monitor.log` - Main daemon log
- `~/.mcp-logs/mcp-manager.log` - Singleton manager log
- `~/.mcp-logs/mcp-state.json` - Current state snapshot

## Troubleshooting

### Problem: VSCode still crashes

**Solution 1: Manual cleanup**
```bash
pkill -9 -f "mcp-server"
pkill -9 -f "npm exec.*mcp"
```

**Solution 2: Restart launchdaemon**
```bash
launchctl unload ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
launchctl load ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
```

**Solution 3: Check for other issues**
```bash
# Check disk space
df -h ~

# Check memory pressure
vm_stat | grep compressed

# Check Claude logs
ls -lah ~/.claude-logs/
```

### Problem: LaunchDaemon won't start

**Check plist syntax:**
```bash
plutil -lint ~/Library/LaunchAgents/com.siso.mcp-monitor.plist
```

**Check file permissions:**
```bash
chmod +x ~/.blackbox/4-scripts/mcp-monitor-daemon.sh
```

**Check launchd logs:**
```bash
log show --predicate 'process == "mcp-monitor"' --last 1h
```

### Problem: Too many false positives in cleanup

Adjust thresholds in `.blackbox/.config/mcp-servers.json`:
```json
"maxInstances": 3,  // Increase from 2
"maxCpuPercent": 90,  // Increase from 80
"maxMemoryMb": 1000  // Increase from 500
```

## Maintenance

### Weekly Tasks
1. Check MCP state: `mcp-status`
2. Review logs: `mcp-logs`
3. Verify process count is reasonable
4. Clean up old log files if needed

### Monthly Tasks
1. Review and adjust thresholds based on usage patterns
2. Archive old log files
3. Update scripts if new MCP servers are added

## Configuration Reference

### MCP Server Settings
| Setting | Default | Description |
|---------|---------|-------------|
| `timeout` | 60000ms | Server request timeout |
| `maxInstances` | 2 | Max instances per server type |
| `maxAgeSeconds` | 7200 | Max server uptime before restart |
| `maxCpuPercent` | 80 | CPU usage warning threshold |
| `maxMemoryMb` | 500 | Memory usage warning threshold |
| `healthCheckInterval` | 60s | Health check frequency |

### Resource Limits
| Setting | Default | Description |
|---------|---------|-------------|
| `maxTotalServers` | 10 | Maximum total servers across all types |
| `maxConcurrentServers` | 6 | Maximum servers running concurrently |
| `restartOnCrash` | true | Auto-restart crashed servers |
| `gracefulShutdown` | true | Allow servers to shut down gracefully |

## Future Improvements

1. **Integration with MCP Protocol**: Once MCP protocol supports singleton management natively, migrate to built-in solution

2. **Dynamic Resource Allocation**: Adjust limits based on available system resources

3. **Predictive Scaling**: Anticipate need for more instances and pre-warm servers

4. **Cross-Session Persistence**: Maintain state across VSCode restarts

5. **Metrics Dashboard**: Web-based dashboard for monitoring MCP server health

## Support

For issues or questions:
1. Check logs: `~/.mcp-logs/`
2. Run health check: `mcp-health`
3. Review this document
4. Check MCP server documentation: https://github.com/modelcontextprotocol
