---
name: deep-research
category: collaboration-communication/thinking-methodologies
version: 1.0.0
description: Turn ambiguous questions into documented, executable plans with traceable artifacts
author: blackbox5/core
verified: true
tags: [research, planning, documentation, traceability]
---

# Deep Research

<context>
Turn an ambiguous question into a **documented, executable plan** and then execute it while **ticking off** progress.

This skill is designed for "research work" where outcomes matter and you want traceability:
- what sources were used
- what decisions were made
- what remains to do
</context>

<instructions>
Deep research requires creating a plan BEFORE executing. Always create a plan folder, document the goal, list required reading, and then execute while marking progress.

The key differentiator is traceability - anyone should be able to see what you researched, what sources you used, what you concluded, and why.
</instructions>

<workflow>
  <phase name="Clarify Goal">
    <goal>Ensure you understand what success looks like</goal>
    <steps>
      <step>Ask 1-3 clarifying questions max (if needed)</step>
      <step>Identify desired outcome (what "done" looks like)</step>
      <step>Understand constraints (time, scope, tools, budget, style)</step>
      <step>Determine where answer will live (docs vs code vs both)</step>
    </steps>
  </phase>

  <phase name="Identify Docs Needed">
    <goal>Create explicit list of what to read and why</goal>
    <steps>
      <step>List Must-read docs (directly impacts decision/output)</step>
      <step>List Should-read docs (useful context)</step>
      <step>List Nice-to-have docs (optional, if time)</step>
      <step>For each doc, write path and what you expect to learn</step>
    </steps>
  </phase>

  <phase name="Create Plan File">
    <goal>Save plan structure before doing the work</goal>
    <steps>
      <step>Use new-plan.sh script: ./scripts/new-plan.sh "research-topic"</step>
      <step>Include goal in plan</step>
      <step>Add created timestamp</step>
      <step>Add optional target date (if user provided one)</step>
      <step>Create checklist of steps (task list)</step>
      <step>Add "Docs to Read" section from previous phase</step>
    </steps>
    <output>Plan folder saved in agents/.plans/</output>
  </phase>

  <phase name="Execute and Track">
    <goal>Do the research while ticking off progress</goal>
    <steps>
      <step>Mark each step [x] as completed</step>
      <step>Add inline completion time for longer steps</step>
      <step>Capture artifacts as you go</step>
    </steps>
    <artifacts>
      <artifact>artifacts/sources.md — every source + what it supports</artifact>
      <artifact>artifacts/summary.md — short synthesis</artifact>
      <artifact>artifacts/extracted.json — structured data (when possible)</artifact>
      <artifact>artifacts/raw.md — full raw output (optional; may be gitignored)</artifact>
    </artifacts>
  </phase>

  <phase name="Produce Deliverables">
    <goal>Share findings and next steps</goal>
    <steps>
      <step>Summary of what you concluded</step>
      <step>What docs/sources were used</step>
      <step>Any follow-ups / next plan</step>
    </steps>
  </phase>

  <phase name="Write Reusable Knowledge">
    <goal>Save learnings back into Black Box (optional)</goal>
    <steps>
      <step>If research is reusable, save in .knowledge/deepresearch/</step>
      <step>Link from plan under "Artifacts"</step>
    </steps>
  </phase>

  <phase name="Route Deliverables">
    <goal>Organize and update knowledge ledger</goal>
    <steps>
      <step>Organize knowledge artifacts in appropriate .knowledge/ subdirectories</step>
      <step>Update .knowledge/LEDGER.md if it exists</step>
      <step>Ensure all work outside .blackbox/ is tracked</step>
    </steps>
  </phase>
</workflow>

<rules>
  <rule>Plan must exist before execution begins</rule>
  <rule>Docs needed must be explicit, not hand-wavy</rule>
  <rule>Steps must be small enough to tick off meaningfully</rule>
  <rule>Final output must reference the plan and artifacts</rule>
  <rule>If writing outside .blackbox/, update LEDGER.md</rule>
</rules>

<output_format>
Required outputs:
1. Plan folder in agents/.plans/
2. Run artifacts under plan folder (recommended: artifacts/)
3. Knowledge ledger entry if anything written outside .blackbox/

Optional outputs:
4. Research note in .knowledge/deepresearch/ if reusable
</output_format>

<examples>
  <example>
    <scenario>User asks: "Research the best approach for state management in our React app"</scenario>
    <process>
      <step>Phase 1: Clarify - Confirm we're comparing Redux vs Zustand vs Jotai, need decision within 2 days</step>
      <step>Phase 2: Doc Map - List relevant docs, articles, benchmark comparisons</step>
      <step>Phase 3: Create Plan - ./scripts/new-plan.sh "state-management-research"</step>
      <step>Phase 4: Execute - Read docs, tick off progress, capture artifacts</step>
      <step>Phase 5: Deliver - Recommendation with pros/cons table</step>
      <step>Phase 6: Save - Write reusable comparison to .knowledge/deepresearch/</step>
      <step>Phase 7: Route - Update LEDGER.md with entry</step>
    </process>
  </example>
</examples>

<integration_notes>
Use this skill when:
- User asks for "research", "investigate", "compare", "evaluate", "find options", "decide between"
- Task has unknowns and requires reading multiple docs/notes
- You expect follow-up iterations and want an audit trail

Triggers:
- "I need to research..."
- "What's the best approach for..."
- "Compare these options..."
- "Investigate whether..."
</integration_notes>

<error_handling>
If user prompt is missing critical context:
- Ask only what's needed to proceed (1-3 questions max)
- Don't ask everything at once
- Make reasonable assumptions if possible

If docs aren't available:
- Note what's missing in plan
- Proceed with available information
- Flag as assumption to verify later
</error_handling>

<related_skills>
  <skill>first-principles-thinking</skill>
  <skill>docs-routing</skill>
  <skill>intelligent-routing</skill>
</related_skills>

<see_also>
  <resource>agents/.plans/ - Plan storage location</resource>
  <resource>.knowledge/deepresearch/ - Reusable research storage</resource>
  <resource>.knowledge/LEDGER.md - Knowledge tracking ledger</resource>
</see_also>
