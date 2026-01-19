---
name: systematic-debugging
category: development-workflow/testing-quality
version: 1.0.0
description: Four-phase root cause analysis process to find bugs 10x faster
author: obra/superpowers
verified: true
tags: [debugging, troubleshooting, problem-solving]
---

# Systematic Debugging

<context>
Find root causes quickly using a proven four-phase process: reproduce, isolate, identify, and verify. This systematic approach eliminates guesswork and ensures you address the actual problem, not just symptoms.
</context>

<instructions>
When debugging issues, follow the four-phase process rigorously. Each phase builds on the previous one, ensuring you understand the problem before attempting to fix it.

The key to systematic debugging is patience and thoroughness at each phase. Don't skip steps or jump to conclusions. Document everything you learn, even what doesn't work.
</instructions>

<workflow>
  <phase name="Reproduce">
    <goal>Create a reliable, minimal reproduction case</goal>
    <steps>
      <step>Document exact steps to trigger the bug</step>
      <step>Capture environment (OS, version, config)</step>
      <step>Simplify the scenario - remove unnecessary variables</step>
      <step>Make it consistent - bug should happen every time</step>
      <step>Save test data for later verification</step>
    </steps>
  </phase>

  <phase name="Isolate">
    <goal>Narrow down where the bug occurs</goal>
    <steps>
      <step>Binary search through code layers (frontend/backend/db)</step>
      <step>Eliminate components - what's NOT involved?</step>
      <step>Add logging strategically to trace execution</step>
      <step>Test hypotheses one at a time</step>
      <step>Document what you ruled out</step>
    </steps>
  </phase>

  <phase name="Identify">
    <goal>Find the exact root cause</goal>
    <steps>
      <step>Examine the isolated code carefully</step>
      <step>Check assumptions - what did you think was true?</step>
      <step>Look for edge cases and boundary conditions</step>
      <step>Review recent changes that might be related</step>
      <step>Verify data flow through the system</step>
    </steps>
  </phase>

  <phase name="Verify">
    <goal>Confirm the fix actually resolves the issue</goal>
    <steps>
      <step>Apply the minimal fix that addresses root cause</step>
      <step>Test with original reproduction case</step>
      <step>Add regression test to prevent recurrence</step>
      <step>Check for similar issues elsewhere in codebase</step>
      <step>Document the fix for future reference</step>
    </steps>
  </phase>
</workflow>

<rules>
  <rule>Never skip straight to fixes without understanding the problem</rule>
  <rule>Make one change at a time, not multiple changes simultaneously</rule>
  <rule>Always document what you tried, even failed attempts</rule>
  <rule>Focus on root causes, not symptoms</rule>
  <rule>Always verify fixes work long-term, not just immediately</rule>
</rules>

<anti_patterns>
  <pattern>Skip directly to code changes without understanding</pattern>
  <pattern>Make multiple changes at once (can't identify which fixed it)</pattern>
  <pattern>Don't document the debugging process</pattern>
  <pattern>Fix symptoms while leaving root cause intact</pattern>
  <pattern>Assume fix works without verification</pattern>
</anti_patterns>

<examples>
  <example>
    <scenario>Production incident: Users report intermittent 500 errors</scenario>
    <process>
      <step>Phase 1 - Reproduce: Set up monitoring to capture exact error conditions</step>
      <step>Phase 2 - Isolate: Add logging to narrow down which service is failing</step>
      <step>Phase 3 - Identify: Found race condition in database query</step>
      <step>Phase 4 - Verify: Applied fix, monitored for 24 hours, confirmed no recurrence</step>
    </process>
  </example>
</examples>

<integration_notes>
When debugging with Claude Code, use phrases like:
- "Help me debug [issue] systematically"
- "I'm seeing [error], let's work through it methodically"
- "Let's isolate where this bug is occurring"

Claude will guide you through all four phases, prevent jumping to conclusions, help document findings, suggest targeted tests, and ensure proper verification.
</integration_notes>

<related_skills>
  <skill>test-driven-development</skill>
  <skill>first-principles-thinking</skill>
  <skill>deep-research</skill>
</related_skills>
