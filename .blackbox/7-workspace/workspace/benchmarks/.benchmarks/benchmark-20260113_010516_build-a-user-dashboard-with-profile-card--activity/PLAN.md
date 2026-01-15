# Benchmark Plan: Build a user dashboard with profile card, activity feed, stats cards, settings form, responsive design using React and Tailwind CSS

**Complexity:** moderate
**Created:** 2026-01-13
**ID:** benchmark-20260113_010516_build-a-user-dashboard-with-profile-card--activity

---

## Objective

Compare AI effectiveness when completing this task:
> "Build a user dashboard with profile card, activity feed, stats cards, settings form, responsive design using React and Tailwind CSS"

**With:** Blackbox3 (Action Plan Agent, structured workflow)
**Without:** Raw AI chat (no framework, just prompt)

---

## Protocol

### Step 1: Run WITHOUT Blackbox3 (Today)

1. Open a fresh AI chat (no Blackbox3 context)
2. Paste exactly: `Build a user dashboard with profile card, activity feed, stats cards, settings form, responsive design using React and Tailwind CSS`
3. Start timer
4. Work until complete or you give up
5. Record metrics in `metrics.yaml` under `run_b_without_blackbox3`
6. Save output files to `.benchmarks/benchmark-20260113_010516_build-a-user-dashboard-with-profile-card--activity/raw-output/`

**Tips:**
- Don't mention Blackbox3 or any framework
- Use the same AI model you'll use with Blackbox3
- Time yourself accurately
- Count every conversation turn
- Note every time you had to redirect/clarify

### Step 2: Wait (Next Day)

Prevent learning effect. Don't do both runs on the same day.

### Step 3: Run WITH Blackbox3 (Next Day)

```bash
cd /Users/shaansisodia/DEV/AI-HUB/Black\ Box\ Factory/current/Blackbox3
./scripts/action-plan.sh "Build a user dashboard with profile card, activity feed, stats cards, settings form, responsive design using React and Tailwind CSS"
```

1. Follow the Action Plan workflow
2. Start timer when you begin with AI
3. Work until complete or you give up
4. Record metrics in `metrics.yaml` under `run_a_with_blackbox3`
5. Save output files (already in plan folder)

### Step 4: Compare & Analyze

1. Fill out the `analysis` section in `metrics.yaml`
2. Calculate improvements
3. Write conclusions

---

## Metrics to Track

### Time
- Start timestamp
- End timestamp
- Total duration (seconds and human-readable)

### Resources
- **Tokens used:** Check chat usage statistics
- **Iterations:** Count each AI response + user reply
- **Context switches:** Count times you had to redirect the AI

### Outcomes
- **Completed:** Did you finish the task fully?
- **Errors found:** Review output for bugs
- **Files created:** Count output files
- **Lines of code:** Approximate

### Quality (1-10 scale)
- **Code quality:** Clean, readable, follows best practices
- **Mental load:** How much cognitive effort (lower = easier)
- **Maintainability:** Easy to modify later
- **Reusability:** Can you reuse patterns for similar tasks
- **Satisfaction:** Overall happiness with process

---

## Expected Outcome

For a **moderate** task, we expect:

| Metric | Expected With Blackbox3 |
|--------|------------------------|
| Time | 20-40% faster |
| Tokens | 15-30% fewer |
| Iterations | 30-50% fewer |
| Errors | 25-40% fewer |
| Mental Load | 40-60% lower |

---

## Files Generated

- `metrics.yaml` - Data collection template
- `PLAN.md` - This file
- `raw-output/` - Save raw AI chat output here
- `bb3-output/` - Link to Blackbox3 plan folder

---

**Good luck! Remember: Use the same AI model for both runs.**
