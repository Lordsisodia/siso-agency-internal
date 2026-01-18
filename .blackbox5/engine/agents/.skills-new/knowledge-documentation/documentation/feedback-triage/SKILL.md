---
name: feedback-triage
category: knowledge-documentation/documentation
version: 1.0.0
description: Turn messy qualitative feedback into a prioritized, actionable backlog
author: obra/superpowers
verified: true
tags: [feedback, triage, prioritization, backlog, ux, documentation]
---

# Skill: Feedback Triage

<context>
<purpose>
Turn messy qualitative feedback into a **prioritized, actionable backlog** with clear ownership and next steps.

This skill is designed for when you have:
- User feedback
- UI testing notes
- Bug reports
- "It feels confusing" comments

...and you want a stable output that teams/agents can execute against.
</purpose>

<trigger>
- New feedback lands (Notion/Slack/doc dump)
- Pre-release docs/UI review
- Weekly "hygiene" pass
</trigger>

<outputs>
<artifact type="plan-folder">
A **plan folder** in `agents/.plans/` for the triage run
</artifact>
<artifact type="triage-report">
A **triage report** (one markdown file) saved in the plan folder (suggested: `triage-report.md`)
</artifact>
<artifact type="knowledge-summary" optional="true">
A reusable evergreen summary in `.knowledge/deepresearch/` if it generalizes
</artifact>
</outputs>

