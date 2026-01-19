---
name: intelligent-routing
category: collaboration-communication/thinking-methodologies
version: 1.0.0
description: Enable AI to make intelligent decisions about where to place new things and how to find existing things
author: blackbox5/core
verified: true
tags: [routing, organization, file-placement, discovery]
---

# Intelligent Routing

<context>
Enable AI to make intelligent decisions about where to place new things and how to find existing things in Blackbox5.

This skill ensures consistent organization, making everything discoverable and maintainable.
</context>

<instructions>
When placing or finding items in Blackbox5, always follow the four-phase framework: Identify, Route, Validate, Complete.

Use the Type Routing Table from SEMANTIC-INDEX.md, apply Specific Rules from PLACEMENT-RULES.md, and validate against Core Principles.
</instructions>

<workflow>
  <phase name="Identify">
    <goal>Determine what type of thing this is</goal>
    <steps>
      <step>Determine the type using identification questions</step>
      <step>Resolve ambiguous types with clarifying questions</step>
      <step>Document the type: "This is a [TYPE]"</step>
    </steps>
    <type_identification>
      <question>Is it an Agent? (AI entity with its own prompt/behavior)</question>
      <question>Is it a Skill? (Reusable workflow/framework)</question>
      <question>Is it a Plan? (Project with tasks/checklist)</question>
      <question>Is it a Library? (Reusable code)</question>
      <question>Is it a Script? (Executable code)</question>
      <question>Is it a Template? (Reusable pattern)</question>
      <question>Is it a Document? (Documentation/explanation)</question>
      <question>Is it a Test? (Test code)</question>
      <question>Is it a Config? (Configuration/settings)</question>
      <question>Is it a Memory? (Working knowledge)</question>
      <question>Is it a Runtime? (Execution state)</question>
      <question>Is it a Module? (Functional unit with agents)</question>
      <question>Is it a Framework? (Framework pattern)</question>
      <question>Is it a Tool? (Maintenance/utility)</question>
      <question>Is it a Workspace? (Active work area)</question>
      <question>Is it an Example? (Demonstration)</question>
    </type_identification>
  </phase>

  <phase name="Route">
    <goal>Determine where it goes based on type</goal>
    <steps>
      <step>Apply Type Routing Table from SEMANTIC-INDEX.md</step>
      <step>Apply Specific Rules from PLACEMENT-RULES.md</step>
      <step>Determine exact path: [primary-location]/[specific-path]/[filename]</step>
    </steps>
    <type_routing_table>
      <route type="Agent" location="1-agents/"></route>
      <route type="Skill" location="1-agents/.skills/"></route>
      <route type="Plan" location=".plans/"></route>
      <route type="Library" location="4-scripts/lib/"></route>
      <route type="Script" location="4-scripts/"></route>
      <route type="Template" location="5-templates/"></route>
      <route type="Document" location=".docs/"></route>
      <route type="Test" location="8-testing/"></route>
      <route type="Config" location=".config/"></route>
      <route type="Memory" location=".memory/"></route>
      <route type="Runtime" location=".runtime/"></route>
      <route type="Module" location="3-modules/"></route>
      <route type="Framework" location="2-frameworks/"></route>
      <route type="Tool" location="6-tools/"></route>
      <route type="Workspace" location="7-workspace/"></route>
      <route type="Example" location="1-agents/*-examples/"></route>
    </type_routing_table>
  </phase>

  <phase name="Validate">
    <goal>Ensure the location is correct using core principles</goal>
    <steps>
      <step>Apply Principle 1: Type Consistency</step>
      <step>Apply Principle 2: Co-location</step>
      <step>Apply Principle 3: Number Alignment</step>
      <step>Apply Principle 4: Hidden vs Visible</step>
      <step>Apply Principle 5: Single Source of Truth</step>
      <step>Resolve conflicts if multiple locations seem valid</step>
    </steps>
    <validation_principles>
      <principle number="1" name="Type Consistency">
        Does this match where other things of this type go?
      </principle>
      <principle number="2" name="Co-location">
        Is it near related things?
      </principle>
      <principle number="3" name="Number Alignment">
        Does the number prefix match the layer? (1-*=agents, 4-*=scripts, 8-*=testing)
      </principle>
      <principle number="4" name="Hidden vs Visible">
        Should this be hidden (system) or visible (user-facing)?
      </principle>
      <principle number="5" name="Single Source of Truth">
        Does this already exist elsewhere?
      </principle>
    </validation_principles>
    <conflict_resolution>
      <resolution>Primary Purpose - What is the MAIN purpose?</resolution>
      <resolution>Primary User - Who primarily uses it?</resolution>
      <resolution>Primary Usage - Where is it primarily used?</resolution>
      <resolution>Most Specific - Use most specific category</resolution>
    </conflict_resolution>
  </phase>

  <phase name="Complete">
    <goal>Finalize placement and document</goal>
    <steps>
      <step>Write down: "Place at: [FULL-PATH]"</step>
      <step>Create structure if needed (add .purpose.md for new directories)</step>
      <step>Document related items (tests, docs, examples)</step>
      <step>Update references (DISCOVERY-INDEX.md, READMEs, cross-references)</step>
      <step>Provide rationale explaining WHY this location</step>
    </steps>
  </phase>
