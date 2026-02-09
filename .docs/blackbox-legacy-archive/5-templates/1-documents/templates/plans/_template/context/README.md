# 🧠 Agent Context (Plan-local)

This folder is the agent’s **long-run memory** for this plan.

## ✅ Rules (simple)

1) Each step gets **one** markdown file under `steps/`.
2) Every time the agent completes a step, it writes:
   - what it did
   - what it learned
   - what’s next
3) Steps are automatically compacted:
   - every **10** step files → compact into **one** compaction file (≤ **2 MB**, configurable).
4) If the agent feels “context is too big”, it should run compaction early.
5) After every **10 compactions** (≈100 steps), do a review:
   - extract reusable patterns for better agent performance
   - delete low-value content and keep only durable takeaways

## 📌 Files

- `context.md` — rolling context summary (read this first before continuing)
- `steps/` — one file per step
- `compactions/` — compacted bundles of 10 steps
- `reviews/` — every 10 compactions, do a meta-review + cleanup

## 🛠️ Commands

From repo root:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "did X"
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

From inside `docs/`:

```bash
./.blackbox/scripts/new-step.sh --plan .blackbox/agents/.plans/<plan> "did X"
./.blackbox/scripts/compact-context.sh --plan .blackbox/agents/.plans/<plan>
```

## ⚙️ Config

Set a bigger/smaller compaction cap (bytes):

```bash
export BLACKBOX_CONTEXT_MAX_BYTES=2097152  # 2MB default
```
