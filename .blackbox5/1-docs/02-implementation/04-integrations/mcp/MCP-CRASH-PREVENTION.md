# MCP Crash Prevention - Black Box 5 Architecture

## Overview

This document describes the MCP (Model Context Protocol) crash prevention system integrated into Black Box 5's architecture. The system prevents VSCode crashes caused by runaway MCP server processes when running multiple Claude Code agents.

## Problem Statement

When running 6+ Claude Code agents simultaneously:
- MCP servers spawn duplicate instances without cleanup
- 125+ node/npm processes running
- CPU spikes (93-99% per process)
- Memory pressure and system compression
- VSCode crashes every ~2 hours

## Architecture Integration

### Black Box 5 Integration Points

The crash prevention system is integrated into Black Box 5's existing architecture:

```
.blackbox5/engine/
├── core/
│   ├── MCPIntegration.py           # MCP server lifecycle management
│   ├── mcp_crash_prevention.py     # NEW: Crash prevention module
│   ├── health.py                   # Health monitoring system
│   ├── circuit_breaker.py          # Circuit breaker for failure detection
│   └── ...
├── config.yml                      # Main configuration with MCP settings
└── .config/
    └── mcp-servers.json             # MCP server definitions
```

### Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     Black Box 5 Engine                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              MCPIntegration.py                          │  │
│  │  - Server discovery and configuration                 │  │
│  │  - Server lifecycle (start/stop)                      │  │
│  │  - Tool enumeration                                   │  │
│  │  - Integration with crash prevention                 │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │          mcp_crash_prevention.py                       │  │
│  │  - Process monitoring with psutil                     │  │
│  │  - Resource limit enforcement                        │  │
│  │  - Automatic cleanup of duplicates/zombies           │  │
│  │  - Health checks with recovery                        │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│          ┌───────────────┼───────────────┐                  │
│          ▼               ▼               ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ health.py   │  │circuit_     │  │ config.yml  │         │
│  │             │  │breaker.py   │  │             │         │
│  │ System-wide │  │ Failure     │  │ Settings    │         │
│  │ monitoring  │  │ detection   │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. MCPCrashPrevention Class (`core/mcp_crash_prevention.py`)

**Purpose**: Monitor MCP server processes and enforce resource limits.

**Key Features**:
- Process monitoring using `psutil`
- Resource limit enforcement (CPU, memory, age)
- Automatic cleanup of duplicate/zombie processes
- Health checks with automatic recovery
- Integration with health monitor and circuit breaker

**Main Methods**:
```python
class MCPCrashPrevention:
    async def start() -> None
        # Start monitoring loops

    async def stop() -> None
        # Stop monitoring

    async def _monitor_loop() -> None
        # Collect metrics and check limits

    async def _cleanup_loop() -> None
        # Periodic cleanup of problematic servers

    def _health_check() -> bool
        # Integration with health.py

    def get_metrics() -> Dict[str, Any]
        # Get current metrics snapshot

    def get_status_summary() -> Dict[str, Any]
        # Get human-readable status
```

### 2. Enhanced MCPManager (`core/MCPIntegration.py`)

**Purpose**: Manage MCP server lifecycle with crash prevention.

**New Methods**:
```python
class MCPManager:
    def __init__(self, ..., enable_crash_prevention: bool = True)
        # Initialize with optional crash prevention

    def _init_crash_prevention(self) -> None
        # Initialize crash prevention system

    def _check_server_limits(self, server_id: str) -> bool
        # Check if starting server would exceed limits

    async def start_crash_prevention(self) -> None
        # Start crash prevention monitoring

    async def stop_crash_prevention(self) -> None
        # Stop crash prevention monitoring

    def get_crash_prevention_status(self) -> Optional[Dict[str, Any]]
        # Get crash prevention status
```

### 3. Configuration (`engine/config.yml`)

**Crash Prevention Settings**:
```yaml
tools:
  mcp:
    enabled: true
    enable_crash_prevention: true
    crash_prevention:
      max_instances_per_type: 2
      max_cpu_percent: 80.0
      max_memory_mb: 500.0
      max_age_seconds: 7200
      health_check_interval: 60
      health_check_timeout: 30
      enable_auto_cleanup: true
      cleanup_interval: 60
      zombie_detection_enabled: true
```

## Usage

### Basic Usage

```python
from core.MCPIntegration import MCPManager

# Create manager with crash prevention enabled
manager = MCPManager(
    config_path=Path(".blackbox5/.config/mcp-servers.json"),
    enable_crash_prevention=True
)

# Start crash prevention monitoring
await manager.start_crash_prevention()

# Start servers (with automatic limit checking)
manager.start_server("playwright")
manager.start_server("chrome-devtools")

# Check crash prevention status
status = manager.get_crash_prevention_status()
print(status)
```

### Integration with Health Monitor

```python
from core.health import HealthMonitor
from core.MCPIntegration import MCPManager

# Create instances
health_monitor = HealthMonitor()
mcp_manager = MCPManager()

# Register with health monitor
health_monitor.register_check(
    "mcp_crash_prevention",
    mcp_manager._crash_prevention._health_check,
    interval=60
)

# Start monitoring
await health_monitor.start_health_monitor(interval=30)
```

## Data Flow

### Server Start Flow

