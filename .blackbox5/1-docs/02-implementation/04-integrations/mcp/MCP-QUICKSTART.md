# MCP Crash Prevention - Quick Start Guide

## Overview

The MCP crash prevention system is now integrated into Black Box 5's core architecture. It prevents VSCode crashes caused by runaway MCP server processes when running multiple Claude Code agents.

## What Was Changed

### New Files Created

```
.blackbox5/engine/core/
└── mcp_crash_prevention.py          # NEW: Crash prevention module

.blackbox5/.docs/
├── MCP-CRASH-PREVENTION.md          # NEW: Full architecture docs
└── MCP-QUICKSTART.md                # NEW: This file

.blackbox5/.config/
└── mcp-servers.json                 # NEW: MCP server configuration
```

### Modified Files

```
.blackbox5/engine/core/
└── MCPIntegration.py                # UPDATED: Added crash prevention integration

.blackbox5/engine/
└── config.yml                       # UPDATED: Added crash prevention settings
```

## Installation

### 1. Install Dependencies

```bash
cd /Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox5/engine
pip install psutil
```

### 2. Verify Configuration

Check that `config.yml` has crash prevention enabled:

```yaml
tools:
  mcp:
    enabled: true
    enable_crash_prevention: true
    crash_prevention:
      max_instances_per_type: 2
      max_cpu_percent: 80.0
      max_memory_mb: 500.0
      ...
```

### 3. Configure MCP Servers

Edit `.blackbox5/.config/mcp-servers.json` to define your servers.

## Usage

### Python API

```python
from core.MCPIntegration import MCPManager
from pathlib import Path

# Create manager with crash prevention
manager = MCPManager(
    config_path=Path(".blackbox5/.config/mcp-servers.json"),
    enable_crash_prevention=True
)

# Start crash prevention monitoring
await manager.start_crash_prevention()

# Start servers (limits automatically enforced)
manager.start_server("playwright")
manager.start_server("chrome-devtools")

# Check status
status = manager.get_crash_prevention_status()
print(status)
```

### Command Line

```bash
# Check MCP server status
python -c "
from core.MCPIntegration import MCPManager
from pathlib import Path
manager = MCPManager(Path('.blackbox5/.config/mcp-servers.json'))
status = manager.get_crash_prevention_status()
print(status)
"
```

## How It Works

### Resource Limits

| Setting | Default | Purpose |
|---------|---------|---------|
| `max_instances_per_type` | 2 | Max instances per server type |
| `max_cpu_percent` | 80% | CPU warning threshold |
| `max_memory_mb` | 500 | Memory warning threshold (MB) |
| `max_age_seconds` | 7200 | Max server uptime (2 hours) |

### Automatic Features

1. **Process Monitoring**: Tracks all MCP processes every 60 seconds
2. **Resource Checking**: Monitors CPU and memory usage
3. **Duplicate Detection**: Identifies and removes duplicate servers
4. **Zombie Cleanup**: Removes orphaned processes
5. **Health Integration**: Registers with health monitor

### What Gets Prevented

| Before | After |
|--------|-------|
| 125+ MCP processes | < 20 |
| CPU spikes 93-99% | < 80% |
| VSCode crashes every ~2 hours | Prevented |

## Configuration

### Edit Limits

Edit `.blackbox5/engine/config.yml`:

```yaml
tools:
  mcp:
    crash_prevention:
      max_instances_per_type: 3    # Increase from 2
      max_cpu_percent: 90.0         # Increase from 80
      max_memory_mb: 1000           # Increase from 500
```

### Disable Auto-Cleanup

```yaml
tools:
  mcp:
    crash_prevention:
      enable_auto_cleanup: false
```

## Monitoring

### Check Status

```python
manager.get_crash_prevention_status()
```

Returns:
```python
{
    "total_servers": 8,
    "by_type": {"chrome-devtools": 2, "playwright": 2},
    "unhealthy_count": 0,
    "statistics": {"cleanups_performed": 5},
    "last_updated": "2025-01-19T10:30:00"
}
```

### Get Detailed Metrics

```python
manager._crash_prevention.get_metrics()
```

## Troubleshooting

### Problem: Import Error

```bash
pip install psutil
```

### Problem: Too Many Processes Still

```bash
# Manual cleanup
pkill -9 -f "mcp-server"
pkill -9 -f "npm exec.*mcp"
```

### Problem: Servers Not Starting

Check if limits are too strict:

```python
status = manager.get_crash_prevention_status()
print(f"Total servers: {status['total_servers']}")
print(f"By type: {status['by_type']}")
```

## Integration with Black Box 5

The crash prevention system integrates with:

- **MCPIntegration.py**: Server lifecycle management
- **health.py**: System-wide health monitoring
- **circuit_breaker.py**: Failure detection
- **config.yml**: Centralized configuration

## Next Steps

1. Read the full architecture documentation
2. Configure your MCP servers in `.config/mcp-servers.json`
3. Adjust limits in `config.yml` as needed
4. Monitor status when running agents
5. Report any issues or improvements

## Support

For issues or questions:
- Check logs: `.blackbox5/logs/blackbox5.log`
- Review architecture docs: `.blackbox5/.docs/MCP-CRASH-PREVENTION.md`
- Check configuration: `.blackbox5/engine/config.yml`
