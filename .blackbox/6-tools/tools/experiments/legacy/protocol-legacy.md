# Black Box Protocol

The **Black Box Protocol** is a standard for distributed AI context management. It defines a localized ".brain" structure (`.blackbox` folder) that lives within major documentation or feature directories.

## Purpose

To provide a consistent, machine-readable, and persistent "memory" for AI agents working within a specific domain. This ensures that context, plans, and experiments are locally scoped and easily retrievable.

## Directory Standard

Every significant folder (e.g., `docs/design`, `docs/feedback`, `docs/seo`) should contain a `.blackbox` directory with the following structure:

```text
[Parent Folder]/
├── ... (domain files)
└── .blackbox/
    ├── context.md          # 🧠 THE BRAIN: High-level overview, constraints, and sensitive context.
    ├── tasks.md            # 📋 THE PLAN: Active checklists and backlog.
    ├── journal.md          # 📜 THE HISTORY: Chronological log of major actions and decisions.
    ├── scratchpad.md       # 📝 THE WORKBENCH: Temporary thoughts, drafts, and active context.
    └── experiments/        # 🧪 THE LAB: Alternative approaches, failed attempts, and rough ideas.
```

## File Specifications

### 1. `context.md` (Read-First)
This is the "System Prompt" for the folder.
- **Goal**: What is the purpose of this parent folder?
- **Rules**: Any specific constraints (e.g., "Do not edit file X", "Use Y naming convention").
- **State**: A brief summary of the current health/completeness of this domain.

### 2. `tasks.md` (The Tracker)
A standardized Markdown checklist.
- Uses `[ ]`, `[/]`, `[x]` syntax.
- Should be updated at the start and end of every session involving this folder.
- Can link to specific files in the parent directory.

### 3. `journal.md` (The Memory)
A persistent append-only log.
- **Format**: `YYYY-MM-DD: [Action] - [Reasoning]`
- Used to prevent circular reasoning or repeating mistakes.
- Should capture "Why" we did something, not just "What".

### 4. `scratchpad.md` (The Volatile Memory)
- Free-form text for the current session.
- Can be wiped or archived after a task is complete.
- Useful for pasting snippets, brainstorming, or holding context between tool calls.

### 5. `experiments/` (The Archive)
- A place to dump complex outputs that aren't ready for the main folder.
- Example: `experiments/v2_redesign_concept.md`.

## The "Black Box Loop"

When an AI Agent enters a folder to perform work:

1.  **READ**: Check `.blackbox/context.md` to understand the domain.
2.  **CHECK**: Read `.blackbox/tasks.md` to see what is pending.
3.  **EXECUTE**: Perform the work (editing files in the parent folder).
4.  **LOG**: 
    *   Update `.blackbox/tasks.md` (mark items done).
    *   Append a summary to `.blackbox/journal.md`.
    *   (Optional) Save failed attempts to `.blackbox/experiments/`.

## Migration Strategy

Existing folders like `docs/feedback/black-box` should be migrated to `docs/feedback/.blackbox` to comply with this standard.
