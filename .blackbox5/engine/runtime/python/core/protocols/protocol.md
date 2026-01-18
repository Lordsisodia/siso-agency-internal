# Black Box Protocol

The **Black Box Protocol** is a standard for AI context + execution inside this repo.

In this project, **docs are the project brain**, so the canonical agent runtime lives at:

- ✅ `docs/.blackbox/`

The goal: make AI work **repeatable, auditable, and scoped** to the folder it’s operating in.

---

## ✅ Directory standard (minimum required)

The canonical `.blackbox/` should contain these **read-first** files:

```text
docs/
└── .blackbox/
    ├── context.md          # 🧠 Read-first: purpose, constraints, current state
    ├── tasks.md            # 📋 Active checklist + backlog
    ├── journal.md          # 📜 Append-only log of decisions/actions
    ├── scratchpad.md       # 📝 Volatile working notes (safe to overwrite)
    └── experiments/        # 🧪 Drafts, alternatives, dead-ends
```

These are intentionally “boring” and universal — they work for every domain.

---

## Extended structure (recommended)

If you want **runnable agents** and more structured execution, add:

```text
.blackbox/
├── manifest.yaml           # machine-readable index of the box (agents, paths)
├── agents/                 # 🤖 self-contained agent packages
├── agents/.skills/                # 🧩 reusable playbooks / frameworks
├── agents/.plans/                 # 🗂 timestamped plan folders (with templates)
├── deepresearch/           # 📚 evergreen notes / research outputs
├── snippets/               # ✂️ known-good copy/paste snippets
└── scripts/                # 🧰 helper scripts (new plan, new agent)
```

Why this matters:
- `tasks.md` is the **backlog and tracker**
- `agents/.plans/` is the **audit trail for a single execution**
- `agents/` is the **unit of reuse** (prompt + config + runbook)

---

## The Black Box Loop (operational rule)

When an agent enters a folder to do work:

1) **READ** `context.md`
2) **CHECK** `tasks.md`
3) **PLAN** (if multi-step) create a plan folder under `agents/.plans/`
4) **EXECUTE** work in the parent folder
5) **CAPTURE ARTIFACTS** inside the plan folder (recommended: `artifacts/`)
6) **ORGANIZE** outputs:
   - Reusable knowledge → `deepresearch/`
  - Docs deliverables → correct `docs/0X-*/` location + ledger entry (`docs/08-meta/repo/docs-ledger.md`)
7) **LOG**:
   - Update `tasks.md` (tick items)
   - Append summary to `journal.md`
   - Save dead-ends to `experiments/` (optional)

---

## 🧠 Plan-local context (for long runs)

For runs that last multiple hours, agents must maintain **plan-local memory** so they don’t lose context mid-run.

Convention:

- Each plan can maintain `context/`:
  - `context/context.md` — rolling summary (read first)
  - `context/steps/` — one markdown file per step
  - `context/compactions/` — auto-compacted bundles of 10 steps

Rules:

- ✅ Each step = one `.md` file
- ✅ Every **10** step files are compacted into **one** compaction file
- ✅ If context becomes unwieldy, compact early
- ✅ Each compaction file should be capped at ~**1 MB** by default (configurable via `BLACKBOX_CONTEXT_MAX_BYTES`)
- ✅ Every **10 compactions** (≈100 steps), create a review doc to extract patterns and delete low-value content

Scripts:

```bash
./docs/.blackbox/scripts/new-step.sh --plan docs/.blackbox/agents/.plans/<plan> "Checkpoint: did X"
./docs/.blackbox/scripts/compact-context.sh --plan docs/.blackbox/agents/.plans/<plan>
```

---

## 📏 Docs structure rule (important)

Within `docs/`, we keep the docs tree readable:

- ✅ `docs/` should have **6–10** visible root folders
- ✅ each root folder should have **1–10** direct child folders
- ✅ `.blackbox/` exists only at **`docs/.blackbox/`**
- ❌ do not create nested `.blackbox/` folders inside the visible docs categories

---

## Template strategy

The `docs/.blackbox/_template/` directory is the canonical copy-ready template for creating new `.blackbox` folders:

```bash
cp -R docs/.blackbox/_template <target-folder>/.blackbox
```

Then edit the new `.blackbox/context.md`, `.blackbox/manifest.yaml`, and `.blackbox/tasks.md`.

Notes:

- ✅ This is intended for **non-docs areas** of the repo (e.g. dedicated automation folders).
- ❌ Inside `docs/`, do not create additional `.blackbox/` folders.

---

## Migration strategy (legacy → protocol)

If you have older folders like:
- `docs/feedback/black-box/`

Preferred migration:
- Move reusable snippets into `.blackbox/snippets/`
- Move active work into `.blackbox/agents/.plans/` (or `tasks.md` if it’s ongoing)
