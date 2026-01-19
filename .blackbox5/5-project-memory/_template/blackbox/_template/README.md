# Black Box (`docs/.blackbox/`)

This folder is a **high-signal vault + agent runtime** for repeatable playbooks, templates, and “known good” snippets — scoped to the `docs/` domain.

## 🧭 What agents should do first (step-by-step)

1) Read `protocol.md` (how this `.blackbox` works).
2) Read `context.md` (current situation + constraints).
3) Check `tasks.md` (what’s on the backlog).
4) If the task is multi-step, create a plan:
   - `./.blackbox/scripts/new-plan.sh "<slug>"`
5) Do the work in the appropriate `docs/` category folder.
6) Capture artifacts in the plan folder (`artifacts/`) and link them from your write-up.
7) If you created/moved/promoted docs, append a line to `docs/08-meta/repo/docs-ledger.md`.

## ✅ Read-first files (Protocol core)
- `context.md` — what this folder is, constraints, current state
- `tasks.md` — active checklist + backlog
- `journal.md` — append-only log (why we did things)
- `scratchpad.md` — volatile working notes
- `experiments/` — drafts / dead-ends

## 🤖 Agent runtime
- `agents/` — self-contained agent packages (prompt + config + runbook)
- `manifest.yaml` — machine-readable index of the box

### Core prompt
- Shared operating rules: `agents/_core/prompt.md`

## 📚 Reusable assets
- `agents/.skills/` — repeatable playbooks (how to work)
- `agents/.plans/` — timestamped plan folders (what we did, step-by-step)
- `.prompts/` — prompt packs (inputs to runs)
- `deepresearch/` — evergreen research outputs
- `snippets/` — copy/paste snippets (known good)

### Deep Research prompt library

Deep Research prompt library lives here:
- `agents/deep-research/prompts/`

## 🧰 Helpers

```bash
# Create a new timestamped plan folder (copies from `agents/.plans/_template/`)
./.blackbox/scripts/new-plan.sh "deep-research-checkout-flows"

# Create a repeatable run (plan + artifacts + metadata)
./.blackbox/scripts/new-run.sh deep-research "competitor matrix" \
  --prompt .blackbox/agents/deep-research/prompts/library/01-competitor-matrix.md

# Create a new agent package (copies from `agents/_template/`)
./.blackbox/scripts/new-agent.sh "SEO Hygiene"

# Run an OSS discovery cycle (GitHub search → metadata → entry stubs)
./.blackbox/scripts/start-oss-discovery-cycle.sh
```

## 🧩 Creating a `.blackbox` in another folder (template)

Use the copy-ready template here:

```bash
cp -R docs/.blackbox/_template <target-folder>/.blackbox
```

Important:

- ✅ This is intended for **non-docs areas** of the repo when you truly need a local agent runtime.
- ❌ Inside `docs/`, do not create additional `.blackbox/` folders (we keep docs readable; see `docs/README.md`).

Then edit:
- `<target-folder>/.blackbox/context.md`
- `<target-folder>/.blackbox/manifest.yaml`
- `<target-folder>/.blackbox/tasks.md`

## Snippets
- Shopify redirect (homepage → headless): `snippets/shopify/redirect-homepage.md`
