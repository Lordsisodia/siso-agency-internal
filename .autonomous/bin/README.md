# Bin Directory

**Purpose:** Executable scripts and command-line tools.

---

## Directory Structure

```
bin/
├── task              # Task management CLI
├── run-agent         # Agent execution script
├── collect-metrics   # Metrics collection
└── README.md         # This file
```

---

## Available Scripts

### task

Task management CLI.

```bash
./bin/task list                    # List all tasks
./bin/task next                    # Show next available task
./bin/task status TASK-001         # Show task details
```

### run-agent

Execute an agent.

```bash
./bin/run-agent analyzer --task TASK-001
./bin/run-agent scout --query "find auth code"
```

---

## Adding New Scripts

1. Create script file
2. Make executable: `chmod +x bin/script-name`
3. Add to this README
