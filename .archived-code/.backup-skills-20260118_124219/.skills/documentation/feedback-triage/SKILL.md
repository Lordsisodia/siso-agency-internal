# Skill: Feedback Triage

## Purpose
Turn messy qualitative feedback into a **prioritized, actionable backlog** with clear ownership and next steps.

This skill is designed for when you have:
- user feedback
- UI testing notes
- bug reports
- “it feels confusing” comments

…and you want a stable output that teams/agents can execute against.

## Trigger (when to use)
- New feedback lands (Notion/Slack/doc dump)
- Pre-release docs/UI review
- Weekly “hygiene” pass

## Outputs (artifacts)
1. A **plan folder** in `agents/.plans/` for the triage run
2. A **triage report** (one markdown file) saved in the plan folder (suggested: `triage-report.md`)
3. Optional: a reusable evergreen summary in `.knowledge/deepresearch/` if it generalizes

## Inputs to collect (minimum viable)
- Source(s) of feedback (paths/links)
- Product area scope (what’s in / out)
- Target user persona (internal ops vs merchants vs customers)
- Success criteria (“done” definition)

## Taxonomy (how to classify issues)
For each item:
- **Type**: bug / UX confusion / missing feature / performance / data integrity / docs gap
- **Severity**: blocker / high / medium / low
- **Confidence**: confirmed / likely / speculative
- **Surface**: UI / backend / database / architecture / docs
- **Suggested fix type**: quick fix / refactor / redesign / research needed

## Step-by-step framework

### 1) Gather and normalize
- Merge duplicate feedback
- Convert vague statements into observable problems (“User can’t find X” → “Navigation lacks entrypoint to X”)

### 2) Cluster into themes
Create clusters like:
- Navigation & discoverability
- Data model / simplicity
- Performance & reliability
- Feature completeness
- Docs clarity

### 3) Prioritize
Prioritize by:
- user impact
- frequency
- effort
- risk

### 4) Emit a backlog
For each backlog item include:
- title
- problem statement
- evidence (source link/path)
- proposed solution
- acceptance criteria
- owner suggestion (agent/team)

### 5) Hand-off to execution
If follow-up is multi-step:
- create a new plan folder per cluster or per epic
- link to those plans from the triage report

