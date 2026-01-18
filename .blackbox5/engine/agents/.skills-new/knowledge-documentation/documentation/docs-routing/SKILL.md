---
name: docs-routing
category: knowledge-documentation/documentation
version: 1.0.0
description: Ensure every meaningful output lands in the right place and stays findable
author: blackbox5/core
verified: true
tags: [documentation, routing, organization, knowledge-management]
---

# Docs Routing + Ledger

<context>
Ensure that every meaningful output lands in the **right place** and stays **findable later**.

This skill prevents "we did work but can't find it" by requiring:
- a canonical destination
- a traceable artifact pointer
- a ledger entry
</context>

<instructions>
When creating or moving documentation outside `.blackbox/`, always:
1. Decide if it's canonical knowledge or a temporary artifact
2. Route canonical knowledge to `.knowledge/` structure
3. Keep artifacts inside plan folders
4. Update the knowledge ledger
5. Leave pointers between artifacts and canonical docs

The goal is traceability - anyone should be able to find what was created, where it lives, and what supporting artifacts exist.
</instructions>

<workflow>
  <phase name="Determine Content Type">
    <goal>Classify content as canonical or artifact</goal>
    <steps>
      <step>Decide: Is this reusable knowledge (canonical) or raw output (artifact)?</step>
      <step>Artifacts (raw dumps, sources, extracts) → plan folder (`artifacts/`)</step>
      <step>Canonical knowledge (what should be reused) → `.knowledge/` structure</step>
      <step>Reusable research → `.knowledge/deepresearch/` (then link to plan artifacts)</step>
    </steps>
  </phase>

  <phase name="Route to Destination">
    <goal>Place content in correct location</goal>
    <steps>
      <step>For artifacts: Save in plan folder's `artifacts/` subdirectory</step>
      <step>For canonical knowledge: Determine appropriate `.knowledge/` subdirectory</step>
      <step>For reusable research: Save in `.knowledge/deepresearch/`</step>
      <step>Create directory structure if it doesn't exist</step>
    </steps>
  </phase>

  <phase name="Leave Pointers">
    <goal>Link artifacts and canonical docs bidirectionally</goal>
    <steps>
      <step>In canonical doc: Include link to supporting artifacts (plan folder path)</step>
      <step>In plan: Include link to canonical summary (doc path)</step>
      <step>Ensure relationship is traceable in both directions</step>
    </steps>
  </phase>

  <phase name="Update Ledger">
    <goal>Record in knowledge ledger for discoverability</goal>
    <steps>
      <step>Append one line to `.knowledge/LEDGER.md`</step>
      <step>Format: `YYYY-MM-DD — <type> — <topic> — <knowledge path> — artifacts: <plan path>`</step>
      <step>Ensure ledger entry is accurate and complete</step>
    </steps>
  </phase>

  <phase name="Update Indexes">
    <goal>Ensure discoverability through indexes and READMEs</goal>
    <steps>
      <step>Update destination folder's index/README if needed</step>
      <step>Add cross-references to related docs</step>
      <step>Update any relevant navigation or catalog files</step>
    </steps>
  </phase>
</workflow>

<rules>
  <rule>Always decide canonical vs artifact before placing content</rule>
  <rule>Artifacts stay in plan folders, canonical knowledge goes to .knowledge/</rule>
  <rule>Always leave bidirectional pointers between artifacts and canonical docs</rule>
  <rule>Always append to LEDGER.md when writing outside .blackbox/</rule>
  <rule>Never create orphaned content without traceability</rule>
</rules>

<routing_rules>
  <rule type="canonical">
    <description>Reusable knowledge that should be referenced long-term</description>
    <destination>.knowledge/ subdirectories organized by topic</destination>
    <examples>Best practices, architecture decisions, research summaries</examples>
  </rule>
  <rule type="artifact">
    <description>Raw outputs, sources, temporary working files</description>
    <destination>Plan folder `artifacts/` subdirectory</destination>
    <examples>Raw data, source lists, intermediate outputs</examples>
  </rule>
  <rule type="reusable-research">
    <description>Research that produces reusable insights</description>
    <destination>.knowledge/deepresearch/</destination>
    <relationship>Link back to plan artifacts for full context</relationship>
  </rule>
