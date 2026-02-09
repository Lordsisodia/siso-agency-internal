# Signals Directory

**Purpose:** Signal files for inter-process communication and state indication.

---

## Directory Structure

```
signals/
├── pause         # Pause execution
├── resume        # Resume execution
├── stop          # Stop execution
├── checkpoint    # Request checkpoint
└── README.md     # This file
```

---

## Usage

Signal files are used to communicate with running autonomous processes:

### Pause

```bash
touch signals/pause
```

Causes the system to pause after current task.

### Resume

```bash
rm signals/pause  # Remove pause signal
touch signals/resume
```

Resumes paused execution.

### Stop

```bash
touch signals/stop
```

Gracefully stops execution after current task.

### Checkpoint

```bash
touch signals/checkpoint
```

Requests immediate state checkpoint.
