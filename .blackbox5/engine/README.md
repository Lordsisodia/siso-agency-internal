# Black Box 5 Engine

The core AI execution engine for the SISO-INTERNAL ecosystem. Implements BMAD and GSD methodologies with a robust, production-ready architecture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLACK BOX 5 ENGINE                           │
│                      (Pure Python)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Kernel     │  │    Config    │  │  Lifecycle   │          │
│  │  (Singleton) │  │  (Multi-strat)│  │   Manager    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Registry   │  │    Health    │  │    Logger    │          │
│  │  (Services)  │  │   Monitor    │  │ (Structured) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │  Brain   │ │  Agents  │ │  Tools   │ │Frameworks│    │   │
│  │  │   (RAG)  │ │ (BMAD)   │ │ (GSD)    │ │          │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Layer                              │   │
│  │  ┌──────────────┐      ┌──────────────┐                  │   │
│  │  │   FastAPI    │      │  WebSocket   │                  │   │
│  │  │    REST      │      │   Events     │                  │   │
│  │  └──────────────┘      └──────────────┘                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. EngineKernel (`core/kernel.py`)
Central singleton that manages all engine services.

**Features:**
- Service registry with dependency-aware initialization
- Run level management (DEAD, MINIMAL, DEGRADED, FULL)
- Parallel service loading
- Graceful degradation

**Usage:**
```python
from core.kernel import kernel

# Register a service
kernel.register_service(ServiceConfig(
    name="my_service",
    service_class=MyService,
    lazy=True
))

# Start all services
await kernel.start_all_services()

# Get health status
status = kernel.get_health_status()
```

### 2. ConfigManager (`core/config.py`)
Multi-strategy configuration loading with fallbacks.

**Strategies (tried in order):**
1. **Cache** - In-memory cache (fastest)
2. **File** - Direct file read (`config.yml`)
3. **Registry** - Service registry lookup
4. **Defaults** - Built-in defaults (last resort)

**Usage:**
```python
from core.config import ConfigManager

# Load with multi-strategy fallback
config = ConfigManager.load()

# Get values with dot notation
port = config.get("api.port", default=8000)

# Reload configuration
config = ConfigManager.reload()
```

### 3. ServiceRegistry (`core/registry.py`)
Manages service lifecycle, health monitoring, and dependency resolution.

**Features:**
- Factory pattern for service instantiation
- Dependency-aware initialization order
- Automatic health checks with recovery
- Lazy loading for performance

**Usage:**
```python
from core.registry import ServiceRegistry, Service, ServiceConfig

# Define a service
class MyService(Service):
    async def initialize(self):
        # Setup
        pass

    async def start(self):
        # Start
        pass

    async def stop(self):
        # Cleanup
        pass

    def is_healthy(self) -> bool:
        return True

# Register service
registry.register(ServiceConfig(
    name="my_service",
    service_class=MyService,
    dependencies=["other_service"]
))
```

### 4. HealthMonitor (`core/health.py`)
Continuous health monitoring with automatic recovery.

**Features:**
- Custom health checks
- Built-in system checks (disk, memory, CPU)
- Health history tracking
- Uptime statistics
- Failure threshold management

**Usage:**
```python
from core.health import HealthMonitor, BuiltInChecks

# Create monitor
monitor = HealthMonitor(service_registry=registry)

# Register custom check
monitor.register_check(
    "my_check",
    lambda: True,  # Your check function
    interval=30
)

# Register built-in checks
monitor.register_check("disk", BuiltInChecks.disk_space())
monitor.register_check("memory", BuiltInChecks.memory_available())

# Start monitoring
await monitor.start_health_monitor(interval=30)

# Get current health
health = monitor.get_current_health()
```

### 5. LifecycleManager (`core/lifecycle.py`)
Manages engine lifecycle from initialization to shutdown.

**Features:**
- State transitions with validation
- Graceful shutdown with signals
- Lifecycle hooks (pre/post state changes)
- Shutdown timeout handling

**Usage:**
```python
from core.lifecycle import LifecycleManager, LifecycleState

lifecycle = LifecycleManager()

# Register hooks
lifecycle.register_hook(
    LifecycleState.STARTING,
    lambda: print("Starting!"),
    before=True
)

# Transition states
await lifecycle.transition_to(LifecycleState.STARTING)

# Graceful shutdown
await lifecycle.shutdown(shutdown_func, timeout=30)
```

## Installation

```bash
# Navigate to engine directory
cd .blackbox5/engine

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Copy the example configuration:

```bash
cp config.example.yml config.yml
```

Edit `config.yml` to customize settings.

## Running the Engine

### Method 1: Enhanced Boot Script

```bash
# Run with default config
python -m core.boot_enhanced

