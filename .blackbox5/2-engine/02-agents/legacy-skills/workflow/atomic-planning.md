# Skill: Atomic Planning (GSD)

**Purpose:** Break large goals into atomic, executable plans that fit within the Context Budget.

## Core Rules
1.  **Tiny Plans:** A plan should contain only 2-3 Tasks.
2.  **Context Target:** Design plans to consume max 50% of context window.
3.  **Wave Execution:** Group tasks into "Waves" that can run in parallel.

## Plan Structure (YAML)
```yaml
phase: "01"
plan: "02"
type: "feature"
wave: 1
autonomous: true
objective: "Implement Login Endpoint"
tasks:
  - name: "Create JWT Utility"
    files: ["src/lib/jwt.ts"]
    action: "Implement sign/verify functions"
    verify: "Unit test for expiry"
    
  - name: "Create Login Route"
    files: ["src/api/login.ts"]
    action: "POST endpoint using JWT utility"
    verify: "Curl request returns 200"
```

## Instructions for Agents
*   **WHEN** user asks for a feature...
*   **DO NOT** write a 10-step plan.
*   **DO** write three 3-step plans (e.g., 01-01, 01-02, 01-03).
*   **CHECK** `context_manager.check_health()` before starting a new plan.
