---
name: long-run-ops
category: development-workflow/deployment-ops
version: 1.0.0
description: Enable long-running agent operations without looping or drift
author: obra/superpowers
verified: true
tags: [long-running, checkpoints, value-function, anti-looping, agent-ops]
---

# Skill: Long-Run Operations (Anti-Looping + Adaptation)

<context>
<purpose>
Enable an agent to run for many hours without drifting into loops or low-value work by enforcing:
- Checkpoints
- A value function
- Exploration → exploitation scheduling
- Explicit stopping criteria
</purpose>

<trigger>
- Any run expected to exceed ~60–90 minutes
- Deep research and multi-source synthesis
</trigger>

<outputs>
Inside the plan folder:
- `work-queue.md`
- `success-metrics.md`
- `progress-log.md`
- `blockers.md` (only if stuck)
</outputs>
</context>

<instructions>
<memory_compaction>
<cadence>
Goal: Keep context durable and small enough that an agent can run for 10–20 hours without "forgetting".

<rules>
<rule priority="critical">
One step = one file:
- `<plan>/context/steps/####_*.md`
- Each step file should represent **exactly one unit of work** (not a whole day)
</rule>

<rule priority="critical">
Every 10 step files:
- Compact into a single compaction file under: `<plan>/context/compactions/`
- Target size: **≤ ~1MB per compaction** (short, information-dense)
</rule>

<rule priority="critical">
Every 10 compactions (≈100 steps, ≈10MB of compactions):
- Write a review file under: `<plan>/context/reviews/`
- The review must:
  - Identify useful repeated patterns (what the agent should do more of)
  - Identify useless noise (what to stop doing)
  - Recommend pruning (delete or archive low-value step files if safe)
</rule>
</rules>

<commands>
# From docs/ directory
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<run> "Checkpoint: <what changed>"
./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/<run>
</commands>
</cadence>
</memory_compaction>

<checkpoint_cadence>
<frequency>
Every 30–60 minutes:
</frequency>
<actions>
- Update the queue
- Record what changed
- Make one prioritization decision
</actions>
</checkpoint_cadence>

<value_function>
<before_work>
Before a step, write:
</before_work>
<questions>
- "After this step, we will have <artifact/change>"
- "This improves the result because <reason>"
- "If this fails, fallback is <plan B>"
</questions>
</value_function>

<stop_conditions>
<hard_stops>
Stop and write `blockers.md` if:
- You cannot name a new artifact you can produce
- You keep scanning sources without updating your hypotheses
- You are rephrasing the same conclusions
</hard_stops>
</stop_conditions>

<workflow>
<phase name="Initialization">
<step>Create plan folder structure</step>
<commands>
mkdir -p .blackbox/agents/.plans/<run>/context/{steps,compactions,reviews}
</commands>
</phase>

<phase name="Execution Loop">
<step>Execute work with checkpoints</step>
<actions>
1. Write value function before starting
2. Execute one unit of work
3. Create step file
4. Every 10 steps: compact
5. Every 100 steps: review
6. Every 30-60 min: checkpoint
</actions>
</phase>

<phase name="Value Check">
<step>Verify value before proceeding</step>
<checklist>
- [ ] Can I name a specific artifact this produces?
- [ ] Does this improve the result?
- [ ] Do I have a fallback plan?
</checklist>
<failure_action>
If any answer is "no" → Write blockers.md and stop
</failure_action>
</phase>

<phase name="Stop Condition Check">
<step>Evaluate stop conditions</step>
<checklist>
- [ ] Can I produce a new artifact?
- [ ] Am I updating hypotheses?
- [ ] Am I generating new insights (not rephrasing)?
</checklist>
<failure_action>
If any answer is "no" → Write blockers.md and stop
</failure_action>
</phase>
</workflow>

<rules>
<anti_looping>
<rule priority="critical">
Never perform the same action more than 3 times without producing a new artifact
</rule>
<rule priority="critical">
Never scan the same source more than twice without extracting new value
</rule>
<rule priority="high">
If you find yourself rephrasing conclusions → Stop and write blockers.md
</rule>
</anti_looping>

<value_generation>
<rule priority="critical">
Every step must produce a tangible artifact or insight
</rule>
<rule priority="high">
Prefer depth over breadth - one deep analysis > ten shallow scans
</rule>
<rule priority="medium">
Document why each step matters in the step file
</rule>
</value_generation>

<context_management>
<rule priority="critical">
Compaction is mandatory, not optional
</rule>
<rule priority="high">
Delete or archive low-value step files during review
</rule>
<rule priority="medium">
Keep compactions ≤ 1MB each
</rule>
</context_management>
</rules>

<best_practices>
<practice priority="critical">
Write the value function BEFORE starting work, not after
</practice>
<practice priority="high">
Treat blockers.md as a success - it means you avoided infinite loops
</practice>
<practice priority="medium">
Use specific artifact names ("analyze-X.py") not generic ones ("script.py")
</practice>
<practice priority="low">
Document patterns that work well in reviews for reuse
</practice>
</best_practices>

<error_handling>
<error condition="Looping behavior">
<solution>
Stop immediately. Write blockers.md documenting:
- What action you're repeating
- Why it's looping
- What new artifact would break the loop
</solution>
</error>

<error condition="Can't name next artifact">
<solution>
Write blockers.md with:
- Current state
- Why no clear next step
- Suggested human intervention
</solution>
</error>

<error condition="Context getting too large">
<solution>
Run compaction immediately, even if not at 10 steps
- Review recent steps
- Condense into key insights
- Delete verbose step files
</solution>
</error>
</error_handling>

<examples>
<example scenario="Deep OSS research">
<pre>
# Initial setup
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/oss-research-001 "Start: Analyze React frameworks"

# Value function BEFORE starting
echo "After this step, we will have:
- A comparison matrix of 5 React frameworks
- Performance benchmarks for each
- Use case recommendations

This improves the result because: Concrete data beats opinions
Fallback if fails: Use existing documentation summaries"

# Execute work (analyze frameworks)
# ...

# Create step file
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/oss-research-001 "Complete: React framework comparison"

# After 10 steps, compact
./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/oss-research-001
</pre>
</example>

<example scenario="Blocker detection">
<pre>
# After 5 hours of research
# Agent realizes: "I'm just rephrasing the same conclusions"

# STOP immediately
cat > .blackbox/agents/.plans/oss-research-001/blockers.md <<'EOF'
# Blocker: No New Insights

## Current State
- Have analyzed 20 repositories
- Keep finding same patterns
- Converged on same conclusions 3 times

## Why I Can't Continue
- Cannot name a new artifact that would add value
- Scanning more repos yields diminishing returns
- Reaching synthesis point, not discovery point

## Next Steps (Human Decision Needed)
- [ ] Proceed to synthesis/report generation
- [ ] Pivot to different research angle
- [ ] Expand scope to different ecosystem
EOF
</pre>
</example>
</examples>
</instructions>