<inputs_to_collect>
<input name="sources" required="true">
Source(s) of feedback (paths/links)
</input>
<input name="scope" required="true">
Product area scope (what's in / out)
</input>
<input name="persona" required="true">
Target user persona (internal ops vs merchants vs customers)
</input>
<input name="success_criteria" required="true">
Success criteria ("done" definition)
</input>
</inputs_to_collect>

<taxonomy>
For each item:
<field name="type">
bug / UX confusion / missing feature / performance / data integrity / docs gap
</field>
<field name="severity">
blocker / high / medium / low
</field>
<field name="confidence">
confirmed / likely / speculative
</field>
<field name="surface">
UI / backend / database / architecture / docs
</field>
<field name="fix_type">
quick fix / refactor / redesign / research needed
</field>
</taxonomy>
</context>

<instructions>
<workflow>
<phase name="Gather and Normalize">
<objective>
Merge duplicate feedback and convert vague statements into observable problems
</objective>

<steps>
<step name="Read all feedback sources">
<actions>
- Load all feedback documents/files
- Identify common themes
- Mark duplicate issues
</actions>
</step>

<step name="Normalize vague statements">
<examples>
<example>
<input>"User can't find X"</input>
<output>"Navigation lacks entrypoint to X"</output>
</example>
<example>
<input>"It feels confusing"</input>
<output>"Unclear visual hierarchy between primary and secondary actions"</output>
</example>
<example>
<input>"Doesn't work"</input>
<output>"Button click produces no visible response or error message"</output>
</example>
</examples>
</step>

<step name="Deduplicate">
<actions>
- Group identical issues from multiple sources
- Count frequency (how many times mentioned)
- Flag high-frequency items for prioritization
</actions>
</step>
</steps>
</phase>

<phase name="Cluster into Themes">
<objective>
Organize issues into logical groups for efficient addressing
</objective>

<common_themes>
- Navigation & discoverability
- Data model / simplicity
- Performance & reliability
- Feature completeness
- Docs clarity
- Onboarding / first-run experience
- Error handling / edge cases
</common_themes>

<steps>
<step name="Create clusters">
<actions>
- Group related issues together
- Name each cluster with a clear theme
- Ensure every issue belongs to at least one cluster
</actions>
</step>

<step name="Identify cross-cutting concerns">
<actions>
- Note issues that span multiple clusters
- Flag systemic problems (affecting multiple areas)
- Identify quick wins that address multiple issues
</actions>
</step>
</steps>
</phase>

<phase name="Prioritize">
<objective>
Rank issues by impact and effort
</objective>

<prioritization_factors>
<factor name="user_impact" weight="high">
How many users affected? How severe is the pain?
</factor>
<factor name="frequency" weight="medium">
How often does this issue occur?
</factor>
<factor name="effort" weight="medium">
How much work to fix? (quick wins first)
</factor>
<factor name="risk" weight="high">
What's the risk of not fixing? (security, data loss, etc.)
</factor>
</prioritization_factors>

<steps>
<step name="Score each issue">
<scoring_method>
For each issue, assign:
- **Impact:** 1-5 (5 = critical, 1 = nice-to-have)
- **Frequency:** 1-5 (5 = always, 1 = rare)
- **Effort:** 1-5 (1 = quick fix, 5 = major refactor)
- **Risk:** 1-5 (5 = dangerous if ignored, 1 = low risk)

**Priority Score = (Impact + Frequency + Risk) / Effort**
</scoring_method>
</step>

<step name="Sort by priority">
<actions>
- Group by score tiers:
  - **Tier 1:** Score > 10 (Address immediately)
  - **Tier 2:** Score 5-10 (Next sprint)
  - **Tier 3:** Score < 5 (Backlog)
- Within tiers, sort by risk score
</actions>
</step>

<step name="Identify quick wins">
<actions>
- Flag items with effort = 1 or 2
- These should be tackled first to build momentum
</actions>
</step>
</steps>
</phase>

<phase name="Emit Backlog">
<objective>
Create actionable backlog items from prioritized issues
</objective>

<backlog_item_structure>
For each backlog item include:
<field name="title" required="true">
Short, descriptive title (one line)
</field>
<field name="problem_statement" required="true">
Clear description of the problem (what, where, when)
</field>
<field name="evidence" required="true">
Source link/path, frequency count, user quotes
</field>
<field name="proposed_solution">
High-level approach to fixing the issue
</field>
<field name="acceptance_criteria" required="true">
Specific, testable conditions for "done"
</field>
<field name="owner_suggestion">
Which agent/team should handle this
</field>
<field name="priority_score">
Numeric score from prioritization phase
</field>
<field name="tier">
Tier 1 / 2 / 3
</field>
</backlog_item_structure>

<steps>
<step name="Write backlog items">
<template>
## [Title]

**Problem:** [Problem statement]

**Evidence:** [Source link/path]
- Mentioned [N] times
- User quote: "[...]"

**Proposed Solution:** [High-level approach]

**Acceptance Criteria:**
- [ ] [Specific, testable condition 1]
- [ ] [Specific, testable condition 2]
- [ ] [Specific, testable condition 3]

**Suggested Owner:** [Agent/team]
**Priority:** Tier [X] (Score: [Y])
**Type:** [bug/UX/feature/etc]
**Surface:** [UI/backend/database/etc]
**Estimated Effort:** [quick fix/refactor/etc]
</template>
</step>

<step name="Organize by theme">
<actions>
- Group backlog items under theme headings
- Sort themes by total priority score
- Flag themes with many Tier 1 items
</actions>
</step>
</steps>
</phase>

<phase name="Hand-off to Execution">
<objective>
Prepare backlog for execution by agents/teams
</objective>

<steps>
<step name="Create plan folders">
<actions>
If follow-up is multi-step:
- Create a new plan folder per cluster or per epic
- Link to those plans from the triage report
</actions>
<commands>
# Example structure
mkdir -p .blackbox/agents/.plans/triage-{timestamp}/clusters/{theme-name}
echo "See: .blackbox/agents/.plans/{execution-plan}/README.md" >> triage-report.md
</commands>
</step>

<step name="Generate triage report">
<output_file>triage-report.md</output_file>
<template>
# Feedback Triage Report

**Date:** [Date]
**Sources:** [List of sources]
**Scope:** [Product area]
**Persona:** [Target user]
**Total Issues:** [N]

## Summary

### Quick Wins (Do First)
- [ ] [Quick win 1] ([Tier X])
- [ ] [Quick win 2] ([Tier X])

### Top Priority Themes
1. **[Theme 1]** ([N] issues, [X] Tier 1)
2. **[Theme 2]** ([N] issues, [X] Tier 1)
3. **[Theme 3]** ([N] issues, [X] Tier 1)

## Themes & Backlog

### [Theme Name]

[Theme description - what area this covers]

**Issues:** [N] total ([X] Tier 1, [Y] Tier 2, [Z] Tier 3)
**Suggested Owner:** [Agent/team]

#### Backlog Items

[Insert backlog items here]

## Statistics

**By Type:**
- Bugs: [N]
- UX Issues: [N]
- Missing Features: [N]
- Performance: [N]
- Data Integrity: [N]
- Docs Gaps: [N]

**By Severity:**
- Blockers: [N]
- High: [N]
- Medium: [N]
- Low: [N]

**By Surface:**
- UI: [N]
- Backend: [N]
- Database: [N]
- Architecture: [N]
- Docs: [N]

## Execution Plans

- [Theme 1]: .blackbox/agents/.plans/[plan-name]/README.md
- [Theme 2]: .blackbox/agents/.plans/[plan-name]/README.md

## Next Steps

1. [ ] Review and prioritize quick wins
2. [ ] Assign owners to each theme
3. [ ] Create execution plans for Tier 1 items
4. [ ] Schedule review for Tier 2/3 items
</template>
</step>
</steps>
</phase>
</workflow>

<rules>
<triage_rules>
<rule priority="critical">
Never downgrade a "blocker" severity without explicit evidence it's not blocking
</rule>
<rule priority="high">
If an issue is mentioned 3+ times, automatically elevate to Tier 1 or 2
</rule>
<rule priority="medium">
When in doubt, over-prioritize UX issues - they compound quickly
</rule>
<rule priority="low">
Keep "research needed" items in a separate section from actionable backlog
</rule>
</triage_rules>

<normalization_rules>
<rule priority="critical">
Convert every vague complaint into an observable problem statement
</rule>
<rule priority="high">
Preserve user quotes in evidence - they carry context
</rule>
<rule priority="medium">
If you can't reproduce an issue, mark confidence as "speculative"
</rule>
</normalization_rules>
</rules>

<best_practices>
<practice priority="critical">
Always preserve the original feedback in evidence links
</practice>
<practice priority="high">
Group by theme, not by source - users don't think in "docs vs Slack"
</practice>
<practice priority="medium">
Quick wins build momentum - flag them prominently
</practice>
<practice priority="low">
If a theme has >10 issues, consider breaking it into sub-themes
</practice>
</best_practices>

<examples>
<example scenario="UI feedback triage">
<pre>
## Theme: Navigation & Discoverability

**Issues:** 8 total (3 Tier 1, 2 Tier 2, 3 Tier 3)
**Suggested Owner:** ui-ux-agent

### Backlog Items

## Add breadcrumbs to deep pages

**Problem:** Users land on deep pages from search/links and can't navigate back to parent sections

**Evidence:** docs/feedback/ui-review.md
- Mentioned 5 times
- User quote: "I got lost, couldn't find my way back"

**Proposed Solution:** Implement breadcrumb component showing page hierarchy

**Acceptance Criteria:**
- [ ] Breadcrumb appears on all pages depth > 2
- [ ] Each crumb is clickable and navigates to correct page
- [ ] Current page is shown as last crumb (not linked)
- [ ] Breadcrumb is visible on mobile (responsive)

**Suggested Owner:** ui-ux-agent
**Priority:** Tier 1 (Score: 12.5)
**Type:** UX confusion
**Surface:** UI
**Estimated Effort:** quick fix
</pre>
</example>

<example scenario="Bug report triage">
<pre>
## Theme: Data Integrity

**Issues:** 3 total (2 Tier 1, 1 Tier 2)
**Suggested Owner:** backend-team

### Backlog Items

## Fix duplicate record creation on concurrent submits

**Problem:** When users double-click submit button, duplicate records are created

**Evidence:** Slack #bugs, GitHub issue #234
- Mentioned 7 times
- User quote: "Created 2 identical orders, now what?"

**Proposed Solution:** Add idempotency key to submit handler

**Acceptance Criteria:**
- [ ] Submit handler generates unique idempotency key
- [ ] Backend validates idempotency key before creating record
- [ ] Duplicate submit returns existing record, not error
- [ ] Button disabled after first click

**Suggested Owner:** backend-team
**Priority:** Tier 1 (Score: 15.0)
**Type:** bug
**Surface:** backend + UI
**Estimated Effort:** refactor
</pre>
</example>
</examples>

<output_format>
<triage_report_structure>
1. Summary (quick wins, top themes)
2. Themes & Backlog (grouped by theme, prioritized)
3. Statistics (by type, severity, surface)
4. Execution Plans (links to follow-up plans)
5. Next Steps (actionable items)
</triage_report_structure>
</output_format>
</instructions>