</workflow>

<rules>
  <rule>Never guess type - use identification questions</rule>
  <rule>Always use Type Routing Table from SEMANTIC-INDEX.md</rule>
  <rule>Always validate against Core Principles</rule>
  <rule>Never skip conflict resolution</rule>
  <rule>Always document related items (tests, docs, examples)</rule>
  <rule>Never place randomly - use the framework</rule>
</rules>

<anti_patterns>
  <pattern>Don't guess type - use identification questions</pattern>
  <pattern>Don't skip validation - always check principles</pattern>
  <pattern>Don't ignore conflicts - resolve them explicitly</pattern>
  <pattern>Don't forget related items - tests, docs, examples</pattern>
  <pattern>Don't place randomly - use framework</pattern>
</anti_patterns>

<examples>
  <example>
    <scenario>New Specialist Agent for data analysis</scenario>
    <process>
      <step>Type: Agent</step>
      <step>Agent type: Specialist</step>
      <step>Location: 1-agents/4-specialists/</step>
      <step>Specific: 1-agents/4-specialists/data-analyst.md</step>
      <step>Examples: 1-agents/4-specialists/data-analyst-examples/</step>
    </process>
    <output>
      Place at: 1-agents/4-specialists/data-analyst.md
      Create examples at: 1-agents/4-specialists/data-analyst-examples/
    </output>
  </example>

  <example>
    <scenario>New Phase 2 Library for task prioritization</scenario>
    <process>
      <step>Type: Library</step>
      <step>Phase: Phase 2 (task-related)</step>
      <step>Location: 4-scripts/lib/</step>
      <step>Specific: 4-scripts/lib/task-prioritization/</step>
      <step>Tests: 8-testing/unit/libraries/test-task-prioritization.py</step>
    </process>
    <output>
      Place at: 4-scripts/lib/task-prioritization/
      Create tests at: 8-testing/unit/libraries/test-task-prioritization.py
      Update docs: .docs/phase2/
    </output>
  </example>

  <example>
    <scenario>Finding all BMAD agents</scenario>
    <process>
      <step>Type: Agent</step>
      <step>Agent type: BMAD</step>
      <step>Location: 1-agents/2-bmad/</step>
      <step>Search: find 1-agents/2-bmad/ -name "*.md"</step>
    </process>
    <output>
      Found at: 1-agents/2-bmad/
      Search: find 1-agents/2-bmad/ -name "*.md"
    </output>
  </example>
</examples>

<output_format>
For placement:
- Placement recommendation (where to put new thing)
- Rationale explanation (why this location)
- Related references (what else is related)

For discovery:
- Discovery result (where to find existing thing)
- Search process (how you found it)
- Related items (what else is related)
</output_format>

<integration_notes>
This skill integrates with:
- docs-routing - For routing documentation
- deep-research - For researching before placement
- first-principles-thinking - For analyzing placement decisions

Usage phrases:
- "Use intelligent-routing to determine where to place this new agent"
- "Use intelligent-routing to find all libraries related to Phase 2"
- "Apply intelligent-routing to determine where this documentation should go"
</integration_notes>

<related_skills>
  <skill>docs-routing</skill>
  <skill>deep-research</skill>
  <skill>first-principles-thinking</skill>
</related_skills>

<see_also>
  <resource>BRAIN-ARCHITECTURE.md - Overall brain architecture</resource>
  <resource>SEMANTIC-INDEX.md - Type system and categories</resource>
  <resource>PLACEMENT-RULES.md - Detailed placement rules</resource>
  <resource>DISCOVERY-INDEX.md - Quick reference for finding</resource>
</see_also>
