# Skill: Atomic Execution (GSD)

**Purpose:** Execute tasks with high precision and perfect git history.

## Core Rules
1.  **One Task = One Commit.** Never bundle tasks.
2.  **Verify First.** Never commit broken code.
3.  **Clean State.** Start clean, end clean.

## Execution Loop
For each Task in Plan:
1.  **READ** the task requirements.
2.  **EDIT** the code (using tools).
3.  **VERIFY** the change (run tests/build).
4.  **COMMIT** using `git_ops.commit_task()`:
    *   `type`: feat/fix/refactor
    *   `scope`: phase-plan (e.g., 01-02)
    *   `desc`: Concise summary
5.  **NEXT** task.
