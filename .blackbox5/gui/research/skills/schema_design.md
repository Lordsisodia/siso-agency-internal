# Skill File Schema Design

## Objective
Define the standard **"Code Layout"** for a `.md` skill file in `.blackbox5/engine/skills/`.
This layout must serve two masters:
1.  **The AI Agent**: Needs clear, unambiguous instructions (GSD/BMAD style).
2.  **The GUI**: Needs metadata to render cards, badges, and filters (Spec-Driven style).

## Proposed Schema Structure

Every skill file will follow this strict structure:

### 1. YAML Frontmatter (The "Header")
Used by the GUI to render the "Skill Card".

```yaml
---
name: "Atomic Planning"
description: "Break down complex goals into executed waves."
type: "workflow"        # workflow | action | verify | analysis
agent: "orchestrator"   # orchestrator | executor | all
icon: "🧭"
complexity: "high"      # low | medium | high
risk: "critical"        # low | medium | critical
context_cost: "medium"  # low | medium | high
tags: ["planning", "gsd", "core"]
version: "1.0.0"
---
```

### 2. The Spec (The "Contract")
Defines what this skill *consumes* and *produces*. Useful for "Chain of Thought" reasoning.

```markdown
# 🧭 Atomic Planning

> **Purpose**: Break large goals into atomic, executable plans that fit within the Context Budget.

## Input / Output
*   **Input**: User Goal (String), Context State (Dict)
*   **Output**: `implementation_plan.md` (Artifact)
```

### 3. Core Logic (The "Blueprint")
The actual instructions, formatted as a "Blueprint" for the agent.

```markdown
## ⚙️ The Blueprint

### Step 1: Analyze Context
*   Check `ContextManager.health`.
*   If `status == "DEGRADING"`, stop and request context scaling.

### Step 2: Decomposition
*   **Rule**: Max 3 tasks per wave.
*   **Rule**: Each task must be verifiable.

### Step 3: YAML Generation
Generate the plan using this strict schema:
...
```

### 4. Examples (The "Training")
Few-shot examples to ensure consistent output.

```markdown
## 📝 Examples

### Example 1: Creating a Login Page
**User**: "Build a login page"
**Agent**:
\`\`\`yaml
phase: "01"
tasks:
  - name: "Scaffold Component"
...
\`\`\`
```

## Why this Layout?
1.  **Parsable**: The Frontmatter allows the GUI to treat skills as *objects* (filtering, sorting).
2.  **Structured**: The "Blueprint" section uses BMAD's "Building Block" philosophy.
3.  **Verifiable**: The Input/Output spec makes it easier to write tests for skills later.