</routing_rules>

<best_practices>
  <practice>Always use the ledger - it's the single source of truth for what exists where</practice>
  <practice>Keep artifacts raw and unprocessed</practice>
  <practice>Make canonical knowledge polished and standalone</practice>
  <practice>Use descriptive filenames that indicate content type</practice>
  <practice>Include dates in ledger entries for chronological tracking</practice>
  <practice>Update indexes proactively, not reactively</practice>
</best_practices>

<anti_patterns>
  <pattern>Create docs without updating ledger</pattern>
  <pattern>Mix artifacts and canonical knowledge in same location</pattern>
  <pattern>Forget to link canonical docs back to their source artifacts</pattern>
  <pattern>Use vague filenames that don't indicate content</pattern>
  <pattern>Skip updating indexes - "I'll do it later"</pattern>
</anti_patterns>

<examples>
  <example>
    <scenario>Research produces reusable best practices document</scenario>
    <process>
      <step>Phase 1: Classify as "canonical knowledge" (reusable best practices)</step>
      <step>Phase 2: Save in .knowledge/best-practices/api-design.md</step>
      <step>Phase 3: In doc, add "Artifacts: agents/.plans/api-research/artifacts/"</step>
      <step>Phase 4: Append to LEDGER.md: "2026-01-18 — best-practices — API design — .knowledge/best-practices/api-design.md — artifacts: agents/.plans/api-research/"</step>
      <step>Phase 5: Update .knowledge/best-practices/README.md with new entry</step>
    </process>
  </example>

  <example>
    <scenario>Quick analysis that's not reusable</scenario>
    <process>
      <step>Phase 1: Classify as "artifact" (temporary, not reusable)</step>
      <step>Phase 2: Save in agents/.plans/quick-analysis/artifacts/summary.md</step>
      <step>Phase 3: No canonical doc needed, skip pointer step</step>
      <step>Phase 4: No ledger entry (stays in .blackbox/)</step>
      <step>Phase 5: No index update (internal work only)</step>
    </process>
  </example>
</examples>

<integration_notes>
Use this skill when:
- Creating new docs outside .blackbox/
- Moving or renaming docs
- Promoting research results into visible docs
- Organizing existing knowledge

This skill integrates with:
- deep-research - Research outputs need proper routing
- intelligent-routing - For determining where things go
- first-principles-thinking - Analysis outputs often need routing
</integration_notes>

<output_format>
Ledger entry format:
```
YYYY-MM-DD — <type> — <topic> — <knowledge path> — artifacts: <plan path>
```

Example:
```
2026-01-18 — research — state management comparison — .knowledge/deepresearch/state-management.md — artifacts: agents/.plans/state-research/
```

Types:
- research
- best-practices
- architecture
- decision
- tutorial
- reference
</output_format>

<error_handling>
If LEDGER.md doesn't exist:
- Create it at .knowledge/LEDGER.md
- Add header explaining purpose
- Start with first entry

If .knowledge structure doesn't exist:
- Create appropriate subdirectories
- Add README.md explaining organization
- Document structure choices

If destination is unclear:
- Use intelligent-routing to determine best location
- Create new subdirectory if warranted
- Document decision in folder's .purpose.md
</error_handling>

<related_skills>
  <skill>deep-research</skill>
  <skill>intelligent-routing</skill>
  <skill>first-principles-thinking</skill>
</related_skills>

<see_also>
  <resource>.knowledge/LEDGER.md - Knowledge tracking ledger</resource>
  <resource>.knowledge/deepresearch/ - Reusable research storage</resource>
  <resource>agents/.plans/ - Plan and artifact storage</resource>
</see_also>