# Run with custom config
python -m core.boot_enhanced /path/to/config.yml
```

### Method 2: API Server Only

```bash
# Run API server
python -m api.server

# Run with custom host/port
python -m api.server --host 0.0.0.0 --port 8000

# Run with auto-reload (development)
python -m api.server --reload
```

## API Endpoints

### Status & Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root endpoint with info |
| `/status` | GET | Engine status and run level |
| `/health` | GET | Basic health check |
| `/health/detailed` | GET | Detailed health with services |
| `/health/history` | GET | Health check history |
| `/health/uptime` | GET | Uptime statistics |

### Services

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/services` | GET | List all services |
| `/services/{name}` | GET | Get service status |

### Configuration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/config` | GET | Get current config |
| `/config/reload` | POST | Reload configuration |

### Control

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/engine/shutdown` | POST | Initiate graceful shutdown |

### Documentation

| Endpoint | Description |
|----------|-------------|
| `/docs` | Interactive API docs (Swagger UI) |
| `/redoc` | Alternative API docs (ReDoc) |

## Run Levels

The engine operates in four run levels:

| Level | Name | Description |
|-------|------|-------------|
| 0 | DEAD | Critical failure, cannot operate |
| 1 | MINIMAL | Core only, no agents/tools |
| 2 | DEGRADED | Some components failed |
| 3 | FULL | Everything working |

The engine automatically calculates its run level based on service health.

## Service Implementation

To implement a new service:

```python
from core.registry import Service

class MyService(Service):
    def __init__(self, name: str):
        super().__init__(name)
        # Your initialization

    async def initialize(self) -> None:
        """Called once when service is first created"""
        pass

    async def start(self) -> None:
        """Called when engine starts"""
        pass

    async def stop(self) -> None:
        """Called when engine stops"""
        pass

    def is_healthy(self) -> bool:
        """Health check"""
        return True

    async def recover(self) -> bool:
        """Attempt recovery from failure"""
        # Default implementation restarts the service
        return await super().recover()
```

Then register it in the boot script:

```python
from core.registry import ServiceConfig

registry.register(ServiceConfig(
    name="my_service",
    service_class=MyService,
    enabled=True,
    lazy=True,
    dependencies=[],
    auto_recover=True
))
```

## Development

### Project Structure

```
engine/
├── core/                   # Core engine systems
│   ├── kernel.py          # EngineKernel singleton
│   ├── config.py          # ConfigManager
│   ├── registry.py        # ServiceRegistry
│   ├── health.py          # HealthMonitor
│   ├── lifecycle.py       # LifecycleManager
│   ├── boot.py            # Original boot script
│   └── boot_enhanced.py   # Enhanced boot with new architecture
├── api/                    # API layer
│   └── server.py          # FastAPI server
├── agents/                 # Agent system (to be implemented)
├── frameworks/             # BMAD/GSD frameworks (to be implemented)
├── tools/                  # Core tools (existing)
├── brain/                  # RAG system (to be implemented)
├── config.example.yml      # Example configuration
├── config.yml              # Actual configuration (create this)
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test
pytest tests/test_kernel.py
```

### Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Type check
mypy .
```

## Implementation Status

### ✅ Completed (Phase 1)

- [x] EngineKernel singleton
- [x] ConfigManager with multi-strategy loading
- [x] ServiceRegistry with factory pattern
- [x] HealthMonitor with continuous checks
- [x] LifecycleManager for startup/shutdown
- [x] Enhanced boot script
- [x] FastAPI server with lifespan events
- [x] Example configuration

### 🚧 In Progress (Phase 2)

- [ ] Service implementations (Brain, Agents, Tools)
- [ ] WebSocket server
- [ ] Agent orchestration system

### 📋 Planned (Phase 3+)

- [ ] BMAD framework implementation
- [ ] GSD framework implementation
- [ ] Brain/RAG system with vector search
- [ ] Agent system with 12+ specialized agents
- [ ] Tool system with MCP integrations

## Design Principles

1. **First Principles** - Built from fundamentals, not copied
2. **Simplicity** - Simple on the surface, sophisticated underneath
3. **Modularity** - Clean separation of concerns
4. **Reliability** - Graceful degradation, not total failure
5. **Observability** - Comprehensive health monitoring
6. **Extensibility** - Easy to add new services and features

## Documentation

- [Engine Architecture](../memory/context/ENGINE-ARCHITECTURE-v1.md)
- [Initialization Design](../memory/context/ENGINE-INITIALIZATION-DESIGN.md)

## License

Internal use only - SISO-INTERNAL project

---

**Built with first principles thinking and industry best practices.**
