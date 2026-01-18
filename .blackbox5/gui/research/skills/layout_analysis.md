# Skills Section Layout Research & Recommendation

## Objective
Design the most effective layout for the "Skills" section of the Black Box GUI.

## Deep Research Findings

### 1. SpecKid / Spec-Driven UI
*   **Key Concept**: "Spec-Driven Development".
*   **UI Application**: The GUI should be a **visualizer for the specs** (Markdown/YAML files).
*   **Design Traits**: High contrast hierarchy, clear grouping of related specs, and "scannable" content. The UI should look like formatted documentation but feel like an interactive app.

### 2. BMAD (Agile AI Development)
*   **Key Concept**: Orchestration via Blueprints.
*   **UI Application**: Skills are not just static text; they are **Blueprints** for agent behavior.
*   **Visualization**: Show "Flows" or "Pipelines". If a skill has steps, visualize them as a vertical timeline or checklist.

### 3. AI Agent Dashboards
*   **Key Features**:
    *   **Capability Toggles**: Checkboxes to enable/disable specific skills for specific agents.
    *   **Transparency**: clearly show *why* an agent used a skill.
    *   **Simulation**: A "Playground" to test a skill in isolation.

## Refined Design Proposal: "The Capability Matrix"

### Layout Structure
**A. The Sidebar (Context)**
*   **Filters**: By Agent (Orchestrator, Executor), By Phase (Plan, Build, Verify).
*   **Status**: Active vs Inactive skills.

**B. The Main Grid (Discovery)**
*   **Visual Style**: "Premium Glassmorphism" cards.
*   **Card Content**:
    *   **Header**: Skill Icon + Name (e.g., "Atomic Planning").
    *   **Visual Indicator**: A mini-progress bar or flow icon indicating complexity.
    *   **Badges**: `Orchestrator Only`, `High Priority`.
    *   **Metric**: "Used 145 times".

**C. The Detail View (Blueprint Editor)**
*   **Split Screen**:
    *   **Left**: The Raw Markdown/YAML (Code Editor).
    *   **Right**: A "Rendered View" showing the logical flow of the skill (Flowchart or Step-by-Step list).

### Mockup (Text)
```
+-----------------------------------------------------------------------+
|  [Search Skills...]              [Filter: All] [Sort: Most Used]      |
+-----------------------------------------------------------------------+
|  +---------------------+  +---------------------+  +----------------+ |
|  | 🧭 Atomic Planning  |  | 🔨 Atomic Exec      |  | ✅ Goal-Back   | |
|  | ------------------  |  | ------------------  |  | -------------  | |
|  | [Orchestrator]      |  | [Executor]          |  | [All Agents]   | |
|  |                     |  |                     |  |                | |
|  | Steps: 5            |  | Steps: 3            |  | Type: Check    | |
|  | Usage: High         |  | Usage: Peak         |  | Risk: Low      | |
|  |                     |  |                     |  |                | |
|  | [ Test ]  [ Edit ]  |  | [ Test ]  [ Edit ]  |  | [ Test ]       | |
|  +---------------------+  +---------------------+  +----------------+ |
|                                                                       |
|  +---------------------+  +---------------------+                     |
|  | 🧠 Context Mgmt     |  | 🐙 GitOps Wrapper   |                     |
|  | ...                 |  | ...                 |                     |
+-----------------------------------------------------------------------+
```