```
1. User calls manager.start_server("playwright")
                     │
                     ▼
2. Check if server exists
                     │
                     ▼
3. Check crash prevention limits (_check_server_limits)
                     │
                     ├─► Get current metrics from crash prevention
                     │
                     ├─► Count existing instances of this type
                     │
                     └─► Return False if at limit
                     │
                     ▼ (if within limits)
4. Start the server process
                     │
                     ▼
5. Add to running_servers
                     │
                     ▼
6. Return success
```

### Monitoring Flow

```
_crash_prevention.start()
     │
     ├─► _monitor_loop()
     │       │
     │       ├─► Collect metrics from all MCP processes
     │       │       - PID, CPU, memory, uptime
     │       │       - Identify server type
     │       │       - Determine status
     │       │
     │       ├─► Check resource limits
     │       │       - CPU > max_cpu_percent?
     │       │       - Memory > max_memory_mb?
     │       │       - Age > max_age_seconds?
     │       │
     │       └─► Sleep health_check_interval
     │
     └─► _cleanup_loop()
             │
             ├─► Check for duplicate instances
             │       - Count by server type
             │       - Kill excess (keep newest)
             │
             ├─► Check for zombie processes
             │       - Compare tracked PIDs to running
             │       - Clean up dead process tracking
             │
             └─► Sleep cleanup_interval
```

## Configuration

### MCPCrashPreventionConfig

```python
@dataclass
class MCPCrashPreventionConfig:
    # Resource limits
    max_instances_per_type: int = 2
    max_cpu_percent: float = 80.0
    max_memory_mb: float = 500.0
    max_age_seconds: int = 7200

    # Health check settings
    health_check_interval: int = 60
    health_check_timeout: int = 30
    restart_max_retries: int = 3
    restart_backoff_seconds: int = 60

    # Auto-cleanup settings
    enable_auto_cleanup: bool = True
    cleanup_interval: int = 60
    zombie_detection_enabled: bool = True

    # Warning thresholds
    warning_cpu_percent: float = 70.0
    warning_memory_mb: float = 300.0
```

### Server Type Detection

The system identifies MCP server types from command lines:

| Server Type | Pattern |
|-------------|---------|
| chrome-devtools | `chrome-devtools-mcp` |
| duckduckgo | `duckduckgo-mcp` |
| playwright | `playwright.*mcp` |
| filesystem | `mcp-server-filesystem` |
| supabase | `supabase.*mcp` |
| sequential-thinking | `sequential-thinking` |
| fetch | `mcp.*fetch` |

## Monitoring and Observability

### Metrics Collected

For each MCP process:
- PID
- Server type
- CPU percentage
- Memory usage (MB)
- Uptime (seconds)
- Status (healthy, degraded, unhealthy, zombie, duplicate)

### Statistics Tracked

- `cleanups_performed`: Total cleanup actions
- `health_checks_failed`: Failed health checks
- `resources_exceeded`: Resource limit violations
- `duplicates_detected`: Duplicate server instances
- `last_cleanup`: Timestamp of last cleanup

### Status Summary

```python
{
    "total_servers": 8,
    "by_type": {
        "chrome-devtools": 2,
        "playwright": 2,
        "fetch": 2,
        "filesystem": 2
    },
    "unhealthy_count": 0,
    "statistics": {
        "cleanups_performed": 5,
        "duplicates_detected": 3
    },
    "last_updated": "2025-01-19T10:30:00"
}
```

## Integration with Existing Systems

### Health Monitor Integration

The crash prevention system registers as a health check:

```python
health_monitor.register_check(
    "mcp_crash_prevention",
    crash_prevention._health_check,
    interval=60
)
```

The health check returns:
- `True` if total processes < 20 and no unhealthy servers
- `False` if thresholds exceeded

### Circuit Breaker Integration

Circuit breakers can be configured per MCP server type:

```python
from core.circuit_breaker import CircuitBreaker

cb = CircuitBreaker("mcp.playwright")
result = cb.call(manager.start_server, "playwright")
```

### Event Bus Integration

Events are published for:
- Server started
- Server stopped
- Cleanup performed
- Resource limit exceeded
- Health check failed

## Troubleshooting

### Common Issues

**Issue**: Too many MCP processes still running
```bash
# Check process count
ps aux | grep -E "npm|npx|node" | grep mcp | wc -l

# Manual cleanup
pkill -9 -f "mcp-server"
pkill -9 -f "npm exec.*mcp"
```

**Issue**: Crash prevention not starting
```python
# Check if psutil is installed
import psutil
print(psutil.__version__)

# Check configuration
from core.MCPIntegration import MCPManager
manager = MCPManager()
print(manager._crash_prevention)
```

**Issue**: Health checks failing
```python
# Check health monitor
health_monitor.get_current_health()

# Check crash prevention status
manager.get_crash_prevention_status()
```

## Future Enhancements

1. **Predictive Prevention**: Analyze crash patterns to predict failures
2. **Adaptive Limits**: Adjust limits based on system resources
3. **Graceful Degradation**: Disable problematic tools automatically
4. **Cross-Server Coordination**: Prevent cascading failures
5. **Performance Optimization**: Balance resource usage

## Related Documentation

- `core/MCPIntegration.py` - MCP server management
- `core/health.py` - Health monitoring system
- `core/circuit_breaker.py` - Circuit breaker pattern
- `engine/config.yml` - Configuration reference
