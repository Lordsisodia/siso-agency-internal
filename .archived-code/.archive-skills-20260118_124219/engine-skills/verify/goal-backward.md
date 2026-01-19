# Skill: Goal-Backward Verification (GSD)

**Purpose:** Verify that software actually works, not just that files exist.

## The 3-Level Check
When verifying a task, you must confirm:

1.  **Existence (L1):** Does the file exist?
    *   *Check:* `ls src/components/Button.tsx`
    *   *Status:* 🟡 Weak.

2.  **Substantive (L2):** Is it real code?
    *   *Check:* Read file. Is it a stub? Does it have logic?
    *   *Status:* 🟠 Better.

3.  **Wired (L3):** Is it connected?
    *   *Check:* Search for imports. `grep -r "Button" src/`
    *   *Check:* Is it exported? Is it used in the parent?
    *   *Status:* 🟢 VERIFIED.

## Instructions
*   **NEVER** say "Task complete" just because you wrote the file.
*   **ALWAYS** prove it is "Wired" (L3).
*   If L3 fails, the Task is **FAILED**. Fix it immediately.
